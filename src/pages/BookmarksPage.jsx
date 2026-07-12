import React, { useState } from 'react';
import { usePostsQuery } from '../features/timeline/usePostsQuery';
import { PostCard } from '../features/timeline/PostCard';

export const BookmarksPage = () => {
  const { posts } = usePostsQuery();
  const [activeFilter, setActiveFilter] = useState('All Categories');

  const filters = ['All Categories', 'Manifestos', 'Strategy'];

  // Filter bookmarked posts based on active category selection
  const bookmarkedPosts = posts?.filter((post) => {
    if (!post.bookmarked) return false;
    if (activeFilter === 'All Categories') return true;

    // Categorize standard/voice posts based on content search
    if (activeFilter === 'Manifestos') {
      return post.text.toLowerCase().includes('sovereign') ||
        post.text.toLowerCase().includes('sovereignty') ||
        post.text.toLowerCase().includes('reclamation');
    }
    if (activeFilter === 'Strategy') {
      return post.text.toLowerCase().includes('report') ||
        post.text.toLowerCase().includes('negotiations') ||
        post.tags?.some(tag => tag.toLowerCase().includes('governance'));
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="font-display-lg text-3xl font-extrabold text-text-primary mb-2">Saved Posts</h1>
          <p className="text-lg font-semibold text-text-secondary">Archive of your most inspiring revolutionary insights.</p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 self-end md:self-auto overflow-x-auto pb-1 no-scrollbar">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-primary-container text-white border-primary-container crimson-glow'
                  : 'bg-surface-container-high border-white/5 hover:bg-surface-variant text-text-secondary hover:text-text-primary'
                  }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookmarked Feed */}
      <div className="flex flex-col gap-6">
        {bookmarkedPosts?.length === 0 ? (
          <div className="glass-card rounded-[16px] p-12 text-center border border-white/5 bg-surface-ink">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-4">
              bookmark
            </span>
            <h3 className="font-bold text-text-primary mb-2 text-lg">No saved posts found</h3>
            <p className="text-text-secondary text-sm">
              {activeFilter === 'All Categories'
                ? 'Save posts from the home feed to read or refer to them later!'
                : `No saved posts match the "${activeFilter}" category.`}
            </p>
          </div>
        ) : (
          bookmarkedPosts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};
