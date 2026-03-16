import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    ArrowLeft,
    ChevronRight,
    XCircle,
    MoreVertical,
    Save,
    Loader2,
    Download
} from 'lucide-react';
import { diyApi } from '../../../shared/services/diyApi';
import axios from 'axios';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const EDGE_TYPES: Record<string, { color: string; name: string; dashed?: boolean }> = {
    'Eaves': { color: '#88C189', name: 'Eaves' },
    'Ridges': { color: '#DFF2B8', name: 'Ridges' },
    'Step flashing': { color: '#AF6A39', name: 'Step flashing' },
    'Unspecified': { color: '#6AC4F4', name: 'Unspecified' },
    'Valleys': { color: '#F46A4A', name: 'Valleys' },
    'Rakes': { color: '#F4C139', name: 'Rakes' },
    'Transitions': { color: '#F46AF4', name: 'Transitions' },
    'Hips': { color: '#9989C1', name: 'Hips' },
    'Wall flashing': { color: '#3989C4', name: 'Wall flashing', dashed: true },
    'Parapet wall': { color: '#F49F39', name: 'Parapet wall' }
};

const FACET_LABELS = ['Dormer', 'Two story', 'Two layer', 'Flat roof'];
const PITCH_VALUES = ['0/12', '1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'];

const DIYPage: React.FC = () => {
    const navigate = useNavigate();
    const { orgSlug } = useParams();
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
    const [activeTab, setActiveTab] = useState<'Draw' | 'Edges' | 'Facets'>('Draw');
    const [selectedEdgeType, setSelectedEdgeType] = useState<string>('Eaves');
    const [selectedFacetLabel, setSelectedFacetLabel] = useState<string | null>(null);
    const [selectedPitch, setSelectedPitch] = useState<string | null>(null);

    // Layer state
    const [layers, setLayers] = useState<string[]>(['A']);
    const [activeLayer, setActiveLayer] = useState('A');

    // UI state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isInitialListOpen, setIsInitialListOpen] = useState(true);
    const [savedProjects, setSavedProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
    const [isMarkAsDoneEnabled, setIsMarkAsDoneEnabled] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [businessInfo, setBusinessInfo] = useState<any>(null);
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['Draw']));
    const visitedTabsRef = useRef<Set<string>>(new Set(['Draw']));
    const [reportImages, setReportImages] = useState<{ birdseye: string; facets: string; edges: string }>({
        birdseye: '',
        facets: '',
        edges: ''
    });

    const getStaticMapUrl = (mode: 'facets' | 'edges' | 'birdseye') => {
        if (!mapInstanceRef.current || !window.google?.maps) return '';
        const center = mapInstanceRef.current.getCenter();
        const zoom = mapInstanceRef.current.getZoom();
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        let url = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat()},${center.lng()}&zoom=${zoom}&size=800x500&maptype=satellite&key=${apiKey}`;

        if (mode === 'facets' || mode === 'birdseye') {
            finalizedPolygonsRef.current.forEach((p, idx) => {
                const path = p.polygon.getPath();
                const points: string[] = [];
                path.forEach((latLng: any) => points.push(`${latLng.lat()},${latLng.lng()}`));
                if (points.length > 0) {
                    points.push(points[0]);
                    url += `&path=color:0xffffffff|weight:2|fillcolor:0x3b82f680|${points.join('|')}`;
                }

                if (mode === 'facets') {
                    const bounds = new window.google.maps.LatLngBounds();
                    path.forEach((pt: any) => bounds.extend(pt));
                    const centroid = bounds.getCenter();
                    url += `&markers=label:${idx + 1}|${centroid.lat()},${centroid.lng()}`;
                }
            });
        }

        if (mode === 'edges') {
            finalizedPolygonsRef.current.forEach(p => {
                p.edges.forEach((edge: any) => {
                    const rawColor = edge.get('strokeColor') || '#ffffff';
                    const color = rawColor.startsWith('#') ? '0x' + rawColor.substring(1) + 'ff' : rawColor;
                    const path = edge.getPath();
                    if (path.getLength() >= 2) {
                        url += `&path=color:${color}|weight:3|${path.getAt(0).lat()},${path.getAt(0).lng()}|${path.getAt(1).lat()},${path.getAt(1).lng()}`;
                    }
                });
            });
        }

        return url;
    };

    useEffect(() => {
        visitedTabsRef.current = visitedTabs;
    }, [visitedTabs]);

    useEffect(() => {
        const fetchBusinessInfo = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api'}/business-info`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setBusinessInfo(response.data.data);
            } catch (error) {
                console.error('Failed to fetch business info:', error);
            }
        };
        fetchBusinessInfo();
    }, []);

    const checkCompletion = () => {
        if (!finalizedPolygonsRef.current || finalizedPolygonsRef.current.length === 0) {
            setIsMarkAsDoneEnabled(false);
            return;
        }

        const isComplete = finalizedPolygonsRef.current.every(p => {
            // Check label and pitch
            const hasLabel = !!p.label && p.label !== '';
            const hasPitch = !!p.pitch && p.pitch !== '';

            // Check edges
            const hasEdges = p.edges && p.edges.length > 0;
            const hasUnspecified = p.edges?.some((e: any) => {
                const color = e.get('strokeColor')?.toLowerCase() || '';
                // Standardize to 6-digit hex for comparison if necessary, but Google usually returns what's set.
                // However, let's be safe.
                const typeEntry = Object.entries(EDGE_TYPES).find(([_, v]) => v.color.toLowerCase() === color);
                return !typeEntry || typeEntry[0] === 'Unspecified';
            });

            return hasLabel && hasPitch && hasEdges && !hasUnspecified;
        });

        const currentVisitedSize = visitedTabsRef.current.size;
        setIsMarkAsDoneEnabled(prev => prev || isComplete || (currentVisitedSize >= 3 && finalizedPolygonsRef.current.length > 0));
    };

    useEffect(() => {
        if (visitedTabs.size >= 3) {
            checkCompletion();
        }
    }, [visitedTabs]);

    useEffect(() => {
        if (!isInitialListOpen) {
            const interval = setInterval(checkCompletion, 1000);
            return () => clearInterval(interval);
        }
    }, [isInitialListOpen]);

    useEffect(() => {
        if (isInitialListOpen && orgSlug) {
            fetchProjects();
        }
    }, [isInitialListOpen, orgSlug]);

    const fetchProjects = async () => {
        if (!orgSlug) return;
        setIsLoading(true);
        try {
            const data = await diyApi.getAllProjects(orgSlug);
            setSavedProjects(data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProject = async (project: any) => {
        setIsInitialListOpen(false);
        setCurrentProjectId(project.id);
        const projectData = project.data;
        if (projectData.layers) setLayers(projectData.layers);
        if (projectData.totalArea) setTotalArea(projectData.totalArea);
        if (project.address) setAddress(project.address);
        finalizedPolygonsRef.current = []; // Clear existing polygons before loading new ones

        if (project.status === 'Ready') {
            setShowReport(true);
        }

        // We need to wait for map to be ready
        const checkMap = setInterval(() => {
            if (mapInstanceRef.current && window.google) {
                clearInterval(checkMap);

                // Set map center
                if (projectData.polygons?.[0]?.path?.[0]) {
                    mapInstanceRef.current.setCenter(projectData.polygons[0].path[0]);
                    mapInstanceRef.current.setZoom(20);
                }

                projectData.polygons.forEach((pData: any) => {
                    const polygon = new window.google.maps.Polygon({
                        paths: pData.path,
                        fillColor: (pData.label || pData.pitch) ? '#3B82F6' : '#51D5FF',
                        fillOpacity: (pData.label || pData.pitch) ? 0.4 : 0.2,
                        strokeWeight: 1,
                        strokeColor: '#51D5FF',
                        strokeOpacity: 0.3,
                        map: mapInstanceRef.current,
                        clickable: true,
                        editable: true,
                    });

                    const edgeLines: any[] = [];
                    for (let i = 0; i < pData.path.length; i++) {
                        const start = pData.path[i];
                        const end = pData.path[(i + 1) % pData.path.length];
                        const edgeTypeKey = pData.edgeTypes?.[i] || 'Unspecified';
                        const type = EDGE_TYPES[edgeTypeKey];

                        const edgeLine = new window.google.maps.Polyline({
                            path: [start, end],
                            map: mapInstanceRef.current,
                            strokeColor: type.color,
                            strokeWeight: 5,
                            zIndex: 10,
                            clickable: true
                        });

                        // Re-add edge listeners
                        addEdgeListeners(edgeLine);
                        edgeLines.push(edgeLine);
                    }

                    addPolygonListeners(polygon);
                    finalizedPolygonsRef.current.push({
                        polygon,
                        edges: edgeLines,
                        layer: pData.layer,
                        label: pData.label,
                        pitch: pData.pitch
                    });
                });
                updateLabels();
                checkCompletion();
            }
        }, 100);
    };

    const addEdgeListeners = (edgeLine: any) => {
        edgeLine.addListener('click', () => {
            if (activeTabRef.current === 'Edges') {
                const type = EDGE_TYPES[selectedEdgeTypeRef.current];
                edgeLine.setOptions({
                    strokeColor: type.color,
                    strokeWeight: 5
                });
                checkCompletion();
            }
        });
        edgeLine.addListener('mouseover', () => {
            if (activeTabRef.current === 'Edges') {
                edgeLine.setOptions({ strokeWeight: 8 });
            }
        });
        edgeLine.addListener('mouseout', () => {
            if (activeTabRef.current === 'Edges') {
                edgeLine.setOptions({ strokeWeight: 5 });
            }
        });
    };

    const addPolygonListeners = (polygon: any) => {
        polygon.addListener('click', () => {
            if (activeTabRef.current === 'Facets') {
                const polyObj = finalizedPolygonsRef.current.find(o => o.polygon === polygon);
                if (polyObj) {
                    const currentLabel = selectedFacetLabelRef.current;
                    const currentPitch = selectedPitchRef.current;

                    if (currentLabel) {
                        polyObj.label = polyObj.label === currentLabel ? null : currentLabel;
                    }
                    if (currentPitch) {
                        polyObj.pitch = polyObj.pitch === currentPitch ? null : currentPitch;
                    }

                    if (polyObj.label || polyObj.pitch) {
                        polygon.setOptions({
                            fillColor: '#3B82F6',
                            fillOpacity: 0.4
                        });
                    } else {
                        polygon.setOptions({
                            fillColor: '#51D5FF',
                            fillOpacity: 0.2
                        });
                    }
                    updateLabels();
                    checkCompletion();
                }
            }
        });

        const updateHandler = () => {
            updateLabels();
            calculateTotalArea();
            const polyObj = finalizedPolygonsRef.current.find(o => o.polygon === polygon);
            if (polyObj) {
                const newPath = polygon.getPath().getArray();
                polyObj.edges.forEach((line: any, idx: number) => {
                    if (line && typeof line.setPath === 'function') {
                        const s = newPath[idx];
                        const e = newPath[(idx + 1) % newPath.length];
                        line.setPath([s, e]);
                    }
                });
                checkCompletion();
            }
        };
        window.google.maps.event.addListener(polygon.getPath(), 'set_at', updateHandler);
        window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updateHandler);
        window.google.maps.event.addListener(polygon.getPath(), 'remove_at', updateHandler);
    };

    const addLayer = () => {
        const nextLetter = String.fromCharCode(65 + layers.length);
        if (layers.length < 26) {
            setLayers([...layers, nextLetter]);
            setActiveLayer(nextLetter);
        }
    };

    const moveLayer = (direction: 'up' | 'down') => {
        const idx = layers.indexOf(activeLayer);
        if (direction === 'up' && idx > 0) {
            const newLayers = [...layers];
            [newLayers[idx], newLayers[idx - 1]] = [newLayers[idx - 1], newLayers[idx]];
            setLayers(newLayers);
        } else if (direction === 'down' && idx < layers.length - 1) {
            const newLayers = [...layers];
            [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
            setLayers(newLayers);
        }
    };

    // Crosshair refs
    const crosshairHorizontalRef = useRef<any>(null);
    const crosshairVerticalRef = useRef<any>(null);
    const crosshairCenterRef = useRef<any>(null);

    // Refs for listeners to access latest state
    const activeTabRef = useRef(activeTab);
    const selectedEdgeTypeRef = useRef(selectedEdgeType);
    const selectedFacetLabelRef = useRef(selectedFacetLabel);
    const selectedPitchRef = useRef(selectedPitch);

    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
    useEffect(() => { selectedEdgeTypeRef.current = selectedEdgeType; }, [selectedEdgeType]);
    useEffect(() => { selectedFacetLabelRef.current = selectedFacetLabel; }, [selectedFacetLabel]);
    useEffect(() => { selectedPitchRef.current = selectedPitch; }, [selectedPitch]);

    useEffect(() => {
        finalizedPolygonsRef.current.forEach(polyObj => {
            if (polyObj.polygon) {
                polyObj.polygon.setOptions({ clickable: !isDrawing });
            }
        });
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setOptions({ draggableCursor: isDrawing ? 'crosshair' : 'default' });
        }
    }, [isDrawing]);

    useEffect(() => {
        if (!isInitialListOpen) {
            if (!window.google?.maps) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry`;
                script.async = true;
                script.onload = () => initMap();
                document.head.appendChild(script);
            } else if (!mapInstanceRef.current) {
                initMap();
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undoLastVertex();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isInitialListOpen]);

    useEffect(() => {
        finalizedPolygonsRef.current.forEach(polyObj => {
            if (polyObj.polygon) {
                polyObj.polygon.setOptions({ clickable: activeTab !== 'Draw' });
            }
            if (polyObj.edges) {
                polyObj.edges.forEach((edge: any) => {
                    if (edge && typeof edge.setOptions === 'function') {
                        edge.setOptions({ clickable: activeTab === 'Edges' });
                    }
                });
            }
        });
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setOptions({ draggableCursor: activeTab === 'Draw' ? 'crosshair' : 'default' });
        }
    }, [activeTab]);

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
        finalizedPolygonsRef.current.forEach(polyObj => {
            if (polyObj.polygon && typeof polyObj.polygon.getPath === 'function') {
                area += window.google.maps.geometry.spherical.computeArea(polyObj.polygon.getPath());
            }
        });
        setTotalArea(area * 10.7639);
    };

    const updateLabels = () => {
        // Clear all labels before redrawing for consistency
        labelMarkersRef.current.forEach(m => m.setMap(null));
        labelMarkersRef.current = [];

        if (!mapInstanceRef.current) return;

        finalizedPolygonsRef.current.forEach(obj => {
            const poly = obj.polygon;
            if (!poly) return;
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

            // Also draw Facet/Pitch labels if present
            if (obj.label || obj.pitch) {
                const polygonPath = poly.getPath();
                let bounds = new window.google.maps.LatLngBounds();
                polygonPath.forEach((p: any) => bounds.extend(p));
                const center = bounds.getCenter();

                const labelText = `${obj.label || ''} ${obj.pitch || ''}`.trim();
                const facetSvg = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="30">
                        <rect x="0" y="0" width="100" height="30" rx="15" fill="#3B82F6" />
                        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="900">${labelText}</text>
                    </svg>
                `;

                const facetMarker = new window.google.maps.Marker({
                    position: center,
                    map: mapInstanceRef.current,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(facetSvg),
                        anchor: new window.google.maps.Point(50, 15),
                    },
                    clickable: false,
                    zIndex: 101
                });
                labelMarkersRef.current.push(facetMarker);
            }
        });
    };

    const finalizeManualPolygon = () => {
        if (drawingVerticesRef.current.length < 3) return;

        const path = [...drawingVerticesRef.current];
        const polygon = new window.google.maps.Polygon({
            paths: path,
            fillColor: '#51D5FF',
            fillOpacity: 0.2,
            strokeWeight: 1,
            strokeColor: '#51D5FF',
            strokeOpacity: 0.3,
            map: mapInstanceRef.current,
            clickable: true,
            editable: true,
            zIndex: 1
        });

        // Create individual interactive edge lines
        const edgeLines: any[] = [];
        for (let i = 0; i < path.length; i++) {
            const start = path[i];
            const end = path[(i + 1) % path.length];

            const edgeLine = new window.google.maps.Polyline({
                path: [start, end],
                map: mapInstanceRef.current,
                strokeColor: '#FFFFFF',
                strokeWeight: 4,
                zIndex: 10,
                clickable: true
            });

            edgeLines.push(edgeLine);
            addEdgeListeners(edgeLine);
        }

        addPolygonListeners(polygon);

        finalizedPolygonsRef.current.push({ polygon, edges: edgeLines, layer: activeLayer, label: null, pitch: null });
        updateLabels();
        calculateTotalArea();
        checkCompletion();

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

        // Close polygon check - increased distance for better feel
        if (drawingVerticesRef.current.length > 2) {
            const firstPoint = drawingVerticesRef.current[0];
            const dist = window.google.maps.geometry.spherical.computeDistanceBetween(snappedLatLng, firstPoint);
            if (dist < 4) { // Increased from 2 to 4 meters
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
            cursor: drawingVerticesRef.current.length === 0 ? 'pointer' : 'crosshair',
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
            } else {
                // EXPLICIT CLEANUP for ghost lines when length is 0
                if (activeLineRef.current) {
                    activeLineRef.current.setMap(null);
                    activeLineRef.current = null;
                }
                if (previewPolylineRef.current) {
                    previewPolylineRef.current.setMap(null);
                    previewPolylineRef.current = null;
                }
            }

            updateCrosshairLabel(latLng, distance);
        });
    };

    const clearAll = () => {
        finalizedPolygonsRef.current.forEach(obj => {
            if (obj.polygon) obj.polygon.setMap(null);
            if (obj.edges) obj.edges.forEach((e: any) => e.setMap(null));
        });
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
        setTotalArea(0);
    };

    const saveProject = async (exit: boolean = false, status: string = 'Draft') => {
        if (!orgSlug) {
            alert('Organization slug is missing');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                id: currentProjectId,
                organization_id: orgSlug,
                address,
                total_area: totalArea,
                status,
                data: {
                    polygons: finalizedPolygonsRef.current.map(p => ({
                        path: p.polygon.getPath().getArray().map((l: any) => ({ lat: l.lat(), lng: l.lng() })),
                        layer: p.layer,
                        label: p.label,
                        pitch: p.pitch,
                        edgeTypes: p.edges.map((e: any) => {
                            const color = e.get('strokeColor')?.toLowerCase();
                            const typeEntry = Object.entries(EDGE_TYPES).find(([_, v]) => v.color.toLowerCase() === color);
                            return typeEntry ? typeEntry[0] : 'Unspecified';
                        })
                    })),
                    layers,
                    totalArea
                }
            };

            const saved = await diyApi.saveProject(payload);
            if (!currentProjectId) setCurrentProjectId(saved.id);

            setIsMenuOpen(false);
            if (exit) {
                clearAll();
                setIsInitialListOpen(true);
            }
        } catch (error) {
            console.error('Failed to save project:', error);
            alert('Failed to save project');
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitialListOpen) {
        return (
            <div className="flex flex-col h-full bg-gray-50 p-8 items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Roof DIY Designs</h2>
                            <p className="text-gray-500 font-medium">Select an existing design or create a new one</p>
                        </div>
                        <button
                            onClick={() => {
                                clearAll();
                                setCurrentProjectId(null);
                                setIsInitialListOpen(false);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create New DIY
                        </button>
                    </div>

                    <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading designs...</span>
                            </div>
                        ) : savedProjects.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-center">
                                <div className="p-4 bg-gray-50 rounded-full">
                                    <MapIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">No designs found</div>
                                    <div className="text-sm text-gray-400">Start by creating your first roof drawing</div>
                                </div>
                            </div>
                        ) : (
                            savedProjects.map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => loadProject(project)}
                                    className="group bg-gray-50 hover:bg-white hover:shadow-xl hover:ring-2 hover:ring-blue-100 p-5 rounded-2xl border border-gray-100 cursor-pointer transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <MapIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[300px]">{project.address || 'Untitled Drawing'}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-gray-900">
                                            {project.total_area ? project.total_area.toLocaleString() : 0}
                                            <span className="text-xs text-gray-400 ml-1">SQFT</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            {project.status === 'Ready' && (
                                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">READY</span>
                                            )}
                                            <div className="text-xs font-bold text-blue-500 uppercase tracking-tighter">
                                                {project.status === 'Ready' ? 'View Report' : 'Resume Design'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-900 overflow-hidden font-sans -m-6 relative">
            {showReport ? (
                <div className="flex-1 bg-white overflow-y-auto">
                    <ReportPreview
                        project={{
                            address,
                            total_area: totalArea,
                            images: reportImages,
                            polygons: finalizedPolygonsRef.current.map(p => ({
                                label: p.label,
                                pitch: p.pitch,
                                edgeTypes: p.edges.map((e: any) => {
                                    const color = e.get('strokeColor')?.toLowerCase();
                                    const typeEntry = Object.entries(EDGE_TYPES).find(([_, v]) => v.color.toLowerCase() === color);
                                    return typeEntry ? typeEntry[0] : 'Unspecified';
                                }),
                                edgeLengths: p.edges.map((e: any) => {
                                    const path = e.getPath();
                                    return window.google.maps.geometry.spherical.computeDistanceBetween(path.getAt(0), path.getAt(1));
                                }),
                                areaSqft: window.google.maps.geometry.spherical.computeArea(p.polygon.getPath()) * 10.7639
                            }))
                        }}
                        businessInfo={businessInfo}
                        onBack={() => setShowReport(false)}
                    />
                </div>
            ) : (
                <>
                    {/* NEW TOP HEADER TABS */}
                    <div className="z-[100] bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shadow-md flex-shrink-0">
                        <div className="flex items-center gap-6 h-full">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors group"
                            >
                                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                                <span className="text-sm font-bold">Back</span>
                            </button>

                            <div className="w-px h-8 bg-gray-200 mx-2" />

                            {/* Primary Tool Switcher */}
                            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                                <button
                                    onClick={() => {
                                        setActiveTab('Draw');
                                        setIsDrawing(true);
                                        isDrawingRef.current = true;
                                        setVisitedTabs(prev => new Set([...prev, 'Draw']));
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'Draw' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Draw
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('Edges');
                                        setIsDrawing(false);
                                        isDrawingRef.current = false;
                                        setVisitedTabs(prev => new Set([...prev, 'Edges']));
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'Edges' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Activity className="w-4 h-4" />
                                    Edges
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('Facets');
                                        setIsDrawing(false);
                                        isDrawingRef.current = false;
                                        setVisitedTabs(prev => new Set([...prev, 'Facets']));
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'Facets' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                    Facets
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 max-w-xl mx-8 flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                            <span className="text-gray-400 text-sm">📍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search address..."
                                className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full px-2"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5">
                                <button
                                    onClick={undoLastVertex}
                                    disabled={vertexCount === 0}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${vertexCount > 0 ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300'}`}
                                >
                                    Undo
                                </button>
                                <div className="w-px h-4 bg-gray-200" />
                                <button
                                    onClick={redoLastVertex}
                                    disabled={redoCount === 0}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${redoCount > 0 ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300'}`}
                                >
                                    Redo
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end">
                                    <button
                                        onClick={() => {
                                            if (isMarkAsDoneEnabled) {
                                                const birdseye = getStaticMapUrl('birdseye');
                                                const facets = getStaticMapUrl('facets');
                                                const edges = getStaticMapUrl('edges');
                                                setReportImages({ birdseye, facets, edges });

                                                saveProject(false, 'Ready');
                                                setShowReport(true);
                                            }
                                        }}
                                        disabled={!isMarkAsDoneEnabled}
                                        className={`${isMarkAsDoneEnabled ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-gray-300 cursor-not-allowed'} text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95 whitespace-nowrap`}
                                    >
                                        Mark as done
                                    </button>
                                    {!isMarkAsDoneEnabled && !isInitialListOpen && finalizedPolygonsRef.current.length > 0 && (
                                        <span className="text-[10px] text-orange-500 font-bold mt-1 animate-pulse">
                                            Finish Edges & Facets to enable
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors border border-gray-200"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden py-1">
                                            <button
                                                onClick={() => saveProject(false, 'Draft')}
                                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4 text-blue-500" />
                                                Save
                                            </button>
                                            <button
                                                onClick={() => saveProject(true, 'Draft')}
                                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <ArrowLeft className="w-4 h-4 text-orange-500" />
                                                Save & exit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative overflow-hidden h-full">
                        {/* Background Map layer first */}
                        <div ref={mapRef} className="absolute inset-0 z-0" />

                        {/* LEFT SIDEBAR - LAYERS */}
                        <div className="absolute left-6 top-10 z-[60] pointer-events-none">
                            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden w-24 pointer-events-auto">
                                <div className="p-3 text-[10px] uppercase tracking-widest font-black text-gray-400 text-center border-b border-gray-50">Layers</div>
                                <button
                                    onClick={addLayer}
                                    className="w-full py-4 flex flex-col items-center gap-1 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
                                >
                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </button>
                                {layers.map(layer => (
                                    <button
                                        key={layer}
                                        onClick={() => setActiveLayer(layer)}
                                        className={`w-full py-4 flex flex-col items-center gap-1 border-b transition-all ${activeLayer === layer ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50 border-gray-50'}`}
                                    >
                                        <span className={`text-sm font-black ${activeLayer === layer ? 'text-blue-600' : 'text-gray-400'}`}>{layer}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => moveLayer('up')}
                                    className="w-full py-3 flex flex-col items-center gap-1 hover:bg-gray-50 transition-colors text-gray-500 border-b border-gray-50"
                                >
                                    <span className="text-[10px] font-bold">Up</span>
                                </button>
                                <button
                                    onClick={() => moveLayer('down')}
                                    className="w-full py-3 flex flex-col items-center gap-1 hover:bg-gray-50 transition-colors text-gray-500"
                                >
                                    <span className="text-[10px] font-bold">Down</span>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT SIDEBAR - TOOLS */}
                        {activeTab !== 'Draw' && (
                            <div className="absolute right-6 top-10 z-[60] w-64 max-h-[calc(100vh-160px)] overflow-y-auto pointer-events-none">
                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col pointer-events-auto">
                                    <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
                                        <h3 className="font-black text-gray-800 text-sm tracking-tight">
                                            {activeTab === 'Edges' ? 'Edges tools' : 'Facets tools'}
                                        </h3>
                                        <button className="p-1.5 hover:bg-white rounded-full transition-colors shadow-sm">
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="p-3 flex flex-col gap-1">
                                        {activeTab === 'Edges' ? (
                                            <>
                                                {Object.entries(EDGE_TYPES).map(([key, value]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setSelectedEdgeType(key)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${selectedEdgeType === key ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-8 h-1 rounded-full ${value.dashed ? 'border-t-2 border-dashed' : ''}`}
                                                            style={{
                                                                backgroundColor: value.dashed ? 'transparent' : value.color,
                                                                borderColor: value.dashed ? value.color : 'transparent'
                                                            }}
                                                        />
                                                        <span className={`text-[13px] font-bold ${selectedEdgeType === key ? 'text-blue-700' : 'text-gray-600'}`}>
                                                            {value.name}
                                                        </span>
                                                    </button>
                                                ))}
                                                <div className="h-px bg-gray-100 my-2" />
                                                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 group transition-colors">
                                                    <XCircle className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                    <span className="text-[13px] font-bold text-gray-600 group-hover:text-red-600">Delete edge</span>
                                                </button>
                                                <button onClick={clearAll} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 group transition-colors">
                                                    <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                    <span className="text-[13px] font-bold text-gray-600 group-hover:text-red-600">Delete all edges</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 group">
                                                    <XCircle className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                    <span className="text-[13px] font-bold text-gray-600">Delete facet</span>
                                                </button>
                                                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 group">
                                                    <XCircle className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                    <span className="text-[13px] font-bold text-gray-600">Delete pitch</span>
                                                </button>
                                                <button onClick={clearAll} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 group mb-4">
                                                    <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                                                    <span className="text-[13px] font-bold text-gray-600">Delete all pitches</span>
                                                </button>

                                                <div className="px-3 pb-2 text-[10px] uppercase tracking-widest font-black text-gray-400">Labels</div>
                                                {FACET_LABELS.map(label => (
                                                    <button
                                                        key={label}
                                                        onClick={() => setSelectedFacetLabel(label)}
                                                        className={`p-3 text-left rounded-xl text-[13px] font-bold transition-all ${selectedFacetLabel === label ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}

                                                <div className="px-3 py-3 text-[10px] uppercase tracking-widest font-black text-gray-400 mt-2">Pitch</div>
                                                <div className="flex flex-col gap-1">
                                                    {PITCH_VALUES.map(p => (
                                                        <button
                                                            key={p}
                                                            onClick={() => setSelectedPitch(p)}
                                                            className={`p-3 text-left rounded-xl text-[13px] font-bold transition-all ${selectedPitch === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}



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

                                <div className="w-px h-8 bg-gray-200 mx-1" />

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
                        <div className="absolute top-10 left-36 z-[60] flex flex-col gap-4 pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 text-white min-w-[200px] pointer-events-auto">
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

                        {isLoading && (
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-[200] flex items-center justify-center">
                                <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                    <span className="font-black text-gray-800 uppercase tracking-widest text-xs">Saving Project...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const ReportPreview: React.FC<{ project: any; businessInfo: any; onBack: () => void }> = ({ project, businessInfo, onBack }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // --- Calculations ---
    const totalAreaSqft = project.total_area || 0;
    const totalAreaSquares = (totalAreaSqft / 100).toFixed(1);
    const totalFacets = project.polygons.length;

    // Edge Summaries (in feet)
    const edgeSummaries: Record<string, number> = {};
    project.polygons.forEach((p: any) => {
        p.edgeTypes?.forEach((type: string, idx: number) => {
            const meters = p.edgeLengths?.[idx] || 0;
            const feet = meters * 3.28084;
            edgeSummaries[type] = (edgeSummaries[type] || 0) + feet;
        });
    });

    const formatFeetInches = (totalFeet: number) => {
        if (!totalFeet) return '0ft 0in';
        const inches = Math.round(totalFeet * 12);
        const f = Math.floor(inches / 12);
        const i = inches % 12;
        return `${f}ft ${i}in`;
    };

    // Dominant Pitch
    const pitchBins: Record<string, number> = {};
    project.polygons.forEach((p: any) => {
        const pVal = p.pitch || '0/12';
        pitchBins[pVal] = (pitchBins[pVal] || 0) + p.areaSqft;
    });
    const predominantPitch = Object.entries(pitchBins).sort((a, b) => b[1] - a[1])[0]?.[0] || '0/12';

    // Material logic
    const wasteFactors = [0, 0.03, 0.10, 0.15];
    const brands = [
        { name: 'IKO - Cambridge', starterName: 'Leading Edge Plus', bundleCoverage: 33.3, starterBundleCoverage: 110, cappingBundleCoverage: 30, iceRollCoverage: 65, syntheticRollCoverage: 1000 },
        { name: 'CertainTeed - Landmark', starterName: 'SwiftStart', bundleCoverage: 33.3, starterBundleCoverage: 116, cappingBundleCoverage: 35, iceRollCoverage: 65, syntheticRollCoverage: 1000 },
        { name: 'GAF - Timberline', starterName: 'Pro-Start', bundleCoverage: 33.3, starterBundleCoverage: 120, cappingBundleCoverage: 31, iceRollCoverage: 65, syntheticRollCoverage: 1000 },
        { name: 'Owens Corning - Duration', starterName: 'Starter Strip', bundleCoverage: 33.3, starterBundleCoverage: 105, cappingBundleCoverage: 33, iceRollCoverage: 65, syntheticRollCoverage: 1000 },
        { name: 'Atlas - Pristine', starterName: 'Pro-Cut Starter', bundleCoverage: 33.3, starterBundleCoverage: 112, cappingBundleCoverage: 28, iceRollCoverage: 65, syntheticRollCoverage: 1000 },
    ];

    const getVal = (base: number, waste: number) => Math.ceil((base * (1 + waste)));

    // --- Sub-components ---
    const BuilderLyncPage: React.FC<{ children: React.ReactNode; pageNumber: number }> = ({ children, pageNumber }) => (
        <div className="p-16 h-[29.7cm] flex flex-col relative bg-white page-break shadow-2xl print:shadow-none mb-8 last:mb-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                {businessInfo?.business_logo ? (
                    <img src={businessInfo.business_logo} alt="Logo" className="h-10 object-contain" />
                ) : (
                    <div className="h-10 px-4 bg-gray-900 flex items-center justify-center font-black text-white text-lg rounded-lg">LOGO</div>
                )}
                {pageNumber > 1 && (
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                        Powered by <span className="text-blue-500 text-sm italic font-black">BuilderLync.com</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">{children}</div>

            {/* Footer */}
            <div className="mt-auto flex justify-between items-center text-[10px] text-gray-400 font-medium pt-8 border-t border-gray-100">
                <div>This report was powered by BuilderLync. Copyright © 2026 BuilderLync.com | All rights reserved.</div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{pageNumber}</span>
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );

    const downloadPDF = async () => {
        if (!reportRef.current) return;
        setIsGeneratingPDF(true);
        const element = reportRef.current;
        const opt = {
            margin: 0,
            filename: `RoofReport_${project.address.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const downloadCSV = () => {
        let csvContent = "Category,Measurement\n";
        csvContent += `Total Area,${totalAreaSqft.toLocaleString()} SQFT\n`;
        csvContent += `Facets,${totalFacets}\n`;
        Object.entries(edgeSummaries).forEach(([type, len]) => {
            csvContent += `${type},${formatFeetInches(len)}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RoofReport_${project.address.replace(/\s+/g, '_')}.csv`;
        a.click();
    };

    const PageHeader = ({ title }: { title: string }) => (
        <div className="mb-8">
            <h2 className="text-4xl font-black text-blue-500 mb-2">{title}</h2>
            <p className="text-sm font-bold text-gray-600">{project.address}</p>
        </div>
    );


    return (
        <div className="bg-gray-100 min-h-screen py-10 print:py-0 print:bg-white overflow-x-hidden pt-20">
            {/* Control Bar */}
            <div className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center print:hidden shadow-sm">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-black text-sm uppercase transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back to Editor
                </button>
                <div className="flex gap-4 items-center">
                    {/* Download Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsDownloadMenuOpen(!isDownloadMenuOpen);
                                setIsActionsMenuOpen(false);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full font-black text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 px-5"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>

                        {isDownloadMenuOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 z-[110] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => {
                                        downloadPDF();
                                        setIsDownloadMenuOpen(false);
                                    }}
                                    disabled={isGeneratingPDF}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingPDF ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                    PDF Report
                                </button>
                                <button
                                    onClick={() => {
                                        downloadCSV();
                                        setIsDownloadMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors border-t border-gray-50"
                                >
                                    CSV Data
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsActionsMenuOpen(!isActionsMenuOpen);
                                setIsDownloadMenuOpen(false);
                            }}
                            className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all border border-gray-200"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {isActionsMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-[110] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => {
                                        onBack();
                                        setIsActionsMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                    <Pencil className="w-4 h-4 text-blue-500" />
                                    Edit DIY
                                </button>
                                <button
                                    onClick={() => {
                                        // Standard practice: Just back to editor for now, or trigger a versioning flow if defined
                                        onBack();
                                        setIsActionsMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                                >
                                    <Plus className="w-4 h-4 text-green-500" />
                                    Create new version
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div ref={reportRef} className="max-w-[21cm] mx-auto flex flex-col gap-0">

                {/* PAGE 1: COVER */}
                <BuilderLyncPage pageNumber={1}>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-7xl font-black text-blue-500 mb-2 tracking-tighter">Roof Report</h1>
                                <p className="text-xl font-bold text-gray-800">Prepared by {businessInfo?.friendly_business_name || 'Capital City Roofing'}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-xl font-black text-gray-900">{Math.round(totalAreaSqft)} sqft</p>
                                <p className="text-lg font-bold text-gray-600">{totalFacets} facets</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-16">
                            <p className="text-lg font-bold text-gray-900 max-w-sm">{project.address}</p>
                            <p className="text-lg font-bold text-gray-900">Predominant pitch {predominantPitch}</p>
                        </div>

                        <div className="flex-1 min-h-[500px] border-[1px] border-gray-100 rounded-sm overflow-hidden bg-gray-50 relative">
                            {project.images?.birdseye ? (
                                <img src={project.images.birdseye} alt="Birdseye" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest">Satellite Imagery</div>
                            )}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <div className="bg-white/90 px-2 py-1 rounded text-[8px] font-bold shadow-sm">Microsoft Bing</div>
                                <span className="text-[10px] text-gray-500 font-bold">{currentDate}</span>
                            </div>
                        </div>
                    </div>
                </BuilderLyncPage>

                {/* PAGE 2: DIAGRAM */}
                <BuilderLyncPage pageNumber={2}>
                    <PageHeader title="Diagram" />
                    <div className="flex-1 flex items-center justify-center p-20">
                        {project.images?.facets ? (
                            <img src={project.images.facets} alt="Diagram" className="max-w-full max-h-full object-contain filter grayscale opacity-50 contrast-150" />
                        ) : (
                            <div className="w-full h-[600px] bg-gray-50 flex items-center justify-center border-dashed border-2 border-gray-200 text-gray-300 font-black tracking-widest text-xs">OUTLINE DIAGRAM</div>
                        )}
                    </div>
                </BuilderLyncPage>

                {/* PAGE 3: LENGTH */}
                <BuilderLyncPage pageNumber={3}>
                    <PageHeader title="Length measurement report" />
                    <div className="grid grid-cols-3 gap-y-4 mb-16 px-4">
                        {Object.entries(EDGE_TYPES).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-3">
                                <div className="w-6 h-1 rounded-sm" style={{ backgroundColor: val.color }} />
                                <span className="text-[11px] font-bold text-gray-700">{val.name}: {formatFeetInches(edgeSummaries[key] || 0)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 flex items-center justify-center p-20 relative">
                        {project.images?.edges ? (
                            <img src={project.images.edges} alt="Edges" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="w-full h-[500px] bg-gray-50 flex items-center justify-center font-black text-gray-200 uppercase tracking-widest">Linear Assessment</div>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center italic mt-8">Measurements in diagram are rounded up for display. Some edge lengths may be hidden from diagram to avoid overcrowding.</p>
                </BuilderLyncPage>

                {/* PAGE 4: AREA */}
                <BuilderLyncPage pageNumber={4}>
                    <PageHeader title="Area measurement report" />
                    <div className="grid grid-cols-2 gap-x-20 mb-16 px-4">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Total roof area:</span>
                                <span className="text-xs font-black text-gray-900">{Math.round(totalAreaSqft)} sqft</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Pitched roof area:</span>
                                <span className="text-xs font-black text-gray-900">{Math.round(totalAreaSqft)} sqft</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Flat roof area:</span>
                                <span className="text-xs font-black text-gray-900">0 sqft</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Two story area:</span>
                                <span className="text-xs font-black text-gray-900">0 sqft</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Predominant pitch:</span>
                                <span className="text-xs font-black text-gray-900">{predominantPitch}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Predominant pitch area:</span>
                                <span className="text-xs font-black text-gray-900">{Math.round(totalAreaSqft)} sqft</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-xs text-gray-600 font-bold">Unspecified pitch area:</span>
                                <span className="text-xs font-black text-gray-900">0 sqft</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-20">
                        {project.images?.facets ? (
                            <img src={project.images.facets} alt="Area" className="max-w-full max-h-full object-contain filter sepia hue-rotate-[200deg] opacity-70" />
                        ) : (
                            <div className="w-full h-[500px]" />
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 text-center italic mt-8">Area measurements in diagram are rounded. The totals at the top of the page are the sums of the exact measurements, which are then rounded. Deleted facets (skylights, chimneys, etc.) are designated with a dashed line and are excluded from the calculations.</p>
                </BuilderLyncPage>

                {/* PAGE 5+: STRUCTURE SUMMARIES */}
                {project.polygons.map((p: any, idx: number) => (
                    <BuilderLyncPage key={idx} pageNumber={5 + idx}>
                        <PageHeader title={`Structure #${idx + 1} summary`} />
                        <div className="flex gap-12 mb-12 h-[350px]">
                            <div className="w-1/2 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50/50 p-8 shadow-inner">
                                <img src={project.images?.facets} className="max-w-full max-h-full object-contain grayscale opacity-60" />
                            </div>
                            <div className="w-1/2">
                                <h4 className="text-blue-500 font-black mb-4 uppercase tracking-[0.2em] text-[10px] border-b pb-2">Measurements</h4>
                                <div className="space-y-2 text-[10px]">
                                    {[
                                        ['Total roof area', `${Math.round(p.areaSqft)} sqft`],
                                        ['Total pitched area', `${Math.round(p.areaSqft)} sqft`],
                                        ['Total flat area', '0 sqft'],
                                        ['Total roof facets', '1 facets'],
                                        ['Predominant pitch', p.pitch || '0/12'],
                                        ['Total eaves', formatFeetInches(edgeSummaries['Eaves'] / totalFacets)],
                                        ['Total ridges', formatFeetInches(edgeSummaries['Ridges'] / totalFacets)],
                                        ['Total rakes', formatFeetInches(edgeSummaries['Rakes'] / totalFacets)],
                                        ['Total valleys', formatFeetInches(edgeSummaries['Valleys'] / totalFacets)],
                                        ['Total hips', formatFeetInches(edgeSummaries['Hips'] / totalFacets)],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between py-1 border-b border-gray-50">
                                            <span className="text-gray-500 font-bold">{label}</span>
                                            <span className="font-black text-gray-900">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/30 p-8 rounded-xl mb-12">
                            <div className="grid grid-cols-3 gap-12 text-center">
                                <div>
                                    <p className="text-blue-500 font-black text-[10px] uppercase mb-1">Pitch</p>
                                    <p className="text-2xl font-black text-gray-900">{p.pitch || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-blue-500 font-black text-[10px] uppercase mb-1">Area (sqft)</p>
                                    <p className="text-2xl font-black text-red-500">{Math.round(p.areaSqft).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-blue-500 font-black text-[10px] uppercase mb-1">Squares</p>
                                    <p className="text-2xl font-black text-red-500">{(p.areaSqft / 100).toFixed(1)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden border border-gray-100 rounded-xl">
                            <table className="w-full text-center text-[10px] border-collapse">
                                <thead className="bg-blue-50/50 text-blue-500 font-black">
                                    <tr>
                                        <th className="py-2 text-left px-4">Waste %</th>
                                        <th className="bg-blue-100/50 text-blue-700">0%</th>
                                        {['10%', '12%', '15%', '17%', '20%', '22%'].map(w => <th key={w}>{w}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-gray-100">
                                        <td className="py-4 text-gray-500 font-bold text-left px-4">Area (sqft)</td>
                                        <td className="bg-blue-50/30 font-black tracking-tighter">{Math.round(p.areaSqft)}</td>
                                        {[0.10, 0.12, 0.15, 0.17, 0.20, 0.22].map(w => <td key={w} className="text-gray-900 font-medium tracking-tighter">{getVal(p.areaSqft, w).toLocaleString()}</td>)}
                                    </tr>
                                    <tr className="border-t border-gray-100">
                                        <td className="py-4 text-gray-500 font-bold text-left px-4">Squares</td>
                                        <td className="bg-blue-50/30 font-black tracking-tighter">{(p.areaSqft / 100).toFixed(1)}</td>
                                        {[0.10, 0.12, 0.15, 0.17, 0.20, 0.22].map(w => <td key={w} className="text-gray-900 font-medium tracking-tighter">{(getVal(p.areaSqft, w) / 100).toFixed(1)}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </BuilderLyncPage>
                ))}

                {/* PAGE: REPORT SUMMARY */}
                <BuilderLyncPage pageNumber={5 + totalFacets}>
                    <PageHeader title="Report summary" />
                    <div className="flex gap-12 mb-12 h-[380px]">
                        <div className="w-1/2 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50/50 shadow-inner">
                            <img src={project.images?.facets} className="max-w-[80%] max-h-[80%] opacity-30 grayscale filter invert" />
                        </div>
                        <div className="w-1/2">
                            <h4 className="text-blue-500 font-black mb-4 uppercase tracking-[0.2em] text-[10px] border-b pb-2">Measurements</h4>
                            <div className="grid grid-cols-1 gap-1 text-[10px]">
                                {[
                                    ['Total roof area', `${Math.round(totalAreaSqft)} sqft`],
                                    ['Total pitched area', `${Math.round(totalAreaSqft)} sqft`],
                                    ['Total flat area', '0 sqft'],
                                    ['Total roof facets', `${totalFacets} facets`],
                                    ['Predominant pitch', predominantPitch],
                                    ['Total eaves', formatFeetInches(edgeSummaries['Eaves'] || 0)],
                                    ['Total ridges', formatFeetInches(edgeSummaries['Ridges'] || 0)],
                                    ['Total rakes', formatFeetInches(edgeSummaries['Rakes'] || 0)],
                                    ['Total valleys', formatFeetInches(edgeSummaries['Valleys'] || 0)],
                                    ['Total hips', formatFeetInches(edgeSummaries['Hips'] || 0)],
                                    ['Total wall flashing', formatFeetInches(edgeSummaries['Wall flashing'] || 0)],
                                    ['Total step flashing', formatFeetInches(edgeSummaries['Step flashing'] || 0)],
                                    ['Total transitions', formatFeetInches(edgeSummaries['Transitions'] || 0)],
                                    ['Total parapet wall', formatFeetInches(edgeSummaries['Parapet wall'] || 0)],
                                    ['Total unspecified', formatFeetInches(edgeSummaries['Unspecified'] || 0)],
                                    ['Eaves + rakes', formatFeetInches((edgeSummaries['Eaves'] || 0) + (edgeSummaries['Rakes'] || 0))],
                                    ['Hips + ridges', formatFeetInches((edgeSummaries['Hips'] || 0) + (edgeSummaries['Ridges'] || 0))],
                                ].map(([label, val]) => (
                                    <div key={label} className="flex justify-between py-1 border-b border-gray-50">
                                        <span className="text-gray-500 font-bold">{label}</span>
                                        <span className="font-black text-gray-900">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <table className="w-full text-center text-[10px] border-collapse">
                            <thead className="bg-blue-50/50 text-blue-500 font-black">
                                <tr>
                                    <th className="py-2 text-left px-4">Waste %</th>
                                    <th className="bg-blue-100/50 text-blue-700">0%</th>
                                    {['3%', '10%', '12%', '15%', '17%', '20%'].map(w => <th key={w}>{w}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-gray-100">
                                    <td className="py-4 text-gray-500 font-bold text-left px-4">Area (sqft)</td>
                                    <td className="bg-blue-50/30 font-black tracking-tighter">{Math.round(totalAreaSqft)}</td>
                                    {[0.03, 0.10, 0.12, 0.15, 0.17, 0.20].map(w => <td key={w} className="text-gray-900 font-medium tracking-tighter">{getVal(totalAreaSqft, w).toLocaleString()}</td>)}
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-4 text-gray-500 font-bold text-left px-4">Squares</td>
                                    <td className="bg-blue-50/30 font-black tracking-tighter">{totalAreaSquares}</td>
                                    {[0.03, 0.10, 0.12, 0.15, 0.17, 0.20].map(w => <td key={w} className="text-gray-900 font-medium tracking-tighter">{(getVal(totalAreaSqft, w) / 100).toFixed(1)}</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </BuilderLyncPage>

                {/* PAGE: MATERIALS */}
                <BuilderLyncPage pageNumber={6 + totalFacets}>
                    <PageHeader title="Material calculations" />
                    <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="text-blue-500 uppercase font-black bg-blue-50/20">
                                    <th className="text-left py-4 px-4 w-[240px]">Product</th>
                                    <th className="text-left py-4 px-2 w-[80px]">Unit</th>
                                    {wasteFactors.map(w => (
                                        <th key={w} className={`py-4 px-2 text-center ${w === 0.03 ? 'bg-blue-50/50 text-blue-700' : ''}`}>Waste ({Math.round(w * 100)}%)</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-blue-600 font-black text-white">
                                    <td className="py-3 px-4">Shingle (total sqft)</td>
                                    <td className="py-3 px-2">sqft</td>
                                    {wasteFactors.map(w => <td key={w} className={`text-center ${w === 0.03 ? 'bg-blue-500/20' : ''}`}>{getVal(totalAreaSqft, w).toLocaleString()}</td>)}
                                </tr>
                                {brands.map(brand => (
                                    <tr key={brand.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-2.5 px-8 text-gray-600 font-bold">{brand.name}</td>
                                        <td className="py-2.5 px-2 text-gray-400 font-medium">bundle</td>
                                        {wasteFactors.map(w => <td key={w} className={`text-center font-black text-gray-900 ${w === 0.03 ? 'bg-blue-50/30' : ''}`}>{Math.ceil(getVal(totalAreaSqft, w) / brand.bundleCoverage)}</td>)}
                                    </tr>
                                ))}

                                <tr className="bg-blue-500 font-black text-white mt-4 border-t-2 border-white">
                                    <td className="py-2.5 px-4 uppercase tracking-widest text-[8px]">Starter (eaves + rakes)</td>
                                    <td className="py-2.5 px-2">ft</td>
                                    {wasteFactors.map(w => <td key={w} className={`text-center ${w === 0.03 ? 'bg-blue-500/20' : ''}`}>{getVal((edgeSummaries['Eaves'] || 0) + (edgeSummaries['Rakes'] || 0), w).toLocaleString()}</td>)}
                                </tr>
                                {brands.map(brand => (
                                    <tr key={brand.name + 'st'} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-2 px-8 text-gray-600 font-bold italic truncate">{brand.starterName}</td>
                                        <td className="py-2 px-2 text-gray-400 font-medium">bundle</td>
                                        {wasteFactors.map(w => <td key={w} className={`text-center font-black text-gray-900 ${w === 0.03 ? 'bg-blue-50/30' : ''}`}>{Math.ceil(getVal((edgeSummaries['Eaves'] || 0) + (edgeSummaries['Rakes'] || 0), w) / brand.starterBundleCoverage)}</td>)}
                                    </tr>
                                ))}

                                <tr className="bg-blue-500 font-black text-white border-t-2 border-white">
                                    <td className="py-2.5 px-4 uppercase tracking-widest text-[8px]">Synthetic Underlayment</td>
                                    <td className="py-2.5 px-2">sqft</td>
                                    {wasteFactors.map(w => <td key={w} className={`text-center ${w === 0.03 ? 'bg-blue-500/20' : ''}`}>{getVal(totalAreaSqft, w).toLocaleString()}</td>)}
                                </tr>
                                {brands.slice(0, 1).map(brand => (
                                    <tr key={brand.name + 'sy'} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-2 px-8 text-gray-600 font-bold">Standard High-Performance Synthetic</td>
                                        <td className="py-2 px-2 text-gray-400 font-medium">roll</td>
                                        {wasteFactors.map(w => <td key={w} className={`text-center font-black text-gray-900 ${w === 0.03 ? 'bg-blue-50/30' : ''}`}>{Math.ceil(getVal(totalAreaSqft, w) / brand.syntheticRollCoverage)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </BuilderLyncPage>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .page-break { page-break-after: always; }
                    .max-w-[21cm] { max-width: 100% !important; margin: 0 !important; }
                }
            `}} />
        </div>
    );
};

export default DIYPage;
