"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import { Plus, FileText, CheckCircle, Clock, AlertTriangle, X, DollarSign, Eye } from "lucide-react";
import SettlePaymentModal from "@/components/SettlePaymentModal";
import BillPreviewModal from "@/components/BillPreviewModal";
import { showSuccessToast } from "@/components/GlobalToast";

function fmtINR(n: number) { return "\u20b9" + n.toLocaleString("en-IN"); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

const statusCfg: Record<string, { color: string; bg: string }> = {
    Draft: { color: "var(--black-500)", bg: "var(--black-50)" },
    Pending: { color: "#ea580c", bg: "#fff7ed" },
    Paid: { color: "#16a34a", bg: "#f0fdf4" },
    Overdue: { color: "#ef4444", bg: "#fef2f2" },
    Void: { color: "var(--black-400)", bg: "var(--black-100)" },
};

export default function BillsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [bills, setBills] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [form, setForm] = useState({ vendorId: "", amount: "", description: "", dueDate: "" });

    useEffect(() => { load(); }, []);
    async function load() {
        try {
            const [b, v] = await Promise.all([api.getBills(), api.getVendors()]);
            setBills(b); setVendors(v);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    async function handleCreate() {
        if (!form.vendorId || !form.amount) return;
        try {
            const data = await api.createBill({ ...form, amount: parseFloat(form.amount) });
            setShowModal(false);
            setForm({ vendorId: "", amount: "", description: "", dueDate: "" });

            // Show creation toast
            showSuccessToast(`Bill ${data.billId} successfully registered for ₹${data.total.toLocaleString()}`);

            load();
        } catch (e: any) { alert(e.message); }
    }

    function markPaid(bill: any) {
        setSelectedBill(bill);
        setIsPayModalOpen(true);
    }

    function viewBill(bill: any) {
        setSelectedBill(bill);
        setIsPreviewOpen(true);
    }

    async function confirmPayment(bankAccountId: string) {
        if (!selectedBill) return;
        try {
            await api.updateBillStatus(selectedBill.billId, "Paid", bankAccountId);
            load();
        } catch (e: any) {
            alert(e.message);
        }
    }

    const filtered = filter === "All" ? bills : bills.filter((b: any) => b.status === filter);
    const totalAmount = bills.reduce((s: number, b: any) => s + b.total, 0);
    const pendingAmt = bills.filter((b: any) => b.status === "Pending").reduce((s: number, b: any) => s + b.total, 0);
    const paidAmt = bills.filter((b: any) => b.status === "Paid").reduce((s: number, b: any) => s + b.total, 0);

    return (
        <div className="min-h-screen">
            <Topbar title="Bills & Payables" subtitle="Track bills from vendors — accounts payable management" onMenuToggle={onMenuToggle} />
            <div className="px-4 md:px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {[
                        { label: "Total Billed", value: fmtINR(totalAmount), icon: FileText, color: "var(--teal-600)", bg: "var(--teal-50)" },
                        { label: "Pending Payment", value: fmtINR(pendingAmt), icon: Clock, color: "#ea580c", bg: "#fff7ed" },
                        { label: "Paid to Vendors", value: fmtINR(paidAmt), icon: CheckCircle, color: "#16a34a", bg: "#f0fdf4" },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg" style={{ background: s.bg }}><s.icon size={16} style={{ color: s.color }} /></div>
                                <span className="text-xs font-medium" style={{ color: "var(--black-400)" }}>{s.label}</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {["All", "Pending", "Paid", "Overdue", "Draft"].map(s => (
                            <button key={s} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap"
                                onClick={() => setFilter(s)}
                                style={{
                                    background: filter === s ? "var(--teal-500)" : "white",
                                    color: filter === s ? "white" : "var(--black-400)",
                                    borderColor: filter === s ? "var(--teal-500)" : "var(--card-border)",
                                    boxShadow: filter === s ? "0 4px 12px rgba(20, 184, 166, 0.2)" : "none"
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <button className="btn-primary w-full md:w-auto justify-center" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(true)}><Plus size={14} /> New Bill</button>
                </div>

                <div className="bg-white rounded-[2rem] border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr style={{ background: "var(--black-50)" }}>
                                    <th className="text-left text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Bill ID</th>
                                    <th className="text-left text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Vendor</th>
                                    <th className="text-left text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Due Date</th>
                                    <th className="text-left text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Ref / Description</th>
                                    <th className="text-right text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Amount</th>
                                    <th className="text-right text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Tax</th>
                                    <th className="text-right text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Total</th>
                                    <th className="text-center text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Status</th>
                                    <th className="text-center text-[10px] uppercase tracking-wider font-black px-6 py-4" style={{ color: "var(--black-400)" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((b: any) => {
                                    const sc = statusCfg[b.status] || statusCfg.Draft;
                                    return (
                                        <tr key={b.billId} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: "var(--black-100)" }}>
                                            <td className="px-6 py-4"><span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100" style={{ color: "var(--black-600)" }}>{b.billId}</span></td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900">{b.vendorName}</p>
                                                <p className="text-[10px] text-gray-400">Verified Partner</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold" style={{ color: "var(--black-500)" }}>{fmtDate(b.date)}</td>
                                            <td className="px-6 py-4 text-xs text-gray-600 max-w-[200px] truncate">{b.description || "—"}</td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">{fmtINR(b.amount)}</td>
                                            <td className="px-6 py-4 text-right text-xs" style={{ color: "var(--black-400)" }}>{fmtINR(b.gst)}</td>
                                            <td className="px-6 py-4 text-right text-sm font-black text-teal-600">{fmtINR(b.total)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter" style={{ background: sc.bg, color: sc.color }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        title="View Bill"
                                                        onClick={() => viewBill(b)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-white transition-all duration-200 border border-transparent hover:border-gray-100"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    {b.status === "Pending" && (
                                                        <button className="text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                                                            style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" }}
                                                            onClick={() => markPaid(b)}>
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {!loading && filtered.length === 0 && (
                            <div className="text-center py-20 bg-gray-50/50">
                                <FileText size={40} className="mx-auto mb-3 text-gray-200" />
                                <p className="text-sm font-bold text-gray-400">No matching records found</p>
                            </div>
                        )}
                    </div>
                </div>
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-2xl w-full max-w-[520px]" style={{ border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-gray-900">Account Payable</h1>
                                <p className="text-sm font-bold text-gray-400">Register a new vendor bill</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Payee / Vendor</label>
                                <select className="w-full px-4 py-3 text-sm rounded-2xl border bg-gray-50 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all" style={{ borderColor: "var(--card-border)" }} value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })}>
                                    <option value="">Select a registered vendor</option>
                                    {vendors.map((v: any) => <option key={v.vendorId} value={v.vendorId}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Base Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                        <input type="number" className="w-full pl-8 pr-4 py-3 text-sm rounded-2xl border font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none" style={{ borderColor: "var(--card-border)" }} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Due Date</label>
                                    <input type="date" className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all" style={{ borderColor: "var(--card-border)" }} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Reference / Notes</label>
                                <input className="w-full px-4 py-3 text-sm rounded-2xl border font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none" style={{ borderColor: "var(--card-border)" }} placeholder="Bill reference number or details" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            {form.amount && (
                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider"><span>Subtotal</span><span className="text-gray-900">{fmtINR(parseFloat(form.amount) || 0)}</span></div>
                                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider"><span>GST (18%)</span><span className="text-gray-900">{fmtINR(Math.round((parseFloat(form.amount) || 0) * 0.18))}</span></div>
                                    <div className="flex justify-between text-sm pt-3 mt-1 border-t border-gray-200">
                                        <span className="font-black text-gray-900">Total Payable</span>
                                        <span className="font-black text-teal-600 text-lg">{fmtINR(Math.round((parseFloat(form.amount) || 0) * 1.18))}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
                            <button className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all" onClick={() => setShowModal(false)}>Discard</button>
                            <button className="px-8 py-3 rounded-2xl text-sm font-black text-white bg-teal-600 shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all" onClick={handleCreate}>Create Record</button>
                        </div>
                    </div>
                </div>
            )}

            <SettlePaymentModal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                onConfirm={confirmPayment}
                items={selectedBill ? [selectedBill] : []}
                type="Expense"
                title="Pay Vendor Bill"
                description="Select the bank account to debit for this payment."
            />

            <BillPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                bill={selectedBill}
            />
        </div>
    );
}
