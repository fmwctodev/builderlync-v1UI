import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Search, Copy, Trash2, ExternalLink,
  RefreshCw, Filter, ChevronDown
} from 'lucide-react';
import {
  fetchReports,
  deleteReport,
  duplicateReport,
} from '../../services/jobCamApi';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';
import type { JobReport, ReportType, ReportStatus } from '../../types/jobCam';
import { format, formatDistanceToNow } from 'date-fns';

const reportTypeConfig: Record<ReportType, { label: string; color: string }> = {
  inspection: { label: 'Inspection', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' },
  progress: { label: 'Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  completion: { label: 'Completion', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  claim: { label: 'Claim', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  custom: { label: 'Custom', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

const statusConfig: Record<ReportStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  final: { label: 'Final', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
};

const JobCamReportsIndex: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<JobReport[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsData, jobsData] = await Promise.all([
        fetchReports(),
        getJobs(1, 100),
      ]);
      setReports(reportsData);
      setJobs(jobsData.jobs ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getJobName = (jobId: number | null) => {
    if (!jobId) return null;
    return jobs.find(j => j.id === jobId)?.name ?? `Job #${jobId}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(id);
    try {
      const copy = await duplicateReport(id);
      setReports(prev => [copy, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setDuplicating(null);
    }
  };

  const filtered = reports.filter(r => {
    if (filterType !== 'all' && r.report_type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.title.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const draftCount = reports.filter(r => r.status === 'draft').length;
  const finalCount = reports.filter(r => r.status === 'final').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={26} className="text-gray-700 dark:text-gray-300" />
            Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Inspection, progress, completion and claim reports
          </p>
        </div>
        <button
          onClick={() => navigate('new')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} />
          New Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' },
          { label: 'Drafts', value: draftCount, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Finalized', value: finalCount, icon: FileText, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
            <div className={`${stat.bg} rounded-xl p-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
              showFilters || filterType !== 'all' || filterStatus !== 'all'
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter size={14} />
            Filters
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 flex-wrap bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type:</span>
              <div className="flex gap-1.5">
                {(['all', 'inspection', 'progress', 'completion', 'claim', 'custom'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors capitalize ${
                      filterType === t
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {t === 'all' ? 'All' : reportTypeConfig[t].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status:</span>
              <div className="flex gap-1.5">
                {(['all', 'draft', 'final'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors capitalize ${
                      filterStatus === s
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {s === 'all' ? 'All' : statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search || filterType !== 'all' || filterStatus !== 'all' ? 'No reports match your filters' : 'No reports yet'}
            </p>
            {!search && filterType === 'all' && filterStatus === 'all' && (
              <button
                onClick={() => navigate('new')}
                className="mt-3 text-sm text-gray-700 dark:text-gray-300 underline"
              >
                Create your first report
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filtered.map(report => {
              const jobName = getJobName(report.job_id);
              const sectionCount = report.sections?.length;

              return (
                <div
                  key={report.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                  onClick={() => navigate(report.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-gray-500 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {report.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reportTypeConfig[report.report_type].color}`}>
                        {reportTypeConfig[report.report_type].label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[report.status].color}`}>
                        {statusConfig[report.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {jobName && <span className="mr-2">{jobName}</span>}
                      {sectionCount !== undefined && <span className="mr-2">{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>}
                      <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(report.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Open report"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(report.id)}
                      disabled={duplicating === report.id}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
                      title="Duplicate report"
                    >
                      {duplicating === report.id
                        ? <RefreshCw size={14} className="animate-spin" />
                        : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCamReportsIndex;
