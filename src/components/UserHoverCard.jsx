import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationBadge } from './VerificationBadge';
import { Link } from 'lucide-react';
import { cn } from "@/lib/utils";
// Import your design system's Radix portal primitives
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

export const UserHoverCard = ({ author, children }) => {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);

    const getProfileData = (name) => {
        switch (name) {
            case 'Marcus Vane':
                return {
                    bio: 'Chief Coordinator. Building frontline local resilience protocols. Backing sovereign digital networks.',
                    followers: '14.2K',
                    website: 'marcusvane.org'
                };
            default:
                return {
                    bio: 'Active contributor to the decentralized community feed. Building sovereign local structures.',
                    followers: '2.5K',
                    website: 'kollective.social'
                };
        }
    };

    const profile = getProfileData(author.name);

    const handleNavigation = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const username = (author.handle || author.name.toLowerCase().replace(/\s+/g, '_')).replace('@', '');
        navigate(`/profile/${username}`, { state: { fromCard: true } });
    };

    return (
        <HoverCard openDelay={200} closeDelay={250}>
            {/* Trigger element wraps your child avatar/username safely */}
            <HoverCardTrigger asChild>
                <span className="cursor-pointer inline-flex items-center" onClick={handleNavigation}>
                    {children}
                </span>
            </HoverCardTrigger>

            {/* HoverCardContent uses a Portal under the hood, completely safe from overlap */}
            <HoverCardContent
                onClick={(e) => e.stopPropagation()}
                align="start"
                side="bottom"
                sideOffset={8}
                className="w-72 bg-[var(--surface-container)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[999]"
            >
                {/* Summary Block */}
                <div className="flex gap-3 items-start mb-3">
                    {author.avatar ? (
                        <img
                            alt={author.name}
                            className="w-11 h-11 rounded-xl object-cover border border-border/20 shrink-0 opacity-90"
                            src={author.avatar}
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-sm text-primary/70 uppercase shrink-0">
                            {author.name[0]}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <h4
                            onClick={handleNavigation}
                            className="font-semibold text-foreground/90 text-sm truncate flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        >
                            {author.name}
                            {author.verified && <VerificationBadge type="journalist" size="md" className="opacity-80" />}
                        </h4>

                        <p className="text-xs text-muted-foreground/60 truncate font-medium mt-0.5">
                            {author.handle || `@${author.name.toLowerCase().replace(/\s+/g, '_')}`}@kollective.social
                        </p>
                    </div>
                </div>

                {/* Bio Node */}
                <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3 line-clamp-3 font-normal">
                    {profile.bio}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-xs mb-3 border-t border-border/20 pt-2.5">
                    <span className="font-medium text-muted-foreground/70">{author.role || 'Citizen'}</span>
                    <a
                        href={`https://${profile.website}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#c2185b]/80 hover:text-[#c2185b] font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                        <Link className="w-3 h-3 opacity-60" />
                        {profile.website}
                    </a>
                </div>

                {/* Followers Count */}
                <p className="text-xs text-muted-foreground/70 mb-4">
                    <strong className="font-semibold text-foreground/80 mr-0.5">{profile.followers}</strong> followers
                </p>

                {/* Follow CTA Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIsFollowing(!isFollowing);
                    }}
                    className={cn(
                        "w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-xs",
                        isFollowing
                            ? "bg-[var(--surface-container)]/50 border border-border/30 text-muted-foreground/80 hover:text-foreground"
                            : "bg-[#c2185b]/80 hover:bg-[#c2185b] text-white/90 hover:text-white"
                    )}
                >
                    {isFollowing ? 'Following ✓' : 'Follow'}
                </button>
            </HoverCardContent>
        </HoverCard>
    );
};