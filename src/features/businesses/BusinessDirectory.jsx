import { useState } from 'react';
import { useState } from 'react';
import { Search, Filter, List, MapPin, Star, ArrowDownZA, ArrowUpZA, Map } from 'lucide-react';
import { LocalBusinessesFeed } from './LocalBusinessesFeed';
import { InteractiveBusinessMap } from '@/components/InteractiveBusinessMap';
import { Input } from '@/components/ui/input';

export function BusinessDirectory({ className = "" }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedDistance, setSelectedDistance] = useState('');
    const [sortBy, setSortBy] = useState('distance'); // distance, rating, alphabetical
    const [viewMode, setViewMode] = useState('list'); // list, map
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

    // Dynamic list of all categories for quick filters
    const categories = ['All', 'Retail', 'Dining', 'Health', 'Services', 'Beauty', 'Entertainment', 'Education', 'Other'];

    return (
        <div className={cn("w-full h-full flex flex-col", className)}>

            {/* Search & Filters Header Toolbar */}
            <div className="glass-panel rounded-[24px] mb-6 px-3 py-2 border border-white/5 bg-[#141414] select-none">
                <div className="flex flex-col md:flex-row items-center justify-between gap-2">

                    {/* Search Bar Section */}
                    <div className="relative w-full md:w-auto flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                        <Input
                            type="text"
                            placeholder="Search businesses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 h-10 text-[10px] font-mono font-bold uppercase tracking-widest rounded-[18px] bg-[#141414] border border-white/5 text-white placeholder:text-text-secondary/30 focus:border-primary-container focus:ring-2 focus:ring-primary-container/10"
                        />
                    </div>

                    {/* Quick Category Filters */}
                    <div className="hidden lg:flex flex-1 overflow-x-auto scrollbar-hide gap-1.5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-[16px] text-[10px] font-mono font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap border ${activeCategory === cat
                                    ? 'bg-white/5 border-white/10 text-primary-container shadow-inner'
                                    : 'bg-white/[0.03] border-white/5 text-text-secondary hover:border-white/10 hover:bg-white/[0.05]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filters & View Toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Advanced Filters Trigger */}
                        <button
                            onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
                            className={cn(
                                "p-3 rounded-[16px] border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-200 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary",
                                isAdvancedFiltersOpen && 'bg-white/5 border-white/10 text-primary-container shadow-inner'
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            Advanced
                        </button>

                        {/* View Toggle (List / Map) */}
                        <div className="flex border border-white/5 bg-white/[0.03] p-0.5 rounded-[16px]">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-[14px] transition-all duration-200",
                                    viewMode === 'list' ? 'bg-white text-primary-container shadow-sm' : 'text-text-secondary hover:text-white'
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={cn(
                                    "p-2 rounded-[14px] transition-all duration-200",
                                    viewMode === 'map' ? 'bg-white text-primary-container shadow-sm' : 'text-text-secondary hover:text-white'
                                )}
                            >
                                <Map className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel (Collapsed by default) */}
            {isAdvancedFiltersOpen && (
                <div className="glass-panel rounded-[24px] mb-6 p-6 border border-white/5 bg-[#141414] space-y-4 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-mono font-black uppercase tracking-widest text-text-primary dark:text-white flex items-center gap-2">
                            <Filter className="w-3 h-3" />
                            Advanced Filter Parameters
                        </h3>
                        <button
                            onClick={() => setIsAdvancedFiltersOpen(false)}
                            className="text-text-secondary hover:text-white transition-colors text-xs font-mono"
                        >
                            Close [X]
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[9px] font-mono font-black uppercase tracking-widest text-text-secondary mb-2">Distance Radius</label>
                            <Input
                                type="number"
                                placeholder="e.g., 5"
                                value={selectedDistance}
                                onChange={(e) => setSelectedDistance(e.target.value)}
                                className="pl-4 h-10 text-[10px] font-mono font-bold uppercase tracking-widest rounded-[18px] bg-[#141414] border border-white/5 text-white focus:border-primary-container focus:ring-2 focus:ring-primary-container/10"
                            />
                            <p className="text-[8px] font-mono text-text-secondary/50 mt-1">Miles from current view</p>
                        </div>

                        <div>
                            <label className="block text-[9px] font-mono font-black uppercase tracking-widest text-text-secondary mb-2">Sort By</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSortBy('distance')}
                                    className={cn(
                                        "h-10 px-2 rounded-[18px] border text-[10px] font-mono font-black uppercase tracking-widest transition-all duration-200",
                                        sortBy === 'distance'
                                            ? 'bg-white/5 border-white/10 text-primary-container shadow-sm'
                                            : 'bg-white/[0.03] border-white/5 text-text-secondary hover:border-white/10'
                                    )}
                                >
                                    {sort === 'distance' ? <ArrowDownZA className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setSortBy('rating')}
                                    className={cn(
                                        "h-10 px-2 rounded-[18px] border text-[10px] font-mono font-black uppercase tracking-widest transition-all duration-200",
                                        sortBy === 'rating'
                                            ? 'bg-white/5 border-white/10 text-primary-container shadow-sm'
                                            : 'bg-white/[0.03] border-white/5 text-text-secondary hover:border-white/10'
                                    )}
                                >
                                    {sort === 'rating' ? <Star className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Directory Content Area */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'list' ? (
                    <LocalBusinessesFeed
                        searchQuery={searchQuery}
                        activeCategory={activeCategory}
                        selectedDistance={selectedDistance}
                    />
                ) : (
                    <InteractiveBusinessMap
                        className="h-full rounded-[24px] border border-white/5 overflow-hidden"
                        businesses={businesses}
                    />
                )}
            </div>
        </div>
    );
}

/*
Not using this for now
src/features/businesses/LocalBusinessesFeed.jsx
*/