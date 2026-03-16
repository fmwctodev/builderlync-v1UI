import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Loader } from 'lucide-react';

const render = (status: Status) => {
    if (status === Status.LOADING) return <div className="flex items-center justify-center h-screen bg-gray-900"><Loader className="w-8 h-8 text-blue-500 animate-spin" /></div>;
    if (status === Status.FAILURE) return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">Error loading maps</div>;
    return <></>;
};

const PitchMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [panic, setPanic] = useState(false);

    useEffect(() => {
        if (ref.current) {
            const panorama = new google.maps.StreetViewPanorama(ref.current, {
                position: { lat, lng },
                pov: { heading: 165, pitch: 0 },
                addressControl: false,
                linksControl: false,
                panControl: false,
                enableCloseButton: false,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM,
                },
                fullscreenControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                },
                motionTracking: false,
                motionTrackingControl: false,
            });

            // Optional: Log errors if panorama fails to load at location
            panorama.addListener('status_changed', () => {
                if (panorama.getStatus() !== google.maps.StreetViewStatus.OK) {
                    console.warn('Street View not available at this location');
                }
            });
        }
    }, [lat, lng]);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div ref={ref} className="w-full h-full" />

            {/* Pitch Gauge Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-8">
                <img
                    src="/pitch-gauge.png"
                    alt="Pitch Gauge"
                    id="guage"
                    className="max-w-full max-h-full w-auto h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] opacity-90 brightness-200 "
                />
            </div>

            {/* Instructions Overlay */}
            {/* <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white z-20 pointer-events-none">
                <h1 className="text-lg font-bold mb-1">Pitch Tool</h1>
                <p className="text-sm text-gray-300">Drag to align roofline with gauge</p>
            </div> */}

            {/* Coords Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-400 z-20 pointer-events-none">
                {lat.toFixed(6)}, {lng.toFixed(6)}
            </div>
        </div>
    );
};

export const PitchTool: React.FC = () => {
    const [searchParams] = useSearchParams();
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    const lat = latStr ? parseFloat(latStr) : 44.4865406;
    const lng = lngStr ? parseFloat(lngStr) : -73.2061618;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    return (
        <Wrapper apiKey={apiKey} render={render}>
            <PitchMap lat={lat} lng={lng} />
        </Wrapper>
    );
};

export default PitchTool;
