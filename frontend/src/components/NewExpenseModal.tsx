"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Receipt, Calendar, IndianRupee, Briefcase, FileText, Plus, Landmark, Tag, Target, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessToast } from "./GlobalToast";

interface NewExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewExpenseModal({ isOpen, onClose, onSuccess }: NewExpenseModalProps) {
    const [loading, setLoading] = useState(false);
    const [cases, setCases] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        caseId: "",
        category: "Miscellaneous",
        amount: "",
        description: "",
        bankAccountId: "",
    });

    useEffect(() => {
        if (isOpen) {
            api.getCases().then(setCases).catch(console.error);
            api.getBankAccounts().then(setBankAccounts).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createExpense({
                ...formData,
                amount: Number(formData.amount),
            });
            showSuccessToast(`${formData.category} expense of ₹${Number(formData.amount).toLocaleString()} logged.`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to create expense:", error);
            alert(error.message || "Failed to create expense");
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
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                            <Receipt size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Log New Expense</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Record outgoings for case disbursements</p>
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
                        {/* Case Link */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Select Case</label>
                            <select
                                required
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer"
                                value={formData.caseId}
                                onChange={e => setFormData({ ...formData, caseId: e.target.value })}
                            >
                                <option value="">Choose associated case...</option>
                                {cases.map(c => (
                                    <option key={c.caseId} value={c.caseId}>{c.caseId} — {c.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Source Account */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Payment Account</label>
                            <select
                                required
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer"
                                value={formData.bankAccountId}
                                onChange={e => setFormData({ ...formData, bankAccountId: e.target.value })}
                            >
                                <option value="">Select source account...</option>
                                {bankAccounts.map(b => (
                                    <option key={b.bankAccountId} value={b.bankAccountId}>
                                        {b.bankName} (••{b.accountNumber.slice(-4)}) — ₹{b.currentBalance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Category</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Court Filing</option>
                                    <option>Travel</option>
                                    <option>Staff Cost</option>
                                    <option>Documentation</option>
                                    <option>Expert Witness</option>
                                    <option>Miscellaneous</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Amount</label>
                                <div className="relative">
                                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Description</label>
                            <textarea
                                placeholder="Details about this disbursement..."
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all h-20 resize-none font-medium"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                            disabled={loading || !formData.caseId}
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {loading ? "Recording..." : "Log Expense"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
