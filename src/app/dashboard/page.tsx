"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react"; // Real Auth Hooks
import { useRouter } from "next/navigation";
import { usePostHog } from 'posthog-js/react';
import Link from "next/link";
import {
    normalizeData,
    generateActions,
    calculateForecast,
    Region,
    Category,
    CashFlowAction,
    Transaction,
    ForecastResult
} from "@/libs/cashflowLogic";
import {
    LogOut, Home, HelpCircle, X, BrainCircuit, Globe,
    Sun, Moon, ShieldAlert, Check, AlertTriangle,
    TrendingUp, TrendingDown, UploadCloud, Plus, Trash2, Edit2,
    History, Zap, MessageCircle, Calendar, DollarSign, Tag, CheckCircle2, Circle
} from "lucide-react";

// --- 1. REUSABLE SPOTLIGHT CARD ---
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        divRef.current.style.setProperty("--x", `${x}px`);
        divRef.current.style.setProperty("--y", `${y}px`);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={`spotlight-card relative overflow-hidden rounded-xl border transition-colors duration-300 ${className}`}
        >
            <div className="relative z-10 h-full">{children}</div>
        </div>
    );
};

// --- 2. TUTORIAL MODAL ---
function TutorialModal({ onClose, isDark }: { onClose: () => void, isDark: boolean }) {
    const [step, setStep] = useState(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300 border ${isDark ? 'bg-[#09090b] border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X size={20} /></button>

                <div className="mb-6 flex justify-center">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${step >= i ? "bg-orange-500" : "bg-zinc-700"}`} />
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div className="text-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>📂</div>
                        <h3 className="text-xl font-bold mb-2">1. Upload your Data</h3>
                        <p className="text-zinc-500 mb-6 text-sm">Export your ledger from Tally or QuickBooks as a CSV. Drag and drop it into the upload box.</p>
                        <button onClick={() => setStep(2)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold w-full hover:bg-orange-600 transition-colors">Next</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>📉</div>
                        <h3 className="text-xl font-bold mb-2">2. Check the 'Death Date'</h3>
                        <p className="text-zinc-500 mb-6 text-sm">We calculate exactly when you run out of cash. Look for the "Cash Crunch" alert at the top.</p>
                        <button onClick={() => setStep(3)} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold w-full hover:bg-orange-600 transition-colors">Next</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>✅</div>
                        <h3 className="text-xl font-bold mb-2">3. Take Action</h3>
                        <p className="text-zinc-500 mb-6 text-sm">Use the "Smart Actions" list to delay payments or collect invoices via WhatsApp.</p>
                        <button onClick={onClose} className="bg-white text-black px-6 py-2 rounded-lg font-bold w-full hover:bg-zinc-200 transition-colors">Get Started</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 3. TRANSACTION MODAL (ADD/EDIT) ---
function TransactionModal({ isOpen, onClose, onSave, isDark, initialData }: any) {
    const [form, setForm] = useState<Partial<Transaction>>({
        date: new Date().toISOString().split('T')[0],
        payee: "",
        amount: 0,
        type: "OUT",
        category: "Operational Exp" as Category,
        status: "PENDING"
    });

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm({
                date: new Date().toISOString().split('T')[0],
                payee: "",
                amount: 0,
                type: "OUT",
                category: "Operational Exp" as Category,
                status: "PENDING"
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`rounded-xl shadow-2xl max-w-sm w-full p-6 relative border ${isDark ? 'bg-[#09090b] border-white/10 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
                <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase">Date</label>
                        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={`w-full p-2 rounded border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-zinc-50 border-zinc-200'}`} />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase">Description / Payee</label>
                        <input type="text" value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} className={`w-full p-2 rounded border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-zinc-50 border-zinc-200'}`} />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs text-zinc-500 font-bold uppercase">Amount</label>
                            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} className={`w-full p-2 rounded border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-zinc-50 border-zinc-200'}`} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 font-bold uppercase">Type</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "IN" | "OUT" })} className={`w-full p-2 rounded border ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
                                <option value="OUT">Expense (OUT)</option>
                                <option value="IN">Income (IN)</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={() => { onSave(form); onClose(); }} className="w-full bg-orange-500 text-white font-bold py-2 rounded-lg mt-4 hover:bg-orange-600">Save Transaction</button>
                    <button onClick={onClose} className="w-full text-zinc-500 text-xs mt-2 hover:text-zinc-300">Cancel</button>
                </div>
            </div>
        </div>
    );
}

// --- 4. MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
    const posthog = usePostHog();
    const router = useRouter();
    // AUTH HOOK
    const { data: session, status } = useSession();

    const [isLoaded, setIsLoaded] = useState(false);

    // Data State
    const [region, setRegion] = useState<Region>("IN");
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [actions, setActions] = useState<CashFlowAction[]>([]);
    const [forecast, setForecast] = useState<ForecastResult | null>(null);
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // UI State
    const [isDark, setIsDark] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        // 1. Load Theme
        const savedTheme = localStorage.getItem("cashflow_theme");
        if (savedTheme) setIsDark(savedTheme === "dark");

        // 2. Auth Redirect
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // --- DATA LOADING (User Specific) ---
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            const userKey = session.user.email; // UNIQUE KEY FOR DATA

            // 🚀 LEAD CAPTURE: Identify the user in PostHog
            posthog.identify(userKey, {
                email: session.user.email,
                name: session.user.name,
                region: region // Optional: Track which region they are in
            });

            // ... (Your existing LocalStorage logic below remains the same) ...
            const savedTx = localStorage.getItem(`cashflow_transactions_${userKey}`);
            const savedBal = localStorage.getItem(`cashflow_balance_${userKey}`);
            const savedRegion = localStorage.getItem(`cashflow_region_${userKey}`);
            const tutorialSeen = localStorage.getItem(`tutorial_seen_${userKey}`);

            if (savedTx) {
                try {
                    const parsed = JSON.parse(savedTx);
                    if (Array.isArray(parsed)) setTransactions(parsed);
                } catch (e) { console.error("Load Error", e); }
            }
            if (savedBal) setBalance(parseFloat(savedBal));
            if (savedRegion) setRegion(savedRegion as Region);
            if (!tutorialSeen) setShowTutorial(true);

            setIsLoaded(true);
        }
    }, [status, session]); // Dependency array is correct

    // --- DATA SAVING (User Specific) ---
    const saveAndUpdate = (newTx: Transaction[], newBal: number, newReg: Region) => {
        if (!session?.user?.email) return;
        const userKey = session.user.email;

        setTransactions(newTx);
        setBalance(newBal);
        setRegion(newReg);

        // Save to User's key
        localStorage.setItem(`cashflow_transactions_${userKey}`, JSON.stringify(newTx));
        localStorage.setItem(`cashflow_balance_${userKey}`, newBal.toString());
        localStorage.setItem(`cashflow_region_${userKey}`, newReg);
        setDismissedIds([]);
    };

    // --- CALCULATIONS ---
    useEffect(() => {
        const actionResults = generateActions(transactions, balance, region);
        setActions(actionResults);
        const forecastResults = calculateForecast(transactions, balance);
        setForecast(forecastResults);
    }, [transactions, balance, region]);

    // --- HANDLERS ---
    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("cashflow_theme", newTheme ? "dark" : "light");
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const closeTutorial = () => {
        setShowTutorial(false);
        if (session?.user?.email) localStorage.setItem(`tutorial_seen_${session.user.email}`, "true");
    };

    const handleDismiss = (id: string) => {
        setDismissedIds(prev => [...prev, id]);
    };

    const handleBalanceChange = (val: number) => {
        saveAndUpdate(transactions, val, region);
    };

    const handleRegionChange = (val: Region) => {
        saveAndUpdate(transactions, balance, val);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to wipe all data?")) {
            saveAndUpdate([], 0, region);
        }
    };

    const loadDemoData = () => {
        const demoBalance = 300000;
        const demoTx: Transaction[] = [
            { id: "d1", date: "2026-02-01", payee: "Team Payroll", description: "Monthly Salaries", amount: 1100000, type: "OUT", category: "Payroll & Team" as Category, status: "PENDING" },
            { id: "d2", date: "2026-02-01", payee: "Indiqube Rent", description: "Office Rent", amount: 100000, type: "OUT", category: "Rent & Facilities" as Category, status: "PENDING" },
            { id: "d3", date: "2026-02-15", payee: "Client Alpha", description: "Pending Invoice", amount: 2500000, type: "IN", category: "Sales / Revenue" as Category, status: "PENDING" },
            { id: "d4", date: "2026-02-05", payee: "AWS", description: "Hosting", amount: 25000, type: "OUT", category: "Software & Subscriptions" as Category, status: "PENDING" },
        ];
        saveAndUpdate(demoTx, demoBalance, "IN");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const text = await file.text();
            const newTransactions = await normalizeData(text, region);
            const combined = [...newTransactions, ...transactions];
            saveAndUpdate(combined, balance, region);
        } catch (error) {
            alert("Error parsing CSV.");
        }
        setLoading(false);
    };

    const handleDeleteTransaction = (index: number) => {
        const updated = transactions.filter((_, i) => i !== index);
        saveAndUpdate(updated, balance, region);
    };

    const handleStatusToggle = (index: number) => {
        const updated = [...transactions];
        updated[index].status = updated[index].status === "PAID" ? "PENDING" : "PAID";
        saveAndUpdate(updated, balance, region);
    };

    const handleCategoryChange = (index: number, newCat: Category) => {
        const updated = [...transactions];
        updated[index].category = newCat;
        saveAndUpdate(updated, balance, region);
    };

    // --- CRUD HELPERS ---
    const openAddModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const openEditModal = (t: Transaction) => {
        setEditingTransaction(t);
        setIsModalOpen(true);
    };

    const handleSaveTransaction = (t: Transaction) => {
        if (editingTransaction) {
            // Edit
            const updated = transactions.map(tx => tx.id === editingTransaction.id ? { ...t, id: editingTransaction.id } : tx);
            saveAndUpdate(updated, balance, region);
        } else {
            // Add
            const newTx = { ...t, id: Math.random().toString(36).substr(2, 9) };
            saveAndUpdate([newTx, ...transactions], balance, region);
        }
        setEditingTransaction(null);
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

    const currency = region === "IN" ? "₹" : "$";
    const visibleActions = actions.filter(a => !dismissedIds.includes(a.id));
    const isCrunch = forecast && forecast.crunchDate !== null;
    const crunchDatePretty = isCrunch ? new Date(forecast.crunchDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";

    const CATEGORIES = [
        "Sales / Revenue", "Payroll & Team", "Rent & Facilities", "Software & Subscriptions", "Marketing & Ads", "Legal & Prof. Services", "Operational Exp", "Taxes", "Loan Repayment"
    ];

    if (!isLoaded) return <div className="p-10 text-zinc-500 font-mono">Loading CashFlow...</div>;

    return (
        <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? 'dark bg-[#020202] text-zinc-300' : 'bg-slate-50 text-zinc-600'}`}>

            {/* GLOBAL STYLES FOR SPOTLIGHT */}
            <style jsx global>{`
        .spotlight-card::before {
            content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
            background: radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(249, 115, 22, 0.4), transparent 40%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 20;
        }
        .dark .spotlight-card::after {
            content: ""; position: absolute; inset: 0; border-radius: inherit;
            background: radial-gradient(600px circle at var(--x, 0px) var(--y, 0px), rgba(249, 115, 22, 0.05), transparent 40%);
            pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 10;
        }
        .spotlight-card:hover::before, .spotlight-card:hover::after { opacity: 1; }
      `}</style>

            {showTutorial && <TutorialModal onClose={closeTutorial} isDark={isDark} />}
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTransaction}
                isDark={isDark}
                initialData={editingTransaction}
            />

            {/* NAVBAR */}
            <div className="max-w-6xl mx-auto flex justify-between items-center py-6 px-6 sticky top-0 z-40 bg-inherit/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Link href="/" className={`p-2 rounded-lg border transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:border-orange-500/50' : 'bg-white border-zinc-200 hover:border-orange-500/50'}`} title="Back to Website">
                        <Home size={18} className={isDark ? 'text-zinc-400' : 'text-zinc-600'} />
                    </Link>
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <BrainCircuit size={18} />
                        </div>
                        <span className={isDark ? 'text-white' : 'text-zinc-900'}>CashFlow<span className="text-orange-500">+</span></span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={() => setShowTutorial(true)} className="text-zinc-500 hover:text-orange-500 transition-colors" title="Help">
                        <HelpCircle size={20} />
                    </button>

                    <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
                        <Globe size={14} className="text-zinc-500" />
                        <select value={region} onChange={(e) => handleRegionChange(e.target.value as Region)} className="text-sm font-bold bg-transparent outline-none cursor-pointer text-orange-500">
                            <option value="IN">India (₹)</option>
                            <option value="US">USA ($)</option>
                        </select>
                    </div>

                    <button onClick={handleLogout} className={`p-2 rounded-full border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-red-900/20 hover:border-red-800 hover:text-red-400' : 'bg-white border-zinc-200 hover:bg-red-50 hover:text-red-500'}`} title="Sign Out">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 space-y-8 pb-20">

                {/* === 1. HERO STATUS CARD === */}
                {isCrunch ? (
                    // DANGER STATE
                    <SpotlightCard className={`p-8 border-l-4 border-l-red-500 ${isDark ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/20 uppercase tracking-wide">
                                    <AlertTriangle size={12} /> Critical Alert
                                </span>
                                <h2 className={`text-4xl font-bold mt-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cash Crunch: {crunchDatePretty}</h2>
                                <p className="text-red-500 mt-2 font-medium">You will run out of money on this date based on committed expenses.</p>
                            </div>
                            <a href={`https://wa.me/?text=Emergency%20Cash%20Crunch%20Alert%20for%20${crunchDatePretty}`} target="_blank" className="bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition-all flex items-center gap-2">
                                🚨 Alert Investors
                            </a>
                        </div>
                    </SpotlightCard>
                ) : (
                    // SAFE STATE
                    <SpotlightCard className={`p-8 border-l-4 border-l-emerald-500 ${isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 uppercase tracking-wide">
                                        <Check size={12} /> Healthy
                                    </span>
                                    {forecast && <span className={`text-sm ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>Runway: {forecast.runwayMonths} Months</span>}
                                </div>
                                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cash Flow Secure</h2>
                                {forecast && forecast.runwayEndDate && (
                                    <p className="text-emerald-500 mt-1 text-sm font-medium opacity-90">
                                        Cash positive until {forecast.runwayEndDate}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                                    <TrendingUp size={32} />
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <SpotlightCard className={`p-6 ${isDark ? 'bg-[#09090b] border-white/10' : 'bg-white border-zinc-200'}`}>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Bank Balance</label>
                        <div className="flex items-center">
                            <span className="text-3xl text-zinc-500 mr-2">{currency}</span>
                            <input
                                type="number"
                                value={balance}
                                onChange={(e) => handleBalanceChange(parseFloat(e.target.value) || 0)}
                                className={`text-4xl font-bold w-full outline-none bg-transparent placeholder-zinc-700 ${isDark ? 'text-white' : 'text-zinc-900'}`}
                                placeholder="0.00"
                            />
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className={`p-6 relative group flex flex-col justify-between ${isDark ? 'bg-[#09090b] border-white/10' : 'bg-white border-zinc-200'}`}>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Upload Tally/QuickBooks CSV</label>
                            <div className={`border-2 border-dashed rounded-lg h-20 flex items-center justify-center transition-colors cursor-pointer relative ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/50' : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-orange-500'
                                }`}>
                                <div className="flex flex-col items-center">
                                    <UploadCloud size={20} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />
                                    <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{loading ? "Analyzing..." : "Click to Upload"}</p>
                                </div>
                                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center text-[10px] text-zinc-500">
                            <button onClick={loadDemoData} className="hover:text-orange-500 font-medium underline">
                                Try Demo Mode
                            </button>
                            <span className="flex items-center gap-1"><ShieldAlert size={10} /> Secure Client-Side</span>
                        </div>
                    </SpotlightCard>
                </div>

                {/* ACTIONS LIST */}
                {visibleActions.length > 0 && (
                    <div>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            <Zap size={16} className="text-orange-500" /> Smart Actions
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {visibleActions.map((action) => (
                                <SpotlightCard key={action.id} className={`p-6 flex flex-col justify-between ${isDark ? 'bg-[#09090b] border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-2 ${action.priority === "URGENT" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                action.priority === "HIGH" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                                                    "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                                }`}>
                                                {action.priority}
                                            </div>
                                            <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{action.title}</h3>
                                            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{action.description}</p>
                                        </div>
                                        <button onClick={() => handleDismiss(action.id)} className="text-zinc-500 hover:text-zinc-300"><X size={16} /></button>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                        <p className={`font-mono font-bold text-xl ${isDark ? 'text-white' : 'text-zinc-900'}`}>{currency}{Math.abs(action.amount).toLocaleString()}</p>
                                        <a href={getActionLink(action)} target="_blank" rel="noreferrer" className={`inline-flex items-center text-xs font-bold px-4 py-2 rounded-lg transition-colors gap-2 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                            }`}>
                                            {action.actionType === "WHATSAPP" ? <MessageCircle size={14} /> : <Zap size={14} />}
                                            {action.actionType === "WHATSAPP" ? "WhatsApp" : "Take Action"}
                                        </a>
                                    </div>
                                </SpotlightCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* TRANSACTIONS TABLE */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            <History size={16} /> Recent Transactions
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={openAddModal} className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-md border transition-colors ${isDark ? 'text-white border-white/10 hover:bg-white/10' : 'text-black border-zinc-200 hover:bg-zinc-100'
                                }`}>
                                <Plus size={12} /> Add New
                            </button>
                            <button onClick={() => handleReset()} className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-500/20 hover:bg-red-500/10 transition-colors">
                                <Trash2 size={12} /> Clear Data
                            </button>
                        </div>
                    </div>

                    <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-white/10 bg-[#09090b]' : 'border-zinc-200 bg-white shadow-sm'}`}>
                        <table className="w-full text-sm text-left">
                            <thead className={`text-xs uppercase font-semibold ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-zinc-50 text-zinc-500'}`}>
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-zinc-100'}`}>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                            No transactions yet. Upload a CSV or click "Add New".
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t, idx) => (
                                        <tr key={t.id || idx} className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50'}`}>
                                            <td className={`px-6 py-4 font-mono text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{new Date(t.date).toLocaleDateString()}</td>
                                            <td className={`px-6 py-4 font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                                                {t.payee}
                                                <div className="text-[10px] text-zinc-500 font-normal">{t.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={t.category}
                                                    onChange={(e) => handleCategoryChange(idx, e.target.value as Category)}
                                                    className={`text-xs bg-transparent outline-none cursor-pointer px-2 py-1 rounded border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-zinc-200 hover:bg-zinc-100'}`}
                                                >
                                                    {CATEGORIES.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleStatusToggle(idx)}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${t.status === "PAID"
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                                                        }`}
                                                >
                                                    {t.status === "PAID" ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                                                    {t.status}
                                                </button>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-mono font-medium ${t.type === 'IN' ? 'text-emerald-500' : isDark ? 'text-zinc-300' : 'text-zinc-900'
                                                }`}>
                                                {t.type === 'IN' ? '+' : '-'}{currency}{Math.abs(t.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(t)}
                                                        className="text-zinc-500 hover:text-blue-500 transition-colors p-1 rounded hover:bg-blue-500/10"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(idx)}
                                                        className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}