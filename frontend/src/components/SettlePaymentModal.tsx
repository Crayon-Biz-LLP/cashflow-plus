"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, IndianRupee, Landmark, Loader2, Wallet, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface SettlePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bankAccountId: string) => Promise<void>;
    items: any[];
    type: "Income" | "Expense";
    title?: string;
    description?: string;
}

export default function SettlePaymentModal({
    isOpen,
    onClose,
    onConfirm,
    items,
    type,
    title,
    description
}: SettlePaymentModalProps) {
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [selectedBankId, setSelectedBankId] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            api.getBankAccounts().then(data => {
                setBankAccounts(data);
                if (data.length > 0) setSelectedBankId(data[0].bankAccountId);
            }).finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const totalAmount = items.reduce((s, i) => s + (i.total || i.totalWithGst || i.amount || 0), 0);

    const handleConfirm = async () => {
        if (!selectedBankId) return;
        setSubmitting(true);
        try {
            await onConfirm(selectedBankId);
            onClose();
        } catch (error) {
            console.error("Settlement failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedBank = bankAccounts.find(b => b.bankAccountId === selectedBankId);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-black-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${type === 'Income' ? 'bg-teal-500 text-white' : 'bg-rose-500 text-white'}`}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">{title || 'Settle Payment'}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Verification</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-black-50 rounded-2xl transition-all">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Amount Summary */}
                    <div className={`p-6 rounded-3xl border ${type === 'Income' ? 'bg-teal-50/50 border-teal-100' : 'bg-rose-50/50 border-rose-100'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Total {type === 'Income' ? 'to Receive' : 'to Pay'}</p>
                        <p className={`text-4xl font-mono font-black ${type === 'Income' ? 'text-teal-600' : 'text-rose-600'} tabular-nums`}>
                            ₹{totalAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs font-bold text-gray-400 mt-2 italic">
                            Processing {items.length} dynamic record(s)
                        </p>
                    </div>

                    {/* Bank Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black-400">Settlement Account</label>
                            {selectedBank && (
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                                    Bal: ₹{selectedBank.currentBalance.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {loading ? (
                                <div className="h-20 flex items-center justify-center animate-pulse bg-gray-50 rounded-2xl">
                                    <Loader2 className="animate-spin text-teal-500" size={24} />
                                </div>
                            ) : (
                                bankAccounts.map(account => (
                                    <button
                                        key={account.bankAccountId}
                                        onClick={() => setSelectedBankId(account.bankAccountId)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedBankId === account.bankAccountId
                                                ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/10"
                                                : "border-black-50 hover:border-black-100 bg-white"
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl ${selectedBankId === account.bankAccountId ? 'bg-teal-500 text-white' : 'bg-black-100 text-black-400'}`}>
                                            <Landmark size={18} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`text-sm font-bold ${selectedBankId === account.bankAccountId ? 'text-teal-900' : 'text-gray-900'}`}>{account.bankName}</p>
                                            <p className="text-[10px] font-medium text-gray-500">{account.accountType}</p>
                                        </div>
                                        {selectedBankId === account.bankAccountId && (
                                            <CheckCircle2 size={18} className="text-teal-500" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Risk Warning (Only for Expenses if balance is low) */}
                    {type === 'Expense' && selectedBank && selectedBank.currentBalance < totalAmount && (
                        <div className="flex gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 items-start">
                            <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-rose-600 leading-snug">
                                Insufficient Funds: The selected account balance is lower than the settlement amount.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <button
                        onClick={handleConfirm}
                        disabled={submitting || !selectedBankId || (type === 'Expense' && selectedBank?.currentBalance < totalAmount)}
                        className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${type === 'Income'
                                ? 'bg-teal-600 text-white shadow-teal-500/20 hover:bg-teal-700'
                                : 'bg-rose-600 text-white shadow-rose-500/20 hover:bg-rose-700'
                            } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                    >
                        {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={18} />
                        )}
                        {submitting ? "POSTING RECORDS..." : `CONFIRM ${type === 'Income' ? 'RECEIPT' : 'PAYMENT'}`}
                    </button>

                    <p className="text-[10px] font-black text-center text-gray-400 uppercase tracking-[0.2em]">
                        Auto-generates Ledgers & Journal Entries
                    </p>
                </div>
            </div>
        </div>
    );
}
