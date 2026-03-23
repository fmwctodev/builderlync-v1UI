import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'BuilderLync Credits',
    version: '1.0.0',
  },
});

function corsResponse(body: string | object | null, status = 200) {
  if (status === 204) {
    return new Response(null, { status, headers: corsHeaders });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { organizationId, packageId, successUrl, cancelUrl } = await req.json();

    if (!organizationId || !packageId || !successUrl || !cancelUrl) {
      return corsResponse({ error: 'Missing required parameters' }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Missing authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (membershipError || !membership) {
      return corsResponse({ error: 'User is not a member of this organization' }, 403);
    }

    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .maybeSingle();

    if (packageError || !creditPackage) {
      return corsResponse({ error: 'Credit package not found' }, 404);
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    let customerId: string;
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (!customer || !customer.customer_id) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          organizationId: organizationId,
        },
      });

      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('Failed to save customer information in the database', createCustomerError);
        try {
          await stripe.customers.del(newCustomer.id);
        } catch (deleteError) {
          console.error('Failed to clean up Stripe customer:', deleteError);
        }
        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;
    }

    let priceId = creditPackage.stripe_price_id;

    if (!priceId) {
      const product = await stripe.products.create({
        name: `${creditPackage.name} - ${creditPackage.credits} Credits`,
        description: creditPackage.description || `${creditPackage.credits} credits for BuilderLync`,
        metadata: {
          credit_package_id: creditPackage.id,
          credits: creditPackage.credits.toString(),
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: creditPackage.price_cents,
        currency: 'usd',
        metadata: {
          credit_package_id: creditPackage.id,
          credits: creditPackage.credits.toString(),
        },
      });

      priceId = price.id;

      await supabase
        .from('credit_packages')
        .update({ stripe_price_id: priceId })
        .eq('id', creditPackage.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'credit_purchase',
        organization_id: organizationId,
        credit_package_id: creditPackage.id,
        credits: creditPackage.credits.toString(),
        user_id: user.id,
      },
    });

    console.log(`Created credits checkout session ${session.id} for org ${organizationId}`);

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Credits checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});