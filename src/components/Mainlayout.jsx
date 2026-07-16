// components/MainLayout.jsx (Part 1 of 3)
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useStore } from '../store/useStore';
//import { useTimelineSocket } from '../hooks/useTimelineSocket';
import { CreatePostModal } from './CreatePostModal';
import { useNotificationListener } from '../features/notifications/useNotificationListener';

export const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    // 🔐 Auth Store Selectors (Zustand)
    const user = useAuthStore((state) => state.user);
    const executeGlobalLogout = useAuthStore((state) => state.executeGlobalLogout);

    // 🎨 UI Store Selectors (Zustand + Immer)
    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);
    const isCreateOpen = useStore((state) => state.compose.isOpen);
    const setIsCreateOpen = useStore((state) => state.setCreatePostOpen);
    //const juryAlert = useStore((state) => state.modals.juryAlert);
    //const setJuryAlert = useStore((state) => state.setJuryAlert);

    // 📡 Real-time persistent Elixir channel push listener connection
    //useTimelineSocket();
    useNotificationListener();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Close mobile drawer automatically on path shifts
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [currentPath]);

    const navItems = [
        { name: 'Home', path: '/home', icon: 'home' },
        { name: 'Communities', path: '/communities', icon: 'groups' },
        { name: 'Events', path: '/events', icon: 'calendar_today' },
        { name: 'Polls', path: '/polls', icon: 'poll' },
        { name: 'Explore', path: '/explore', icon: 'explore' },
        { name: 'Bookmarks', path: '/bookmarks', icon: 'bookmark' },
        { name: 'Organize', path: '/organize', icon: 'campaign' },
        { name: 'Local Businesses', path: '/businesses', icon: 'storefront' },
        { name: 'Notifications', path: '/notifications', icon: 'notifications' },
        { name: 'Settings', path: '/settings', icon: 'settings' },
    ];

    const adminNavItems = [];
    if (user && (user.role === 'root_admin' || user.role === 'admin')) {
        adminNavItems.push({ name: 'Root Desk', path: '/admin/root', icon: 'shield_person' });
        adminNavItems.push({ name: 'Ops Desk', path: '/admin/moderation', icon: 'gavel' });
    } else if (user && user.role === 'moderator') {
        adminNavItems.push({ name: 'Ops Desk', path: '/admin/moderation', icon: 'gavel' });
    }

    const allNavItems = [...navItems, ...adminNavItems];

    const handleLogoutClick = (e) => {
        e.stopPropagation();
        executeGlobalLogout();
        navigate('/');
    };

    return (
        <div className={`${theme === 'dark' ? 'dark' : ''} bg-surface text-text-primary min-h-screen custom-scrollbar flex flex-col`}>

            {/* 🖥️ Side Navigation Shell - Desktop */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowestX bg-transparent border-r border-white/5 hidden md:flex flex-col z-50">
                <div className="flex flex-col gap-2 p-6 h-full">
                    {/* Logo */}
                    <div onClick={() => navigate('/')} className="mb-8 px-2 flex items-center gap-0 cursor-pointer hover:opacity-90">
                        <img src="/K99.png" alt="Kollective Logo" className="h-12 w-auto" />
                        <div>
                            <span className="text-xl font-bold sm:inline-block bg-[#CC033B] bg-clip-text text-transparent"
                                style={{ fontSize: "28px", fontFamily: "Protest Riot, sans-serif" }}>
                                Kollective
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1">
                        {allNavItems.map((item) => {
                            const isActive = currentPath === item.path ||
                                (item.path === '/home' && currentPath.startsWith('/post')) ||
                                (item.path === '/settings' && currentPath.startsWith('/settings')) ||
                                (item.path === '/events' && currentPath.startsWith('/events'));
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all active:scale-[0.98] ${isActive
                                        ? 'text-text-primary bg-surface-container-high/40 border-r-4 border-primary-container font-bold'
                                        : 'text-text-secondary hover:bg-surface-container-highest/20 hover:text-text-primary font-semibold'
                                        }`}
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="font-label-md text-label-md">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Create Button & User Card */}
                    <div className="mt-auto">
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="w-full bg-primary-container text-white font-bold text-label-md py-4 rounded-xl crimson-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            Voice In
                        </button>

                        {user && (
                            <div
                                onClick={() => {
                                    const username = user.handle ? user.handle.replace('@', '') : 'user';
                                    navigate(`/profile/${username}`, { state: { fromCard: true } });
                                }}
                                className="mt-6 p-4 bg-surface-container-low rounded-xl border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-surface-container-high/40 transition-colors"
                            >
                                <img alt="User avatar" className="w-10 h-10 rounded-full object-cover" src={user.avatar} />
                                <div className="overflow-hidden">
                                    <p className="font-label-md text-label-md truncate text-text-primary">{user.name}</p>
                                    <p className="font-label-sm text-label-sm text-text-secondary truncate">{user.handle}</p>
                                </div>
                                <button
                                    onClick={handleLogoutClick}
                                    title="Log out (Return to Landing)"
                                    className="material-symbols-outlined text-text-secondary hover:text-white ml-auto text-[20px] cursor-pointer"
                                >
                                    logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* 📱 Mobile Drawer backdrop sliding overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="relative flex flex-col w-64 max-w-xs bg-surface-container-lowest h-full p-6 text-text-primary border-r border-white/5 animate-in slide-in-from-left duration-300">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-sm">shield</span>
                                </div>
                                <span className="font-bold text-lg">Kollective</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2">
                            {allNavItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm ${currentPath === item.path
                                        ? 'text-text-primary bg-surface-container-high/40 border-l-4 border-primary-container font-bold'
                                        : 'text-text-secondary hover:text-text-primary font-semibold'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {user && (
                            <div
                                onClick={() => {
                                    const username = user.handle ? user.handle.replace('@', '') : 'user';
                                    navigate(`/profile/${username}`, { state: { fromCard: true } });
                                }}
                                className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                            >
                                <img alt="User avatar" className="w-10 h-10 rounded-full object-cover" src={user.avatar} />
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate">{user.name}</p>
                                    <p className="text-sm text-text-secondary truncate">{user.handle}</p>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            )}

            {/* 🧭 Top Header Fixed Bar */}
            <header className="fixed top-0 w-full z-40 bg-surface/95 backdrop-blur-xl border-b border-white/5 md:ml-64 md:w-[calc(100%-16rem)]">
                <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 md:hidden">
                        <button onClick={() => setMobileMenuOpen(true)} className="text-text-primary focus:outline-none">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div onClick={() => navigate('/')} className="w-8 h-8 bg-primary-container rounded flex items-center justify-center cursor-pointer">
                            <span className="material-symbols-outlined text-white text-sm">shield</span>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-1 items-center gap-4">
                        <div className="relative w-full max-w-2xl">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[22px]">
                                search
                            </span>
                            <input
                                className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-full py-3 pl-12 pr-5 text-body-md font-label-md focus:outline-none focus:border-primary-container transition-colors placeholder-text-text-secondary/50 text-text-primary"
                                placeholder="Search the Kollective..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-1 cursor-pointer text-text-secondary hover:text-text-primary transition-colors focus:outline-none bg-transparent border-none"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        <div onClick={() => navigate('/notifications')} className="relative cursor-pointer text-text-secondary hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full border-2 border-surface"></span>
                        </div>

                        <div onClick={() => navigate('/settings')} className="cursor-pointer text-text-secondary hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[22px]">settings</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 🖼️ Main Content Viewport */}
            <main className="md:ml-64 pt-20 pb-24 px-6 min-h-screen flex-1">
                {/* Render nested child view routes dynamically via React Router v7 */}
                <Outlet />
            </main>

            {/* 📱 Mobile Bottom Navigation Menu */}
            <nav className="fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl border-t border-white/5 md:hidden z-50 flex justify-around items-center h-16">
                <Link
                    to="/home"
                    className={`flex flex-col items-center gap-0.5 ${currentPath === '/home' ? 'text-primary-container font-bold' : 'text-text-secondary'}`}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                    <span className="text-[14px]">Home</span>
                </Link>
                <Link
                    to="/explore"
                    className={`flex flex-col items-center gap-0.5 ${currentPath === '/explore' ? 'text-primary-container font-bold' : 'text-text-secondary'}`}
                >
                    <span className="material-symbols-outlined">explore</span>
                    <span className="text-[14px]">Explore</span>
                </Link>

                {/* Floating Post Trigger */}
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center -mt-8 shadow-2xl shadow-primary-container/40 border-4 border-surface active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined text-white text-[28px]">add</span>
                </button>

                <Link
                    to="/communities"
                    className={`flex flex-col items-center gap-0.5 ${currentPath === '/communities' ? 'text-primary-container font-bold' : 'text-text-secondary'}`}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/communities' ? "'FILL' 1" : "'FILL' 0" }}>groups</span>
                    <span className="text-[14px]">Circles</span>
                </Link>
                <Link
                    to="/organize"
                    className={`flex flex-col items-center gap-0.5 ${currentPath === '/organize' ? 'text-primary-container font-bold' : 'text-text-secondary'}`}
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPath === '/organize' ? "'FILL' 1" : "'FILL' 0" }}>campaign</span>
                    <span className="text-[14px]">Organize</span>
                </Link>
            </nav>

            {/* 📝 Floating Create Post Dialog */}
            {isCreateOpen && (
                <CreatePostModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
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
