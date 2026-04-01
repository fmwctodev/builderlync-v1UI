import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText, Plus, RefreshCw, Copy, Trash2
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
  const { orgSlug } = useParams<{ orgSlug: string }>();
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
      navigate(`/org/${orgSlug}/job-cam/reports/${report.id}`);
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
        <RefreshCw size={20} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-wider">
          {reports.length} report{reports.length !== 1 ? 's' : ''}
        </p>
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(s => !s)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-md"
          >
            <Plus size={16} />
            New Report
          </button>
          {showCreateMenu && (
            <CreateReportMenu onSelect={handleCreate} onClose={() => setShowCreateMenu(false)} />
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyStateActionCard
          icon={FileText}
          title="No reports for this job"
          description="Create inspection, progress, completion, or claim reports with photos from this job."
          actionLabel="Create Report"
          onAction={() => setShowCreateMenu(true)}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50 shadow-sm overflow-hidden">
          {reports.map(report => (
            <div
              key={report.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-all group"
              onClick={() => navigate(`/org/${orgSlug}/job-cam/reports/${report.id}`)}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                <FileText size={22} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight">{report.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${reportTypeConfig[report.report_type].color}`}>
                    {reportTypeConfig[report.report_type].label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${statusConfig[report.status].color}`}>
                    {statusConfig[report.status].label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {report.sections?.length ?? 0} section{(report.sections?.length ?? 0) !== 1 ? 's' : ''}
                  <span className="mx-2 text-gray-300 dark:text-gray-600 font-bold">&bull;</span>
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => handleDuplicate(report.id)}
                  className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm border border-transparent hover:border-gray-100/50"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm border border-transparent hover:border-gray-100/50"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateReportMenu: React.FC<{
  onSelect: (type: ReportType) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => (
  <>
    <div className="fixed inset-0 z-10" onClick={onClose} />
    <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl py-1.5 w-52 overflow-hidden animate-in fade-in zoom-in duration-200">
      {(Object.keys(reportTypeConfig) as ReportType[]).map(type => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all uppercase tracking-widest border-l-4 border-transparent hover:border-primary-500"
        >
          {reportTypeConfig[type].label}
        </button>
      ))}
    </div>
  </>
);

export default ReportsTab;
