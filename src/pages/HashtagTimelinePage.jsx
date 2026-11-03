// src/pages/HashtagTimelinePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useHashtagTimelineQuery } from '../features/timeline/useHashtagTimeline';
import { apiFetch } from '../api/apiClient';
import { PostCard } from '../components/posts/PostCard';

export const HashtagTimelinePage = () => {
    const { tag: routeTag, id: routeId } = useParams();
    const tag = (routeTag || routeId || '').toLowerCase();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, status } = useHashtagTimelineQuery(tag);

    const [isFollowingTag, setIsFollowingTag] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Synchronize initial follow state if present in the response
    useEffect(() => {
        if (data && typeof data === 'object') {
            if (data.following !== undefined) {
                setIsFollowingTag(Boolean(data.following));
            } else if (data.pages?.[0]?.following !== undefined) {
                setIsFollowingTag(Boolean(data.pages[0].following));
            }
        }
    }, [data]);

    // Extract posts supporting diverse backend and mock payload formats
    const posts = Array.isArray(data)
        ? data
        : (Array.isArray(data?.posts)
            ? data.posts
            : (Array.isArray(data?.data)
                ? data.data
                : (Array.isArray(data?.entries)
                    ? data.entries
                    : (data?.pages ? data.pages.flatMap((page) => Array.isArray(page) ? page : (page?.posts || page?.data || page?.entries || [])) : []))));

    const handleToggleFollow = async () => {
        if (isPending || !tag) return;
        setIsPending(true);
        const nextState = !isFollowingTag;
        setIsFollowingTag(nextState);

        try {
            const cleanTag = encodeURIComponent(tag);
            const endpoint = nextState
                ? `/api/v1/tags/${cleanTag}/follow`
                : `/api/v1/tags/${cleanTag}/unfollow`;
            await apiFetch(endpoint, { method: 'POST' });

            if (nextState) {
                toast.success(`Following #${tag}`);
            } else {
                toast.success(`Unfollowed #${tag}`);
            }

            queryClient.invalidateQueries({ queryKey: ['timelines', 'hashtag', tag] });
            queryClient.invalidateQueries({ queryKey: ['followed_tags'] });
            queryClient.invalidateQueries({ queryKey: ['followed-tags'] });
        } catch (err) {
            console.error('Failed to toggle hashtag follow status:', err);
            setIsFollowingTag(!nextState);
            toast.error('Failed to update hashtag follow status');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20 w-full animate-in fade-in duration-200">

            {/* 🧭 Top Action Navigation Header Toolbar Panel */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 select-none">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container border border-white/5 flex items-center justify-center text-primary-container text-xl font-mono font-black shadow-inner">
                        #
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-primary tracking-tight">
                            # {tag}
                        </h1>
                        <p className="text-xs text-text-secondary mt-0.5">Public collective channel stream tracking topic properties</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={handleToggleFollow}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isFollowingTag
                            ? 'bg-surface-container-high border-white/10 text-text-secondary hover:text-white'
                            : 'bg-primary-container text-white border-primary-container crimson-glow font-black hover:opacity-90'
                            }`}
                    >
                        {isPending ? 'Updating...' : (isFollowingTag ? 'Following' : 'Follow Tag')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-surface-container border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer hover:bg-surface-container-high transition-colors"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* 🥞 FEED STREAM CONTAINER */}
            {status === 'pending' || isLoading ? (
                <div className="py-12 text-center">
                    <div className="w-6 h-6 rounded-full border-2 border-t-primary-container border-white/10 animate-spin mx-auto" />
                </div>
            ) : posts.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-container-low/40 rounded-2xl">
                    <p className="text-sm text-text-secondary">No recorded updates registered under this hashtag coordinate yet.</p>
                </div>
            ) : (
                <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-2xl overflow-hidden shadow-2xl w-full divide-y divide-white/5">
                    {posts.map((post, index) => (
                        <PostCard key={post.id || index} post={post} isLast={index === posts.length - 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HashtagTimelinePage;
