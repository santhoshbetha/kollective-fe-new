import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationBadge } from './VerificationBadge';

export const UserHoverCard = ({ author, children }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const timeoutRef = useRef(null);

  // Mock profile data based on name to match attached design
  const getProfileData = (name) => {
    switch (name) {
      case 'Marcus Vane':
        return {
          bio: 'Chief Coordinator. Building frontline local resilience protocols. Backing sovereign digital networks.',
          followers: '14.2K',
          website: 'marcusvane.org'
        };
      case 'Elena Thorne':
        return {
          bio: 'Cooperative researcher and digital autonomy advocate. Investigating decentralized alternative wealth models.',
          followers: '8.6K',
          website: 'elenathorne.net'
        };
      case 'Ars Technica':
        return {
          bio: 'Original news, reviews, analysis of tech trends, and expert advice on the most...',
          followers: '226K',
          website: 'arstechnica.com'
        };
      default:
        return {
          bio: 'Active contributor to the decentralized community feed. Building sovereign local structures.',
          followers: '2.5K',
          website: 'kollective.org'
        };
    }
  };

  const profile = getProfileData(author.name);

  const handleMouseEnter = () => {
    console.log('HoverCard: Mouse Enter on', author.name);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log('HoverCard: Setting visible to true for', author.name);
      setVisible(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    console.log('HoverCard: Mouse Leave from', author.name);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log('HoverCard: Setting visible to false for', author.name);
      setVisible(false);
    }, 300);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger element (avatar or username wrapper) */}
      <span
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          const username = (author.handle || author.name.toLowerCase().replace(/\s+/g, '_')).replace('@', '');
          navigate(`/profile/${username}`, { state: { fromCard: true } });
        }}
      >
        {children}
      </span>

      {/* Hover Card Popover */}
      {visible && (
        <div
          onClick={(e) => e.stopPropagation()} // Prevents navigating to post details page
          className="absolute left-0 mt-2 w-72 bg-surface-container-lowest border border-white/10 rounded-xl p-4 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Profile Summary */}
          <div className="flex gap-3 items-start mb-3">
            {author.avatar ? (
              <img
                alt={author.name}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                src={author.avatar}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center font-bold text-sm text-white uppercase flex-shrink-0">
                {author.name[0]}
              </div>
            )}

            <div className="overflow-hidden">
              <h4 className="font-bold text-text-primary text-sm truncate flex items-center gap-1">
                {author.name}
                {author.verified && (
                  <VerificationBadge type="journalist" size="md" />
                )}
              </h4>

              <p className="text-[15px] text-text-secondary truncate">
                {author.handle || `@${author.name.toLowerCase().replace(' ', '_')}`}@kollective.social
              </p>
            </div>
          </div>

          {/* Bio text */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            {profile.bio}
          </p>

          {/* Metadata row */}
          <div className="flex items-center justify-between text-[15px] text-text-secondary mb-4 border-t border-white/5 pt-3">
            <span className="font-semibold">{author.role || 'Citizen'}</span>
            <a
              href={`https://${profile.website}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-green-400 hover:underline flex items-center gap-0.5 font-bold"
            >
              ✓ {profile.website}
            </a>
          </div>

          {/* Stats count */}
          <p className="text-sm text-text-primary mb-4">
            <strong className="font-extrabold">{profile.followers}</strong> <span className="text-text-secondary">followers</span>
          </p>

          {/* Follow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsFollowing(!isFollowing);
            }}
            className={`w-full py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all active:scale-98 cursor-pointer ${isFollowing
              ? 'bg-surface-container-high border border-white/10 text-text-secondary'
              : 'bg-primary-container text-white crimson-glow hover:brightness-110'
              }`}
          >
            {isFollowing ? 'Following ✓' : 'Follow'}
          </button>
        </div>
      )}
    </div>
  );
};
