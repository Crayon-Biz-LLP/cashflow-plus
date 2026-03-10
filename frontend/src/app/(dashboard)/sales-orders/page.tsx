"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    ShoppingCart,
    Plus,
    X,
    FileText,
    CheckCircle2,
    Clock,
    Truck,
    Ban,
    Search,
} from "lucide-react";

interface SalesOrder {
    _id: string;
    soId: string;
    client: string;
    clientGstin?: string;
    caseId?: string;
    items: { name: string; hsnCode?: string; quantity: number; rate: number; amount: number; gstRate: number; gstAmount: number }[];
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
    grandTotal: number;
    status: string;
    orderDate: string;
    deliveryDate?: string;
    isInterState: boolean;
    invoiceId?: string;
}

function formatINR(n: number) {
    return "₹" + Math.abs(n).toLocaleString("en-IN");
}

const statusColors: Record<string, { color: string; bg: string }> = {
    Draft: { color: "#6b7280", bg: "#f3f4f6" },
    Confirmed: { color: "#2563eb", bg: "#eff6ff" },
    "Partially Delivered": { color: "#eab308", bg: "#fefce8" },
    Delivered: { color: "#16a34a", bg: "#f0fdf4" },
    Invoiced: { color: "#7c3aed", bg: "#f5f3ff" },
    Cancelled: { color: "#ef4444", bg: "#fef2f2" },
};

export default function SalesOrdersPage() {
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [cases, setCases] = useState<any[]>([]);
    const [form, setForm] = useState({
        client: "", clientGstin: "", caseId: "", isInterState: false,
        deliveryDate: "", notes: "",
        items: [{ name: "", hsnCode: "", quantity: 1, rate: 0, gstRate: 18 }],
    });

    useEffect(() => {
        loadOrders();
        api.getCases().then(setCases).catch(console.error);
    }, []);

    async function loadOrders() {
        try {
            const data = await api.getSalesOrders(statusFilter === "All" ? undefined : statusFilter);
            setOrders(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { loadOrders(); }, [statusFilter]);

    function addItem() {
        setForm({ ...form, items: [...form.items, { name: "", hsnCode: "", quantity: 1, rate: 0, gstRate: 18 }] });
    }
    function removeItem(i: number) {
        setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
    }
    function updateItem(i: number, field: string, value: any) {
        const items = [...form.items];
        (items[i] as any)[field] = value;
        setForm({ ...form, items });
    }

    async function handleCreate() {
        try {
            await api.createSalesOrder({
                client: form.client,
                clientGstin: form.clientGstin,
                caseId: form.caseId || undefined,
                isInterState: form.isInterState,
                deliveryDate: form.deliveryDate || undefined,
                notes: form.notes || undefined,
                items: form.items.map(it => ({
                    name: it.name,
                    hsnCode: it.hsnCode,
                    quantity: Number(it.quantity),
                    rate: Number(it.rate),
                    gstRate: Number(it.gstRate),
                })),
            });
            setShowModal(false);
            setForm({ client: "", clientGstin: "", caseId: "", isInterState: false, deliveryDate: "", notes: "", items: [{ name: "", hsnCode: "", quantity: 1, rate: 0, gstRate: 18 }] });
            loadOrders();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    async function handleStatusChange(soId: string, status: string) {
        try {
            await api.updateSalesOrderStatus(soId, status);
            loadOrders();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    const filtered = orders.filter(o => !search || o.client.toLowerCase().includes(search.toLowerCase()) || o.soId.toLowerCase().includes(search.toLowerCase()));
    const totalValue = filtered.reduce((s, o) => s + o.grandTotal, 0);

    return (
        <div>
            <Topbar title="Sales Orders" subtitle="Track client orders with GST split (CGST/SGST/IGST) — auto-invoice on delivery" />
            <div className="px-8 pb-8">
                {/* Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {Object.entries({ All: orders.length, Confirmed: orders.filter(o => o.status === "Confirmed").length, Delivered: orders.filter(o => o.status === "Delivered").length, Invoiced: orders.filter(o => o.status === "Invoiced").length }).map(([label, count]) => (
                        <div key={label} className="stat-card cursor-pointer" onClick={() => setStatusFilter(label)} style={{ borderColor: statusFilter === label ? "var(--teal-500)" : "var(--card-border)" }}>
                            <p className="text-xs font-semibold" style={{ color: "var(--black-500)" }}>{label}</p>
                            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{count}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--black-400)" }} />
                            <input className="pl-9 pr-3 py-2 text-xs rounded-xl border" style={{ borderColor: "var(--card-border)", width: 240 }}
                                placeholder="Search by client or SO ID..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--black-500)" }}>Total: {formatINR(totalValue)}</span>
                    </div>
                    <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(true)}>
                        <Plus size={14} /> New Sales Order
                    </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: "var(--black-50)" }}>
                                <th className="text-left text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>SO #</th>
                                <th className="text-left text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Client</th>
                                <th className="text-left text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Items</th>
                                <th className="text-right text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Subtotal</th>
                                <th className="text-right text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>GST</th>
                                <th className="text-right text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Grand Total</th>
                                <th className="text-center text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Status</th>
                                <th className="text-center text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => {
                                const cfg = statusColors[o.status] || statusColors.Draft;
                                return (
                                    <tr key={o.soId} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--black-100)" }}>
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs font-bold" style={{ color: "var(--teal-600)" }}>{o.soId}</span>
                                            <p className="text-xs" style={{ color: "var(--black-400)" }}>
                                                {new Date(o.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{o.client}</p>
                                            {o.clientGstin && <p className="text-xs font-mono" style={{ color: "var(--black-400)" }}>{o.clientGstin}</p>}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs" style={{ color: "var(--black-500)" }}>{o.items.length} items</span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-medium">{formatINR(o.subtotal)}</td>
                                        <td className="px-5 py-3 text-right">
                                            <p className="text-xs font-semibold" style={{ color: "var(--black-500)" }}>{formatINR(o.totalGst)}</p>
                                            {o.isInterState ? (
                                                <p className="text-xs" style={{ color: "var(--black-400)" }}>IGST: {formatINR(o.igst)}</p>
                                            ) : (
                                                <p className="text-xs" style={{ color: "var(--black-400)" }}>CGST: {formatINR(o.cgst)} + SGST: {formatINR(o.sgst)}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-bold">{formatINR(o.grandTotal)}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>{o.status}</span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {o.status === "Draft" && (
                                                <button className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: "#eff6ff", color: "#2563eb" }}
                                                    onClick={() => handleStatusChange(o.soId, "Confirmed")}>Confirm</button>
                                            )}
                                            {o.status === "Confirmed" && (
                                                <button className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: "#f0fdf4", color: "#16a34a" }}
                                                    onClick={() => handleStatusChange(o.soId, "Delivered")}>Deliver</button>
                                            )}
                                            {o.status === "Delivered" && (
                                                <button className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: "#f5f3ff", color: "#7c3aed" }}
                                                    onClick={() => handleStatusChange(o.soId, "Invoiced")}>Invoice</button>
                                            )}
                                            {o.invoiceId && (
                                                <span className="text-xs ml-2" style={{ color: "var(--black-400)" }}>{o.invoiceId}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create SO Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="bg-white rounded-2xl p-8 shadow-2xl overflow-y-auto" style={{ width: 640, maxHeight: "85vh", border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>New Sales Order</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Client Name *</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Client GSTIN</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="e.g. 27AABCT1234F1ZH" value={form.clientGstin} onChange={e => setForm({ ...form, clientGstin: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Case (optional)</label>
                                    <select className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.caseId} onChange={e => setForm({ ...form, caseId: e.target.value })}>
                                        <option value="">None</option>
                                        {cases.map((c: any) => <option key={c.caseId} value={c.caseId}>{c.caseId} — {c.title}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-5">
                                    <input type="checkbox" id="interstate" checked={form.isInterState} onChange={e => setForm({ ...form, isInterState: e.target.checked })} />
                                    <label htmlFor="interstate" className="text-xs font-semibold" style={{ color: "var(--black-500)" }}>Inter-State (IGST)</label>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--black-500)" }}>Line Items</label>
                                {form.items.map((item, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                        <input className="col-span-3 px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                            placeholder="Name" value={item.name} onChange={e => updateItem(i, "name", e.target.value)} />
                                        <input className="col-span-2 px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                            placeholder="HSN" value={item.hsnCode} onChange={e => updateItem(i, "hsnCode", e.target.value)} />
                                        <input type="number" className="col-span-1 px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                            value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                                        <input type="number" className="col-span-2 px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                            placeholder="Rate" value={item.rate} onChange={e => updateItem(i, "rate", e.target.value)} />
                                        <select className="col-span-2 px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: "var(--card-border)" }}
                                            value={item.gstRate} onChange={e => updateItem(i, "gstRate", e.target.value)}>
                                            <option value={0}>0%</option>
                                            <option value={5}>5%</option>
                                            <option value={12}>12%</option>
                                            <option value={18}>18%</option>
                                            <option value={28}>28%</option>
                                        </select>
                                        <div className="col-span-1 text-right text-xs font-bold" style={{ color: "var(--foreground)" }}>
                                            {formatINR(Number(item.quantity) * Number(item.rate))}
                                        </div>
                                        <button className="col-span-1 p-1 rounded hover:bg-red-50" onClick={() => removeItem(i)}><X size={12} style={{ color: "#ef4444" }} /></button>
                                    </div>
                                ))}
                                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--black-50)", color: "var(--teal-600)" }} onClick={addItem}>
                                    + Add Item
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={handleCreate}>
                                <Plus size={14} /> Create Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
