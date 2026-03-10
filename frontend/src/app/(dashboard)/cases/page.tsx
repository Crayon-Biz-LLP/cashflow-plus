"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Topbar from "@/components/Topbar";
import {
    Plus,
    MoreHorizontal,
    Clock,
    User,
    Calendar,
    DollarSign,
    Tag,
    GripVertical,
} from "lucide-react";

type Stage = "New" | "Assigned" | "In Progress" | "Review" | "Closed";

const stageColors: Record<Stage, string> = {
    New: "var(--info)",
    Assigned: "var(--black-500)",
    "In Progress": "var(--teal-600)",
    Review: "var(--warning)",
    Closed: "var(--success)",
};

const priorityBadge: Record<string, string> = {
    Critical: "badge-danger",
    High: "badge-warning",
    Medium: "badge-info",
    Low: "badge-neutral",
};

import NewCaseModal from "@/components/NewCaseModal";

export default function CasesPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [cases, setCases] = useState<Record<Stage, any[]>>({
        New: [],
        Assigned: [],
        "In Progress": [],
        Review: [],
        Closed: [],
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const stages: Stage[] = ["New", "Assigned", "In Progress", "Review", "Closed"];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allCases = await api.getCases();
            const grouped = allCases.reduce((acc: any, c: any) => {
                const stage = c.stage as Stage;
                if (!acc[stage]) acc[stage] = [];
                acc[stage].push({
                    id: c.caseId,
                    title: c.title,
                    client: c.client,
                    assignee: "AK", // Placeholder
                    avatarClass: "avatar-teal",
                    priority: c.priority,
                    amount: `₹${c.amount.toLocaleString("en-IN")}`,
                    dueDate: c.dueDate ? new Date(c.dueDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }) : "No date",
                    tags: c.tags || [],
                });
                return acc;
            }, {
                New: [],
                Assigned: [],
                "In Progress": [],
                Review: [],
                Closed: [],
            });
            setCases(grouped);
        } catch (error) {
            console.error("Failed to load cases:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStage = async (caseId: string, newStage: Stage) => {
        try {
            await api.updateCaseStage(caseId, newStage);
            await loadData();
        } catch (error) {
            console.error("Failed to update stage:", error);
        }
    };

    return (
        <div>
            <Topbar
                title="Cases"
                subtitle="Manage your case pipeline with drag & drop"
                onMenuToggle={onMenuToggle}
            />

            <div className="px-4 md:px-8 pb-8">
                {/* Pipeline Summary */}
                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {stages.map((stage) => (
                        <div
                            key={stage}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0"
                            style={{
                                background: "white",
                                border: "1px solid var(--card-border)",
                            }}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: stageColors[stage] }}
                            />
                            <span className="text-xs font-semibold" style={{ color: "var(--black-600)" }}>
                                {stage}
                            </span>
                            <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                                style={{
                                    background: "var(--black-100)",
                                    color: "var(--black-700)",
                                }}
                            >
                                {cases[stage].length}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Kanban Board */}
                <div className="kanban-container overflow-x-auto pb-4">
                    <div className="flex gap-6" style={{ minWidth: "1200px" }}>
                        {stages.map((stage) => (
                            <div key={stage} className="kanban-column flex-1 min-w-[240px]">
                                <div className="kanban-column-header mb-4 sticky top-0 bg-transparent py-2">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ background: stageColors[stage] }}
                                        />
                                        <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                                            {stage}
                                        </span>
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded-md"
                                            style={{
                                                background: "var(--black-200)",
                                                color: "var(--black-600)",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {cases[stage].length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="p-1 rounded-md transition-colors hover:bg-white ml-auto"
                                    >
                                        <Plus size={14} style={{ color: "var(--black-400)" }} />
                                    </button>
                                </div>

                                {/* Cards */}
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="p-4 bg-white/50 rounded-xl animate-pulse h-32" />
                                    ) : cases[stage].map((c) => (
                                        <div key={c.id} className="pipeline-card group">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="font-mono text-[10px] font-bold text-black-400">
                                                    {c.id}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1 hover:bg-black-100 rounded-lg">
                                                        <MoreHorizontal size={14} className="text-black-400" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h4 className="text-sm font-bold mb-1 leading-tight" style={{ color: "var(--foreground)" }}>
                                                {c.title}
                                            </h4>
                                            <p className="text-[11px] mb-4 font-medium" style={{ color: "var(--black-500)" }}>
                                                {c.client}
                                            </p>

                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`badge ${priorityBadge[c.priority]}`} style={{ fontSize: "0.6rem" }}>
                                                    {c.priority}
                                                </span>
                                                <span className="text-xs font-bold text-teal-600">
                                                    {c.amount}
                                                </span>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {c.tags.map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                                                        style={{
                                                            background: "var(--black-50)",
                                                            color: "var(--black-400)",
                                                            border: "1px solid var(--black-100)"
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px dashed var(--black-100)" }}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`avatar ${c.avatarClass}`} style={{ width: 22, height: 22, fontSize: "0.55rem" }}>
                                                        {c.assignee}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={10} className="text-black-400" />
                                                        <span className="text-[10px] font-medium text-black-400">
                                                            {c.dueDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <NewCaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
            />
        </div>
    );
}
