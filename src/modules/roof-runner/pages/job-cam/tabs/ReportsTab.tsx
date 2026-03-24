import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Plus, RefreshCw, ExternalLink, Copy, Trash2
} from 'lucide-react';
import {
  fetchReports, deleteReport, duplicateReport, createReport
} from '../../../services/jobCamApi';
import type { JobReport, ReportType, ReportStatus, CreateReportInput } from '../../../types/jobCam';
import EmptyStateActionCard from '../../../components/job-cam/EmptyStateActionCard';
import { formatDistanceToNow } from 'date-fns';

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

interface Props {
  jobId: number;
}

const ReportsTab: React.FC<Props> = ({ jobId }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchReports({ jobId });
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (type: ReportType) => {
    setShowCreateMenu(false);
    try {
      const input: CreateReportInput = {
        job_id: jobId,
        report_type: type,
        title: `${reportTypeConfig[type].label} Report`,
      };
      const report = await createReport(input);
      navigate(`/app/job-cam/jobs/${jobId}/reports/${report.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateReport(id);
      setReports(prev => [copy, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="relative">
        <EmptyStateActionCard
          icon={FileText}
          title="No reports for this job"
          description="Create inspection, progress, completion, or claim reports with photos from this job."
          actionLabel="Create Report"
          onAction={() => setShowCreateMenu(true)}
        />
        {showCreateMenu && (
          <CreateReportMenu onSelect={handleCreate} onClose={() => setShowCreateMenu(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{reports.length} report{reports.length !== 1 ? 's' : ''}</p>
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(s => !s)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus size={14} />
            New Report
          </button>
          {showCreateMenu && (
            <CreateReportMenu onSelect={handleCreate} onClose={() => setShowCreateMenu(false)} />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
        {reports.map(report => (
          <div
            key={report.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
            onClick={() => navigate(`/app/job-cam/jobs/${jobId}/reports/${report.id}`)}
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{report.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reportTypeConfig[report.report_type].color}`}>
                  {reportTypeConfig[report.report_type].label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[report.status].color}`}>
                  {statusConfig[report.status].label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {report.sections?.length ?? 0} section{(report.sections?.length ?? 0) !== 1 ? 's' : ''}
                <span className="mx-1">&bull;</span>
                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => handleDuplicate(report.id)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Duplicate"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => handleDelete(report.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateReportMenu: React.FC<{
  onSelect: (type: ReportType) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => (
  <>
    <div className="fixed inset-0 z-10" onClick={onClose} />
    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl py-1 w-48">
      {(Object.keys(reportTypeConfig) as ReportType[]).map(type => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {reportTypeConfig[type].label}
        </button>
      ))}
    </div>
  </>
);

export default ReportsTab;
