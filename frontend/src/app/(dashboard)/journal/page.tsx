"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    Plus,
    BookOpen,
    CheckCircle,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    X,
    AlertTriangle,
} from "lucide-react";

interface JournalLine {
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    description: string;
}

interface JournalEntry {
    _id: string;
    entryId: string;
    date: string;
    description: string;
    referenceType: string;
    lines: JournalLine[];
    totalDebit: number;
    totalCredit: number;
    status: string;
}

interface Account {
    accountCode: string;
    name: string;
    type: string;
}

function formatINR(n: number) {
    return "₹" + n.toLocaleString("en-IN");
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    Posted: { icon: CheckCircle, color: "var(--teal-600)", bg: "var(--teal-50)" },
    Draft: { icon: Clock, color: "var(--warning)", bg: "#fffbeb" },
    Void: { icon: XCircle, color: "var(--danger)", bg: "#fef2f2" },
};

export default function JournalEntriesPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [description, setDescription] = useState("");
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
    const [lines, setLines] = useState<{ accountCode: string; debit: string; credit: string; description: string }[]>([
        { accountCode: "", debit: "", credit: "", description: "" },
        { accountCode: "", debit: "", credit: "", description: "" },
    ]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [e, a] = await Promise.all([api.getJournalEntries(), api.getAccounts()]);
            setEntries(e);
            setAccounts(a);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function addLine() {
        setLines([...lines, { accountCode: "", debit: "", credit: "", description: "" }]);
    }

    function removeLine(idx: number) {
        if (lines.length <= 2) return;
        setLines(lines.filter((_, i) => i !== idx));
    }

    function updateLine(idx: number, field: string, value: string) {
        const updated = [...lines];
        (updated[idx] as any)[field] = value;
        // If debit is set, clear credit and vice versa
        if (field === "debit" && value) updated[idx].credit = "";
        if (field === "credit" && value) updated[idx].debit = "";
        setLines(updated);
    }

    const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    async function handleCreate() {
        if (!isBalanced || !description) return;
        try {
            const formattedLines = lines
                .filter(l => l.accountCode && (parseFloat(l.debit) || parseFloat(l.credit)))
                .map(l => {
                    const acc = accounts.find(a => a.accountCode === l.accountCode);
                    return {
                        accountCode: l.accountCode,
                        accountName: acc?.name || "",
                        debit: parseFloat(l.debit) || 0,
                        credit: parseFloat(l.credit) || 0,
                        description: l.description,
                    };
                });

            await api.createJournalEntry({ description, date: entryDate, lines: formattedLines });
            setShowModal(false);
            setDescription("");
            setLines([
                { accountCode: "", debit: "", credit: "", description: "" },
                { accountCode: "", debit: "", credit: "", description: "" },
            ]);
            loadData();
        } catch (e: any) {
            alert(e.message || "Failed to create journal entry");
        }
    }

    const totalEntries = entries.length;
    const postedCount = entries.filter(e => e.status === "Posted").length;
    const totalAmount = entries.reduce((s, e) => s + e.totalDebit, 0);

    return (
        <div>
            <Topbar title="Journal Entries" subtitle="Double-entry accounting — every transaction balanced with debits & credits" />

            <div className="px-8 pb-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-5 mb-6">
                    {[
                        { label: "Total Entries", value: totalEntries.toString(), icon: BookOpen, color: "var(--teal-600)", bg: "var(--teal-50)" },
                        { label: "Posted", value: postedCount.toString(), icon: CheckCircle, color: "#16a34a", bg: "#f0fdf4" },
                        { label: "Total Debited", value: formatINR(totalAmount), icon: BookOpen, color: "#7c3aed", bg: "#f5f3ff" },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg" style={{ background: s.bg }}>
                                    <s.icon size={16} style={{ color: s.color }} />
                                </div>
                                <span className="text-xs font-medium" style={{ color: "var(--black-400)" }}>{s.label}</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-semibold" style={{ color: "var(--black-500)" }}>
                        {entries.length} journal entries
                    </p>
                    <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(true)}>
                        <Plus size={14} /> New Journal Entry
                    </button>
                </div>

                {/* Entries List */}
                <div className="space-y-3">
                    {entries.map(entry => {
                        const sc = statusConfig[entry.status] || statusConfig.Draft;
                        const StatusIcon = sc.icon;
                        const isExpanded = expandedId === entry.entryId;

                        return (
                            <div key={entry.entryId} className="bg-white rounded-2xl border transition-all" style={{ borderColor: "var(--card-border)" }}>
                                <div
                                    className="flex items-center justify-between px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50"
                                    onClick={() => setExpandedId(isExpanded ? null : entry.entryId)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-xs font-bold" style={{ color: "var(--teal-600)" }}>{entry.entryId}</span>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{entry.description}</p>
                                            <p className="text-xs" style={{ color: "var(--black-400)" }}>
                                                {formatDate(entry.date)} • {entry.referenceType} • {entry.lines.length} lines
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: "0.65rem" }}>
                                            <StatusIcon size={10} /> {entry.status}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{formatINR(entry.totalDebit)}</p>
                                            <p className="text-xs" style={{ color: "var(--black-400)" }}>DR = CR</p>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} style={{ color: "var(--black-400)" }} /> : <ChevronDown size={16} style={{ color: "var(--black-400)" }} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-4">
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ background: "var(--black-50)" }}>
                                                    <th className="text-left text-xs font-semibold px-4 py-2 rounded-l-lg" style={{ color: "var(--black-500)" }}>Account</th>
                                                    <th className="text-left text-xs font-semibold px-4 py-2" style={{ color: "var(--black-500)" }}>Description</th>
                                                    <th className="text-right text-xs font-semibold px-4 py-2" style={{ color: "var(--teal-600)" }}>Debit (₹)</th>
                                                    <th className="text-right text-xs font-semibold px-4 py-2 rounded-r-lg" style={{ color: "#ef4444" }}>Credit (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entry.lines.map((line, i) => (
                                                    <tr key={i} className="border-t" style={{ borderColor: "var(--black-100)" }}>
                                                        <td className="px-4 py-2">
                                                            <span className="font-mono text-xs" style={{ color: "var(--teal-600)" }}>{line.accountCode}</span>
                                                            <span className="text-xs ml-2" style={{ color: "var(--foreground)" }}>{line.accountName}</span>
                                                        </td>
                                                        <td className="px-4 py-2 text-xs" style={{ color: "var(--black-500)" }}>{line.description || "—"}</td>
                                                        <td className="px-4 py-2 text-right text-xs font-bold" style={{ color: line.debit ? "var(--teal-600)" : "var(--black-200)" }}>
                                                            {line.debit ? formatINR(line.debit) : "—"}
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-xs font-bold" style={{ color: line.credit ? "#ef4444" : "var(--black-200)" }}>
                                                            {line.credit ? formatINR(line.credit) : "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr style={{ background: "var(--black-50)" }}>
                                                    <td colSpan={2} className="px-4 py-2 text-xs font-bold" style={{ color: "var(--foreground)" }}>Total</td>
                                                    <td className="px-4 py-2 text-right text-xs font-bold" style={{ color: "var(--teal-600)" }}>{formatINR(entry.totalDebit)}</td>
                                                    <td className="px-4 py-2 text-right text-xs font-bold" style={{ color: "#ef4444" }}>{formatINR(entry.totalCredit)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                    </div>
                )}

                {!loading && entries.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen size={48} style={{ color: "var(--black-200)", margin: "0 auto 16px" }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--black-400)" }}>No journal entries yet</p>
                        <p className="text-xs" style={{ color: "var(--black-300)" }}>Create your first double-entry journal entry</p>
                    </div>
                )}
            </div>

            {/* Create Journal Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="bg-white rounded-2xl p-8 shadow-2xl" style={{ width: 700, maxHeight: "90vh", overflowY: "auto", border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>New Journal Entry</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                                <X size={16} style={{ color: "var(--black-400)" }} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Date</label>
                                    <input type="date" className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={entryDate} onChange={e => setEntryDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Description</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="e.g. Client payment received"
                                        value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Lines */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Entry Lines</label>
                                <button className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--teal-600)" }} onClick={addLine}>
                                    <Plus size={12} /> Add Line
                                </button>
                            </div>

                            <div className="space-y-2">
                                {lines.map((line, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-4">
                                            <select className="w-full px-2 py-2 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                                value={line.accountCode} onChange={e => updateLine(idx, "accountCode", e.target.value)}>
                                                <option value="">Select Account</option>
                                                {accounts.map(a => (
                                                    <option key={a.accountCode} value={a.accountCode}>{a.accountCode} — {a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <input className="w-full px-2 py-2 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                                placeholder="Description" value={line.description} onChange={e => updateLine(idx, "description", e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" className="w-full px-2 py-2 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                                placeholder="Debit" value={line.debit} onChange={e => updateLine(idx, "debit", e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" className="w-full px-2 py-2 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                                placeholder="Credit" value={line.credit} onChange={e => updateLine(idx, "credit", e.target.value)} />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <button onClick={() => removeLine(idx)} className="p-1 rounded hover:bg-red-50" disabled={lines.length <= 2}>
                                                <X size={14} style={{ color: lines.length <= 2 ? "var(--black-200)" : "var(--danger)" }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Balance Check */}
                        <div className="p-4 rounded-xl mb-6" style={{ background: isBalanced ? "var(--teal-50)" : "#fef2f2", border: `1px solid ${isBalanced ? "var(--teal-200)" : "#fecaca"}` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {isBalanced ? (
                                        <CheckCircle size={16} style={{ color: "var(--teal-600)" }} />
                                    ) : (
                                        <AlertTriangle size={16} style={{ color: "#ef4444" }} />
                                    )}
                                    <span className="text-xs font-bold" style={{ color: isBalanced ? "var(--teal-700)" : "#ef4444" }}>
                                        {isBalanced ? "Balanced ✓" : "Unbalanced — Debits must equal Credits"}
                                    </span>
                                </div>
                                <div className="flex gap-6">
                                    <span className="text-xs font-bold" style={{ color: "var(--teal-600)" }}>DR: {formatINR(totalDebit)}</span>
                                    <span className="text-xs font-bold" style={{ color: "#ef4444" }}>CR: {formatINR(totalCredit)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: "0.75rem", opacity: isBalanced && description ? 1 : 0.5 }} onClick={handleCreate} disabled={!isBalanced || !description}>
                                <CheckCircle size={14} /> Post Journal Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
