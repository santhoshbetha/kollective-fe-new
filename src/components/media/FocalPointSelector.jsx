import React, { useState, useRef, useEffect } from 'react';

export function FocalPointSelector({
    src,
    imageUrl,
    focalX,
    focalY,
    value,
    onChange,
    alt = 'Focal point selector preview',
    className = ''
}) {
    const activeSrc = src || imageUrl;
    const initialX = focalX !== undefined ? focalX : (value?.x !== undefined ? value.x : 0);
    const initialY = focalY !== undefined ? focalY : (value?.y !== undefined ? value.y : 0);
    const containerRef = useRef(null);
    const draggingRef = useRef(false);
    const [coords, setCoords] = useState({
        x: typeof initialX === 'number' ? initialX : parseFloat(initialX || 0),
        y: typeof initialY === 'number' ? initialY : parseFloat(initialY || 0)
    });

    useEffect(() => {
        const x = focalX !== undefined ? focalX : value?.x;
        const y = focalY !== undefined ? focalY : value?.y;
        if (x !== undefined || y !== undefined) {
            setCoords({
                x: typeof x === 'number' ? x : parseFloat(x || 0),
                y: typeof y === 'number' ? y : parseFloat(y || 0)
            });
        }
    }, [focalX, focalY, value?.x, value?.y]);

    // Converts a pointer client coordinate into the Mastodon -1.0..1.0 space and
    // fires onChange immediately so the reticle tracks the pointer in real time.
    const updateFromClientPoint = (clientX, clientY) => {
        if (!containerRef.current || clientX === undefined || clientY === undefined) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const pctX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const pctY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

        // Pointer to Float conversion (Mastodon -1.0 to 1.0 standard)
        const mastodonX = (pctX * 2 - 1).toFixed(2);
        const mastodonY = ((1 - pctY) * 2 - 1).toFixed(2);

        const newCoords = {
            x: parseFloat(mastodonX),
            y: parseFloat(mastodonY)
        };

        setCoords(newCoords);
        if (onChange) {
            onChange(newCoords);
        }
    };

    const handlePointerDown = (e) => {
        if (!containerRef.current) return;
        draggingRef.current = true;
        containerRef.current.setPointerCapture?.(e.pointerId);
        updateFromClientPoint(e.clientX, e.clientY);
    };

    const handlePointerMove = (e) => {
        if (!draggingRef.current) return;
        updateFromClientPoint(e.clientX, e.clientY);
    };

    const endDrag = (e) => {
        if (draggingRef.current && containerRef.current && e?.pointerId !== undefined) {
            containerRef.current.releasePointerCapture?.(e.pointerId);
        }
        draggingRef.current = false;
    };

    // Float to CSS marker conversion
    const markerLeft = ((coords.x + 1) / 2) * 100;
    const markerTop = (1 - (coords.y + 1) / 2) * 100;

    return (
        <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            className={`cursor-crosshair relative overflow-hidden select-none touch-none w-full h-full ${className}`}
            style={{ position: 'relative' }}
            role="region"
            aria-label="Focal point selector"
            data-testid="focal-point-selector"
        >
            {activeSrc && (
                <img
                    src={activeSrc}
                    alt={alt}
                    className="w-full h-full object-cover pointer-events-none select-none block"
                    draggable={false}
                />
            )}

            {/* Target Reticle Visual Marker */}
            <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                    left: `${markerLeft}%`,
                    top: `${markerTop}%`
                }}
                data-testid="focal-point-marker"
            >
                <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.8)] bg-black/25 flex items-center justify-center backdrop-blur-xs">
                        <div className="w-2 h-2 rounded-full bg-primary-container shadow-sm ring-2 ring-white" />
                    </div>
                    {/* Crosshair guidelines */}
                    <div className="absolute w-12 h-[1px] bg-white/70 -z-10 shadow-sm" />
                    <div className="absolute h-12 w-[1px] bg-white/70 -z-10 shadow-sm" />
                </div>
            </div>

            {/* Coordinate readout pill overlay */}
            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white/90 z-20 pointer-events-none border border-white/10">
                X: {coords.x > 0 ? `+${coords.x.toFixed(2)}` : coords.x.toFixed(2)} | Y: {coords.y > 0 ? `+${coords.y.toFixed(2)}` : coords.y.toFixed(2)}
            </div>
        </div>
    );
}

export default FocalPointSelector;
