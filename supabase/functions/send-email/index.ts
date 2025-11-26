import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SendEmailRequest {
  conversation_id: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  message: string;
  from_email?: string;
  from_name?: string;
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body: SendEmailRequest = await req.json();
    const { conversation_id, to_emails, cc_emails, bcc_emails, subject, message, from_email, from_name } = body;

    if (!conversation_id || !to_emails || to_emails.length === 0 || !subject || !message) {
      throw new Error('Missing required fields: conversation_id, to_emails, subject, message');
    }

    // Get user's connected email account
    const { data: emailAccount, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (accountError || !emailAccount) {
      throw new Error('No active email account found. Please connect Gmail or Outlook in settings.');
    }

    // Check if token is expired
    const tokenExpiresAt = new Date(emailAccount.token_expires_at);
    const now = new Date();

    if (tokenExpiresAt < now) {
      throw new Error('Email account token expired. Please reconnect your email account.');
    }

    // Determine which provider to use
    let emailSent = false;
    let externalId = '';

    if (emailAccount.provider === 'gmail') {
      // Send via Gmail API
      const response = await sendViaGmail(
        emailAccount.access_token,
        {
          to: to_emails,
          cc: cc_emails,
          bcc: bcc_emails,
          subject,
          body: message,
          from: from_email || emailAccount.email_address,
          fromName: from_name,
        }
      );
      emailSent = true;
      externalId = response.id;
    } else if (emailAccount.provider === 'outlook') {
      // Send via Microsoft Graph API
      const response = await sendViaOutlook(
        emailAccount.access_token,
        {
          to: to_emails,
          cc: cc_emails,
          bcc: bcc_emails,
          subject,
          body: message,
          from: from_email || emailAccount.email_address,
          fromName: from_name,
        }
      );
      emailSent = true;
      externalId = response.id;
    } else {
      throw new Error('Unsupported email provider');
    }

    // Save message to database
    const { data: messageData, error: messageError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id,
        message_type: 'email',
        direction: 'outbound',
        sender_id: user.id,
        content: message,
        is_internal: false,
        email_metadata: {
          from_name: from_name,
          from_email: from_email || emailAccount.email_address,
          to_emails,
          cc_emails,
          bcc_emails,
          subject,
        },
        delivery_status: emailSent ? 'sent' : 'failed',
        external_id: externalId,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Failed to save message:', messageError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        data: {
          message_id: messageData?.id,
          external_id: externalId,
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
    console.error('Error in send-email function:', error);
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

// Helper function to send email via Gmail API
async function sendViaGmail(
  accessToken: string,
  emailData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    from: string;
    fromName?: string;
  }
) {
  const email = [
    `From: ${emailData.fromName ? `${emailData.fromName} <${emailData.from}>` : emailData.from}`,
    `To: ${emailData.to.join(', ')}`,
    emailData.cc && emailData.cc.length > 0 ? `Cc: ${emailData.cc.join(', ')}` : '',
    emailData.bcc && emailData.bcc.length > 0 ? `Bcc: ${emailData.bcc.join(', ')}` : '',
    `Subject: ${emailData.subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    emailData.body,
  ]
    .filter(Boolean)
    .join('\r\n');

  const encodedEmail = btoa(email)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gmail API error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

// Helper function to send email via Microsoft Graph API
async function sendViaOutlook(
  accessToken: string,
  emailData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    from: string;
    fromName?: string;
  }
) {
  const message = {
    subject: emailData.subject,
    body: {
      contentType: 'HTML',
      content: emailData.body,
    },
    toRecipients: emailData.to.map((email) => ({
      emailAddress: {
        address: email,
      },
    })),
    ccRecipients: emailData.cc
      ? emailData.cc.map((email) => ({
          emailAddress: {
            address: email,
          },
        }))
      : undefined,
    bccRecipients: emailData.bcc
      ? emailData.bcc.map((email) => ({
          emailAddress: {
            address: email,
          },
        }))
      : undefined,
  };

  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Microsoft Graph API error: ${error.error?.message || 'Unknown error'}`);
  }

  // Microsoft Graph doesn't return the message ID in the response
  // We'll generate a unique ID for tracking
  return { id: `outlook-${Date.now()}` };
}
