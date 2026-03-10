"use client";

import React, { useState, useEffect } from "react";
import { api, fetchWithAuth } from "@/lib/api";
import Topbar from "@/components/Topbar";
import {
    Plus,
    Download,
    Send,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Calendar,
    IndianRupee,
    FileText,
    MoreHorizontal,
    Eye,
    CheckCircle,
    Edit2,
    Trash2,
} from "lucide-react";

const statusConfig: Record<
    string,
    { icon: React.ElementType; color: string; bg: string; badgeClass: string }
> = {
    Paid: {
        icon: CheckCircle2,
        color: "var(--teal-700)",
        bg: "var(--teal-50)",
        badgeClass: "badge-teal",
    },
    Sent: {
        icon: Send,
        color: "var(--info)",
        bg: "var(--info-light)",
        badgeClass: "badge-info",
    },
    Overdue: {
        icon: AlertTriangle,
        color: "var(--danger)",
        bg: "var(--danger-light)",
        badgeClass: "badge-danger",
    },
    Draft: {
        icon: Clock,
        color: "var(--black-500)",
        bg: "var(--black-100)",
        badgeClass: "badge-neutral",
    },
};

import NewInvoiceModal from "@/components/NewInvoiceModal";
import SettlePaymentModal from "@/components/SettlePaymentModal";
import InvoicePreviewModal from "@/components/InvoicePreviewModal";

export default function InvoicesPage({ onMenuToggle }: { onMenuToggle?: () => void }) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            const data = await api.getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error("Failed to load invoices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordPayment = (inv: any) => {
        setSelectedInvoice(inv);
        setIsPayModalOpen(true);
    };

    const handleViewInvoice = (inv: any) => {
        setSelectedInvoice(inv);
        setIsPreviewOpen(true);
    };

    const confirmPayment = async (bankAccountId: string) => {
        if (!selectedInvoice) return;
        try {
            await api.updateInvoiceStatus(selectedInvoice.invoiceId, "Paid", bankAccountId);

            // Automated payment clear alert
            try {
                await fetchWithAuth("/notifications/invoice-paid-alert", {
                    method: "POST",
                    body: JSON.stringify({
                        invoiceId: selectedInvoice.invoiceId,
                        amount: selectedInvoice.total,
                        client: selectedInvoice.client
                    })
                });
            } catch (notifyErr) {
                console.warn("Failed to send payment notification:", notifyErr);
            }

            await loadInvoices();
        } catch (error) {
            console.error("Failed to record payment:", error);
            alert("Failed to record payment");
        }
    };

    const filtered =
        filterStatus === "All"
            ? invoices
            : invoices.filter((inv) => inv.status === filterStatus);

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amt);
    };

    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
    const paidAmount = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = totalInvoiced - paidAmount;

    return (
        <div>
            <Topbar title="Invoices" subtitle="Manage GST-ready invoices & billing" onMenuToggle={onMenuToggle} />

            <div className="px-4 md:px-8 pb-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    {[
                        {
                            label: "Total Invoiced",
                            value: formatCurrency(totalInvoiced),
                            icon: IndianRupee,
                            color: "var(--teal-600)",
                            bg: "var(--teal-50)",
                        },
                        {
                            label: "Total Paid",
                            value: formatCurrency(paidAmount),
                            icon: CheckCircle2,
                            color: "var(--success)",
                            bg: "var(--teal-50)",
                        },
                        {
                            label: "Pending Receipt",
                            value: formatCurrency(pendingAmount),
                            icon: Clock,
                            color: "var(--warning)",
                            bg: "var(--warning-light)",
                        },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl" style={{ background: s.bg }}>
                                    <s.icon size={20} style={{ color: s.color }} />
                                </div>
                                <div>
                                    <p
                                        className="text-xl font-bold"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        {s.value}
                                    </p>
                                    <p
                                        className="text-xs font-medium"
                                        style={{ color: "var(--black-500)" }}
                                    >
                                        {s.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {["All", "Paid", "Sent", "Overdue", "Draft"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{
                                    background:
                                        filterStatus === status ? "var(--teal-600)" : "white",
                                    color:
                                        filterStatus === status ? "white" : "var(--black-600)",
                                    border: `1px solid ${filterStatus === status
                                        ? "var(--teal-600)"
                                        : "var(--card-border)"
                                        }`,
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="btn-secondary" style={{ fontSize: "0.75rem" }}>
                            <Download size={14} />
                            Export
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary"
                            style={{ fontSize: "0.75rem" }}
                        >
                            <Plus size={14} />
                            New Invoice
                        </button>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="runway-card overflow-x-auto no-scrollbar">
                    <table className="data-table min-w-[1000px]">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client & Description</th>
                                <th>Case ID</th>
                                <th>Amount</th>
                                <th>GST (18%)</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 animate-pulse">
                                            <div className="w-8 h-8 border-3 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                                            <p className="text-sm font-medium">Fetching invoices...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-black-400">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : filtered.map((inv) => {
                                const sc = statusConfig[inv.status] || statusConfig.Draft;
                                return (
                                    <tr key={inv._id || inv.invoiceId}>
                                        <td>
                                            <span
                                                className="font-mono text-xs font-semibold"
                                                style={{ color: "var(--teal-600)" }}
                                            >
                                                {inv.invoiceId}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                                    {inv.client}
                                                </p>
                                                <p className="text-xs" style={{ color: "var(--black-400)" }}>
                                                    {inv.title}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className="font-mono text-xs"
                                                style={{ color: "var(--black-500)" }}
                                            >
                                                {inv.caseId}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-semibold">{formatCurrency(inv.amount)}</span>
                                        </td>
                                        <td>
                                            <span
                                                className="text-xs"
                                                style={{ color: "var(--black-500)" }}
                                            >
                                                {formatCurrency(inv.gst)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-bold" style={{ color: "var(--foreground)" }}>
                                                {formatCurrency(inv.total)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${sc.badgeClass}`}>
                                                <sc.icon size={10} />
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {inv.status !== "Paid" && (
                                                    <button
                                                        onClick={() => handleRecordPayment(inv)}
                                                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-teal-600 text-white rounded-lg flex items-center gap-1.5 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-700/10 mr-1"
                                                    >
                                                        <CheckCircle size={12} />
                                                        Record
                                                    </button>
                                                )}

                                                <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                    <button
                                                        title="Quick View"
                                                        onClick={() => handleViewInvoice(inv)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-white transition-all duration-200"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        title="Edit Invoice"
                                                        onClick={() => alert(`Opening editor for invoice ${inv.invoiceId}`)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-white transition-all duration-200"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        onClick={async () => {
                                                            if (confirm("Are you sure you want to delete this invoice?")) {
                                                                try {
                                                                    await api.deleteInvoice(inv.invoiceId);
                                                                    await loadInvoices();
                                                                } catch (err) {
                                                                    alert("Failed to delete invoice");
                                                                }
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-all duration-200"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <NewInvoiceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadInvoices}
                />

                <SettlePaymentModal
                    isOpen={isPayModalOpen}
                    onClose={() => setIsPayModalOpen(false)}
                    onConfirm={confirmPayment}
                    items={selectedInvoice ? [selectedInvoice] : []}
                    type="Income"
                    title="Record Receipt"
                    description="Select the bank account where this payment was deposited."
                />

                <InvoicePreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    invoice={selectedInvoice}
                />
            </div>
        </div>
    );
}
