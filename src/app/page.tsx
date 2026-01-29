// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import TransactionTable from "@/components/TransactionTable";

export default function Dashboard() {
  // --- STATE ---
  const [region, setRegion] = useState<Region>("IN");
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [actions, setActions] = useState<CashFlowAction[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // NEW: Track dismissed actions so they don't reappear instantly
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // --- MEMORY: LOAD ---
  useEffect(() => {
    const savedTx = localStorage.getItem("cashflow_transactions");
    const savedBal = localStorage.getItem("cashflow_balance");
    const savedRegion = localStorage.getItem("cashflow_region");

    if (savedTx) {
      try {
        const parsed = JSON.parse(savedTx);
        if (Array.isArray(parsed)) setTransactions(parsed);
      } catch (e) { console.error("Load Error", e); }
    }
    if (savedBal) setBalance(parseFloat(savedBal));
    if (savedRegion) setRegion(savedRegion as Region);

    setIsLoaded(true);
  }, []);

  // --- HELPER: EXPLICIT SAVE ---
  const saveAndUpdate = (newTx: Transaction[], newBal: number, newReg: Region) => {
    setTransactions(newTx);
    setBalance(newBal);
    setRegion(newReg);
    localStorage.setItem("cashflow_transactions", JSON.stringify(newTx));
    localStorage.setItem("cashflow_balance", newBal.toString());
    localStorage.setItem("cashflow_region", newReg);
    // Clear dismissed cards on data change so logic can re-evaluate
    setDismissedIds([]);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to wipe all data and start fresh?")) {
      localStorage.removeItem("cashflow_transactions");
      localStorage.removeItem("cashflow_balance");
      localStorage.removeItem("cashflow_region");
      window.location.reload();
    }
  };

  // NEW: DEMO MODE HANDLER
  const loadDemoData = () => {
    const demoBalance = 300000;
    const demoTx: Transaction[] = [
      { id: "d1", date: "2026-02-01", payee: "Team Payroll", description: "Monthly Salaries", amount: 1100000, type: "OUT", category: "Payroll & Team" },
      { id: "d2", date: "2026-02-01", payee: "Indiqube Rent", description: "Office Rent", amount: 100000, type: "OUT", category: "Rent & Facilities" },
      { id: "d3", date: "2026-02-15", payee: "Client Alpha", description: "Pending Invoice", amount: 800000, type: "IN", category: "Sales / Revenue" },
      { id: "d4", date: "2026-02-05", payee: "AWS", description: "Hosting", amount: 25000, type: "OUT", category: "Software & Subscriptions" },
      { id: "d5", date: "2026-01-29", payee: "Team Lunch", description: "Offsite", amount: 15000, type: "OUT", category: "Travel & Entertainment" }
    ];
    saveAndUpdate(demoTx, demoBalance, "IN");
  };

  // --- THE BRAIN ---
  useEffect(() => {
    const actionResults = generateActions(transactions, balance, region);
    setActions(actionResults);
    const forecastResults = calculateForecast(transactions, balance);
    setForecast(forecastResults);
  }, [transactions, balance, region]);

  // --- HANDLERS ---
  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const handleBalanceChange = (val: number) => {
    saveAndUpdate(transactions, val, region);
  };

  const handleRegionChange = (val: Region) => {
    saveAndUpdate(transactions, balance, val);
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

  const handleAddTransaction = (t: Transaction) => {
    const updated = [t, ...transactions];
    saveAndUpdate(updated, balance, region);
  };

  const handleEditTransaction = (index: number, updatedT: Transaction) => {
    const updated = [...transactions];
    updated[index] = updatedT;
    saveAndUpdate(updated, balance, region);
  };

  const handleDeleteTransaction = (index: number) => {
    const updated = transactions.filter((_, i) => i !== index);
    saveAndUpdate(updated, balance, region);
  };

  const handleUpdateCategory = (index: number, newCat: Category) => {
    const updated = [...transactions];
    updated[index] = { ...updated[index], category: newCat };
    saveAndUpdate(updated, balance, region);
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

  // Filter out dismissed actions
  const visibleActions = actions.filter(a => !dismissedIds.includes(a.id));

  if (!isLoaded) return <div className="p-10 text-gray-500 font-mono">Loading CashFlow...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-gray-800">CashFlow+</h1>

        <div className="flex items-center space-x-4">
          <button onClick={handleReset} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors">
            Clear Data
          </button>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-500">Region:</span>
            <select value={region} onChange={(e) => handleRegionChange(e.target.value as Region)} className="font-semibold text-blue-600 bg-transparent outline-none cursor-pointer">
              <option value="IN">India (₹)</option>
              <option value="US">USA ($)</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto space-y-8">

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-500 mb-2">Current Bank Balance</label>
            <div className="flex items-center">
              <span className="text-2xl text-gray-400 mr-2">{currency}</span>
              <input type="number" value={balance} onChange={(e) => handleBalanceChange(parseFloat(e.target.value) || 0)} className="text-3xl font-bold text-gray-800 w-full outline-none placeholder-gray-200" placeholder="0.00" />
            </div>
          </div>

          {/* UPLOAD CARD + DEMO MODE + PRIVACY SHIELD */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group flex flex-col justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Upload Tally/QuickBooks CSV</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-16 flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors cursor-pointer relative">
                <p className="text-gray-400 text-sm group-hover:text-blue-500">{loading ? "Analyzing..." : "Click to Upload CSV"}</p>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* MICRO-FEATURES 1 & 2: Demo Mode + Privacy Text */}
            <div className="mt-3 flex justify-between items-center text-xs">
              <button onClick={loadDemoData} className="text-blue-600 hover:text-blue-800 font-medium underline">
                No CSV? Try Demo Mode
              </button>
              <span className="text-gray-400 flex items-center">
                🔒 Secure Client-Side Parsing
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        {visibleActions.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recommended Actions</h2>
            <div className="grid gap-4">
              {visibleActions.map((action) => (
                <div key={action.id} className={`relative p-6 rounded-xl border-l-4 shadow-sm bg-white flex justify-between items-center ${action.priority === "URGENT" ? "border-red-500" : action.priority === "HIGH" ? "border-orange-400" : "border-blue-400"}`}>

                  {/* MICRO-FEATURE 3: Dismiss Button */}
                  <button
                    onClick={() => handleDismiss(action.id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
                    title="Mark as Done"
                  >
                    &times;
                  </button>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${action.priority === "URGENT" ? "bg-red-100 text-red-600" : action.priority === "HIGH" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>{action.priority}</span>
                      {action.crunchDate && <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">{action.crunchDate}</span>}
                      <h3 className="font-bold text-gray-800 ml-2">{action.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                  <div className="text-right mr-6"> {/* Added mr-6 to avoid overlap with dismiss button */}
                    <p className="font-bold text-xl text-gray-800 mb-2">{currency}{Math.abs(action.amount).toLocaleString()}</p>
                    <a href={getActionLink(action)} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {action.actionType === "WHATSAPP" ? "📱 WhatsApp" : "📧 Email"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State for Gratification */
          <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center">
            <h3 className="text-green-800 font-bold text-lg">All caught up! 🎉</h3>
            <p className="text-green-600 text-sm">No immediate cash flow risks detected.</p>
          </div>
        )}

        {/* FORECAST */}
        {forecast && forecast.recurringItems.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
              <div>
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Monthly Forecast</h2>
                <div className="text-3xl font-bold flex items-center gap-4">
                  <span>Burn: {currency}{forecast.monthlyBurn.toLocaleString()}</span>
                  <span className="text-gray-600 font-light">|</span>
                  <span className={`${forecast.runwayMonths !== "Infinity" && forecast.runwayMonths < 3 ? "text-red-400" : "text-green-400"}`}>Runway: {forecast.runwayMonths} Months</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Recurring: <span className="text-gray-300 italic">{forecast.recurringItems.join(", ")}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        <TransactionTable
          transactions={transactions}
          region={region}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateCategory={handleUpdateCategory}
          onEditTransaction={handleEditTransaction}
        />
      </main>
    </div>
  );
}