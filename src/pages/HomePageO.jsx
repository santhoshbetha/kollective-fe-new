import React, { useEffect } from 'react';
import { PostCard } from '../features/timeline/PostCard';
import { TrendingWidget } from '../components/TrendingWidget';
import { useStore } from '../store/useStore';
import { usePostsQuery } from '../features/timeline/usePostsQuery';

export const HomePageO = () => {
  const { posts, isLoading: postsLoading } = usePostsQuery();

  const activeTab = useStore((state) => state.homeFeedTab);
  const setActiveTab = useStore((state) => state.setHomeFeedTab);
  const homeFeedScroll = useStore((state) => state.homeFeedScroll);
  const setHomeFeedScroll = useStore((state) => state.setHomeFeedScroll);

  useEffect(() => {
    if (!postsLoading && homeFeedScroll > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, homeFeedScroll);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [postsLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (!postsLoading) {
        setHomeFeedScroll(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [postsLoading, setHomeFeedScroll]);

  const tabs = ['All Activity', 'Voices', 'Popular', 'Following'];

  const filteredPosts = posts?.filter(post => {
    if (activeTab === 'All Activity') return true;
    return post?.category === activeTab;
  });

  const PostSkeleton = () => (
    <div className="glass-card rounded-[16px] p-6 border border-white/5 animate-pulse flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest/20"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container-highest/20 rounded w-1/4"></div>
          <div className="h-3 bg-surface-container-highest/10 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-4 bg-surface-container-highest/20 rounded w-full"></div>
        <div className="h-4 bg-surface-container-highest/20 rounded w-5/6"></div>
      </div>
      <div className="h-48 bg-surface-container-highest/10 rounded-xl mt-2"></div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
        <div className="flex gap-4">
          <div className="h-4 bg-surface-container-highest/25 rounded w-10"></div>
          <div className="h-4 bg-surface-container-highest/25 rounded w-10"></div>
        </div>
        <div className="h-8 bg-surface-container-highest/20 rounded-xl w-24"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto flex gap-16">
      {/* Feed Column */}
      <div className="flex-1 flex flex-col gap-6 max-w-3xl">
        {/* Feed Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-bold text-label-md transition-all duration-200 whitespace-nowrap border ${isActive
                  ? 'bg-primary-container text-white border-primary-container crimson-glow'
                  : 'bg-surface-container-high text-text-secondary hover:text-text-primary border-white/5 hover:border-white/10'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Posts feed */}
        {postsLoading ? (
          <div className="flex flex-col gap-6">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : filteredPosts?.length === 0 ? (
          <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-[#141414]">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
              feed
            </span>
            <h3 className="font-bold text-text-primary mb-2 text-lg">No pulses found</h3>
            <p className="text-text-secondary text-sm">
              No activity under the "{activeTab}" category yet. Be the first to share your voice!
            </p>
          </div>
        ) : (
          <div className="flex flex-col border border-[#262626] bg-[#141414] rounded-[16px] overflow-hidden shadow-2xl">
            {filteredPosts?.map((post) => (
              <PostCard key={post?.id} post={post} />
            ))}
          </div>
        )}

        {/* Loading Indicator at Bottom */}
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-t-primary-container border-white/10 animate-spin"></div>
          <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
            Loading older pulses
          </p>
        </div>
      </div>

      {/* Right Sidebar Widgets */}
      <TrendingWidget />
    </div>
  );
};
