// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { normalizeData, generateActions, Region, CashFlowAction, Transaction, Category } from "@/libs/cashflowLogic";
import TransactionTable from "@/components/TransactionTable";

export default function Dashboard() {
    // --- STATE ---
    const [region, setRegion] = useState<Region>("IN");
    const [balance, setBalance] = useState<number>(0);

    // Now we store the raw transactions in State so we can add/remove them
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [actions, setActions] = useState<CashFlowAction[]>([]);
    const [loading, setLoading] = useState(false);

    // --- LOGIC RE-RUNNER ---
    // Whenever transactions or balance changes, re-calculate the "3 Cards"
    useEffect(() => {
        const results = generateActions(transactions, balance, region);
        setActions(results);
    }, [transactions, balance, region]);

    // --- HANDLERS ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const text = await file.text();
            const newTransactions = await normalizeData(text, region);

            // Merge new uploads with existing (or replace - here we replace for simplicity)
            setTransactions(newTransactions);
        } catch (error) {
            alert("Error parsing CSV.");
            console.error(error);
        }
        setLoading(false);
    };

    const handleAddTransaction = (t: Transaction) => {
        setTransactions(prev => [t, ...prev]);
    };

    const handleDeleteTransaction = (index: number) => {
        setTransactions(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateCategory = (index: number, newCat: Category) => {
        setTransactions(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], category: newCat };
            return updated;
        });
    };

    const getActionLink = (action: CashFlowAction) => {
        if (action.actionType === "WHATSAPP") {
            const text = encodeURIComponent(`Hi ${action.contactName}, regarding the payment of ${action.amount}...`);
            return `https://wa.me/?text=${text}`;
        } else {
            const subject = encodeURIComponent(`Payment Action: ${action.title}`);
            const body = encodeURIComponent(`Hi ${action.contactName}, regarding the amount of ${action.amount}...`);
            return `mailto:?subject=${subject}&body=${body}`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* HEADER */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
                <h1 className="text-2xl font-bold text-gray-800">CashFlow+</h1>
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-500">Region:</span>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value as Region)}
                        className="font-semibold text-blue-600 bg-transparent outline-none cursor-pointer"
                    >
                        <option value="IN">India (₹)</option>
                        <option value="US">USA ($)</option>
                    </select>
                </div>
            </div>

            <main className="max-w-4xl mx-auto space-y-8">

                {/* INPUT SECTION */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Current Bank Balance</label>
                        <div className="flex items-center">
                            <span className="text-2xl text-gray-400 mr-2">{region === "IN" ? "₹" : "$"}</span>
                            <input
                                type="number"
                                value={balance}
                                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                                className="text-3xl font-bold text-gray-800 w-full outline-none placeholder-gray-200"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Upload Tally/QuickBooks CSV</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-16 flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors cursor-pointer">
                            <p className="text-gray-400 text-sm group-hover:text-blue-500">
                                {loading ? "Analyzing..." : "Click to Upload CSV"}
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* RESULTS SECTION (3 CARDS) */}
                {actions.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recommended Actions</h2>
                        <div className="grid gap-4">
                            {actions.map((action) => (
                                <div
                                    key={action.id}
                                    className={`p-6 rounded-xl border-l-4 shadow-sm bg-white flex justify-between items-center
                    ${action.priority === "URGENT" ? "border-red-500" :
                                            action.priority === "HIGH" ? "border-orange-400" : "border-blue-400"}`}
                                >
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase
                        ${action.priority === "URGENT" ? "bg-red-100 text-red-600" :
                                                    action.priority === "HIGH" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                                                {action.priority}
                                            </span>
                                            <h3 className="font-bold text-gray-800">{action.title}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">{action.description}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-xl text-gray-800 mb-2">
                                            {region === "IN" ? "₹" : "$"}{action.amount.toLocaleString()}
                                        </p>
                                        <a
                                            href={getActionLink(action)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors
                        ${action.actionType === "WHATSAPP"
                                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
                                        >
                                            {action.actionType === "WHATSAPP" ? "📱 WhatsApp" : "📧 Email"}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* NEW TRANSACTION TRACKER */}
                <TransactionTable
                    transactions={transactions}
                    region={region}
                    onAddTransaction={handleAddTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onUpdateCategory={handleUpdateCategory}
                />

            </main>
        </div>
    );
}