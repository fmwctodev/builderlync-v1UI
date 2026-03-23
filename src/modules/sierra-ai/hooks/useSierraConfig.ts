import { useState, useEffect } from 'react';
import { configService } from '../services';
import type { DatabaseSierraConfig } from '../lib/database.types';

export function useSierraConfig() {
  const [config, setConfig] = useState<DatabaseSierraConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await configService.getOrCreateConfig();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config');
      console.error('Error loading Sierra config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: 'active' | 'paused') => {
    try {
      const updated = await configService.updateStatus(status);
      setConfig(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    }
  };

  const updateBusinessHours = async (businessHours: any) => {
    try {
      const updated = await configService.updateBusinessHours(businessHours);
      setConfig(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business hours');
      throw err;
    }
  };

  const publish = async () => {
    try {
      const updated = await configService.publish();
      setConfig(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish config');
      throw err;
    }
  };

  return {
    config,
    loading,
    error,
    updateStatus,
    updateBusinessHours,
    publish,
    reload: loadConfig
  };
}
