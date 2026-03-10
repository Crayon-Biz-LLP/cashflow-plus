"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    Plus,
    Landmark,
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    ChevronRight,
    Search,
    X,
} from "lucide-react";

interface Account {
    _id: string;
    accountCode: string;
    name: string;
    type: string;
    subType?: string;
    description?: string;
    balance: number;
    isActive: boolean;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string; gradient: string }> = {
    Asset: { icon: Wallet, color: "var(--teal-600)", bg: "var(--teal-50)", gradient: "linear-gradient(135deg, var(--teal-50), var(--teal-100))" },
    Liability: { icon: TrendingDown, color: "#ef4444", bg: "#fef2f2", gradient: "linear-gradient(135deg, #fef2f2, #fee2e2)" },
    Equity: { icon: PiggyBank, color: "#7c3aed", bg: "#f5f3ff", gradient: "linear-gradient(135deg, #f5f3ff, #ede9fe)" },
    Revenue: { icon: TrendingUp, color: "#16a34a", bg: "#f0fdf4", gradient: "linear-gradient(135deg, #f0fdf4, #dcfce7)" },
    Expense: { icon: Landmark, color: "#ea580c", bg: "#fff7ed", gradient: "linear-gradient(135deg, #fff7ed, #fed7aa)" },
};

function formatINR(n: number) {
    if (n === 0) return "₹0";
    const abs = Math.abs(n);
    return (n < 0 ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
}

export default function ChartOfAccountsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("All");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ accountCode: "", name: "", type: "Asset", subType: "", description: "" });

    useEffect(() => {
        loadAccounts();
    }, []);

    async function loadAccounts() {
        try {
            const data = await api.getAccounts();
            setAccounts(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        try {
            await api.createAccount(form);
            setShowModal(false);
            setForm({ accountCode: "", name: "", type: "Asset", subType: "", description: "" });
            loadAccounts();
        } catch (e: any) {
            alert(e.message || "Failed to create account");
        }
    }

    const types = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
    const filtered = accounts
        .filter(a => filterType === "All" || a.type === filterType)
        .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.accountCode.includes(search));

    const groupedByType = types.reduce((acc, type) => {
        acc[type] = filtered.filter(a => a.type === type);
        return acc;
    }, {} as Record<string, Account[]>);

    return (
        <div className="min-h-screen">
            <Topbar title="Chart of Accounts" subtitle="Double-entry accounting ledger structure — inspired by Bigcapital" onMenuToggle={onMenuToggle} />

            <div className="px-4 md:px-8 pb-8">
                {/* Summary Cards */}
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                    {types.map(type => {
                        const cfg = typeConfig[type];
                        const typeAccounts = accounts.filter(a => a.type === type);
                        const total = typeAccounts.reduce((s, a) => s + a.balance, 0);
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={type}
                                className="stat-card cursor-pointer transition-all duration-200 flex-shrink-0 min-w-[160px]"
                                onClick={() => setFilterType(filterType === type ? "All" : type)}
                                style={{
                                    background: filterType === type ? cfg.gradient : "white",
                                    borderColor: filterType === type ? cfg.color : "var(--card-border)",
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 rounded-lg" style={{ background: cfg.bg }}>
                                        <Icon size={16} style={{ color: cfg.color }} />
                                    </div>
                                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{type}</span>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{formatINR(total)}</p>
                                <p className="text-xs" style={{ color: "var(--black-400)" }}>{typeAccounts.length} accounts</p>
                            </div>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-60">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--black-400)" }} />
                            <input
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border"
                                style={{ borderColor: "var(--card-border)", background: "white" }}
                                placeholder="Search accounts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <span className="hidden sm:inline text-xs font-semibold" style={{ color: "var(--black-400)" }}>
                            {filtered.length} found
                        </span>
                    </div>
                    <button className="btn-primary w-full md:w-auto justify-center" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(true)}>
                        <Plus size={14} /> New Account
                    </button>
                </div>

                {/* Grouped Account List */}
                {types.map(type => {
                    const accs = groupedByType[type];
                    if (!accs || accs.length === 0) return null;
                    const cfg = typeConfig[type];
                    const Icon = cfg.icon;
                    const totalBalance = accs.reduce((s, a) => s + a.balance, 0);

                    return (
                        <div key={type} className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg" style={{ background: cfg.bg }}>
                                    <Icon size={16} style={{ color: cfg.color }} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{type} Accounts</h3>
                                    <span className="text-[10px] font-bold text-gray-400">{accs.length} total</span>
                                </div>
                                <div className="flex-1" />
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-black text-gray-400 block mb-0.5">Total Balance</span>
                                    <span className="text-sm font-bold" style={{ color: cfg.color }}>{formatINR(totalBalance)}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr style={{ background: "var(--black-50)" }}>
                                                <th className="text-left text-[10px] uppercase tracking-wider font-black px-5 py-4" style={{ color: "var(--black-400)" }}>Code</th>
                                                <th className="text-left text-[10px] uppercase tracking-wider font-black px-5 py-4" style={{ color: "var(--black-400)" }}>Account</th>
                                                <th className="text-left text-[10px] uppercase tracking-wider font-black px-5 py-4" style={{ color: "var(--black-400)" }}>Type Details</th>
                                                <th className="text-right text-[10px] uppercase tracking-wider font-black px-5 py-4" style={{ color: "var(--black-400)" }}>Balance</th>
                                                <th className="text-center text-[10px] uppercase tracking-wider font-black px-5 py-4" style={{ color: "var(--black-400)" }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accs.map(acc => (
                                                <tr key={acc.accountCode} className="border-t transition-colors hover:bg-gray-50" style={{ borderColor: "var(--black-100)" }}>
                                                    <td className="px-5 py-4">
                                                        <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>{acc.accountCode}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{acc.name}</p>
                                                        {acc.description && (
                                                            <p className="text-[10px]" style={{ color: "var(--black-400)" }}>{acc.description}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-xs font-medium" style={{ color: "var(--black-500)" }}>{acc.subType || "—"}</span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-sm font-bold font-mono" style={{ color: acc.balance >= 0 ? "var(--foreground)" : "var(--danger)" }}>
                                                            {formatINR(acc.balance)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`badge ${acc.isActive ? "badge-teal" : "badge-warning"}`} style={{ fontSize: "0.6rem" }}>
                                                            {acc.isActive ? "Active" : "Incactive"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-[480px]" style={{ border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>New Account</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                                <X size={16} style={{ color: "var(--black-400)" }} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Account Code</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="e.g. 1700"
                                        value={form.accountCode} onChange={e => setForm({ ...form, accountCode: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Type</label>
                                    <select className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Account Name</label>
                                <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="e.g. Security Deposits"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                <p className="text-[10px] text-gray-400 mt-1">Provide a clear name for internal tracking.</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Sub Type</label>
                                <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="e.g. Fixed Asset"
                                    value={form.subType} onChange={e => setForm({ ...form, subType: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Description</label>
                                <textarea
                                    className="w-full px-3 py-2 text-sm rounded-xl border min-h-[80px]"
                                    style={{ borderColor: "var(--card-border)" }}
                                    placeholder="Brief description..."
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={handleCreate}>
                                <Plus size={14} /> Create Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
