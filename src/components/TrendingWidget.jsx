import React from 'react';
import { useTrendingQuery } from '../features/trending/useTrendingQuery';
import { useSuggestedCirclesQuery, useToggleJoinCircle } from '../features/communities/useCirclesFeature';

export const TrendingWidget = () => {
  const { trendingTopics } = useTrendingQuery();
  const { suggestedCircles } = useSuggestedCirclesQuery();
  const joinCircleMutation = useToggleJoinCircle();

  return (
    <aside className="w-80 hidden xl:flex flex-col gap-6 sticky top-20 h-fit">
      {/* Trending Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-text-primary">Trending Now</h3>
          <span className="material-symbols-outlined text-text-secondary text-[20px] cursor-pointer hover:text-text-primary transition-colors">
            info
          </span>
        </div>
        <div className="flex flex-col gap-6">
          {trendingTopics.map((topic, i) => (
            <div key={i} className="cursor-pointer group">
              <div className="flex items-center justify-between text-text-secondary mb-1">
                <span className="text-[15px] font-bold tracking-wider uppercase">{topic.tag}</span>
                <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                  more_horiz
                </span>
              </div>
              <p className="font-bold text-text-primary group-hover:text-primary-container transition-colors">
                {topic.title}
              </p>
              <p className="text-[12px] text-text-secondary mt-1">{topic.meta}</p>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-3 text-primary-container font-bold text-sm hover:bg-surface-container-high rounded-xl transition-all border border-transparent hover:border-outline-variant">
          Show more
        </button>
      </div>

      {/* Suggested Circles */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="font-bold text-xl text-text-primary mb-6">Suggested Circles</h3>
        <div className="flex flex-col gap-5">
          {suggestedCircles.map((circle) => (
            <div key={circle.id} className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${circle.icon === 'policy'
                ? 'bg-gradient-to-br from-primary-container to-surface-crimson-low crimson-glow'
                : 'bg-gradient-to-br from-secondary to-on-secondary text-on-secondary font-bold'
                }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {circle.icon}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-text-primary truncate">{circle.name}</p>
                <p className="text-[15px] text-text-secondary">{circle.members}</p>
              </div>
              <button
                onClick={() => joinCircleMutation.mutate(circle.id)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-bold active:scale-95 transition-all ${circle.joined
                  ? 'bg-surface-container-highest text-text-primary hover:bg-surface-container-highest/80'
                  : 'bg-text-primary text-surface hover:bg-primary-container hover:text-white transition-colors'
                  }`}
              >
                {circle.joined ? 'Joined' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-2 flex flex-wrap gap-x-4 gap-y-2">
        <a className="text-[15px] text-text-secondary hover:text-white transition-colors" href="#">Privacy Policy</a>
        <a className="text-[15px] text-text-secondary hover:text-white transition-colors" href="#">Terms of Service</a>
        <a className="text-[15px] text-text-secondary hover:text-white transition-colors" href="#">Cookies</a>
        <a className="text-[15px] text-text-secondary hover:text-white transition-colors" href="#">More...</a>
        <p className="text-[15px] text-text-secondary w-full mt-2">© {new Date().getFullYear()} Kollective</p>
      </div>
    </aside>
  );
};
