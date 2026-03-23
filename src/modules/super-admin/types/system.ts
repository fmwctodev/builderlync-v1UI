export interface SystemMetric {
  id: string;
  metric_name: string;
  value: number;
  threshold_warning: number | null;
  threshold_critical: number | null;
  unit: string;
  recorded_at: string;
  created_at: string;
}

export interface ApiService {
  id: string;
  service_name: string;
  service_type: 'api' | 'database' | 'external' | 'service';
  status: 'operational' | 'degraded' | 'down';
  endpoint_url: string | null;
  last_check: string;
  response_time: number | null;
  uptime_percentage: number;
  error_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BackgroundJob {
  id: string;
  job_name: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface JobQueue {
  id: string;
  queue_name: string;
  pending_count: number;
  running_count: number;
  completed_count: number;
  failed_count: number;
  avg_processing_time: number;
  updated_at: string;
  created_at: string;
}

export interface SystemRelease {
  id: string;
  version: string;
  release_type: 'major' | 'minor' | 'patch' | 'hotfix';
  status: 'deployed' | 'rolling_back' | 'failed';
  deployed_at: string;
  deployed_by: string | null;
  description: string | null;
  features: string[];
  bug_fixes: string[];
  rollback_available: boolean;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string | null;
  is_sensitive: boolean;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface SystemKPI {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  status?: 'good' | 'warning' | 'critical';
}
