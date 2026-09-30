import React, { useState } from 'react';

export const ExplorePageO = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedIds, setJoinedIds] = useState([]);
  const [isEliteModalOpen, setIsEliteModalOpen] = useState(false);

  const trendingTopics = [
    {
      id: 'topic-quantum',
      tag: '#QuantumComputing',
      posts: '12.5K posts today',
      growth: '+125%',
      growthLabel: 'Growth',
      isHot: true,
    },
    {
      id: 'topic-webdev',
      tag: '#WebDevelopment',
      posts: '8.3K posts today',
      growth: '+89%',
      growthLabel: 'Growth',
      isHot: false,
    },
    {
      id: 'topic-ai',
      tag: '#AI',
      posts: '15.2K posts today',
      growth: '+156%',
      growthLabel: 'Growth',
      isHot: true,
    },
    {
      id: 'topic-react',
      tag: '#React',
      posts: '6.7K posts today',
      growth: '+67%',
      growthLabel: 'Growth',
      isHot: false,
    }
  ];

  const initialCommunities = [
    {
      id: 'r-technology',
      name: 'r/technology',
      description: 'The latest tech news and discussions about everything from hardware to software.',
      members: '2.5M members',
      active: '1.2K active now',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEuMUxi727a8MpILiYOBFMcSmh_4FYCiivj4Y5zXJmIdP0G8jNMh_68CPYS4zLpkVZmLmkJUrYD6v7gR5A6uIz7jreUUJ-jJy23ePRx0zdTmRkRSJpkZwlOw6jNzogYAkuTS2cicDLIVTCo_inWux7iyqgKc4pPMWBik65UCsayQqSRbUldl_g6BQ5x2qZY7v_XlQaqOyM8mVRhru9d8DXtSRYB1GwMTZFrJZ97eLJjiKNo02lWmByt6kRxrwhLZGQwWpANbQ8IdA',
    },
    {
      id: 'r-programming',
      name: 'r/programming',
      description: 'Computer programming discussions, languages, and technical deep dives for engineers.',
      members: '1.8M members',
      active: '850 active now',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoFxO_2C3RxFDFS16ddCH-nTKrzuiDvLlrjDCeKt6upOsQmYroIer-JA7etHPu2l7h0mnQSVReOr90FCJBAM7Nn9F4nLzGkytnd2ewwCkBQZ39XE8P9SxY0uoO0mf8oMAeTjxg1leqIDz-dsfiQvkJQ3KFxGA6FRRh-r18hyxW3ACWJ5ZzIiYTJTTO4dv-gPCM3UZXE0WbSto03Odv51qjSHlCBkhDtmpQqgk2pHUMgRxOHYCEPZXUm60i9-FNGcjJvsBaCWUH9g0',
    },
    {
      id: 'r-science',
      name: 'r/science',
      description: 'Peer-reviewed science news, research discoveries, and academic breakthroughs from all fields.',
      members: '3.2M members',
      active: '4.1K active now',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzcjTK2mnAQ9AUXXpT1ck8fMjoJzz0jK7BeSN9epcHid8smRWIlC4L2hzvjLVuvRKgLqUgc2XzfNW7jvoYucIkjjdKDua62Zj_VJSEe0POh30ajQ8BYLj6XHotn6GUW_qX4WVxjiJFftcYnIRP8FmMmjMZ-TZzydriAedMTam05Q23Bgcsh47fvEbk4SqihcpsI2qYDu1dA7chzqNq4xvCbURvfwpeuEe3m8EBNTxhJ4-H3O3h8dyZnnkgr3yQrUqvWiRSj6ewqFk',
    }
  ];

  const handleJoinToggle = (id) => {
    setJoinedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredTopics = trendingTopics.filter((topic) =>
    topic.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunities = initialCommunities.filter(
    (comm) =>
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-0 relative">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold text-text-primary mb-2">
            Explore
          </h1>
          <p className="text-text-secondary text-xl font-semibold">
            Find your community and discover trending rebellions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-primary-container/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl"></div>
          <button
            onClick={() => document.getElementById('explore-search-input')?.focus()}
            className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer p-0 z-10 flex items-center justify-center"
          >
            search
          </button>
          <input
            id="explore-search-input"
            className="w-full pl-12 pr-10 py-4 bg-surface-ink border border-white/10 rounded-xl focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/40 transition-all font-body-md placeholder:text-text-secondary/40 text-text-primary text-sm md:text-base"
            placeholder="Search topics, tags, or groups..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary hover:text-primary-container transition-colors bg-transparent border-none cursor-pointer p-0 z-10 flex items-center justify-center"
            >
              close
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Trending Topics Column */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">
                trending_up
              </span>
              <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">
                Trending Topics
              </h2>
            </div>
            <button className="text-primary-container font-bold text-sm hover:underline decoration-2 underline-offset-4 transition-all bg-transparent border-none cursor-pointer">
              View All
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {filteredTopics.length === 0 ? (
              <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm">
                No matching topics found.
              </div>
            ) : (
              filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="glass-card p-6 rounded-xl flex items-center justify-between group hover:scale-[1.01] transition-transform duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-110 ${topic.isHot
                      ? 'bg-surface-crimson-low border border-primary-container/20 text-primary-container'
                      : 'bg-surface-container-high border border-white/5 text-text-secondary'
                      }`}>
                      #
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-base md:text-lg mb-0.5 group-hover:text-primary-container transition-colors">
                        {topic.tag.replace('#', '')}
                      </h3>
                      <p className="text-text-secondary text-sm md:text-lg">
                        {topic.posts}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-primary-container font-bold text-base md:text-lg">
                      {topic.growth}
                    </span>
                    <p className="text-text-secondary text-[14px] md:text-sm uppercase tracking-wider font-semibold">
                      {topic.growthLabel}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Suggested Communities Column */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary">
                groups
              </span>
              <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">
                Suggested Communities
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredCommunities.length === 0 ? (
              <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm">
                No matching communities found.
              </div>
            ) : (
              filteredCommunities.map((comm) => {
                const isJoined = joinedIds.includes(comm.id);
                return (
                  <div
                    key={comm.id}
                    className="bg-surface-ink border border-white/5 rounded-2xl p-6 hover:border-primary-container/20 transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden crimson-glow flex-shrink-0 border border-white/5">
                          <img
                            alt={comm.name}
                            className="w-full h-full object-cover"
                            src={comm.image}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-base md:text-xl hover:text-primary-container transition-colors cursor-pointer">
                            {comm.name}
                          </h4>
                          <p className="text-text-secondary text-sm md:text-lg line-clamp-2 mt-1 leading-relaxed">
                            {comm.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinToggle(comm.id)}
                        className={`px-5 py-2 font-bold rounded-full text-sm md:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md flex-shrink-0 ${isJoined
                          ? 'bg-surface-container-high text-text-primary border border-white/5'
                          : 'bg-primary-container text-white shadow-primary-container/10'
                          }`}
                      >
                        {isJoined ? 'Joined' : 'Join'}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-lg text-text-secondary mt-2 border-t border-white/5 pt-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                        {comm.members}
                      </span>
                      <span>•</span>
                      <span className="font-medium">{comm.active}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Premium Spotlight Card */}
          <div className="relative overflow-hidden rounded-2xl p-8 mt-2 group border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d0a0a]/80 to-[#1a1616]/95 z-0"></div>
            <div
              className="absolute inset-0 opacity-10 z-10 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E")`
              }}
            ></div>
            <div className="relative z-20 flex flex-col gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-secondary/10 text-text-secondary border border-secondary/20 rounded-full text-[14px] md:text-lg font-bold uppercase tracking-widest">
                  Premium Spotlight
                </span>
              </div>
              <h3 className="font-display-lg text-lg md:text-2xl font-bold text-white leading-tight">
                Discover the rebellion of the month.
              </h3>
              <p className="text-white/70 text-lg md:text-lg leading-relaxed">
                Join the Kollective Elite and get early access to experimental features and private community groups.
              </p>
              <div>
                <button
                  onClick={() => setIsEliteModalOpen(true)}
                  className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-secondary hover:text-black transition-all text-sm md:text-sm cursor-pointer"
                >
                  Explore Elite
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Premium Spotlight Modal Overlay */}
      {isEliteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-ink border border-white/10 rounded-2xl p-8 max-w-md w-full relative crimson-glow animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEliteModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex flex-col gap-4 text-center">
              <span className="material-symbols-outlined text-text-secondary text-5xl">workspace_premium</span>
              <h4 className="font-headline-lg text-xl font-bold text-white">Kollective Elite Program</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                Welcome to the elite kollective of the digital sovereignty rebellion. Applications are opening soon!
              </p>
              <button
                onClick={() => setIsEliteModalOpen(false)}
                className="mt-2 w-full py-3 bg-primary-container text-white font-bold rounded-xl hover:brightness-110 transition-all text-sm cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
