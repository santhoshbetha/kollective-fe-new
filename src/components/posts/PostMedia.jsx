// src/features/timeline/PostMedia.jsx
import React, { useState } from 'react';
import { KollectiveVideoPlayer } from '../KollectiveVideoPlayer';
import { PostMediaGrid, getObjectPosition } from './PostMediaGrid';

export { PostMediaGrid, getObjectPosition };

const isVideoUrl = (urlStr) => {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const lower = urlStr.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.m4v') || lower.endsWith('.ogg') || lower.endsWith('.m3u8') || lower.includes('/video/');
};

export function PostMedia({ post, setCarouselIndex, setCarouselOpen }) {
    // 🎥 Check for Video Post parameters
    let videoUrl = null;
    let isGif = post?.isGif || false;
    let posterUrl = post?.videoPoster || post?.videoThumbnail || post?.poster || null;

    if (typeof post?.video === 'string') {
        videoUrl = post.video;
    } else if (post?.video?.url) {
        videoUrl = post.video.url;
        posterUrl = posterUrl || post.video.preview_url || post.video.poster;
        isGif = isGif || post.video.type === 'gifv' || post.video.isGif;
    } else if (post?.videoUrl || post?.video_url) {
        videoUrl = post.videoUrl || post.video_url;
    } else if (Array.isArray(post?.media_attachments)) {
        const videoAttachment = post.media_attachments.find(m => m?.type === 'video' || m?.type === 'gifv' || isVideoUrl(m?.url || m?.preview_url));
        if (videoAttachment) {
            videoUrl = videoAttachment.url || videoAttachment.preview_url;
            posterUrl = posterUrl || videoAttachment.preview_url;
            isGif = isGif || videoAttachment.type === 'gifv';
        }
    }

    if (!videoUrl && typeof post?.image === 'string' && isVideoUrl(post.image)) {
        videoUrl = post.image;
    }

    const rawAttachments = (post?.media_attachments && post.media_attachments.length > 0)
        ? post.media_attachments
        : (post?.images && post.images.length > 0)
            ? post.images
            : post?.image
                ? [post.image]
                : [];
    const attachments = (Array.isArray(rawAttachments) ? rawAttachments : [rawAttachments])
        .filter(Boolean)
        .map((img, i) => {
            if (typeof img === 'object') {
                return {
                    id: img?.id || `att-${i}`,
                    url: img?.url || img?.preview_url || img?.static_url || img?.src || '',
                    alt: img?.description || img?.alt || img?.imageMeta || '',
                    focal_x: img?.focal_x ?? img?.meta?.focus?.x ?? post?.focal_x ?? 0,
                    focal_y: img?.focal_y ?? img?.meta?.focus?.y ?? post?.focal_y ?? 0,
                    aspect_ratio: img?.aspect_ratio ?? img?.meta?.original?.aspect
                };
            }
            return {
                id: `att-${i}`,
                url: img,
                alt: '',
                focal_x: post?.focal_x ?? 0,
                focal_y: post?.focal_y ?? 0
            };
        })
        .filter((item) => Boolean(item.url) && !isVideoUrl(item.url));

    const hasMedia = Boolean(videoUrl) || attachments.length > 0;

    // 🛡️ Soapbox Rule: Check if the media should be masked behind a content warning blur
    const isSensitive = !!post?.contentWarning;
    const [isRevealed, setIsRevealed] = useState(!isSensitive);

    if (!hasMedia) return null;

    return (
        <div className="status-media-wrapper w-full mt-3 relative rounded-2xl overflow-hidden border border-white/5 shadow-sm group" onClick={(e) => e.stopPropagation()}>

            {/* ⚠️ SENSITIVE MEDIA SHIELD MASK (The Soapbox Pattern) */}
            {!isRevealed && (
                <div
                    onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                    className="absolute inset-0 bg-[#141414]/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all hover:bg-[#141414]/70"
                >
                    <span className="material-symbols-outlined text-primary-container text-[32px] animate-pulse">visibility_off</span>
                    <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">Sensitive Content Guarded</p>
                        <p className="text-xs text-text-secondary mt-0.5">Click surface to reveal media layout parameters</p>
                    </div>
                </div>
            )}

            {/* 🎥 MASTODON VIDEO PLAYER INJECTION */}
            {videoUrl ? (
                <KollectiveVideoPlayer
                    src={videoUrl}
                    poster={posterUrl || (attachments[0] && !isVideoUrl(attachments[0]) ? attachments[0] : undefined)}
                    isGif={isGif}
                    title={post?.title}
                />
            ) : (
                /* 🖼️ DYNAMIC MULTI-IMAGE MOSAIC GRID MATRICES (PostMediaGrid) */
                <PostMediaGrid
                    mediaAttachments={attachments}
                    onMediaClick={(idx) => {
                        if (setCarouselIndex) setCarouselIndex(idx);
                        if (setCarouselOpen) setCarouselOpen(true);
                    }}
                />
            )}
        </div>
    );
}

export default PostMedia;
