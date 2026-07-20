// src/features/timeline/PostContent.jsx
import React, { useState, useRef, useEffect } from 'react';
import { PollCard } from '../polls/PollCard';
import { EventCard } from '../events/EventCard';

export function PostContent({ post, isFocus }) {
    const [isTruncated, setIsTruncated] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const textRef = useRef(null);

    // ⏱️ Symmetrically check pixel height properties upon mounting
    useEffect(() => {
        if (!textRef.current || isFocus) return; // Never truncate if the post is explicitly focused

        // If the text block layout expands past 280px, arm the truncation guard flags
        if (textRef.current.clientHeight > 280) {
            setIsTruncated(true);
        }
    }, [post?.text, isFocus]);

    // Your existing character-safe text mention highlighter routine
    const renderTextTokens = (text) => {
        if (!text) return null;
        return text.split(/(\s+)/).map((word, idx) => {
            if (word.startsWith('@')) {
                return (
                    <span key={idx} className="text-primary-container font-black hover:underline cursor-pointer">
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    return (
        <div className="status-content-container flex flex-col gap-3 w-full pt-5">

            {/* 📝 Core Text & Truncation Segment Section */}
            <div
                ref={textRef}
                className={`text-text-primary/90 leading-relaxed transition-all relative ${isTruncated && !isExpanded ? 'max-h-[240px] overflow-hidden' : 'max-h-none'
                    }`}
            >
                <p className={isFocus ? 'text-lg text-text-primary' : 'text-md'}>
                    {renderTextTokens(post?.text)}
                </p>

                {/* Linear opacity fading shield layer for truncated mobile views */}
                {isTruncated && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
                )}
            </div>

            {/* 🔘 Dynamic Expand Trigger Toggle */}
            {isTruncated && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className="text-xs font-bold text-primary-container hover:underline w-fit cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? 'unfold_less' : 'unfold_more'}
                    </span>
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}

            {/* ========================================================================= */}
            {/*  ⚡ DETACHED INLINE SUB-WIDGET INJECTIONS (The Soapbox Pattern Complete)  */}
            {/* ========================================================================= */}

            {/* If this post record contains a sub-attached Poll, inject the interactive form layout directly */}
            {post?.poll && (
                <div className="mt-2 bg-[#111111] rounded-2xl p-1 border border-white/5 shadow-inner">
                    <PollCard poll={post?.poll} />
                </div>
            )}

            {/* If this post record is tied directly to an organizing mobilization event asset */}
            {post?.event && (
                <div className="mt-2 shadow-xl">
                    {/* Explicitly passing down a mock array to keep your finite events component safe */}
                    <EventCard event={post?.event} />
                </div>
            )}

        </div>
    );
}
