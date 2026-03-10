"use client";

import React, { useRef } from "react";
import { X, Download, Printer, Share2, Mail, Landmark, CheckCircle2, ShieldCheck, FileText } from "lucide-react";

interface InvoicePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: any;
}

export default function InvoicePreviewModal({ isOpen, onClose, invoice }: InvoicePreviewModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !invoice) return null;

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amt);
    };

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${invoice.invoiceId}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Plus Jakarta Sans', sans-serif; }
                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="p-8">
                        ${content.innerHTML}
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 italic tracking-tight">Invoice Preview</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{invoice.invoiceId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 transition-all">
                            <Printer size={14} /> PRINT
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-black text-xs hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">
                            <Download size={14} /> PDF
                        </button>
                        <div className="w-[1px] h-6 bg-gray-200 mx-2" />
                        <button onClick={onClose} className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100/30">
                    <div ref={printRef} className="bg-white min-h-[1000px] w-full max-w-[800px] mx-auto shadow-2xl rounded-[3rem] p-12 relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-60" />

                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-gray-900/20 rotate-3 group-hover:rotate-0 transition-transform">
                                        SP
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">SolvProd <span className="text-teal-600">.</span></h1>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-900">SolvProd Solutions Pvt. Ltd.</p>
                                    <p className="text-[11px] font-medium text-gray-500">Guindy, Chennai</p>
                                    <p className="text-[11px] font-medium text-gray-500">Tamil Nadu, India - 600032</p>
                                    <p className="text-[11px] font-bold text-teal-600 mt-2 uppercase tracking-widest">GSTIN: 07AAACS1234F1Z5</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-6xl font-black text-gray-100 absolute top-12 right-12 select-none tracking-tighter opacity-10">INVOICE</h2>
                                <div className="relative z-10">
                                    <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-1">Invoice Number</p>
                                    <p className="text-2xl font-black text-gray-900 font-mono tracking-tight underline decoration-teal-500/30 underline-offset-8">{invoice.invoiceId}</p>

                                    <div className="grid grid-cols-2 gap-8 mt-10">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-right">Date Issued</p>
                                            <p className="text-xs font-bold text-gray-900 text-right">{new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-right">Due Date</p>
                                            <p className="text-xs font-bold text-gray-900 text-right text-rose-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-12" />

                        {/* Bill To & Details */}
                        <div className="grid grid-cols-12 gap-12 mb-16 relative z-10">
                            <div className="col-span-7">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em] mb-4">Client Information</p>
                                <div className="p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100 backdrop-blur-sm">
                                    <h3 className="text-xl font-black text-gray-900 mb-2 truncate">{invoice.client}</h3>
                                    <p className="text-xs font-medium text-gray-500 mb-4 leading-relaxed">Consultancy services for project coordination and legal drafting for current matter.</p>
                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck size={14} className="text-teal-600" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Verified Client</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 size={14} className="text-teal-600" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Matter</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-5 flex flex-col justify-end">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matter ID</span>
                                        <span className="text-xs font-black text-gray-900 font-mono tracking-wider">{invoice.caseId}</span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${invoice.status === 'Paid' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Currency</span>
                                        <span className="text-xs font-black text-gray-900 uppercase">INR (₹)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-12 relative z-10">
                            <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden bg-white shadow-xl shadow-gray-200/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-900 text-white">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        <tr>
                                            <td className="px-8 py-10">
                                                <p className="text-sm font-black text-gray-900 mb-1">{invoice.title || "Legal Consulting Fees"}</p>
                                                <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-sm">Professional services rendered for the period of Feb 2026. This includes documentation, filing, and expert consultancy for matter ${invoice.caseId}.</p>
                                            </td>
                                            <td className="px-8 py-10 text-right">
                                                <span className="text-lg font-black text-gray-900 font-mono">{formatCurrency(invoice.amount)}</span>
                                            </td>
                                        </tr>
                                        {/* Blank rows to give classic invoice feel but modern */}
                                        <tr className="bg-gray-50/30">
                                            <td className="px-8 py-8" />
                                            <td className="px-8 py-8" />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="flex justify-end mb-16 relative z-10">
                            <div className="w-full max-w-sm space-y-4">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-sm font-black text-gray-900 font-mono">{formatCurrency(invoice.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">GST (18%)</span>
                                    <span className="text-sm font-black text-gray-900 font-mono">{formatCurrency(invoice.gst)}</span>
                                </div>
                                <div className="h-[1px] w-full bg-gray-100" />
                                <div className="flex justify-between items-center p-6 rounded-3xl bg-gray-900 shadow-2xl shadow-gray-900/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-teal-500/30 transition-all" />
                                    <span className="text-sm font-black text-white italic uppercase tracking-widest relative z-10">Grand Total</span>
                                    <span className="text-2xl font-black text-teal-400 font-mono tracking-tighter relative z-10">{formatCurrency(invoice.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment & Footer */}
                        <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-100 relative z-10">
                            <div>
                                <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <Landmark size={14} /> Settlement Details
                                </h4>
                                <div className="space-y-2 p-6 rounded-3xl bg-gray-50/50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bank Account</p>
                                    <p className="text-xs font-bold text-gray-900">HDFC Bank • •••• 4590</p>
                                    <p className="text-[10px] font-medium text-gray-500">Beneficiary: SolvProd Solutions</p>
                                    <p className="text-[10px] font-medium text-gray-500">IFSC: HDFC0001234</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end text-right">
                                <div className="flex items-center gap-2 justify-end mb-4">
                                    <ShieldCheck size={16} className="text-teal-600" />
                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Digitally Signed & Verified</p>
                                </div>
                                <p className="text-[10px] font-medium text-gray-500 leading-relaxed italic">
                                    This is a computer-generated invoice. No signature is required under GST Rule 46.
                                    For any queries, contact support@solvprod.tech
                                </p>
                            </div>
                        </div>

                        {/* Bottom Decoration */}
                        <div className="mt-16 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[1em]">THANKS FOR YOUR BUSINESS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
