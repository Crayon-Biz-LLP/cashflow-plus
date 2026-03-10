"use client";

import React, { useState } from "react";
import { X, Loader2, Briefcase, User, Calendar, IndianRupee, Tag, Plus, Target, Zap, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessToast } from "./GlobalToast";

interface NewCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewCaseModal({ isOpen, onClose, onSuccess }: NewCaseModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        client: "",
        amount: "",
        priority: "Medium",
        dueDate: "",
        notes: "",
        tags: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                ...formData,
                amount: Number(formData.amount),
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
            };

            if (!payload.dueDate) delete payload.dueDate;

            await api.createCase(payload);
            showSuccessToast(`Case "${formData.title}" added to your pipeline.`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to create case:", error);
            alert(error.message || "Failed to create case. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
            >
                {/* Clean Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-600/10 text-teal-600 rounded-lg">
                            <Briefcase size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Create New Case</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Add a new legal matter to your pipeline</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Case Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Singh vs. Metro Corp"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Client Name */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Client Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Ajay Singh"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                                    value={formData.client}
                                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                                />
                            </div>

                            {/* Tentative Amount */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Fee Amount</label>
                                <div className="relative">
                                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Priority */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Priority</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium appearance-none cursor-pointer"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option>Critical</option>
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Deadline</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Tags</label>
                            <input
                                type="text"
                                placeholder="e.g. Corporate, Litigation"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-medium"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs bg-teal-600 text-white hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? "Creating..." : "Create Case"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
