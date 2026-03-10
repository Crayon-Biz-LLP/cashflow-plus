"use client";

import React, { useState } from "react";
import { Search, Bell, Settings, Plus, ChevronDown, Briefcase, FileText, Receipt, Menu, TrendingUp } from "lucide-react";
import NewCaseModal from "./NewCaseModal";
import NewInvoiceModal from "./NewInvoiceModal";
import NewExpenseModal from "./NewExpenseModal";
import NewCashForecastModal from "./NewCashForecastModal";
import { useSidebar } from "@/lib/SidebarContext";

interface TopbarProps {
    title: string;
    subtitle?: string;
    onMenuToggle?: () => void;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
    const { toggle } = useSidebar();
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const closeModals = () => setActiveModal(null);
    const handleSuccess = () => {
        closeModals();
        window.location.reload();
    };

    return (
        <>
            <header className="flex items-center justify-between py-4 md:py-6 px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggle}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-900 border border-gray-100 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition-all active:scale-90 shadow-sm"
                        aria-label="Toggle Menu"
                    >
                        <Menu size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-lg md:text-xl font-black tracking-tight text-gray-900 truncate max-w-[150px] md:max-w-none">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search - Hidden on Small Screens */}
                    <div className="relative group hidden lg:block">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Search workspace..."
                            className="w-[200px] xl:w-[320px] pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500/20 transition-all font-geist-sans"
                        />
                    </div>

                    <div className="flex items-center gap-1 md:gap-1.5 border-l border-gray-100 pl-2 md:pl-4">
                        <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 relative group">
                            <Bell size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                        </button>

                        <button className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                            <Settings size={18} />
                        </button>

                        {/* Global Create Dropdown */}
                        <div className="relative ml-1 md:ml-2">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="px-2.5 md:px-4 py-1.5 rounded-lg bg-teal-600 text-white text-[11px] font-black uppercase tracking-wider hover:bg-teal-700 shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                <Plus size={14} strokeWidth={3} />
                                <span className="hidden sm:inline">CREATE</span>
                                <ChevronDown size={12} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => { setActiveModal('case'); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-colors group"
                                        >
                                            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100">
                                                <Briefcase size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none">New Legal Case</span>
                                                <span className="text-[9px] font-medium text-gray-400">Initialize pipeline matter</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { setActiveModal('invoice'); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-colors group"
                                        >
                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100">
                                                <FileText size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none">Create Invoice</span>
                                                <span className="text-[9px] font-medium text-gray-400">Bill client for services</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { setActiveModal('expense'); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-colors group"
                                        >
                                            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100">
                                                <Receipt size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none">Log Expense</span>
                                                <span className="text-[9px] font-medium text-gray-400">Track costs and filings</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => { setActiveModal('forecast'); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-colors group"
                                        >
                                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100">
                                                <TrendingUp size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none">Project Cash</span>
                                                <span className="text-[9px] font-medium text-gray-400">Add future inflow/outflow</span>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Portalled-style Modals (Elevated to z-60 to beat Sidebar z-50) */}
            <div className="relative z-[60]">
                <NewCaseModal
                    isOpen={activeModal === 'case'}
                    onClose={closeModals}
                    onSuccess={handleSuccess}
                />
                <NewInvoiceModal
                    isOpen={activeModal === 'invoice'}
                    onClose={closeModals}
                    onSuccess={handleSuccess}
                />
                <NewExpenseModal
                    isOpen={activeModal === 'expense'}
                    onClose={closeModals}
                    onSuccess={handleSuccess}
                />
                <NewCashForecastModal
                    isOpen={activeModal === 'forecast'}
                    onClose={closeModals}
                    onSuccess={handleSuccess}
                />
            </div>
        </>
    );
}
