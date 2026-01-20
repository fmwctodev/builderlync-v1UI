console.log('[PublicEstimator] Module loaded');
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../store/services/api';
import { ArrowLeft } from 'lucide-react';
import EstimateReview from './EstimateReview';

const PublicEstimator: React.FC = () => {
  console.log('[PublicEstimator] Component hit');
  const { publicUrl } = useParams();
  const [searchParams] = useSearchParams();
  const estimateId = searchParams.get('estimateId');
  const navigate = useNavigate();

  console.log('[PublicEstimator] Params:', { publicUrl, estimateId });
  const [estimatorData, setEstimatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showEstimateReview, setShowEstimateReview] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);
  const [showRoofOutline, setShowRoofOutline] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [propertyImage, setPropertyImage] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    roofSteepness: '',
    buildingType: '',
    currentRoof: '',
    desiredRoof: '',
    selectedMaterialId: '',
    timeline: '',
    financing: '',
    projectDetails: '',
    name: '',
    email: '',
    phone: '',
    agreeToTerms: false,
    agreeToContact: false
  });

  useEffect(() => {
    if (estimateId) {
      loadSavedEstimate(estimateId);
    } else {
      fetchEstimatorData();
    }
  }, [publicUrl, estimateId]);

  const loadSavedEstimate = async (id: string) => {
    try {
      console.log('[PublicEstimator] Loading saved estimate:', id);
      setLoading(true);
      const response = await apiService.getGeneratedEstimate(id);
      console.log('[PublicEstimator] API Response raw:', response);

      // The backend returns { success: true, data: { estimate, business, estimator } }
      // apiService returns response.data (the backend response body)
      const data = response.data || response;
      console.log('[PublicEstimator] Extracted data:', data);

      if (!data || !data.estimate) {
        console.error('[PublicEstimator] Estimate data is missing in response:', data);
        throw new Error('Estimate data is missing');
      }

      setEstimateData(data);
      setLeadId(id);

      // Also set estimatorData for consistent branding if needed
      if (data.estimator) {
        console.log('[PublicEstimator] Setting estimator data for branding:', data.estimator);
        setEstimatorData({
          ...data.estimator,
          business_logo: data.business?.logo,
          friendly_business_name: data.business?.name
        });
      }

      console.log('[PublicEstimator] Showing estimate review');
      setShowEstimateReview(true);
      setLoading(false);
    } catch (err) {
      console.error('[PublicEstimator] Failed to load estimate:', err);
      // Fallback: fetch estimator data to at least show the landing page
      fetchEstimatorData();
    }
  };

  useEffect(() => {
    if (currentStep === 2) {
      initMap();
    }
  }, [currentStep]);

  const fetchEstimatorData = async () => {
    if (!publicUrl) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimatorByPublicUrl(publicUrl);
      if (response && response.data) {
        setEstimatorData(response.data);
      } else {
        setError('Estimator not found');
      }
    } catch (error) {
      console.error('Failed to fetch estimator:', error);
      setError('Failed to load estimator');
    } finally {
      setLoading(false);
    }
  };

  // Polling function for property data
  const pollPropertyData = async (requestId: string) => {
    const MAX_RETRIES = 30; // 1 minute timeout approx (2s interval)
    let retries = 0;

    const poll = async () => {
      try {
        if (!publicUrl) return;
        const response = await apiService.getPropertyDataResult(publicUrl, requestId);
        const data = response.data || response;

        const status = (data?.status || data?.request?.status || '').toLowerCase();
        if (status === 'completed' || status === 'complete' || status === 'success' || (data?.structures && data?.structures.length > 0)) {
          console.log('Property Data Received:', data);
          setPropertyData(data);

          // Handle Image
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
          if (data?.imagery?.image_1?.image_token) {
            const token = data.imagery.image_1.image_token;
            const imageUrl = `${API_BASE_URL}/instant-estimators/public/${publicUrl}/image/${token}`;
            setPropertyImage(imageUrl);
          } else if (data?.property_images?.[0]) {
            setPropertyImage(data.property_images[0]);
          }
        } else if (data?.status === 'failed' || data?.status === 'error') {
          console.error('Property data processing failed.');
        } else {
          retries++;
          if (retries < MAX_RETRIES) {
            setTimeout(poll, 2000);
          } else {
            console.warn('Polling timeout for property data.');
          }
        }
      } catch (error) {
        console.error('Error polling property data:', error);
        retries++;
        if (retries < MAX_RETRIES) setTimeout(poll, 2000);
      }
    };

    poll();
  };

  const initMap = () => {
    if (mapRef.current && window.google) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.LEFT_CENTER
        }
      });

      if (inputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry?.location && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(place.geometry.location);
            mapInstanceRef.current.setZoom(20);
            const formattedAddress = place.formatted_address || '';
            setAddress(formattedAddress);

            if (publicUrl) {
              const staticMapUrl = 'https://maps.googleapis.com/maps/api/staticmap?center=' +
                place.geometry.location.lat() + ',' +
                place.geometry.location.lng() +
                '&zoom=20&size=600x400&maptype=satellite&key=' + import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
              setPropertyImage(staticMapUrl);

              apiService.requestPropertyData(publicUrl, formattedAddress)
                .then((response: any) => {
                  console.log('Initial Property Request Response:', response);
                  // Robust ID extraction from various possible response structures
                  const d = response.data || response;
                  const reqId = d.request?.id || d.requestId || d.RequestId || d.id || response.requestId || response.id;

                  if (reqId) {
                    setRequestId(reqId);
                    console.log('Step 2: Starting polling for Request ID:', reqId);
                    pollPropertyData(reqId);
                  } else if (response && response.data) {
                    setPropertyData(response.data);
                  } else if (response && (response.structures || response.imagery)) {
                    setPropertyData(response);
                  }
                })
                .catch((err: any) => console.error('Failed to initiate property data request', err));
            }

            setTimeout(() => {
              setShowRoofOutline(true);
            }, 1000);
          }
        });
      }
    } else if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  };

  const handleGetStarted = () => {
    setCurrentStep(2);
  };

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitEstimate = async () => {
    if (!publicUrl) return;

    try {
      setSubmitting(true);

      let currentPropertyData = propertyData;
      const effectiveRequestId = requestId || currentPropertyData?.request?.id || currentPropertyData?.id;

      if (effectiveRequestId && (!currentPropertyData || !currentPropertyData.structures || currentPropertyData.structures.length === 0)) {
        console.log('Last Step: Attempting final fetch from DB for RequestId:', effectiveRequestId);

        // Try up to 3 times with a short delay if it's still "In Progress"
        for (let i = 0; i < 3; i++) {
          try {
            const response = await apiService.getPropertyDataResult(publicUrl!, effectiveRequestId);
            const data = response.data || response;

            if (data && data.structures && data.structures.length > 0) {
              console.log('Final fetch successful on attempt', i + 1, 'data:', data);
              currentPropertyData = data;
              setPropertyData(data);
              break;
            } else {
              console.log(`Attempt ${i + 1}: Data still In Progress or incomplete...`);
              if (i < 2) await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (e) {
            console.error(`Final attempt ${i + 1} failed:`, e);
          }
        }
      }

      console.log('Submitting Estimate. Property Data Context:', {
        hasRequestId: !!effectiveRequestId,
        hasData: !!currentPropertyData,
        hasStructures: !!currentPropertyData?.structures?.length,
        status: currentPropertyData?.request?.status || currentPropertyData?.status
      });

      let calculatedRoofArea = 0;
      const structure = currentPropertyData?.structures?.[0];

      const footprintValue = structure?.structure_footprint_sqft?.value;
      const roofSquares = structure?.roof?.structure_roof_area_squares?.value || structure?.structure_roof_area_squares?.value;

      console.log('Final Area Extraction Check:', { footprintValue, roofSquares });

      if (footprintValue !== undefined && footprintValue !== null) {
        const val = typeof footprintValue === 'string' ? parseFloat(footprintValue) : Number(footprintValue);
        if (!isNaN(val) && val > 0) {
          calculatedRoofArea = val;
          console.log('Using Footprint Value (SqFt):', calculatedRoofArea);
        }
      }

      if (calculatedRoofArea <= 0 && roofSquares !== undefined && roofSquares !== null) {
        const squaresValue = typeof roofSquares === 'string' ? parseFloat(roofSquares) : Number(roofSquares);
        if (!isNaN(squaresValue) && squaresValue > 0) {
          calculatedRoofArea = squaresValue * 100;
          console.log('Using Roof Squares (Converted to SqFt):', calculatedRoofArea);
        }
      }

      console.log('Calculated Final Roof Area (SqFt):', calculatedRoofArea);

      const submitData = {
        ...formData,
        address,
        roofArea: calculatedRoofArea > 0 ? calculatedRoofArea : 2500
      };

      console.log('Sending Submit Data:', submitData);

      const response = await apiService.generateEstimate(publicUrl!, submitData);
      const data = response.data || response;
      const newLeadId = response.leadId || data?.leadId;

      console.log('Estimate generated. Lead ID:', newLeadId);

      setEstimateData(data);
      setLeadId(newLeadId);
      setShowEstimateReview(true);
      setSubmitting(false);

      // Update the URL to include the estimateId so refreshing works and share link is correct
      if (newLeadId && publicUrl) {
        navigate(`/estimator/${publicUrl}?estimateId=${newLeadId}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to generate estimate:', error);
      alert('Failed to generate estimate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showEstimateReview && estimateData) {
    return (
      <EstimateReview
        estimateData={estimateData}
        propertyImage={propertyImage}
        leadId={leadId}
        onBack={() => {
          if (estimateId) {
            navigate(`/estimator/${publicUrl}`);
          }
          setShowEstimateReview(false);
          setEstimateData(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Estimator Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Step 2 of 10</div>
            <h1 className="text-3xl font-bold text-gray-900">What's your address?</h1>
          </div>

          <div className="relative bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '500px' }}>
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your street address"
                    className="flex-1 text-lg border-none outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div ref={mapRef} className="w-full h-full" />

            {propertyImage && (
              <div className="absolute inset-0 z-0 bg-black">
                <img src={propertyImage} alt="Property Roof" className="w-full h-full object-cover opacity-80" />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 text-xs rounded">
                  Instant Estimate Imagery
                </div>
              </div>
            )}

            {showRoofOutline && (
              <div className="absolute bottom-4 right-4 z-10">
                <button
                  onClick={handleContinue}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {showRoofOutline && address && (
              <div className="absolute top-20 left-4 z-10">
                <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                  <span className="text-gray-700">{address}</span>
                  <button
                    onClick={() => {
                      setShowRoofOutline(false);
                      setAddress('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Roof Steepness
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCurrentStep(2)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 3 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How steep is your roof?</h1>
          <p className="text-gray-600 mb-8">Note: We do not currently offer flat roofing services</p>

          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'flat', title: 'Flat', desc: 'Not offered', disabled: true },
              { id: 'low', title: 'Low', desc: 'Easily walked on' },
              { id: 'moderate', title: 'Moderate', desc: 'Not easily walked on' },
              { id: 'steep', title: 'Steep', desc: "Can't be walked on" }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => !option.disabled && (setFormData({ ...formData, roofSteepness: option.id }), setCurrentStep(4))}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${option.disabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50' :
                  formData.roofSteepness === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-400 transform rotate-12"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Building Type
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setCurrentStep(3)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 4 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">What type of building do you have?</h1>

          <div className="grid grid-cols-2 gap-6">
            {[
              { id: 'residential', title: 'Residential', image: 'house' },
              { id: 'commercial', title: 'Commercial', image: 'building' }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => (setFormData({ ...formData, buildingType: option.id }), setCurrentStep(5))}
                className={`relative h-80 rounded-lg overflow-hidden cursor-pointer transition-all ${formData.buildingType === option.id ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
              >
                <div className={`w-full h-full ${option.id === 'residential' ? 'bg-gradient-to-br from-blue-200 to-blue-400' : 'bg-gradient-to-br from-gray-300 to-gray-500'
                  }`}></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white">{option.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Current Roof Material
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setCurrentStep(4)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 5 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">What is currently on your roof?</h1>

          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'asphalt', title: 'Asphalt', color: 'bg-gray-800', image: '../rooftypes/residential/asphalt-shingle.webp' },
              { id: 'metal', title: 'Metal', color: 'bg-blue-400', image: '../rooftypes/residential/metal-2.webp' },
              { id: 'tile', title: 'Tile', color: 'bg-red-600', image: '../rooftypes/residential/clay-tile.webp' },
              { id: 'cedar', title: 'Cedar', color: 'bg-amber-700', image: '../rooftypes/residential/cedar-shake.webp' }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => (setFormData({ ...formData, currentRoof: option.id }), setCurrentStep(7))}
                className={`h-64 rounded-lg overflow-hidden cursor-pointer transition-all relative ${formData.currentRoof === option.id ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
              >
                <div className={`w-full h-full`}>
                  <img src={option.image} alt="" />
                </div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-xl font-bold text-black">{option.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 6: Desired Roof Material
  if (currentStep === 6) {
    const materials = estimatorData?.materials || [];

    // Calculate estimated price if data is available
    const getEstimatedPrice = (material: any) => {
      if (!propertyData || !formData.roofSteepness) return null;

      const structure = propertyData?.structures?.[0];
      const footprintValue = structure?.structure_footprint_sqft?.value;
      const roofSquares = structure?.roof?.structure_roof_area_squares?.value || structure?.structure_roof_area_squares?.value;

      let areaSqFt = 0;
      if (footprintValue) {
        areaSqFt = typeof footprintValue === 'string' ? parseFloat(footprintValue) : Number(footprintValue);
      } else if (roofSquares) {
        areaSqFt = (typeof roofSquares === 'string' ? parseFloat(roofSquares) : Number(roofSquares)) * 100;
      }

      if (!areaSqFt || isNaN(areaSqFt)) return null;

      const pricing = material.pricing || {};
      // Map steepness to pricing key. 
      // Steepness IDs: 'low', 'moderate', 'steep'
      // Pricing keys: 'lowPitch', 'moderatePitch', 'steepPitch'
      let pricePerSqFt = 0;
      switch (formData.roofSteepness) {
        case 'low': pricePerSqFt = parseFloat(pricing.lowPitch); break;
        case 'moderate': pricePerSqFt = parseFloat(pricing.moderatePitch); break;
        case 'steep': pricePerSqFt = parseFloat(pricing.steepPitch); break;
        default: pricePerSqFt = parseFloat(pricing.moderatePitch);
      }

      if (!pricePerSqFt || isNaN(pricePerSqFt)) return null;

      const price = areaSqFt * pricePerSqFt;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    };

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setCurrentStep(5)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 6 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">What type of roof would you like?</h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {materials.length > 0 ? (
              materials.map((material: any) => {
                const estPrice = getEstimatedPrice(material);

                return (
                  <div
                    key={material.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        desiredRoof: material.materialType || 'Asphalt',
                        selectedMaterialId: material.id
                      });
                      setCurrentStep(7);
                    }}
                    className={`h-72 rounded-lg overflow-hidden cursor-pointer transition-all relative ${formData.selectedMaterialId === material.id ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                      } bg-white shadow-sm border border-gray-200`}
                  >
                    <div className="w-full h-40 bg-gray-200">
                      {material.imageUrl ? (
                        <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex flex-col justify-between h-32">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-500">{material.materialType}</p>
                      </div>
                      {estPrice && (
                        <div className="mt-2 text-blue-600 font-bold text-lg">
                          Est. {estPrice}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No materials configured for this estimator.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Timeline
  if (currentStep === 7) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCurrentStep(5)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 7 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">When would you like to start your project?</h1>

          <div className="grid grid-cols-3 gap-6">
            {[
              { id: 'no-timeline', title: 'No timeline', desc: 'I do not have a timeline in mind yet' },
              { id: '1-3-months', title: 'In 1-3 months', desc: 'Not urgent, but I would like to start soon' },
              { id: 'now', title: 'Now', desc: 'I would like to start immediately' }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => (setFormData({ ...formData, timeline: option.id }), setCurrentStep(8))}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.timeline === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{option.title}</h3>
                <p className="text-gray-600">{option.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 8: Financing
  if (currentStep === 8) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCurrentStep(7)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 8 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Are you interested in financing?</h1>

          <div className="grid grid-cols-3 gap-6">
            {[
              { id: 'yes', title: 'Yes', desc: 'I am interested in financing' },
              { id: 'no', title: 'No', desc: 'I am not interested in financing' },
              { id: 'maybe', title: 'Maybe', desc: 'I would like to learn more about financing' }
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => (setFormData({ ...formData, financing: option.id }), setCurrentStep(9))}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.financing === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{option.title}</h3>
                <p className="text-gray-600">{option.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 9: Project Details
  if (currentStep === 9) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setCurrentStep(8)} className="flex items-center gap-2 text-gray-600 mb-6">
            <ArrowLeft className="w-4 h-4" /> Step 9 of 10
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tell us about your project (optional)</h1>

          <div className="bg-white rounded-lg p-6">
            <textarea
              value={formData.projectDetails}
              onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
              placeholder="Provide any additional details which will help us prepare your roofing estimate"
              className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCurrentStep(10)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-full font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 10: Contact Information
  if (currentStep === 10) {
    return (
      <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg p-8 max-w-lg w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Where should we send your estimates?</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a><span className="text-red-500">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.agreeToContact}
                  onChange={(e) => setFormData({ ...formData, agreeToContact: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  To ensure you're getting the best offers and pricing, ROOFING LLC may need to contact you by text/call. By checking this box, you agree to these communications. Message and data rates may apply. You can reply STOP to opt-out of future messaging; reply HELP for messaging help. Message frequency may vary.
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmitEstimate}
              disabled={!formData.name || !formData.email || !formData.phone || !formData.agreeToTerms || submitting}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-full font-medium mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Generating estimate...' : 'Get my estimate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <div className="w-32 h-32 border-2 border-gray-300 transform rotate-12">
          <div className="w-full h-8 bg-gray-300 mb-2"></div>
          <div className="w-4 h-4 bg-gray-300 mb-2"></div>
          <div className="w-4 h-4 bg-gray-300"></div>
        </div>
      </div>

      <div className="absolute top-20 right-20 opacity-10">
        <div className="w-8 h-8 rounded-full bg-gray-300 mb-4"></div>
      </div>

      <div className="absolute bottom-20 right-32 opacity-10">
        <div className="w-24 h-24 border-2 border-gray-300 transform -rotate-12">
          <div className="w-full h-6 bg-gray-300 mb-2"></div>
          <div className="w-3 h-3 bg-gray-300 mb-2"></div>
          <div className="w-3 h-3 bg-gray-300"></div>
        </div>
      </div>

      <div className="absolute bottom-32 left-20 opacity-10">
        <div className="w-20 h-20 rounded-full bg-gray-300"></div>
      </div>

      <div className="absolute bottom-10 right-10 opacity-10">
        <div className="w-6 h-8 bg-gray-300"></div>
      </div>

      <div className="absolute bottom-20 left-32 opacity-10">
        <div className="w-6 h-8 bg-gray-300"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-32 h-20 mx-auto mb-4 rounded-lg flex items-center justify-center">
              {estimatorData?.business_logo && (
                <img
                  src={estimatorData.business_logo}
                  alt="Business Logo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>


          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get a <span className="underline decoration-2 underline-offset-4">free</span> instant estimate
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
            We use satellite imagery to measure your roof and provide an instant estimate for your roof replacement
          </p>

          {/* Get started button */}
          <button
            onClick={handleGetStarted}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            Get started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Powered by */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Powered by BuilderLync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEstimator;