import { getStripeClient } from './stripe-client';
import { supabase, handleSupabaseError } from '../supabase-client';
import type Stripe from 'stripe';

export interface PlanProduct {
  name: string;
  description: string;
  planName: string;
  features: string[];
  limits: Record<string, any>;
  monthlyPrice: number;
  annualPrice: number;
}

export async function pushProductToStripe(product: PlanProduct): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const stripe = getStripeClient();

    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        plan_name: product.planName,
        features: JSON.stringify(product.features),
        limits: JSON.stringify(product.limits),
      },
    });

    const monthlyPrice = await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'usd',
      unit_amount: Math.round(product.monthlyPrice * 100),
      recurring: { interval: 'month' },
      nickname: `${product.name} Monthly`,
    });

    const annualPrice = await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'usd',
      unit_amount: Math.round(product.annualPrice * 100),
      recurring: { interval: 'year' },
      nickname: `${product.name} Annual`,
    });

    await supabase.from('stripe_products').insert({
      stripe_product_id: stripeProduct.id,
      name: product.name,
      description: product.description,
      active: true,
      plan_name: product.planName,
      features: product.features,
      limits: product.limits,
      metadata: stripeProduct.metadata,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
    });

    await supabase.from('stripe_prices').insert([
      {
        stripe_price_id: monthlyPrice.id,
        stripe_product_id: stripeProduct.id,
        active: true,
        currency: 'usd',
        unit_amount: monthlyPrice.unit_amount || 0,
        recurring_interval: 'month',
        recurring_interval_count: 1,
        type: 'recurring',
        nickname: monthlyPrice.nickname,
      },
      {
        stripe_price_id: annualPrice.id,
        stripe_product_id: stripeProduct.id,
        active: true,
        currency: 'usd',
        unit_amount: annualPrice.unit_amount || 0,
        recurring_interval: 'year',
        recurring_interval_count: 1,
        type: 'recurring',
        nickname: annualPrice.nickname,
      },
    ]);

    return { success: true, productId: stripeProduct.id };
  } catch (error: any) {
    console.error('Error pushing product to Stripe:', error);
    return {
      success: false,
      error: error.message || 'Failed to push product to Stripe',
    };
  }
}

export async function pullProductsFromStripe(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const stripe = getStripeClient();

    const logId = await logSyncStart('product', 'pull');

    const products = await stripe.products.list({ limit: 100, active: true });
    let synced = 0;
    let failed = 0;

    for (const product of products.data) {
      try {
        const { data: existing } = await supabase
          .from('stripe_products')
          .select('id')
          .eq('stripe_product_id', product.id)
          .maybeSingle();

        const productData = {
          stripe_product_id: product.id,
          name: product.name,
          description: product.description || null,
          active: product.active,
          plan_name: product.metadata.plan_name || null,
          features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
          limits: product.metadata.limits ? JSON.parse(product.metadata.limits) : {},
          metadata: product.metadata,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          await supabase.from('stripe_products').update(productData).eq('id', existing.id);
        } else {
          await supabase.from('stripe_products').insert(productData);
        }

        const prices = await stripe.prices.list({ product: product.id, limit: 100 });

        for (const price of prices.data) {
          const { data: existingPrice } = await supabase
            .from('stripe_prices')
            .select('id')
            .eq('stripe_price_id', price.id)
            .maybeSingle();

          const priceData = {
            stripe_price_id: price.id,
            stripe_product_id: product.id,
            active: price.active,
            currency: price.currency,
            unit_amount: price.unit_amount || 0,
            recurring_interval: price.recurring?.interval || null,
            recurring_interval_count: price.recurring?.interval_count || 1,
            type: price.type,
            nickname: price.nickname || null,
            updated_at: new Date().toISOString(),
          };

          if (existingPrice) {
            await supabase.from('stripe_prices').update(priceData).eq('id', existingPrice.id);
          } else {
            await supabase.from('stripe_prices').insert(priceData);
          }
        }

        synced++;
      } catch (error) {
        console.error(`Error syncing product ${product.id}:`, error);
        failed++;
      }
    }

    await logSyncComplete(logId, 'success', synced, failed);

    return { success: true, count: synced };
  } catch (error: any) {
    console.error('Error pulling products from Stripe:', error);
    return {
      success: false,
      error: error.message || 'Failed to pull products from Stripe',
    };
  }
}

export async function syncProductToStripe(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: localProduct, error: fetchError } = await supabase
      .from('stripe_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    const stripe = getStripeClient();
    const stripeProduct = await stripe.products.retrieve(localProduct.stripe_product_id);

    await stripe.products.update(localProduct.stripe_product_id, {
      name: localProduct.name,
      description: localProduct.description || undefined,
      active: localProduct.active,
      metadata: {
        plan_name: localProduct.plan_name || '',
        features: JSON.stringify(localProduct.features || []),
        limits: JSON.stringify(localProduct.limits || {}),
      },
    });

    await supabase
      .from('stripe_products')
      .update({
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing product to Stripe:', error);

    await supabase
      .from('stripe_products')
      .update({
        sync_status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    return {
      success: false,
      error: error.message || 'Failed to sync product to Stripe',
    };
  }
}

export async function getAllProducts(): Promise<{ data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .select(`
        *,
        stripe_prices (
          id,
          stripe_price_id,
          unit_amount,
          currency,
          recurring_interval,
          active,
          nickname
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    return { data: [], error: handleSupabaseError(error) };
  }
}

export async function getPricesByPlan(planName: string, interval: 'month' | 'year'): Promise<{ data: any; error?: string }> {
  try {
    const { data: product } = await supabase
      .from('stripe_products')
      .select('stripe_product_id')
      .eq('plan_name', planName)
      .maybeSingle();

    if (!product) {
      return { data: null, error: 'Product not found' };
    }

    const { data: price, error } = await supabase
      .from('stripe_prices')
      .select('*')
      .eq('stripe_product_id', product.stripe_product_id)
      .eq('recurring_interval', interval)
      .eq('active', true)
      .maybeSingle();

    if (error) throw error;

    return { data: price };
  } catch (error: any) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

async function logSyncStart(syncType: string, direction: string): Promise<string> {
  const { data } = await supabase
    .from('stripe_sync_log')
    .insert({
      sync_type: syncType,
      direction,
      status: 'started',
    })
    .select('id')
    .single();

  return data?.id || '';
}

async function logSyncComplete(logId: string, status: string, processed: number, failed: number): Promise<void> {
  await supabase
    .from('stripe_sync_log')
    .update({
      status,
      records_processed: processed,
      records_failed: failed,
      completed_at: new Date().toISOString(),
    })
    .eq('id', logId);
}
