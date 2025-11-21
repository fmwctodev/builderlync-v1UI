import React, { useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';

const InstantEstimateTab: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

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

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-blue-200 dark:border-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Instant Estimate</h2>
            <span className="ml-3 px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              ✨ FEATURED
            </span>
          </div>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 relative">
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
    </div>
  );
};

export default InstantEstimateTab;