// src/features/activism/ActivistCard.jsx
import React from 'react';
import { useStore } from '../../store/useStore';
import { usePoliticalLabels } from '../../components/ui/politicalConfig';

export function ActivistCard() {
    // 1. Read the user's saved country and districts straight from the Zustand store matrix
    const country = useStore((state) => state.politicalCountry);
    const userFedDistrict = useStore((state) => state.districtFederal);
    const userUpperDistrict = useStore((state) => state.districtStateUpper);

    // 2. Fetch the country-specific labels instantly
    const { labels } = usePoliticalLabels(country);

    return (
        <div className="p-4 bg-surface-container rounded-xl border border-white/5">
            <h4 className="text-xs font-mono font-bold text-text-secondary uppercase">Your Representation Node</h4>
            <div className="mt-2 space-y-1 text-sm font-medium text-white">
                <p>{labels.federal}: <span className="text-primary-container">{userFedDistrict || 'Unassigned'}</span></p>

                {/* ⚡ Guard Check: Only render the Upper House row if the label is defined for that country */}
                {labels.stateUpper && (
                    <p>{labels.stateUpper}: <span className="text-primary-container">{userUpperDistrict || 'Unassigned'}</span></p>
                )}
            </div>
        </div>
    );
}
