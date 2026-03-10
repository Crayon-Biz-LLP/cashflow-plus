"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import { Settings, Building2, Mail, Phone, MapPin, Save, CheckCircle } from "lucide-react";

export default function SettingsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => { load(); }, []);
    async function load() {
        try { setForm(await api.getSettings()); } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    async function handleSave() {
        try {
            await api.updateSettings(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e: any) { alert(e.message); }
    }

    const fields: { label: string; key: string; icon?: any; type?: string; span?: number }[] = [
        { label: "Company Name", key: "companyName", icon: Building2 },
        { label: "Legal Name", key: "legalName" },
        { label: "GSTIN", key: "gstin" },
        { label: "PAN", key: "pan" },
        { label: "Email", key: "email", icon: Mail },
        { label: "Phone", key: "phone", icon: Phone },
        { label: "Address", key: "address", icon: MapPin, span: 2 },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "PIN Code", key: "pincode" },
        { label: "Country", key: "country" },
        { label: "Currency", key: "currency" },
        { label: "FY Start Month", key: "financialYearStart" },
        { label: "GST Rate (%)", key: "taxRate", type: "number" },
        { label: "Invoice Prefix", key: "invoicePrefix" },
        { label: "Bill Prefix", key: "billPrefix" },
    ];

    return (
        <div>
            <Topbar title="Company Settings" subtitle="Organization profile and accounting preferences" onMenuToggle={onMenuToggle} />
            <div className="px-4 md:px-8 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "var(--teal-500)", borderTopColor: "transparent" }} /></div>
                ) : (
                    <div className="bg-white rounded-2xl border p-6 md:p-8" style={{ borderColor: "var(--card-border)", maxWidth: 800 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl" style={{ background: "var(--teal-50)" }}><Settings size={20} style={{ color: "var(--teal-600)" }} /></div>
                            <div>
                                <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Organization Profile</h2>
                                <p className="text-xs" style={{ color: "var(--black-400)" }}>These details appear on invoices and financial reports</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fields.map(f => (
                                <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
                                    <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--black-500)" }}>{f.label}</label>
                                    <input
                                        type={f.type || "text"}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none"
                                        style={{ borderColor: "var(--card-border)" }}
                                        value={form[f.key] || ""}
                                        onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? parseFloat(e.target.value) : e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: "var(--black-100)" }}>
                            {saved && (
                                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--teal-600)" }}>
                                    <CheckCircle size={14} /> Saved
                                </span>
                            )}
                            <button className="btn-primary" style={{ fontSize: "0.75rem" }} onClick={handleSave}>
                                <Save size={14} /> Save Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
