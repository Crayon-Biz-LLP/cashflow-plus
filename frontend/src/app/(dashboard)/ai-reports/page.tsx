"use client";
import React from "react";
import Topbar from "@/components/Topbar";
import { api } from "@/lib/api";
import {
    Brain,
    TrendingUp,
    Zap,
    ArrowUpRight,
    DollarSign,
    AlertTriangle,
    Target,
    RefreshCw,
} from "lucide-react";

// Profit Margin AI response structure
interface ProfitMarginInfo {
    caseId: string;
    caseName: string;
    revenue: number;
    staffCostPerHour: number;
    totalHours: number;
    staffCost: number;
    expenses: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    riskLevel: "Low" | "Medium" | "High";
}

function formatINR(n: number) {
    return "₹" + n.toLocaleString("en-IN");
}

function getRiskBadge(risk: string) {
    switch (risk) {
        case "High":
            return "badge-danger";
        case "Medium":
            return "badge-warning";
        default:
            return "badge-teal";
    }
}

export default function AIReportsPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [profitData, setProfitData] = React.useState<ProfitMarginInfo[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [summary, setSummary] = React.useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getAIProfitMargins();
            const mapped = data.cases.map((c: any) => ({
                caseId: c.case_id,
                caseName: c.case_name,
                revenue: c.revenue,
                staffCostPerHour: c.staff_cost_per_hour,
                totalHours: c.total_hours,
                staffCost: c.staff_cost,
                expenses: c.expenses,
                totalCost: c.total_cost,
                profit: c.profit,
                profitMargin: c.profit_margin,
                riskLevel: c.risk_level,
            }));
            setProfitData(mapped);
            setSummary(data.summary);
        } catch (err) {
            console.error("Failed to load AI margins", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const totalRevenue = summary?.total_revenue || 0;
    const totalProfit = summary?.total_profit || 0;
    const avgMargin = summary?.average_margin || 0;
    const highRiskCount = summary?.high_risk_count || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Topbar
                title="AI Reports"
                subtitle="Profit Margin AI — Powered by Solv Prod Analytics Engine"
                onMenuToggle={onMenuToggle}
            />

            <div className="px-4 md:px-8 pb-8">
                {/* AI Engine Header */}
                <div
                    className="rounded-[2rem] p-6 mb-8"
                    style={{
                        background: "linear-gradient(135deg, var(--teal-50), var(--teal-100))",
                        border: "1px solid var(--teal-200)",
                    }}
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="p-3.5 rounded-2xl animate-pulse-teal shadow-lg shadow-teal-500/20"
                                style={{
                                    background: "rgba(13, 148, 136, 0.15)",
                                    border: "1px solid rgba(13, 148, 136, 0.3)",
                                }}
                            >
                                <Brain size={28} style={{ color: "var(--teal-400)" }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                    Intelligence Engine
                                </h2>
                                <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">
                                    Revenue - (Staff Cost + Fixed Expenses)
                                </p>
                            </div>
                        </div>
                        <button
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                            style={{
                                background: "white",
                                color: "var(--teal-700)",
                                border: "1px solid var(--teal-300)",
                            }}
                        >
                            <RefreshCw size={14} />
                            Recalculate Profitability
                        </button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        {[
                            {
                                label: "Total Revenue",
                                value: formatINR(totalRevenue),
                                icon: DollarSign,
                                color: "var(--teal-400)",
                            },
                            {
                                label: "Total Profit",
                                value: formatINR(totalProfit),
                                icon: TrendingUp,
                                color: "#34d399",
                            },
                            {
                                label: "Avg Margin",
                                value: `${avgMargin.toFixed(1)}%`,
                                icon: Target,
                                color: "var(--teal-300)",
                            },
                            {
                                label: "High Risk Cases",
                                value: `${highRiskCount}`,
                                icon: AlertTriangle,
                                color: "#ef4444",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="p-5 rounded-2xl group transition-all hover:bg-white"
                                style={{
                                    background: "rgba(255, 255, 255, 0.6)",
                                    border: "1px solid var(--teal-200)",
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <s.icon size={14} style={{ color: s.color }} />
                                    <span
                                        className="text-[10px] uppercase font-black tracking-widest text-gray-400"
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profit Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {profitData.map((c) => (
                        <div
                            key={c.caseId}
                            className="bg-white rounded-[2rem] border p-6 md:p-8 transition-all hover:shadow-xl group"
                            style={{
                                borderColor:
                                    c.riskLevel === "High"
                                        ? "var(--danger)"
                                        : "var(--card-border)",
                                borderLeftWidth: c.riskLevel === "High" ? "4px" : "1px",
                            }}
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className="font-mono text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100"
                                            style={{ color: "var(--teal-600)" }}
                                        >
                                            {c.caseId}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getRiskBadge(c.riskLevel)}`}>
                                            {c.riskLevel} Risk
                                        </span>
                                    </div>
                                    <h3
                                        className="text-xl font-black text-gray-900 tracking-tight"
                                    >
                                        {c.caseName}
                                    </h3>
                                </div>
                                <div className="text-left md:text-right">
                                    <p
                                        className="text-3xl font-black tracking-tighter"
                                        style={{
                                            color:
                                                c.profitMargin < 15
                                                    ? "var(--danger)"
                                                    : c.profitMargin < 25
                                                        ? "var(--warning)"
                                                        : "var(--teal-600)",
                                        }}
                                    >
                                        {c.profitMargin.toFixed(1)}%
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Profitability Score
                                    </p>
                                </div>
                            </div>

                            {/* Calculation Breakdown */}
                            <div className="overflow-x-auto no-scrollbar -mx-2">
                                <div
                                    className="inline-flex md:grid md:grid-cols-6 gap-6 p-6 rounded-2xl min-w-full"
                                    style={{ background: "var(--black-50)" }}
                                >
                                    {[
                                        { label: "Revenue", value: formatINR(c.revenue), color: "var(--teal-600)" },
                                        { label: "Staff Rate", value: `${formatINR(c.staffCostPerHour)}/hr`, color: "var(--foreground)" },
                                        { label: "Total Billing", value: `${c.totalHours} hrs`, color: "var(--foreground)" },
                                        { label: "Staff Payout", value: formatINR(c.staffCost), color: "var(--danger)" },
                                        { label: "Opex / Exp", value: formatINR(c.expenses), color: "var(--danger)" },
                                        { label: "Net Earnings", value: formatINR(c.profit), color: c.profit > 0 ? "var(--teal-600)" : "var(--danger)", bold: true },
                                    ].map((field) => (
                                        <div key={field.label} className="flex-shrink-0 min-w-[120px] md:min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-400">
                                                {field.label}
                                            </p>
                                            <p className={`text-sm ${field.bold ? "font-black" : "font-bold"}`} style={{ color: field.color }}>
                                                {field.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Margin Bar */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Efficiency Quotient
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
                                        {((c.totalCost / c.revenue) * 100).toFixed(1)}% cost leakage
                                    </span>
                                </div>
                                <div className="w-full h-4 rounded-full overflow-hidden p-1 shadow-inner" style={{ background: "var(--black-50)" }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 relative shadow-sm"
                                        style={{
                                            width: `${Math.min(
                                                (c.totalCost / c.revenue) * 100,
                                                100
                                            )}%`,
                                            background:
                                                c.profitMargin < 15
                                                    ? "linear-gradient(90deg, #ef4444, #f87171)"
                                                    : c.profitMargin < 25
                                                        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                                        : "linear-gradient(90deg, var(--teal-500), var(--teal-400))",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* API Reference */}
                <div
                    className="mt-10 rounded-[2rem] p-8"
                    style={{
                        background: "var(--black-50)",
                        border: "1px solid var(--black-200)",
                    }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-teal-100/50">
                            <Zap size={20} style={{ color: "var(--teal-400)" }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 tracking-tight">
                                Live Integration Interface
                            </h3>
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Analytics Payload Structure</p>
                        </div>
                    </div>
                    <pre
                        className="text-[11px] leading-relaxed overflow-x-auto p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100"
                        style={{ color: "var(--teal-700)", fontFamily: "var(--font-geist-mono)" }}
                    >
                        {`{
  "case_id": "JF-2024-001",
  "case_name": "Singh vs. Metro Corp",
  "profit_margin": 38.1,
  "risk_level": "Low",      // Threshold >30%
  "calculated_at": "2026-02-23T14:30:00Z",
  "meta": {
    "computation": "Revenue - Staff payout - Direct expenses",
    "engine": "Solv Prod AI v2.1"
  }
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

