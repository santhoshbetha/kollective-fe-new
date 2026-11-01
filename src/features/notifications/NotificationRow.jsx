// src/features/notifications/NotificationRow.jsx
import { useState, useMemo } from 'react';
import { useToggleFollowUser } from './useNotificationsFeature';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useAccountsStore } from '../../store/useAccountsStore';
import { getAvatarInitials, getTeamsBackgroundColor } from '../../utils/avatarUtils';
import { Heart, MessageSquare, Award, Calendar, Bell, Scale } from 'lucide-react';
import { ModerationAppealForm } from '../moderation/components/ModerationAppealForm';
import { cn } from "@/lib/utils";

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

export function NotificationRow({ item, notification: propNotification }) {
    const notification = item || propNotification;
    const toggleFollowUser = useToggleFollowUser();
    const [isAppealOpen, setIsAppealOpen] = useState(false);

    const authUser = useAuthStore((state) => state?.user);
    const storeFollowingIds = useAccountsStore((state) => state?.following_ids || state?.followingIds || EMPTY_ARRAY);
    const accountEntities = useAccountsStore((state) => state?.entities || EMPTY_OBJECT);

    const followingIds = useMemo(() => {
        const authIds = authUser?.following_ids || authUser?.followingIds || EMPTY_ARRAY;
        const entityIds = Object.values(accountEntities)
            .filter((acc) => acc?.following)
            .map((acc) => String(acc.id));
        return Array.from(new Set([
            ...(Array.isArray(authIds) ? authIds.map(String) : []),
            ...(Array.isArray(storeFollowingIds) ? storeFollowingIds.map(String) : []),
            ...entityIds
        ]));
    }, [authUser, storeFollowingIds, accountEntities]);

    // Check both potential backend unread indicators
    const isUnread = Boolean(notification?.unread || notification?.is_read === false || notification?.read === false);

    const isModerationNotice = Boolean(
        notification?.type === 'report' ||
        notification?.type === 'moderation' ||
        notification?.type === 'soft_delete' ||
        notification?.metadata?.sub_type === 'post_rejected' ||
        notification?.title?.toLowerCase().includes('soft-delete') ||
        notification?.title?.toLowerCase().includes('moderation') ||
        notification?.description?.toLowerCase().includes('soft-delete') ||
        notification?.description?.toLowerCase().includes('rejected') ||
        notification?.preview?.toLowerCase().includes('soft-delete') ||
        notification?.preview?.toLowerCase().includes('rejected')
    );

    const actor = notification?.actor || notification?.user || notification?.account;
    const actorId = notification?.actor_id || actor?.id;
    const actorName = actor?.name || actor?.display_name || actor?.username || 'Someone';

    // 1. Avatar Pic vs. Initials Fallback Rendering
    const rawAvatarUrl = actor?.avatar_url || actor?.avatar;
    const hasValidAvatar = Boolean(
        rawAvatarUrl &&
        typeof rawAvatarUrl === 'string' &&
        rawAvatarUrl.trim() !== '' &&
        rawAvatarUrl !== '/default-avatar.jpg'
    );
    const actorInitials = (
        actor?.initials
            ? String(actor.initials).trim().toUpperCase()
            : getAvatarInitials(actorName)
    ) || '?';
    const avatarBgColor = getTeamsBackgroundColor(actorName || actorId || 'user');

    // 2. Conditional "Follow Back" Button Clearance Logic
    const isAlreadyFollowing = Boolean(
        notification?.following ||
        actor?.following ||
        (actorId && followingIds.includes(String(actorId)))
    );

    const handleFollowBack = (e, targetIdentifier) => {
        e.stopPropagation();
        if (!targetIdentifier) return;
        toggleFollowUser.mutate(targetIdentifier);
    };

    const mentionText = notification?.body || notification?.text || notification?.content || notification?.preview || notification?.preview_text || 'new mention';
    const followBodyText = notification?.body || notification?.preview || notification?.preview_text;

    return (
        <div className="w-full pb-4">
            <div className={cn(
                "notification-item rounded-2xl p-6 border relative transition-all duration-300 flex items-start gap-4 text-left font-sans",
                isUnread
                    ? "border-l-4 border-l-primary-container border-white/10 bg-primary-container/[0.03]"
                    : "border-white/5 bg-surface-container-low"
            )}>
                {isUnread && <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-primary-container pointer-events-none"></div>}

                {actor ? (
                    <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 p-[1px] select-none flex items-center justify-center",
                        isUnread ? "border-primary-container" : "border-white/10"
                    )}>
                        {hasValidAvatar ? (
                            <img
                                alt={actorName}
                                className="w-full h-full rounded-full object-cover"
                                src={rawAvatarUrl}
                            />
                        ) : (
                            <div
                                style={{ backgroundColor: avatarBgColor }}
                                className="w-full h-full rounded-full flex items-center justify-center font-bold text-white uppercase select-none text-sm tracking-wider leading-none"
                            >
                                <span>{actorInitials}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={cn(
                        "w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center flex-shrink-0 select-none",
                        isModerationNotice ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-surface-container-highest"
                    )}>
                        {isModerationNotice ? (
                            <Scale className="w-5 h-5 text-amber-400 stroke-[2.5px]" />
                        ) : notification?.type === 'event' ? (
                            <Calendar className="w-5 h-5 text-primary-container" />
                        ) : (
                            <Bell className="w-5 h-5 text-primary-container" />
                        )}
                    </div>
                )}

                {/* 3. Flexbox Text Clamping Overrides (Multi-line natural word wrapping) */}
                <div className="flex-1 min-w-0 space-y-1 break-words whitespace-normal">
                    <div className="flex justify-between items-start gap-4 w-full min-w-0">
                        <div className="flex-1 min-w-0 text-base md:text-lg break-words whitespace-normal">
                            {(notification?.type === 'like' || notification?.type === 'favourite') && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actorName}</strong> liked your post <span className="text-primary-container font-serif italic break-words whitespace-normal">"{notification.postTitle || notification.body || notification.preview_text || notification.preview || 'Untitled'}"</span>
                                </p>
                            )}
                            {notification?.type === 'follow' && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actorName}</strong>{' '}
                                    {followBodyText
                                        ? followBodyText.replace(new RegExp(`^${actorName}\\s*`, 'i'), '')
                                        : 'started following you'}
                                </p>
                            )}
                            {(notification?.type === 'comment' || notification?.type === 'reply') && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actorName}</strong> commented on your pulse
                                    {notification?.body ? `: "${notification.body}"` : ''}
                                </p>
                            )}
                            {notification?.type === 'mention' && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actorName}</strong> mentioned you: <span className="text-primary-container font-serif italic break-words whitespace-normal">"{mentionText}"</span>
                                </p>
                            )}
                            {notification?.type === 'post' && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actorName}</strong> posted <span className="text-primary-container font-serif italic break-words whitespace-normal">"{notification.postTitle || notification.title || notification.body || notification.preview || 'new post'}"</span>
                                </p>
                            )}
                            {notification?.type === 'event' && (
                                <p className="text-text-primary font-extrabold break-words whitespace-normal">
                                    Event starting soon: {notification.title || notification.body || 'Community Mobilization'}
                                </p>
                            )}
                            {notification?.type === 'highlight' && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actor?.name || 'System'}</strong> {notification.title || notification.body}
                                </p>
                            )}
                            {isModerationNotice && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold text-amber-400">Governance Notice:</strong> {notification.title || notification.body || notification.preview || "A moderation soft-delete action was executed on your content."}
                                </p>
                            )}

                            {!['like', 'favourite', 'follow', 'comment', 'reply', 'mention', 'post', 'event', 'highlight'].includes(notification?.type) && !isModerationNotice && (
                                <p className="text-text-primary break-words whitespace-normal">
                                    <strong className="font-extrabold">{actorName}</strong>{' '}
                                    {notification?.body || notification?.title || notification?.preview || notification?.preview_text || 'interacted with you'}
                                </p>
                            )}

                            {notification?.description && (
                                <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed break-words whitespace-normal">
                                    {notification.description}
                                </p>
                            )}

                            {notification?.commentText && (
                                <blockquote className="border-l-2 border-white/10 pl-3 py-1 mt-2 text-sm text-text-secondary italic font-serif break-words whitespace-normal">
                                    "{notification.commentText}"
                                </blockquote>
                            )}
                        </div>
                        <span className="text-xs text-text-secondary font-mono whitespace-nowrap shrink-0 pt-0.5 select-none">{notification?.time || 'Recent'}</span>
                    </div>

                    <div className="pt-2 flex items-center gap-3 select-none font-mono text-[10px] flex-wrap">
                        {notification?.type === 'like' && (
                            <span className="flex items-center gap-1.5 font-bold text-primary-container bg-primary-container/10 border border-primary-container/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                <Heart className="w-3 h-3 fill-current" />
                                <span>New Like</span>
                            </span>
                        )}
                        {notification?.type === 'comment' && (
                            <span className="flex items-center gap-1.5 font-bold text-text-primary bg-surface-container-high border border-white/5 px-3 py-1 rounded-full uppercase tracking-wider">
                                <MessageSquare className="w-3 h-3" />
                                <span>Comment</span>
                            </span>
                        )}
                        {notification?.type === 'highlight' && (
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
                        {notification?.type === 'follow' && !isAlreadyFollowing && (
                            <button
                                type="button"
                                onClick={(e) => handleFollowBack(e, actorId || actor?.username || actor?.name)}
                                disabled={toggleFollowUser.isPending}
                                className="px-4 py-1.5 rounded-xl font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer border text-[10px] outline-none bg-primary-container text-white border-primary-container crimson-glow font-extrabold"
                            >
                                Follow Back
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ModerationAppealForm
                isOpen={isAppealOpen}
                onClose={() => setIsAppealOpen(false)}
                incidentId={notification?.incident_id || notification?.incidentId || notification?.post_id || notification?.target_id || notification?.id}
            />
        </div>
    );
}
