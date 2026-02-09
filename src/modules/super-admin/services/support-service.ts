import { supabase, handleSupabaseError } from './supabase-client';
import { SupportTicket, NpsFeedback } from '../types';

export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        enterprise_accounts(name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return (data || []).map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      accountId: ticket.account_id,
      accountName: ticket.enterprise_accounts?.name,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      assignedTo: ticket.assigned_to,
      slaBreached: ticket.sla_breached,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getNpsFeedback = async (): Promise<NpsFeedback[]> => {
  try {
    const { data, error } = await supabase
      .from('nps_feedback')
      .select(`
        *,
        enterprise_accounts(name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return (data || []).map(feedback => ({
      id: feedback.id,
      accountId: feedback.account_id,
      accountName: feedback.enterprise_accounts?.name,
      score: feedback.score,
      comment: feedback.comment,
      sentiment: feedback.sentiment,
      followedUp: feedback.followed_up,
      createdAt: feedback.created_at,
    }));
  } catch (error) {
    console.error('Error fetching NPS feedback:', error);
    throw new Error(handleSupabaseError(error));
  }
};
