import React, { useState, useEffect } from 'react';

export const InlineFormTransition = ({ show, onAnimationComplete, children }) => {
    const [shouldRender, setShouldRender] = useState(show);

    if (show && !shouldRender) {
        setShouldRender(true);
    }

    useEffect(() => {
        if (show) {
            setShouldRender(true);
        }
    }, [show]);

    const handleAnimationEnd = (e) => {
        // Prevent child component animation events (like inputs or badges) from triggering container unmount
        if (e.target !== e.currentTarget) return;
        if (!show) {
            setShouldRender(false);
            if (onAnimationComplete) onAnimationComplete();
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            onAnimationEnd={handleAnimationEnd}
            className={`w-full overflow-hidden transition-all duration-300 ease-out ${show
                ? "animate-in fade-in slide-in-from-top-4 duration-300 max-h-[500px] opacity-100 scale-100"
                : "animate-out fade-out slide-out-to-top-4 duration-200 max-h-0 opacity-0 scale-[0.98]"
                }`}
        >
            {children}
        </div>
    );
};
