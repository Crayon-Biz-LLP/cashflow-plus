"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Topbar from "@/components/Topbar";
import InviteMemberModal from "@/components/InviteMemberModal";
import EditMemberModal from "@/components/EditMemberModal";
import {
    Plus,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Mail,
    Phone,
    MoreHorizontal,
    Edit,
    UserPlus,
    Clock,
    Briefcase,
} from "lucide-react";

type Role = "Admin" | "Manager" | "Staff";

interface TeamMember {
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    initials: string;
    avatarClass: string;
    activeCases: number;
    totalHours: number;
    status: "Active" | "Away" | "Offline";
}



const roleConfig: Record<
    Role,
    { icon: React.ElementType; color: string; bg: string; desc: string }
> = {
    Admin: {
        icon: ShieldCheck,
        color: "var(--teal-600)",
        bg: "var(--teal-50)",
        desc: "Full access to all systems",
    },
    Manager: {
        icon: Shield,
        color: "var(--info)",
        bg: "var(--info-light)",
        desc: "Case management & team oversight",
    },
    Staff: {
        icon: ShieldAlert,
        color: "var(--black-500)",
        bg: "var(--black-100)",
        desc: "Case-level access only",
    },
};

const statusColors: Record<string, string> = {
    Active: "var(--teal-500)",
    Away: "var(--warning)",
    Offline: "var(--black-300)",
};

export default function TeamPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [team, setTeam] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<string>("All");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        setIsLoading(true);
        try {
            const data = await api.getTeam();
            setTeam(data);
        } catch (error) {
            console.error("Failed to load team:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarClass = (id: string) => {
        const classes = ["avatar-teal", "avatar-blue", "avatar-purple", "avatar-amber", "avatar-indigo"];
        // Simple hash based on id
        const index = id ? id.charCodeAt(id.length - 1) % classes.length : 0;
        return classes[index];
    };

    const filtered =
        roleFilter === "All"
            ? team
            : team.filter((m) => m.role === roleFilter);

    // Derived stats
    const adminCount = team.filter((m) => m.role === "Admin").length;
    const managerCount = team.filter((m) => m.role === "Manager").length;
    const staffCount = team.filter((m) => m.role === "Staff").length;

    const roleCounts: Record<string, number> = {
        Admin: adminCount,
        Manager: managerCount,
        Staff: staffCount
    };

    const handleEditMember = (member: any) => {
        setSelectedMember(member);
        setIsEditModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50/30">
            <Topbar title="Team Settings" subtitle="Manage roles, permissions, and team members" onMenuToggle={onMenuToggle} />

            <div className="px-4 md:px-8 pb-8">
                {/* Role Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    {(["Admin", "Manager", "Staff"] as Role[]).map((role) => {
                        const rc = roleConfig[role];
                        const count = team.filter((m) => m.role === role).length;
                        return (
                            <div
                                key={role}
                                className="stat-card cursor-pointer transition-all hover:shadow-md"
                                onClick={() =>
                                    setRoleFilter(roleFilter === role ? "All" : role)
                                }
                                style={{
                                    borderColor:
                                        roleFilter === role
                                            ? rc.color
                                            : "var(--card-border)",
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 rounded-xl" style={{ background: rc.bg }}>
                                        <rc.icon size={20} style={{ color: rc.color }} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                                            {roleCounts[role] || 0}
                                        </p>
                                        <p className="text-xs font-medium" style={{ color: "var(--black-500)" }}>
                                            {role}s
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs" style={{ color: "var(--black-400)" }}>
                                    {rc.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <p className="text-sm font-semibold" style={{ color: "var(--black-500)" }}>
                        {filtered.length} team members
                    </p>
                    <button
                        className="btn-primary"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <UserPlus size={14} />
                        Invite Member
                    </button>
                </div>

                <InviteMemberModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSuccess={loadTeam}
                />

                <EditMemberModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedMember(null);
                    }}
                    onSuccess={loadTeam}
                    member={selectedMember}
                />

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {isLoading ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 animate-pulse">
                                <div className="w-8 h-8 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                <p className="text-sm font-medium">Loading team members...</p>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center text-gray-400">
                            No team members found for this role.
                        </div>
                    ) : (
                        filtered.map((member) => {
                            const rc = roleConfig[member.role as Role] || roleConfig.Staff;
                            const avatarClass = getAvatarClass(member.userId);
                            const initials = getInitials(member.name);
                            return (
                                <div
                                    key={member.userId}
                                    className="glass-card p-6 group hover:border-teal-500/30 transition-all duration-300"
                                    style={{
                                        background: "white",
                                        border: "1px solid var(--card-border)",
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div
                                                    className={`avatar ${avatarClass}`}
                                                    style={{ width: 48, height: 48, fontSize: "1rem" }}
                                                >
                                                    {initials}
                                                </div>
                                                <div
                                                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                                                    style={{
                                                        background: statusColors[member.status || "Active"],
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                                                    {member.name}
                                                </p>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: rc.bg,
                                                        color: rc.color,
                                                        fontSize: "0.65rem",
                                                    }}
                                                >
                                                    <rc.icon size={10} />
                                                    {member.role}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                                            onClick={() => handleEditMember(member)}
                                        >
                                            <MoreHorizontal size={16} style={{ color: "var(--black-400)" }} />
                                        </button>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} style={{ color: "var(--black-400)" }} />
                                            <span className="text-xs truncate" style={{ color: "var(--black-500)" }}>
                                                {member.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={12} style={{ color: "var(--black-400)" }} />
                                            <span className="text-xs" style={{ color: "var(--black-500)" }}>
                                                {member.phone || "No phone added"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div
                                        className="flex items-center gap-4 p-3 rounded-xl transition-colors group-hover:bg-teal-50/50"
                                        style={{ background: "var(--black-50)" }}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase size={12} style={{ color: "var(--teal-600)" }} />
                                            <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                                                {member.activeCases || 0}
                                            </span>
                                            <span className="text-[10px]" style={{ color: "var(--black-400)" }}>
                                                cases
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} style={{ color: "var(--warning)" }} />
                                            <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                                                {member.totalHours || 0}h
                                            </span>
                                            <span className="text-[10px]" style={{ color: "var(--black-400)" }}>
                                                logged
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
