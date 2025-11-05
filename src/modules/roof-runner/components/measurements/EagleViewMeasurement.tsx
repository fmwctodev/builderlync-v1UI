import React, { useState } from 'react';
import { MapPin, Ruler, Camera, FileText, Download, Eye } from 'lucide-react';

interface EagleViewReport {
  id: string;
  address: string;
  reportType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdDate: string;
  completedDate?: string;
  measurements: {
    totalRoofArea: number;
    perimeterLength: number;
    pitch: string;
    facets: Array<{
      area: number;
      pitch: string;
      direction: string;
    }>;
  };
  downloadLinks?: {
    pdf: string;
    xml: string;
    dxf?: string;
  };
}

interface EagleViewMeasurementProps {
  onReportSelect?: (report: EagleViewReport) => void;
}

const EagleViewMeasurement: React.FC<EagleViewMeasurementProps> = ({ onReportSelect }) => {
  const [activeTab, setActiveTab] = useState<'new-order' | 'reports'>('new-order');
  const [reports] = useState<EagleViewReport[]>([
    {
      id: 'EV-2025-001',
      address: '123 Main St, Anytown, FL 33565',
      reportType: 'Premium Roof Report',
      status: 'completed',
      createdDate: '2025-01-15',
      completedDate: '2025-01-16',
      measurements: {
        totalRoofArea: 2847,
        perimeterLength: 312,
        pitch: '6/12',
        facets: [
          { area: 1423, pitch: '6/12', direction: 'South' },
          { area: 1424, pitch: '6/12', direction: 'North' }
        ]
      },
      downloadLinks: {
        pdf: '/reports/EV-2025-001.pdf',
        xml: '/reports/EV-2025-001.xml',
        dxf: '/reports/EV-2025-001.dxf'
      }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderNewOrderTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">EagleView Measurements</h2>
            <p className="text-blue-100">Precision aerial property intelligence</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Ruler className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roof Measurements</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get precise roof area, pitch, and perimeter measurements from high-resolution aerial imagery.
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Total roof area calculation</li>
            <li>• Individual facet measurements</li>
            <li>• Pitch analysis</li>
            <li>• Perimeter calculations</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Reports</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comprehensive property reports with measurements, imagery, and technical specifications.
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• PDF summary reports</li>
            <li>• XML data files</li>
            <li>• CAD-compatible DXF files</li>
            <li>• High-resolution imagery</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Property Intelligence</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Advanced property analysis including structure identification and condition assessment.
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Structure identification</li>
            <li>• Material analysis</li>
            <li>• Damage assessment</li>
            <li>• Historical comparisons</li>
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Report Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Premium Roof Report', price: '$25.00', features: ['Detailed measurements', 'Multiple formats', 'High-res imagery'] },
            { name: 'QuickSquare Report', price: '$15.00', features: ['Basic measurements', 'PDF format', 'Standard imagery'] },
            { name: 'Insurance Claim Report', price: '$35.00', features: ['Damage assessment', 'Before/after comparison', 'Claim documentation'] }
          ].map((report, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                <span className="text-lg font-bold text-blue-600">{report.price}</span>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {report.features.map((feature, idx) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">EagleView Reports</h2>
        <button
          onClick={() => setActiveTab('new-order')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          New Order
        </button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.id}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {report.address}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {report.reportType} • Created: {report.createdDate}
                  {report.completedDate && ` • Completed: ${report.completedDate}`}
                </p>
              </div>
              {report.status === 'completed' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReportSelect?.(report)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    title="View Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {report.status === 'completed' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Roof Area</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.measurements.totalRoofArea.toLocaleString()} sq ft
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Perimeter</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.measurements.perimeterLength} ft
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Primary Pitch</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.measurements.pitch}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Facets</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {report.measurements.facets.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('new-order')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new-order'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            New Order
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Reports
          </button>
        </nav>
      </div>

      {activeTab === 'new-order' && renderNewOrderTab()}
      {activeTab === 'reports' && renderReportsTab()}
    </div>
  );
};

export default EagleViewMeasurement;