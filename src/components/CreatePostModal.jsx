// src/components/CreatePostModal.jsx
import React from 'react';
import { useAuthStore } from '../store/auth/useAuthStore';
import { useStore } from '../store/useStore';
import { useCreatePost } from '../features/timeline/useCreatePost';
import { useQueryClient } from '@tanstack/react-query';
import { CreatePostForm } from './CreatePostForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose
} from './ui/Dialog';

export const CreatePostModal = ({ open, onOpenChange }) => {
    // Pull core session hooks at the absolute top layer boundary
    const user = useAuthStore((state) => state.user);
    const createPostMutation = useCreatePost();
    const queryClient = useQueryClient();

    // Connect global state monitors
    const activeTab = useStore((state) => state.homeFeedTab);
    const setCreatePostOpen = useStore((state) => state.setCreatePostOpen);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[560px] bg-[#141414] text-white border border-white/5 rounded-2xl overflow-hidden p-0 shadow-2xl">

                {/* Header toolbar panel layout navigation */}
                <DialogHeader className="border-b border-white/5 pb-4 p-6 flex flex-row justify-between items-center bg-surface-container-lowest/50 select-none">
                    <DialogTitle className="text-xl font-extrabold text-text-primary tracking-tight">
                        Create post
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group mr-1 cursor-pointer bg-transparent border-none text-text-secondary"
                        >
                            <span className="material-symbols-outlined group-hover:text-text-primary">drafts</span>
                        </button>
                        <DialogClose />
                    </div>
                </DialogHeader>

                {/* 🏆 SUB-FORM TARGET LAYER MODULE INJECTION POINT */}
                {/* Delivers core hooks down as explicit parameters with no internal context collision hooks */}
                <CreatePostForm
                    user={user}
                    mutation={createPostMutation}
                    activeTab={activeTab}
                    queryClient={queryClient}
                    setCreatePostOpen={setCreatePostOpen}
                    onOpenChange={onOpenChange}
                />

            </DialogContent>
        </Dialog>
    );
};
