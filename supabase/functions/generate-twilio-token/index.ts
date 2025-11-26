import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Twilio } from 'npm:twilio@5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: twilioSettings, error: settingsError } = await supabaseClient
      .from('twilio_settings')
      .select('account_sid, api_key, api_secret, twiml_app_sid')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !twilioSettings) {
      return new Response(
        JSON.stringify({ error: 'Twilio settings not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { account_sid, api_key, api_secret, twiml_app_sid } = twilioSettings;

    if (!account_sid || !api_key || !api_secret) {
      return new Response(
        JSON.stringify({ error: 'Incomplete Twilio configuration' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const AccessToken = Twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const identity = user.id;
    const accessToken = new AccessToken(account_sid, api_key, api_secret, {
      identity: identity,
      ttl: 3600,
    });

    const grant = new VoiceGrant({
      outgoingApplicationSid: twiml_app_sid,
      incomingAllow: true,
    });

    accessToken.addGrant(grant);

    return new Response(
      JSON.stringify({
        token: accessToken.toJwt(),
        identity: identity,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});