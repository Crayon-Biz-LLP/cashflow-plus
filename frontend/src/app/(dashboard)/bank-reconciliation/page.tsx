"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import NewBankAccountModal from "@/components/NewBankAccountModal";
import {
    BanknoteIcon,
    Building,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Plus,
    X,
    Search,
    Zap,
    Link2,
    Unlink,
} from "lucide-react";

interface BankAccount {
    bankAccountId: string;
    bankName: string;
    accountNumber: string;
    ifscCode?: string;
    accountType: string;
    currentBalance: number;
    openingBalance: number;
    lastReconciled?: string;
}

interface BankTxn {
    _id: string;
    bankTxnId: string;
    bankAccountId: string;
    date: string;
    description: string;
    reference?: string;
    amount: number;
    type: "Credit" | "Debit";
    reconciliationStatus: string;
    matchedTransactionId?: string;
    matchedInvoiceId?: string;
    matchedBillId?: string;
}

function formatINR(n: number) {
    const abs = Math.abs(n);
    return (n < 0 ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    Unmatched: { color: "#ea580c", bg: "#fff7ed", icon: Unlink },
    Matched: { color: "#2563eb", bg: "#eff6ff", icon: Link2 },
    Reconciled: { color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
    Excluded: { color: "#6b7280", bg: "#f3f4f6", icon: XCircle },
};

export default function BankReconciliationPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [transactions, setTransactions] = useState<BankTxn[]>([]);
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isNewBankModalOpen, setIsNewBankModalOpen] = useState(false);
    const [matchResult, setMatchResult] = useState<string | null>(null);
    const [form, setForm] = useState({ date: "", description: "", amount: "", type: "Credit", reference: "" });

    useEffect(() => { loadAccounts(); }, []);
    useEffect(() => { if (selectedBank) loadTransactions(); }, [selectedBank, statusFilter]);

    async function loadAccounts() {
        try {
            const data = await api.getBankAccounts();
            setAccounts(data);
            if (data.length > 0 && !selectedBank) setSelectedBank(data[0].bankAccountId);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function loadTransactions() {
        try {
            const data = await api.getBankTransactions(selectedBank, statusFilter === "All" ? undefined : statusFilter);
            setTransactions(data);
        } catch (e) { console.error(e); }
    }

    async function handleAutoMatch() {
        try {
            const result = await api.autoMatchTransactions(selectedBank);
            setMatchResult(`✅ Matched ${result.matched} of ${result.total} unmatched transactions`);
            loadTransactions();
            setTimeout(() => setMatchResult(null), 4000);
        } catch (e: any) {
            setMatchResult("❌ " + (e.message || "Auto-match failed"));
        }
    }

    async function handleReconcile(txnId: string) {
        try {
            await api.reconcileTransaction(txnId, { status: "Reconciled" });
            loadTransactions();
        } catch (e) { console.error(e); }
    }

    async function handleExclude(txnId: string) {
        try {
            await api.reconcileTransaction(txnId, { status: "Excluded" });
            loadTransactions();
        } catch (e) { console.error(e); }
    }

    async function handleAddTxn() {
        try {
            await api.createBankTransaction({
                bankAccountId: selectedBank,
                date: form.date,
                description: form.description,
                amount: parseFloat(form.amount),
                type: form.type,
                reference: form.reference,
            });
            setShowModal(false);
            setForm({ date: "", description: "", amount: "", type: "Credit", reference: "" });
            loadTransactions();
            loadAccounts();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    const selectedBankData = accounts.find(a => a.bankAccountId === selectedBank);
    const stats = {
        unmatched: transactions.filter(t => t.reconciliationStatus === "Unmatched").length,
        matched: transactions.filter(t => t.reconciliationStatus === "Matched").length,
        reconciled: transactions.filter(t => t.reconciliationStatus === "Reconciled").length,
    };

    return (
        <div className="min-h-screen">
            <Topbar title="Bank Reconciliation" subtitle="Match bank statements with your books — auto-match & manual review" onMenuToggle={onMenuToggle} />
            <div className="px-4 md:px-8 pb-8">
                {/* Bank Account Cards */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Linked Accounts</h2>
                    <button
                        className="text-[10px] font-black uppercase tracking-widest text-teal-600 flex items-center gap-1 hover:underline"
                        onClick={() => setIsNewBankModalOpen(true)}
                    >
                        <Plus size={14} /> Add Account
                    </button>
                </div>

                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1 mb-6">
                    {accounts.map(acc => (
                        <div
                            key={acc.bankAccountId}
                            onClick={() => setSelectedBank(acc.bankAccountId)}
                            className="flex-shrink-0 w-[240px] md:w-[280px] p-5 rounded-[1.5rem] cursor-pointer transition-all border"
                            style={{
                                background: selectedBank === acc.bankAccountId
                                    ? "linear-gradient(135deg, white, var(--teal-50))"
                                    : "white",
                                borderColor: selectedBank === acc.bankAccountId ? "var(--teal-500)" : "var(--card-border)",
                                boxShadow: selectedBank === acc.bankAccountId ? "0 10px 25px -5px rgba(20, 184, 166, 0.1)" : "none",
                                borderWidth: selectedBank === acc.bankAccountId ? "2px" : "1.5px"
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2.5 rounded-xl" style={{ background: "var(--teal-50)" }}>
                                    <Building size={18} style={{ color: "var(--teal-600)" }} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{acc.accountType}</span>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{acc.bankName}</p>
                            <p className="text-xl font-black text-gray-900">{formatINR(acc.currentBalance)}</p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-gray-400">•••• {acc.accountNumber.slice(-4)}</span>
                                {acc.lastReconciled && (
                                    <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Reconciled</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar Row */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-orange-600">{stats.unmatched} Pending</span>
                        </div>
                        <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600">{stats.matched} Suggestions</span>
                        </div>
                        <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">{stats.reconciled} Done</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 lg:ml-auto">
                        <select
                            className="flex-1 lg:flex-none px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                            style={{ borderColor: "var(--card-border)" }}
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Operations</option>
                            <option value="Unmatched">Unmatched</option>
                            <option value="Matched">Matches Found</option>
                            <option value="Reconciled">Reconciled</option>
                            <option value="Excluded">Excluded</option>
                        </select>
                        <button className="flex-1 lg:flex-none btn-secondary justify-center py-2 px-4 shadow-sm" style={{ fontSize: "0.7rem", fontWeight: 900 }} onClick={handleAutoMatch}>
                            <Zap size={14} /> AI MATCH
                        </button>
                        <button className="flex-1 lg:flex-none btn-primary justify-center py-2 px-4 shadow-lg shadow-teal-500/20" style={{ fontSize: "0.76rem" }} onClick={() => setShowModal(true)}>
                            <Plus size={14} /> ADD TXN
                        </button>
                    </div>
                </div>

                {matchResult && (
                    <div className="mb-6 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-teal-700 animate-in fade-in slide-in-from-top-2"
                        style={{ background: "var(--teal-50)", border: "1px solid var(--teal-200)" }}>
                        {matchResult}
                    </div>
                )}

                <NewBankAccountModal
                    isOpen={isNewBankModalOpen}
                    onClose={() => setIsNewBankModalOpen(false)}
                    onSuccess={loadAccounts}
                />

                {/* Transaction Table */}
                <div className="bg-white rounded-[2rem] border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr style={{ background: "var(--black-50)" }}>
                                    <th className="text-left text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Posting Date</th>
                                    <th className="text-left text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Transaction Details</th>
                                    <th className="text-left text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Reference</th>
                                    <th className="text-right text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Amount</th>
                                    <th className="text-center text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Rec Status</th>
                                    <th className="text-center text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Suggested Match</th>
                                    <th className="text-center text-[10px] font-black uppercase tracking-widest px-6 py-4" style={{ color: "var(--black-400)" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(txn => {
                                    const cfg = statusConfig[txn.reconciliationStatus] || statusConfig.Unmatched;
                                    const Icon = cfg.icon;
                                    return (
                                        <tr key={txn.bankTxnId} className="border-t transition-colors hover:bg-gray-50/50" style={{ borderColor: "var(--black-100)" }}>
                                            <td className="px-6 py-5">
                                                <span className="text-[11px] font-black text-gray-400">
                                                    {new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-gray-900">{txn.description}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{txn.bankTxnId}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-mono font-bold bg-gray-100 px-2 py-0.5 rounded" style={{ color: "var(--black-500)" }}>{txn.reference || "—"}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-sm font-black tracking-tight" style={{ color: txn.type === "Credit" ? "var(--teal-600)" : "#ef4444" }}>
                                                    {txn.type === "Credit" ? "+" : "-"}{formatINR(Math.abs(txn.amount))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter" style={{ background: cfg.bg, color: cfg.color }}>
                                                    <Icon size={10} /> {txn.reconciliationStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-[10px] font-black text-gray-400 italic">
                                                    {txn.matchedTransactionId || txn.matchedInvoiceId || txn.matchedBillId || "No Match"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {txn.reconciliationStatus === "Matched" && (
                                                        <button
                                                            className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-4 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                                                            onClick={() => handleReconcile(txn.bankTxnId)}
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {txn.reconciliationStatus === "Unmatched" && (
                                                        <button
                                                            className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-4 py-1.5 rounded-xl hover:bg-gray-200 transition-all"
                                                            onClick={() => handleExclude(txn.bankTxnId)}
                                                        >
                                                            Ignore
                                                        </button>
                                                    )}
                                                    {txn.reconciliationStatus === "Reconciled" && (
                                                        <div className="p-1 px-3 bg-emerald-50 rounded-lg">
                                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {transactions.length === 0 && !loading && (
                            <div className="px-5 py-24 text-center bg-gray-50/50">
                                <div className="p-4 bg-white rounded-full w-fit mx-auto shadow-sm mb-4">
                                    <AlertCircle size={32} className="text-gray-200" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Zero statements found</p>
                                <p className="text-[10px] font-bold text-gray-300 mt-1 max-w-[280px] mx-auto uppercase">Connect your bank feed or manually upload entries for reconciliation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-2xl w-full max-w-[500px]" style={{ border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Post Statement</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">New Manual Bank Entry</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Value Date</label>
                                    <input type="date" className="w-full px-4 py-3 text-sm rounded-2xl border bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Entry Type</label>
                                    <select className="w-full px-4 py-3 text-sm rounded-2xl border bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        <option value="Credit">Credit (Inflow)</option>
                                        <option value="Debit">Debit (Outflow)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Statement Description</label>
                                <input className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="e.g. NEFT/IMPS DETAILS" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Amount (₹)</label>
                                    <input type="number" className="w-full px-4 py-3 text-sm rounded-2xl border font-black text-teal-600 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Ref / UTR Number</label>
                                    <input className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="Optional" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10 pt-4">
                            <button className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all font-mono" onClick={() => setShowModal(false)}>CANCEL</button>
                            <button className="px-8 py-3 rounded-2xl text-sm font-black text-white bg-teal-600 shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all" onClick={handleAddTxn}>
                                POST TRANSACTION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
