import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../store/services/api';

const PublicEstimator: React.FC = () => {
  const { publicUrl } = useParams();
  const navigate = useNavigate();
  const [estimatorData, setEstimatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState('');
  const [showRoofOutline, setShowRoofOutline] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEstimatorData();
  }, [publicUrl]);

  useEffect(() => {
    if (currentStep === 2) {
      initMap();
    }
  }, [currentStep]);

  const fetchEstimatorData = async () => {
    if (!publicUrl) return;
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
      
      // Initialize autocomplete
      if (inputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address']
        });
        
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry?.location && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(place.geometry.location);
            mapInstanceRef.current.setZoom(20);
            setAddress(place.formatted_address || '');
            
            // Show continue button after location is selected
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
          {/* Header */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Step 2 of 10</div>
            <h1 className="text-3xl font-bold text-gray-900">What's your address?</h1>
          </div>

          {/* Map Container */}
          <div className="relative bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '500px' }}>
            {/* Address Input Overlay */}
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

            {/* Map */}
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Continue Button */}
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
            
            {/* Address Display */}
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

  if (currentStep > 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Step {currentStep} of 10</h1>
          <p className="text-gray-600">Estimator flow continues here...</p>
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
            <div className="w-32 h-20 mx-auto mb-4 bg-black rounded-lg flex items-center justify-center">
              <div className="text-white font-bold text-lg">
                {/* <div className="text-xs">TARRYTOWN</div> */}
                <div className="text-sm font-black">ROOFING</div>
                {/* <div className="text-xs font-normal">WE'VE GOT YOU COVERED</div> */}
              </div>
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