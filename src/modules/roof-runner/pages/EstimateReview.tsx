import React from 'react';
import { Share, Mail, Phone, Check, ExternalLink } from 'lucide-react';
import { apiService } from '../store/services/api';

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
        financing_link?: string;
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
      materials: any[];
      contact_settings: any;
      additional_settings: any;
    };
    business: {
      name: string;
      logo: string | null;
      email?: string | null;
      phone?: string | null;
      business_email?: string | null;
      business_phone?: string | null;
      representative_email?: string | null;
      representative_phone?: string | null;
    };
  };
  propertyImage?: string | null;
  leadId?: string | null;
  financingUrl?: string;
  onBack?: () => void;
}

const EstimateReview: React.FC<EstimateReviewProps> = ({ estimateData, propertyImage, leadId, financingUrl, onBack }) => {
  const [requestedMaterials, setRequestedMaterials] = React.useState<string[]>([]);
  console.log('[EstimateReview] Rendering with data:', estimateData);


  if (!estimateData || !estimateData.estimate) {
    console.error('[EstimateReview] Missing estimate data:', estimateData);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Estimate Data</h1>
          <p className="text-gray-600">We couldn't load the estimate details. Please try refreshing.</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const { estimate, business, estimator } = estimateData;
  const { calculations, project_details } = estimate;

  if (!calculations || !project_details) {
    console.error('[EstimateReview] Missing calculations or project_details:', estimate);
    return <div>Missing calculation details</div>;
  }

  const handleRequestProposal = async (materialId: string) => {
    if (!leadId) {
      console.error('Lead ID not found for proposal request');
      alert('Error: Could not identify this estimate. Please try starting over.');
      return;
    }

    try {
      await apiService.requestProposal(leadId, materialId);
      setRequestedMaterials(prev => [...prev, materialId]);
    } catch (error) {
      console.error('Failed to request proposal:', error);
      alert('There was an error requesting your proposal. Please try again or contact us directly.');
    }
  };

  const calculateMaterialPrice = (material: any) => {
    const areaSqFt = calculations.roofArea || 0;
    const pricing = material.pricing || {};
    let pricePerSqFt = 0;

    switch (project_details.roofSteepness?.toLowerCase()) {
      case 'low': pricePerSqFt = parseFloat(pricing.lowPitch); break;
      case 'moderate': pricePerSqFt = parseFloat(pricing.moderatePitch); break;
      case 'steep': pricePerSqFt = parseFloat(pricing.steepPitch); break;
      default: pricePerSqFt = parseFloat(pricing.moderatePitch);
    }

    if (isNaN(pricePerSqFt)) pricePerSqFt = 0;
    return areaSqFt * pricePerSqFt;
  };

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


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 h-10 bg-black rounded flex items-center justify-center">
              <div className="text-white font-bold text-xs">
                <div className="text-xs">{business?.name || 'Business'}</div>
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
                const baseUrl = window.location.origin + window.location.pathname;
                const shareUrl = leadId ? `${baseUrl}?estimateId=${leadId}` : window.location.href;
                navigator.clipboard.writeText(shareUrl).then(() => {
                  alert('Shareable link copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy link');
                });
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Review your {estimator.materials?.length || 0} estimate{estimator.materials?.length !== 1 ? 's' : ''}
            </h1>

            {/* Estimate Cards */}
            <div className="space-y-8 mb-8">
              {(estimator.materials || []).map((material: any) => {
                const materialPrice = calculateMaterialPrice(material);
                const isRequested = requestedMaterials.includes(material.id);

                return (
                  <div key={material.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Material Image */}
                      <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-200">
                        {material.imageUrl ? (
                          <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            {material.name}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{material.name}</h3>
                            <div className="text-3xl font-bold text-gray-900">{formatPrice(materialPrice)}*</div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                          {material.materialType === 'Asphalt'
                            ? 'An asphalt shingle is a petroleum-based roof shingle that uses asphalt for waterproofing. It is one of the most widely used roofing covers in North America.'
                            : `A ${material.materialType?.toLowerCase() || 'roofing'} roof is a roofing system made from ${material.materialType?.toLowerCase() || 'quality'} pieces or tiles characterized by its high resistance, impermeability and longevity.`}
                        </p>

                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 flex items-center gap-1">
                          See more <span className="text-xs">∨</span>
                        </button>

                        {isRequested ? (
                          <div className="flex items-center gap-2 text-gray-600 font-medium py-2">
                            <Check className="w-5 h-5 text-gray-400" />
                            <span>Request received. We'll contact you shortly.</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestProposal(material.id)}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Get free proposal →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                      <div className="text-3xl font-bold">{(calculations.roofArea || 0).toLocaleString()}</div>
                      <div className="text-gray-300">Square feet</div>
                    </div>

                    <div>
                      <div className="text-3xl font-bold">{getSlopeText(project_details.roofSteepness)}</div>
                      <div className="text-gray-300">Slope</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-full h-64 bg-gray-700 rounded-lg relative overflow-hidden">
                    {propertyImage ? (
                      <img src={propertyImage} alt="Satellite View" className="w-full h-full object-cover opacity-90" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900"></div>
                    )}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-800">
                      Satellite view
                    </div>
                    {!propertyImage && (
                      <>
                        <div className="absolute bottom-2 left-2 text-xs text-white opacity-75">
                          CNES / Airbus, Maxar Technologies | Terms | Report a map error
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-20 bg-blue-500 bg-opacity-70 rounded"></div>
                      </>
                    )}
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
                  {business.logo && (
                    <img
                      src={business.logo}
                      alt="Business Logo"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{business.name || 'Business Name'}</h3>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {(business.email || business.business_email || business.representative_email) && (
                  <a
                    href={`mailto:${business.email || business.business_email || business.representative_email}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email</span>
                  </a>
                )}

                {(business.phone || business.business_phone || business.representative_phone) && (
                  <a
                    href={`tel:${business.phone || business.business_phone || business.representative_phone}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Call</span>
                  </a>
                )}
              </div>

            </div>
            {financingUrl && <div className='mt-4'>
              <a href={financingUrl} target="_blank" className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span className="font-medium">View Financing Options</span>
              </a>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateReview;