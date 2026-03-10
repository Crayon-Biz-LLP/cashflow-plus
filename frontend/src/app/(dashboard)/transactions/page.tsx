"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Topbar from "@/components/Topbar";
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Receipt,
    Filter,
    Download,
    TrendingUp,
    CheckCircle2,
    Clock,
    DollarSign,
    MoreHorizontal
} from "lucide-react";

import NewExpenseModal from "@/components/NewExpenseModal";
import NewInvoiceModal from "@/components/NewInvoiceModal";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [txData, stats] = await Promise.all([
                api.getTransactions(),
                api.getDashboardStats()
            ]);
            setTransactions(txData);
            setBalance(stats.currentBalance);
        } catch (error) {
            console.error("Failed to load transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen">
            <Topbar
                title="Transactions & Books"
                subtitle="Manage your firm's general ledger and financial health."
            />

            <div className="px-4 md:px-8 pb-8">
                {/* Balance & Quick Actions Header */}
                <div className="grid grid-cols-12 gap-6 mb-8 mt-4">
                    <div className="col-span-12 lg:col-span-8 p-6 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group shadow-2xl shadow-teal-900/10"
                        style={{ background: "linear-gradient(135deg, #0d9488, #0f766e, #115e59)" }}>

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-1000 group-hover:scale-125" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full -ml-10 -mb-10 blur-2xl transition-transform duration-1000 group-hover:scale-110" />

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-100/70">Master Liquidity Index</p>
                            </div>
                            <div className="flex items-baseline gap-2 mb-1">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                                    {formatCurrency(balance)}
                                </h2>
                                <span className="text-teal-200/50 text-sm font-bold tracking-tight">INR</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-8">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                                    <div className="w-6 h-6 rounded-lg bg-teal-400/20 flex items-center justify-center">
                                        <TrendingUp size={14} className="text-teal-300" />
                                    </div>
                                    <span className="text-xs font-black text-white">+12.4%</span>
                                    <span className="text-[9px] font-bold text-teal-100/50 uppercase tracking-widest">Growth</span>
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                    <span className="text-[10px] font-bold text-teal-50 uppercase tracking-[0.1em]">Ledger Synced</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 min-w-fit">
                            <button
                                onClick={() => setIsInvoiceModalOpen(true)}
                                className="group/btn relative px-6 py-4 rounded-[1.25rem] bg-white overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:translate-y-[-2px] active:translate-y-[1px]"
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 transition-transform group-hover/btn:scale-110">
                                        <Plus size={18} strokeWidth={3} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest leading-none mb-1">Incoming</p>
                                        <p className="text-sm font-black text-teal-900 leading-none">Record Income</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setIsExpenseModalOpen(true)}
                                className="group/btn relative px-6 py-4 rounded-[1.25rem] bg-teal-400/20 backdrop-blur-md border border-white/20 overflow-hidden transition-all duration-300 hover:bg-teal-400/30 hover:translate-y-[-2px] active:translate-y-[1px]"
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-lg transition-transform group-hover/btn:scale-110">
                                        <Receipt size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-teal-100 uppercase tracking-widest leading-none mb-1">Outgoing</p>
                                        <p className="text-sm font-black text-white leading-none">Log Expense</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 p-8 rounded-[2.5rem] bg-white border border-teal-50 flex flex-col items-center justify-center relative overflow-hidden group shadow-xl shadow-teal-500/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />

                        <div className="relative z-10 text-center w-full">
                            <div className="w-20 h-20 bg-teal-500/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                                <Download size={32} className="text-teal-600" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Export Protocol</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Synchronize Books Externally</p>

                            <div className="grid grid-cols-3 gap-3 w-full">
                                {['CSV', 'EXCEL', 'PDF'].map((fmt) => (
                                    <button key={fmt} className="group/fmt relative py-3 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden transition-all hover:bg-teal-600 hover:border-teal-600">
                                        <span className="relative z-10 text-[10px] font-black text-gray-500 group-hover/fmt:text-white tracking-[0.15em] transition-colors">{fmt}</span>
                                        <div className="absolute inset-0 bg-teal-600 translate-y-full group-hover/fmt:translate-y-0 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ledger Table Section */}
                <div className="mt-4 rounded-[2.5rem] bg-white border border-teal-50 shadow-xl shadow-teal-500/5 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20">
                                <FileText size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">General Ledger</h3>
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Digital Audit Trail • 2026 FY</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95">
                                <Filter size={14} strokeWidth={3} /> Filter Registry
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full min-w-[1100px]">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Payee/Entity</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Ref Code</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Amount (INR)</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="py-32 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                                <p className="text-xs font-black uppercase tracking-widest">Decrypting Books...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-32 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                    <Clock size={32} />
                                                </div>
                                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mt-2">No Transactions Detected</p>
                                                <p className="text-xs font-bold text-gray-300 max-w-[200px] leading-relaxed italic border-t border-gray-100 pt-3">The general ledger is currently empty for this period.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.map((tx) => (
                                    <tr key={tx._id} className="group hover:bg-teal-50/20 transition-all duration-300">
                                        <td className="px-8 py-6 font-mono text-[11px] font-black text-gray-400 group-hover:text-teal-600">
                                            #{tx.transactionId}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-gray-900 italic">
                                            {new Date(tx.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            {tx.type === "Income" ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <ArrowUpRight size={14} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Inflow</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                                                        <ArrowDownRight size={14} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Outflow</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-gray-900 group-hover:translate-x-1 transition-transform">{tx.payee}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 rounded-full bg-gray-100/50 text-[9px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-mono text-[10px] font-bold text-gray-400">
                                            {tx.referenceId}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{tx.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`text-base font-black tabular-nums tracking-tighter ${tx.type === 'Income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-lg rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-100">
                                                <MoreHorizontal size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                <NewInvoiceModal
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    onSuccess={loadData}
                />
                <NewExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => setIsExpenseModalOpen(false)}
                    onSuccess={loadData}
                />
            </div>
        </div>
    );
}
