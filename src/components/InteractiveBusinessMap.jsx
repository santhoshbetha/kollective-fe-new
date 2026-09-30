import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Star, Clock, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

// 📝 ADJUST ACCORDING TO SYSTEM PROVIDER:
// If using Mapbox, plug token credentials into environment variables.
// If using open-source MapLibre hosting layers, swap Map for custom canvas styles.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_TOKEN";

export function InteractiveBusinessMap({
    searchQuery = '',
    selectedCategory = '',
    onBusinessSelect,
    className = ''
}) {
    // 🗺️ Default initial center viewport center focus configuration (e.g. Austin, TX baseline)
    const [viewport, setViewport] = useState({
        latitude: 30.2672,
        longitude: -97.7431,
        zoom: 12
    });

    const [mapBounds, setMapBounds] = useState(null);
    const [selectedBiz, setSelectedBiz] = useState(null);
    const mapRef = useRef(null);

    /**
     * 🛰️ AUTOMATED DEBOUNCED BOUNDS EXPILER LOOP
     * Captures geometric window coordinates when map panning stabilizes
     */
    const handleMapMove = useCallback((evt) => {
        if (!mapRef.current) return;

        const mapObj = mapRef.current.getMap();
        const bounds = mapObj.getBounds();

        // Extract North, South, East, West structural properties out of coordinates array bounds
        setMapBounds({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        });
    }, []);

    // 📡 DYNAMIC COMPOSABLE NETWORK FILTER QUERY
    // Automatically re-fires whenever queries, categories, or bounding box markers shift parameters
    const { data: searchPayload, isLoading } = useQuery({
        queryKey: ['business-spatial-search', searchQuery, selectedCategory, mapBounds],
        queryFn: async () => {
            if (!mapBounds) return { data: [] };

            const params = {
                q: searchQuery,
                category: selectedCategory,
                type: 'existing', // Syncs directly to filter existing open merchant nodes
                north: mapBounds.north,
                south: mapBounds.south,
                east: mapBounds.east,
                west: mapBounds.west
            };

            const response = await axios.get('/api/v1/businesses/search', { params });
            return response.data;
        },
        enabled: !!mapBounds, // Execute only after map boundary context sets up
        keepPreviousData: true
    });

    const businesses = searchPayload?.data || [];
    return (
        <div className={cn("relative w-full h-full bg-neutral-900 border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner", className)}>

            {/* Real-time Loader Overlay Indicator Ring */}
            {isLoading && (
                <div className="absolute top-4 left-4 z-30 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest text-text-primary dark:text-white flex items-center gap-2 shadow-xl border border-black/5 select-none animate-in fade-in duration-100">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-container shrink-0" />
                    <span>Querying PostGIS Registry...</span>
                </div>
            )}

            <Map
                {...viewport}
                ref={mapRef}
                onMove={(evt) => setViewport(evt.viewState)}
                onMoveEnd={handleMapMove}
                onLoad={handleMapMove} // Trigger immediate fetch loop on map load completion
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/dark-v11" // Sleek custom dark theme container canvas
                className="w-full h-full"
                maxZoom={18}
                minZoom={3}
            >
                <NavigationControl position="bottom-right" showCompass={false} />

                {/* 📍 DROPS LIVE COORDINATE MARKER PINS */}
                {businesses.map((biz) => {
                    const coords = biz.geography?.coordinates;
                    if (!coords || !coords.latitude || !coords.longitude) return null;

                    const isTargeted = selectedBiz?.id === biz.id;

                    return (
                        <Marker
                            key={`marker-pin-${biz.id}`}
                            latitude={coords.latitude}
                            longitude={coords.longitude}
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setSelectedBiz(biz);
                                if (onBusinessSelect) onBusinessSelect(biz);
                            }}
                        >
                            <button
                                type="button"
                                className={cn(
                                    "p-1.5 rounded-full shadow-2xl transition-all border outline-none cursor-pointer flex items-center justify-center scale-100 active:scale-90",
                                    isTargeted
                                        ? "bg-primary-container border-white text-white ring-4 ring-primary-container/20 scale-110"
                                        : "bg-white dark:bg-[#141414] border-black/10 dark:border-white/10 text-primary-container hover:scale-105"
                                )}
                            >
                                <MapPin className={cn("w-4 h-4", isTargeted ? "stroke-[2.5px]" : "")} />
                            </button>
                        </Marker>
                    );
                })}

                {/* 💬 POPUP CANVAS DIALOG CONTAINER DETAILS PANEL */}
                {selectedBiz && (
                    <Popup
                        latitude={selectedBiz.geography.coordinates.latitude}
                        longitude={selectedBiz.geography.coordinates.longitude}
                        onClose={() => setSelectedBiz(null)}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="top"
                        maxWidth="280px"
                        className="font-sans z-20 text-left"
                    >
                        <div className="p-3 bg-white dark:bg-[#141414] text-text-primary dark:text-white rounded-xl space-y-2 relative border-none select-none text-left font-sans">
                            {/* Header details block */}
                            <div className="space-y-0.5 text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-sm font-black tracking-tight truncate max-w-[180px] text-text-primary dark:text-white">
                                        {selectedBiz.name}
                                    </h4>
                                    {selectedBiz.verified && (
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5px]" />
                                    )}
                                </div>
                                <span className="text-[9px] font-mono font-black uppercase tracking-wider text-primary-container">
                                    {selectedBiz.category}
                                </span>
                            </div>

                            {/* Description block */}
                            <p className="text-xs text-text-secondary line-clamp-2 leading-snug font-medium">
                                {selectedBiz.description}
                            </p>

                            {/* Footer parameters strip row */}
                            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[10px] font-mono font-bold text-text-secondary select-none">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary-container" />
                                    <span className="truncate max-w-[120px]">{selectedBiz.hours}</span>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-text-primary dark:text-white ml-0.5 font-black">{selectedBiz.rating || "5.0"}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
