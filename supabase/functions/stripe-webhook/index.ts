import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed: false,
      raw_event: event,
      created_at: new Date().toISOString(),
    });

    switch (event.type) {
      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        await processCustomerEvent(supabase, customer);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await processSubscriptionEvent(supabase, subscription);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'invoice.created':
      case 'invoice.updated': {
        const invoice = event.data.object as Stripe.Invoice;
        await processInvoiceEvent(supabase, invoice);
        break;
      }

      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await processPaymentEvent(supabase, paymentIntent);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await processCheckoutSessionCompleted(supabase, session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await supabase
      .from('stripe_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processCustomerEvent(supabase: any, customer: Stripe.Customer) {
  const accountId = customer.metadata?.account_id || customer.metadata?.enterprise_account_id;

  if (!accountId) {
    const { data: account } = await supabase
      .from('enterprise_accounts')
      .select('id')
      .eq('owner_email', customer.email)
      .maybeSingle();

    if (!account) return;
  }

  const { data: existing } = await supabase
    .from('stripe_customers')
    .select('id')
    .eq('stripe_customer_id', customer.id)
    .maybeSingle();

  const customerData = {
    account_id: accountId,
    stripe_customer_id: customer.id,
    email: customer.email || '',
    name: customer.name || null,
    default_payment_method: customer.invoice_settings?.default_payment_method || null,
    currency: customer.currency || 'usd',
    balance: customer.balance || 0,
    delinquent: customer.delinquent || false,
    metadata: customer.metadata,
    sync_status: 'synced',
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase
      .from('stripe_customers')
      .update(customerData)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('stripe_customers')
      .insert({ ...customerData, created_at: new Date().toISOString() });
  }
}

async function processSubscriptionEvent(supabase: any, subscription: Stripe.Subscription) {
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('id, account_id')
    .eq('stripe_customer_id', subscription.customer)
    .maybeSingle();

  if (!customer) return;

  const { data: product } = await supabase
    .from('stripe_products')
    .select('name')
    .eq('stripe_product_id', subscription.items.data[0]?.price?.product)
    .maybeSingle();

  const planName = product?.name || 'Unknown';
  const billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';

  const { data: existing } = await supabase
    .from('stripe_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  const subscriptionData = {
    account_id: customer.account_id,
    customer_id: customer.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    status: subscription.status,
    plan_name: planName,
    billing_cycle: billingCycle,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    metadata: subscription.metadata,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase
      .from('stripe_subscriptions')
      .update(subscriptionData)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('stripe_subscriptions')
      .insert({ ...subscriptionData, created_at: new Date().toISOString() });
  }

  const { data: plan } = await supabase
    .from('plan_definitions')
    .select('price_monthly, price_annual')
    .eq('name', planName)
    .maybeSingle();

  if (plan) {
    const mrr = billingCycle === 'monthly'
      ? parseFloat(plan.price_monthly)
      : parseFloat(plan.price_annual) / 12;

    await supabase
      .from('enterprise_accounts')
      .update({
        plan: planName,
        billing_cycle: billingCycle,
        mrr: mrr.toFixed(2),
        arr: (mrr * 12).toFixed(2),
        status: subscription.status === 'active' ? 'active' : subscription.status,
        renewal_date: subscriptionData.current_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.account_id);
  }
}

async function processInvoiceEvent(supabase: any, invoice: Stripe.Invoice) {
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('id, account_id')
    .eq('stripe_customer_id', invoice.customer)
    .maybeSingle();

  if (!customer) return;

  const { data: subscription } = await supabase
    .from('stripe_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription)
    .maybeSingle();

  const { data: existing } = await supabase
    .from('stripe_invoices')
    .select('id')
    .eq('stripe_invoice_id', invoice.id)
    .maybeSingle();

  const invoiceData = {
    account_id: customer.account_id,
    customer_id: customer.id,
    subscription_id: subscription?.id || null,
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer,
    invoice_number: invoice.number || null,
    status: invoice.status,
    amount_due: invoice.amount_due,
    amount_paid: invoice.amount_paid,
    amount_remaining: invoice.amount_remaining,
    currency: invoice.currency,
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
    paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
    invoice_pdf: invoice.invoice_pdf || null,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    description: invoice.description || null,
    metadata: invoice.metadata,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase
      .from('stripe_invoices')
      .update(invoiceData)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('stripe_invoices')
      .insert({ ...invoiceData, created_at: new Date().toISOString() });
  }
}

async function processPaymentEvent(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.customer) return;

  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('id, account_id')
    .eq('stripe_customer_id', paymentIntent.customer)
    .maybeSingle();

  if (!customer) return;

  const { data: invoice } = await supabase
    .from('stripe_invoices')
    .select('id')
    .eq('stripe_invoice_id', paymentIntent.invoice)
    .maybeSingle();

  const { data: existing } = await supabase
    .from('stripe_payments')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .maybeSingle();

  const charge = paymentIntent.charges?.data[0];

  const paymentData = {
    account_id: customer.account_id,
    invoice_id: invoice?.id || null,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_charge_id: charge?.id || null,
    amount: paymentIntent.amount,
    amount_refunded: paymentIntent.amount - (paymentIntent.amount_received || 0),
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    payment_method_type: charge?.payment_method_details?.type || null,
    payment_method_last4: charge?.payment_method_details?.card?.last4 || null,
    payment_method_brand: charge?.payment_method_details?.card?.brand || null,
    failure_message: charge?.failure_message || null,
    receipt_url: charge?.receipt_url || null,
    paid_at: paymentIntent.created ? new Date(paymentIntent.created * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase
      .from('stripe_payments')
      .update(paymentData)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('stripe_payments')
      .insert({ ...paymentData, created_at: new Date().toISOString() });
  }
}

async function processCheckoutSessionCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  if (metadata.type !== 'credit_purchase') {
    console.log('Checkout session is not a credit purchase, skipping');
    return;
  }

  const organizationId = metadata.organization_id;
  const creditPackageId = metadata.credit_package_id;
  const credits = parseInt(metadata.credits || '0', 10);
  const userId = metadata.user_id;

  if (!organizationId || !credits) {
    console.error('Missing required metadata for credit purchase');
    return;
  }

  console.log(`Processing credit purchase: ${credits} credits for org ${organizationId}`);

  const { data: existingPurchase } = await supabase
    .from('credit_purchases')
    .select('id, status')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle();

  if (existingPurchase?.status === 'completed') {
    console.log('Credit purchase already completed, skipping');
    return;
  }

  const { data: addResult, error: addError } = await supabase.rpc('add_credits', {
    org_id: organizationId,
    add_amount: credits,
    add_description: `Purchased ${credits} credits via Stripe`,
    ref_type: 'stripe_purchase',
    ref_id: session.id,
  });

  if (addError) {
    console.error('Error adding credits:', addError);

    if (existingPurchase) {
      await supabase
        .from('credit_purchases')
        .update({
          status: 'failed',
          stripe_payment_intent_id: session.payment_intent,
        })
        .eq('id', existingPurchase.id);
    }
    return;
  }

  console.log(`Successfully added ${credits} credits to org ${organizationId}`);

  if (existingPurchase) {
    await supabase
      .from('credit_purchases')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent,
      })
      .eq('id', existingPurchase.id);
  } else {
    await supabase
      .from('credit_purchases')
      .insert({
        organization_id: organizationId,
        credit_package_id: creditPackageId,
        credits_purchased: credits,
        amount_paid_cents: session.amount_total || 0,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        status: 'completed',
        completed_at: new Date().toISOString(),
        created_by: userId,
      });
  }
}