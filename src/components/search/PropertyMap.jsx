import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from 'react-leaflet';
import { divIcon, LatLngBounds } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X } from 'lucide-react';
import { getDistance, fetchCoordinates } from '../../utils/geoUtils';
import 'leaflet/dist/leaflet.css';
import { Circle } from 'react-leaflet';

const FitBoundsToMarkers = ({ properties, geoSearch }) => {
    const map = useMap();

    useEffect(() => {
        if (!properties || properties.length === 0) return;

        const fitBounds = () => {
            const bounds = new LatLngBounds();
            let hasValidCoords = false;

            properties.forEach(prop => {
                if (prop.lat && prop.lng) {
                    bounds.extend([prop.lat, prop.lng]);
                    hasValidCoords = true;
                }
            });

            // Include landmark center in bounds
            if (geoSearch && geoSearch.lat && geoSearch.lng) {
                bounds.extend([geoSearch.lat, geoSearch.lng]);
                hasValidCoords = true;
            }

            if (hasValidCoords) {
                try {
                    map.invalidateSize();
                    map.fitBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 14,
                        animate: true,
                        duration: 1
                    });
                } catch (e) {
                    console.warn("Bounds error:", e);
                }
            }
        };

        fitBounds();

        const resizeObserver = new ResizeObserver(() => {
            fitBounds();
        });
        resizeObserver.observe(map.getContainer());

        return () => resizeObserver.disconnect();

    }, [properties, geoSearch, map]);
    return null;
};

const MapEventsHandler = ({ onMove, onMoveEnd }) => {
    useMapEvents({
        dragstart: onMove,
        zoomstart: onMove,
        moveend: (e) => onMoveEnd(e.target.getBounds()),
    });
    return null;
};

const ResizeMap = () => {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        const container = map.getContainer();
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, [map]);
    return null;
};

const PropertyMap = ({ properties, allProperties, hoveredId, onSearchArea, geoSearch, setGeoSearch }) => {
    const navigate = useNavigate();
    const defaultCenter = [51.1657, 10.4515];

    const [currentBounds, setCurrentBounds] = React.useState(null);
    const [hasMoved, setHasMoved] = React.useState(false);
    const [landmarkQuery, setLandmarkQuery] = React.useState("");
    const [isSearching, setIsSearching] = React.useState(false);

    // Iterative search logic
    const handleLandmarkSearch = async (e) => {
        if (e) e.preventDefault();
        if (!landmarkQuery || landmarkQuery.length < 3) return;

        setIsSearching(true);
        const coords = await fetchCoordinates(landmarkQuery);

        if (coords) {
            console.log("Landmark found:", coords);
            // Iterative expansion: 15km, 30km, 45km, 60km, 100km
            const radii = [15, 30, 45, 60, 100];
            let foundRadius = radii[0];

            for (const r of radii) {
                const count = (allProperties || []).filter(p => {
                    if (!p.lat || !p.lng) return false;
                    return getDistance(p.lat, p.lng, coords.lat, coords.lng) <= r;
                }).length;

                if (count > 0) {
                    foundRadius = r;
                    break;
                }
                foundRadius = r; 
            }

            setGeoSearch({
                ...coords,
                radius: foundRadius,
                label: landmarkQuery
            });
        }
        setIsSearching(false);
    };

    // Reset button when properties change (user manually searched or initial load)
    useEffect(() => {
        setHasMoved(false);
    }, [properties]);

    // Sync internal input with external geoSearch
    useEffect(() => {
        if (geoSearch?.label) {
            setLandmarkQuery(geoSearch.label.split(',')[0]); // Use short label
        } else if (!geoSearch) {
            setLandmarkQuery("");
        }
    }, [geoSearch]);

    // --- PINS (White -> Arrivio Dark Green) ---
    const createPriceIcon = (price, isSelected) => {
        return divIcon({
            className: 'price-pin',
            html: `
                <div class="pin-bubble ${isSelected ? 'selected scale-110 shadow-xl' : 'shadow-md'}">
                    €${price.toLocaleString()}
                </div>
            `,
            iconSize: [64, 32],
            iconAnchor: [32, 16]
        });
    };

    const createLandmarkIcon = () => {
        return divIcon({
            className: 'landmark-pin',
            html: `
                <div class="landmark-pin-container shadow-2xl">
                    <div class="landmark-pin-shape">
                        <div class="landmark-pin-inner"></div>
                    </div>
                </div>
            `,
            iconSize: [32, 42],
            iconAnchor: [16, 42]
        });
    };

    return (
        <div className="h-full w-full relative z-0 property-map-container overflow-hidden">
            <style>
                {`
                    .pin-bubble {
                        background: white;
                        color: #0f4c3a;
                        padding: 6px 10px;
                        border-radius: 99px;
                        font-weight: 700;
                        font-size: 13px;
                        border: 1px solid #f2f2f2;
                        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                    }
                    .pin-bubble.selected {
                        background: #0f4c3a;
                        color: white !important;
                        border-color: #0f4c3a;
                        z-index: 1000;
                    }
                    .leaflet-popup-content-wrapper {
                        padding: 0;
                        overflow: hidden;
                        border-radius: 12px;
                    }
                    .leaflet-popup-content {
                        margin: 0;
                        width: 220px !important;
                    }
                    .leaflet-popup-tip-container {
                        display: none;
                    }
                    .landmark-pin-container {
                        position: relative;
                        width: 32px;
                        height: 42px;
                        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                    }
                    .landmark-pin-shape {
                        position: absolute;
                        width: 30px;
                        height: 30px;
                        background: #0f4c3a;
                        border: 2px solid white;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: landmark-bounce 1s ease-in-out infinite alternate;
                    }
                    .landmark-pin-inner {
                        width: 10px;
                        height: 10px;
                        background: #D4A017;
                        border-radius: 50%;
                        transform: rotate(45deg);
                    }
                    @keyframes landmark-bounce {
                        from { transform: rotate(-45deg) translateY(0); }
                        to { transform: rotate(-45deg) translateY(-4px); }
                    }
                `}
            </style>

            {/* LANDMARK SEARCH BAR */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
                <form 
                    onSubmit={handleLandmarkSearch}
                    className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#0f4c3a]/10 flex items-center p-1.5 pr-3 overflow-hidden"
                >
                    <div className="pl-4 pr-2 text-[#9ca3af]">
                        {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                    <input 
                        type="text"
                        placeholder="Search landmark or area..."
                        value={landmarkQuery}
                        onChange={(e) => setLandmarkQuery(e.target.value)}
                        className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] py-2"
                    />
                    {landmarkQuery && (
                        <button 
                            type="button"
                            onClick={() => setLandmarkQuery("")}
                            className="p-1 hover:bg-[#0f4c3a]/5 rounded-full text-[#9ca3af]"
                        >
                            <X size={14} />
                        </button>
                    )}
                </form>
            </div>

            {/* FLOATING "SEARCH THIS AREA" BUTTON (Only if no geoSearch is active) */}
            <AnimatePresence>
                {hasMoved && !geoSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 80, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="absolute top-4 left-1/2 z-[1000]"
                    >
                        <button
                            onClick={() => {
                                setHasMoved(false);
                                if (onSearchArea && currentBounds) onSearchArea(currentBounds);
                            }}
                            className="bg-white text-[#111827] px-6 py-2.5 rounded-full shadow-2xl border border-[#f2f2f2] flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:bg-[#0f4c3a] hover:text-white transition-all active:scale-95 shadow-[#0f4c3a]/10"
                        >
                            <Search size={14} strokeWidth={2.5} />
                            Search this area
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <MapContainer
                center={defaultCenter}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", background: "#f0f0f0" }}
                zoomControl={false}
            >
                {/* PREMIUM MINIMALIST THEME (CartoDB Positron) */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OpenStreetMap'
                />

                <FitBoundsToMarkers properties={properties} geoSearch={geoSearch} />
                <MapEventsHandler
                    onMove={() => setHasMoved(true)}
                    onMoveEnd={(bounds) => setCurrentBounds(bounds)}
                />

                {/* RADIUS OVERLAY & LANDMARK PIN */}
                {geoSearch && (
                    <>
                        <Circle
                            center={[geoSearch.lat, geoSearch.lng]}
                            radius={geoSearch.radius * 1000}
                            pathOptions={{
                                fillColor: '#0f4c3a',
                                fillOpacity: 0.03,
                                color: '#0f4c3a',
                                weight: 1.5,
                                dashArray: '6, 12',
                                lineCap: 'round'
                            }}
                        />
                        <Marker 
                            position={[geoSearch.lat, geoSearch.lng]} 
                            icon={createLandmarkIcon()}
                            zIndexOffset={2000}
                        >
                            <Popup offset={[0, -10]}>
                                <div className="p-2 text-center text-xs font-bold text-[#111827]">
                                    {geoSearch.label.split(',')[0]}
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {properties.map(property => {
                    if (!property.lat || !property.lng) return null;
                    const isSelected = property.id === hoveredId;

                    return (
                        <Marker
                            key={property.id}
                            position={[property.lat, property.lng]}
                            icon={createPriceIcon(property.price, isSelected)}
                            zIndexOffset={isSelected ? 1000 : 1}
                            eventHandlers={{
                                mouseover: (e) => {
                                    if (!isSelected) e.target.openPopup();
                                },
                            }}
                        >
                            <Popup closeButton={false} offset={[0, -10]}>
                                <div
                                    className="cursor-pointer group"
                                    onClick={() => navigate(`/property/${property.slug || property.id}`)}
                                >
                                    <div className="h-32 w-full overflow-hidden">
                                        <img
                                            src={property.image}
                                            alt={property.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-3 bg-white">
                                        <h4 className="font-serif font-bold text-[#111827] text-sm truncate mb-1">
                                            {property.title}
                                        </h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-[#4b5563]">{property.city}</span>
                                            <span className="font-bold text-[#111827]">€{property.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <ResizeMap />
            </MapContainer>
        </div>
    );
};

export default PropertyMap;