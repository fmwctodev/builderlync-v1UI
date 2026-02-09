import { getStripeClient, isStripeConfigured } from './stripe-client';
import { supabase } from '../supabase-client';
import Stripe from 'stripe';

export interface SyncResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
}

export async function syncAllStripeData(): Promise<{
  customers: SyncResult;
  products: SyncResult;
  subscriptions: SyncResult;
  invoices: SyncResult;
  payments: SyncResult;
}> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  await logSyncStart('full', 'pull');

  try {
    const [customers, products, subscriptions, invoices, payments] = await Promise.all([
      syncStripeCustomers(),
      syncStripeProducts(),
      syncStripeSubscriptions(),
      syncStripeInvoices(),
      syncStripePayments(),
    ]);

    await logSyncComplete('full', 'pull', 'success', {
      customers,
      products,
      subscriptions,
      invoices,
      payments,
    });

    return { customers, products, subscriptions, invoices, payments };
  } catch (error: any) {
    await logSyncComplete('full', 'pull', 'error', null, error.message);
    throw error;
  }
}

export async function syncStripeCustomers(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    const stripe = getStripeClient();
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const customer of customers.data) {
        try {
          result.totalProcessed++;

          const { data: existingCustomer } = await supabase
            .from('stripe_customers')
            .select('id, account_id')
            .eq('stripe_customer_id', customer.id)
            .maybeSingle();

          const accountId = await findAccountForCustomer(customer);

          if (!accountId) {
            result.skipped++;
            continue;
          }

          const customerData = {
            account_id: accountId,
            stripe_customer_id: customer.id,
            email: customer.email || '',
            name: customer.name || null,
            default_payment_method: customer.invoice_settings?.default_payment_method as string || null,
            currency: customer.currency || 'usd',
            balance: customer.balance || 0,
            delinquent: customer.delinquent || false,
            metadata: customer.metadata as any,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (existingCustomer) {
            await supabase
              .from('stripe_customers')
              .update(customerData)
              .eq('id', existingCustomer.id);
            result.updated++;
          } else {
            await supabase
              .from('stripe_customers')
              .insert({ ...customerData, created_at: new Date().toISOString() });
            result.created++;
          }
        } catch (error: any) {
          result.errors++;
          result.errorMessages?.push(`Customer ${customer.id}: ${error.message}`);
        }
      }

      hasMore = customers.has_more;
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id;
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync customers: ${error.message}`);
  }

  return result;
}

export async function syncStripeProducts(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    const stripe = getStripeClient();
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const products = await stripe.products.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const product of products.data) {
        try {
          result.totalProcessed++;

          const { data: existingProduct } = await supabase
            .from('stripe_products')
            .select('id')
            .eq('stripe_product_id', product.id)
            .maybeSingle();

          const productData = {
            stripe_product_id: product.id,
            name: product.name,
            description: product.description || null,
            active: product.active,
            metadata: product.metadata as any,
            features: (product.features || []) as any,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (existingProduct) {
            await supabase
              .from('stripe_products')
              .update(productData)
              .eq('id', existingProduct.id);
            result.updated++;
          } else {
            await supabase
              .from('stripe_products')
              .insert({ ...productData, created_at: new Date().toISOString() });
            result.created++;
          }

          await syncPricesForProduct(product.id);
        } catch (error: any) {
          result.errors++;
          result.errorMessages?.push(`Product ${product.id}: ${error.message}`);
        }
      }

      hasMore = products.has_more;
      if (hasMore && products.data.length > 0) {
        startingAfter = products.data[products.data.length - 1].id;
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync products: ${error.message}`);
  }

  return result;
}

async function syncPricesForProduct(productId: string): Promise<void> {
  const stripe = getStripeClient();
  const prices = await stripe.prices.list({
    product: productId,
    limit: 100,
  });

  const { data: product } = await supabase
    .from('stripe_products')
    .select('id')
    .eq('stripe_product_id', productId)
    .maybeSingle();

  if (!product) return;

  for (const price of prices.data) {
    const { data: existingPrice } = await supabase
      .from('stripe_prices')
      .select('id')
      .eq('stripe_price_id', price.id)
      .maybeSingle();

    const priceData = {
      product_id: product.id,
      stripe_price_id: price.id,
      stripe_product_id: productId,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount || 0,
      recurring_interval: price.recurring?.interval || null,
      recurring_interval_count: price.recurring?.interval_count || null,
      type: price.type,
      nickname: price.nickname || null,
      updated_at: new Date().toISOString(),
    };

    if (existingPrice) {
      await supabase
        .from('stripe_prices')
        .update(priceData)
        .eq('id', existingPrice.id);
    } else {
      await supabase
        .from('stripe_prices')
        .insert({ ...priceData, created_at: new Date().toISOString() });
    }
  }
}

export async function syncStripeSubscriptions(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    const stripe = getStripeClient();
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        starting_after: startingAfter,
        status: 'all',
      });

      for (const subscription of subscriptions.data) {
        try {
          result.totalProcessed++;

          const { data: customer } = await supabase
            .from('stripe_customers')
            .select('id, account_id')
            .eq('stripe_customer_id', subscription.customer as string)
            .maybeSingle();

          if (!customer) {
            result.skipped++;
            continue;
          }

          const planName = subscription.items.data[0]?.price?.product
            ? await getProductName(subscription.items.data[0].price.product as string)
            : 'Unknown';

          const billingCycle = subscription.items.data[0]?.price?.recurring?.interval === 'year'
            ? 'annual'
            : 'monthly';

          const { data: existingSubscription } = await supabase
            .from('stripe_subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .maybeSingle();

          const subscriptionData = {
            account_id: customer.account_id,
            customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status as any,
            plan_name: planName,
            billing_cycle: billingCycle as 'monthly' | 'annual',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
            metadata: subscription.metadata as any,
            updated_at: new Date().toISOString(),
          };

          if (existingSubscription) {
            await supabase
              .from('stripe_subscriptions')
              .update(subscriptionData)
              .eq('id', existingSubscription.id);
            result.updated++;
          } else {
            await supabase
              .from('stripe_subscriptions')
              .insert({ ...subscriptionData, created_at: new Date().toISOString() });
            result.created++;
          }

          await updateEnterpriseAccountFromSubscription(customer.account_id, subscriptionData);
        } catch (error: any) {
          result.errors++;
          result.errorMessages?.push(`Subscription ${subscription.id}: ${error.message}`);
        }
      }

      hasMore = subscriptions.has_more;
      if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync subscriptions: ${error.message}`);
  }

  return result;
}

export async function syncStripeInvoices(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    const stripe = getStripeClient();
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const invoices = await stripe.invoices.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const invoice of invoices.data) {
        try {
          result.totalProcessed++;

          const { data: customer } = await supabase
            .from('stripe_customers')
            .select('id, account_id')
            .eq('stripe_customer_id', invoice.customer as string)
            .maybeSingle();

          if (!customer) {
            result.skipped++;
            continue;
          }

          const { data: subscription } = await supabase
            .from('stripe_subscriptions')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .maybeSingle();

          const { data: existingInvoice } = await supabase
            .from('stripe_invoices')
            .select('id')
            .eq('stripe_invoice_id', invoice.id)
            .maybeSingle();

          const invoiceData = {
            account_id: customer.account_id,
            customer_id: customer.id,
            subscription_id: subscription?.id || null,
            stripe_invoice_id: invoice.id,
            stripe_customer_id: invoice.customer as string,
            invoice_number: invoice.number || null,
            status: invoice.status as any,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            amount_remaining: invoice.amount_remaining,
            currency: invoice.currency,
            due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
            paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
            invoice_pdf: invoice.invoice_pdf || null,
            hosted_invoice_url: invoice.hosted_invoice_url || null,
            description: invoice.description || null,
            metadata: invoice.metadata as any,
            updated_at: new Date().toISOString(),
          };

          if (existingInvoice) {
            await supabase
              .from('stripe_invoices')
              .update(invoiceData)
              .eq('id', existingInvoice.id);
            result.updated++;
          } else {
            await supabase
              .from('stripe_invoices')
              .insert({ ...invoiceData, created_at: new Date().toISOString() });
            result.created++;
          }
        } catch (error: any) {
          result.errors++;
          result.errorMessages?.push(`Invoice ${invoice.id}: ${error.message}`);
        }
      }

      hasMore = invoices.has_more;
      if (hasMore && invoices.data.length > 0) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync invoices: ${error.message}`);
  }

  return result;
}

export async function syncStripePayments(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    const stripe = getStripeClient();
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: startingAfter,
      });

      for (const payment of paymentIntents.data) {
        try {
          result.totalProcessed++;

          if (!payment.customer) {
            result.skipped++;
            continue;
          }

          const { data: customer } = await supabase
            .from('stripe_customers')
            .select('id, account_id')
            .eq('stripe_customer_id', payment.customer as string)
            .maybeSingle();

          if (!customer) {
            result.skipped++;
            continue;
          }

          const { data: invoice } = await supabase
            .from('stripe_invoices')
            .select('id')
            .eq('stripe_invoice_id', payment.invoice as string)
            .maybeSingle();

          const { data: existingPayment } = await supabase
            .from('stripe_payments')
            .select('id')
            .eq('stripe_payment_intent_id', payment.id)
            .maybeSingle();

          const charge = payment.charges?.data[0];

          const paymentData = {
            account_id: customer.account_id,
            invoice_id: invoice?.id || null,
            stripe_payment_intent_id: payment.id,
            stripe_charge_id: charge?.id || null,
            amount: payment.amount,
            amount_refunded: payment.amount - (payment.amount_received || 0),
            currency: payment.currency,
            status: payment.status as any,
            payment_method_type: charge?.payment_method_details?.type || null,
            payment_method_last4: charge?.payment_method_details?.card?.last4 || null,
            payment_method_brand: charge?.payment_method_details?.card?.brand || null,
            failure_message: charge?.failure_message || null,
            receipt_url: charge?.receipt_url || null,
            paid_at: payment.created ? new Date(payment.created * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          };

          if (existingPayment) {
            await supabase
              .from('stripe_payments')
              .update(paymentData)
              .eq('id', existingPayment.id);
            result.updated++;
          } else {
            await supabase
              .from('stripe_payments')
              .insert({ ...paymentData, created_at: new Date().toISOString() });
            result.created++;
          }
        } catch (error: any) {
          result.errors++;
          result.errorMessages?.push(`Payment ${payment.id}: ${error.message}`);
        }
      }

      hasMore = paymentIntents.has_more;
      if (hasMore && paymentIntents.data.length > 0) {
        startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id;
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync payments: ${error.message}`);
  }

  return result;
}

async function findAccountForCustomer(customer: Stripe.Customer): Promise<string | null> {
  const email = customer.email;
  const customerId = customer.metadata?.account_id || customer.metadata?.enterprise_account_id;

  if (customerId) {
    return customerId;
  }

  if (email) {
    const { data: account } = await supabase
      .from('enterprise_accounts')
      .select('id')
      .eq('owner_email', email)
      .maybeSingle();

    if (account) {
      return account.id;
    }
  }

  return null;
}

async function getProductName(productId: string): Promise<string> {
  const { data } = await supabase
    .from('stripe_products')
    .select('name')
    .eq('stripe_product_id', productId)
    .maybeSingle();

  return data?.name || 'Unknown';
}

async function updateEnterpriseAccountFromSubscription(
  accountId: string,
  subscription: any
): Promise<void> {
  const { data: plans } = await supabase
    .from('plan_definitions')
    .select('name, price_monthly, price_annual')
    .eq('name', subscription.plan_name)
    .maybeSingle();

  if (!plans) return;

  const mrr = subscription.billing_cycle === 'monthly'
    ? parseFloat(plans.price_monthly)
    : parseFloat(plans.price_annual) / 12;

  const arr = mrr * 12;

  await supabase
    .from('enterprise_accounts')
    .update({
      plan: subscription.plan_name,
      billing_cycle: subscription.billing_cycle,
      mrr: mrr.toFixed(2),
      arr: arr.toFixed(2),
      status: subscription.status === 'active' ? 'active' : subscription.status,
      renewal_date: subscription.current_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId);
}

async function logSyncStart(syncType: string, direction: string): Promise<void> {
  await supabase
    .from('stripe_sync_log')
    .insert({
      sync_type: syncType,
      direction: direction,
      status: 'started',
      started_at: new Date().toISOString(),
    });
}

async function logSyncComplete(
  syncType: string,
  direction: string,
  status: string,
  results: any,
  errorMessage?: string
): Promise<void> {
  const totalProcessed = results
    ? Object.values(results).reduce((sum: number, r: any) => sum + (r.totalProcessed || 0), 0)
    : 0;
  const totalFailed = results
    ? Object.values(results).reduce((sum: number, r: any) => sum + (r.errors || 0), 0)
    : 0;

  await supabase
    .from('stripe_sync_log')
    .insert({
      sync_type: syncType,
      direction: direction,
      status: status,
      records_processed: totalProcessed,
      records_failed: totalFailed,
      error_message: errorMessage || null,
      metadata: results || {},
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
}
