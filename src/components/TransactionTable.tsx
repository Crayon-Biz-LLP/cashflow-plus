// src/components/TransactionTable.tsx
import React, { useState } from "react";
import { Transaction, Region, Category, CATEGORY_RULES } from "@/libs/cashflowLogic";

interface Props {
    transactions: Transaction[];
    region: Region;
    onAddTransaction: (t: Transaction) => void;
    onDeleteTransaction: (index: number) => void;
    onUpdateCategory: (index: number, newCat: Category) => void;
    onEditTransaction: (index: number, updatedT: Transaction) => void;
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_RULES) as Category[];

export default function TransactionTable({
    transactions,
    region,
    onAddTransaction,
    onDeleteTransaction,
    onUpdateCategory,
    onEditTransaction
}: Props) {
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newPayee, setNewPayee] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [newType, setNewType] = useState<"IN" | "OUT">("OUT");
    const [newCategory, setNewCategory] = useState<Category>("Uncategorized");

    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Transaction | null>(null);

    const handleAdd = () => {
        if (!newPayee || !newAmount) return;
        onAddTransaction({
            date: newDate,
            payee: newPayee,
            description: "Manual Entry",
            amount: parseFloat(newAmount),
            type: newType,
            category: newCategory,
            status: "PENDING" // Default new items to pending
        });
        setNewPayee("");
        setNewAmount("");
        setNewCategory("Uncategorized");
    };

    const startEdit = (index: number, t: Transaction) => {
        setEditingIdx(index);
        setEditForm({ ...t });
    };

    const saveEdit = () => {
        if (editingIdx !== null && editForm) {
            onEditTransaction(editingIdx, editForm);
            setEditingIdx(null);
            setEditForm(null);
        }
    };

    const cancelEdit = () => {
        setEditingIdx(null);
        setEditForm(null);
    };

    // NEW: Toggle Status Handler
    const toggleStatus = (index: number, current: Transaction) => {
        const newStatus = current.status === "PAID" ? "PENDING" : "PAID";
        onEditTransaction(index, { ...current, status: newStatus });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Transaction Manager</h3>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3">
                        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 text-gray-800" />
                        <input placeholder="Payee Name" value={newPayee} onChange={(e) => setNewPayee(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 text-gray-800" />
                        <input type="number" placeholder="Amount" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-32 p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 text-gray-800" />

                        <select value={newType} onChange={(e) => setNewType(e.target.value as "IN" | "OUT")} className="p-2 border border-gray-300 rounded text-sm bg-white text-gray-700">
                            <option value="IN">Inflow (+)</option>
                            <option value="OUT">Outflow (-)</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center">
                        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as Category)} className="p-2 border border-gray-300 rounded text-sm bg-white text-gray-700 w-full md:w-64">
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={handleAdd} className="bg-gray-800 text-white px-6 py-2 rounded text-sm hover:bg-black transition-colors ml-4">Add Entry</button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">
                            <th className="px-6 py-3">Status</th> {/* NEW COLUMN */}
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Party</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">No transactions yet.</td></tr>
                        ) : (
                            transactions.map((t, idx) => {
                                const isEditing = editingIdx === idx;
                                const isPaid = t.status === "PAID";

                                return (
                                    <tr key={idx} className={`hover:bg-gray-50 group ${isPaid ? "bg-green-50/30" : ""}`}>
                                        {/* STATUS TOGGLE */}
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => toggleStatus(idx, t)}
                                                className={`px-2 py-1 rounded text-xs font-bold border transition-colors 
                                ${isPaid
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"}`}
                                            >
                                                {isPaid ? "PAID" : "PENDING"}
                                            </button>
                                        </td>

                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {isEditing && editForm ? (
                                                <input type="date" value={editForm.date.split('T')[0]} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full p-1 border rounded text-xs" />
                                            ) : (
                                                new Date(t.date).toLocaleDateString()
                                            )}
                                        </td>

                                        <td className="px-6 py-3 text-sm text-gray-800 font-medium">
                                            {isEditing && editForm ? (
                                                <input value={editForm.payee} onChange={(e) => setEditForm({ ...editForm, payee: e.target.value })} className="w-full p-1 border rounded text-xs" />
                                            ) : (
                                                t.payee
                                            )}
                                        </td>

                                        <td className="px-6 py-3 text-sm">
                                            {isEditing && editForm ? (
                                                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category })} className="w-full p-1 border rounded text-xs bg-white">
                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            ) : (
                                                <select value={t.category} onChange={(e) => onUpdateCategory(idx, e.target.value as Category)} className="bg-transparent border-none text-gray-600 text-sm focus:ring-0 cursor-pointer hover:text-blue-600 max-w-[150px] truncate">
                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            )}
                                        </td>

                                        <td className={`px-6 py-3 text-sm text-right font-mono font-medium ${t.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                                            {isEditing && editForm ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as "IN" | "OUT" })} className="text-xs p-1 border rounded">
                                                        <option value="IN">+</option>
                                                        <option value="OUT">-</option>
                                                    </select>
                                                    <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })} className="w-20 p-1 border rounded text-xs text-right" />
                                                </div>
                                            ) : (
                                                <>
                                                    {t.type === "IN" ? "+" : "-"}{region === "IN" ? "₹" : "$"}{t.amount.toLocaleString()}
                                                </>
                                            )}
                                        </td>

                                        <td className="px-6 py-3 text-center">
                                            {isEditing ? (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={saveEdit} className="text-green-600 hover:text-green-800 text-xs font-bold uppercase">Save</button>
                                                    <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 text-xs uppercase">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center gap-4">
                                                    <button onClick={() => startEdit(idx, t)} className="text-blue-400 hover:text-blue-600 text-sm">✎</button>
                                                    <button onClick={() => onDeleteTransaction(idx)} className="text-gray-300 hover:text-red-500 text-lg">&times;</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}