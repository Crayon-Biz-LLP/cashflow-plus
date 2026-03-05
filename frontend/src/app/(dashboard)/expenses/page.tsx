"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Topbar from "@/components/Topbar";
import {
    Plus,
    Download,
    Receipt,
    Briefcase,
    Car,
    FileStack,
    Users,
    Layers,
    ArrowUpRight,
    Calendar,
    Eye,
    CheckCircle,
    MoreHorizontal,
    Wallet,
    AlertCircle,
    Loader2,
} from "lucide-react";

// Initial data placeholder removed, now using state

const catIcons: Record<string, React.ElementType> = {
    "Court Filing": FileStack,
    Travel: Car,
    "Staff Cost": Users,
    Documentation: Layers,
    "Expert Witness": Briefcase,
};

const catColors: Record<string, { color: string; bg: string }> = {
    "Court Filing": { color: "var(--teal-600)", bg: "var(--teal-50)" },
    Travel: { color: "var(--info)", bg: "var(--info-light)" },
    "Staff Cost": { color: "#7c3aed", bg: "#f5f3ff" },
    Documentation: { color: "var(--warning)", bg: "var(--warning-light)" },
    "Expert Witness": { color: "var(--danger)", bg: "var(--danger-light)" },
};

import NewExpenseModal from "@/components/NewExpenseModal";
import SettlePaymentModal from "@/components/SettlePaymentModal";
import BillPreviewModal from "@/components/BillPreviewModal";

export default function ExpensesPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [selected, setSelected] = useState<string>("All");
    const [expenses, setExpenses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [expData, bankData] = await Promise.all([
                    api.getExpenses(),
                    api.getBankAccounts()
                ]);
                setExpenses(expData);
                setBankAccounts(bankData);
                if (bankData.length > 0) setSelectedBankId(bankData[0].bankAccountId);
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const data = await api.getExpenses();
            setExpenses(data);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = ["All", ...Object.keys(catColors)];
    const filtered =
        selected === "All"
            ? expenses
            : expenses.filter((e) => e.category === selected);

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amt);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleApprove = async (bankAccountId: string) => {
        setIsSubmitting(true);
        try {
            await Promise.all(selectedIds.map(id => api.updateExpenseStatus(id, "Approved", bankAccountId)));
            alert(`✅ ${selectedIds.length} expense(s) approved and settled!`);
            setIsPayModalOpen(false);
            setSelectedIds([]);
            fetchExpenses();
        } catch (error) {
            console.error("Failed to approve expenses:", error);
            alert("❌ Failed to settle expenses. Some payments might not have gone through.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleViewExpense = (exp: any) => {
        setSelectedExpense(exp);
        setIsPreviewOpen(true);
    };

    const toggleSelectAll = () => {
        const pendingCount = filtered.filter(e => e.status === "Pending").length;
        if (selectedIds.length === pendingCount) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.filter(e => e.status === "Pending").map(e => e.expenseId));
        }
    };

    return (
        <div className="min-h-screen">
            <Topbar title="Expenses" subtitle="Track and manage case-linked expenses" onMenuToggle={onMenuToggle} />

            <div className="px-4 md:px-8 pb-8">
                {/* Category Summary */}
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                    {Object.entries(catColors).map(([cat, style]) => {
                        const Icon = catIcons[cat];
                        const total = expenses
                            .filter((e) => e.category === cat)
                            .length;
                        return (
                            <div
                                key={cat}
                                className="runway-card p-4 md:p-5 flex-shrink-0 cursor-pointer group min-w-[200px] md:min-w-0 md:flex-1"
                                onClick={() => setSelected(cat === selected ? "All" : cat)}
                                style={{
                                    borderColor:
                                        selected === cat
                                            ? style.color
                                            : "var(--black-100)",
                                    background: selected === cat ? "var(--teal-50)" : "white",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="p-3 rounded-2xl transition-transform group-hover:scale-110"
                                        style={{ background: style.bg }}
                                    >
                                        <Icon size={20} style={{ color: style.color }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                                            {cat}
                                        </p>
                                        <p className="text-xs font-medium" style={{ color: "var(--black-400)" }}>
                                            {total} entries
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold" style={{ color: "var(--black-500)" }}>
                            Showing {filtered.length} expenses
                        </p>
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full animate-in slide-in-from-left-2 transition-all">
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{selectedIds.length} SELECTED</span>
                                <button
                                    onClick={() => setIsPayModalOpen(true)}
                                    className="px-3 py-1 bg-teal-600 text-white text-[10px] font-black rounded-lg hover:bg-teal-700 transition-colors uppercase tracking-wider"
                                >
                                    PAY NOW
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="text-[10px] font-bold text-black-400 hover:text-black-600 px-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex-1 md:flex-none btn-secondary" style={{ fontSize: "0.75rem" }}>
                            <Download size={14} />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 md:flex-none btn-primary"
                            style={{ fontSize: "0.75rem" }}
                        >
                            <Plus size={14} />
                            Log Expense
                        </button>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="runway-card overflow-x-auto no-scrollbar">
                    <table className="data-table min-w-[1000px]">
                        <thead>
                            <tr>
                                <th className="w-10">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                        checked={selectedIds.length > 0 && selectedIds.length === filtered.filter(e => e.status === "Pending").length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Case ID</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Logged By</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                            <p className="text-sm font-medium" style={{ color: "var(--black-400)" }}>Loading expenses...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-20 text-center">
                                        <p className="text-sm font-medium" style={{ color: "var(--black-400)" }}>No expenses found</p>
                                    </td>
                                </tr>
                            ) : filtered.map((exp) => {
                                const cc = catColors[exp.category] || {
                                    color: "var(--black-500)",
                                    bg: "var(--black-100)",
                                };
                                return (
                                    <tr
                                        key={exp._id || exp.expenseId}
                                        className={selectedIds.includes(exp.expenseId) ? "bg-teal-50/30" : ""}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer disabled:opacity-30"
                                                disabled={exp.status !== "Pending"}
                                                checked={selectedIds.includes(exp.expenseId)}
                                                onChange={() => toggleSelect(exp.expenseId)}
                                            />
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs font-semibold" style={{ color: "var(--black-600)" }}>
                                                {exp.expenseId}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-mono text-xs font-semibold" style={{ color: "var(--teal-600)" }}>
                                                {exp.caseId}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: cc.bg,
                                                    color: cc.color,
                                                }}
                                            >
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm" style={{ color: "var(--foreground)" }}>
                                                {exp.description}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-bold">{formatCurrency(exp.totalWithGst || exp.amount)}</span>
                                            <div className="text-[10px]" style={{ color: "var(--black-400)" }}>
                                                incl. GST {formatCurrency(exp.gstAmount || 0)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs" style={{ color: "var(--black-500)" }}>
                                                {formatDate(exp.date)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={`avatar avatar-teal`} style={{ width: 28, height: 28, fontSize: "0.65rem" }}>
                                                {exp.loggedBy?.substring(0, 2).toUpperCase() || "US"}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${exp.status === "Approved"
                                                    ? "badge-teal"
                                                    : exp.status === "Rejected" ? "badge-danger" : "badge-warning"
                                                    }`}
                                            >
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {exp.status === "Pending" && (
                                                    <button
                                                        onClick={() => { setSelectedIds([exp.expenseId]); setIsPayModalOpen(true); }}
                                                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-teal-600 text-white rounded-lg flex items-center gap-1.5 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-700/10"
                                                    >
                                                        <Wallet size={12} />
                                                        Pay Now
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                    <button
                                                        title="Quick View"
                                                        onClick={() => handleViewExpense(exp)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-white transition-all duration-200"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-lg transition-colors hover:bg-white"
                                                        style={{ color: "var(--black-400)" }}
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <NewExpenseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchExpenses}
                />

                <SettlePaymentModal
                    isOpen={isPayModalOpen}
                    onClose={() => setIsPayModalOpen(false)}
                    onConfirm={handleApprove}
                    items={expenses.filter(e => selectedIds.includes(e.expenseId))}
                    type="Expense"
                    title="Pay Expenses"
                    description="Approve and settle selected case expenses."
                />

                <BillPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    bill={selectedExpense}
                />
            </div>
        </div>
    );
}
