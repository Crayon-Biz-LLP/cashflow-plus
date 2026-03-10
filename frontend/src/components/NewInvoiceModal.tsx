"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, FileText, Calendar, IndianRupee, DollarSign, Briefcase, Plus, CheckCircle2, Share2, Download, ExternalLink, Zap, Receipt, ShieldCheck, Target, Percent } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessToast } from "./GlobalToast";

interface NewInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewInvoiceModal({ isOpen, onClose, onSuccess }: NewInvoiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [cases, setCases] = useState<any[]>([]);
    const [taxProfiles, setTaxProfiles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        caseId: "",
        client: "",
        title: "",
        amount: "",
        dueDate: "",
        includeGst: true,
        taxProfileId: "",
    });
    const [createdInvoice, setCreatedInvoice] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            api.getCases().then(setCases).catch(console.error);
            api.getTaxProfiles().then(setTaxProfiles).catch(console.error);
        }
    }, [isOpen]);

    const selectedTaxProfile = taxProfiles.find(p => p.profileId === formData.taxProfileId) || taxProfiles.find(p => p.isDefault);
    const taxRate = formData.includeGst ? (selectedTaxProfile?.rate || 18) : 0;
    const isUSA = selectedTaxProfile?.taxType === "Sales Tax";
    const CurrencyIcon = isUSA ? DollarSign : IndianRupee;
    const currencySymbol = isUSA ? "$" : "₹";

    useEffect(() => {
        if (formData.caseId) {
            const selectedCase = cases.find(c => c.caseId === formData.caseId);
            if (selectedCase) {
                setFormData(prev => ({ ...prev, client: selectedCase.client }));
            }
        }
    }, [formData.caseId, cases]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.createInvoice({
                ...formData,
                amount: Number(formData.amount),
            });
            showSuccessToast(`Invoice #${data.invoiceId} successfully created for ${data.client}`);
            setCreatedInvoice(data);
            onSuccess();
        } catch (error: any) {
            console.error("Failed to create invoice:", error);
            alert(error.message || "Failed to create invoice");
        } finally {
            setLoading(false);
        }
    };

    const generateWALink = () => {
        if (!createdInvoice) return "#";
        const message = `Hello ${createdInvoice.client}! 👋\n\nYour invoice ${createdInvoice.invoiceId} from SolvProd is ready.\n\n💰 Amount Due: ${currencySymbol}${createdInvoice.total.toLocaleString()}\n📅 Due Date: ${new Date(createdInvoice.dueDate).toLocaleDateString()}\n\n🔗 View Invoice: https://cashflow.yazir.studio/view/inv/${createdInvoice.invoiceId}\n\nThank you for your business!`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
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

            <AnimatePresence mode="wait">
                {!createdInvoice ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Generate Invoice</h3>
                                    <p className="text-[10px] text-slate-500 font-medium">Create a professional billing statement</p>
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
                                {/* Associate Case */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Select Matter</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                                        value={formData.caseId}
                                        onChange={e => setFormData({ ...formData, caseId: e.target.value })}
                                    >
                                        <option value="">Choose associated case...</option>
                                        {cases.map(c => (
                                            <option key={c.caseId} value={c.caseId}>{c.caseId} — {c.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Billing Head */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Billing Heading</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Legal Fees - Mar 2024"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Amount */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Base Amount</label>
                                        <div className="relative">
                                            <CurrencyIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                placeholder="0"
                                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                                value={formData.amount}
                                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 ml-0.5 uppercase tracking-wider">Due Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Tax Selector */}
                                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-blue-600" />
                                            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-tight">Tax / GST Calculation</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, includeGst: !formData.includeGst })}
                                            className={`w-10 h-5 rounded-full transition-all relative ${formData.includeGst ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <motion.div
                                                animate={{ x: formData.includeGst ? 22 : 2 }}
                                                className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>

                                    {formData.includeGst && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                            <div className="relative">
                                                <Percent size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <select
                                                    className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                    value={formData.taxProfileId}
                                                    onChange={e => setFormData({ ...formData, taxProfileId: e.target.value })}
                                                >
                                                    <option value="">Default (GST 18%)</option>
                                                    {taxProfiles.map(p => (
                                                        <option key={p.profileId} value={p.profileId}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Simplified Summary */}
                                <div className="p-5 rounded-xl bg-slate-900 shadow-lg">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            <span>Subtotal</span>
                                            <span className="font-mono text-slate-200">{currencySymbol}{Number(formData.amount || 0).toLocaleString()}</span>
                                        </div>
                                        {formData.includeGst && (
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <span>{selectedTaxProfile?.taxType || 'Tax'} ({taxRate}%)</span>
                                                <span className="font-mono text-blue-400">+{currencySymbol}{Math.round(Number(formData.amount || 0) * (taxRate / 100)).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Total Amount</span>
                                            <span className="text-lg font-bold text-blue-400 font-mono">
                                                {currencySymbol}{Math.round(Number(formData.amount || 0) * (1 + (taxRate / 100))).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all">
                                    Cancel
                                </button>
                                <button
                                    disabled={loading || !formData.caseId}
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {loading ? "Generating..." : "Post Invoice"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
                    >
                        <div className="p-8 text-center bg-teal-50/50">
                            <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Invoice Generated</h3>
                            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-widest mt-1">Status: Success</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                                    <span>ID</span>
                                    <span className="text-slate-900 font-bold">#{createdInvoice.invoiceId}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                                    <span>Client</span>
                                    <span className="text-slate-900 font-bold">{createdInvoice.client}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200/50">
                                    <span className="text-slate-900 uppercase tracking-wider">Total</span>
                                    <span className="text-teal-600 font-mono">{currencySymbol}{createdInvoice.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <a
                                    href={generateWALink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs"
                                >
                                    <Share2 size={16} />
                                    WhatsApp
                                </a>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-[11px]">
                                        <Download size={14} />
                                        PDF
                                    </button>
                                    <button onClick={onClose} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
