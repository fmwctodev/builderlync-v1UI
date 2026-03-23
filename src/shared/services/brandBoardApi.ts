import { supabase } from '../lib/supabase';

export interface BrandAsset {
  id: string;
  organization_id: string;
  asset_type: string;
  asset_name: string;
  asset_url: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  version: number;
  parent_version_id?: string;
  description?: string;
  tags: string[];
  download_count: number;
  last_downloaded_at?: string;
  is_primary: boolean;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandGuideline {
  id: string;
  organization_id: string;
  guideline_type: string;
  title: string;
  content: string;
  display_order: number;
  examples?: any[];
  dos_and_donts?: Record<string, any>;
  is_published: boolean;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandAssetInput {
  asset_type: string;
  asset_name: string;
  asset_url: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  description?: string;
  tags?: string[];
  is_primary?: boolean;
}

export interface UpdateBrandAssetInput {
  asset_name?: string;
  description?: string;
  tags?: string[];
  is_primary?: boolean;
}

export interface CreateBrandGuidelineInput {
  guideline_type: string;
  title: string;
  content: string;
  display_order?: number;
  examples?: any[];
  dos_and_donts?: Record<string, any>;
  is_published?: boolean;
}

export const brandBoardApi = {
  async getBrandAssets(
    organizationId: string,
    assetType?: string
  ): Promise<BrandAsset[]> {
    let query = supabase
      .from('brand_assets')
      .select('*')
      .eq('organization_id', organizationId);

    if (assetType) {
      query = query.eq('asset_type', assetType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching brand assets:', error);
      throw new Error(`Failed to fetch brand assets: ${error.message}`);
    }

    return data || [];
  },

  async getBrandAsset(assetId: string): Promise<BrandAsset | null> {
    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('id', assetId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching brand asset:', error);
      throw new Error(`Failed to fetch brand asset: ${error.message}`);
    }

    return data;
  },

  async getPrimaryLogo(organizationId: string): Promise<BrandAsset | null> {
    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('asset_type', 'logo')
      .eq('is_primary', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching primary logo:', error);
      throw new Error(`Failed to fetch primary logo: ${error.message}`);
    }

    return data;
  },

  async createBrandAsset(
    organizationId: string,
    input: CreateBrandAssetInput
  ): Promise<BrandAsset> {
    const { data: { user } } = await supabase.auth.getUser();

    if (input.is_primary) {
      await this.clearPrimaryAsset(organizationId, input.asset_type);
    }

    const { data, error } = await supabase
      .from('brand_assets')
      .insert({
        organization_id: organizationId,
        ...input,
        tags: input.tags || [],
        version: 1,
        download_count: 0,
        is_primary: input.is_primary ?? false,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand asset:', error);
      throw new Error(`Failed to create brand asset: ${error.message}`);
    }

    return data;
  },

  async updateBrandAsset(
    assetId: string,
    input: UpdateBrandAssetInput
  ): Promise<BrandAsset> {
    if (input.is_primary) {
      const asset = await this.getBrandAsset(assetId);
      if (asset) {
        await this.clearPrimaryAsset(asset.organization_id, asset.asset_type);
      }
    }

    const { data, error } = await supabase
      .from('brand_assets')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand asset:', error);
      throw new Error(`Failed to update brand asset: ${error.message}`);
    }

    return data;
  },

  async deleteBrandAsset(assetId: string): Promise<void> {
    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', assetId);

    if (error) {
      console.error('Error deleting brand asset:', error);
      throw new Error(`Failed to delete brand asset: ${error.message}`);
    }
  },

  async clearPrimaryAsset(organizationId: string, assetType: string): Promise<void> {
    const { error } = await supabase
      .from('brand_assets')
      .update({ is_primary: false })
      .eq('organization_id', organizationId)
      .eq('asset_type', assetType)
      .eq('is_primary', true);

    if (error) {
      console.error('Error clearing primary asset:', error);
    }
  },

  async incrementDownloadCount(assetId: string): Promise<void> {
    const asset = await this.getBrandAsset(assetId);
    if (!asset) return;

    const { error } = await supabase
      .from('brand_assets')
      .update({
        download_count: (asset.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', assetId);

    if (error) {
      console.error('Error incrementing download count:', error);
    }
  },

  async uploadAssetToStorage(
    file: File,
    organizationId: string,
    assetType: string
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}/${assetType}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file to storage:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  async getBrandGuidelines(organizationId: string): Promise<BrandGuideline[]> {
    const { data, error } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching brand guidelines:', error);
      throw new Error(`Failed to fetch brand guidelines: ${error.message}`);
    }

    return data || [];
  },

  async getBrandGuideline(guidelineId: string): Promise<BrandGuideline | null> {
    const { data, error } = await supabase
      .from('brand_guidelines')
      .select('*')
      .eq('id', guidelineId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching brand guideline:', error);
      throw new Error(`Failed to fetch brand guideline: ${error.message}`);
    }

    return data;
  },

  async createBrandGuideline(
    organizationId: string,
    input: CreateBrandGuidelineInput
  ): Promise<BrandGuideline> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('brand_guidelines')
      .insert({
        organization_id: organizationId,
        ...input,
        display_order: input.display_order ?? 0,
        is_published: input.is_published ?? true,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating brand guideline:', error);
      throw new Error(`Failed to create brand guideline: ${error.message}`);
    }

    return data;
  },

  async updateBrandGuideline(
    guidelineId: string,
    input: Partial<CreateBrandGuidelineInput>
  ): Promise<BrandGuideline> {
    const { data, error } = await supabase
      .from('brand_guidelines')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', guidelineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating brand guideline:', error);
      throw new Error(`Failed to update brand guideline: ${error.message}`);
    }

    return data;
  },

  async deleteBrandGuideline(guidelineId: string): Promise<void> {
    const { error } = await supabase
      .from('brand_guidelines')
      .delete()
      .eq('id', guidelineId);

    if (error) {
      console.error('Error deleting brand guideline:', error);
      throw new Error(`Failed to delete brand guideline: ${error.message}`);
    }
  },
};
