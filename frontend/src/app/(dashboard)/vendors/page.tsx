"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import { Plus, Building2, Mail, Phone, DollarSign, AlertCircle, X, Search } from "lucide-react";

const catColors: Record<string, { color: string; bg: string }> = {
    "Legal Services": { color: "var(--teal-600)", bg: "var(--teal-50)" },
    Travel: { color: "#ea580c", bg: "#fff7ed" },
    "Office Supplies": { color: "#7c3aed", bg: "#f5f3ff" },
    Technology: { color: "#2563eb", bg: "#eff6ff" },
    Consulting: { color: "#16a34a", bg: "#f0fdf4" },
    Other: { color: "var(--black-500)", bg: "var(--black-50)" },
};
function fmtINR(n: number) { return "\u20b9" + n.toLocaleString("en-IN"); }

export default function VendorsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", phone: "", category: "Other", gstin: "" });

    useEffect(() => { load(); }, []);
    async function load() {
        try { setVendors(await api.getVendors()); } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    async function handleCreate() {
        if (!form.name) return;
        try { await api.createVendor(form); setShowModal(false); setForm({ name: "", email: "", phone: "", category: "Other", gstin: "" }); load(); }
        catch (e: any) { alert(e.message); }
    }

    const filtered = vendors.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()));
    const totalPaid = vendors.reduce((s: number, v: any) => s + v.totalPaid, 0);
    const totalOut = vendors.reduce((s: number, v: any) => s + v.outstandingBalance, 0);

    return (
        <div className="min-h-screen">
            <Topbar title="Vendors" subtitle="Manage payees, suppliers, and service providers" onMenuToggle={onMenuToggle} />
            <div className="px-4 md:px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {[
                        { label: "Total Vendors", value: String(vendors.length), icon: Building2, color: "var(--teal-600)", bg: "var(--teal-50)" },
                        { label: "Total Paid", value: fmtINR(totalPaid), icon: DollarSign, color: "#16a34a", bg: "#f0fdf4" },
                        { label: "Outstanding", value: fmtINR(totalOut), icon: AlertCircle, color: "#ea580c", bg: "#fff7ed" },
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
                    <div className="flex items-center gap-3">
                        <div className="relative w-full md:w-60">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--black-400)" }} />
                            <input className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border" style={{ borderColor: "var(--card-border)" }} placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <button className="btn-primary w-full md:w-auto justify-center" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(true)}><Plus size={14} /> Add Vendor</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((v: any) => {
                        const cc = catColors[v.category] || catColors.Other;
                        return (
                            <div key={v.vendorId} className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all" style={{ borderColor: "var(--card-border)" }}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold" style={{ color: "var(--teal-600)" }}>{v.vendorId}</span>
                                            <span className="badge" style={{ background: cc.bg, color: cc.color, fontSize: "0.6rem" }}>{v.category}</span>
                                        </div>
                                        <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{v.name}</h3>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mb-4">
                                    {v.email && <div className="flex items-center gap-2"><Mail size={12} style={{ color: "var(--black-400)" }} /><span className="text-xs truncate max-w-[200px]" style={{ color: "var(--black-500)" }}>{v.email}</span></div>}
                                    {v.phone && <div className="flex items-center gap-2"><Phone size={12} style={{ color: "var(--black-400)" }} /><span className="text-xs" style={{ color: "var(--black-500)" }}>{v.phone}</span></div>}
                                    {v.gstin && <div className="flex items-center gap-2"><Building2 size={12} style={{ color: "var(--black-400)" }} /><span className="text-xs font-mono" style={{ color: "var(--black-500)" }}>GSTIN: {v.gstin}</span></div>}
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: "var(--black-50)" }}>
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-xs" style={{ color: "var(--black-400)" }}>Paid</p><p className="text-sm font-bold" style={{ color: "#16a34a" }}>{fmtINR(v.totalPaid)}</p></div>
                                        <div className="text-right"><p className="text-xs" style={{ color: "var(--black-400)" }}>Outstanding</p><p className="text-sm font-bold" style={{ color: v.outstandingBalance > 0 ? "#ea580c" : "var(--black-300)" }}>{fmtINR(v.outstandingBalance)}</p></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                    </div>
                )}
                {filtered.length === 0 && !loading && (
                    <div className="py-20 text-center">
                        <p className="text-sm font-medium" style={{ color: "var(--black-400)" }}>No vendors found</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl w-full max-w-[480px]" style={{ border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add Vendor</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Name *</label><input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Email</label><input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Phone</label><input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>Category</label><select className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{Object.keys(catColors).map(c => <option key={c}>{c}</option>)}</select></div>
                                <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>GSTIN</label><input className="w-full px-3 py-2 text-sm rounded-xl border" style={{ borderColor: "var(--card-border)" }} value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} /></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button className="btn-secondary" style={{ fontSize: "0.75rem" }} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={handleCreate}><Plus size={14} /> Add Vendor</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
