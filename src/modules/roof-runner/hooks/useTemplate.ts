import { useState, useCallback, useEffect, useRef } from 'react';
import { templateApi, Template, UpdateTemplateRequest, ConflictError } from '../services/templateApi';

interface UseTemplateOptions {
  templateId?: string;
  autoSaveDelay?: number;
  onConflict?: (error: ConflictError) => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export const useTemplate = (options: UseTemplateOptions = {}) => {
  const { templateId, autoSaveDelay = 2000, onConflict, onSaveSuccess, onSaveError } = options;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingChangesRef = useRef<Partial<UpdateTemplateRequest>>({});

  const loadTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getTemplateById(id);
      setTemplate(data);
      return data;
    } catch (err) {
      setError('Failed to load template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTemplate = useCallback(async (updates: UpdateTemplateRequest) => {
    if (!template) return;

    setSaving(true);
    setError(null);
    try {
      const data = await templateApi.updateTemplate(template.id, {
        ...updates,
        last_modified_at: template.last_modified_at,
      });
      setTemplate(data);
      onSaveSuccess?.();
      return data;
    } catch (err: any) {
      if (err.code === 'CONFLICT') {
        onConflict?.(err);
      } else {
        setError('Failed to save template');
        onSaveError?.(err);
      }
      throw err;
    } finally {
      setSaving(false);
    }
  }, [template, onConflict, onSaveSuccess, onSaveError]);

  const scheduleAutoSave = useCallback((updates: Partial<UpdateTemplateRequest>) => {
    pendingChangesRef.current = { ...pendingChangesRef.current, ...updates };

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (Object.keys(pendingChangesRef.current).length > 0) {
        saveTemplate(pendingChangesRef.current as UpdateTemplateRequest);
        pendingChangesRef.current = {};
      }
    }, autoSaveDelay);
  }, [autoSaveDelay, saveTemplate]);

  const updateTemplate = useCallback((updates: Partial<UpdateTemplateRequest>) => {
    if (!template) return;
    
    setTemplate(prev => prev ? { ...prev, ...updates } : null);
    scheduleAutoSave(updates);
  }, [template, scheduleAutoSave]);

  const duplicateTemplate = useCallback(async (name?: string, organizationId?: string) => {
    if (!template) return;

    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.duplicateTemplate(template.id, {
        name,
        organization_id: organizationId,
      });
      return data;
    } catch (err) {
      setError('Failed to duplicate template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [template]);

  const setAsDefault = useCallback(async (organizationId?: string) => {
    if (!template) return;

    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.setDefaultTemplate(template.id, {
        organization_id: organizationId,
      });
      setTemplate(data);
      return data;
    } catch (err) {
      setError('Failed to set default template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [template]);

  const uploadMedia = useCallback(async (
    file: File,
    sectionId: string,
    type: 'photo' | 'pdf'
  ) => {
    if (!template) return;

    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.uploadMedia(template.id, file, sectionId, type);
      return data;
    } catch (err) {
      setError('Failed to upload media');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [template]);

  const uploadLogo = useCallback(async (file: File) => {
    if (!template) return;

    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.uploadLogo(template.id, file);
      return data;
    } catch (err) {
      setError('Failed to upload logo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [template]);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId, loadTemplate]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    template,
    loading,
    saving,
    error,
    loadTemplate,
    saveTemplate,
    updateTemplate,
    duplicateTemplate,
    setAsDefault,
    uploadMedia,
    uploadLogo,
  };
};
