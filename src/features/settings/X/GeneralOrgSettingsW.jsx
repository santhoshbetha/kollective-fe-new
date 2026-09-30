// src/features/settings/GeneralOrgSettings.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/auth/useAuthStore';

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
            const response = await api.put('/org-settings/profile', payload);

            updateActiveProfile(payload);
            setSuccessMessage(response.data?.message || 'Organization settings saved successfully.');
        } catch (err) {
            setErrorMessage(err.response?.data?.error || 'Failed to update organization profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-text-primary">Owner Administrative Panel</h2>
                <p className="text-sm text-text-secondary">Configure organization metadata, public directory listings, and identity properties.</p>
            </div>

            {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Organization Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary-container"
                        placeholder="e.g. Metro Tenant Union"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Mission Statement & Bio
                    </label>
                    <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl p-4 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary-container resize-none leading-relaxed"
                        placeholder="Brief summary of your collective mission..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Official External Website / Domain
                    </label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary-container"
                        placeholder="https://yourorg.org"
                    />
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary-container hover:brightness-110 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
