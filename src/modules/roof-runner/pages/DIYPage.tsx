import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RotateCcw,
    RotateCw,
    Pencil,
    Grid3X3,
    Plus,
    ZoomIn,
    ZoomOut,
    Trash2,
    Undo2,
    Redo2,
    Map as MapIcon,
    Activity,
    ArrowLeft
} from 'lucide-react';

const DIYPage: React.FC = () => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const autocompleteRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [address, setAddress] = useState('');

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const isDrawingRef = useRef(false);
    const drawingVerticesRef = useRef<any[]>([]);
    const activeLineRef = useRef<any>(null);
    const labelMarkersRef = useRef<any[]>([]);
    const vertexMarkersRef = useRef<any[]>([]);
    const finalizedPolygonsRef = useRef<any[]>([]);
    const previewPolylineRef = useRef<any>(null);
    const lastClickTimeRef = useRef<number>(0);
    const previewLabelsRef = useRef<any[]>([]);
    const redoStackRef = useRef<any[]>([]); // To store undone points for redo
    const [vertexCount, setVertexCount] = useState(0); // For UI reactivity
    const [redoCount, setRedoCount] = useState(0); // For UI reactivity

    // Crosshair refs
    const crosshairHorizontalRef = useRef<any>(null);
    const crosshairVerticalRef = useRef<any>(null);
    const crosshairCenterRef = useRef<any>(null);

    useEffect(() => {
        finalizedPolygonsRef.current.forEach(p => {
            p.setOptions({ clickable: !isDrawing });
        });
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setOptions({ draggableCursor: isDrawing ? 'crosshair' : 'default' });
        }
    }, [isDrawing]);

    useEffect(() => {
        if (!window.google?.maps) {
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
            script.async = true;
            script.onload = () => initMap();
            document.head.appendChild(script);
        } else {
            initMap();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undoLastVertex();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            // Cleanup
            window.removeEventListener('keydown', handleKeyDown);
            finalizedPolygonsRef.current.forEach(p => p.setMap(null));
            labelMarkersRef.current.forEach(m => m.setMap(null));
        };
    }, []);

    const formatLength = (meters: number) => {
        const feet = meters * 3.28084;
        const wholeFeet = Math.floor(feet);
        const inches = Math.round((feet - wholeFeet) * 12);
        if (inches === 12) return `${wholeFeet + 1}ft 0in`;
        return `${wholeFeet}ft ${inches}in`;
    };

    const updateCrosshairLabel = (latLng: any, distance?: number) => {
        if (!mapInstanceRef.current) return;

        if (!crosshairHorizontalRef.current) {
            crosshairHorizontalRef.current = new window.google.maps.Polyline({
                map: mapInstanceRef.current,
                strokeColor: '#FF0000',
                strokeWeight: 1.5,
                zIndex: 1000,
                clickable: false
            });
            crosshairVerticalRef.current = new window.google.maps.Polyline({
                map: mapInstanceRef.current,
                strokeColor: '#FF0000',
                strokeWeight: 1.5,
                zIndex: 1000,
                clickable: false
            });
            const centerSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <rect x="0" y="0" width="20" height="20" fill="none" stroke="#FF0000" stroke-width="2" />
                <rect x="6" y="6" width="8" height="8" fill="white" stroke="#FF0000" stroke-width="1" />
            </svg>
        `;
            crosshairCenterRef.current = new window.google.maps.Marker({
                map: mapInstanceRef.current,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(centerSvg),
                    anchor: new window.google.maps.Point(10, 10),
                },
                clickable: true,
                optimized: false,
                zIndex: 1001
            });
            crosshairCenterRef.current.addListener('mousedown', (e: any) => {
                handleMapInteraction(e);
            });
        }

        const bounds = mapInstanceRef.current.getBounds();
        const ne = bounds ? bounds.getNorthEast() : { lat: () => latLng.lat() + 0.001, lng: () => latLng.lng() + 0.001 };
        const sw = bounds ? bounds.getSouthWest() : { lat: () => latLng.lat() - 0.001, lng: () => latLng.lng() - 0.001 };

        crosshairHorizontalRef.current.setPath([
            { lat: latLng.lat(), lng: sw.lng() },
            { lat: latLng.lat(), lng: ne.lng() }
        ]);

        crosshairVerticalRef.current.setPath([
            { lat: ne.lat(), lng: latLng.lng() },
            { lat: sw.lat(), lng: latLng.lng() }
        ]);

        crosshairCenterRef.current.setPosition(latLng);

        if (distance !== undefined) {
            const labelText = formatLength(distance);
            const labelSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="28">
                <rect x="0" y="0" width="80" height="28" rx="4" fill="black" />
                <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="13" font-weight="bold">${labelText}</text>
            </svg>
        `;

            if (crosshairCenterRef.current.labelMarker) {
                crosshairCenterRef.current.labelMarker.setPosition(latLng);
                crosshairCenterRef.current.labelMarker.setIcon({
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(labelSvg),
                    anchor: new window.google.maps.Point(-10, 20),
                });
            } else {
                crosshairCenterRef.current.labelMarker = new window.google.maps.Marker({
                    position: latLng,
                    map: mapInstanceRef.current,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(labelSvg),
                        anchor: new window.google.maps.Point(-10, 20),
                    },
                    clickable: false,
                    zIndex: 1002
                });
            }
        } else if (crosshairCenterRef.current.labelMarker) {
            crosshairCenterRef.current.labelMarker.setMap(null);
            crosshairCenterRef.current.labelMarker = null;
        }
    };

    const [totalArea, setTotalArea] = useState(0);

    const calculateTotalArea = () => {
        if (!window.google?.maps?.geometry) return;
        let area = 0;
        finalizedPolygonsRef.current.forEach(p => {
            area += window.google.maps.geometry.spherical.computeArea(p.getPath());
        });
        setTotalArea(area * 10.7639);
    };

    const updateLabels = () => {
        // Clear all labels before redrawing for consistency
        labelMarkersRef.current.forEach(m => m.setMap(null));
        labelMarkersRef.current = [];

        if (!mapInstanceRef.current) return;

        finalizedPolygonsRef.current.forEach(poly => {
            const path = poly.getPath();
            const len = path.getLength();

            for (let i = 0; i < len; i++) {
                const p1 = path.getAt(i);
                const p2 = path.getAt((i + 1) % len);
                const distance = window.google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
                const midpoint = window.google.maps.geometry.spherical.interpolate(p1, p2, 0.5);
                const labelText = formatLength(distance);

                const svg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="24">
                        <rect x="0" y="0" width="70" height="24" rx="4" fill="#000000" fill-opacity="0.8" />
                        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="11" font-weight="bold">${labelText}</text>
                    </svg>
                `;

                const marker = new window.google.maps.Marker({
                    position: midpoint,
                    map: mapInstanceRef.current,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
                        anchor: new window.google.maps.Point(35, 12),
                    },
                    clickable: false,
                    zIndex: 100
                });
                labelMarkersRef.current.push(marker);
            }
        });
    };

    const finalizeManualPolygon = () => {
        if (drawingVerticesRef.current.length < 3) return;

        const polygon = new window.google.maps.Polygon({
            paths: drawingVerticesRef.current,
            fillColor: '#51D5FF',
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeColor: '#51D5FF',
            map: mapInstanceRef.current,
            clickable: true,
            editable: true,
            zIndex: 1
        });

        finalizedPolygonsRef.current.push(polygon);
        updateLabels();
        calculateTotalArea();

        // Reset drawing state for the next polygon
        drawingVerticesRef.current = [];
        setVertexCount(0);
        redoStackRef.current = [];
        setRedoCount(0);
        vertexMarkersRef.current.forEach(m => m.setMap(null));
        vertexMarkersRef.current = [];
        if (activeLineRef.current) {
            activeLineRef.current.setMap(null);
            activeLineRef.current = null;
        }
        if (previewPolylineRef.current) {
            previewPolylineRef.current.setMap(null);
            previewPolylineRef.current = null;
        }
        previewLabelsRef.current.forEach(m => m.setMap(null));
        previewLabelsRef.current = [];

        // Listen for user edits on the polygon
        const updateHandler = () => {
            updateLabels();
            calculateTotalArea();
        };
        window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateHandler);
        window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateHandler);
        window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateHandler);
    };

    const viewOnGoogleMaps = () => {
        if (!mapInstanceRef.current) return;
        const center = mapInstanceRef.current.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        window.open(`https://www.google.com/maps/@${lat},${lng},22z/data=!3m1!1e3`, '_blank');
    };

    const viewPitch = () => {
        if (!mapInstanceRef.current) return;
        const center = mapInstanceRef.current.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        window.open(`https://app.builderlync.com/pitch/?lat=${lat}&lng=${lng}`, '_blank');
    };

    const undoLastVertex = () => {
        if (!isDrawingRef.current || drawingVerticesRef.current.length === 0) return;

        // Save for redo
        const lastVertex = drawingVerticesRef.current.pop();
        const lastMarker = vertexMarkersRef.current.pop();
        if (lastVertex && lastMarker) {
            redoStackRef.current.push({ vertex: lastVertex, marker: lastMarker });
            lastMarker.setMap(null);
        }

        setVertexCount(drawingVerticesRef.current.length);
        setRedoCount(redoStackRef.current.length);

        // Update preview line
        if (previewPolylineRef.current) {
            previewPolylineRef.current.setPath(drawingVerticesRef.current);
            if (drawingVerticesRef.current.length === 0) {
                previewPolylineRef.current.setMap(null);
                previewPolylineRef.current = null;
            }
        }

        if (drawingVerticesRef.current.length === 0 && activeLineRef.current) {
            activeLineRef.current.setMap(null);
            activeLineRef.current = null;
        }
    };

    const redoLastVertex = () => {
        if (!isDrawingRef.current || redoStackRef.current.length === 0) return;

        const lastAction = redoStackRef.current.pop();
        if (!lastAction) return;

        const { vertex, marker } = lastAction;
        drawingVerticesRef.current.push(vertex);
        marker.setMap(mapInstanceRef.current);
        vertexMarkersRef.current.push(marker);

        setVertexCount(drawingVerticesRef.current.length);
        setRedoCount(redoStackRef.current.length);

        if (!previewPolylineRef.current) {
            previewPolylineRef.current = new window.google.maps.Polyline({
                map: mapInstanceRef.current,
                strokeColor: '#51D5FF',
                strokeWeight: 2,
                zIndex: 90,
                clickable: false
            });
        }
        previewPolylineRef.current.setPath(drawingVerticesRef.current);
    };

    const handleMapInteraction = (e: any) => {
        if (!isDrawingRef.current) return;

        // Debounce slightly for better feel
        const now = Date.now();
        if (now - lastClickTimeRef.current < 80) return;
        lastClickTimeRef.current = now;

        let snappedLatLng = e.latLng;
        if (drawingVerticesRef.current.length > 0) {
            const lastVertex = drawingVerticesRef.current[drawingVerticesRef.current.length - 1];
            const projection = mapInstanceRef.current.getProjection();
            if (projection) {
                const zoom = mapInstanceRef.current.getZoom() || 20;
                const scale = Math.pow(2, zoom);
                const lastProj = projection.fromLatLngToPoint(lastVertex);
                const currProj = projection.fromLatLngToPoint(e.latLng);
                if (lastProj && currProj) {
                    const dx = Math.abs(lastProj.x - currProj.x) * scale;
                    const dy = Math.abs(lastProj.y - currProj.y) * scale;
                    if (dx < 15) snappedLatLng = new window.google.maps.LatLng(e.latLng.lat(), lastVertex.lng());
                    else if (dy < 15) snappedLatLng = new window.google.maps.LatLng(lastVertex.lat(), e.latLng.lng());
                }
            }
        }

        // Close polygon check
        if (drawingVerticesRef.current.length > 2) {
            const firstPoint = drawingVerticesRef.current[0];
            const dist = window.google.maps.geometry.spherical.computeDistanceBetween(snappedLatLng, firstPoint);
            if (dist < 2) {
                finalizeManualPolygon();
                return;
            }
        }

        drawingVerticesRef.current = [...drawingVerticesRef.current, snappedLatLng];

        if (!previewPolylineRef.current) {
            previewPolylineRef.current = new window.google.maps.Polyline({
                map: mapInstanceRef.current,
                strokeColor: '#51D5FF',
                strokeWeight: 2,
                zIndex: 90,
                clickable: false
            });
        }
        previewPolylineRef.current.setPath(drawingVerticesRef.current);

        const vertexSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="4" fill="white" stroke="gray" stroke-width="1" /></svg>`;
        const vMarker = new window.google.maps.Marker({
            position: snappedLatLng,
            map: mapInstanceRef.current,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(vertexSvg),
                anchor: new window.google.maps.Point(5, 5),
            },
            clickable: false,
            optimized: false,
            zIndex: 999
        });
        vertexMarkersRef.current.push(vMarker);
        setVertexCount(drawingVerticesRef.current.length);

        // New move clears redo stack
        redoStackRef.current = [];
        setRedoCount(0);
    };

    const initMap = () => {
        if (!mapRef.current) return;

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 4,
            mapTypeId: 'satellite',
            disableDefaultUI: true,
            clickableIcons: false,
            zoomControl: false,
            tilt: 45
        });

        // Autocomplete
        if (inputRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address']
            });

            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                if (place?.geometry?.location && mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter(place.geometry.location);
                    mapInstanceRef.current.setZoom(20);
                    mapInstanceRef.current.setTilt(45);
                    setAddress(place.formatted_address || '');

                    // Flash effect
                    setIsDrawing(true);
                    isDrawingRef.current = true;
                }
            });
        }

        // Map Mousedown (More responsive than drawing)
        mapInstanceRef.current.addListener('mousedown', handleMapInteraction);

        // Mouse Move
        mapInstanceRef.current.addListener('mousemove', (e: any) => {
            if (!isDrawingRef.current) {
                if (crosshairHorizontalRef.current) {
                    crosshairHorizontalRef.current.setMap(null);
                    crosshairHorizontalRef.current = null;
                    crosshairVerticalRef.current.setMap(null);
                    crosshairVerticalRef.current = null;
                    crosshairCenterRef.current.setMap(null);
                    crosshairCenterRef.current = null;
                }
                return;
            }

            let latLng = e.latLng;
            let distance: number | undefined;
            let isStraight = false;

            if (drawingVerticesRef.current.length > 0) {
                const lastVertex = drawingVerticesRef.current[drawingVerticesRef.current.length - 1];
                const projection = mapInstanceRef.current.getProjection();
                if (projection) {
                    const zoom = mapInstanceRef.current.getZoom() || 20;
                    const scale = Math.pow(2, zoom);
                    const lastProj = projection.fromLatLngToPoint(lastVertex);
                    const currProj = projection.fromLatLngToPoint(e.latLng);
                    if (lastProj && currProj) {
                        const dx = Math.abs(lastProj.x - currProj.x) * scale;
                        const dy = Math.abs(lastProj.y - currProj.y) * scale;
                        if (dx < 15) {
                            latLng = new window.google.maps.LatLng(e.latLng.lat(), lastVertex.lng());
                            isStraight = true;
                        } else if (dy < 15) {
                            latLng = new window.google.maps.LatLng(lastVertex.lat(), e.latLng.lng());
                            isStraight = true;
                        }
                    }
                }
                distance = window.google.maps.geometry.spherical.computeDistanceBetween(lastVertex, latLng);

                if (!activeLineRef.current) {
                    activeLineRef.current = new window.google.maps.Polyline({
                        map: mapInstanceRef.current,
                        strokeColor: '#51D5FF',
                        strokeWeight: 2,
                        zIndex: 99
                    });
                }
                if (activeLineRef.current) {
                    activeLineRef.current.setOptions({ strokeColor: isStraight ? '#FFFFFF' : '#51D5FF' });
                    activeLineRef.current.setPath([lastVertex, latLng]);
                }
            }

            updateCrosshairLabel(latLng, distance);
        });
    };

    const clearAll = () => {
        finalizedPolygonsRef.current.forEach(p => p.setMap(null));
        finalizedPolygonsRef.current = [];
        labelMarkersRef.current.forEach(m => m.setMap(null));
        labelMarkersRef.current = [];
        drawingVerticesRef.current = [];
        setVertexCount(0);
        redoStackRef.current = [];
        setRedoCount(0);
        if (previewPolylineRef.current) previewPolylineRef.current.setMap(null);
        previewPolylineRef.current = null;
        if (activeLineRef.current) activeLineRef.current.setMap(null);
        activeLineRef.current = null;
    };

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-gray-900 overflow-hidden font-sans">
            {/* Header / Search */}
            <div className="absolute top-6 left-6 right-6 z-50 flex justify-center">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex items-center gap-3 w-full max-w-4xl border border-white/20">
                    <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 flex items-center gap-1"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm font-bold">Back</span>
                        </button>
                    </div>
                    <div className="pl-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-blue-500/20">D</div>
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search address to start drawing..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg font-medium placeholder:text-gray-400 py-3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <div className="pr-2">
                        <button onClick={clearAll} className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-red-500" title="Clear All">
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <div ref={mapRef} className="w-full h-full" />

            {/* Toolbar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex items-center gap-1 border border-white/20">
                    <button
                        onClick={undoLastVertex}
                        className={`p-3 rounded-xl transition-all active:scale-95 ${vertexCount > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                        disabled={vertexCount === 0}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-6 h-6" />
                    </button>
                    <button
                        onClick={redoLastVertex}
                        className={`p-3 rounded-xl transition-all active:scale-95 ${redoCount > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'} border-r pr-5 mr-1`}
                        disabled={redoCount === 0}
                        title="Redo"
                    >
                        <Redo2 className="w-6 h-6" />
                    </button>

                    <button
                        onClick={viewOnGoogleMaps}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-95 flex items-center gap-2 px-3"
                        title="View on Google Maps"
                    >
                        <MapIcon className="w-5 h-5" />
                        <span className="text-xs font-bold whitespace-nowrap uppercase tracking-tighter">View on Map</span>
                    </button>
                    <button
                        onClick={viewPitch}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-95 border-r pr-4 mr-1 flex items-center gap-2 px-3"
                        title="View Pitch"
                    >
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-bold whitespace-nowrap uppercase tracking-tighter">View Pitch</span>
                    </button>

                    <button
                        onClick={() => {
                            if (!mapInstanceRef.current) return;
                            mapInstanceRef.current.setTilt(45);
                            const h = mapInstanceRef.current.getHeading() || 0;
                            mapInstanceRef.current.setHeading(h - 90);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-95 flex items-center gap-1 pr-3"
                        title="Rotate Left"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">L</span>
                    </button>
                    <button
                        onClick={() => {
                            if (!mapInstanceRef.current) return;
                            mapInstanceRef.current.setTilt(45);
                            const h = mapInstanceRef.current.getHeading() || 0;
                            mapInstanceRef.current.setHeading(h + 90);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-95 flex items-center gap-1 pr-3 border-r"
                        title="Rotate Right"
                    >
                        <RotateCw className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">R</span>
                    </button>

                    <button
                        onClick={() => {
                            setIsDrawing(!isDrawing);
                            isDrawingRef.current = !isDrawing;
                        }}
                        className={`p-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${isDrawing ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-100 text-gray-600'}`}
                        title="Draw Mode"
                    >
                        <Pencil className="w-6 h-6" />
                        {isDrawing && <span className="text-sm font-bold pr-1">Active</span>}
                    </button>

                    <button className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-all cursor-not-allowed" title="Grid"><Grid3X3 className="w-6 h-6" /></button>
                    <button className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-all cursor-not-allowed" title="Add Layer"><Plus className="w-6 h-6" /></button>

                    <div className="w-px h-8 bg-gray-200 mx-2" />

                    <button
                        onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current?.getZoom() || 0) + 1)}
                        className="p-3 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-95"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => mapInstanceRef.current?.setZoom((mapInstanceRef.current?.getZoom() || 0) - 1)}
                        className="p-3 hover:bg-gray-100 rounded-xl text-gray-600 transition-all active:scale-95"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Floating Indicators */}
            <div className="absolute top-28 left-6 z-50 flex flex-col gap-4">
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 text-white min-w-[200px]">
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isDrawing ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="font-bold">{isDrawing ? 'READY TO DRAW' : 'IDLE - START DRAWING'}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-end">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Measurement</div>
                            <div className="text-2xl font-black text-blue-400">{totalArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold text-white/60">SQFT</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .gm-style-cc { display: none !important; }
        a[href^="https://maps.google.com/maps"] { display: none !important; }
        a[href^="https://www.google.com/maps"] { display: none !important; }
        .gmnoprint a, .gmnoprint span, .gm-style-cc { display:none; }
        .gmnoprint div { background:none !important; }
      `}} />
        </div>
    );
};

export default DIYPage;
