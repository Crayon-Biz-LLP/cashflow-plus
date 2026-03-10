"use client";

import React, { useState } from "react";
import { X, TrendingUp, TrendingDown, Calendar, CreditCard, Landmark, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface NewCashForecastModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewCashForecastModal({ isOpen, onClose, onSuccess }: NewCashForecastModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        forecastDate: new Date().toISOString().split('T')[0],
        type: "Expected Inflow",
        category: "Client Payment",
        description: "",
        amount: "",
        probability: "100",
        isRecurring: false,
        recurringInterval: "Monthly"
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createCashForecast({
                ...formData,
                amount: parseFloat(formData.amount),
                probability: parseFloat(formData.probability)
            });
            onSuccess();
        } catch (error) {
            console.error("Failed to create forecast:", error);
            alert("Failed to create forecast. Please check all fields.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Project Future Cash</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cash Forecasting Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-50 rounded-2xl transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Forecast Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option>Expected Inflow</option>
                                <option>Expected Outflow</option>
                                <option>Recurring Inflow</option>
                                <option>Recurring Outflow</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Expected Date</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={formData.forecastDate}
                                    onChange={(e) => setFormData({ ...formData, forecastDate: e.target.value })}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount (Excl. Tax)</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Probability (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.probability}
                                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                            <input
                                type="text"
                                placeholder="e.g. Subscription, Rent"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Notes / Reasoning</label>
                        <textarea
                            rows={3}
                            placeholder="Why is this inflow/outflow expected?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                        <AlertCircle size={16} className="text-amber-500" />
                        <p className="text-[10px] font-bold text-amber-700 leading-tight">
                            Forecasting impacts your 4-month liquidity map on the dashboard. Use high probability (90%+) for fixed commitments.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-[1.5rem] bg-teal-600 text-white font-black text-sm hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                        {loading ? "SAVING PROJECTION..." : "ADD TO FORECAST"}
                    </button>

                    <p className="text-[9px] font-black text-center text-gray-400 uppercase tracking-[0.3em]">Dynamic Prediction Engine</p>
                </form>
            </div>
        </div>
    );
}
