import { Marker } from 'react-map-gl';

export interface UserLocationMarkerProps {
  lat: number;
  lng: number;
  heading?: number;
  accuracy?: number;
  showAccuracyCircle?: boolean;
}

export function UserLocationMarker({
  lat,
  lng,
  heading,
}: UserLocationMarkerProps) {
  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <div className="relative">
        <div
          className="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
          style={{
            transform: heading !== undefined ? `rotate(${heading}deg)` : undefined,
          }}
        >
          {heading !== undefined && (
            <div
              className="absolute -top-1 w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '8px solid #3B82F6',
              }}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
      </div>
    </Marker>
  );
}
