import React, { useState, useEffect } from 'react';
import { Activity, Database, Package, Settings, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../services/supabase-client';
import {
  SystemMetric,
  ApiService,
  BackgroundJob,
  JobQueue,
  SystemRelease,
  SystemSetting,
  SystemKPI
} from '../types/system';
import {
  getMetricStatus,
  formatMetricValue,
  formatDuration,
  formatResponseTime,
  getServiceStatusColor,
  getJobStatusColor,
  getPriorityColor,
  getReleaseTypeColor,
  formatRelativeTime
} from '../utils/system-utils';

export const System: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'jobs' | 'releases'>('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [queues, setQueues] = useState<JobQueue[]>([]);
  const [releases, setReleases] = useState<SystemRelease[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, servicesRes, jobsRes, queuesRes, releasesRes, settingsRes] = await Promise.all([
        supabase.from('system_metrics').select('*').order('recorded_at', { ascending: false }).limit(10),
        supabase.from('api_services').select('*').order('service_name'),
        supabase.from('background_jobs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('job_queues').select('*').order('queue_name'),
        supabase.from('system_releases').select('*').order('deployed_at', { ascending: false }).limit(10),
        supabase.from('system_settings').select('*').order('setting_key')
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (jobsRes.data) setJobs(jobsRes.data);
      if (queuesRes.data) setQueues(queuesRes.data);
      if (releasesRes.data) setReleases(releasesRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKPIs = (): SystemKPI[] => {
    const cpuMetric = metrics.find(m => m.metric_name === 'cpu_usage');
    const memoryMetric = metrics.find(m => m.metric_name === 'memory_usage');
    const operationalServices = services.filter(s => s.status === 'operational').length;
    const runningJobs = jobs.filter(j => j.status === 'running').length;

    return [
      {
        label: 'CPU Usage',
        value: cpuMetric ? formatMetricValue(cpuMetric.value, cpuMetric.unit) : 'N/A',
        status: cpuMetric ? getMetricStatus(cpuMetric.value, cpuMetric.threshold_warning, cpuMetric.threshold_critical) : 'good'
      },
      {
        label: 'Memory Usage',
        value: memoryMetric ? formatMetricValue(memoryMetric.value, memoryMetric.unit) : 'N/A',
        status: memoryMetric ? getMetricStatus(memoryMetric.value, memoryMetric.threshold_warning, memoryMetric.threshold_critical) : 'good'
      },
      {
        label: 'Services Online',
        value: `${operationalServices}/${services.length}`,
        status: operationalServices === services.length ? 'good' : 'warning'
      },
      {
        label: 'Active Jobs',
        value: runningJobs.toString(),
        status: 'good'
      }
    ];
  };

  const getStatusBadgeClasses = (status: 'good' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
        <p className="mt-2 text-gray-600">Monitor system performance, services, and background jobs</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'services', label: 'API & Services', icon: Database },
            { id: 'jobs', label: 'Background Jobs', icon: Clock },
            { id: 'releases', label: 'Releases', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getKPIs().map((kpi, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                  {kpi.status && (
                    <div className={`p-2 rounded-full ${getStatusBadgeClasses(kpi.status)}`}>
                      {kpi.status === 'good' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Service Status</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{service.service_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.service_type}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Response: {formatResponseTime(service.response_time)}</span>
                      <span className="text-gray-500">Uptime: {service.uptime_percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Errors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map(service => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.service_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{service.service_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getServiceStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatResponseTime(service.response_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.uptime_percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.error_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeTime(service.last_check)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="text-red-600 hover:text-red-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedService.service_name}</h3>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedService.service_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceStatusColor(selectedService.status)}`}>
                      {selectedService.status}
                    </span>
                  </div>
                  {selectedService.endpoint_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Endpoint URL</label>
                      <p className="mt-1 text-sm text-gray-900 break-all">{selectedService.endpoint_url}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Response Time</label>
                      <p className="mt-1 text-sm text-gray-900">{formatResponseTime(selectedService.response_time)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Uptime</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedService.uptime_percentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Error Count</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedService.error_count}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Check</label>
                      <p className="mt-1 text-sm text-gray-900">{formatRelativeTime(selectedService.last_check)}</p>
                    </div>
                  </div>
                  {Object.keys(selectedService.metadata).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                      <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
                        {JSON.stringify(selectedService.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {queues.map(queue => (
              <div key={queue.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">{queue.queue_name}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pending:</span>
                    <span className="font-medium">{queue.pending_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Running:</span>
                    <span className="font-medium">{queue.running_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-medium">{queue.completed_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Failed:</span>
                    <span className="font-medium text-red-600">{queue.failed_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.job_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.job_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getJobStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(job.duration_ms)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-red-600 hover:text-red-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedJob && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedJob.job_name}</h3>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedJob.job_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getJobStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedJob.priority)}`}>
                        {selectedJob.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Progress</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedJob.progress}%</p>
                    </div>
                    {selectedJob.started_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Started At</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedJob.started_at).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedJob.completed_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Completed At</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedJob.completed_at).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedJob.duration_ms && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDuration(selectedJob.duration_ms)}</p>
                      </div>
                    )}
                  </div>
                  {selectedJob.error_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Error Message</label>
                      <div className="bg-red-50 border border-red-200 rounded p-4">
                        <p className="text-sm text-red-800">{selectedJob.error_message}</p>
                      </div>
                    </div>
                  )}
                  {Object.keys(selectedJob.metadata).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                      <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto">
                        {JSON.stringify(selectedJob.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'releases' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Deployment History</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {releases.map((release, index) => (
                  <div key={release.id} className="relative">
                    {index !== releases.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getReleaseTypeColor(release.release_type)}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Version {release.version}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(release.deployed_at).toLocaleString()}
                              {release.deployed_by && ` by ${release.deployed_by}`}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(release.release_type)}`}>
                            {release.release_type}
                          </span>
                        </div>
                        {release.description && (
                          <p className="mt-2 text-sm text-gray-700">{release.description}</p>
                        )}
                        {release.features && release.features.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Features</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {release.features.map((feature, idx) => (
                                <li key={idx} className="text-sm text-gray-600">{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {release.bug_fixes && release.bug_fixes.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Bug Fixes</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {release.bug_fixes.map((fix, idx) => (
                                <li key={idx} className="text-sm text-gray-600">{fix}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Runtime Settings</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {settings.map(setting => (
                  <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{setting.setting_key}</h3>
                        {setting.is_sensitive && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Sensitive
                          </span>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className="text-sm font-mono text-gray-900">
                        {setting.is_sensitive ? '••••••••' : setting.setting_value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
