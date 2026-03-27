import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { divIcon, LatLngBounds } from 'leaflet';
import { useNavigate } from 'react-router-dom';
// geoUtils no longer needed — landmark search moved to SearchControlBar
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
                    // Single point — use setView instead of fitBounds
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    if (ne.lat === sw.lat && ne.lng === sw.lng) {
                        map.setView([ne.lat, ne.lng], 14, { animate: true });
                    } else {
                        map.fitBounds(bounds, {
                            padding: [50, 50],
                            maxZoom: 14,
                            animate: true,
                            duration: 1
                        });
                    }
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

// Individual marker — handles hover popup + card hover sync
const PropertyMarker = ({ property, isSelected, createPriceIcon, navigate }) => {
    const markerRef = React.useRef(null);

    // Open/close popup when card is hovered (isSelected changes)
    useEffect(() => {
        const marker = markerRef.current;
        if (!marker) return;
        if (isSelected) {
            marker.openPopup();
        } else {
            marker.closePopup();
        }
    }, [isSelected]);

    return (
        <Marker
            ref={markerRef}
            position={[property.lat, property.lng]}
            icon={createPriceIcon(property.price || 0, isSelected)}
            zIndexOffset={isSelected ? 1000 : 1}
            eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => {
                    // Small delay so user can move mouse to popup
                    setTimeout(() => {
                        if (!isSelected) e.target.closePopup();
                    }, 300);
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
                            <span className="font-bold text-[#111827]">€{(property.price || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

const PropertyMap = ({ properties, allProperties, hoveredId, onSearchArea, geoSearch, setGeoSearch }) => {
    const navigate = useNavigate();
    const defaultCenter = [51.1657, 10.4515];


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
                        <PropertyMarker
                            key={property.id}
                            property={property}
                            isSelected={isSelected}
                            createPriceIcon={createPriceIcon}
                            navigate={navigate}
                        />
                    );
                })}

                <ResizeMap />
            </MapContainer>
        </div>
    );
};

export default PropertyMap;