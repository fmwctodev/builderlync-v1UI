import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SendSMSRequest {
  conversation_id: string;
  to_number: string;
  from_number?: string;
  message: string;
  media_urls?: string[];
}

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body: SendSMSRequest = await req.json();
    const { conversation_id, to_number, from_number, message, media_urls } = body;

    if (!conversation_id || !to_number || !message) {
      throw new Error('Missing required fields: conversation_id, to_number, message');
    }

    // Get Twilio credentials from twilio_settings
    const { data: twilioSettings, error: settingsError } = await supabase
      .from('twilio_settings')
      .select('account_sid, api_key, api_secret')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError || !twilioSettings) {
      throw new Error('Twilio not configured. Please add your Twilio credentials in settings.');
    }

    const { account_sid, api_key, api_secret } = twilioSettings;

    if (!account_sid || !api_key || !api_secret) {
      throw new Error('Incomplete Twilio configuration');
    }

    // Get default from number if not provided
    let selectedFromNumber = from_number;
    if (!selectedFromNumber) {
      const { data: defaultNumber } = await supabase
        .from('twilio_phone_numbers')
        .select('phone_number')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      selectedFromNumber = defaultNumber?.phone_number;
    }

    if (!selectedFromNumber) {
      throw new Error('No Twilio phone number available');
    }

    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;
    const twilioAuth = btoa(`${api_key}:${api_secret}`);

    const formData = new URLSearchParams();
    formData.append('From', selectedFromNumber);
    formData.append('To', to_number);
    formData.append('Body', message);

    // Add media URLs for MMS if provided
    if (media_urls && media_urls.length > 0) {
      media_urls.forEach(url => {
        formData.append('MediaUrl', url);
      });
    }

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json();
      throw new Error(`Twilio API error: ${errorData.message || 'Unknown error'}`);
    }

    const twilioData = await twilioResponse.json();

    // Calculate SMS stats
    const characterCount = message.length;
    const segmentCount = Math.ceil(characterCount / 160);

    // Save message to database
    const { data: messageData, error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id,
        message_type: media_urls && media_urls.length > 0 ? 'mms' : 'sms',
        direction: 'outbound',
        sender_id: user.id,
        content: message,
        is_internal: false,
        sms_metadata: {
          from_number: selectedFromNumber,
          to_number: to_number,
          character_count: characterCount,
          segment_count: segmentCount,
          media_count: media_urls?.length || 0,
        },
        delivery_status: 'sent',
        external_id: twilioData.sid,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Failed to save message:', messageError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        data: {
          message_id: messageData?.id,
          twilio_sid: twilioData.sid,
          status: twilioData.status,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-sms function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
