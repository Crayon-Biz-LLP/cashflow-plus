"use client";

import React, { useState } from "react";
import { X, Building2, Landmark, Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface NewBankAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewBankAccountModal({ isOpen, onClose, onSuccess }: NewBankAccountModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "Current",
        openingBalance: "",
        currency: "INR",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createBankAccount({
                ...formData,
                openingBalance: parseFloat(formData.openingBalance || "0"),
            });
            onSuccess();
            onClose();
            setFormData({
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                accountType: "Current",
                openingBalance: "",
                currency: "INR",
            });
        } catch (error: any) {
            console.error("Failed to create bank account:", error);
            alert(error.message || "Failed to create bank account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-black-50 flex items-center justify-between bg-black-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-600 text-white rounded-xl">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Add Bank Account</h3>
                            <p className="text-xs text-black-400">Add a new bank account to track balance</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-black-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Bank Name</label>
                            <div className="relative">
                                <Landmark size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300" />
                                <input
                                    required
                                    type="text"
                                    className="input-field w-full pl-11"
                                    placeholder="e.g. HDFC Bank"
                                    value={formData.bankName}
                                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Account Type</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.accountType}
                                    onChange={e => setFormData({ ...formData, accountType: e.target.value })}
                                >
                                    <option value="Current">Current</option>
                                    <option value="Savings">Savings</option>
                                    <option value="Petty Cash">Petty Cash</option>
                                    <option value="Cash-in-Hand">Cash-in-Hand</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Currency</label>
                                <select
                                    disabled
                                    className="input-field w-full"
                                    value={formData.currency}
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Account Number</label>
                            <input
                                required
                                type="text"
                                className="input-field w-full"
                                placeholder="Enter account number"
                                value={formData.accountNumber}
                                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">IFSC Code</label>
                                <input
                                    type="text"
                                    className="input-field w-full"
                                    placeholder="Optional"
                                    value={formData.ifscCode}
                                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Current Balance</label>
                                <input
                                    required
                                    type="number"
                                    className="input-field w-full font-bold text-teal-600"
                                    placeholder="0.00"
                                    value={formData.openingBalance}
                                    onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-sm bg-black-50 text-black-600 hover:bg-black-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] px-6 py-3.5 rounded-2xl font-bold text-sm bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            {loading ? "Adding..." : "Add Bank Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
