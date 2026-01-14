import React from 'react';
import { Share, Mail, Phone } from 'lucide-react';

interface EstimateReviewProps {
  estimateData: {
    estimate: {
      customer_info: {
        name: string;
        email: string;
        phone: string;
        address: string;
      };
      project_details: {
        roofSteepness: string;
        buildingType: string;
        currentRoof: string;
        desiredRoof: string;
        timeline: string;
        financing: string;
        projectDetails: string;
      };
      calculations: {
        roofArea: number;
        materialType: string;
        pricePerSqFt: number;
        basePrice: number;
        finalPrice: number;
      };
    };
    estimator: {
      name: string;
      contact_settings: any;
      additional_settings: any;
    };
  };
  onBack?: () => void;
}

const EstimateReview: React.FC<EstimateReviewProps> = ({ estimateData, onBack }) => {
  const { estimate, estimator, business } = estimateData;
  const { calculations, project_details } = estimate;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSlopeText = (steepness: string) => {
    switch (steepness) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'steep': return 'Steep';
      default: return 'Low';
    }
  };

  const getMaterialDisplayName = (material: string) => {
    switch (material) {
      case 'metal': return 'Metal';
      case 'asphalt': return 'Asphalt';
      case 'tile': return 'Tile';
      case 'cedar': return 'Cedar';
      default: return 'Metal';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 h-10 bg-black rounded flex items-center justify-center">
              <div className="text-white font-bold text-xs">
                <div className="text-xs">{business?.name}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url).then(() => {
                  alert('Link copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy link');
                });
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Share className="w-4 h-4" />
              Share link
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Review your estimate</h1>

            {/* Estimate Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex gap-6">
                {/* Metal Roof Image */}
                <div className="w-48 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-r from-blue-300 to-blue-500 transform skew-y-12 origin-bottom-left"></div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{getMaterialDisplayName(calculations.materialType)}</h3>
                      <div className="text-3xl font-bold text-gray-900">{formatPrice(calculations.finalPrice)}*</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    A {getMaterialDisplayName(calculations.materialType).toLowerCase()} roof is a roofing system made from {calculations.materialType} pieces or tiles characterized by its
                    high resistance, impermeability and longevity.
                  </p>

                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4">
                    See more →
                  </button>

                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Get free proposal →
                  </button>
                </div>
              </div>
            </div>

            {/* Roof Details Section */}
            <div className="bg-gray-900 rounded-lg p-8 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your roof by</h2>
                  <h2 className="text-2xl font-bold mb-6">the numbers—</h2>

                  <p className="text-gray-300 text-sm mb-8">
                    This is an estimate. Actual roof size will vary based on the exact slope (steepness) of your roof.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <div className="text-3xl font-bold">{calculations.roofArea.toLocaleString()}</div>
                      <div className="text-gray-300">Square feet</div>
                    </div>

                    <div>
                      <div className="text-3xl font-bold">{getSlopeText(project_details.roofSteepness)}</div>
                      <div className="text-gray-300">Slope</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  {/* Satellite Map Placeholder */}
                  <div className="w-full h-64 bg-gray-700 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900"></div>
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-800">
                      Satellite view
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs text-white opacity-75">
                      CNES / Airbus, Maxar Technologies | Terms | Report a map error
                    </div>
                    {/* Blue highlighted roof area */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-20 bg-blue-500 bg-opacity-70 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                *Please be advised that this is only an estimate. Final prices will vary upon onsite assessment.
              </p>
            </div>

            {/* Powered by */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm text-gray-500">Powered by BuilderLync</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              {/* Company Logo */}
              <div className="text-center mb-6">
                <div className="w-24 h-16 mx-auto rounded flex items-center justify-center mb-4">
                  {business?.logo && (
                    <img
                      src={business.logo}
                      alt="Business Logo"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{business.name || 'Tarrytown Roofing'}</h3>
                {/* <p className="text-xl font-bold text-gray-900">LLC</p> */}
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">Email</span>
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateReview;