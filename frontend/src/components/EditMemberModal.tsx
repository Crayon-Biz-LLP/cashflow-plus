"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Edit, Mail, Phone, Shield, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    member: any;
}

export default function EditMemberModal({ isOpen, onClose, onSuccess, member }: EditMemberModalProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "Staff",
        status: "Active",
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || "",
                email: member.email || "",
                phone: member.phone || "",
                role: member.role || "Staff",
                status: member.status || "Active",
            });
        }
    }, [member]);

    if (!isOpen || !member) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateTeamMember(member.userId, formData);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to update member:", error);
            alert(error.message || "Failed to update member.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) return;

        setDeleting(true);
        try {
            await api.deleteTeamMember(member.userId);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to delete member:", error);
            alert(error.message || "Failed to delete member.");
        } finally {
            setDeleting(false);
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
                        <div className="p-2 bg-info text-white rounded-xl">
                            <Edit size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Edit Team Member</h3>
                            <p className="text-xs text-black-400">Update permissions and profile details</p>
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
                            <input
                                required
                                type="text"
                                className="input-field w-full"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Role</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Staff">Staff</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Status</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Away">Away</option>
                                    <option value="Offline">Offline</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black-400 mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black-300" />
                                <input
                                    required
                                    type="email"
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
                                    className="input-field w-full pl-11"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                            {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            Delete
                        </button>
                        <div className="flex-1 flex gap-3">
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
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Edit size={18} />}
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
