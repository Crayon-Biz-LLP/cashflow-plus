"use client";

import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    IndianRupee,
    Plus,
    X,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Calculator,
    Landmark,
    Shield,
    Percent,
} from "lucide-react";

interface TaxProfile {
    _id: string;
    profileId: string;
    name: string;
    taxType: string;
    rate: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    isDefault: boolean;
    description?: string;
}

interface GstSummary {
    period: string;
    outputGST: { totalCGST: number; totalSGST: number; totalIGST: number; totalGST: number; invoiceCount: number; salesOrderCount: number };
    inputGST: { totalCGST: number; totalSGST: number; totalIGST: number; totalGST: number; billCount: number; purchaseOrderCount: number };
    netLiability: { cgst: number; sgst: number; igst: number; total: number };
    itcAvailable: number;
    generatedAt: string;
}

function formatINR(n: number) {
    const abs = Math.abs(n);
    return (n < 0 ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
}

export default function GstCompliancePage() {
    const [profiles, setProfiles] = useState<TaxProfile[]>([]);
    const [gstSummary, setGstSummary] = useState<GstSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"summary" | "profiles">("summary");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: "", taxType: "GST", rate: "", description: "",
    });

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [p, g] = await Promise.all([api.getTaxProfiles(), api.getGstSummary()]);
            setProfiles(p);
            setGstSummary(g);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleCreate() {
        try {
            await api.createTaxProfile({
                name: form.name,
                taxType: form.taxType,
                rate: Number(form.rate),
                description: form.description || undefined,
            });
            setShowModal(false);
            setForm({ name: "", taxType: "GST", rate: "", description: "" });
            loadAll();
        } catch (e: any) { alert(e.message || "Failed"); }
    }

    if (loading) {
        return (
            <div className="min-h-screen">
                <Topbar title="GST & Tax Compliance" subtitle="Multi-rate GST, CGST/SGST/IGST split, TDS profiles & GSTR filing summary" />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} />
                </div>
            </div>
        );
    }

    const gstProfiles = profiles.filter(p => p.taxType === "GST");
    const tdsProfiles = profiles.filter(p => p.taxType === "TDS");

    return (
        <div className="min-h-screen">
            <Topbar title="GST Compliance" subtitle="Tax profiles, component split & liability summary" />
            <div className="px-4 md:px-8 pb-8">
                {/* Top Summary Cards */}
                {gstSummary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px] bg-white" style={{ borderColor: "var(--card-border)" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ArrowUpRight size={18} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Output Tax</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(gstSummary.outputGST?.totalGST || 0)}</p>
                            <p className="text-[10px] font-bold mt-1 text-emerald-600 uppercase tracking-tighter">{gstSummary.outputGST?.invoiceCount || 0} invoices processed</p>
                        </div>
                        <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px] bg-white" style={{ borderColor: "var(--card-border)" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><ArrowDownRight size={18} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Input Tax (ITC)</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(gstSummary.inputGST?.totalGST || 0)}</p>
                            <p className="text-[10px] font-bold mt-1 text-rose-600 uppercase tracking-tighter">{gstSummary.inputGST?.billCount || 0} bills verified</p>
                        </div>
                        <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px] bg-white shadow-sm" style={{ borderColor: "var(--teal-200)" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600"><Calculator size={18} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Net Liability</span>
                            </div>
                            <p className="text-2xl font-black tracking-tight" style={{ color: (gstSummary.netLiability?.total || 0) >= 0 ? "#ef4444" : "var(--teal-600)" }}>
                                {formatINR(gstSummary.netLiability?.total || 0)}
                            </p>
                            <p className="text-[10px] font-bold mt-1 text-gray-400 uppercase tracking-tighter">Current Payable</p>
                        </div>
                        <div className="p-6 rounded-3xl border transition-all hover:translate-y-[-4px] bg-white" style={{ borderColor: "var(--card-border)" }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Shield size={18} /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">ITC Reserve</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatINR(gstSummary.itcAvailable)}</p>
                            <p className="text-[10px] font-bold mt-1 text-indigo-600 uppercase tracking-tighter">Offset available</p>
                        </div>
                    </div>
                )}

                {/* Tabs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-gray-100/30 p-1 rounded-2xl border border-gray-100/50">
                        {(["summary", "profiles"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="flex-shrink-0 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                                style={{
                                    background: tab === t ? "white" : "transparent",
                                    color: tab === t ? "var(--teal-600)" : "var(--black-500)",
                                    boxShadow: tab === t ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                                }}
                            >
                                {t === "summary" ? "GSTR Vision" : "Tax DNA Profiles"}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1" />
                    {tab === "profiles" && (
                        <button className="btn-primary justify-center py-2.5 px-6 rounded-22 shadow-lg shadow-teal-500/20" style={{ fontSize: "0.76rem" }} onClick={() => setShowModal(true)}>
                            <Plus size={14} /> NEW TAX PROFILE
                        </button>
                    )}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* GSTR Summary */}
                    {tab === "summary" && gstSummary && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] border overflow-hidden" style={{ borderColor: "var(--card-border)" }}>
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">GSTR-3B Reconciliation</h3>
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Digital Tax Ledger Breakdown</p>
                                </div>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr>
                                                <th className="text-left text-[10px] font-black uppercase tracking-widest px-8 py-5" style={{ color: "var(--black-400)" }}>Component</th>
                                                <th className="text-right text-[10px] font-black uppercase tracking-widest px-8 py-5" style={{ color: "var(--black-400)" }}>Output GST</th>
                                                <th className="text-right text-[10px] font-black uppercase tracking-widest px-8 py-5" style={{ color: "var(--black-400)" }}>ITC Claimed</th>
                                                <th className="text-right text-[10px] font-black uppercase tracking-widest px-8 py-5" style={{ color: "var(--black-400)" }}>Net Position</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { label: "Central GST (CGST)", output: gstSummary.outputGST?.totalCGST || 0, input: gstSummary.inputGST?.totalCGST || 0, net: gstSummary.netLiability?.cgst || 0 },
                                                { label: "State GST (SGST)", output: gstSummary.outputGST?.totalSGST || 0, input: gstSummary.inputGST?.totalSGST || 0, net: gstSummary.netLiability?.sgst || 0 },
                                                { label: "Integrated GST (IGST)", output: gstSummary.outputGST?.totalIGST || 0, input: gstSummary.inputGST?.totalIGST || 0, net: gstSummary.netLiability?.igst || 0 },
                                            ].map(row => (
                                                <tr key={row.label} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6 text-sm font-black text-gray-900">{row.label}</td>
                                                    <td className="px-8 py-6 text-right text-sm font-black text-emerald-600 font-mono">{formatINR(row.output)}</td>
                                                    <td className="px-8 py-6 text-right text-sm font-black text-rose-500 font-mono">{formatINR(row.input)}</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="text-sm font-black font-mono" style={{ color: row.net >= 0 ? "#ef4444" : "var(--teal-600)" }}>
                                                            {formatINR(row.net)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="border-t-2 bg-gray-50/50" style={{ borderColor: "var(--black-100)" }}>
                                                <td className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Consolidated Aggregates</td>
                                                <td className="px-8 py-6 text-right text-base font-black text-emerald-600 font-mono">{formatINR(gstSummary.outputGST?.totalGST || 0)}</td>
                                                <td className="px-8 py-6 text-right text-base font-black text-rose-500 font-mono">{formatINR(gstSummary.inputGST?.totalGST || 0)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="inline-block px-5 py-2 rounded-2xl text-base font-black font-mono shadow-sm border"
                                                        style={{
                                                            background: (gstSummary.netLiability?.total || 0) >= 0 ? "#fef2f2" : "#f0fdf4",
                                                            color: (gstSummary.netLiability?.total || 0) >= 0 ? "#ef4444" : "#16a34a",
                                                            borderColor: (gstSummary.netLiability?.total || 0) >= 0 ? "#fecaca" : "#bbf7d0",
                                                        }}>
                                                        {formatINR(gstSummary.netLiability?.total || 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe" }}>
                                <div className="p-4 rounded-3xl bg-white shadow-sm"><Landmark size={32} className="text-blue-600" /></div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Filing Compliance Protocol</h4>
                                    <p className="text-xs text-blue-800/70 font-bold leading-relaxed max-w-[800px]">
                                        Automated tax computation engine aligned with GSTR architecture. Output GST reflects collections from accounts receivable (Invoices/SO).
                                        ITC represents offsets valid from accounts payable (Bills/PO/Expenses).
                                    </p>
                                </div>
                                <div className="md:ml-auto">
                                    <div className="bg-white/50 backdrop-blur px-4 py-2 rounded-xl border border-blue-200">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Snapshot Sync</p>
                                        <p className="text-[11px] font-black text-blue-600">{new Date(gstSummary.generatedAt).toLocaleTimeString("en-IN")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tax Profiles */}
                    {tab === "profiles" && (
                        <div className="space-y-12">
                            {/* GST Profiles */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white"><Shield size={16} /></div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">GST Registry</h3>
                                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest border border-teal-100">{gstProfiles.length} Profiles</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gstProfiles.map(p => (
                                        <div key={p.profileId} className="bg-white rounded-[2rem] border p-8 transition-all hover:shadow-2xl hover:translate-y-[-8px] group" style={{ borderColor: "var(--card-border)" }}>
                                            <div className="flex items-center justify-between mb-8">
                                                <span className="text-sm font-black text-gray-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{p.name}</span>
                                                {p.isDefault && <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">MASTER</span>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 mb-8">
                                                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-50">
                                                    <p className="text-4xl font-black text-teal-600 tracking-tighter">{p.rate}<span className="text-sm font-black ml-1">%</span></p>
                                                    <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest mt-1">Aggregate</p>
                                                </div>
                                                <div className="space-y-3 pt-1">
                                                    <div className="flex items-center justify-between"><span className="text-[9px] font-black text-gray-400 uppercase">CGST</span><span className="text-[11px] font-black text-blue-600">{p.cgstRate}%</span></div>
                                                    <div className="flex items-center justify-between"><span className="text-[9px] font-black text-gray-400 uppercase">SGST</span><span className="text-[11px] font-black text-indigo-600">{p.sgstRate}%</span></div>
                                                    <div className="flex items-center justify-between"><span className="text-[9px] font-black text-gray-400 uppercase">IGST</span><span className="text-[11px] font-black text-orange-600">{p.igstRate}%</span></div>
                                                </div>
                                            </div>
                                            {p.description && <p className="text-[10px] font-bold text-gray-400 leading-relaxed italic line-clamp-2">" {p.description} "</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* TDS Profiles */}
                            {tdsProfiles.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white"><IndianRupee size={16} /></div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">TDS Protocols</h3>
                                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">{tdsProfiles.length} Configs</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {tdsProfiles.map(p => (
                                            <div key={p.profileId} className="bg-white rounded-[2rem] border p-8 transition-all hover:shadow-2xl group" style={{ borderColor: "var(--card-border)" }}>
                                                <div className="flex items-center justify-between mb-6">
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{p.name}</p>
                                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><Percent size={14} className="opacity-40" /></div>
                                                </div>
                                                <p className="text-5xl font-black text-orange-500 tracking-tighter mb-4">{p.rate}<span className="text-xl ml-1">%</span></p>
                                                {p.description && <p className="text-[11px] font-bold text-gray-400 italic line-clamp-2">Meta: {p.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Tax Profile Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-2xl w-full max-w-[480px] border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tax Synthesis</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Genetic Tax Profile Config</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Profile Descriptor</label>
                                <input className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="e.g. HIGH_RATE_GST_28" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Tax Ontology</label>
                                    <select className="w-full px-4 py-3 text-sm rounded-2xl border bg-gray-50 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        value={form.taxType} onChange={e => setForm({ ...form, taxType: e.target.value })}>
                                        <option>GST</option><option>TDS</option><option>Cess</option><option>Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Standard Rate (%)</label>
                                    <input type="number" className="w-full px-4 py-3 text-sm rounded-2xl border font-black text-teal-600 bg-teal-50/20 focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                        placeholder="0.00" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Governance Notes</label>
                                <textarea rows={3} className="w-full px-4 py-3 text-sm rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20" style={{ borderColor: "var(--card-border)" }}
                                    placeholder="Internal notes for this profile..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10 pt-4">
                            <button className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all font-mono" onClick={() => setShowModal(false)}>ABORT</button>
                            <button className="px-8 py-3 rounded-2xl text-sm font-black text-white bg-teal-600 shadow-xl shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all" onClick={handleCreate}>
                                DEPLOY PROFILE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
