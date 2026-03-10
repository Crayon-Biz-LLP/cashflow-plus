"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    X,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

interface CashPosition {
    totalCash: number;
    totalReceivables: number;
    totalPayables: number;
    netPosition: number;
    bankAccounts: { id: string; name: string; type: string; balance: number }[];
    pendingInvoiceCount: number;
    pendingBillCount: number;
}

interface Forecast {
    forecastId: string;
    forecastDate: string;
    type: string;
    category?: string;
    description?: string;
    amount: number;
    probability: number;
    isRecurring: boolean;
    recurringInterval?: string;
    status: string;
}

interface ForecastData {
    currentCash: number;
    totalExpectedInflow: number;
    totalExpectedOutflow: number;
    projectedBalance: number;
    forecasts: Forecast[];
    projection: { date: string; inflow: number; outflow: number; balance: number }[];
}

function formatINR(n: number) {
    const abs = Math.abs(n);
    if (abs >= 100000) return (n < 0 ? "-" : "") + "₹" + (abs / 100000).toFixed(1) + "L";
    return (n < 0 ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
}

function formatINRFull(n: number) {
    const abs = Math.abs(n);
    return (n < 0 ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
}

export default function CashForecastPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [position, setPosition] = useState<CashPosition | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState<"overview" | "forecast" | "projection">("overview");
    const [form, setForm] = useState({
        forecastDate: "", type: "Expected Inflow", category: "", description: "", amount: "",
        probability: "100", isRecurring: false, recurringInterval: "Monthly",
    });

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [pos, fc] = await Promise.all([api.getCashPosition(), api.getCashForecast()]);
            setPosition(pos);
            setForecastData(fc);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleCreate() {
        try {
            await api.createCashForecast({
                forecastDate: form.forecastDate,
                type: form.type,
                category: form.category,
                description: form.description,
                amount: parseFloat(form.amount),
                probability: parseInt(form.probability),
                isRecurring: form.isRecurring,
                recurringInterval: form.isRecurring ? form.recurringInterval : undefined,
            });
            setShowModal(false);
            setForm({ forecastDate: "", type: "Expected Inflow", category: "", description: "", amount: "", probability: "100", isRecurring: false, recurringInterval: "Monthly" });
            loadAll();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    if (loading) {
        return (
            <div className="min-h-screen">
                <Topbar title="Cash Forecasting" subtitle="Cash position, receivables, payables & 90-day projection" onMenuToggle={onMenuToggle} />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Topbar title="Cash Forecasting" subtitle="Cash position, receivables, payables & 90-day projection" onMenuToggle={onMenuToggle} />
            <div className="px-4 md:px-8 pb-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px]" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderColor: "#bbf7d0" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-xl shadow-sm" style={{ background: "white" }}><Wallet size={18} style={{ color: "#16a34a" }} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#16a34a" }}>Bank Balance</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(position?.totalCash || 0)}</p>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase tracking-tighter">{position?.bankAccounts?.length || 0} active accounts</p>
                    </div>
                    <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px]" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderColor: "#bfdbfe" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-xl shadow-sm" style={{ background: "white" }}><ArrowUpRight size={18} style={{ color: "#2563eb" }} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#2563eb" }}>Receivables</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(position?.totalReceivables || 0)}</p>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase tracking-tighter">{position?.pendingInvoiceCount || 0} invoices due</p>
                    </div>
                    <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px]" style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)", borderColor: "#fecaca" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-xl shadow-sm" style={{ background: "white" }}><ArrowDownRight size={18} style={{ color: "#ef4444" }} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ef4444" }}>Payables</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(position?.totalPayables || 0)}</p>
                        <p className="text-[10px] font-bold mt-1 text-gray-500 uppercase tracking-tighter">{position?.pendingBillCount || 0} bills to pay</p>
                    </div>
                    <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px]" style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", borderColor: "#ddd6fe" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2.5 rounded-xl shadow-sm" style={{ background: "white" }}><TrendingUp size={18} style={{ color: "#7c3aed" }} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#7c3aed" }}>Liquid Cash</span>
                        </div>
                        <p className="text-2xl font-black tracking-tight" style={{ color: (position?.netPosition || 0) >= 0 ? "var(--teal-600)" : "#ef4444" }}>
                            {formatINR(position?.netPosition || 0)}
                        </p>
                        <p className="text-[10px] font-bold mt-1 text-gray-400 uppercase tracking-tighter">Adjusted Net Position</p>
                    </div>
                </div>

                {/* Tabs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                        {(["overview", "forecast", "projection"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="flex-shrink-0 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                style={{
                                    background: tab === t ? "white" : "transparent",
                                    color: tab === t ? "var(--teal-600)" : "var(--black-500)",
                                    boxShadow: tab === t ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                                }}
                            >
                                {t === "overview" ? "Accounts" : t === "forecast" ? "Forecast" : "90-Day Vision"}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1" />
                    <button className="btn-primary justify-center py-2.5 px-6 rounded-2xl shadow-lg shadow-teal-500/20" style={{ fontSize: "0.76rem" }} onClick={() => setShowModal(true)}>
                        <Plus size={14} /> NEW FORECAST
                    </button>
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-500">
                    {tab === "overview" && position && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {position.bankAccounts.map(ba => (
                                <div key={ba.id} className="bg-white rounded-[2rem] border p-6 flex items-start gap-4 transition-all hover:shadow-xl" style={{ borderColor: "var(--card-border)" }}>
                                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><Wallet size={20} /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{ba.type}</p>
                                        </div>
                                        <h4 className="text-base font-black text-gray-900 mb-4">{ba.name}</h4>
                                        <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINRFull(ba.balance)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === "forecast" && forecastData && (
                        <div className="bg-white rounded-[2rem] border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr style={{ background: "var(--black-50)" }}>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Timeline</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Category</th>
                                            <th className="text-left text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Description</th>
                                            <th className="text-right text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Projected Amount</th>
                                            <th className="text-center text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Certainty</th>
                                            <th className="text-center text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Cadence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecastData.forecasts.map(f => (
                                            <tr key={f.forecastId} className="border-t hover:bg-gray-50/50" style={{ borderColor: "var(--black-100)" }}>
                                                <td className="px-6 py-5">
                                                    <span className="text-[11px] font-black text-gray-400 uppercase">
                                                        {new Date(f.forecastDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter"
                                                        style={{
                                                            background: f.type.includes("Inflow") ? "var(--teal-50)" : "#fef2f2",
                                                            color: f.type.includes("Inflow") ? "var(--teal-600)" : "#ef4444",
                                                        }}>
                                                        {f.type.includes("Inflow") ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                        {f.category || "General"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-black text-gray-900">{f.description || "—"}</td>
                                                <td className="px-6 py-5 text-right font-black tracking-tight"
                                                    style={{ color: f.type.includes("Inflow") ? "var(--teal-600)" : "#ef4444" }}>
                                                    {formatINRFull(f.amount)}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden p-0.5">
                                                            <div className="h-full rounded-full" style={{ width: `${f.probability}%`, background: f.probability >= 80 ? "var(--teal-500)" : f.probability >= 50 ? "#f59e0b" : "#ef4444" }} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400">{f.probability}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {f.isRecurring ? (
                                                        <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 border border-indigo-100">
                                                            <RefreshCw size={10} /> {f.recurringInterval}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase italic">One-off</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {tab === "projection" && forecastData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="bg-white border rounded-[2rem] p-6" style={{ borderColor: "#bbf7d0" }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">Projected Inflows</p>
                                    <p className="text-3xl font-black text-emerald-600 tracking-tighter">{formatINR(forecastData.totalExpectedInflow)}</p>
                                </div>
                                <div className="bg-white border rounded-[2rem] p-6" style={{ borderColor: "#fecaca" }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">Projected Outflows</p>
                                    <p className="text-3xl font-black text-red-500 tracking-tighter">{formatINR(forecastData.totalExpectedOutflow)}</p>
                                </div>
                                <div className="bg-white border rounded-[2rem] p-6" style={{ borderColor: "#ddd6fe" }}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">90-Day Closing Est.</p>
                                    <p className="text-3xl font-black tracking-tighter" style={{ color: forecastData.projectedBalance >= 0 ? "var(--teal-600)" : "#ef4444" }}>
                                        {formatINR(forecastData.projectedBalance)}
                                    </p>
                                </div>
                            </div>

                            {/* Projection Chart */}
                            <div className="bg-white rounded-[2rem] border p-6 md:p-10" style={{ borderColor: "var(--card-border)" }}>
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Trajectory</h3>
                                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">3-Month Cash Evolution</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Surplus</span></div>
                                        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Deficit</span></div>
                                    </div>
                                </div>
                                <div className="flex items-end gap-1 overflow-x-auto no-scrollbar pb-6" style={{ height: 260 }}>
                                    {forecastData.projection.slice(0, 45).map((p, i) => {
                                        const maxBalance = Math.max(...forecastData.projection.map(pp => Math.abs(pp.balance)), 1);
                                        const height = Math.max(8, (Math.abs(p.balance) / maxBalance) * 220);
                                        return (
                                            <div key={i} className="flex-1 min-w-[12px] md:min-w-[16px] flex flex-col items-center justify-end group transition-all" title={`${p.date}: ${formatINRFull(p.balance)}`}>
                                                <div
                                                    className="w-full rounded-t-sm md:rounded-t-md transition-all group-hover:opacity-100 group-hover:scale-x-110"
                                                    style={{
                                                        height,
                                                        background: p.balance >= 0
                                                            ? `linear-gradient(to top, #059669, #34d399)`
                                                            : `linear-gradient(to top, #dc2626, #f87171)`,
                                                        opacity: 0.6 + (i / 45) * 0.4,
                                                    }}
                                                />
                                                {i % 7 === 0 && (
                                                    <span className="text-[8px] font-black mt-2 block rotate-[-45deg] whitespace-nowrap text-gray-400">
                                                        {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Forecast Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-2xl w-full max-w-[500px] border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Forecast Item</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Strategic Cash Projection</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Target Date</label>
                                    <input type="date" className="w-full px-4 py-3 text-sm rounded-2xl border bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        value={form.forecastDate} onChange={e => setForm({ ...form, forecastDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Cash Direction</label>
                                    <select className="w-full px-4 py-3 text-sm rounded-2xl border bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option>Expected Inflow</option>
                                        <option>Expected Outflow</option>
                                        <option>Recurring Inflow</option>
                                        <option>Recurring Outflow</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Category Tag</label>
                                    <input className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="e.g. OPEX, PAYROLL" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Projected Amount (₹)</label>
                                    <input type="number" className="w-full px-4 py-3 text-sm rounded-2xl border font-black text-teal-600 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Event Description</label>
                                <input className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="Note regarding this cash movement" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                <div className="p-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="recurring" className="w-5 h-5 rounded-lg border-gray-300 text-teal-600 focus:ring-teal-500" checked={form.isRecurring} onChange={e => setForm({ ...form, isRecurring: e.target.checked })} />
                                            <label htmlFor="recurring" className="text-[11px] font-black uppercase tracking-widest text-gray-600">Recurring Pattern</label>
                                        </div>
                                        {form.isRecurring && (
                                            <select className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                                value={form.recurringInterval} onChange={e => setForm({ ...form, recurringInterval: e.target.value })}>
                                                <option>Weekly</option>
                                                <option>Monthly</option>
                                                <option>Quarterly</option>
                                                <option>Yearly</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confidence Level</span>
                                            <span className="text-[10px] font-black text-teal-600">{form.probability}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" className="w-full accent-teal-600 h-1.5 rounded-full bg-gray-200 appearance-none"
                                            value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10 pt-4">
                            <button className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all font-mono" onClick={() => setShowModal(false)}>CANCEL</button>
                            <button className="px-8 py-3 rounded-2xl text-sm font-black text-white bg-teal-600 shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all" onClick={handleCreate}>
                                ADD TO FORECAST
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
