// src/pages/CalendarPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import { CalendarView } from '../features/calendar/CalendarView';
import { Calendar as CalendarIcon, MapPin, MapPinOff } from 'lucide-react';

export function CalendarPage() {
    const navigate = useNavigate();

    // 🗺️ Location & Access Check
    const userState = useStore((state) => state.userState);
    const streetAddress = useStore((state) => state.streetAddress);
    const currentUser = useAuthStore((state) => state.user);

    const hasAddressOrCoords = Boolean((streetAddress && streetAddress.trim()) || currentUser?.street_address || currentUser?.latitude);
    const hasState = Boolean((userState && userState.trim()) || currentUser?.state || currentUser?.origin_state);
    const canAccessCalendar = hasAddressOrCoords || hasState;

    if (!canAccessCalendar) {
        return (
            <div className="max-w-[700px] mx-auto my-16 p-8 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mx-auto text-primary-container">
                    <span className="material-symbols-outlined text-3xl">location_off</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-text-primary tracking-tight">Calendar Access Restricted</h2>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-md mx-auto">
                        To view your personalized community event schedule, please opt-in and provide either your <span className="font-bold text-text-primary">State / Province</span> or <span className="font-bold text-text-primary">Street Address</span> in your Account Settings.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/settings?tab=index')}
                    className="px-6 py-3 bg-primary-container hover:bg-primary-container/90 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 border-none"
                >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    Go to Settings
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6 pb-20 w-full relative">
            {/* Back Navigation Bar */}
            <div className="sticky top-[60px] z-30 bg-surface/90 backdrop-blur-md py-3 border-b dark:border-white/5 border-black/5 flex items-center justify-between">
                <button
                    onClick={() => navigate('/events')}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-bold text-sm group cursor-pointer border-none bg-transparent"
                >
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
                        arrow_back
                    </span>
                    <span>Back to Events</span>
                </button>
            </div>

            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider mb-3">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Personal & Community Schedule</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-text-primary font-headline-lg">
                        Events Calendar 📅
                    </h1>
                    <p className="text-text-secondary mt-2 font-semibold text-base md:text-lg">
                        Track your upcoming community events, RSVPs, and organized activities.
                    </p>
                </div>
            </div>

            {/* Calendar Core Component */}
            <CalendarView />
        </div>
    );
}

export default CalendarPage;
