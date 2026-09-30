import { useState, useMemo } from 'react';
import { usePriorityFiltration } from './usePriorityFiltration';
import { Virtuoso } from 'react-virtuoso';
import { PostCard } from '../../components/posts/PostCard';
import { cn } from "@/lib/utils";

export function TimelineContainer({ rawPosts = [], userLocation = "Downtown" }) {
    const [activeTab, setActiveTab] = useState('All Activity');
    const tabs = ['All Activity', 'Voices', 'Popular', 'Following'];

    // 1️⃣ Step 1: Handle Category & Relationship Filtering First
    const preFilteredPosts = useMemo(() => {
        return rawPosts.filter(post => {
            if (!post) return false;

            switch (activeTab) {
                case 'Voices':
                    // Filter down to urgent transmissions exclusively
                    return post.category === 'voice' || post.voice_url || post.is_urgent;

                case 'Following':
                    // Filter down to followed accounts context
                    return post.author?.is_followed || post.is_following_author;

                case 'All Activity':
                case 'Popular':
                default:
                    // Both regular posts and voice posts are welcome here
                    return true;
            }
        });
    }, [rawPosts, activeTab]);

    // 2️⃣ Step 2: Determine Algorithmic Sorting Parameters based on active tab
    const filtrationMode = useMemo(() => {
        if (activeTab === 'Voices' || activeTab === 'Following') {
            return 'latest'; // Keep these tabs chronologically pure
        }
        if (activeTab === 'Popular') {
            return 'popular'; // Tune algorithm to rank engagement velocity
        }
        return 'priority'; // Weighted priority engine handles "All Activity"
    }, [activeTab]);

    // 3️⃣ Step 3: Run the priority filtration processing matrix
    const finalDisplayPosts = usePriorityFiltration(
        preFilteredPosts,
        filtrationMode,
        userLocation
    );

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full text-left font-sans">
            {/* 🧭 Tabbed Navigation Bar Toolbar */}
            <div className="flex border-b border-white/5 pb-2 overflow-x-auto no-scrollbar font-mono text-xs select-none gap-4">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <button
                            type="button"
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-2 font-bold transition-all relative border-none bg-transparent cursor-pointer outline-none whitespace-nowrap",
                                isActive
                                    ? "text-primary-container font-extrabold"
                                    : "text-text-secondary/60 hover:text-white"
                            )}
                        >
                            <span>{tab.toUpperCase()}</span>
                            {isActive && (
                                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-primary-container crimson-glow animate-in fade-in zoom-in-95 duration-100" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 🚀 Virtualized View Stream */}
            {finalDisplayPosts.length === 0 ? (
                <div className="py-16 text-center text-text-secondary/30 font-mono text-xs border border-white/5 bg-[#141414] rounded-2xl select-none">
                    NO_active_transmissions_found_in_this_scope
                </div>
            ) : (
                <Virtuoso
                    useWindowScroll
                    data={finalDisplayPosts}
                    computeItemKey={(index, post) => post?.id || index}
                    increaseViewportBy={300}
                    overscan={150}
                    itemContent={(index, post) => (
                        <div className="w-full pb-4 animate-in fade-in duration-100">
                            <PostCard post={post} />
                        </div>
                    )}
                />
            )}
        </div>
    );
}
