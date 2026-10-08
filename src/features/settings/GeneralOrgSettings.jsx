// src/features/settings/GeneralOrgSettings.jsx
import React, { useState } from 'react';
import { apiFetch } from '../../api/apiClient';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function GeneralOrgSettings({ activeOrgId }) {
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const updateActiveProfile = useAuthStore((state) => state.updateActiveProfile);

    const [name, setName] = useState(activeAccount?.name || '');
    const [bio, setBio] = useState(activeAccount?.bio || '');
    const [website, setWebsite] = useState(activeAccount?.website || 'https://kollective.social');
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const payload = { name, bio, website };
            const response = await apiFetch('/org-settings/profile', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            updateActiveProfile(payload);
            setSuccessMessage(response?.message || 'Organization settings saved successfully.');
        } catch (err) {
            setErrorMessage(err.data?.error || err.message || 'Failed to update organization profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 text-left font-sans animate-in fade-in duration-200">
            {/* Upscaled Heading Elements */}
            <div className="border-b dark:border-white/5 border-black/5 pb-4 select-none">
                <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    Owner Administrative Panel
                </h2>
                <p className="text-md text-text-secondary mt-0.5 font-medium">
                    Configure organization metadata, public directory listings, and identity properties.
                </p>
            </div>

            {/* Status Display Blocks */}
            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 max-w-xl animate-in slide-in-from-top-2 duration-150">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold rounded-xl flex items-center gap-2.5 max-w-xl animate-in slide-in-from-top-2 duration-150">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Redesigned Form Fields Layer */}
            <form onSubmit={handleSave} className="space-y-5 flex flex-col w-full max-w-xl">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">
                        Organization Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-base text-text-primary font-bold placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container transition-colors"
                        placeholder="e.g. Metro Tenant Union"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">
                        Mission Statement &amp; Bio
                    </label>
                    <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl p-4 text-base text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container resize-none leading-relaxed transition-colors font-medium"
                        placeholder="Brief summary of your collective mission..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-text-secondary uppercase tracking-wider select-none">
                        Official External Website / Domain
                    </label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-white dark:bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-primary-container font-mono transition-colors"
                        placeholder="https://yourorg.org"
                    />
                </div>

                {/* Form Controls Action Row */}
                <div className="pt-2 flex justify-end font-mono text-xs uppercase font-bold tracking-wider">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-black hover:brightness-105 active:scale-95 transition-all crimson-glow cursor-pointer border-none shadow-md disabled:opacity-40 select-none outline-none"
                    >
                        <Save className="w-4 h-4 stroke-[2.5px]" />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
