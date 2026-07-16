// src/features/explore/ExploreFeed.jsx
import React, { useState } from 'react';

export function ExploreFeed({ searchQuery }) {
    const [joinedIds, setJoinedIds] = useState([]);
    const [isEliteModalOpen, setIsEliteModalOpen] = useState(false);

    const trendingTopics = [
        { id: 'topic-quantum', tag: '#QuantumComputing', posts: '12.5K posts today', growth: '+125%', growthLabel: 'Growth', isHot: true },
        { id: 'topic-webdev', tag: '#WebDevelopment', posts: '8.3K posts today', growth: '+89%', growthLabel: 'Growth', isHot: false },
        { id: 'topic-ai', tag: '#AI', posts: '15.2K posts today', growth: '+156%', growthLabel: 'Growth', isHot: true },
        { id: 'topic-react', tag: '#React', posts: '6.7K posts today', growth: '+67%', growthLabel: 'Growth', isHot: false }
    ];

    const initialCommunities = [
        { id: 'r-technology', name: 'r/technology', description: 'The latest tech news and discussions about everything from hardware to software.', members: '2.5M members', active: '1.2K active now', image: 'https://unsplash.com' },
        { id: 'r-programming', name: 'r/programming', description: 'Computer programming discussions, languages, and technical deep dives for engineers.', members: '1.8M members', active: '850 active now', image: 'https://unsplash.com' },
        { id: 'r-science', name: 'r/science', description: 'Peer-reviewed science news, research discoveries, and academic breakthroughs from all fields.', members: '3.2M members', active: '4.1K active now', image: 'https://unsplash.com' }
    ];

    const handleJoinToggle = (id) => {
        setJoinedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const filteredTopics = trendingTopics.filter((topic) =>
        topic.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCommunities = initialCommunities.filter((comm) =>
        comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comm.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                {/* 📈 Left Bento: Trending Topics List */}
                <section className="lg:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-container">trending_up</span>
                            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">Trending Topics</h2>
                        </div>
                        <button className="text-primary-container font-bold text-sm hover:underline bg-transparent border-none cursor-pointer">View All</button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {filteredTopics.length === 0 ? (
                            <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm bg-surface-container-low border border-white/5">No matching topics found.</div>
                        ) : (
                            filteredTopics.map((topic) => (
                                <div key={topic.id} className="glass-card p-6 rounded-xl flex items-center justify-between group hover:scale-[1.01] transition-transform duration-200 cursor-pointer bg-surface-container-low border border-white/5">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-110 ${topic.isHot ? 'bg-surface-crimson-low border border-primary-container/20 text-primary-container' : 'bg-surface-container-high border border-white/5 text-text-secondary'}`}>#</div>
                                        <div>
                                            <h3 className="font-bold text-text-primary text-base md:text-lg mb-0.5 group-hover:text-primary-container transition-colors">{topic.tag.replace('#', '')}</h3>
                                            <p className="text-text-secondary text-sm md:text-md">{topic.posts}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-primary-container font-bold text-base md:text-lg">{topic.growth}</span>
                                        <p className="text-text-secondary text-[12px] md:text-sm uppercase tracking-wider font-semibold">{topic.growthLabel}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 🧭 Right Bento: Suggested Communities & Spotlight */}
                <section className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-text-secondary">groups</span>
                            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">Suggested Communities</h2>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {filteredCommunities.length === 0 ? (
                            <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm bg-surface-container-low border border-white/5">No matching communities found.</div>
                        ) : (
                            filteredCommunities.map((comm) => {
                                const isJoined = joinedIds.includes(comm.id);
                                return (
                                    <div key={comm.id} className="bg-surface-container-low border border-white/5 rounded-2xl p-6 hover:border-primary-container/20 transition-all flex flex-col gap-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                                    <img alt={comm.name} className="w-full h-full object-cover" src={comm.image} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-text-primary text-base md:text-md hover:text-primary-container transition-colors cursor-pointer">{comm.name}</h4>
                                                    <p className="text-text-secondary text-sm line-clamp-2 mt-1 leading-relaxed">{comm.description}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleJoinToggle(comm.id)} className={`px-5 py-2 font-bold rounded-full text-sm hover:brightness-110 active:scale-95 transition-all flex-shrink-0 cursor-pointer ${isJoined ? 'bg-surface-container-high text-text-primary border border-white/5' : 'bg-primary-container text-white'}`}>{isJoined ? 'Joined' : 'Join'}</button>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-text-secondary mt-2 border-t border-white/5 pt-3">
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
                    <div className="relative overflow-hidden rounded-2xl p-8 mt-2 group border border-white/5 bg-gradient-to-br from-[#2d0a0a]/80 to-[#1a1616]/95">
                        <div className="relative z-20 flex flex-col gap-4">
                            <div><span className="inline-block px-3 py-1 bg-white/5 text-text-secondary border border-white/10 rounded-full text-[12px] font-bold uppercase tracking-widest">Premium Spotlight</span></div>
                            <h3 className="font-display-lg text-lg md:text-xl font-bold text-white leading-tight">Discover the rebellion of the month.</h3>
                            <p className="text-white/70 text-sm leading-relaxed">Join the Kollective Elite and get early access to experimental features and private community groups.</p>
                            <div><button onClick={() => setIsEliteModalOpen(true)} className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:brightness-90 transition-all text-sm cursor-pointer">Explore Elite</button></div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Premium Spotlight Modal Overlay */}
            {isEliteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-surface-container border border-white/10 rounded-2xl p-8 max-w-md w-full relative crimson-glow animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsEliteModalOpen(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"><span className="material-symbols-outlined">close</span></button>
                        <div className="flex flex-col gap-4 text-center">
                            <span className="material-symbols-outlined text-primary-container text-5xl">workspace_premium</span>
                            <h4 className="font-headline-lg text-xl font-bold text-white">Kollective Elite Program</h4>
                            <p className="text-text-secondary text-sm leading-relaxed">Welcome to the elite kollective of the digital sovereignty rebellion. Applications are opening soon!</p>
                            <button onClick={() => setIsEliteModalOpen(false)} className="mt-2 w-full py-3 bg-primary-container text-white font-bold rounded-xl hover:brightness-110 transition-all text-sm cursor-pointer">Acknowledge</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}