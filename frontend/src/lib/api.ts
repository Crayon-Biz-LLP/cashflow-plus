"use client";

const API_BASE_URL = "http://localhost:5000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
    }

    return response.json();
}

export const api = {
    getDashboardStats: () => fetchWithAuth("/dashboard/stats"),

    // Cases
    getCases: () => fetchWithAuth("/cases"),
    getCaseById: (id: string) => fetchWithAuth(`/cases/${id}`),
    createCase: (data: any) => fetchWithAuth("/cases", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateCaseStage: (id: string, stage: string) => fetchWithAuth(`/cases/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
    }),

    // Invoices
    getInvoices: () => fetchWithAuth("/invoices"),
    createInvoice: (data: any) => fetchWithAuth("/invoices", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateInvoiceStatus: (id: string, status: string, bankAccountId?: string) => fetchWithAuth(`/invoices/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, bankAccountId }),
    }),
    deleteInvoice: (id: string) => fetchWithAuth(`/invoices/${id}`, {
        method: "DELETE"
    }),

    // Expenses
    getExpenses: () => fetchWithAuth("/expenses"),
    createExpense: (data: any) => fetchWithAuth("/expenses", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateExpenseStatus: (id: string, status: string, bankAccountId?: string) => fetchWithAuth(`/expenses/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, bankAccountId }),
    }),

    // Ledger & Transactions
    getTransactions: () => fetchWithAuth("/transactions"),

    // Team & Auth
    getTeam: () => fetchWithAuth("/team"),
    updateTeamMember: (id: string, data: any) => fetchWithAuth(`/team/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    deleteTeamMember: (id: string) => fetchWithAuth(`/team/${id}`, {
        method: "DELETE",
    }),
    login: (credentials: any) => fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    }),
    signup: (data: any) => fetchWithAuth("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Chart of Accounts
    getAccounts: (type?: string) => fetchWithAuth(`/accounts${type ? `?type=${type}` : ""}`),
    createAccount: (data: any) => fetchWithAuth("/accounts", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateAccount: (code: string, data: any) => fetchWithAuth(`/accounts/${code}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    // Journal Entries
    getJournalEntries: () => fetchWithAuth("/journal-entries"),
    createJournalEntry: (data: any) => fetchWithAuth("/journal-entries", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Vendors
    getVendors: () => fetchWithAuth("/vendors"),
    createVendor: (data: any) => fetchWithAuth("/vendors", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateVendor: (id: string, data: any) => fetchWithAuth(`/vendors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    // Bills
    getBills: () => fetchWithAuth("/bills"),
    createBill: (data: any) => fetchWithAuth("/bills", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateBillStatus: (id: string, status: string, bankAccountId?: string) => fetchWithAuth(`/bills/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, bankAccountId }),
    }),

    // Company Settings
    getSettings: () => fetchWithAuth("/settings"),
    updateSettings: (data: any) => fetchWithAuth("/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    // Financial Reports
    getProfitLoss: () => fetchWithAuth("/reports/profit-loss"),
    getBalanceSheet: () => fetchWithAuth("/reports/balance-sheet"),
    getCashFlowReport: () => fetchWithAuth("/reports/cash-flow"),
    getGstSummary: () => fetchWithAuth("/reports/gst-summary"),

    // Bank Accounts
    getBankAccounts: () => fetchWithAuth("/bank-accounts"),
    createBankAccount: (data: any) => fetchWithAuth("/bank-accounts", {
        method: "POST",
        body: JSON.stringify(data),
    }),

    // Bank Transactions & Reconciliation
    getBankTransactions: (bankAccountId?: string, status?: string) => {
        const params = new URLSearchParams();
        if (bankAccountId) params.append("bankAccountId", bankAccountId);
        if (status) params.append("status", status);
        return fetchWithAuth(`/bank-transactions${params.toString() ? `?${params}` : ""}`);
    },
    createBankTransaction: (data: any) => fetchWithAuth("/bank-transactions", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    importBankTransactions: (bankAccountId: string, transactions: any[]) => fetchWithAuth("/bank-transactions/import", {
        method: "POST",
        body: JSON.stringify({ bankAccountId, transactions }),
    }),
    autoMatchTransactions: (bankAccountId: string) => fetchWithAuth("/bank-transactions/auto-match", {
        method: "POST",
        body: JSON.stringify({ bankAccountId }),
    }),
    reconcileTransaction: (id: string, data: any) => fetchWithAuth(`/bank-transactions/${id}/reconcile`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    getReconciliationSummary: (bankAccountId?: string) =>
        fetchWithAuth(`/reconciliation/summary${bankAccountId ? `?bankAccountId=${bankAccountId}` : ""}`),

    // Cash Position & Forecasting
    getCashPosition: () => fetchWithAuth("/cash-position"),
    getCashForecast: () => fetchWithAuth("/cash-forecast"),
    createCashForecast: (data: any) => fetchWithAuth("/cash-forecast", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateCashForecast: (id: string, data: any) => fetchWithAuth(`/cash-forecast/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    // Sales Orders
    getSalesOrders: (status?: string) => fetchWithAuth(`/sales-orders${status ? `?status=${status}` : ""}`),
    createSalesOrder: (data: any) => fetchWithAuth("/sales-orders", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateSalesOrderStatus: (id: string, status: string) => fetchWithAuth(`/sales-orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    }),

    // Purchase Orders
    getPurchaseOrders: (status?: string) => fetchWithAuth(`/purchase-orders${status ? `?status=${status}` : ""}`),
    createPurchaseOrder: (data: any) => fetchWithAuth("/purchase-orders", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updatePurchaseOrderStatus: (id: string, status: string) => fetchWithAuth(`/purchase-orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    }),

    // Inventory
    getInventory: (category?: string) => fetchWithAuth(`/inventory${category ? `?category=${category}` : ""}`),
    createInventoryItem: (data: any) => fetchWithAuth("/inventory", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateInventoryItem: (id: string, data: any) => fetchWithAuth(`/inventory/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    adjustStock: (id: string, adjustment: number, reason: string) => fetchWithAuth(`/inventory/${id}/adjust`, {
        method: "POST",
        body: JSON.stringify({ adjustment, reason }),
    }),
    getLowStockAlerts: () => fetchWithAuth("/inventory/alerts/low-stock"),

    // Tax Profiles
    getTaxProfiles: (taxType?: string) => fetchWithAuth(`/tax-profiles${taxType ? `?taxType=${taxType}` : ""}`),
    createTaxProfile: (data: any) => fetchWithAuth("/tax-profiles", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateTaxProfile: (id: string, data: any) => fetchWithAuth(`/tax-profiles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    // AI Analytics
    getAIProfitMargins: () => fetchWithAuth("/ai/profit-margin"),
    getAIProfitMarginForCase: (caseId: string) => fetchWithAuth(`/ai/profit-margin/${caseId}`),
    analyzeExpenseAI: (data: any) => fetchWithAuth("/ai/analyze-expense", {
        method: "POST",
        body: JSON.stringify(data),
    }),
};
