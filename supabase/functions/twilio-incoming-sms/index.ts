import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse incoming Twilio webhook data
    const formData = await req.formData();
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0');

    console.log('Incoming SMS:', { messageSid, from, to, body, numMedia });

    if (!messageSid || !from || !to) {
      throw new Error('Missing required Twilio webhook data');
    }

    // Find the user by their Twilio phone number
    const { data: phoneNumberData, error: phoneError } = await supabase
      .from('twilio_phone_numbers')
      .select('user_id')
      .eq('phone_number', to)
      .maybeSingle();

    if (phoneError || !phoneNumberData) {
      console.error('Phone number not found:', to);
      throw new Error('Recipient phone number not configured');
    }

    const userId = phoneNumberData.user_id;

    // Find or create contact by phone number
    let contactId: string;
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('phone', from)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingContact) {
      contactId = existingContact.id;
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          full_name: from,
          phone: from,
          type: 'customer',
          user_id: userId,
        })
        .select('id')
        .single();

      if (contactError || !newContact) {
        throw new Error('Failed to create contact');
      }

      contactId = newContact.id;
    }

    // Find or create conversation
    let conversationId: string;
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_id', contactId)
      .eq('channel', 'sms')
      .eq('status', 'open')
      .maybeSingle();

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          contact_id: contactId,
          channel: 'sms',
          status: 'open',
          user_id: userId,
        })
        .select('id')
        .single();

      if (convError || !newConversation) {
        throw new Error('Failed to create conversation');
      }

      conversationId = newConversation.id;
    }

    // Collect media URLs if present
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string;
      if (mediaUrl) {
        mediaUrls.push(mediaUrl);
      }
    }

    // Save incoming message
    const { data: messageData, error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        message_type: numMedia > 0 ? 'mms' : 'sms',
        direction: 'inbound',
        sender_id: null,
        content: body || '',
        is_internal: false,
        sms_metadata: {
          from_number: from,
          to_number: to,
          character_count: body?.length || 0,
          segment_count: Math.ceil((body?.length || 0) / 160),
          media_count: numMedia,
        },
        delivery_status: 'delivered',
        external_id: messageSid,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Failed to save message:', messageError);
      throw messageError;
    }

    // Save media attachments if present
    if (mediaUrls.length > 0 && messageData) {
      const attachments = mediaUrls.map((url, index) => ({
        message_id: messageData.id,
        file_name: `media_${index}.jpg`,
        file_type: formData.get(`MediaContentType${index}`) as string || 'image/jpeg',
        file_size: 0,
        storage_path: url,
        url: url,
      }));

      const { error: attachError } = await supabase
        .from('message_attachments')
        .insert(attachments);

      if (attachError) {
        console.error('Failed to save attachments:', attachError);
      }
    }

    // Return TwiML response
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('Error in twilio-incoming-sms:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
});
