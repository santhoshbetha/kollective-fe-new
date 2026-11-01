import React from "react";
import { useImageAspect } from "@/hooks/useImageAspect";

export const getObjectPosition = (focalX = 0, focalY = 0) => {
  const percentageX = ((focalX + 1) / 2) * 100;
  const percentageY = (1 - (focalY + 1) / 2) * 100;
  return `${percentageX}% ${percentageY}%`;
};

const getMediaUrl = (media) => {
  if (!media) return "";
  if (typeof media === "string") return media;
  return media.url || media.preview_url || media.static_url || media.src || "";
};

const DEFAULT_ALT = "Image content without text description";

const getMediaDescription = (media) => {
  if (!media || typeof media === "string") return "";
  return media.description || media.alt || media.imageMeta || "";
};

const getMediaAlt = (media) => {
  return getMediaDescription(media) || DEFAULT_ALT;
};

const getMediaFocal = (media) => {
  if (!media || typeof media === "string") return { x: 0, y: 0 };
  const fx = media.focal_x ?? media.meta?.focus?.x ?? 0;
  const fy = media.focal_y ?? media.meta?.focus?.y ?? 0;
  return { x: fx, y: fy };
};

// "Threads-style" visual indicator: a small ALT token badge with a hover
// tooltip that reveals the full description to sighted users. Screen readers
// already receive the same text via the <img alt>, so the badge is aria-hidden.
function AltBadge({ description }) {
  if (!description) return null;
  return (
    <div
      aria-hidden="true"
      className="group/alt absolute bottom-2 left-2 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="flex items-center justify-center h-5 min-w-5 px-1 rounded-md bg-black/65 text-[9px] font-black tracking-widest text-white border border-white/25 backdrop-blur-sm select-none">
        ALT
      </span>
      <div className="pointer-events-none absolute bottom-7 left-0 w-56 max-w-[70vw] rounded-lg bg-black/90 text-white text-xs leading-relaxed px-3 py-2 shadow-xl border border-white/10 opacity-0 translate-y-1 group-hover/alt:opacity-100 group-hover/alt:translate-y-0 transition-all duration-150 z-30">
        {description}
      </div>
    </div>
  );
}

function SingleMediaFrame({ media, onMediaClick }) {
  const measuredAspect = useImageAspect(getMediaUrl(media));
  const focal = getMediaFocal(media);
  // Prefer backend-provided aspect_ratio, then fall back to the measured
  // intrinsic dimensions. Portraits (taller than wide) render in a 4:5 frame
  // so the timeline card mirrors the 4:5 preview the user framed in the composer.
  const aspectRatio = media?.aspect_ratio ?? measuredAspect ?? null;
  const isPortrait = aspectRatio != null && aspectRatio <= 0.8;

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-gray-900 ${isPortrait ? "aspect-[4/5]" : "aspect-video"}`}>
      <img
        src={getMediaUrl(media)}
        alt={getMediaAlt(media)}
        className={`w-full h-full object-cover ${onMediaClick ? "cursor-pointer" : ""}`}
        style={{ objectPosition: getObjectPosition(focal.x, focal.y) }}
        loading="lazy"
        onClick={() => onMediaClick?.(0)}
      />
      <AltBadge description={getMediaDescription(media)} />
    </div>
  );
}

export function PostMediaGrid({ mediaAttachments = [], onMediaClick }) {
  const count = mediaAttachments.length;
  if (count === 0) return null;

  if (count === 1) {
    return <SingleMediaFrame media={mediaAttachments[0]} onMediaClick={onMediaClick} />;
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 grid gap-1.5 grid-cols-2">
      {count === 2 &&
        mediaAttachments.map((media, idx) => {
          const focal = getMediaFocal(media);
          return (
            <div key={media?.id || idx} className="relative w-full h-full overflow-hidden">
              <img
                src={getMediaUrl(media)}
                alt={getMediaAlt(media)}
                className={`w-full h-full object-cover ${onMediaClick ? "cursor-pointer" : ""}`}
                style={{ objectPosition: getObjectPosition(focal.x, focal.y) }}
                loading="lazy"
                onClick={() => onMediaClick?.(idx)}
              />
              <AltBadge description={getMediaDescription(media)} />
            </div>
          );
        })}

      {count === 3 && (
        <>
          <div className="relative w-full h-full overflow-hidden row-span-2">
            <img
              src={getMediaUrl(mediaAttachments[0])}
              alt={getMediaAlt(mediaAttachments[0])}
              className={`w-full h-full object-cover ${onMediaClick ? "cursor-pointer" : ""}`}
              style={{ objectPosition: getObjectPosition(getMediaFocal(mediaAttachments[0]).x, getMediaFocal(mediaAttachments[0]).y) }}
              loading="lazy"
              onClick={() => onMediaClick?.(0)}
            />
            <AltBadge description={getMediaDescription(mediaAttachments[0])} />
          </div>
          <div className="grid grid-rows-2 gap-1.5 h-full">
            {[mediaAttachments[1], mediaAttachments[2]].map((media, idx) => {
              const focal = getMediaFocal(media);
              return (
                <div key={media?.id || idx} className="relative w-full h-full overflow-hidden">
                  <img
                    src={getMediaUrl(media)}
                    alt={getMediaAlt(media)}
                    className={`w-full h-full object-cover ${onMediaClick ? "cursor-pointer" : ""}`}
                    style={{ objectPosition: getObjectPosition(focal.x, focal.y) }}
                    loading="lazy"
                    onClick={() => onMediaClick?.(idx + 1)}
                  />
                  <AltBadge description={getMediaDescription(media)} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {count >= 4 &&
        mediaAttachments.slice(0, 4).map((media, idx) => {
          const focal = getMediaFocal(media);
          return (
            <div key={media?.id || idx} className="relative w-full h-full overflow-hidden">
              <img
                src={getMediaUrl(media)}
                alt={getMediaAlt(media)}
                className={`w-full h-full object-cover ${onMediaClick ? "cursor-pointer" : ""}`}
                style={{ objectPosition: getObjectPosition(focal.x, focal.y) }}
                loading="lazy"
                onClick={() => onMediaClick?.(idx)}
              />
              <AltBadge description={getMediaDescription(media)} />
              {count > 4 && idx === 3 && (
                <div
                  className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-xs cursor-pointer"
                  onClick={() => onMediaClick?.(3)}
                >
                  <span className="text-white text-xl font-bold">+{count - 4}</span>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

export default PostMediaGrid;
