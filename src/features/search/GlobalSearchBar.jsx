import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearchQuery, useInvalidateBookmarkTrigger } from './useGlobalSearch';
import { Search, X, MessageSquare, Building2, Layers, BookmarkX } from 'lucide-react';
import { cn } from '../../lib/utils';

export function GlobalSearchBar() {
    const navigate = useNavigate();
    const [searchVal, setSearchValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Mount the system query tracking channels
    const { data: searchResults, isPending } = useGlobalSearchQuery(searchVal);

    // Mount the bookmarks cache trigger tools
    const { ejectFromBookmarksCache } = useInvalidateBookmarkTrigger();

    const hasResults = searchResults && (
        (searchResults.posts?.length > 0) ||
        (searchResults.businesses?.length > 0) ||
        (searchResults.proposals?.length > 0)
    );

    // Close dropdown instantly if user clicks outside container limits
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="w-full max-w-xl relative text-left font-sans z-50">
            {/* Search Input Bar Field */}
            <div className="relative group w-full">
                <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none",
                    isOpen ? "text-primary-container" : "text-text-secondary/40"
                )} />
                <input
                    type="text"
                    value={searchVal}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder="Search posts, cooperatives, or proposals..."
                    className="w-full bg-[#141414] text-white border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all font-medium placeholder:text-text-secondary/30"
                />
                {searchVal && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchValue('');
                            setIsOpen(false);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary/60 hover:text-white bg-transparent border-none cursor-pointer flex items-center outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            {/* Floating Dropdown System Results Portal */}
            {isOpen && searchVal.trim().length > 1 && (
                <div className="absolute top-[calc(100%+8px)] inset-x-0 bg-[#141414] border border-white/10 shadow-2xl rounded-2xl max-h-[480px] overflow-y-auto custom-scrollbar p-2 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-4">

                    {isPending && (
                        <div className="py-6 text-center font-mono text-[10px] text-text-secondary/40 select-none uppercase tracking-widest animate-pulse">
                            // scanning_network_indices...
                        </div>
                    )}

                    {!isPending && !hasResults && (
                        <div className="py-6 text-center font-mono text-[10px] text-text-secondary/40 select-none uppercase tracking-widest">
                            // no_matching_records_found
                        </div>
                    )}

                    {!isPending && hasResults && (
                        <>
                            {/* Category Module: Collective Timeline Posts */}
                            {searchResults.posts?.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase font-bold text-text-secondary tracking-wider select-none">
                                        <MessageSquare className="w-3 h-3 text-primary-container" />
                                        <span>Timeline Posts</span>
                                    </div>
                                    {searchResults.posts.map((post) => (
                                        <div
                                            key={`search-post-${post.id}`}
                                            onClick={() => {
                                                navigate(`/timeline/post/${post.id}`);
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors group flex items-start justify-between gap-4"
                                        >
                                            <p className="text-xs text-text-secondary group-hover:text-white transition-colors line-clamp-1 flex-1 font-medium text-left">
                                                {post.content || post.text}
                                            </p>

                                            {/* Surgical Cache Eviction shortcut for testing triggers inline */}
                                            {(post.bookmarked || post.isBookmarked) && (
                                                <button
                                                    type="button"
                                                    title="Surgically eject from cache matrix"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        ejectFromBookmarksCache(post.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-[8px] uppercase font-bold transition-opacity hover:bg-red-500/20 flex items-center gap-1 outline-none cursor-pointer"
                                                >
                                                    <BookmarkX className="w-2.5 h-2.5" />
                                                    <span>Eject</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Category Module: Local Cooperatives */}
                            {searchResults.businesses?.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase font-bold text-text-secondary tracking-wider select-none">
                                        <Building2 className="w-3 h-3 text-emerald-400" />
                                        <span>Local Cooperatives</span>
                                    </div>
                                    {searchResults.businesses.map((biz) => (
                                        <div
                                            key={`search-biz-${biz.id}`}
                                            onClick={() => {
                                                navigate(`/businesses/${biz.id}`);
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors text-left"
                                        >
                                            <h4 className="text-xs font-black text-white">{biz.name}</h4>
                                            <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5 font-normal">{biz.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Category Module: Community Proposals */}
                            {searchResults.proposals?.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] uppercase font-bold text-text-secondary tracking-wider select-none">
                                        <Layers className="w-3 h-3 text-amber-400" />
                                        <span>Active Proposals</span>
                                    </div>
                                    {searchResults.proposals.map((prop) => (
                                        <div
                                            key={`search-prop-${prop.id}`}
                                            onClick={() => {
                                                navigate(`/proposals/${prop.id}`);
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-colors text-left"
                                        >
                                            <h4 className="text-xs font-black text-white">{prop.title}</h4>
                                            <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5 font-normal">{prop.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Index compilation status anchor */}
                    <div className="p-2 text-center border-t border-white/5 font-mono text-[9px] text-text-secondary/20 select-none uppercase tracking-widest mt-1">
                        // pipeline_query_stream_live
                    </div>
                </div>
            )}
        </div>
    );
}
