"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown, Scale, Activity, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2 } from "lucide-react";

function fmtINR(n: number) { return "\u20b9" + Math.abs(n).toLocaleString("en-IN"); }

export default function ReportsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [tab, setTab] = useState<"pnl" | "bs" | "cf">("pnl");
    const [pnl, setPnl] = useState<any>(null);
    const [bs, setBs] = useState<any>(null);
    const [cf, setCf] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAll(); }, []);
    async function loadAll() {
        setLoading(true);
        try {
            const [p, b, c] = await Promise.all([api.getProfitLoss(), api.getBalanceSheet(), api.getCashFlowReport()]);
            setPnl(p); setBs(b); setCf(c);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    const tabs = [
        { key: "pnl", label: "Profit & Loss", icon: TrendingUp, color: "var(--teal-600)" },
        { key: "bs", label: "Balance Sheet", icon: Scale, color: "#7c3aed" },
        { key: "cf", label: "Cash Flow", icon: Activity, color: "#2563eb" },
    ] as const;

    return (
        <div className="min-h-screen">
            <Topbar title="Financial Reports" subtitle="Real-time financial statements — inspired by Bigcapital" onMenuToggle={onMenuToggle} />
            <div className="px-4 md:px-8 pb-8">
                {/* Tab Bar */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-50 border border-gray-100 min-w-max">
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                                style={{
                                    background: tab === t.key ? "white" : "transparent",
                                    color: tab === t.key ? t.color : "var(--black-500)",
                                    boxShadow: tab === t.key ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                }}>
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={loadAll} className="p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all ml-1">
                        <RefreshCw size={14} className={loading ? "animate-spin text-teal-600" : "text-gray-400"} />
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                    </div>
                )}

                {/* Profit & Loss */}
                {!loading && tab === "pnl" && pnl && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                { label: "Total Revenue", value: fmtINR(pnl.revenue?.total || 0), icon: TrendingUp, color: "#16a34a", bg: "#f0fdf4", positive: true },
                                { label: "Total Expenses", value: fmtINR(pnl.expenses?.total || 0), icon: TrendingDown, color: "#ef4444", bg: "#fef2f2", positive: false },
                                { label: "Net Income", value: fmtINR(pnl.netIncome || 0), icon: BarChart3, color: (pnl.netIncome || 0) >= 0 ? "var(--teal-600)" : "#ef4444", bg: (pnl.netIncome || 0) >= 0 ? "var(--teal-50)" : "#fef2f2", positive: (pnl.netIncome || 0) >= 0 },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 rounded-lg" style={{ background: s.bg }}><s.icon size={16} style={{ color: s.color }} /></div>
                                        <span className="text-xs font-medium" style={{ color: "var(--black-400)" }}>{s.label}</span>
                                    </div>
                                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.positive ? "" : "-"}{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Section */}
                            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "var(--card-border)" }}>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <ArrowUpRight size={16} style={{ color: "#16a34a" }} />
                                    </div>
                                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Revenue Accounts</h3>
                                </div>
                                <div className="space-y-2">
                                    {(pnl.revenue?.accounts || []).map((a: any) => (
                                        <div key={a.code} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{a.name}</span>
                                                <span className="font-mono text-[10px]" style={{ color: "var(--black-400)" }}>{a.code}</span>
                                            </div>
                                            <span className="text-sm font-bold" style={{ color: "#16a34a" }}>{fmtINR(a.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-green-50/50 border border-green-100/50">
                                        <span className="text-xs font-bold text-green-700">From Paid Invoices</span>
                                        <span className="text-sm font-bold text-green-700">{fmtINR(pnl.revenue?.fromInvoices || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Expenses Section */}
                            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "var(--card-border)" }}>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 rounded-lg bg-red-50">
                                        <ArrowDownRight size={16} style={{ color: "#ef4444" }} />
                                    </div>
                                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Expense Accounts</h3>
                                </div>
                                <div className="space-y-2">
                                    {(pnl.expenses?.accounts || []).map((a: any) => (
                                        <div key={a.code} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{a.name}</span>
                                                <span className="font-mono text-[10px]" style={{ color: "var(--black-400)" }}>{a.code}</span>
                                            </div>
                                            <span className="text-sm font-bold text-red-600">{fmtINR(a.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-red-50/50 border border-red-100/50">
                                        <span className="text-xs font-bold text-red-700">From Approved Expenses</span>
                                        <span className="text-sm font-bold text-red-700">{fmtINR(pnl.expenses?.fromExpenses || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Net Income Bar */}
                        <div className="p-6 md:p-8 rounded-[2rem]" style={{ background: (pnl.netIncome || 0) >= 0 ? "linear-gradient(135deg, var(--teal-50), var(--teal-100))" : "linear-gradient(135deg, #fef2f2, #fee2e2)", border: `1px solid ${(pnl.netIncome || 0) >= 0 ? "var(--teal-200)" : "#fecaca"}` }}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: (pnl.netIncome || 0) >= 0 ? "var(--teal-600)" : "var(--danger)" }}>Net Profit/Loss</p>
                                    <p className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: (pnl.netIncome || 0) >= 0 ? "var(--teal-900)" : "#ef4444" }}>
                                        {(pnl.netIncome || 0) >= 0 ? "+" : "-"}{fmtINR(pnl.netIncome || 0)}
                                    </p>
                                </div>
                                <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 w-fit">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Reporting Period</p>
                                    <p className="text-xs font-black text-gray-900">{pnl.period}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance Sheet */}
                {!loading && tab === "bs" && bs && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                { label: "Total Assets", value: fmtINR(bs.assets?.total || 0), color: "var(--teal-600)", bg: "var(--teal-50)" },
                                { label: "Total Liabilities", value: fmtINR(bs.liabilities?.total || 0), color: "#ef4444", bg: "#fef2f2" },
                                { label: "Total Equity", value: fmtINR(bs.equity?.total || 0), color: "#7c3aed", bg: "#f5f3ff" },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg" style={{ background: s.bg }}><Scale size={16} style={{ color: s.color }} /></div><span className="text-xs font-medium" style={{ color: "var(--black-400)" }}>{s.label}</span></div>
                                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {[{ title: "Assets", data: bs.assets, color: "var(--teal-600)" }, { title: "Liabilities", data: bs.liabilities, color: "#ef4444" }, { title: "Equity", data: bs.equity, color: "#7c3aed" }].map(section => (
                            <div key={section.title} className="bg-white rounded-2xl border p-4 md:p-6" style={{ borderColor: "var(--card-border)" }}>
                                <h3 className="text-sm font-bold mb-6" style={{ color: section.color }}>{section.title} Accounts</h3>
                                <div className="space-y-2">
                                    {(section.data?.accounts || []).map((a: any) => (
                                        <div key={a.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-gray-50 gap-1 sm:gap-4 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[10px] w-12" style={{ color: section.color }}>{a.code}</span>
                                                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{a.name}</span>
                                                {a.subType && <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">{a.subType}</span>}
                                            </div>
                                            <span className="text-sm font-mono font-bold ml-15 sm:ml-0" style={{ color: "var(--foreground)" }}>{fmtINR(a.balance)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-4 pt-4 border-t border-dashed" style={{ borderColor: "var(--black-100)" }}>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Total {section.title}</span>
                                        <span className="text-lg font-black" style={{ color: section.color }}>{fmtINR(section.data?.total || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-6 rounded-2xl flex flex-col items-center gap-3" style={{ background: bs.isBalanced ? "var(--teal-50)" : "#fef2f2", border: `1px solid ${bs.isBalanced ? "var(--teal-200)" : "#fecaca"}` }}>
                            <div className={`p-2 rounded-full ${bs.isBalanced ? 'bg-teal-500' : 'bg-red-500'} text-white`}>
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-sm font-bold text-center" style={{ color: bs.isBalanced ? "var(--teal-700)" : "#ef4444" }}>
                                {bs.isBalanced ? "Balance Sheet is Healthy" : "Discrepancy Detected"}
                            </p>
                            <p className="text-xs font-medium text-center opacity-60">
                                {bs.isBalanced ? "All assets are correctly accounted for across liabilities and equity." : "There is an imbalance in your accounts. Please check recent journal entries."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Cash Flow */}
                {!loading && tab === "cf" && cf && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                { label: "Cash Inflows", value: fmtINR(cf.operating?.inflows || 0), color: "#16a34a", bg: "#f0fdf4" },
                                { label: "Cash Outflows", value: fmtINR(cf.operating?.outflows || 0), color: "#ef4444", bg: "#fef2f2" },
                                { label: "Net Movement", value: fmtINR(cf.operating?.net || 0), color: (cf.operating?.net || 0) >= 0 ? "var(--teal-600)" : "#ef4444", bg: (cf.operating?.net || 0) >= 0 ? "var(--teal-50)" : "#fef2f2" },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg" style={{ background: s.bg }}><Activity size={16} style={{ color: s.color }} /></div><span className="text-xs font-medium" style={{ color: "var(--black-400)" }}>{s.label}</span></div>
                                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* By Category */}
                        <div className="bg-white rounded-2xl border p-4 md:p-6" style={{ borderColor: "var(--card-border)" }}>
                            <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Performance by Category</h3>
                            <div className="space-y-3">
                                {(cf.byCategory || []).map((c: any) => (
                                    <div key={c.category} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                                            <span className="text-xs font-black text-gray-900">{c.category}</span>
                                            <div className="flex items-center justify-between sm:justify-end gap-6">
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[9px] text-gray-400 uppercase font-black">In</span>
                                                    <span className="text-xs text-green-600 font-bold">+{fmtINR(c.income)}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[9px] text-gray-400 uppercase font-black">Out</span>
                                                    <span className="text-xs text-red-500 font-bold">-{fmtINR(c.expense)}</span>
                                                </div>
                                                <div className="flex flex-col text-right min-w-[80px]">
                                                    <span className="text-[9px] text-gray-400 uppercase font-black">Net</span>
                                                    <span className={`text-xs font-black ${c.net >= 0 ? "text-teal-600" : "text-rose-500"}`}>
                                                        {c.net >= 0 ? "+" : "-"}{fmtINR(c.net)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly */}
                        {(cf.monthly || []).length > 0 && (
                            <div className="bg-white rounded-2xl border p-4 md:p-6" style={{ borderColor: "var(--card-border)" }}>
                                <h3 className="text-sm font-bold mb-6" style={{ color: "var(--foreground)" }}>Monthly Flow Log</h3>
                                <div className="space-y-2">
                                    {cf.monthly.map((m: any) => (
                                        <div key={m.month} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 gap-3">
                                            <span className="text-xs font-bold text-gray-900">{m.month}</span>
                                            <div className="flex items-center justify-between sm:justify-end gap-8 font-mono">
                                                <span className="text-[11px] font-bold text-green-600">+{fmtINR(m.income)}</span>
                                                <span className="text-[11px] font-bold text-red-500">-{fmtINR(m.expense)}</span>
                                                <span className={`text-[11px] font-black ${m.net >= 0 ? "text-teal-700" : "text-rose-600"}`}>
                                                    {m.net >= 0 ? "+" : "-"}{fmtINR(m.net)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
