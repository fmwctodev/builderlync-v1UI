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
    brandBoard?: {
      logo_url?: string | null;
      website?: string | null;
      brand_colors?: any[];
      facebook_url?: string | null;
      instagram_url?: string | null;
      youtube_url?: string | null;
      tiktok_url?: string | null;
      twitter_url?: string | null;
      google_business_url?: string | null;
      pinterest_url?: string | null;
    } | null;
  };
  propertyImage?: string | null;
  leadId?: string | null;
  financingUrl?: string;
  onBack?: () => void;
}

const EstimateReview: React.FC<EstimateReviewProps> = ({ estimateData, propertyImage, leadId, financingUrl, onBack }) => {
  const [requestedMaterials, setRequestedMaterials] = React.useState<string[]>([]);
  console.log('[EstimateReview] Rendering with data:', estimateData);
  console.log('[EstimateReview] propertyImage:', propertyImage);


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

  const { estimate, business, estimator, brandBoard } = estimateData;
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
                  {(() => {
                    const logoUrl = brandBoard?.logo_url || business.logo;
                    return logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Business Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : null;
                  })()}
                </div>

                <h3 className="text-xl font-bold text-gray-900">{business.name || 'Business Name'}</h3>
                {brandBoard?.website && (
                  <a href={brandBoard.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {brandBoard.website}
                  </a>
                )}
              </div>

              {/* Brand Colors */}
              {brandBoard?.brand_colors && brandBoard.brand_colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2">Brand Colors</p>
                  <div className="flex gap-2 justify-center">
                    {brandBoard.brand_colors.map((colorObj: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: colorObj.color }}
                          title={colorObj.name}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Social Media Links */}
              {estimator.additional_settings?.show_social_media && brandBoard && (brandBoard.facebook_url || brandBoard.instagram_url || brandBoard.youtube_url || brandBoard.tiktok_url || brandBoard.twitter_url || brandBoard.google_business_url || brandBoard.pinterest_url) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3 text-center">Connect With Us</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {brandBoard.facebook_url && (
                      <a href={brandBoard.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      </a>
                    )}
                    {brandBoard.instagram_url && (
                      <a href={brandBoard.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                      </a>
                    )}
                    {brandBoard.youtube_url && (
                      <a href={brandBoard.youtube_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                      </a>
                    )}
                    {brandBoard.twitter_url && (
                      <a href={brandBoard.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </a>
                    )}
                    {brandBoard.tiktok_url && (
                      <a href={brandBoard.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                      </a>
                    )}
                    {brandBoard.google_business_url && (
                      <a href={brandBoard.google_business_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                      </a>
                    )}
                    {brandBoard.pinterest_url && (
                      <a href={brandBoard.pinterest_url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" /></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
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