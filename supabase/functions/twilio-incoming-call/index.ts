import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

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
    const formData = await req.formData();
    const from = formData.get('From')?.toString() || '';
    const to = formData.get('To')?.toString() || '';
    const callSid = formData.get('CallSid')?.toString() || '';

    console.log('Incoming call:', { from, to, callSid });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: phoneNumber } = await supabaseClient
      .from('phone_numbers')
      .select('user_id')
      .eq('phone_number', to)
      .single();

    if (phoneNumber) {
      await supabaseClient
        .from('call_logs')
        .insert({
          user_id: phoneNumber.user_id,
          from_number: from,
          to_number: to,
          direction: 'inbound',
          status: 'in-progress',
          call_sid: callSid,
          started_at: new Date().toISOString(),
        });
    }

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${to}">
    <Client>${phoneNumber?.user_id || 'unknown'}</Client>
  </Dial>
</Response>`;

    return new Response(twimlResponse, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error handling incoming call:', error);
    
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're sorry, but we cannot complete your call at this time.</Say>
  <Hangup/>
</Response>`;

    return new Response(errorResponse, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  }
});