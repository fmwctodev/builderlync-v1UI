import { supabase, getUserId } from '../lib/supabase';
import { conversationEngine } from './conversationEngine';
import type { DatabaseWebchatSession } from '../lib/database.types';

export class WebchatService {
  async createSession(metadata?: { ip?: string; userAgent?: string }): Promise<DatabaseWebchatSession> {
    const userId = await getUserId();
    const sessionToken = this.generateSessionToken();

    const { data, error } = await supabase
      .from('sierra_webchat_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        ip_address: metadata?.ip,
        user_agent: metadata?.userAgent,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSession(sessionToken: string): Promise<DatabaseWebchatSession | null> {
    const { data, error } = await supabase
      .from('sierra_webchat_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('status', 'open')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async closeSession(sessionToken: string): Promise<void> {
    await supabase
      .from('sierra_webchat_sessions')
      .update({ status: 'closed' })
      .eq('session_token', sessionToken);
  }

  async sendMessage(sessionToken: string, message: string): Promise<{ reply: string; conversationId: string }> {
    const session = await this.getSession(sessionToken);
    if (!session) {
      throw new Error('Invalid or expired session');
    }

    let conversationId = session.conversation_id;

    if (!conversationId) {
      const contactId = session.contact_id || await this.createAnonymousContact(session.user_id);

      conversationId = await conversationEngine.createConversation(contactId, 'webchat');

      await supabase
        .from('sierra_webchat_sessions')
        .update({
          contact_id: contactId,
          conversation_id: conversationId
        })
        .eq('id', session.id);
    }

    const response = await conversationEngine.handleMessage({
      message,
      conversationId,
      contactId: session.contact_id,
      channel: 'webchat',
      metadata: {
        session_token: sessionToken
      }
    });

    return {
      reply: response.reply_text,
      conversationId
    };
  }

  async getConversationMessages(conversationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  private async createAnonymousContact(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        first_name: 'Webchat',
        last_name: 'Visitor',
        source: 'webchat'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  async subscribeToConversation(conversationId: string, callback: (message: any) => void): any {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();
  }
}

export const webchatService = new WebchatService();
