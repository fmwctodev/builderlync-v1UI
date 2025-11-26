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
    const callSid = formData.get('CallSid')?.toString() || '';
    const callStatus = formData.get('CallStatus')?.toString() || '';
    const callDuration = parseInt(formData.get('CallDuration')?.toString() || '0');
    const recordingUrl = formData.get('RecordingUrl')?.toString();

    console.log('Call status update:', { callSid, callStatus, callDuration });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const updateData: any = {
      status: callStatus === 'completed' ? 'completed' : 
              callStatus === 'busy' ? 'busy' :
              callStatus === 'no-answer' ? 'no-answer' :
              callStatus === 'failed' ? 'failed' : 'in-progress',
      updated_at: new Date().toISOString(),
    };

    if (callStatus === 'completed') {
      updateData.duration = callDuration;
      updateData.ended_at = new Date().toISOString();
    }

    if (recordingUrl) {
      updateData.recording_url = recordingUrl;
    }

    const { error: updateError } = await supabaseClient
      .from('call_logs')
      .update(updateData)
      .eq('call_sid', callSid);

    if (updateError) {
      console.error('Error updating call log:', updateError);
    }

    if (recordingUrl) {
      const { data: callLog } = await supabaseClient
        .from('call_logs')
        .select('id')
        .eq('call_sid', callSid)
        .single();

      if (callLog) {
        await supabaseClient
          .from('call_recordings')
          .insert({
            call_log_id: callLog.id,
            recording_url: recordingUrl,
            duration: callDuration,
            status: 'completed',
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error handling call status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});