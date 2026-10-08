// src/pages/MessagesPage.jsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/apiClient';
import { DirectMessageView } from '../features/conversations/DirectMessageView';
import { Mail, Search, MessageSquare, Loader2, CalendarDays } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MessagesPage() {
    const [selectedInboxId, setSelectedInboxId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const token = localStorage.getItem("user_token") || "";

    // 1️⃣ Fetch the active user's inbox list via TanStack Query
    const { data: inboxPayload, isLoading: isInboxLoading } = useQuery({
        queryKey: ['conversations', 'inbox'],
        queryFn: async () => {
            const res = await apiFetch('/api/v1/conversations');
            return res?.data || res || [];
        },
        staleTime: 15000
    });

    // 2️⃣ Filter the inbox array list using local text queries
    const filteredInbox = useMemo(() => {
        if (!Array.isArray(inboxPayload)) return [];
        return inboxPayload.filter((chat) => {
            const name = chat?.other_user?.username || chat?.other_user?.name || "";
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [inboxPayload, searchQuery]);

    // Force default row selection upon initial compilation finish
    React.useEffect(() => {
        if (filteredInbox.length > 0 && !selectedInboxId) {
            setSelectedInboxId(filteredInbox[0].id);
        }
    }, [filteredInbox, selectedInboxId]);

    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 font-sans text-left animate-in fade-in duration-200">
            {/* Header Title Section */}
            <header className="mb-6 select-none">
                <div className="flex items-center gap-2 text-primary-container mb-1.5">
                    <Mail className="w-5 h-5 stroke-[2.5px]" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-primary-container/10 px-2 py-0.5 border border-primary-container/20 rounded">
                        Communication Center
                    </span>
                </div>
                <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-1">Messages</h1>
                <p className="text-sm font-medium text-neutral-500 max-w-xl leading-relaxed">
                    Review incoming encrypted transmissions, coordinate community operations, and manage secure channels.
                </p>
            </header>

            {/* LinkedIn / Twitter Styled Split-Pane Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 border border-neutral-200 rounded-[24px] overflow-hidden bg-white shadow-xl h-[680px]">

                {/* 📂 LEFT PANEL SIDEBAR: Inbox Threads Stream */}
                <div className="lg:col-span-4 border-r border-neutral-200 flex flex-col h-full bg-neutral-50/30">
                    {/* Search Field Ingress Wrapper */}
                    <div className="p-4 border-b border-neutral-100 select-none shrink-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 stroke-[2.5px]" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-800 rounded-xl focus:border-primary-container focus:outline-none placeholder:text-neutral-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Inbox Threads Scrolling Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-transparent">
                        {isInboxLoading ? (
                            <div className="py-32 text-center text-neutral-400 font-mono text-[11px] font-bold uppercase tracking-widest flex flex-col items-center gap-3 opacity-60 select-none">
                                <Loader2 className="w-5 h-5 animate-spin text-primary-container" />
                                <span>Compiling inbox feeds...</span>
                            </div>
                        ) : filteredInbox.length > 0 ? (
                            filteredInbox.map((chat) => {
                                const isSelected = selectedInboxId === chat.id;
                                const partner = chat?.other_user || { username: "User" };
                                const lastMsgText = chat?.last_message?.text || chat?.last_message?.content || "Sent an encrypted transmission.";
                                const timeStr = chat?.updated_at
                                    ? new Date(chat.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                    : "";

                                return (
                                    <div
                                        key={`inbox-row-${chat.id}`}
                                        onClick={() => setSelectedInboxId(chat.id)}
                                        className={cn(
                                            "flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border text-left",
                                            isSelected
                                                ? "bg-primary-container/[0.03] border-primary-container/40 ring-1 ring-primary-container/10 shadow-sm"
                                                : "bg-transparent border-transparent hover:bg-black/[0.01]"
                                        )}
                                    >
                                        <img
                                            src={partner.avatar || "/default-avatar.jpg"}
                                            className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                                            alt="Partner"
                                        />

                                        <div className="min-w-0 flex-1 relative">
                                            <div className="flex justify-between items-baseline mb-0.5 select-none font-mono">
                                                <h4 className={cn(
                                                    "text-xs truncate font-sans tracking-tight",
                                                    chat.unread_count > 0 ? "font-black text-neutral-900" : "font-black text-neutral-800"
                                                )}>
                                                    @{partner.username}
                                                </h4>
                                                <span className="text-[10px] text-neutral-400 font-bold shrink-0">{timeStr}</span>
                                            </div>
                                            <p className={cn(
                                                "text-xs truncate leading-normal pr-4 font-medium",
                                                chat.unread_count > 0 ? "text-neutral-900 font-bold" : "text-neutral-400 font-medium"
                                            )}>
                                                {lastMsgText}
                                            </p>

                                            {/* Unread Counter Badge Vector */}
                                            {chat.unread_count > 0 && (
                                                <span className="absolute right-0 bottom-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 text-[9px] font-mono font-black text-white select-none shadow-sm animate-in scale-in">
                                                    {chat.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-32 text-center text-neutral-400 font-mono text-xs flex flex-col items-center gap-1 select-none opacity-50">
                                <MessageSquare className="w-5 h-5 stroke-[1.5px] text-neutral-300 mb-1" />
                                <span>No active conversations found.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 🛡️ RIGHT PANEL: Active DirectMessageView Component Viewport */}
                <div className="lg:col-span-8 h-full bg-white relative">
                    {selectedInboxId ? (
                        <div className="h-full animate-in fade-in duration-150">
                            {/* Force-renders individual thread controls by overriding the default padding boxes inside DirectMessageView */}
                            <DirectMessageView key={`dm-view-pane-${selectedInboxId}`} overrideId={selectedInboxId} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono text-xs text-neutral-400 opacity-50 select-none">
                            <Mail className="w-6 h-6 stroke-[1.5px] text-neutral-300 mb-1 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
