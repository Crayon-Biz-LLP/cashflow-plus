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
  const [region, setRegion] = useState<Region>("IN");
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [actions, setActions] = useState<CashFlowAction[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

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

  const saveAndUpdate = (newTx: Transaction[], newBal: number, newReg: Region) => {
    setTransactions(newTx);
    setBalance(newBal);
    setRegion(newReg);
    localStorage.setItem("cashflow_transactions", JSON.stringify(newTx));
    localStorage.setItem("cashflow_balance", newBal.toString());
    localStorage.setItem("cashflow_region", newReg);
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

  const loadDemoData = () => {
    const demoBalance = 300000;
    const demoTx: Transaction[] = [
      { id: "d1", date: "2026-02-01", payee: "Team Payroll", description: "Monthly Salaries", amount: 1100000, type: "OUT", category: "Payroll & Team", status: "PENDING" },
      { id: "d2", date: "2026-02-01", payee: "Indiqube Rent", description: "Office Rent", amount: 100000, type: "OUT", category: "Rent & Facilities", status: "PENDING" },
      { id: "d3", date: "2026-02-15", payee: "Client Alpha", description: "Pending Invoice", amount: 2500000, type: "IN", category: "Sales / Revenue", status: "PENDING" },
      { id: "d4", date: "2026-02-05", payee: "AWS", description: "Hosting", amount: 25000, type: "OUT", category: "Software & Subscriptions", status: "PENDING" },
    ];
    saveAndUpdate(demoTx, demoBalance, "IN");
  };

  useEffect(() => {
    const actionResults = generateActions(transactions, balance, region);
    setActions(actionResults);
    const forecastResults = calculateForecast(transactions, balance);
    setForecast(forecastResults);
  }, [transactions, balance, region]);

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
  const visibleActions = actions.filter(a => !dismissedIds.includes(a.id));

  // Determine Safe/Danger Mode
  const isCrunch = forecast && forecast.crunchDate !== null;
  const crunchDatePretty = isCrunch ? new Date(forecast.crunchDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";

  if (!isLoaded) return <div className="p-10 text-gray-500 font-mono">Loading CashFlow...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
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

        {/* === 1. HERO STATUS CARD (Always Visible) === */}
        {isCrunch ? (
          // DANGER STATE
          <div className="bg-red-50 border-l-8 border-red-500 rounded-xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse-slow">
            <div>
              <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Critical Alert</span>
              <h2 className="text-3xl font-bold text-red-700 mt-2">Cash Crunch: {crunchDatePretty}</h2>
              <p className="text-red-600 mt-1">You will run out of money on this date based on committed expenses.</p>
            </div>
            <a
              href="https://wa.me/?text=Emergency%20Cash%20Crunch%20Meeting%20Request"
              target="_blank"
              className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              🚨 Alert Investors
            </a>
          </div>
        ) : (
          // SAFE STATE
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-8 shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Healthy</span>
                {forecast && <span className="text-emerald-100 text-sm">Runway: {forecast.runwayMonths} Months</span>}
              </div>
              <h2 className="text-3xl font-bold">Cash Flow Secure</h2>
              {/* NEW: Runway End Date */}
              {forecast && forecast.runwayEndDate && (
                <p className="text-emerald-50 mt-1 text-sm font-medium opacity-90">
                  Cash positive until {forecast.runwayEndDate}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold opacity-20">✓</div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-500 mb-2">Current Bank Balance</label>
            <div className="flex items-center">
              <span className="text-2xl text-gray-400 mr-2">{currency}</span>
              <input type="number" value={balance} onChange={(e) => handleBalanceChange(parseFloat(e.target.value) || 0)} className="text-3xl font-bold text-gray-800 w-full outline-none placeholder-gray-200" placeholder="0.00" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group flex flex-col justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Upload Tally/QuickBooks CSV</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-16 flex items-center justify-center bg-gray-50 group-hover:bg-blue-50 transition-colors cursor-pointer relative">
                <p className="text-gray-400 text-sm group-hover:text-blue-500">{loading ? "Analyzing..." : "Click to Upload CSV"}</p>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center text-xs">
              <button onClick={loadDemoData} className="text-blue-600 hover:text-blue-800 font-medium underline">
                No CSV? Try Demo Mode
              </button>
              <span className="text-gray-400 flex items-center">🔒 Secure Client-Side Parsing</span>
            </div>
          </div>
        </div>

        {/* ACTIONS LIST */}
        {visibleActions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Smart Actions</h2>
            <div className="grid gap-4">
              {visibleActions.map((action) => (
                <div key={action.id} className={`relative p-6 rounded-xl border-l-4 shadow-sm bg-white flex justify-between items-center ${action.priority === "URGENT" ? "border-red-500" : action.priority === "HIGH" ? "border-orange-400" : "border-blue-400"}`}>
                  <button onClick={() => handleDismiss(action.id)} className="absolute top-2 right-2 text-gray-300 hover:text-gray-500" title="Mark as Done">&times;</button>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${action.priority === "URGENT" ? "bg-red-100 text-red-600" : action.priority === "HIGH" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>{action.priority}</span>
                      <h3 className="font-bold text-gray-800 ml-2">{action.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                  <div className="text-right mr-6">
                    <p className="font-bold text-xl text-gray-800 mb-2">{currency}{Math.abs(action.amount).toLocaleString()}</p>
                    <a href={getActionLink(action)} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {action.actionType === "WHATSAPP" ? "📱 WhatsApp" : "📧 Email"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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