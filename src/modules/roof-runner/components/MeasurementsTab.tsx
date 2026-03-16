import React, { useState, useEffect } from 'react';
import { X, Home, Box, Ruler, Clock, CheckCircle, AlertCircle, ExternalLink, Download, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { eagleViewService } from '../services/eagleViewService';

interface MeasurementsTabProps {
  jobId?: number;
  jobAddress?: string;
}

const MeasurementsTab: React.FC<MeasurementsTabProps> = ({ jobId, jobAddress }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Fetch reports linked to this job using referenceId (which we map to jobId)
      const data = await eagleViewService.getReports(jobId?.toString());
      setReports(data || []);

      // If we have reports, hide the promo by default
      if (data && data.length > 0) {
        setShowPromo(false);
      }
    } catch (error) {
      console.error('Error fetching measurements for job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderRedirect = () => {
    // Redirect to the measurements page with order intent and job context
    const searchParams = new URLSearchParams();
    searchParams.set('order', 'true');
    if (jobId) searchParams.set('jobId', jobId.toString());
    if (jobAddress) searchParams.set('address', jobAddress);

    navigate(`/org/${orgSlug}/measurements?${searchParams.toString()}`);
  };

  const getStatusInfo = (statusId: number) => {
    switch (statusId) {
      case 1: return { label: 'Created', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> };
      case 2: return { label: 'In Process', color: 'bg-purple-100 text-purple-800', icon: <Clock className="w-4 h-4" /> };
      case 3: return { label: 'Pending', color: 'bg-orange-100 text-orange-800', icon: <Clock className="w-4 h-4" /> };
      case 4: return { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: <CheckCircle className="w-4 h-4" /> };
      case 5: return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };

  const handleDownload = async (reportId: string, address: string) => {
    try {
      const blob = await eagleViewService.downloadReport(reportId, 'pdf');
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Measurement_${address.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Measurements</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/org/${orgSlug}/diy`)}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg border border-primary-200 dark:border-primary-800 transition-colors"
            >
              DIY Report
            </button>
            <button
              onClick={handleOrderRedirect}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Box className="w-4 h-4" />
              <span>Order BuilderLync Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {showPromo && !loading && (
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-xl p-6 relative">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Home className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Forgetting something?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm max-w-md">
                  Order a high-precision measurement report right here in the job record! Get accurate roof area, pitch, and more in minutes.
                </p>
                <button
                  onClick={handleOrderRedirect}
                  className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 px-5 py-2.5 rounded-lg border border-primary-200 dark:border-primary-700 font-semibold text-sm transition-all shadow-sm"
                >
                  <Box className="w-4 h-4" />
                  <span>Order a BuilderLync Measurement</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowPromo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Measurement Reports {reports.length > 0 && `(${reports.length})`}
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-gray-50 dark:bg-gray-800 h-24 rounded-xl border border-gray-200 dark:border-gray-700"></div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => {
                const statusInfo = getStatusInfo(report.status_id);
                return (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white truncate max-w-[300px]">
                            {report.address}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {(report.status_id === 4 || report.status_id === 5) && (
                          <button
                            onClick={() => handleDownload(report.id, report.address)}
                            className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/org/${orgSlug}/measurements?orderId=${report.id}`)}
                          className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="mx-auto w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Ruler className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No measurements yet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                No BuilderLync reports have been ordered for this job yet. Accurately measure the property with just a few clicks.
              </p>
              {!showPromo && (
                <button
                  onClick={handleOrderRedirect}
                  className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
                >
                  <Box className="w-4 h-4" />
                  <span>Start New Order</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementsTab;