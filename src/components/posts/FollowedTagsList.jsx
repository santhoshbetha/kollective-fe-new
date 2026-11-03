// src/components/posts/FollowedTagsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';

export function FollowedTagsList({ className = '' }) {
    const navigate = useNavigate();
    const [followedTags, setFollowedTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchFollowedTags = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch('/api/v1/followed_tags');
                const rawList = res?.followed_tags || res?.data || (Array.isArray(res) ? res : []);
                const normalized = (Array.isArray(rawList) ? rawList : []).map((item) => {
                    if (typeof item === 'string') return item.replace(/^#/, '');
                    return (item?.name || item?.tag || '').replace(/^#/, '');
                }).filter(Boolean);

                if (isMounted) {
                    setFollowedTags(normalized);
                }
            } catch (err) {
                console.warn('Failed to load followed hashtags:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchFollowedTags();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div
            id="followed-tags-sidebar"
            className={`followed-tags-list-container flex flex-col gap-2 pt-3 border-t border-white/5 ${className}`}
        >
            <div className="flex items-center justify-between px-3 text-xs font-bold uppercase tracking-wider text-text-secondary select-none">
                <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-primary-container" />
                    <span>Followed Tags</span>
                </span>
                {followedTags.length > 0 && (
                    <span className="text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded-full text-text-secondary">
                        {followedTags.length}
                    </span>
                )}
            </div>

            {isLoading && followedTags.length === 0 ? (
                <div className="px-3 py-2 text-xs text-text-secondary/50 font-mono animate-pulse">
                    Loading tags...
                </div>
            ) : followedTags.length === 0 ? (
                <div className="px-3 py-1.5 text-xs text-text-secondary/50 italic">
                    No followed tags yet
                </div>
            ) : (
                <div className="flex flex-col gap-1 overflow-y-auto max-h-48 scrollbar-thin pr-1">
                    {followedTags.map((tag) => {
                        const cleanTag = tag.trim().toLowerCase();
                        return (
                            <button
                                key={cleanTag}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    navigate(`/timelines/tag/${encodeURIComponent(cleanTag)}`);
                                }}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-container-high/40 transition-all text-left cursor-pointer border border-transparent hover:border-white/5"
                            >
                                <span># {cleanTag}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default FollowedTagsList;

