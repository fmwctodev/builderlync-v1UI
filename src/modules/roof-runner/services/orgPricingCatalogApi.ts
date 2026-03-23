import { supabase } from '../../../shared/lib/supabase';
import type {
  PricingCatalogItem,
  CreatePricingCatalogItemRequest,
} from '../types/proposalIntegration';

export interface PricingCatalogResponse {
  success: boolean;
  data?: PricingCatalogItem;
  message?: string;
}

export interface PricingCatalogListResponse {
  success: boolean;
  data: PricingCatalogItem[];
  message?: string;
}

export async function getCatalogByOrg(
  organizationId: string
): Promise<PricingCatalogListResponse> {
  try {
    const { data, error } = await supabase
      .from('org_pricing_catalog')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return { success: true, data: (data ?? []) as PricingCatalogItem[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch catalog';
    console.error('Error fetching pricing catalog:', error);
    return { success: false, data: [], message };
  }
}

export async function getCatalogItem(
  organizationId: string,
  sku: string
): Promise<PricingCatalogResponse> {
  try {
    const { data, error } = await supabase
      .from('org_pricing_catalog')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('sku', sku)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { success: false, message: 'Catalog item not found' };
    }

    return { success: true, data: data as PricingCatalogItem };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch catalog item';
    console.error('Error fetching catalog item:', error);
    return { success: false, message };
  }
}

export async function createCatalogItem(
  organizationId: string,
  item: CreatePricingCatalogItemRequest
): Promise<PricingCatalogResponse> {
  try {
    const { data, error } = await supabase
      .from('org_pricing_catalog')
      .insert({
        organization_id: organizationId,
        sku: item.sku,
        name: item.name,
        description: item.description,
        default_unit_price: item.default_unit_price ?? 0,
        unit: item.unit,
        category: item.category,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as PricingCatalogItem };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create catalog item';
    console.error('Error creating catalog item:', error);
    return { success: false, message };
  }
}

export async function updateCatalogItem(
  id: string,
  organizationId: string,
  updates: Partial<CreatePricingCatalogItemRequest>
): Promise<PricingCatalogResponse> {
  try {
    const { data, error } = await supabase
      .from('org_pricing_catalog')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as PricingCatalogItem };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update catalog item';
    console.error('Error updating catalog item:', error);
    return { success: false, message };
  }
}

export async function deleteCatalogItem(
  id: string,
  organizationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from('org_pricing_catalog')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete catalog item';
    console.error('Error deleting catalog item:', error);
    return { success: false, message };
  }
}

export async function seedDefaultCatalog(
  organizationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase.rpc('seed_default_pricing_catalog', {
      p_organization_id: organizationId,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed catalog';
    console.error('Error seeding default catalog:', error);
    return { success: false, message };
  }
}

export async function lookupPriceBySku(
  organizationId: string,
  sku: string
): Promise<number> {
  try {
    const { data } = await supabase
      .from('org_pricing_catalog')
      .select('default_unit_price')
      .eq('organization_id', organizationId)
      .eq('sku', sku)
      .eq('is_active', true)
      .maybeSingle();

    return data?.default_unit_price ?? 0;
  } catch {
    return 0;
  }
}
