// src/components/CreatePostModal.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useStore } from '../../store/useStore';
import { useCreatePost } from '../../features/timeline/useCreatePost';
import { useQueryClient } from '@tanstack/react-query';
import { CreatePostForm } from '../posts/CreatePostForm';
import { FileText, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from '../ui/Dialog';

export const CreatePostModal = ({ open, onOpenChange }) => {
    // Pull core session hooks at the absolute top layer boundary
    const user = useAuthStore((state) => state.user);
    const createPostMutation = useCreatePost();
    const queryClient = useQueryClient();
    const [showPollComposer, setShowPollComposer] = useState(false);

    // Connect global state monitors
    const activeTab = useStore((state) => state.homeFeedTab);
    const setCreatePostOpen = useStore((state) => state.setCreatePostOpen);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* 🚀 CONTRAST PROTECTION: Replaced hardcoded dark background with theme-responsive utility variables */}
            <DialogContent className="max-w-[560px] bg-white dark:bg-[#141414] text-text-primary dark:text-white border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden p-0 shadow-2xl">

                {/* Header toolbar panel layout navigation */}
                <DialogHeader className="border-b border-black/5 dark:border-white/5 pb-4 p-6 flex flex-row justify-between items-center bg-black/[0.01] dark:bg-surface-container-lowest/50 select-none">
                    <DialogTitle className="text-xl font-black text-text-primary dark:text-white tracking-tight">
                        {showPollComposer ? 'Create Poll' : 'Create Post'}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors group mr-1 cursor-pointer bg-transparent border-none text-text-secondary outline-none"
                        >
                            <FileText className="w-5 h-5 opacity-70 group-hover:text-text-primary group-hover:opacity-100 transition-opacity" />
                        </button>
                        <DialogClose />
                    </div>
                </DialogHeader>

                {/* 🏆 SUB-FORM TARGET LAYER MODULE INJECTION POINT */}
                <CreatePostForm
                    user={user}
                    mutation={createPostMutation}
                    activeTab={activeTab}
                    queryClient={queryClient}
                    setCreatePostOpen={setCreatePostOpen}
                    onOpenChange={onOpenChange}
                    showPollComposer={showPollComposer}
                    setShowPollComposer={setShowPollComposer}
                />

            </DialogContent>
        </Dialog>
    );
};
