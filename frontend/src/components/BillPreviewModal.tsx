"use client";

import React, { useRef } from "react";
import { X, Download, Printer, Landmark, FileText, ShoppingCart, User, Calendar, Receipt } from "lucide-react";

interface BillPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: any;
}

export default function BillPreviewModal({ isOpen, onClose, bill: rawBill }: BillPreviewModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !rawBill) return null;

    // Normalize bill/expense data
    const bill = {
        ...rawBill,
        billId: rawBill.billId || rawBill.expenseId,
        vendorName: rawBill.vendorName || "REIMBURSEMENT / CASE EXPENSE",
        vendorId: rawBill.vendorId || rawBill.loggedBy || "INTERNAL",
        total: rawBill.total || rawBill.totalWithGst || rawBill.amount,
        description: rawBill.description || rawBill.category || "General Expense",
        items: rawBill.items || []
    };

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
                    <title>Bill Voucher - ${bill.billId}</title>
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
                        <div className="p-2.5 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-600/20">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 italic tracking-tight">Bill Voucher</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bill.billId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 transition-all">
                            <Printer size={14} /> PRINT
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all">
                            <Download size={14} /> EXPORT
                        </button>
                        <div className="w-[1px] h-6 bg-gray-200 mx-2" />
                        <button onClick={onClose} className="p-2.5 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Bill Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100/30 font-sans">
                    <div ref={printRef} className="bg-white min-h-[900px] w-full max-w-[800px] mx-auto shadow-2xl rounded-[3rem] p-12 relative overflow-hidden">
                        {/* Decorative Stripe */}
                        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500" />

                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-16 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-8 py-2 px-4 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
                                    <ShoppingCart size={14} className="text-orange-600" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Internal Purchase Voucher</span>
                                </div>
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2 italic">PAYABLE<span className="text-orange-500">.</span></h1>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Transaction ID: <span className="text-gray-900 font-mono">{bill.billId}</span></p>
                            </div>
                            <div className="text-right">
                                <div className="p-6 rounded-[2.5rem] bg-gray-900 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500 rounded-full -mr-12 -mt-12 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Amount Due</p>
                                    <p className="text-3xl font-black font-mono text-orange-400">{formatCurrency(bill.total)}</p>
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <div className={`w-2 h-2 rounded-full ${bill.status === 'Paid' ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{bill.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-16">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User size={14} className="text-orange-500" /> Vendor Details
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-gray-900">{bill.vendorName}</p>
                                    <p className="text-sm font-medium text-gray-500">Payee ID: {bill.vendorId}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Fulfillment Details</p>
                                    <p className="text-sm font-medium text-gray-600">Goods/Services received as per purchase order. Verified by operations team.</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calendar size={14} className="text-orange-500" /> Timeline
                                </h3>
                                <div className="space-y-4 text-right">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Recorded</p>
                                        <p className="text-sm font-bold text-gray-900">{new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Due</p>
                                        <p className="text-sm font-black text-rose-600">{new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Table */}
                        <div className="mb-12 relative z-10">
                            <div className="rounded-[2.5rem] border border-gray-100 overflow-hidden bg-white shadow-xl shadow-gray-200/20">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-900">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Particulars / Description</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(bill.items && bill.items.length > 0) ? (
                                            bill.items.map((item: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="px-8 py-8">
                                                        <p className="text-sm font-black text-gray-900 mb-1">{item.description}</p>
                                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Qty: {item.quantity} • Rate: {formatCurrency(item.rate)}</p>
                                                    </td>
                                                    <td className="px-8 py-8 text-right font-black text-gray-900 font-mono">
                                                        {formatCurrency(item.amount)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-8 py-10">
                                                    <p className="text-sm font-black text-gray-900 mb-1">{bill.description || "Vendor Bill Execution"}</p>
                                                    <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-sm">Professional services rendered/Goods supplied as per the attached invoice from the vendor.</p>
                                                </td>
                                                <td className="px-8 py-10 text-right font-black text-gray-900 font-mono">
                                                    {formatCurrency(bill.amount)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-50/50">
                                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Value</td>
                                            <td className="px-8 py-6 text-right font-bold text-gray-900 font-mono text-sm">{formatCurrency(bill.amount)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Tax Provision (GST 18%)</td>
                                            <td className="px-8 py-6 text-right font-bold text-gray-900 font-mono text-sm">{formatCurrency(bill.gst)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Official Notes */}
                        <div className="grid grid-cols-12 gap-12 pt-12 border-t border-gray-100 relative z-10">
                            <div className="col-span-8">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Official Notes</h4>
                                <div className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 text-[11px] font-medium text-gray-600 leading-relaxed">
                                    This purchase voucher is an internal document used for tracking accounts payable.
                                    Payment should be released to the vendor's registered bank account only after primary invoice verification.
                                    For audit purposes, keep the original vendor bill attached to this voucher.
                                </div>
                            </div>
                            <div className="col-span-4 flex flex-col items-end justify-end">
                                <div className="w-full h-16 border-b-2 border-dashed border-gray-200 mb-2" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorised Signature</p>
                            </div>
                        </div>

                        {/* Footer Logo */}
                        <div className="mt-20 flex justify-center opacity-20 filter grayscale">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-xs">SP</div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tighter italic">SolvProd <span className="text-teal-600">.</span></h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
