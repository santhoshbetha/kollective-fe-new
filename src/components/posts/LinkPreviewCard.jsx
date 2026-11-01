import React from 'react';

export function LinkPreviewCard({ preview }) {
    if (!preview || typeof preview !== 'object') return null;

    const url = preview.url;
    if (!url) return null;

    const title = preview.title || 'Link Overview';
    const description = preview.description || '';
    const imageUrl = preview.image_url || preview.imageUrl || preview.image || '';

    let domain = '';
    try {
        domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
        domain = url || '';
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="link-preview-card mt-3 block overflow-hidden rounded-xl border border-white/10 bg-[#161b22]/70 hover:bg-[#161b22] hover:border-white/20 transition-all text-inherit no-underline group select-text cursor-pointer"
        >
            <div className="flex flex-col sm:flex-row items-stretch">
                {imageUrl ? (
                    <div className="sm:w-48 sm:min-w-[12rem] h-36 sm:h-auto overflow-hidden bg-black/40 shrink-0">
                        <img
                            src={imageUrl}
                            alt={title || "Link preview thumbnail"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    </div>
                ) : null}
                <div className="p-3.5 flex flex-col justify-center min-w-0 flex-1 gap-1">
                    {domain ? (
                        <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary/70 truncate flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">public</span>
                            {domain}
                        </span>
                    ) : null}
                    {title ? (
                        <h4 className="preview-title text-sm md:text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary-container transition-colors m-0">
                            {title}
                        </h4>
                    ) : null}
                    {description ? (
                        <p className="preview-desc text-xs md:text-sm text-text-secondary/80 line-clamp-2 leading-relaxed m-0">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
        </a>
    );
}

export default LinkPreviewCard;

