// src/components/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useLogout } from '../store/auth/useLogout';
import { useStore } from '../store/useStore';
import { CreatePostModal } from './CreatePostModal';
import AccountSwitcher from './AccountSwitcher';
import { UserAvatar } from './UserAvatar';
import { useNotificationListener } from '../features/notifications/useNotificationListener';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter
} from './ui/Dialog';
import { Button } from './ui/button';
import {
    Home, Users, Calendar, BarChart3, Compass, Store,
    Newspaper, Megaphone, Shield, Bookmark, Bell, Settings,
    Search, Sun, Moon, LogOut, PlusCircle, X, Menu, Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

export const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    // 🔐 Auth Store Selectors (Zustand + Immer Compliance Matrices)
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const activeAccount = useAuthStore((state) => state.activeAccount);
    const logout = useLogout();

    // 🎨 UI Store Selectors (Zustand + Immer)
    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);
    const isCreateOpen = useStore((state) => state.compose.isOpen);
    const setIsCreateOpen = useStore((state) => state.setCreatePostOpen);

    // 📡 Real-time persistent notification listeners setup
    useNotificationListener();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

    const handleVoiceInClick = () => {
        if (!isAuthenticated) {
            setIsLoginPromptOpen(true);
        } else {
            setIsCreateOpen(true);
        }
    };

    // Close mobile drawer automatically on path shifts
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [currentPath]);

    const userState = useStore((state) => state.userState);
    const streetAddress = useStore((state) => state.streetAddress);
    const politicalOptIn = useStore((state) => state.politicalOptIn);

    const isVouched = Boolean(
        user?.feature_flags?.is_vouched ||
        user?.feature_flags?.is_peer_vouched ||
        (user?.feature_flags?.vouch_count && user.feature_flags?.vouch_count >= 1) ||
        (user?.feature_flags?.account_tier && user.feature_flags?.account_tier > 0)
    );

    const hasAddressOrCoords = Boolean((streetAddress && streetAddress.trim()) || user?.street_address || user?.latitude);
    const hasState = Boolean((userState && userState.trim()) || user?.state || user?.origin_state);
    const canAccessLocalizedFeatures = hasAddressOrCoords || hasState;
    const canAccessCivicAssembly = isAuthenticated && politicalOptIn && isVouched;

    // 📌 DYNAMIC ROUTES CONFIGURATION ARRAYS MAPPINGS
    const navItems = [
        { name: 'Home', path: '/home', icon: Home },
        { name: 'Communities', path: '/communities', icon: Users },
        ...(canAccessLocalizedFeatures ? [{ name: 'Events', path: '/events', icon: Calendar }] : []),
        ...(canAccessLocalizedFeatures ? [{ name: 'My Schedule', path: '/calendar', icon: Calendar }] : []),
        { name: 'Polls', path: '/polls', icon: BarChart3 },
        { name: 'Explore', path: '/explore', icon: Compass },
        ...(canAccessLocalizedFeatures ? [{ name: 'Local Businesses', path: '/businesses', icon: Store }] : []),
        ...(canAccessLocalizedFeatures ? [{ name: 'Classifieds', path: '/classifieds', icon: Newspaper }] : []),
        ...(isAuthenticated ? [{ name: 'Organize', path: '/organize', icon: Megaphone }] : []),
        ...(canAccessCivicAssembly ? [{ name: 'Civic Assembly', path: '/campaigns/local', icon: Users }] : []),
        ...(isAuthenticated ? [{ name: 'Bookmarks', path: '/bookmarks', icon: Bookmark }] : []),
        ...(isAuthenticated ? [{ name: 'Notifications', path: '/notifications', icon: Bell }] : []),
        ...(isAuthenticated ? [{ name: 'Settings', path: '/settings', icon: Settings }] : []),
    ];

    const adminNavItems = [];
    if (user && (user.role === 'root_admin' || user.role === 'admin')) {
        adminNavItems.push({ name: 'Root Desk', path: '/admin/root', icon: Shield });
        adminNavItems.push({ name: 'Ops Desk', path: '/admin/moderation', icon: Shield });
    } else if (user && user.role === 'moderator') {
        adminNavItems.push({ name: 'Ops Desk', path: '/admin/moderation', icon: Shield });
    }

    const allNavItems = [...navItems, ...adminNavItems];

    const handleLogoutClick = (e) => {
        e.stopPropagation();
        logout(() => navigate('/'));
    };

    return (
        <div className={cn(
            "bg-[#f8fafc] dark:bg-[#090d12] text-text-primary min-h-screen custom-scrollbar flex flex-col font-sans transition-colors duration-200"
        )}>
            {/* 🖥️ Side Navigation Shell - Desktop Column Card */}
            <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-[#0b1017] border-r border-black/5 dark:border-white/5 hidden md:flex flex-col z-50 shadow-sm">
                <div className="flex flex-col gap-2 p-6 h-full">
                    {/* Brand Node Identity */}
                    <div onClick={() => navigate('/')} className="mb-8 px-2 flex items-center gap-0 cursor-pointer hover:opacity-90 select-none">
                        <img src="/Shield&WINGS.png" alt="Kollective Logo" className="h-14 w-auto object-contain" />
                        <span className="text-xl font-black inline-block bg-[#CC033B] bg-clip-text text-transparent"
                            style={{ fontSize: "28px", fontFamily: "Protest Riot, sans-serif" }}>
                            Kollective
                        </span>
                    </div>

                    {/* Dynamic Sidebar Anchor Roster List */}
                    <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 scrollbar-thin text-left select-none">
                        {allNavItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = currentPath === item.path ||
                                (item.path === '/home' && currentPath.startsWith('/post')) ||
                                (item.path === '/settings' && currentPath.startsWith('/settings')) ||
                                (item.path === '/events' && currentPath.startsWith('/events')) ||
                                (item.path === '/classifieds' && currentPath.startsWith('/classifieds'));

                            return (
                                <Link
                                    key={`desktop-nav-${item.name}`}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-4 py-3 transition-all active:scale-[0.98] border-r-4 outline-none",
                                        isActive
                                            ? 'text-text-primary bg-surface-container-high/40 dark:bg-white/[0.02] border-r-primary-container font-black shadow-inner'
                                            : 'text-text-secondary border-r-transparent hover:bg-black/[0.015] dark:hover:bg-white/[0.01] hover:text-text-primary font-bold'
                                    )}
                                >
                                    <IconComponent className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-container stroke-[2.5px]" : "opacity-70")} />
                                    <span className="text-base tracking-tight">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    {/* Voice-In Trigger and Auth User Session Node */}
                    <div className="mt-auto space-y-4 select-none">
                        <Button
                            onClick={handleVoiceInClick}
                            variant="default"
                            className="w-full bg-primary-container text-white font-black text-sm uppercase py-4 rounded-xl crimson-glow cursor-pointer hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-none outline-none"
                        >
                            <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
                            <span>Voice In</span>
                        </Button>

                        {user && (
                            <div
                                onClick={() => {
                                    const username = (activeAccount?.handle || user.handle || 'user').replace('@', '');
                                    navigate(`/profile/@${username}`, { state: { fromCard: true } });
                                }}
                                className="p-3.5 bg-surface-container-low dark:bg-white/[0.01] rounded-xl border border-black/5 dark:border-white/5 flex items-center gap-3 cursor-pointer hover:bg-surface-container-high/40 transition-all shadow-inner"
                            >
                                <div className="relative flex-shrink-0">
                                    <UserAvatar
                                        user={activeAccount || user}
                                        name={activeAccount?.name || user?.name}
                                        avatar={activeAccount?.avatar || user?.avatar}
                                        className="w-10 h-10 border border-black/5 rounded-full"
                                        showStatus={false}
                                    />
                                    <span className={cn(
                                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-[#0b1017] z-10",
                                        (!activeAccount || activeAccount.type === 'personal') ? 'bg-primary-container' : 'bg-amber-400'
                                    )} />
                                </div>
                                <div className="overflow-hidden min-w-0 flex-1 text-left">
                                    <p className="text-sm font-black truncate text-text-primary tracking-tight">
                                        {activeAccount?.name || user.name}
                                    </p>
                                    <p className="text-xs font-semibold font-mono text-text-secondary truncate mt-0.5 opacity-60">
                                        {activeAccount?.handle || user.handle}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    title="Log out (Return to Landing)"
                                    className="p-1 text-text-secondary hover:text-rose-400 ml-auto transition-colors bg-transparent border-none cursor-pointer outline-none"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
            {/* 📱 Mobile Drawer Backdrop sliding overlay system panel container */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden font-sans">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-[#0b1017] h-full p-6 text-text-primary border-r border-black/5 dark:border-white/5 animate-in slide-in-from-left duration-300 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between select-none">
                            <div className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5 text-primary-container" />
                                <span className="font-black text-lg tracking-tight uppercase">Kollective</span>
                            </div>
                            <button type="button" onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-white outline-none cursor-pointer bg-transparent border-none p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-1 overflow-y-auto flex-1 text-left pr-1 scrollbar-none select-none">
                            {allNavItems.map((item) => {
                                const MobileIcon = item.icon;
                                const isMobileActive = currentPath === item.path;
                                return (
                                    <Link
                                        key={`mobile-nav-${item.name}`}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-4 rounded-xl px-4 py-3 text-base outline-none",
                                            isMobileActive
                                                ? 'text-text-primary bg-surface-container-high border-l-4 border-primary-container font-black'
                                                : 'text-text-secondary hover:text-text-primary font-bold'
                                        )}
                                    >
                                        <MobileIcon className={cn("w-4 h-4 shrink-0", isMobileActive ? "text-primary-container" : "opacity-70")} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {user && (
                            <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3 text-left">
                                <div className="flex justify-between items-center select-none">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-text-secondary font-mono">Identity Context</span>
                                    <AccountSwitcher compact />
                                </div>
                                <div
                                    onClick={() => {
                                        const username = (activeAccount?.handle || user.handle || 'user').replace('@', '');
                                        navigate(`/profile/${username}`, { state: { fromCard: true } });
                                    }}
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity p-2 rounded-xl bg-black/[0.015] dark:bg-white/[0.01] border border-black/5"
                                >
                                    <UserAvatar
                                        user={activeAccount || user}
                                        name={activeAccount?.name || user?.name}
                                        avatar={activeAccount?.avatar || user?.avatar}
                                        className="w-10 h-10 border rounded-full"
                                        showStatus={false}
                                    />
                                    <div className="overflow-hidden min-w-0">
                                        <p className="font-black text-sm truncate text-text-primary tracking-tight">{activeAccount?.name || user.name}</p>
                                        <p className="text-xs font-mono text-text-secondary truncate mt-0.5">{activeAccount?.handle || user.handle}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            )}
            {/* 🧭 Top Fixed Header System Bar */}
            <header className="fixed top-0 w-full z-40 bg-white/80 dark:bg-[#090d12]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 md:ml-72 md:w-[calc(100%-18rem)] select-none">
                <div className="flex justify-between items-center pl-6 pr-6 sm:pr-12 h-16 w-full max-w-7xl mx-auto">

                    {/* Mobile Menu Action Strips */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button type="button" onClick={() => setMobileMenuOpen(true)} className="text-text-primary focus:outline-none bg-transparent border-none p-1 cursor-pointer">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div onClick={() => navigate('/')} className="w-9 h-9 bg-primary-container rounded-xl flex items-center justify-center cursor-pointer shadow-sm shadow-primary-container/25">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Desktop Search Engine Bar Input Shell */}
                    <div className="hidden md:flex flex-1 items-center gap-4 select-none">
                        <div className="relative w-full max-w-xl font-sans">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/60" />
                            <input
                                className="w-full bg-black/[0.02] dark:bg-surface-container-lowest/40 border border-black/10 dark:border-white/10 rounded-full py-2.5 pl-11 pr-5 text-sm font-medium focus:outline-none focus:border-primary-container transition-colors placeholder:text-text-secondary/30 text-text-primary"
                                placeholder="Search the Kollective network registry..."
                                type="text"
                            />
                        </div>
                    </div>

                    {/* Granular Authentication Quick Links Actions Row */}
                    {isAuthenticated && (
                        <div className="flex items-center gap-3 sm:gap-4 font-sans text-text-secondary">
                            <AccountSwitcher />

                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="p-1.5 hover:text-text-primary transition-colors focus:outline-none bg-transparent border-none cursor-pointer outline-none active:scale-95"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <div onClick={() => navigate('/notifications')} className="relative p-1.5 hover:text-text-primary transition-colors cursor-pointer" title="Notification alert desk">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-container rounded-full border border-white dark:border-[#090d12]"></span>
                            </div>

                            <div onClick={() => navigate('/calendar')} className={cn("p-1.5 transition-colors cursor-pointer", currentPath === '/calendar' ? 'text-primary-container font-bold' : 'hover:text-text-primary')} title="My Schedule Calendar">
                                <Calendar className="w-4 h-4" />
                            </div>

                            <div onClick={() => navigate('/settings')} className="p-1.5 hover:text-text-primary transition-colors cursor-pointer" title="Node settings configuration link">
                                <Settings className="w-4 h-4" />
                            </div>
                        </div>
                    )}
                </div>
            </header>
            {/* 🖼️ Main Dynamic Nested Content Viewport Slot Stage */}
            <main className="md:ml-72 pt-20 pb-24 px-4 sm:px-6 min-h-screen flex-1 w-full relative">
                <div className="max-w-7xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>

            {/* 📱 Mobile Bottom Floating Quick-Navigation Menu Strip Container */}
            <nav className="fixed bottom-0 w-full bg-white/90 dark:bg-[#090d12]/90 backdrop-blur-xl border-t border-black/5 dark:border-white/5 md:hidden z-50 flex justify-around items-center h-16 select-none font-sans text-[11px] uppercase tracking-wider font-extrabold">
                <Link
                    to="/home"
                    className={cn("flex flex-col items-center gap-0.5 transition-colors", currentPath === '/home' ? 'text-primary-container font-black' : 'text-text-secondary')}
                >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                </Link>
                <Link
                    to="/explore"
                    className={cn("flex flex-col items-center gap-0.5 transition-colors", currentPath === '/explore' ? 'text-primary-container font-black' : 'text-text-secondary')}
                >
                    <Compass className="w-5 h-5" />
                    <span>Explore</span>
                </Link>

                {/* Mobile Floating Voice Post Dialog Trigger Box */}
                <button
                    type="button"
                    onClick={handleVoiceInClick}
                    className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center -mt-8 shadow-xl shadow-primary-container/30 border-4 border-[#f8fafc] dark:border-[#090d12] active:scale-90 transition-transform outline-none cursor-pointer"
                    aria-label="Dispatch voice post alerts"
                >
                    <PlusCircle className="w-6 h-6 text-white stroke-[2.5px]" />
                </button>

                <Link
                    to="/communities"
                    className={cn("flex flex-col items-center gap-0.5 transition-colors", currentPath === '/communities' ? 'text-primary-container font-black' : 'text-text-secondary')}
                >
                    <Users className="w-5 h-5" />
                    <span>Circles</span>
                </Link>
                <Link
                    to="/organize"
                    className={cn("flex flex-col items-center gap-0.5 transition-colors", currentPath === '/organize' ? 'text-primary-container font-black' : 'text-text-secondary')}
                >
                    <Megaphone className="w-5 h-5" />
                    <span>Organize</span>
                </Link>
            </nav>
            {/* 📝 Floating Create Post Dynamic Modal Overlay Sheet */}
            {isCreateOpen && (
                <CreatePostModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            )}

            {/* 🔒 Secure Unauthenticated Login Prompt Dialog Portal */}
            {isLoginPromptOpen && (
                <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
                    <DialogContent className="max-w-[420px] bg-white dark:bg-[#141414] text-text-primary dark:text-white border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl font-sans text-left">
                        <DialogHeader className="border-b border-black/5 dark:border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between select-none">
                            <DialogTitle className="text-xl font-black text-text-primary dark:text-white flex items-center gap-2.5 tracking-tight uppercase text-sm">
                                <Lock className="w-5 h-5 text-primary-container shrink-0" />
                                <span>Log in Required</span>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-5 space-y-2 text-left font-sans">
                            <p className="text-text-primary dark:text-white text-lg font-bold leading-snug">
                                Please log in to broadcast a post.
                            </p>
                            <p className="text-text-secondary text-xs font-semibold leading-relaxed">
                                Live voice posts and action alerts require an active, validated session signature token node to register on the community dashboard maps.
                            </p>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-black/5 dark:border-white/5 p-0 uppercase font-mono font-bold text-xs select-none">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginPromptOpen(false);
                                    navigate('/login');
                                }}
                                className="w-full py-3 bg-primary-container text-white rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-95 transition-all cursor-pointer border-none outline-none"
                            >
                                Log in to Account
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLoginPromptOpen(false)}
                                className="w-full py-3 bg-surface-container-high dark:bg-[#222] hover:bg-black/5 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary rounded-xl transition-all cursor-pointer border border-black/10 dark:border-white/5 outline-none font-sans"
                            >
                                Cancel
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* ⚡ Real-time Jury Duty Notification Modal Overlay */}
            {/* juryAlert && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
                    <div className="border border-rose-500 bg-surface-container max-w-md w-full p-8 font-mono text-text-primary text-center glass-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-full border-2 border-rose-500 text-rose-500 text-2xl flex items-center justify-center mx-auto mb-4 bg-rose-500/10">
                            ⚡
                        </div>
                        <div className="text-rose-500 text-lg font-bold tracking-wider mb-2 uppercase">JURY DUTY SUMMONS</div>
                        <h3 className="text-xl font-black mb-4 uppercase text-text-primary">BLIND AUDIT ASSIGNED</h3>
                        <p className="text-md text-text-secondary leading-relaxed mb-6 font-sans">
                            You have been selected at random for a blind peer review jury to verify an Activist account application.
                            Your vote is completely anonymous and key to securing our platform integrity.
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    const appId = juryAlert.application_id || '201';
                                    setJuryAlert(null); // Clear the active alert in the UI store slice
                                    navigate(`/verify/jury/${appId}`);
                                }}
                                className="w-full p-3 font-bold text-md bg-rose-600 hover:bg-rose-500 text-white uppercase tracking-wider transition-all cursor-pointer"
                            >
                                ENTER BALLOT BOOTH
                            </button>
                            <button
                                onClick={() => setJuryAlert(null)}
                                className="w-full p-3 font-bold text-md border border-white/5 hover:border-white/10 text-text-secondary hover:text-text-primary uppercase transition-colors cursor-pointer bg-surface-container-high"
                            >
                                ABSTAIN / DISMISS
                            </button>
                        </div>
                    </div>
                </div>
            ) */}
        </div>
    );
};
