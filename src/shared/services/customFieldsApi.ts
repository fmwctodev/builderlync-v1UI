import { supabase } from '../lib/supabase';

export interface CustomFieldDefinition {
  id: string;
  organization_id: string;
  entity_type: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any[];
  default_value?: string;
  is_required: boolean;
  is_searchable: boolean;
  validation_rules?: Record<string, any>;
  display_order: number;
  help_text?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  id: string;
  custom_field_definition_id: string;
  entity_type: string;
  entity_id: string;
  field_value?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldInput {
  entity_type: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any[];
  default_value?: string;
  is_required?: boolean;
  is_searchable?: boolean;
  validation_rules?: Record<string, any>;
  display_order?: number;
  help_text?: string;
}

export interface UpdateCustomFieldInput {
  field_label?: string;
  field_type?: string;
  field_options?: any[];
  default_value?: string;
  is_required?: boolean;
  is_searchable?: boolean;
  validation_rules?: Record<string, any>;
  display_order?: number;
  help_text?: string;
  is_active?: boolean;
}

export const customFieldsApi = {
  async getCustomFields(
    organizationId: string,
    entityType?: string
  ): Promise<CustomFieldDefinition[]> {
    let query = supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching custom fields:', error);
      throw new Error(`Failed to fetch custom fields: ${error.message}`);
    }

    return data || [];
  },

  async getCustomField(fieldId: string): Promise<CustomFieldDefinition | null> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('id', fieldId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching custom field:', error);
      throw new Error(`Failed to fetch custom field: ${error.message}`);
    }

    return data;
  },

  async createCustomField(
    organizationId: string,
    input: CreateCustomFieldInput
  ): Promise<CustomFieldDefinition> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .insert({
        organization_id: organizationId,
        ...input,
        is_required: input.is_required ?? false,
        is_searchable: input.is_searchable ?? true,
        display_order: input.display_order ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom field:', error);
      throw new Error(`Failed to create custom field: ${error.message}`);
    }

    return data;
  },

  async updateCustomField(
    fieldId: string,
    input: UpdateCustomFieldInput
  ): Promise<CustomFieldDefinition> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fieldId)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom field:', error);
      throw new Error(`Failed to update custom field: ${error.message}`);
    }

    return data;
  },

  async deleteCustomField(fieldId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_field_definitions')
      .update({ is_active: false })
      .eq('id', fieldId);

    if (error) {
      console.error('Error deleting custom field:', error);
      throw new Error(`Failed to delete custom field: ${error.message}`);
    }
  },

  async reorderCustomFields(
    fieldIds: string[],
    organizationId: string
  ): Promise<void> {
    const updates = fieldIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('custom_field_definitions')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
        .eq('organization_id', organizationId);
    }
  },

  async getFieldValues(
    entityType: string,
    entityId: string
  ): Promise<CustomFieldValue[]> {
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      console.error('Error fetching field values:', error);
      throw new Error(`Failed to fetch field values: ${error.message}`);
    }

    return data || [];
  },

  async getFieldValue(
    customFieldDefinitionId: string,
    entityId: string
  ): Promise<CustomFieldValue | null> {
    const { data, error } = await supabase
      .from('custom_field_values')
      .select('*')
      .eq('custom_field_definition_id', customFieldDefinitionId)
      .eq('entity_id', entityId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching field value:', error);
      throw new Error(`Failed to fetch field value: ${error.message}`);
    }

    return data;
  },

  async setFieldValue(
    customFieldDefinitionId: string,
    entityType: string,
    entityId: string,
    value: string
  ): Promise<CustomFieldValue> {
    const existing = await this.getFieldValue(customFieldDefinitionId, entityId);

    if (existing) {
      const { data, error } = await supabase
        .from('custom_field_values')
        .update({
          field_value: value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating field value:', error);
        throw new Error(`Failed to update field value: ${error.message}`);
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('custom_field_values')
        .insert({
          custom_field_definition_id: customFieldDefinitionId,
          entity_type: entityType,
          entity_id: entityId,
          field_value: value,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating field value:', error);
        throw new Error(`Failed to create field value: ${error.message}`);
      }

      return data;
    }
  },

  async bulkSetFieldValues(
    entityType: string,
    entityId: string,
    values: Record<string, string>
  ): Promise<void> {
    for (const [fieldId, value] of Object.entries(values)) {
      await this.setFieldValue(fieldId, entityType, entityId, value);
    }
  },

  async deleteFieldValue(valueId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_field_values')
      .delete()
      .eq('id', valueId);

    if (error) {
      console.error('Error deleting field value:', error);
      throw new Error(`Failed to delete field value: ${error.message}`);
    }
  },
};
