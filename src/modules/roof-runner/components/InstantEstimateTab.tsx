import React, { useEffect, useRef, useState } from 'react';
import { Plus, Minus, FileText, Trash2, Eye, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportsByJobId, InstantEstimateReport } from '../../../shared/store/services/instantEstimateReportsApi';
import { apiService } from '../store/services/api';

interface InstantEstimateTabProps {
  jobId?: number;
  jobAddress?: string;
}

const InstantEstimateTab: React.FC<InstantEstimateTabProps> = ({ jobId, jobAddress }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [reports, setReports] = useState<InstantEstimateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimators, setEstimators] = useState<any[]>([]);

  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.google) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 },
          zoom: 18,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          zoomControl: false
        });
      }
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      window.initMap = initMap;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getReportsByJobId(jobId);
        if (response.success) {
          setReports(response.data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEstimators = async () => {
      if (!jobId) return;
      try {
        const response = await apiService.getInstantEstimators(1, 100);
        const allEstimators = response?.data?.data || response?.data || [];
        const jobEstimators = allEstimators.filter((est: any) => est.job_id === jobId);
        setEstimators(jobEstimators);
      } catch (error) {
        console.error('Error fetching estimators:', error);
      }
    };

    fetchReports();
    fetchEstimators();
  }, [jobId]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 18;
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 18;
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleCreateReport = () => {
    console.log('Create report clicked - functionality coming soon');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300';
      case 'processing': return 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
      case 'draft': return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'archived': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-primary-200 dark:border-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Instant Estimate</h2>
            <span className="ml-3 px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full">
              ✨ FEATURED
            </span>
          </div>
          <button
            onClick={() => navigate(`/org/${orgSlug}/instant-estimator`)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex">
          <div className="flex-1">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 relative">
              <div ref={mapRef} className="w-full h-full" />
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="w-8 h-8 bg-white shadow-md rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-8 h-8 bg-white shadow-md rounded flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-3 gap-6 text-sm">
              <div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Residential/Commercial</span>
                  <div className="text-gray-500">N/A</div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Age of roof</span>
                  <div className="text-gray-500">-</div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Desired material</span>
                  <div className="text-gray-500">N/A</div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Wants financing?</span>
                  <div className="text-gray-500">-</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Customer note</span>
                  <div className="text-gray-500">-</div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Multi-story</span>
                  <div className="text-gray-500">-</div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Leaks and/or damages</span>
                  <div className="text-gray-500">-</div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Solar</span>
                  <div className="text-gray-500">N/A</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">How did you hear about us?</span>
                  <div className="text-gray-500">-</div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Currently on roof</span>
                  <div className="text-gray-500">-</div>
                </div>
                <div className="mb-4">
                  <span className="text-gray-600 dark:text-gray-400">Insurance claim</span>
                  <div className="text-gray-500">-</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Project timeline</span>
                  <div className="text-gray-500">N/A</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total roof size</span>
                <div className="text-gray-500">N/A</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Footprint (sqft)</span>
                <div className="text-gray-500">N/A</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Pitch</span>
                <div className="text-gray-500">N/A</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Adjusted footprint (sqft)</span>
                <div className="text-gray-500">N/A</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table Section */}
        <div className="px-6 py-6 border-t border-gray-200 dark:border-gray-700">
          {/* Linked Estimators Section */}
          {estimators.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Linked Instant Estimators
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Instant estimators configured for this job
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {estimators.map((estimator) => (
                  <div
                    key={estimator.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {estimator.name}
                      </h4>
                      <button
                        onClick={() => navigate(`/org/${orgSlug}/instant-estimator/${estimator.id}/manage`)}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        title="Manage Estimator"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Created: {formatDate(estimator.created_at)}</div>
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Reports
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Instant estimate reports created for this job address
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Report Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {report.report_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {formatDate(report.created_at)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="p-1.5 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No reports generated yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Click "+ Create Report" above to generate your first instant estimate report
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstantEstimateTab;
