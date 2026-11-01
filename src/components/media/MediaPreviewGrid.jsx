import React from 'react';
import { cn } from '@/lib/utils';
import { FocalPointSelector } from './FocalPointSelector';
import { useImageAspect } from '@/hooks/useImageAspect';

/**
 * Upload/edit preview grid that mirrors the timeline's crop framing:
 * - Single image: 4:5 frame for portraits, 16:9 for landscape/orientation-unknown.
 * - Multiple images: unified fixed 16:9 grid so every cell shares one uniform crop
 *   (individual focal points are still stored per image).
 */
export function MediaPreviewGrid({ attachments = [], onFocalChange, onRemove, onAltClick }) {
    const count = attachments.length;
    if (count === 0) return null;

    const single = count === 1 ? attachments[0] : null;
    const singleAspect = useImageAspect(single?.preview || single?.url || null);
    const isSinglePortrait = single != null && singleAspect != null && singleAspect < 1;

    const frameClass =
        count === 1 ? (isSinglePortrait ? 'aspect-[4/5]' : 'aspect-video') : 'aspect-video';

    return (
        <div
            className={cn(
                'grid gap-2 w-full overflow-hidden relative select-none mt-2',
                frameClass,
                count === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}
        >
            {attachments.map((att, index) => (
                <div
                    key={att.id || `img-grid-${index}`}
                    data-testid="media-preview"
                    className="w-full h-full relative group overflow-hidden bg-neutral-950 rounded-xl border border-black/5 dark:border-white/5"
                >
                    <FocalPointSelector
                        imageUrl={att.preview || att.url}
                        focalX={att.focal_x ?? 0}
                        focalY={att.focal_y ?? 0}
                        onChange={(coords) => onFocalChange?.(index, coords)}
                    />
                    <button
                        type="button"
                        onClick={() => onRemove?.(index)}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white cursor-pointer border-none flex items-center justify-center font-sans font-bold text-xs shadow-md z-10 outline-none"
                        aria-label={`Remove image ${index + 1}`}
                    >
                        ✕
                    </button>
                    {onAltClick && (
                        <button
                            type="button"
                            onClick={() => onAltClick(index, att)}
                            className={cn(
                                "absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black rounded-md flex items-center gap-1 uppercase tracking-wider text-white z-10 cursor-pointer border-none outline-none",
                                att.alt ? 'bg-emerald-600/90' : 'bg-amber-600/90'
                            )}
                            aria-label={`Describe image ${index + 1}`}
                        >
                            ALT
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default MediaPreviewGrid;
