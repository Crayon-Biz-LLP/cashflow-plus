// src/libs/cashflowLogic.ts
import Papa from "papaparse";

// --- TYPES ---
export type Region = "IN" | "US";
export type TransactionStatus = "PAID" | "PENDING";

// 🚀 FIX: Added missing ChartDataPoint interface for the graph
export interface ChartDataPoint {
    date: string;
    balance: number;
    type?: 'actual' | 'projected';
}

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
    status: TransactionStatus;
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

export interface ForecastResult {
    monthlyBurn: number;
    monthlyInflow: number;
    netBurn: number;
    runwayMonths: number | "Infinity";
    runwayEndDate: string | null;
    recurringItems: string[];
    crunchDate: string | null;
}

// --- CONFIGURATION ---

export const CATEGORY_RULES: Record<Category, { isSacred: boolean; isRecurring: boolean }> = {
    "Payroll & Team": { isSacred: true, isRecurring: true },
    "Taxes & Compliance": { isSacred: false, isRecurring: false },
    "Rent & Facilities": { isSacred: false, isRecurring: true },
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
                    let status: TransactionStatus = "PENDING";

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
                        if (row["Status"] && (row["Status"].toUpperCase() === "PAID")) {
                            status = "PAID";
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
                        category: finalCategory,
                        status
                    };
                });
                resolve(normalized);
            },
        });
    });
};

const isFutureOrToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const dStr = d.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    return dStr >= todayStr;
};

export const generateActions = (
    transactions: Transaction[],
    currentBalance: number,
    region: Region
): CashFlowAction[] => {
    const actions: CashFlowAction[] = [];
    let realBalance = currentBalance;

    // 1. Apply ALL PAID items (Past or Future)
    transactions.forEach(t => {
        if (t.status === "PAID") {
            if (t.type === "IN") realBalance += t.amount;
            else realBalance -= t.amount;
        }
    });

    // 2. Identify Future Pending Items
    const futurePendingTx = transactions.filter(t => t.status === "PENDING" && isFutureOrToday(t.date));

    // 3. Calculate Projected Shortfall
    const pendingIn = futurePendingTx.filter(t => t.type === "IN").reduce((acc, t) => acc + t.amount, 0);
    const pendingOut = futurePendingTx.filter(t => t.type === "OUT").reduce((acc, t) => acc + t.amount, 0);

    const projectedBalance = realBalance + pendingIn - pendingOut;

    // ACTION: Cash Crunch (Using Timetravel)
    let crunchDate: string | undefined = undefined;
    const sortedFuture = [...futurePendingTx].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBal = realBalance;
    for (const t of sortedFuture) {
        if (t.type === "IN") runningBal += t.amount;
        else runningBal -= t.amount;

        if (runningBal < 0 && !crunchDate) {
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

    // ACTION: Collect Payment
    const largestPendingIn = futurePendingTx
        .filter((t) => t.type === "IN")
        .sort((a, b) => b.amount - a.amount)[0];

    if (largestPendingIn) {
        actions.push({
            id: "in-1",
            title: "Collect Payment",
            description: `Largest PENDING receipt from ${largestPendingIn.payee}. Mark 'Paid' to improve cash flow.`,
            amount: largestPendingIn.amount,
            priority: "HIGH",
            actionType: region === "IN" ? "WHATSAPP" : "EMAIL",
            contactName: largestPendingIn.payee
        });
    }

    // ACTION: Delay Payment (Only Non-Sacred)
    const largestOut = futurePendingTx
        .filter((t) => t.type === "OUT")
        .filter((t) => !CATEGORY_RULES[t.category].isSacred)
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

export const calculateForecast = (transactions: Transaction[], currentBalance: number): ForecastResult => {
    const recurringMap = new Map<string, number>();
    const recurringItems: string[] = [];

    // 1. CALCULATE EFFECTIVE BALANCE
    let effectiveRunwayBalance = currentBalance;

    transactions.forEach(t => {
        if (t.status === "PAID") {
            if (t.type === "IN") {
                effectiveRunwayBalance += t.amount;
            } else {
                effectiveRunwayBalance -= t.amount;
            }
        }
    });

    // 2. CRUNCH DATE LOGIC
    const futurePendingTx = transactions.filter(t => t.status === "PENDING" && isFutureOrToday(t.date));
    const sortedTx = [...futurePendingTx].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBal = effectiveRunwayBalance;
    let crunchDate: string | null = null;

    sortedTx.forEach(t => {
        if (t.type === "IN") {
            // Conservative: Pending money doesn't exist until paid
        } else {
            // Conservative: Pending bills MUST be paid
            runningBal -= t.amount;
        }

        if (runningBal < 0 && !crunchDate) {
            crunchDate = t.date;
        }
    });

    // 3. BURN RATE LOGIC
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
    let runwayEndDate: string | null = null;

    if (netBurn > 0) {
        const months = Math.max(0, effectiveRunwayBalance) / netBurn;
        runwayMonths = parseFloat(months.toFixed(1));

        // CALCULATE EXACT END DATE
        const daysLeft = Math.round(months * 30);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysLeft);
        runwayEndDate = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    return {
        monthlyBurn,
        monthlyInflow,
        netBurn,
        runwayMonths,
        runwayEndDate,
        recurringItems,
        crunchDate
    };
};