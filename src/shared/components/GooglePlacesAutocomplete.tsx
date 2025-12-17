import { useEffect, useRef, useState } from 'react';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (address: string, isFromAutocomplete: boolean, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  description: string;
  place_id: string;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter address",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        serviceRef.current = new window.google.maps.places.AutocompleteService();
        return;
      }

      window.initGooglePlaces = () => {
        setIsLoaded(true);
        serviceRef.current = new window.google.maps.places.AutocompleteService();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGooglePlaces`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue, false);
    
    if (inputValue.length > 2 && isLoaded && serviceRef.current) {
      const allSuggestions: Suggestion[] = [];
      
      // Get city predictions
      serviceRef.current.getPlacePredictions(
        {
          input: inputValue,
          types: ['(cities)']
        },
        (cityPredictions: Suggestion[] | null) => {
          if (cityPredictions) {
            allSuggestions.push(...cityPredictions);
          }
          
          // Get address predictions
          serviceRef.current.getPlacePredictions(
            {
              input: inputValue,
              types: ['address']
            },
            (addressPredictions: Suggestion[] | null) => {
              if (addressPredictions) {
                allSuggestions.push(...addressPredictions);
              }
              
              setSuggestions(allSuggestions);
              setShowSuggestions(true);
            }
          );
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    }

    placesServiceRef.current.getDetails(
      { placeId: suggestion.place_id },
      (place: any) => {
        if (place && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onChange(suggestion.description, true, lat, lng);
          setShowSuggestions(false);
        }
      }
    );
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
            >
              {suggestion.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;