// src/components/LoginPromptModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter
} from './ui/Dialog';

export function LoginPromptModal({ isOpen, onClose, message = "Please log in to perform this action." }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[420px] bg-[#141414] text-white border border-white/10 rounded-2xl p-6 shadow-2xl">
                <DialogHeader className="border-b border-white/10 pb-4 p-0 bg-transparent flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-2xl">lock</span>
                        Log in
                    </DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <div className="py-4 space-y-3">
                    <p className="text-text-secondary text-lg leading-relaxed font-bold">
                        {message}
                    </p>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t-0 p-0">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            navigate('/login');
                        }}
                        className="w-full py-3 bg-primary-container hover:bg-primary-container/90 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm uppercase tracking-wider border-none"
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-surface-container-high hover:bg-white/10 text-text-secondary hover:text-text-primary font-bold rounded-xl transition-all cursor-pointer text-sm border border-white/10"
                    >
                        Cancel
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
