import { supabase } from '../../../shared/lib/supabase';

export async function publishReply(params: {
  orgId: string;
  reviewId: string;
  lateReviewId: string;
  accountId: string;
  message: string;
  userId: string;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke('reputation-reply', {
    body: { ...params, action: 'publish' },
  });

  if (error) throw new Error(`Failed to publish reply: ${error.message}`);

  if (data?.code === 'LATE_AUTH_ERROR') throw new Error('LATE_AUTH_ERROR');
  if (!data?.success) throw new Error(data?.error ?? 'Failed to publish reply');
}

export async function deleteReply(params: {
  orgId: string;
  reviewId: string;
  lateReviewId: string;
  accountId: string;
  userId: string;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke('reputation-reply', {
    body: { ...params, action: 'delete' },
  });

  if (error) throw new Error(`Failed to delete reply: ${error.message}`);

  if (data?.code === 'PLATFORM_NOT_SUPPORTED') {
    throw new Error('Deleting replies is only supported for Google Business.');
  }
  if (data?.code === 'LATE_AUTH_ERROR') throw new Error('LATE_AUTH_ERROR');
  if (!data?.success) throw new Error(data?.error ?? 'Failed to delete reply');
}
