// src/features/notifications/NotificationRow.jsx
import { useState } from 'react';
import { useToggleFollowUser } from './useNotificationsFeature';
import { Heart, MessageSquare, Award, Calendar, Bell, Scale } from 'lucide-react';
import { ModerationAppealForm } from '../moderation/components/ModerationAppealForm';
import { cn } from "@/lib/utils";

export function NotificationRow({ item }) {
    const toggleFollowUser = useToggleFollowUser();
    const [isAppealOpen, setIsAppealOpen] = useState(false);

    // Check both potential backend unread indicators
    const isUnread = Boolean(item?.unread || item?.is_read === false || item?.read === false);

    const isModerationNotice = Boolean(
        item?.type === 'report' ||
        item?.type === 'moderation' ||
        item?.type === 'soft_delete' ||
        item?.metadata?.sub_type === 'post_rejected' ||
        item?.title?.toLowerCase().includes('soft-delete') ||
        item?.title?.toLowerCase().includes('moderation') ||
        item?.description?.toLowerCase().includes('soft-delete') ||
        item?.description?.toLowerCase().includes('rejected') ||
        item?.preview?.toLowerCase().includes('soft-delete') ||
        item?.preview?.toLowerCase().includes('rejected')
    );

    // Handle inline optimistic updates for follower relationships
    const handleFollowBack = (e, username) => {
        e.stopPropagation();
        if (!username) return;
        toggleFollowUser.mutate(username);
    };

    const actor = item?.actor || item?.user;
    const actorName = actor?.name || actor?.username || 'Someone';
    const actorAvatar = actor?.avatar || actor?.avatar_url || 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23555">?</text></svg>';

    return (
        <div className="w-full pb-4">
            <div className={cn(
                "notification-item rounded-2xl p-6 border relative overflow-hidden transition-all duration-300 flex items-start gap-4 text-left font-sans",
                isUnread
                    ? "border-l-4 border-l-primary-container border-white/10 bg-primary-container/[0.03]"
                    : "border-white/5 bg-surface-container-low"
            )}>
                {isUnread && <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-primary-container pointer-events-none"></div>}

                {actor ? (
                    <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 p-[1px] select-none",
                        isUnread ? "border-primary-container" : "border-white/10"
                    )}>
                        <img
                            alt={actorName}
                            className="w-full h-full rounded-full object-cover"
                            src={actorAvatar}
                        />
                    </div>
                ) : (
                    <div className={cn(
                        "w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center flex-shrink-0 select-none",
                        isModerationNotice ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-surface-container-highest"
                    )}>
                        {isModerationNotice ? (
                            <Scale className="w-5 h-5 text-amber-400 stroke-[2.5px]" />
                        ) : item?.type === 'event' ? (
                            <Calendar className="w-5 h-5 text-primary-container" />
                        ) : (
                            <Bell className="w-5 h-5 text-primary-container" />
                        )}
                    </div>
                )}

                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 text-base md:text-lg">
                            {(item?.type === 'like' || item?.type === 'favourite') && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{actorName}</strong> liked your post <span className="text-primary-container font-serif italic">"{item.postTitle || item.preview_text || 'Untitled'}"</span>
                                </p>
                            )}
                            {item?.type === 'follow' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{actorName}</strong> started following you
                                </p>
                            )}
                            {item?.type === 'comment' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{actorName}</strong> commented on your pulse
                                </p>
                            )}
                            {item?.type === 'mention' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{actorName}</strong> mentioned you: <span className="text-primary-container font-serif italic">"{item.preview || item.preview_text || 'new mention'}"</span>
                                </p>
                            )}
                            {item?.type === 'post' && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{actorName}</strong> posted <span className="text-primary-container font-serif italic">"{item.postTitle || item.title || item.preview || 'new post'}"</span>
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
                            {isModerationNotice && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold text-amber-400">Governance Notice:</strong> {item.title || item.preview || "A moderation soft-delete action was executed on your content."}
                                </p>
                            )}
                            {!['like', 'favourite', 'follow', 'comment', 'mention', 'post', 'event', 'highlight'].includes(item?.type) && !isModerationNotice && (
                                <p className="text-text-primary">
                                    <strong className="font-extrabold">{actorName}</strong> {item?.title || item?.preview || item?.preview_text || 'interacted with you'}
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
                        {isModerationNotice && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAppealOpen(true);
                                }}
                                className="px-4 py-1.5 rounded-xl font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer border text-[10px] outline-none bg-primary-container text-white border-primary-container crimson-glow font-extrabold flex items-center gap-1.5"
                            >
                                <Scale className="w-3.5 h-3.5 stroke-[2.5px]" />
                                <span>Dispute Soft-Delete</span>
                            </button>
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

            <ModerationAppealForm
                isOpen={isAppealOpen}
                onClose={() => setIsAppealOpen(false)}
                incidentId={item?.incident_id || item?.incidentId || item?.post_id || item?.target_id || item?.id}
            />
        </div>
    );
}
