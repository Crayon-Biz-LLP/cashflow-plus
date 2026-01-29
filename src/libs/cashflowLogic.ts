// src/libs/cashflowLogic.ts
import Papa from "papaparse";

// --- TYPES ---
export type Region = "IN" | "US";

export type Category =
    | "Payroll & Team"
    | "Taxes & Compliance"
    | "Rent & Facilities"
    | "Software & Subscriptions"
    | "Marketing & Ads"
    | "Travel & Entertainment"
    | "Contractors & Professional Services"
    | "Office Supplies"
    | "Sales / Revenue"
    | "Uncategorized";

export interface Transaction {
    id?: string;
    date: string;
    payee: string;
    description: string;
    amount: number;
    type: "IN" | "OUT";
    category: Category;
}

export interface CashFlowAction {
    id: string;
    title: string;
    description: string;
    amount: number;
    priority: "URGENT" | "HIGH" | "NORMAL";
    actionType: "WHATSAPP" | "EMAIL";
    contactName: string;
    crunchDate?: string;
}

// NEW: Chart Data Point Interface
export interface ChartDataPoint {
    date: string;
    balance: number;
}

export interface ForecastResult {
    monthlyBurn: number;
    monthlyInflow: number;
    netBurn: number;
    runwayMonths: number | "Infinity";
    recurringItems: string[];
    chartData: ChartDataPoint[]; // <--- NEW
}

// --- CONFIGURATION ---

export const CATEGORY_RULES: Record<Category, { isSacred: boolean; isRecurring: boolean }> = {
    "Payroll & Team": { isSacred: true, isRecurring: true },
    "Taxes & Compliance": { isSacred: true, isRecurring: false },
    "Rent & Facilities": { isSacred: true, isRecurring: true },
    "Software & Subscriptions": { isSacred: false, isRecurring: true },
    "Marketing & Ads": { isSacred: false, isRecurring: false },
    "Travel & Entertainment": { isSacred: false, isRecurring: false },
    "Contractors & Professional Services": { isSacred: false, isRecurring: false },
    "Office Supplies": { isSacred: false, isRecurring: false },
    "Sales / Revenue": { isSacred: false, isRecurring: false },
    "Uncategorized": { isSacred: false, isRecurring: false },
};

const KEYWORD_MAP: { [key: string]: Category } = {
    "salary": "Payroll & Team", "wages": "Payroll & Team", "payroll": "Payroll & Team", "bonus": "Payroll & Team",
    "tax": "Taxes & Compliance", "gst": "Taxes & Compliance", "vat": "Taxes & Compliance", "irs": "Taxes & Compliance",
    "rent": "Rent & Facilities", "lease": "Rent & Facilities", "electricity": "Rent & Facilities", "utility": "Rent & Facilities",
    "aws": "Software & Subscriptions", "google": "Software & Subscriptions", "adobe": "Software & Subscriptions", "subscription": "Software & Subscriptions", "saas": "Software & Subscriptions", "hosting": "Software & Subscriptions",
    "ads": "Marketing & Ads", "facebook": "Marketing & Ads", "linkedin": "Marketing & Ads", "meta": "Marketing & Ads",
    "travel": "Travel & Entertainment", "hotel": "Travel & Entertainment", "flight": "Travel & Entertainment", "uber": "Travel & Entertainment", "food": "Travel & Entertainment",
    "contractor": "Contractors & Professional Services", "consultant": "Contractors & Professional Services", "legal": "Contractors & Professional Services", "upwork": "Contractors & Professional Services",
};

const guessCategory = (text: string, type: "IN" | "OUT"): Category => {
    if (type === "IN") return "Sales / Revenue";
    const lowerText = text.toLowerCase();
    for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
        if (lowerText.includes(keyword)) return category;
    }
    return "Uncategorized";
};

// --- CORE FUNCTIONS ---

export const normalizeData = (csvText: string, region: Region): Promise<Transaction[]> => {
    return new Promise((resolve) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const rawData = results.data as any[];
                const normalized: Transaction[] = rawData.map((row, idx) => {
                    let payee = "Unknown", description = "", amount = 0, type: "IN" | "OUT" = "OUT";
                    let date = new Date().toISOString();
                    let category: Category | "Auto" = "Auto";

                    const safeParse = (val: any) => {
                        if (typeof val === "number") return val;
                        if (!val) return 0;
                        return parseFloat(val.toString().replace(/,/g, ""));
                    };

                    if (row["Payee"] || row["Category"]) {
                        payee = row["Payee"] || "Unknown";
                        description = row["Description"] || "";
                        const amtRaw = safeParse(row["Amount"]);
                        amount = Math.abs(amtRaw);
                        type = (row["Type"] && row["Type"].toUpperCase() === "IN") ? "IN" : "OUT";
                        date = row["Date"] || date;
                        if (row["Category"] && Object.keys(CATEGORY_RULES).includes(row["Category"])) {
                            category = row["Category"] as Category;
                        }
                    }
                    else if (region === "IN") {
                        payee = row["Party Name"] || row["Particulars"] || "Unknown";
                        description = row["Vch Type"] || "";
                        const amtRaw = safeParse(row["Amount"]);
                        amount = Math.abs(amtRaw);
                        type = row["Vch Type"] && row["Vch Type"].includes("Receipt") ? "IN" : "OUT";
                        date = row["Date"] || date;
                    }
                    else {
                        payee = row["Name"] || "Unknown";
                        description = row["Memo/Description"] || "";
                        const amtRaw = safeParse(row["Amount"]);
                        amount = Math.abs(amtRaw);
                        type = amtRaw > 0 ? "IN" : "OUT";
                        date = row["Date"] || date;
                    }

                    const finalCategory = category !== "Auto"
                        ? category
                        : guessCategory(payee + " " + description, type);

                    return {
                        id: `csv-${idx}-${Date.now()}`,
                        date,
                        payee,
                        description,
                        amount,
                        type,
                        category: finalCategory
                    };
                });
                resolve(normalized);
            },
        });
    });
};

export const generateActions = (
    transactions: Transaction[],
    currentBalance: number,
    region: Region
): CashFlowAction[] => {
    const actions: CashFlowAction[] = [];

    const totalIn = transactions.filter(t => t.type === "IN").reduce((acc, t) => acc + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === "OUT").reduce((acc, t) => acc + t.amount, 0);
    const projectedBalance = currentBalance + totalIn - totalOut;

    // Exact Crunch Date Logic
    let crunchDate: string | undefined = undefined;

    // Sort transactions by date
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = currentBalance;

    for (const t of sortedTx) {
        if (t.type === "IN") runningBalance += t.amount;
        else runningBalance -= t.amount;

        if (runningBalance < 0 && !crunchDate) {
            crunchDate = t.date;
            break;
        }
    }

    if (projectedBalance < 0 || crunchDate) {
        const dateObj = crunchDate ? new Date(crunchDate) : new Date();
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const symbol = region === "IN" ? "₹" : "$";

        actions.push({
            id: "alert-1",
            title: "CASH CRUNCH ALERT",
            description: crunchDate
                ? `You will hit negative cash balance on ${dateStr}.`
                : `Projected negative balance (-${symbol}${Math.abs(projectedBalance).toLocaleString()}).`,
            amount: projectedBalance,
            priority: "URGENT",
            actionType: region === "IN" ? "WHATSAPP" : "EMAIL",
            contactName: "Investors/Lenders",
            crunchDate: dateStr
        });
    }

    const largestIn = transactions
        .filter((t) => t.type === "IN")
        .sort((a, b) => b.amount - a.amount)[0];

    if (largestIn) {
        actions.push({
            id: "in-1",
            title: "Collect Payment",
            description: `Largest receipt from ${largestIn.payee} (${largestIn.category})`,
            amount: largestIn.amount,
            priority: "HIGH",
            actionType: region === "IN" ? "WHATSAPP" : "EMAIL",
            contactName: largestIn.payee
        });
    }

    const largestOut = transactions
        .filter((t) => t.type === "OUT")
        .filter((t) => {
            const rules = CATEGORY_RULES[t.category] || CATEGORY_RULES["Uncategorized"];
            return !rules.isSacred;
        })
        .sort((a, b) => b.amount - a.amount)[0];

    if (largestOut) {
        actions.push({
            id: "out-1",
            title: "Delay Payment",
            description: `Largest negotiable expense: ${largestOut.payee} (${largestOut.category}).`,
            amount: largestOut.amount,
            priority: "NORMAL",
            actionType: region === "IN" ? "WHATSAPP" : "EMAIL",
            contactName: largestOut.payee
        });
    }

    return actions;
};

// UPDATED: Now generates Chart Data
export const calculateForecast = (transactions: Transaction[], currentBalance: number): ForecastResult => {
    const recurringMap = new Map<string, number>();
    const recurringItems: string[] = [];

    // 1. Chart Data Generation
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const chartData: ChartDataPoint[] = [];

    // Add Today's starting point
    chartData.push({ date: new Date().toISOString().split('T')[0], balance: currentBalance });

    let runningBal = currentBalance;
    sortedTx.forEach(t => {
        if (t.type === "IN") runningBal += t.amount;
        else runningBal -= t.amount;

        // Only add point if date is different from last point (simplify graph)
        // or just push every transaction point for accuracy
        chartData.push({
            date: t.date.split('T')[0], // YYYY-MM-DD
            balance: runningBal
        });
    });

    // 2. Existing Forecast Logic
    transactions.filter(t => t.type === "OUT").forEach(t => {
        const rules = CATEGORY_RULES[t.category];
        if (rules && rules.isRecurring) recurringMap.set(t.payee, Math.abs(t.amount));
    });

    let monthlyBurn = 0;
    recurringMap.forEach((amount, payee) => {
        monthlyBurn += amount;
        recurringItems.push(payee);
    });

    let monthlyInflow = 0;
    transactions.filter(t => t.type === "IN").forEach(t => {
        if (t.description.toLowerCase().includes("retainer")) monthlyInflow += t.amount;
    });

    const netBurn = monthlyBurn - monthlyInflow;
    let runwayMonths: number | "Infinity" = "Infinity";

    if (netBurn > 0) runwayMonths = parseFloat((currentBalance / netBurn).toFixed(1));

    return {
        monthlyBurn,
        monthlyInflow,
        netBurn,
        runwayMonths,
        recurringItems,
        chartData // <--- Return the chart data
    };
};