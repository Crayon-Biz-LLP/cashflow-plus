"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";
import BillPreviewModal from "@/components/BillPreviewModal";
import SettlePaymentModal from "@/components/SettlePaymentModal";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Briefcase,
    Users,
    Receipt,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    FileText,
    BarChart3,
    Activity,
    Target,
    Zap,
    CheckCircle2,
    Calendar,
    Landmark,
    Plus,
    Eye,
    Wallet,
} from "lucide-react";

const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case "Receipt": return Receipt;
        case "FileText": return FileText;
        case "Briefcase": return Briefcase;
        case "Zap": return Zap;
        case "CheckCircle2": return CheckCircle2;
        default: return Activity;
    }
};

const pipelineStages = [
    { label: "New", color: "var(--info)" },
    { label: "Assigned", color: "var(--black-500)" },
    { label: "In Progress", color: "var(--teal-600)" },
    { label: "Review", color: "var(--warning)" },
    { label: "Closed", color: "var(--success)" },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [greeting, setGreeting] = useState("Good morning");
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPreviewInvOpen, setIsPreviewInvOpen] = useState(false);
    const [isPreviewBillOpen, setIsPreviewBillOpen] = useState(false);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [settleType, setSettleType] = useState<"Income" | "Expense">("Income");

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await api.getDashboardStats();
            setStats(data);

            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) setGreeting("Good morning");
            else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
            else if (hour >= 17 && hour < 21) setGreeting("Good evening");
            else setGreeting("Good night");

        } catch (err) {
            console.error("Failed to load dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSettle = async (bankAccountId: string) => {
        if (!selectedItem) return;

        try {
            if (settleType === "Income") {
                await api.updateInvoiceStatus(selectedItem.id, "Paid", bankAccountId);
            } else {
                await api.updateBillStatus(selectedItem.id, "Paid", bankAccountId);
            }
            await fetchStats();
            setIsSettleModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error("Settlement failed", error);
            alert("Settlement failed. Please try again.");
        }
    };

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amt);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Topbar
                title="Dashboard"
                subtitle="Overview of your firm's financial health and operations."
            />

            <div className="px-4 md:px-8 pb-12">
                {/* Greeting & Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 mb-1">
                            {greeting}, {user?.name?.split(" ")[0] || "User"}
                        </h1>
                        <p className="text-xs md:text-sm font-medium text-gray-500">
                            Here's what's happening with <span className="text-teal-600 font-bold">{stats?.firmName || "Solv Prod"}</span> today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-[11px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2">
                            <Plus size={14} /> New Invoice
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold hover:bg-black shadow-md flex items-center gap-2">
                            <Zap size={14} className="text-teal-400" /> Quick Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Primary Column */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* Highlights Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link href="/accounts" className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 block group">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 group-hover:text-teal-600 transition-colors">Primary Liquidity</span>
                                <p className="text-xl font-bold text-slate-900">{formatCurrency(stats?.currentBalance || 0)}</p>
                            </Link>
                            <Link href="/invoices" className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 block group">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 group-hover:text-blue-600 transition-colors">Receivables (In)</span>
                                <p className="text-xl font-bold text-blue-600">{formatCurrency(stats?.pendingInvoices || 0)}</p>
                            </Link>
                            <Link href="/bills" className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 block group">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 group-hover:text-rose-600 transition-colors">Payables (Out)</span>
                                <p className="text-xl font-bold text-rose-600">{formatCurrency(stats?.pendingBills || 0)}</p>
                            </Link>
                        </div>

                        {/* Forecasting Map */}
                        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingUp size={100} className="text-teal-400" />
                            </div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-6 flex items-center gap-2 text-slate-400">
                                <Activity size={14} className="text-teal-400" />
                                Liquidity Mapping (4-Month Projection)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(stats?.forecast || []).map((f: any, i: number) => (
                                    <div key={i} className={`p-4 rounded-xl bg-white/5 border border-white/10 transition-all ${i === 0 ? 'bg-teal-500/10 border-teal-500/20' : ''}`}>
                                        <p className="text-[10px] font-semibold text-teal-400 uppercase mb-3 tracking-wider">{f.month}</p>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] font-medium">
                                                <span className="text-white/40">INFLOW</span>
                                                <span className="text-teal-400">+{formatCurrency(f.inflow)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] font-medium">
                                                <span className="text-white/40">OUTFLOW</span>
                                                <span className="text-rose-400">-{formatCurrency(f.outflow)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-white/10 text-center">
                                            <p className="text-[13px] font-bold">{formatCurrency(f.projectedBalance)}</p>
                                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">EST. BALANCE</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pipeline Section */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase size={18} className="text-teal-600" />
                                    Matter Pipeline
                                </h3>
                                <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 uppercase tracking-wider">Historical Records</button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {pipelineStages.map((stage) => (
                                    <div key={stage.label} className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{stage.label}</span>
                                            <span className="text-xs font-bold text-slate-900">{stats?.pipeline?.[stage.label] || 0}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${(stats?.totalCases > 0) ? ((stats?.pipeline?.[stage.label] || 0) / stats.totalCases) * 100 : 0}%`,
                                                    background: stage.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-50">
                                {(stats?.recentCases || []).slice(0, 3).map((c: any) => (
                                    <div key={c.id} className="flex items-center p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group">
                                        <div className={`w-11 h-11 rounded-xl ${c.avatarClass} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                                            {c.assignee}
                                        </div>
                                        <div className="ml-5 flex-1">
                                            <p className="text-sm font-bold text-gray-900">{c.title}</p>
                                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{c.id} • {c.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900 font-mono mb-1">{c.amount}</p>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${c.stageColor}`}>{c.stage}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Receivables & Payables Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-premium">
                                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <ArrowUpRight size={16} /> Receivables schedule
                                </h4>
                                <div className="space-y-3">
                                    {(stats?.recentInvoices || []).length > 0 ? (
                                        stats.recentInvoices.map((inv: any) => (
                                            <div key={inv.id} className="p-4 rounded-2xl bg-blue-50/20 border border-blue-100/30 flex items-center justify-between group hover:bg-blue-50/40 transition-all">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-900">{inv.client}</p>
                                                    <p className="text-[10px] font-medium text-blue-500 uppercase">DUE {inv.dueDate}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-xs font-black text-gray-900 font-mono">{formatCurrency(inv.total)}</p>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { setSelectedItem(inv); setIsPreviewInvOpen(true); }} className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white transition-all">
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedItem(inv); setSettleType("Income"); setIsSettleModalOpen(true); }}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-white transition-all shadow-sm"
                                                            title="Settle Receipt"
                                                        >
                                                            <Wallet size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No pending receivables</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-premium">
                                <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <ArrowDownLeft size={16} /> Payables schedule
                                </h4>
                                <div className="space-y-3">
                                    {(stats?.recentBills || []).length > 0 ? (
                                        stats.recentBills.map((bill: any) => (
                                            <div key={bill.id} className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100/30 flex items-center justify-between group hover:bg-rose-50/40 transition-all">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-900">{bill.vendor}</p>
                                                    <p className="text-[10px] font-medium text-rose-500 uppercase">DUE {bill.dueDate}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-xs font-black text-gray-900 font-mono">{formatCurrency(bill.total)}</p>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { setSelectedItem(bill); setIsPreviewBillOpen(true); }} className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white transition-all">
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedItem(bill); setSettleType("Expense"); setIsSettleModalOpen(true); }}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
                                                            title="Settle Bill"
                                                        >
                                                            <Wallet size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No pending payables</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Column */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Priorities/Alerts */}
                        <div className="p-6 rounded-[2rem] bg-gray-900 text-white shadow-premium relative overflow-hidden">
                            <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
                                <Activity size={16} className="text-teal-400" />
                                Priorities
                            </h3>
                            <div className="space-y-4">
                                {(stats?.alerts || []).map((a: any, i: number) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-widest ${a.type === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {a.risk}
                                            </span>
                                            <span className="text-[10px] text-white/40">{a.time}</span>
                                        </div>
                                        <p className="text-xs font-bold mb-1">{a.title}</p>
                                        <p className="text-[11px] text-white/60 leading-relaxed">{a.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Log */}
                        <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-premium">
                            <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                Action Log
                            </h3>
                            <div className="space-y-6">
                                {(stats?.activity || []).map((item: any, i: number) => {
                                    const IconComp = getIconComponent(item.icon);
                                    return (
                                        <div key={i} className="relative pl-6 before:absolute before:left-1.5 before:top-2 before:bottom-[-24px] before:w-[1px] before:bg-gray-100 last:before:hidden">
                                            <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: item.color }} />
                                            <div className="space-y-0.5 text-[11px]">
                                                <p className="font-bold text-gray-900">{item.action}</p>
                                                <p className="text-gray-500 leading-normal">{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Expense Mix */}
                        <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-premium">
                            <h3 className="text-sm font-bold text-gray-900 mb-5">Expense Mix</h3>
                            <div className="space-y-5">
                                {(stats?.expenseCategories || []).slice(0, 3).map((cat: any) => (
                                    <div key={cat.label} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-gray-600">{cat.label}</span>
                                            <span className="text-[11px] font-black text-gray-900">{formatCurrency(cat.amount)}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${cat.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Mini Row */}
                <div className="mt-8 flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {['JD', 'MS', 'AK', 'RL'].map((u, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-[10px] font-black shadow-sm">{u}</div>
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{stats?.teamCount || 0} team members active</p>
                            <p className="text-xs font-medium text-gray-500">Updates live from firm management</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-teal-600 hover:underline">Full Analytics →</button>
                </div>
            </div>

            {/* Modals */}
            <InvoicePreviewModal
                isOpen={isPreviewInvOpen}
                onClose={() => setIsPreviewInvOpen(false)}
                invoice={selectedItem ? {
                    ...selectedItem,
                    invoiceId: selectedItem.id,
                    amount: selectedItem.total / 1.18,
                    gst: (selectedItem.total / 1.18) * 0.18,
                    date: new Date()
                } : null}
            />

            <BillPreviewModal
                isOpen={isPreviewBillOpen}
                onClose={() => setIsPreviewBillOpen(false)}
                bill={selectedItem ? {
                    ...selectedItem,
                    billId: selectedItem.id,
                    vendorName: selectedItem.vendor,
                    amount: selectedItem.total / 1.18,
                    gst: (selectedItem.total / 1.18) * 0.18,
                    date: new Date()
                } : null}
            />

            <SettlePaymentModal
                isOpen={isSettleModalOpen}
                onClose={() => { setIsSettleModalOpen(false); setSelectedItem(null); }}
                onConfirm={handleSettle}
                items={selectedItem ? [selectedItem] : []}
                type={settleType}
                title={settleType === "Income" ? "Capture Client Payment" : "Settle Vendor Bill"}
                description={settleType === "Income" ? "Receive funds against this invoice" : "Approve and pay this vendor bill"}
            />
        </div>
    );
}
