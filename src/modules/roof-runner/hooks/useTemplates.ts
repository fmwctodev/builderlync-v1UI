import { useState, useCallback, useEffect } from 'react';
import { templateApi, Template, CreateTemplateRequest } from '../services/templateApi';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await templateApi.getTemplates();
      setTemplates(data);
      return data;
    } catch (err) {
      setError('Failed to load templates');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: CreateTemplateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newTemplate = await templateApi.createTemplate(data);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError('Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await templateApi.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    createTemplate,
    deleteTemplate,
  };
};
