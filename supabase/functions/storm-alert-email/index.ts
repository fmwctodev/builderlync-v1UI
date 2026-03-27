import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StormAlertEmailRequest {
  organizationId: string;
  userId: string;
  alert: {
    id: string;
    event: string;
    severity: string;
    areaDesc: string;
    headline?: string;
    maxHailInches?: number;
    expires: string;
  };
  recipientEmails?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!sendgridApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "SendGrid not configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: StormAlertEmailRequest = await req.json();
    const { organizationId, userId, alert, recipientEmails } = body;

    if (!organizationId || !alert?.id || !alert?.event) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let emails: string[] = recipientEmails || [];

    if (emails.length === 0) {
      const { data: settings } = await supabase
        .from("canvass_org_settings")
        .select("alert_recipient_external_emails, alert_recipient_user_ids")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (settings?.alert_recipient_external_emails?.length) {
        emails = emails.concat(settings.alert_recipient_external_emails);
      }

      if (settings?.alert_recipient_user_ids?.length) {
        const { data: users } = await supabase
          .from("organization_members")
          .select("user_id, users:user_id(email)")
          .eq("organization_id", organizationId)
          .in("user_id", settings.alert_recipient_user_ids);

        if (users) {
          for (const u of users) {
            const email = (u as Record<string, unknown>).users as
              | { email?: string }
              | null;
            if (email?.email) emails.push(email.email);
          }
        }
      }
    }

    if (emails.length === 0) {
      const { data: userRecord } = await supabase
        .from("organization_members")
        .select("user_id, users:user_id(email)")
        .eq("organization_id", organizationId)
        .eq("user_id", userId)
        .maybeSingle();

      const email = (userRecord as Record<string, unknown>)?.users as
        | { email?: string }
        | null;
      if (email?.email) emails.push(email.email);
    }

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No recipient emails found",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const uniqueEmails = [...new Set(emails)];

    const expiresDate = new Date(alert.expires);
    const expiresFormatted = expiresDate.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const severityColor =
      alert.severity === "Extreme"
        ? "#dc2626"
        : alert.severity === "Severe"
          ? "#f97316"
          : "#f59e0b";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severityColor}; padding: 16px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Storm Alert: ${alert.event}</h2>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Severity</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px; color: ${severityColor};">${alert.severity}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Area</td>
              <td style="padding: 8px 0; font-size: 14px; color: #111827;">${alert.areaDesc}</td>
            </tr>
            ${alert.maxHailInches ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Hail Size</td><td style="padding: 8px 0; font-size: 14px; color: #111827;">Up to ${alert.maxHailInches}"</td></tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Expires</td>
              <td style="padding: 8px 0; font-size: 14px; color: #111827;">${expiresFormatted}</td>
            </tr>
          </table>
          ${alert.headline ? `<p style="font-size: 14px; color: #374151; line-height: 1.5; margin: 0 0 16px;">${alert.headline}</p>` : ""}
          <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0;">This alert was sent from BuilderLync Storm Canvassing. NWS Alert ID: ${alert.id}</p>
        </div>
      </div>`;

    const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: uniqueEmails.map((email) => ({ email })),
            subject: `[Storm Alert] ${alert.event} - ${alert.severity} - ${alert.areaDesc.slice(0, 50)}`,
          },
        ],
        from: {
          email: "alerts@builderlync.com",
          name: "BuilderLync Storm Alerts",
        },
        content: [
          { type: "text/html", value: htmlContent },
        ],
      }),
    });

    const success = sgResponse.status >= 200 && sgResponse.status < 300;

    return new Response(
      JSON.stringify({
        success,
        recipientCount: uniqueEmails.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
