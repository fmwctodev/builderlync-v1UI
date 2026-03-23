import { llmService, type LLMMessage } from './llmService';
import { configService } from './configService';
import { behaviorService } from './behaviorService';
import { knowledgeBaseService } from './knowledgeBaseService';
import { supabase, getUserId } from '../lib/supabase';
import type { ConversationResponse, SemanticSearchResult } from '../lib/database.types';

export interface ConversationRequest {
  message: string;
  conversationId?: string;
  contactId?: string;
  channel: 'sms' | 'voice' | 'webchat';
  metadata?: Record<string, any>;
}

export class ConversationEngine {
  async handleMessage(request: ConversationRequest): Promise<ConversationResponse> {
    try {
      const userId = await getUserId();

      const config = await configService.getOrCreateConfig();
      if (config.status === 'paused') {
        return {
          reply_text: 'Thank you for your message. Our team will get back to you shortly.',
          actions: [],
          confidence: 1.0
        };
      }

      const behaviorProfile = await behaviorService.getOrCreateProfile();

      const conversationHistory = request.conversationId
        ? await this.getConversationHistory(request.conversationId)
        : [];

      const relevantKnowledge = await this.searchKnowledgeBase(request.message, userId);

      const messages = this.constructPrompt(
        request.message,
        behaviorProfile,
        relevantKnowledge,
        conversationHistory
      );

      const functions = llmService.getFunctionsSchema();
      const response = await llmService.chat(messages, functions);

      if (request.conversationId) {
        await this.saveMessage(request.conversationId, 'inbound', request.message);
        await this.saveMessage(request.conversationId, 'outbound', response.reply_text);
      }

      return response;

    } catch (error) {
      console.error('Conversation engine error:', error);
      return {
        reply_text: 'I apologize, but I\'m having trouble processing your message. Please try again.',
        actions: [],
        confidence: 0
      };
    }
  }

  private constructPrompt(
    userMessage: string,
    behaviorProfile: any,
    knowledgeContext: SemanticSearchResult[],
    history: Array<{ role: string; content: string }>
  ): LLMMessage[] {
    const systemPrompt = this.buildSystemPrompt(behaviorProfile, knowledgeContext);

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    history.forEach(msg => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    });

    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  private buildSystemPrompt(behaviorProfile: any, knowledgeContext: SemanticSearchResult[]): string {
    let prompt = `You are Sierra, an AI assistant for a contracting business.

PERSONALITY & BEHAVIOR:
${behaviorProfile.persona_description}

Tone: ${behaviorProfile.tone_tags.join(', ')}
Formality: ${behaviorProfile.formality_level}

OPERATING RULES:
`;

    const toggles = behaviorProfile.operating_toggles;
    if (toggles.introduce_with_business_name) {
      prompt += '- Always introduce yourself with the business name\n';
    }
    if (toggles.capture_contact_info) {
      prompt += '- Capture customer name, phone, and service needs\n';
    }
    if (toggles.offer_appointments) {
      prompt += '- Offer to schedule appointments when appropriate\n';
    }
    if (toggles.handle_pricing_questions) {
      prompt += '- Answer pricing questions using the knowledge base\n';
    }

    if (behaviorProfile.custom_instructions) {
      prompt += `\nADDITIONAL INSTRUCTIONS:\n${behaviorProfile.custom_instructions}\n`;
    }

    if (behaviorProfile.forbidden_topics.length > 0) {
      prompt += `\nFORBIDDEN TOPICS: ${behaviorProfile.forbidden_topics.join(', ')}\n`;
      prompt += 'Politely redirect if these topics come up.\n';
    }

    if (knowledgeContext.length > 0) {
      prompt += '\nRELEVANT KNOWLEDGE:\n';
      knowledgeContext.forEach((item, idx) => {
        prompt += `\n${idx + 1}. ${item.content}\n`;
      });
      prompt += '\nUse this knowledge to answer questions accurately.\n';
    }

    prompt += `
RESPONSE GUIDELINES:
- Be helpful and professional
- Keep responses concise (2-3 sentences max)
- Use natural, conversational language
- Ask clarifying questions when needed
- Use functions to take actions (create contact, book appointment, etc.)
`;

    return prompt;
  }

  private async searchKnowledgeBase(query: string, userId: string): Promise<SemanticSearchResult[]> {
    try {
      const embedding = await llmService.generateEmbedding(query);

      const { data, error } = await supabase.rpc('sierra_search_knowledge_base', {
        query_embedding: embedding,
        search_user_id: userId,
        match_threshold: 0.7,
        match_count: 5
      });

      if (error) {
        console.error('Knowledge base search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  private async getConversationHistory(conversationId: string): Promise<Array<{ role: string; content: string }>> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('direction, content, is_internal')
        .eq('conversation_id', conversationId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      return (data || []).map(msg => ({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      }));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  private async saveMessage(conversationId: string, direction: 'inbound' | 'outbound', content: string): Promise<void> {
    try {
      const userId = await getUserId();

      await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          message_type: 'sms',
          direction,
          sender_id: direction === 'outbound' ? userId : null,
          content,
          is_internal: false,
          delivery_status: 'sent'
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async createConversation(contactId: string, channel: 'sms' | 'voice' | 'webchat'): Promise<string> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        contact_id: contactId,
        channel,
        status: 'open',
        user_id: userId
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}

export const conversationEngine = new ConversationEngine();
