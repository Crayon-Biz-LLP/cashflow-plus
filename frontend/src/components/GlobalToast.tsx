"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface ToastState {
    message: string;
    isOpen: boolean;
}

export const showSuccessToast = (message: string) => {
    const event = new CustomEvent("SHOW_SUCCESS_TOAST", { detail: message });
    window.dispatchEvent(event);
};

export default function GlobalToast() {
    const [toast, setToast] = useState<ToastState>({ message: "", isOpen: false });

    const handleToastEvent = useCallback((e: any) => {
        setToast({ message: e.detail, isOpen: true });
    }, []);

    useEffect(() => {
        window.addEventListener("SHOW_SUCCESS_TOAST", handleToastEvent);
        return () => window.removeEventListener("SHOW_SUCCESS_TOAST", handleToastEvent);
    }, [handleToastEvent]);

    useEffect(() => {
        if (toast.isOpen) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, isOpen: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.isOpen]);

    return (
        <AnimatePresence>
            {toast.isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-start justify-center pointer-events-none pt-10 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className="pointer-events-auto bg-slate-900 border border-white/10 text-white px-8 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[320px] backdrop-blur-xl"
                    >
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-black tracking-tight uppercase italic flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                                Success
                            </h4>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(prev => ({ ...prev, isOpen: false }))}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-500"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
