"use client";

import React, { useState } from "react";
import { X, Loader2, UserPlus, Mail, Phone, Shield } from "lucide-react";
import { api } from "@/lib/api";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function InviteMemberModal({ isOpen, onClose, onSuccess }: InviteMemberModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "Staff",
        password: "password123", // Default password for now as it's an "invite"
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.signup(formData);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: "",
                email: "",
                phone: "",
                role: "Staff",
                password: "password123",
            });
        } catch (error: any) {
            console.error("Failed to invite member:", error);
            alert(error.message || "Failed to invite member. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-black-50 flex items-center justify-between bg-black-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-600 text-white rounded-xl">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Invite Team Member</h3>
                            <p className="text-xs text-black-400">Add a new collaborator to your organization</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-black-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300">
                                    <UserPlus size={16} />
                                </span>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    className="input-field w-full pl-11"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300" />
                                <input
                                    required
                                    type="email"
                                    placeholder="rahul@example.com"
                                    className="input-field w-full pl-11"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Phone Number</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300" />
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    className="input-field w-full pl-11"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Assign Role</label>
                            <div className="relative">
                                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300" />
                                <select
                                    className="input-field w-full pl-11 appearance-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Admin">Admin (Full Access)</option>
                                    <option value="Manager">Manager (Case Management)</option>
                                    <option value="Staff">Staff (Case Access)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-sm bg-black-50 text-black-600 hover:bg-black-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-sm bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                            {loading ? "Inviting..." : "Invite Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
