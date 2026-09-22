// src/features/explore/ExploreFeed.jsx
import React, { useState } from 'react';

export function ExploreFeed({ searchQuery = '', activeTab = 'all', enableCivic = false }) {
    const [joinedIds, setJoinedIds] = useState([]);
    const [followedTags, setFollowedTags] = useState([]);
    const [votedPolls, setVotedPolls] = useState({});

    // 1. Trending Hashtags
    const trendingHashtags = [
        { id: 'tag-housing', tag: '#HousingJustice', category: 'organizing', posts: '3.4K posts local', growth: '+142%', isHot: true, description: 'Tenant protections, rent stabilization, and housing rights.' },
        { id: 'tag-coop', tag: '#LocalCoops', category: 'businesses', posts: '1.9K posts local', growth: '+98%', isHot: true, description: 'Worker-owned enterprises and local economic solidarity.' },
        { id: 'tag-energy', tag: '#CleanEnergyZone', category: 'polls', posts: '2.8K posts local', growth: '+115%', isHot: false, description: 'Community solar initiatives and public energy grids.', isCivic: true },
        { id: 'tag-tenants', tag: '#TenantRights', category: 'organizing', posts: '1.5K posts local', growth: '+76%', isHot: false, description: 'Legal resources and union organizing for renters.' },
        { id: 'tag-mutualaid', tag: '#MutualAid', category: 'events', posts: '4.1K posts local', growth: '+185%', isHot: true, description: 'Neighborhood food pantries and community care networks.' }
    ];

    // 2. Grassroots Organizing Hubs & Circles
    const organizingHubs = [
        {
            id: 'hub-tenant-union',
            name: 'Metro Tenant Union',
            category: 'organizing',
            badge: 'Community Union',
            description: 'Fighting for tenant protection, rent control caps, and fair housing across the state.',
            members: '4,280 Members',
            active: '312 Active Today',
            icon: 'gavel',
            verified: true
        },
        {
            id: 'hub-clean-air',
            name: 'Clean Air & Climate Collective',
            category: 'organizing',
            badge: 'Grassroots Action',
            description: 'Local environmental activism advocating for urban tree canopy and zero-emissions transit.',
            members: '2,910 Members',
            active: '185 Active Today',
            icon: 'eco',
            verified: true
        },
        {
            id: 'hub-coop-guild',
            name: 'Independent Co-op Alliance',
            category: 'businesses',
            badge: 'Worker Co-op',
            description: 'Network of local worker-owned businesses supporting ethical commerce and mutual support.',
            members: '1,450 Members',
            active: '94 Active Today',
            icon: 'storefront',
            verified: false
        },
        {
            id: 'hub-civic-tech',
            name: 'District 4 Civic Tech Guild',
            category: 'polls',
            badge: 'Open Tech',
            description: 'Building open-source digital tools for public transparency and community participation.',
            members: '870 Members',
            active: '62 Active Today',
            icon: 'code',
            verified: false,
            isCivic: true
        }
    ];

    // 3. Community Civic Polls
    const civicPolls = [
        {
            id: 'poll-solar',
            title: 'Community Solar Revenue Allocation for 2027',
            category: 'polls',
            author: 'District Assembly Committee',
            totalVotes: 1420,
            options: [
                { id: 'opt1', label: 'Reinvest in Low-Income Household Rebates', percentage: 58 },
                { id: 'opt2', label: 'Expand Public School Rooftop Panels', percentage: 27 },
                { id: 'opt3', label: 'Fund Neighborhood Battery Storage', percentage: 15 }
            ]
        },
        {
            id: 'poll-transit',
            title: 'Weekend Night Bus Frequency Extension',
            category: 'polls',
            author: 'Transit Riders Union',
            totalVotes: 890,
            options: [
                { id: 'opt1', label: 'Extend Bus Route #12 to 2 AM', percentage: 72 },
                { id: 'opt2', label: 'Add Express Shuttle to Central Hub', percentage: 28 }
            ]
        }
    ];

    // 4. Local Events & Meetings
    const localEvents = [
        {
            id: 'event-townhall',
            title: 'Quarterly Public Housing Meetup',
            category: 'events',
            date: 'Thu, Oct 15 • 6:30 PM',
            location: 'Community Center & Hybrid Stream',
            organizer: 'Metro Assembly Group',
            attendees: '142 Attending'
        },
        {
            id: 'event-garden',
            title: 'Spring Community Garden Seed Swap & Workshop',
            category: 'events',
            date: 'Sat, Oct 17 • 10:00 AM',
            location: 'Central Park North Plot',
            organizer: 'Urban Farming Collective',
            attendees: '89 Attending'
        }
    ];

    const handleJoinToggle = (id) => {
        setJoinedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleTagFollowToggle = (id) => {
        setFollowedTags((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleVote = (pollId, optionId) => {
        setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
    };

    // Filter logic based on activeTab and searchQuery
    const queryLower = searchQuery.toLowerCase();

    const filteredHashtags = trendingHashtags.filter((t) => {
        if (!enableCivic && t.isCivic) return false;
        const matchesQuery = t.tag.toLowerCase().includes(queryLower) || t.description.toLowerCase().includes(queryLower);
        const matchesTab = activeTab === 'all' || t.category === activeTab;
        return matchesQuery && matchesTab;
    });

    const filteredHubs = organizingHubs.filter((h) => {
        if (!enableCivic && h.isCivic) return false;
        const matchesQuery = h.name.toLowerCase().includes(queryLower) || h.description.toLowerCase().includes(queryLower);
        const matchesTab = activeTab === 'all' || h.category === activeTab;
        return matchesQuery && matchesTab;
    });

    const filteredPolls = civicPolls.filter((p) => {
        const matchesQuery = p.title.toLowerCase().includes(queryLower) || p.author.toLowerCase().includes(queryLower);
        const matchesTab = activeTab === 'all' || activeTab === 'polls' || p.category === activeTab;
        return matchesQuery && matchesTab;
    });

    const filteredEvents = localEvents.filter((e) => {
        const matchesQuery = e.title.toLowerCase().includes(queryLower) || e.organizer.toLowerCase().includes(queryLower);
        const matchesTab = activeTab === 'all' || activeTab === 'events' || e.category === activeTab;
        return matchesQuery && matchesTab;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left Main Column: Hubs, Polls, and Events */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                {/* 🏛️ Grassroots Organizing Hubs & Circles */}
                {(activeTab === 'all' || activeTab === 'organizing' || activeTab === 'businesses') && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-container">groups</span>
                                <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">Grassroots Hubs & Circles</h2>
                            </div>
                            <span className="text-text-secondary text-md">{filteredHubs.length} available</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {filteredHubs.length === 0 ? (
                                <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm bg-surface-container-low border border-white/5">
                                    No hubs match your query.
                                </div>
                            ) : (
                                filteredHubs.map((hub) => {
                                    const isJoined = joinedIds.includes(hub.id);
                                    return (
                                        <div
                                            key={hub.id}
                                            className="bg-surface-container-low border border-white/5 hover:border-primary-container/30 rounded-2xl p-6 transition-all flex flex-col gap-4 group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        <span className="material-symbols-outlined text-2xl">{hub.icon}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-text-primary text-base md:text-xl group-hover:text-primary-container transition-colors">
                                                                {hub.name}
                                                            </h3>
                                                            {hub.verified && (
                                                                <span className="material-symbols-outlined text-primary-container text-sm" title="Verified Community Hub">
                                                                    verified
                                                                </span>
                                                            )}
                                                            <span className="px-2 py-0.5 rounded-md text-[14px] font-semibold bg-white/5 text-text-secondary border border-white/5">
                                                                {hub.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-text-secondary text-xl leading-relaxed mt-1">{hub.description}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleJoinToggle(hub.id)}
                                                    className={`px-4 py-2 font-bold rounded-xl text-xs md:text-sm hover:brightness-110 active:scale-95 transition-all flex-shrink-0 cursor-pointer ${isJoined ? 'bg-surface-container-high text-text-primary border border-white/10' : 'bg-primary-container text-white'
                                                        }`}
                                                >
                                                    {isJoined ? 'Joined' : 'Join Circle'}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 text-[16px] text-text-secondary border-t border-white/5 pt-3">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                                                    {hub.members}
                                                </span>
                                                <span>•</span>
                                                <span className="font-medium text-text-secondary/80">{hub.active}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                )}

                {/* 🗳️ Civic Community Polls Spotlight (Hidden when enableCivic is false) */}
                {enableCivic && (activeTab === 'all' || activeTab === 'polls') && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-container">how_to_vote</span>
                                <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">Featured Civic Polls</h2>
                            </div>
                            <span className="text-text-secondary text-xs">Direct Democracy</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {filteredPolls.length === 0 ? (
                                <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm bg-surface-container-low border border-white/5">
                                    No civic polls match your search.
                                </div>
                            ) : (
                                filteredPolls.map((poll) => {
                                    const selectedOption = votedPolls[poll.id];
                                    return (
                                        <div key={poll.id} className="bg-surface-container-low border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs text-primary-container font-semibold uppercase tracking-wider">{poll.author}</span>
                                                    <h3 className="font-bold text-text-primary text-base md:text-lg mt-0.5">{poll.title}</h3>
                                                </div>
                                                <span className="text-xs text-text-secondary bg-white/5 px-2.5 py-1 rounded-full">{poll.totalVotes} votes</span>
                                            </div>

                                            <div className="flex flex-col gap-2.5">
                                                {poll.options.map((opt) => {
                                                    const isSelected = selectedOption === opt.id;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => handleVote(poll.id, opt.id)}
                                                            className={`relative overflow-hidden w-full text-left p-3.5 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between ${isSelected
                                                                ? 'bg-primary-container/20 border-primary-container text-white'
                                                                : 'bg-surface-container-high border-white/5 hover:border-white/20 text-text-primary'
                                                                }`}
                                                        >
                                                            <div
                                                                className="absolute left-0 top-0 bottom-0 bg-primary-container/15 transition-all duration-500 pointer-events-none"
                                                                style={{ width: `${opt.percentage}%` }}
                                                            />
                                                            <span className="relative z-10 font-medium">{opt.label}</span>
                                                            <span className="relative z-10 text-xs font-bold text-text-secondary">{opt.percentage}%</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                )}

                {/* 📅 Local Events & Meetings */}
                {(activeTab === 'all' || activeTab === 'events') && (
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-container">event</span>
                                <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">
                                    {enableCivic ? 'Upcoming Town Halls & Assemblies' : 'Upcoming Community Events'}
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredEvents.length === 0 ? (
                                <div className="col-span-full glass-card p-6 rounded-xl text-center text-text-secondary text-sm bg-surface-container-low border border-white/5">
                                    No local events found for this filter.
                                </div>
                            ) : (
                                filteredEvents.map((ev) => (
                                    <div key={ev.id} className="bg-surface-container-low border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-lg text-primary-container font-semibold mb-2">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                {ev.date}
                                            </div>
                                            <h4 className="font-bold text-text-primary text-base leading-snug mb-2">{ev.title}</h4>
                                            <p className="text-lg text-text-secondary flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {ev.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[16px] text-text-secondary">
                                            <span>{ev.attendees}</span>
                                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-text-primary font-medium cursor-pointer border border-white/5">
                                                RSVP
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Right Column: Trending Hashtags & Spotlight Banner */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                {/* #️⃣ Trending Hashtags */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-container">tag</span>
                            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-text-primary">
                                {enableCivic ? 'Trending Civic Hashtags' : 'Trending Hashtags'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {filteredHashtags.length === 0 ? (
                            <div className="glass-card p-6 rounded-xl text-center text-text-secondary text-sm bg-surface-container-low border border-white/5">
                                No hashtags match your search.
                            </div>
                        ) : (
                            filteredHashtags.map((item) => {
                                const isFollowing = followedTags.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="glass-card p-4 rounded-xl flex items-center justify-between group hover:border-primary-container/20 transition-all bg-surface-container-low border border-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center font-bold text-primary-container">
                                                #
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-text-primary text-lg group-hover:text-primary-container transition-colors">
                                                        {item.tag}
                                                    </h3>
                                                    {item.isHot && (
                                                        <span className="px-1.5 py-0.5 text-[10px] uppercase font-extrabold bg-primary-container/20 text-primary-container rounded">
                                                            HOT
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-text-secondary text-lg">{item.posts}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleTagFollowToggle(item.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isFollowing ? 'bg-white/10 text-text-primary' : 'bg-white/5 hover:bg-white/10 text-primary-container'
                                                }`}
                                        >
                                            {isFollowing ? 'Following' : '+ Follow'}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* 🌟 Community / Civic Spotlight Banner */}
                {enableCivic ? (
                    <div className="relative overflow-hidden rounded-2xl p-6 group border border-primary-container/20 bg-gradient-to-br from-surface-container-high via-surface-container-low to-primary-container/10">
                        <div className="relative z-10 flex flex-col gap-3">
                            <span className="inline-block px-3 py-1 bg-primary-container/20 text-primary-container border border-primary-container/30 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit">
                                Civic Assembly Spotlight
                            </span>
                            <h3 className="font-display-lg text-lg font-bold text-white leading-tight">Propose a Local Assembly Measure</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                                Have an initiative for your neighborhood or state? Submit a ballot proposal to initiate community voting.
                            </p>
                            <button className="mt-1 w-full py-2.5 bg-primary-container text-white font-bold rounded-xl hover:brightness-110 transition-all text-xs cursor-pointer shadow-md">
                                Start Civic Proposal
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl p-6 group border border-white/10 bg-gradient-to-br from-surface-container-high via-surface-container-low to-surface-container">
                        <div className="relative z-10 flex flex-col gap-3">
                            <span className="inline-block px-3 py-1 bg-white/10 text-text-primary border border-white/10 rounded-full text-[16px] font-bold uppercase tracking-wider w-fit">
                                Community Hub Spotlight
                            </span>
                            <h3 className="font-display-lg text-lg font-bold text-white leading-tight">Start Your Own Community Circle</h3>
                            <p className="text-text-secondary text-[14px] leading-relaxed">
                                Connect with neighbors, organize local events, and highlight ethical businesses in your area.
                            </p>
                            <button className="mt-1 w-full py-2.5 bg-primary-container text-white font-bold rounded-xl hover:brightness-110 transition-all text-xs cursor-pointer shadow-md">
                                Create Community Circle
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

