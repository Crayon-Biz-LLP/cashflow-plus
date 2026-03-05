"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    Boxes,
    Plus,
    X,
    Search,
    AlertTriangle,
    Package,
    ArrowUpDown,
    TrendingDown,
} from "lucide-react";

interface InventoryItem {
    _id: string;
    itemId: string;
    name: string;
    sku: string;
    hsnCode?: string;
    category: string;
    unit: string;
    purchaseRate: number;
    sellingRate: number;
    gstRate: number;
    currentStock: number;
    reorderLevel: number;
    totalValue: number;
    lastRestocked?: string;
}

function formatINR(n: number) {
    return "₹" + Math.abs(n).toLocaleString("en-IN");
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [alerts, setAlerts] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
    const [adjustForm, setAdjustForm] = useState({ adjustment: "", reason: "" });
    const [form, setForm] = useState({
        name: "", sku: "", hsnCode: "", category: "Stationery", unit: "Nos",
        purchaseRate: "", sellingRate: "", gstRate: "18", currentStock: "0", reorderLevel: "5",
    });

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [data, lowStock] = await Promise.all([api.getInventory(), api.getLowStockAlerts()]);
            setItems(data);
            setAlerts(lowStock);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleCreate() {
        try {
            await api.createInventoryItem({
                name: form.name, sku: form.sku, hsnCode: form.hsnCode, category: form.category,
                unit: form.unit, purchaseRate: Number(form.purchaseRate), sellingRate: Number(form.sellingRate),
                gstRate: Number(form.gstRate), currentStock: Number(form.currentStock), reorderLevel: Number(form.reorderLevel),
            });
            setShowModal(false);
            setForm({ name: "", sku: "", hsnCode: "", category: "Stationery", unit: "Nos", purchaseRate: "", sellingRate: "", gstRate: "18", currentStock: "0", reorderLevel: "5" });
            loadAll();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    async function handleAdjust() {
        if (!adjustItem) return;
        try {
            await api.adjustStock(adjustItem.itemId, Number(adjustForm.adjustment), adjustForm.reason);
            setShowAdjustModal(false);
            setAdjustForm({ adjustment: "", reason: "" });
            setAdjustItem(null);
            loadAll();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()) || (i.hsnCode || "").includes(search));
    const totalValue = items.reduce((s, i) => s + i.totalValue, 0);
    const totalItems = items.reduce((s, i) => s + i.currentStock, 0);

    return (
        <div>
            <Topbar title="Inventory Management" subtitle="Track stock levels, HSN codes, reorder alerts & stock adjustments" />
            <div className="px-8 pb-8">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="stat-card" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: "#dbeafe" }}><Package size={16} style={{ color: "#2563eb" }} /></div>
                            <span className="text-xs font-semibold" style={{ color: "#2563eb" }}>Total SKUs</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{items.length}</p>
                    </div>
                    <div className="stat-card" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: "#dcfce7" }}><Boxes size={16} style={{ color: "#16a34a" }} /></div>
                            <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>Total Units</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{totalItems}</p>
                    </div>
                    <div className="stat-card" style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: "#ede9fe" }}><TrendingDown size={16} style={{ color: "#7c3aed" }} /></div>
                            <span className="text-xs font-semibold" style={{ color: "#7c3aed" }}>Total Value</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{formatINR(totalValue)}</p>
                    </div>
                    <div className="stat-card" style={{ background: alerts.length > 0 ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "linear-gradient(135deg, #f0fdf4, #dcfce7)" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: alerts.length > 0 ? "#fee2e2" : "#dcfce7" }}>
                                <AlertTriangle size={16} style={{ color: alerts.length > 0 ? "#ef4444" : "#16a34a" }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: alerts.length > 0 ? "#ef4444" : "#16a34a" }}>Low Stock</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{alerts.length}</p>
                        <p className="text-xs" style={{ color: "var(--black-400)" }}>{alerts.length > 0 ? "items need reorder" : "All stock OK"}</p>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                {alerts.length > 0 && (
                    <div className="mb-5 p-4 rounded-2xl" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} style={{ color: "#ef4444" }} />
                            <span className="text-sm font-bold" style={{ color: "#ef4444" }}>Low Stock Alert</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {alerts.map(a => (
                                <span key={a.itemId} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#fee2e2", color: "#ef4444" }}>
                                    {a.name} — {a.currentStock} left (min: {a.reorderLevel})
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--black-400)" }} />
                        <input className="pl-9 pr-3 py-2 text-xs rounded-xl border" style={{ borderColor: "var(--card-border)", width: 260 }}
                            placeholder="Search by name, SKU, or HSN..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(true)}>
                        <Plus size={14} /> Add Item
                    </button>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                    <table className="w-full">
                        <thead>
                            <tr style={{ background: "var(--black-50)" }}>
                                <th className="text-left text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Item</th>
                                <th className="text-left text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>SKU / HSN</th>
                                <th className="text-left text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Category</th>
                                <th className="text-right text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Purchase</th>
                                <th className="text-right text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Selling</th>
                                <th className="text-center text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>GST</th>
                                <th className="text-center text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Stock</th>
                                <th className="text-right text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Value</th>
                                <th className="text-center text-xs font-semibold px-5 py-3" style={{ color: "var(--black-500)" }}>Adjust</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => {
                                const isLow = item.currentStock <= item.reorderLevel;
                                return (
                                    <tr key={item.itemId} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--black-100)" }}>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.name}</p>
                                            <p className="text-xs" style={{ color: "var(--black-400)" }}>{item.unit}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-mono text-xs font-bold" style={{ color: "var(--teal-600)" }}>{item.sku}</p>
                                            {item.hsnCode && <p className="font-mono text-xs" style={{ color: "var(--black-400)" }}>HSN: {item.hsnCode}</p>}
                                        </td>
                                        <td className="px-5 py-3 text-xs" style={{ color: "var(--black-500)" }}>{item.category}</td>
                                        <td className="px-5 py-3 text-right text-sm">{formatINR(item.purchaseRate)}</td>
                                        <td className="px-5 py-3 text-right text-sm">{item.sellingRate ? formatINR(item.sellingRate) : "—"}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="badge badge-teal" style={{ fontSize: "0.65rem" }}>{item.gstRate}%</span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`text-sm font-bold ${isLow ? "text-red-500" : ""}`} style={{ color: isLow ? "#ef4444" : "var(--foreground)" }}>
                                                {item.currentStock}
                                            </span>
                                            {isLow && <p className="text-xs" style={{ color: "#ef4444" }}>Below {item.reorderLevel}</p>}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-bold">{formatINR(item.totalValue)}</td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                className="text-xs font-semibold px-3 py-1 rounded-lg"
                                                style={{ background: "#eff6ff", color: "#2563eb" }}
                                                onClick={() => { setAdjustItem(item); setShowAdjustModal(true); }}
                                            >
                                                <ArrowUpDown size={12} className="inline mr-1" /> Adjust
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Item Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="bg-white rounded-2xl p-8 shadow-2xl" style={{ width: 520, border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add Inventory Item</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Item Name</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>SKU</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>HSN Code</label>
                                    <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Category</label>
                                    <select className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option>Stationery</option><option>Office Supplies</option><option>Technology</option>
                                        <option>Furniture</option><option>Consulting</option><option>Services</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Unit</label>
                                    <select className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                        <option>Nos</option><option>Ream</option><option>Box</option><option>Kg</option>
                                        <option>Ltr</option><option>Hrs</option><option>License</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Purchase Rate</label>
                                    <input type="number" className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.purchaseRate} onChange={e => setForm({ ...form, purchaseRate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Selling Rate</label>
                                    <input type="number" className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.sellingRate} onChange={e => setForm({ ...form, sellingRate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>GST Rate</label>
                                    <select className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.gstRate} onChange={e => setForm({ ...form, gstRate: e.target.value })}>
                                        <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option>
                                        <option value="18">18%</option><option value="28">28%</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Opening Stock</label>
                                    <input type="number" className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Reorder Level</label>
                                    <input type="number" className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                        value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={handleCreate}>
                                <Plus size={14} /> Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Adjust Modal */}
            {showAdjustModal && adjustItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="bg-white rounded-2xl p-8 shadow-2xl" style={{ width: 420, border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Stock Adjustment</h2>
                            <button onClick={() => { setShowAdjustModal(false); setAdjustItem(null); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                        </div>
                        <div className="p-3 rounded-xl mb-4" style={{ background: "var(--black-50)" }}>
                            <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{adjustItem.name}</p>
                            <p className="text-xs" style={{ color: "var(--black-400)" }}>Current stock: {adjustItem.currentStock} {adjustItem.unit}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Adjustment (use negative for reduction)</label>
                                <input type="number" className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="e.g. +10 or -5" value={adjustForm.adjustment} onChange={e => setAdjustForm({ ...adjustForm, adjustment: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Reason</label>
                                <input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="e.g. Physical count, Damage" value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => { setShowAdjustModal(false); setAdjustItem(null); }}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={handleAdjust}>
                                <ArrowUpDown size={14} /> Adjust Stock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
