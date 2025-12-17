import { supabase } from '../lib/supabase';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorLogContext {
  query?: string;
  params?: Record<string, unknown>;
  organizationId?: string | null;
  userId?: string | null;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ErrorLog {
  id: string;
  organization_id?: string;
  user_id?: string;
  severity: ErrorSeverity;
  error_type: string;
  error_code?: string;
  message: string;
  stack_trace?: string;
  context: ErrorLogContext;
  resolved: boolean;
  created_at: string;
}

class ErrorLoggingService {
  async logError(
    errorType: string,
    message: string,
    options: {
      severity?: ErrorSeverity;
      error?: Error;
      errorCode?: string;
      context?: ErrorLogContext;
      organizationId?: string | null;
    } = {}
  ): Promise<void> {
    try {
      const { severity = 'error', error, errorCode, context = {}, organizationId } = options;

      const { data: { user } } = await supabase.auth.getUser();

      const enrichedContext: ErrorLogContext = {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      const errorLog = {
        organization_id: organizationId || context.organizationId || null,
        user_id: user?.id || null,
        severity,
        error_type: errorType,
        error_code: errorCode,
        message,
        stack_trace: error?.stack || new Error().stack,
        context: enrichedContext,
      };

      await supabase.from('error_logs').insert([errorLog]);

      if (severity === 'critical') {
        console.error('[CRITICAL ERROR]', message, error, context);
      } else if (severity === 'error') {
        console.error('[ERROR]', message, error, context);
      } else if (severity === 'warning') {
        console.warn('[WARNING]', message, context);
      } else {
        console.info('[INFO]', message, context);
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', message, options.error);
    }
  }

  async logInfo(message: string, context?: ErrorLogContext): Promise<void> {
    await this.logError('info', message, { severity: 'info', context });
  }

  async logWarning(message: string, context?: ErrorLogContext): Promise<void> {
    await this.logError('warning', message, { severity: 'warning', context });
  }

  async logCritical(
    errorType: string,
    message: string,
    error?: Error,
    context?: ErrorLogContext
  ): Promise<void> {
    await this.logError(errorType, message, {
      severity: 'critical',
      error,
      context,
    });
  }

  async getErrorStatistics(
    organizationId?: string | null,
    hoursBack: number = 24
  ): Promise<unknown> {
    try {
      const { data, error } = await supabase.rpc('get_error_statistics', {
        p_organization_id: organizationId || null,
        p_hours_back: hoursBack,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get error statistics:', error);
      return null;
    }
  }

  async getRecentErrors(
    organizationId?: string | null,
    limit: number = 20
  ): Promise<ErrorLog[]> {
    try {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ErrorLog[];
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  async resolveError(errorId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq('id', errorId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to resolve error:', error);
      throw error;
    }
  }
}

export const errorLogging = new ErrorLoggingService();
