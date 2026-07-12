// src/pages/LocalBusinessesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalBusinessesFeed } from '../features/businesses/LocalBusinessesFeed';

export function LocalBusinessesPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-headline-md font-extrabold text-text-primary tracking-tight">Local Partners</h2>
                    <p className="text-text-secondary text-body-sm">Discover and support decentralized business networks operating inside your community scale.</p>
                </div>

                <button
                    onClick={() => navigate('/businesses/register')}
                    className="bg-primary-container text-white font-bold text-label-sm px-5 py-3 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                    Register Business
                </button>
            </div>

            {/* Grid rendering list calculations map out securely inside feature layer */}
            <LocalBusinessesFeed />
        </div>
    );
}
