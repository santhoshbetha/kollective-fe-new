import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VirtuosoGrid } from 'react-virtuoso';
import { PostAdModal } from '../features/classifieds/PostAdModal';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/auth/useAuthStore';
import {
    ArrowLeft,
    Search,
    Plus,
    MapPin,
    Clock,
    Tag,
    AlertCircle,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal
} from 'lucide-react';
import { cn } from "@/lib/utils";

const LOCATION_DISTANCES = {
    'Downtown': 0.5,
    'East End': 1.2,
    'Heights': 2.4,
    'Midtown': 3.1,
    'North Side': 4.5,
    'West Hills': 6.0,
};

const getAdDistance = (ad) => {
    return ad.distanceMiles ?? LOCATION_DISTANCES[ad.location] ?? 5.0;
};

const parseExpiresToHours = (expiresStr) => {
    if (!expiresStr) return 999;
    const matchHours = expiresStr.match(/(\d+)\s*hour/i);
    if (matchHours) return parseInt(matchHours[1], 10);
    const matchDays = expiresStr.match(/(\d+)\s*day/i);
    if (matchDays) return parseInt(matchDays[1], 10) * 24;
    return 999;
};

const GridList = React.forwardRef(({ children, ...props }, ref) => (
    <div
        ref={ref}
        {...props}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
    >
        {children}
    </div>
));

const GridItem = ({ children, ...props }) => (
    <div {...props} className="h-full">
        {children}
    </div>
);

export const AdDetailsModal = ({ isOpen, onClose, ad }) => {
    if (!isOpen || !ad) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop Click Closes Sheet */}
            <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

            {/* Slide-over Content Drawer */}
            <div className="relative w-full sm:max-w-md h-full bg-surface-container/95 backdrop-blur-md border-l border-outline-variant text-on-surface font-mono p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">

                {/* Close Button top-right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer material-symbols-outlined text-[20px] bg-transparent border-none"
                >
                    close
                </button>

                <div className="flex-1 overflow-y-auto pr-1">
                    {/* Header */}
                    <div className="border-b border-outline-variant pb-4 mb-4 pr-6 select-none mt-2">
                        <span className="text-amber-500 font-bold uppercase tracking-wider text-[11px]">
                            [{ad.category.toUpperCase()} — {ad.expires.toUpperCase()}]
                        </span>
                        <h2 className="text-2xl font-serif italic font-black text-on-surface mt-1">
                            {ad.title}
                        </h2>
                    </div>

                    {/* Extended Details Box */}
                    <div className="space-y-4 font-sans text-sm text-on-surface-variant leading-relaxed">
                        <p className="font-serif italic text-on-surface text-base">
                            "{ad.desc}"
                        </p>

                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant font-mono text-xs space-y-3 shadow-inner">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant font-bold">PRICE:</span>
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shadow-sm">
                                    {ad.price}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant font-bold">LOCATION:</span>
                                <span className="text-on-surface font-medium">{ad.location} ({getAdDistance(ad)} mi)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant font-bold">DISPATCHER:</span>
                                <span className="text-primary font-bold">{ad.user}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hyper-Local Action Footer */}
                <div className="border-t border-outline-variant pt-4 mt-6 grid grid-cols-2 gap-3 font-mono">
                    <button
                        onClick={() => alert(`Navigating to profile of ${ad.user}`)}
                        className="py-3 rounded-xl border border-outline-variant hover:bg-surface-container-high text-center font-bold text-on-surface transition-colors cursor-pointer bg-transparent"
                    >
                        VIEW {ad.user.toUpperCase()}
                    </button>
                    <button
                        onClick={() => alert(`Starting local DM thread for: ${ad.title}`)}
                        className="py-3 rounded-xl bg-primary hover:bg-primary-container text-white border-none font-bold text-center transition-all active:scale-98 crimson-glow cursor-pointer"
                    >
                        SEND LOCAL DM
                    </button>
                </div>

            </div>
        </div>
    );
};

export const ClassifiedsDirectoryPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date_asc'); // 'date_asc', 'date_desc', 'distance_asc', 'distance_desc'
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const [isPostAdOpen, setIsPostAdOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);

    // 🗺️ Location Selectors
    const userState = useStore((state) => state.userState);
    const streetAddress = useStore((state) => state.streetAddress);
    const currentUser = useAuthStore((state) => state.user);

    const hasAddressOrCoords = Boolean((streetAddress && streetAddress.trim()) || currentUser?.street_address || currentUser?.latitude);
    const hasState = Boolean((userState && userState.trim()) || currentUser?.state || currentUser?.origin_state);
    const canAccessClassifieds = hasAddressOrCoords || hasState;

    if (!canAccessClassifieds) {
        return (
            <div className="max-w-[700px] mx-auto my-16 p-8 bg-[#f4efe6] dark:bg-[#181512] border border-[#c8baa6] dark:border-[#3a342e] rounded-2xl shadow-2xl text-center space-y-6 animate-in fade-in duration-200 font-serif">
                <div className="w-16 h-16 rounded-2xl bg-amber-800/10 dark:bg-amber-500/10 border border-amber-800/20 dark:border-amber-500/20 flex items-center justify-center mx-auto text-amber-800 dark:text-amber-500">
                    <span className="material-symbols-outlined text-3xl">location_off</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#2c221a] dark:text-[#e8e4d9] tracking-tight">Local Classifieds Access Restricted</h2>
                    <p className="text-[#6e5d4f] dark:text-[#a8a090] text-sm leading-relaxed max-w-md mx-auto font-sans">
                        To discover local classified advertisements in your neighborhood, please opt-in and provide either your <span className="font-bold text-[#2c221a] dark:text-[#e8e4d9]">State / Province</span> or <span className="font-bold text-[#2c221a] dark:text-[#e8e4d9]">Street Address</span> in your Account Settings.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/settings?tab=index')}
                    className="px-6 py-3 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 border-none font-sans"
                >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    Go to Settings
                </button>
            </div>
        );
    }

    const categories = ['All', 'For Sale', 'Services', 'Handmade', 'Housing', 'Gigs', 'Community'];

    // Mock Board Ads with Expiry Tracking 
    const classifiedAds = [
        { id: 1, title: 'Co-op Fresh Eggs', category: 'For Sale', price: '$4/doz', desc: 'Fresh organic eggs from our cage-free backyard coop. Collected daily.', user: '@organic_farm', location: 'East End', expires: '2 days left' },
        { id: 2, title: 'Math & Science Tutor', category: 'Services', price: '$25/hr', desc: 'High school & early college tutoring. 5 years experience. First session free.', user: '@edu_support', location: 'Heights', expires: '8 hours left' },
        { id: 3, title: 'Ceramic Mugs & Bowls', category: 'Handmade', price: '$15+', desc: 'Locally spun stoneware mugs and nesting bowls. Dishwasher and microwave safe.', user: '@mud_and_fire', location: 'Downtown', expires: '4 days left' },
        { id: 4, title: 'Vintage Oak Desk', category: 'For Sale', price: '$120', desc: 'Solid wood build from the late 70s. Minor surface scratches but sturdy structural shape.', user: '@retro_finds', location: 'West Hills', expires: '1 day left' },
        { id: 5, title: 'Emergency Dog Walking', category: 'Services', price: '$18/hr', desc: 'Available for immediate evening booking. Fully insured local pet lover.', user: '@paws_local', location: 'Midtown', expires: '12 hours left' },
        { id: 6, title: 'Community Garden Cleanup', category: 'Community', price: 'Free', desc: 'Join us Saturday morning to clear paths and build new raised beds. Coffee provided!', user: '@green_hub', location: 'North Side', expires: '5 days left' },
        { id: 7, title: 'Sourdough Starter Culture', category: 'Handmade', price: '$5', desc: 'Established 3-year-old active wild yeast culture. Includes care sheet and beginner baking recipe.', user: '@bread_builder', location: 'Heights', expires: '3 days left' },
        { id: 8, title: 'Bicycle Repair Service', category: 'Services', price: '$30+', desc: 'Tune-ups, tube replacement, gear indexing, and brake adjustments. Fast turnaround time.', user: '@spoke_doctor', location: 'East End', expires: '6 days left' },
        { id: 9, title: 'Sunny Bedroom Sublet', category: 'Housing', price: '$650/mo', desc: 'Private room in a 3-bedroom collective flat. Shared kitchen and laundry. Utilities included.', user: '@living_well', location: 'Midtown', expires: '6 days left' },
        { id: 10, title: 'Yard Mowing Helper', category: 'Gigs', price: '$20/hr', desc: 'Need someone with a mower to clear a small backyard lawn this Friday. Mower provided if needed.', user: '@neighbor_j', location: 'North Side', expires: '18 hours left' },
        { id: 11, title: 'Wool Knit Beanie', category: 'Handmade', price: '$22', desc: 'Handcrafted with 100% merino wool yarn. Super warm, unisex design, various colors.', user: '@cozy_threads', location: 'West Hills', expires: '4 days left' },
        { id: 12, title: 'Used Lawnmower', category: 'For Sale', price: '$45', desc: 'Gas-powered rotary push mower. Starts on the second pull. Blades recently sharpened.', user: '@garage_clear', location: 'Downtown', expires: '2 days left' },
        { id: 13, title: 'Local Seed Swap Meet', category: 'Community', price: 'Free', desc: 'Bring your heirloom seeds to trade with local growers this Sunday. Garden tips shared.', user: '@seed_savers', location: 'East End', expires: '4 days left' },
        { id: 14, title: 'Moving Boxes (Bundle of 15)', category: 'For Sale', price: 'Free', desc: 'Clean, double-walled cardboard shipping boxes. Assorted sizes. Porch pickup.', user: '@moving_onout', location: 'Heights', expires: '1 day left' },
        { id: 15, title: 'Piano Lessons for Beginners', category: 'Services', price: '$35/hr', desc: 'Adult and child lessons. Focus on classical foundations and reading notation. In-home studio.', user: '@keys_and_chords', location: 'Downtown', expires: '5 days left' },
        { id: 16, title: 'Leather Tote Bag', category: 'Handmade', price: '$85', desc: 'Full grain vegetable tanned leather. Hand-stitched with waxed thread. Lifetime durability.', user: '@hide_and_stitch', location: 'West Hills', expires: '6 days left' },
        { id: 17, title: 'Garage Loft Studio', category: 'Housing', price: '$950/mo', desc: 'Detached carriage house apartment. Vaulted ceilings, full bath, compact kitchen setup.', user: '@cozy_spaces', location: 'Heights', expires: '5 days left' },
        { id: 18, title: 'Help Paint Living Room', category: 'Gigs', price: '$150/flat', desc: 'Need help taping and rolling two coats of latex paint in my living room on Saturday morning.', user: '@home_makeover', location: 'Midtown', expires: '1 day left' },
        { id: 19, title: 'Organic Tomato Plants', category: 'For Sale', price: '$3/plant', desc: 'Vigorous early girl and cherokee purple starts. Grown from organic seed stock.', user: '@green_thumb', location: 'North Side', expires: '3 days left' },
        { id: 20, title: 'Tailoring & Alterations', category: 'Services', price: 'Varies', desc: 'Hemming pants, adjusting dresses, zipper replacement, and patch repairs. Standard 3-day turnaround.', user: '@needle_craft', location: 'Heights', expires: '6 days left' },
        { id: 21, title: 'Soy Wax Candles', category: 'Handmade', price: '$12', desc: 'Hand-poured non-toxic scented candles. Cotton wicks. Amber jar containers.', user: '@light_aroma', location: 'East End', expires: '4 days left' },
        { id: 22, title: 'Shared Workshop Space', category: 'Housing', price: '$150/mo', desc: 'Woodworking workspace access. Shared table saw, planer, and basic power tools.', user: '@maker_guild', location: 'North Side', expires: '7 days left' },
        { id: 23, title: 'Furniture Assembly Assistance', category: 'Gigs', price: '$22/hr', desc: 'Help assemble a flat-pack wardrobe and chest of drawers. All hex keys and drivers on site.', user: '@ikea_struggle', location: 'Downtown', expires: '12 hours left' },
        { id: 24, title: 'Street Trash Cleanup Drive', category: 'Community', price: 'Free', desc: 'Community clean-up meet up at 5th and Pine. Trash grabbers and bags provided.', user: '@litter_patrol', location: 'Downtown', expires: '3 days left' },
        { id: 25, title: 'Ergonomic Office Chair', category: 'For Sale', price: '$60', desc: 'Adjustable mesh back chair. Excellent lumbar support. Smooth casters.', user: '@desk_jockey', location: 'Midtown', expires: '2 days left' },
        { id: 26, title: 'Computer System Cleanup', category: 'Services', price: '$40/flat', desc: 'Remove malware, clean dust blocks, apply new thermal paste, and optimize boot sequence.', user: '@byte_fixer', location: 'East End', expires: '5 days left' },
        { id: 27, title: 'Hand-Carved Wooden Spoon', category: 'Handmade', price: '$18', desc: 'Made from local cherry wood. Finished with food-safe beeswax and linseed oil.', user: '@chip_and_shave', location: 'North Side', expires: '4 days left' },
        { id: 28, title: 'Basement Storage Lockers', category: 'Housing', price: '$45/mo', desc: 'Secure 5x5 storage cage inside lockbox room. Dry, clean, and climate controlled.', user: '@lockbox_safe', location: 'Downtown', expires: '6 days left' },
        { id: 29, title: 'Moving Truck Driver', category: 'Gigs', price: '$30/hr', desc: 'Looking for a reliable driver for a 16-foot box truck. Route runs from East End to Heights.', user: '@pack_and_go', location: 'East End', expires: '1 day left' },
        { id: 30, title: 'Food Pantry Volunteer Shift', category: 'Community', price: 'Free', desc: 'Sort incoming canned goods and fresh agricultural inventory. Shifts are 2 hours each.', user: '@pantry_aid', location: 'Heights', expires: '5 days left' }
    ];

    const filteredAds = classifiedAds.filter(ad => {
        const matchesCategory = selectedCategory === 'All' || ad.category === selectedCategory;
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedAds = [...filteredAds].sort((a, b) => {
        if (sortBy === 'date_asc') {
            return parseExpiresToHours(a.expires) - parseExpiresToHours(b.expires);
        }
        if (sortBy === 'date_desc') {
            return parseExpiresToHours(b.expires) - parseExpiresToHours(a.expires);
        }
        if (sortBy === 'distance_asc') {
            return getAdDistance(a) - getAdDistance(b);
        }
        if (sortBy === 'distance_desc') {
            return getAdDistance(b) - getAdDistance(a);
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedAds.length / ITEMS_PER_PAGE);
    const paginatedAds = sortedAds.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="w-full max-w-[var(--spacing-container-max)] xl:max-w-none xl:px-12 mx-auto flex flex-col gap-6 pb-20 font-sans animate-in fade-in duration-200 relative overflow-hidden px-4 sm:px-6 bg-[#f4efe6] dark:bg-[#161311] text-[#382e25] dark:text-[#e5dfd3] p-6 sm:p-8 border border-[#d8ccb8] dark:border-[#332c25] shadow-2xl">
            {/* Atmospheric Sepia Newsprint Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-800/10 blur-[150px] rounded-full pointer-events-none"></div>

            {/* Vintage Retro Header Header Block */}
            <header className="border-b-4 border-double border-[#b8a690] dark:border-[#443b32] pb-4 text-center select-none flex flex-col items-center gap-4">
                <div className="inline-block relative">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase font-serif text-[#2c221a] dark:text-[#f2edd9] italic relative z-10">
                        The Town Bulletin
                    </h1>
                    <div className="absolute -inset-x-6 top-1/2 -translate-y-1/2 h-1/2 bg-amber-500/10 blur-xl rounded-full -z-10"></div>
                </div>

                <p className="font-mono text-base sm:text-lg text-amber-800 dark:text-amber-500 mt-1 tracking-widest uppercase font-bold">
                    📰 Vintage Newsprint Classifieds • Updated Live
                </p>

                {/* Bottom Row containing controls: Back button and Post Ad button */}
                <div className="w-full flex items-center justify-between border-t border-[#d8ccb8] dark:border-[#332c25] pt-3 mt-1 font-mono">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-[#6e5d4f] dark:text-[#a8a090] hover:text-amber-800 dark:hover:text-amber-400 transition-colors text-[11px] uppercase tracking-widest border-none bg-transparent cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span>Back</span>
                    </button>

                    <button
                        onClick={() => setIsPostAdOpen(true)}
                        className="group flex items-center gap-2 bg-amber-800/10 dark:bg-amber-600/20 border border-amber-800/30 dark:border-amber-500/40 text-amber-900 dark:text-amber-400 hover:bg-amber-800/20 dark:hover:bg-amber-600/30 transition-all text-[11px] uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[18px]">push_pin</span>
                        <span>+ Post Ad</span>
                    </button>
                </div>
            </header>

            {/* Retro Ribbon Sub-Controls / Newspaper Info Banner */}
            <div className="flex flex-col md:flex-row items-center justify-between border-y-2 border-dashed border-[#b8a690] dark:border-[#443b32] py-3 font-mono text-[14px] text-[#6e5d4f] dark:text-[#b8b0a0] gap-4 select-none bg-[#e9dfd0] dark:bg-[#1c1916] px-4 rounded-xl">
                <div className="text-left font-bold tracking-wider text-amber-900/90 dark:text-amber-500/90 whitespace-nowrap uppercase">
                    📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e7d6f] dark:text-[#787060] text-[18px]">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Filter newsprint archives..."
                            className="w-full bg-[#fbf7f0] dark:bg-[#12100e] border border-[#c8baa6] dark:border-[#383028] rounded-xl py-2 pl-9 pr-4 text-lg font-mono text-[#2c221a] dark:text-[#e5dfd3] focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 placeholder:text-[#8e7d6f] dark:placeholder:text-[#686050] transition-colors"
                        />
                    </div>

                    {/* Sort Selector */}
                    <div className="flex items-center gap-1.5 bg-[#fbf7f0] dark:bg-[#12100e] border border-[#c8baa6] dark:border-[#383028] rounded-xl px-3 py-1.5 shrink-0 w-full sm:w-auto">
                        <ArrowUpDown className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-transparent border-none text-lg font-mono text-[#2c221a] dark:text-[#e5dfd3] focus:outline-none cursor-pointer w-full"
                        >
                            <option value="date_asc" className="bg-[#fbf7f0] dark:bg-[#1c1916]">Sort: Expiring Soonest</option>
                            <option value="date_desc" className="bg-[#fbf7f0] dark:bg-[#1c1916]">Sort: Expiring Later</option>
                            <option value="distance_asc" className="bg-[#fbf7f0] dark:bg-[#1c1916]">Sort: Nearest Distance</option>
                            <option value="distance_desc" className="bg-[#fbf7f0] dark:bg-[#1c1916]">Sort: Farthest Distance</option>
                        </select>
                    </div>
                </div>

                <div className="text-right hidden xl:block font-bold tracking-wider text-[#7e6d5f] dark:text-[#989080] whitespace-nowrap">
                    7-DAY FLASH MAX
                </div>
            </div>

            {/* Vintage Filter Banner / Categories Selector */}
            <div className="flex flex-wrap justify-center items-center gap-2 pb-2">
                {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={cn(
                                "px-4 py-2 font-mono text-xs rounded-lg transition-all cursor-pointer border",
                                isActive
                                    ? "bg-amber-800/20 dark:bg-amber-600/25 text-amber-950 dark:text-amber-300 border-amber-700/60 dark:border-amber-500/60 font-bold shadow-sm"
                                    : "bg-[#e9dfd0] dark:bg-[#1c1916] border-[#c8baa6] dark:border-[#383028] text-[#6e5d4f] dark:text-[#a8a090] hover:text-[#2c221a] dark:hover:text-[#e5dfd3] hover:border-[#a89680] dark:hover:border-[#585040]"
                            )}
                        >
                            [{cat.toUpperCase()}]
                        </button>
                    );
                })}
            </div>

            {/* Main Classifieds Template Grid */}
            {sortedAds.length === 0 ? (
                <div className="text-center py-20 font-mono border-2 border-dashed border-[#c8baa6] dark:border-[#383028] bg-[#e9dfd0] dark:bg-[#1c1916] rounded-2xl flex flex-col items-center justify-center p-8 select-none">
                    <span className="material-symbols-outlined text-5xl text-[#8e7d6f] dark:text-[#585040] mb-3 animate-bounce">inbox</span>
                    <h3 className="font-bold text-base text-[#2c221a] dark:text-[#e5dfd3] mb-1">No Active Listings Found</h3>
                    <p className="text-xs text-[#6e5d4f] dark:text-[#a8a090] max-w-sm leading-relaxed">
                        There are currently no active ads or community bulletins matching the selected filter query.
                    </p>
                </div>
            ) : (
                <div className="w-full min-h-[400px]">
                    <VirtuosoGrid
                        useWindowScroll
                        data={paginatedAds}
                        itemContent={(index, ad) => (
                            <div
                                key={ad.id}
                                onClick={() => setSelectedAd(ad)}
                                className="bg-[#eae1d2] dark:bg-[#1c1916] hover:bg-[#e2d6c3] dark:hover:bg-[#24201c] border border-[#d4c6b2] dark:border-[#3a332a] hover:border-amber-700/50 dark:hover:border-amber-500/50 
                                            p-6 flex flex-col justify-between transition-all duration-300 group cursor-pointer relative 
                                            overflow-hidden hover:-translate-y-1 shadow-md hover:shadow-2xl h-full font-mono text-[#382e25] dark:text-[#d6cfc0]"
                            >
                                {/* Paper clipping shadow details */}
                                <div className="absolute top-0 right-0 w-8 h-8 bg-[#dad0c0] dark:bg-[#2a241e] rounded-bl-2xl border-l border-b border-[#c4b5a0] dark:border-[#3a332a] pointer-events-none group-hover:bg-amber-700/20 dark:group-hover:bg-amber-500/20 transition-colors" />

                                <div>
                                    {/* Card Metadata header */}
                                    <div className="flex justify-between items-baseline font-mono text-[13px] mb-4 text-[#6e5d4f] dark:text-[#a8a090]">
                                        <span className="font-bold border border-[#c4b5a0] dark:border-[#3a332a] px-2 py-0.5 rounded bg-[#f2ebd9] dark:bg-[#141210] uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-500">
                                            {ad.category}
                                        </span>
                                        <span className="text-amber-800 dark:text-amber-500/90 font-bold flex items-center gap-1 text-[11px]">
                                            <Clock className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 animate-pulse" />
                                            <span>{ad.expires}</span>
                                        </span>
                                    </div>

                                    {/* Ad Title */}
                                    <h3 className="font-bold text-xl font-serif text-[#2a2017] dark:text-[#f2edd9] group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors tracking-tight line-clamp-1 underline-offset-4 group-hover:underline mb-2">
                                        {ad.title}
                                    </h3>

                                    {/* Ad text body */}
                                    <p className="text-base text-[#524436] dark:text-[#b8b0a0] leading-relaxed mb-6 font-serif italic font-medium line-clamp-2 h-20 overflow-hidden text-ellipsis">
                                        "{ad.desc}"
                                    </p>
                                </div>

                                {/* Card Footer row */}
                                <div className="border-t border-dashed border-[#c4b5a0] dark:border-[#3a332a] pt-4 flex items-center justify-between font-mono text-[13px] text-[#6e5d4f] dark:text-[#a8a090] mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-emerald-800 dark:text-emerald-400 font-bold text-base bg-emerald-800/10 dark:bg-emerald-500/10 border border-emerald-800/20 dark:border-emerald-500/20 px-2 py-0.5 rounded shadow-inner">
                                            {ad.price}
                                        </span>
                                        <span className="text-[13px] text-[#6e5d4f] dark:text-[#787060] mt-1 font-bold">{ad.user}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[12px] text-[#524436] dark:text-[#b8b0a0] bg-[#f2ebd9] dark:bg-[#141210] px-2.5 py-1 rounded-lg border border-[#c4b5a0] dark:border-[#3a332a] shadow-xs">
                                        <MapPin className="w-3.5 h-3.5 text-amber-800 dark:text-amber-500 shrink-0" />
                                        <span>{ad.location} ({getAdDistance(ad)} mi)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        components={{
                            List: GridList,
                            Item: GridItem
                        }}
                    />
                </div>
            )}

            {/* Vintage Retro Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-dashed border-[#b8a690] dark:border-[#443b32] font-mono text-md text-[#6e5d4f] dark:text-[#a8a090] select-none">
                    <div>
                        Showing <span className="font-bold text-[#2c221a] dark:text-[#e5dfd3]">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-bold text-[#2c221a] dark:text-[#e5dfd3]">{Math.min(currentPage * ITEMS_PER_PAGE, sortedAds.length)}</span> of <span className="font-bold text-[#2c221a] dark:text-[#e5dfd3]">{sortedAds.length}</span> listings
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-[#c8baa6] dark:border-[#383028] bg-[#e9dfd0] dark:bg-[#1c1916] text-[#2c221a] dark:text-[#e5dfd3] hover:bg-amber-800/10 dark:hover:bg-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-bold cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Prev</span>
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                                        currentPage === pageNum
                                            ? "bg-amber-800 dark:bg-amber-600 text-white border-amber-800 dark:border-amber-600 shadow-sm"
                                            : "bg-[#fbf7f0] dark:bg-[#12100e] border-[#c8baa6] dark:border-[#383028] text-[#6e5d4f] dark:text-[#a8a090] hover:border-amber-700 dark:hover:border-amber-500"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-[#c8baa6] dark:border-[#383028] bg-[#e9dfd0] dark:bg-[#1c1916] text-[#2c221a] dark:text-[#e5dfd3] hover:bg-amber-800/10 dark:hover:bg-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-bold cursor-pointer"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Retro Disclaimer Note Section */}
            <footer className="mt-8 text-center font-mono text-[14px] text-[#7e6d5f] dark:text-[#787060] uppercase tracking-widest leading-relaxed select-none">
                Notice: Ads automatically drop off the active directory index after expiration thresholds.
                <br />
                Notice layers apply to protect index records against remote script insertion blocks.
            </footer>

            <PostAdModal
                isOpen={isPostAdOpen}
                onClose={() => setIsPostAdOpen(false)}
                onAdCreated={(newAd) => {
                    console.log('Ad created successfully in directory:', newAd);
                }}
            />

            <AdDetailsModal
                isOpen={!!selectedAd}
                onClose={() => setSelectedAd(null)}
                ad={selectedAd}
            />
        </div>
    );
};

