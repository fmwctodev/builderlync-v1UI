import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TwilioPhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: string;
  phoneNumberType: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get organization_id from request
    const { organizationId } = await req.json();

    if (!organizationId) {
      throw new Error('Missing organizationId in request body');
    }

    // Verify user is member of organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .maybeSingle();

    if (membershipError || !membership) {
      throw new Error('User is not a member of this organization');
    }

    // Fetch Twilio credentials from integration_connections
    const { data: twilioConnection, error: connectionError } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('integration_name', 'twilio')
      .eq('status', 'active')
      .maybeSingle();

    if (connectionError || !twilioConnection) {
      return new Response(
        JSON.stringify({ error: 'Twilio integration not connected' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract Twilio credentials from configuration
    const config = twilioConnection.configuration as any;
    const accountSid = config?.accountSid || config?.account_sid;
    const authToken = config?.authToken || config?.auth_token;

    if (!accountSid || !authToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid Twilio credentials in integration' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch phone numbers from Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`;
    const basicAuth = btoa(`${accountSid}:${authToken}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      throw new Error(`Twilio API error: ${errorText}`);
    }

    const twilioData = await twilioResponse.json();
    const phoneNumbers: TwilioPhoneNumber[] = [];

    // Process phone numbers from Twilio response
    for (const number of twilioData.incoming_phone_numbers || []) {
      // Determine phone number type based on Twilio data
      let phoneNumberType = 'local';
      if (number.phone_number.startsWith('+1800') || number.phone_number.startsWith('+1888') || 
          number.phone_number.startsWith('+1877') || number.phone_number.startsWith('+1866') ||
          number.phone_number.startsWith('+1855') || number.phone_number.startsWith('+1844')) {
        phoneNumberType = 'toll-free';
      }
      // Check if it's a short code (typically 5-6 digits)
      if (number.phone_number.length <= 8 && !number.phone_number.startsWith('+')) {
        phoneNumberType = 'short-code';
      }

      phoneNumbers.push({
        sid: number.sid,
        phoneNumber: number.phone_number,
        friendlyName: number.friendly_name || number.phone_number,
        capabilities: {
          voice: number.capabilities?.voice || false,
          sms: number.capabilities?.sms || false,
          mms: number.capabilities?.mms || false,
        },
        status: number.status || 'active',
        phoneNumberType,
      });
    }

    return new Response(
      JSON.stringify({ phoneNumbers }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching Twilio phone numbers:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch phone numbers' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
