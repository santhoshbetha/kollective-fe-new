// src/features/notifications/NotificationRow.jsx
import React from 'react';
import { useToggleFollowUser } from './useNotificationsFeature';
import { Heart, MessageSquare, Award, Calendar, Bell, Check } from 'lucide-react';
import { cn } from "@/lib/utils"; // Adjust to your local helper path

export function NotificationRow({ item }) {
    const toggleFollowUser = useToggleFollowUser();

    // Check both potential backend unread indicators
    const isUnread = Boolean(item?.unread || item?.is_read === false || item?.read === false);

    // Handle inline optimistic updates for follower relationships
    const handleFollowBack = (e, username) => {
        e.stopPropagation();
        if (!username) return;
        toggleFollowUser.mutate(username);
    };

    return (
        <div className="w-full pb-4">
            <div className={cn(
                "rounded-2xl p-6 border relative overflow-hidden transition-all duration-300 flex items-start gap-4 text-left font-sans",
                isUnread
                    ? "border-l-4 border-l-primary-container border-white/10 bg-primary-container/[0.03]"
                    : "border-white/5 bg-surface-container-low"
            )}>
                {isUnread && <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-primary-container pointer-events-none"></div>}

                {item?.user ? (
                    <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 p-[1px] select-none",
                        isUnread ? "border-primary-container" : "border-white/10"
                    )}>
                        <img
                            alt={item.user.name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                            src={item.user.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23555">?</text></svg>'}
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest border border-white/5 flex items-center justify-center flex-shrink-0 select-none">
                        {item?.type === 'event' ? (
                            <Calendar className="w-5 h-5 text-primary-container" />
                        ) : (
                            <Bell className="w-5 h-5 text-primary-container" />
                        )}
                    </div>
                )}

                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 text-base md:text-lg">
                            {item?.type === 'like' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{item.user?.name || 'Someone'}</strong> liked your post <span className="text-primary-container font-serif italic">"{item.postTitle || 'Untitled'}"</span>
                                </p>
                            )}
                            {item?.type === 'follow' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{item.user?.name || 'Someone'}</strong> started following you
                                </p>
                            )}
                            {item?.type === 'comment' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{item.user?.name || 'Someone'}</strong> commented on your pulse
                                </p>
                            )}
                            {item?.type === 'event' && (
                                <p className="text-text-primary font-extrabold">
                                    Event starting soon: {item.title || 'Community Mobilization'}
                                </p>
                            )}
                            {item?.type === 'highlight' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{item.user?.name || 'System'}</strong> {item.title}
                                </p>
                            )}

                            {item?.description && (
                                <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed">{item.description}</p>
                            )}

                            {item?.commentText && (
                                <blockquote className="border-l-2 border-white/10 pl-3 py-1 mt-2 text-sm text-text-secondary italic font-serif">
                                    "{item.commentText}"
                                </blockquote>
                            )}
                        </div>
                        <span className="text-xs text-text-secondary font-mono whitespace-nowrap shrink-0 pt-0.5 select-none">{item?.time || 'Recent'}</span>
                    </div>

                    <div className="pt-2 flex items-center gap-3 select-none font-mono text-[10px]">
                        {item?.type === 'like' && (
                            <span className="flex items-center gap-1.5 font-bold text-primary-container bg-primary-container/10 border border-primary-container/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                <Heart className="w-3 h-3 fill-current" />
                                <span>New Like</span>
                            </span>
                        )}
                        {item?.type === 'comment' && (
                            <span className="flex items-center gap-1.5 font-bold text-text-primary bg-surface-container-high border border-white/5 px-3 py-1 rounded-full uppercase tracking-wider">
                                <MessageSquare className="w-3 h-3" />
                                <span>Comment</span>
                            </span>
                        )}
                        {item?.type === 'highlight' && (
                            <span className="flex items-center gap-1.5 font-bold text-text-secondary bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                <Award className="w-3 h-3 fill-current" />
                                <span>Community Highlight</span>
                            </span>
                        )}
                        {item?.type === 'follow' && (
                            <button
                                type="button"
                                onClick={(e) => handleFollowBack(e, item.user?.name)}
                                disabled={toggleFollowUser.isPending}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer border text-[10px] outline-none",
                                    item.following
                                        ? "bg-surface-container-high border-white/5 text-text-secondary"
                                        : "bg-primary-container text-white border-primary-container crimson-glow font-extrabold"
                                )}
                            >
                                {item.following ? 'Following ✓' : 'Follow Back'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
