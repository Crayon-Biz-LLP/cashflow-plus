const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");


dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.NODE_PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ============ MongoDB Connection ============
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cashflow";

mongoose
    .connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB connected → ${MONGO_URI}`))
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        console.log("⚠️  Make sure MongoDB is running on localhost:27017");
        process.exit(1);
    });

// ============ Import Models ============
const { User, Case, Invoice, Expense, TimeLog, Notification, Transaction, Account, JournalEntry, Vendor, Bill, CompanySettings, BankAccount, BankTransaction, CashForecast, SalesOrder, PurchaseOrder, InventoryItem, TaxProfile } = require("./models");


async function seedDatabase() {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
        console.log(`📦 Database already seeded (${userCount} users found)`);
        return;
    }

    console.log("🌱 Seeding database with initial data...");

    // Seed Users
    await User.insertMany([
        {
            userId: "T-001",
            name: "Arjun Khanna",
            email: "admin@solvstrat.com",
            password: "$2a$10$xVfZ5J8kT5G2gH6hRqA3muPkQj7QmN0GzL8b4R3n7Y1v2WxZ0KqXy",
            role: "Admin",
            phone: "+91 98765 43210",
            status: "Active",
        },
        {
            userId: "T-002",
            name: "Riya Sharma",
            email: "riya@solvstrat.com",
            password: "$2a$10$xVfZ5J8kT5G2gH6hRqA3muPkQj7QmN0GzL8b4R3n7Y1v2WxZ0KqXy",
            role: "Manager",
            phone: "+91 98765 43211",
            status: "Active",
        },
        {
            userId: "T-003",
            name: "Priya Mehta",
            email: "priya@solvstrat.com",
            password: "$2a$10$xVfZ5J8kT5G2gH6hRqA3muPkQj7QmN0GzL8b4R3n7Y1v2WxZ0KqXy",
            role: "Staff",
            phone: "+91 98765 43212",
            status: "Active",
        },
    ]);

    // Seed Cases
    await Case.insertMany([
        {
            caseId: "JF-2024-001",
            title: "Singh vs. Metro Corp",
            client: "Ajay Singh",
            stage: "In Progress",
            priority: "High",
            assigneeId: "T-001",
            amount: 345000,
            tags: ["Corporate", "Litigation"],
            dueDate: new Date("2026-02-25"),
        },
        {
            caseId: "JF-2024-002",
            title: "Verma Industrial Dispute",
            client: "Verma Steel Ltd.",
            stage: "Review",
            priority: "Medium",
            assigneeId: "T-002",
            amount: 520000,
            tags: ["Industrial", "Dispute"],
            dueDate: new Date("2026-02-27"),
        },
        {
            caseId: "JF-2024-003",
            title: "Apex Real Estate Fraud",
            client: "Apex Developers",
            stage: "In Progress",
            priority: "Critical",
            assigneeId: "T-003",
            amount: 1200000,
            tags: ["Real Estate", "Fraud"],
            dueDate: new Date("2026-03-05"),
        },
        {
            caseId: "JF-2024-004",
            title: "Taneja IP Licensing",
            client: "Taneja Corp",
            stage: "Assigned",
            priority: "Low",
            assigneeId: "T-003",
            amount: 180000,
            tags: ["IP", "Licensing"],
            dueDate: new Date("2026-03-01"),
        },
        {
            caseId: "JF-2024-005",
            title: "Gupta Tax Compliance",
            client: "Gupta & Associates",
            stage: "Closed",
            priority: "Medium",
            assigneeId: "T-001",
            amount: 260000,
            tags: ["Tax", "Compliance"],
            dueDate: new Date("2026-02-10"),
        },
    ]);

    // Seed Invoices
    await Invoice.insertMany([
        {
            invoiceId: "INV-2024-001",
            caseId: "JF-2024-001",
            client: "Ajay Singh",
            amount: 345000,
            gst: 62100,
            total: 407100,
            status: "Paid",
            date: new Date("2026-02-20"),
            dueDate: new Date("2026-03-05"),
        },
        {
            invoiceId: "INV-2024-002",
            caseId: "JF-2024-002",
            client: "Verma Steel Ltd.",
            amount: 520000,
            gst: 93600,
            total: 613600,
            status: "Overdue",
            date: new Date("2026-02-05"),
            dueDate: new Date("2026-02-20"),
        },
    ]);

    // Seed Expenses (with GST)
    await Expense.insertMany([
        {
            expenseId: "EXP-001",
            caseId: "JF-2024-001",
            category: "Court Filing",
            description: "High Court filing fee",
            amount: 12500,
            gstAmount: 2250,
            totalWithGst: 14750,
            date: new Date("2026-02-22"),
            loggedBy: "T-001",
            status: "Approved",
        },
        {
            expenseId: "EXP-002",
            caseId: "JF-2024-003",
            category: "Travel",
            description: "Mumbai-Delhi court hearing travel",
            amount: 28000,
            gstAmount: 5040,
            totalWithGst: 33040,
            date: new Date("2026-02-20"),
            loggedBy: "T-003",
            status: "Approved",
        },
    ]);

    // Seed Chart of Accounts (Bigcapital-inspired default accounts)
    const accountCount = await Account.countDocuments();
    if (accountCount === 0) {
        await Account.insertMany([
            // Assets
            { accountCode: "1000", name: "Cash & Bank", type: "Asset", subType: "Current Asset", description: "Primary bank account" },
            { accountCode: "1100", name: "Accounts Receivable", type: "Asset", subType: "Current Asset", description: "Money owed by clients" },
            { accountCode: "1200", name: "Prepaid Expenses", type: "Asset", subType: "Current Asset", description: "Expenses paid in advance" },
            { accountCode: "1500", name: "Office Equipment", type: "Asset", subType: "Fixed Asset", description: "Computers, furniture, etc." },
            { accountCode: "1600", name: "Accumulated Depreciation", type: "Asset", subType: "Fixed Asset", description: "Depreciation on fixed assets" },
            // Liabilities
            { accountCode: "2000", name: "Accounts Payable", type: "Liability", subType: "Current Liability", description: "Money owed to vendors" },
            { accountCode: "2100", name: "GST Payable", type: "Liability", subType: "Current Liability", description: "GST collected from clients" },
            { accountCode: "2200", name: "GST Receivable", type: "Asset", subType: "Current Asset", description: "GST paid on expenses (Input Tax Credit)" },
            { accountCode: "2500", name: "Unearned Revenue", type: "Liability", subType: "Current Liability", description: "Advance payments from clients" },
            // Equity
            { accountCode: "3000", name: "Owner's Capital", type: "Equity", subType: "Owner Equity", description: "Initial investment" },
            { accountCode: "3100", name: "Retained Earnings", type: "Equity", subType: "Retained Earnings", description: "Accumulated profits" },
            // Revenue
            { accountCode: "4000", name: "Legal Fees Revenue", type: "Revenue", subType: "Operating Revenue", description: "Income from legal services" },
            { accountCode: "4100", name: "Consultation Revenue", type: "Revenue", subType: "Operating Revenue", description: "Income from consultations" },
            { accountCode: "4500", name: "Interest Income", type: "Revenue", subType: "Other Revenue", description: "Bank interest earned" },
            // Expenses
            { accountCode: "5000", name: "Staff Salaries", type: "Expense", subType: "Operating Expense", description: "Employee compensation" },
            { accountCode: "5100", name: "Office Rent", type: "Expense", subType: "Operating Expense", description: "Workplace rental" },
            { accountCode: "5200", name: "Court Filing Fees", type: "Expense", subType: "Operating Expense", description: "Fees for filing cases" },
            { accountCode: "5300", name: "Travel & Conveyance", type: "Expense", subType: "Operating Expense", description: "Travel costs" },
            { accountCode: "5400", name: "Documentation & Printing", type: "Expense", subType: "Operating Expense", description: "Document preparation costs" },
            { accountCode: "5500", name: "Professional Fees", type: "Expense", subType: "Operating Expense", description: "Expert witness, consultants" },
            { accountCode: "5900", name: "Miscellaneous Expenses", type: "Expense", subType: "Operating Expense", description: "Other operating expenses" },
        ]);
        console.log("   📊 Chart of Accounts seeded");
    }

    // Seed Vendors
    const vendorCount = await Vendor.countDocuments();
    if (vendorCount === 0) {
        await Vendor.insertMany([
            { vendorId: "VND-001", name: "LegalDocs India", email: "billing@legaldocs.in", phone: "+91 22 4567 8900", category: "Legal Services", gstin: "27AABCT1234F1ZH" },
            { vendorId: "VND-002", name: "TravelEase Corp", email: "accounts@travelease.com", phone: "+91 11 2345 6789", category: "Travel", gstin: "07AADCT5678G2ZI" },
            { vendorId: "VND-003", name: "TechSupply Hub", email: "sales@techsupply.in", phone: "+91 80 9876 5432", category: "Technology", gstin: "29AAFCT9012H3ZJ" },
        ]);
        console.log("   🏢 Vendors seeded");
    }

    // Seed Company Settings
    const settingsCount = await CompanySettings.countDocuments();
    if (settingsCount === 0) {
        await CompanySettings.create({
            companyName: "solvstrat",
            legalName: "SolvStrat Legal Solutions Pvt. Ltd.",
            gstin: "27AABCS1234F1ZK",
            pan: "AABCS1234F",
            email: "admin@solvstrat.com",
            phone: "+91 22 4000 5000",
            address: "201, Legal Tower, BKC",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400051",
        });
        console.log("   ⚙️  Company settings seeded");
    }

    // Seed Bank Accounts
    const bankCount = await BankAccount.countDocuments();
    if (bankCount === 0) {
        await BankAccount.insertMany([
            { bankAccountId: "BA-001", bankName: "HDFC Bank", accountNumber: "50100123456789", ifscCode: "HDFC0001234", accountType: "Current", openingBalance: 1500000, currentBalance: 1500000, linkedAccountCode: "1000" },
            { bankAccountId: "BA-002", bankName: "ICICI Bank", accountNumber: "00610345678912", ifscCode: "ICIC0006100", accountType: "Savings", openingBalance: 500000, currentBalance: 500000, linkedAccountCode: "1000" },
            { bankAccountId: "BA-003", bankName: "Petty Cash", accountNumber: "CASH-001", accountType: "Petty Cash", openingBalance: 25000, currentBalance: 25000 },
        ]);
        console.log("   🏦 Bank Accounts seeded");
    }

    // Seed Inventory Items
    const itemCount = await InventoryItem.countDocuments();
    if (itemCount === 0) {
        await InventoryItem.insertMany([
            { itemId: "ITEM-001", name: "Legal Bond Paper (A4)", sku: "LBP-A4-500", hsnCode: "4802", category: "Stationery", unit: "Ream", purchaseRate: 350, sellingRate: 0, gstRate: 12, currentStock: 50, reorderLevel: 10, totalValue: 17500 },
            { itemId: "ITEM-002", name: "Court Stamp Paper", sku: "CSP-100", hsnCode: "4907", category: "Legal Materials", unit: "Nos", purchaseRate: 100, sellingRate: 0, gstRate: 0, currentStock: 200, reorderLevel: 50, totalValue: 20000 },
            { itemId: "ITEM-003", name: "HP LaserJet Toner", sku: "HPT-26A", hsnCode: "8443", category: "Office Supplies", unit: "Nos", purchaseRate: 4500, sellingRate: 0, gstRate: 18, currentStock: 5, reorderLevel: 2, totalValue: 22500 },
            { itemId: "ITEM-004", name: "Legal Case File Binder", sku: "LCF-001", hsnCode: "4820", category: "Stationery", unit: "Nos", purchaseRate: 120, sellingRate: 0, gstRate: 18, currentStock: 100, reorderLevel: 20, totalValue: 12000 },
            { itemId: "ITEM-005", name: "Microsoft 365 License", sku: "MS365-BIZ", hsnCode: "997331", category: "Software", unit: "License", purchaseRate: 8500, sellingRate: 0, gstRate: 18, currentStock: 10, reorderLevel: 3, totalValue: 85000 },
        ]);
        console.log("   📦 Inventory Items seeded");
    }

    // Seed Tax Profiles (Indian GST slabs)
    const taxCount = await TaxProfile.countDocuments();
    if (taxCount === 0) {
        await TaxProfile.insertMany([
            { profileId: "TAX-001", name: "GST 0% (Exempt)", taxType: "GST", rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, isDefault: false, description: "Exempted goods & services" },
            { profileId: "TAX-002", name: "GST 5%", taxType: "GST", rate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5, isDefault: false, description: "Essential items" },
            { profileId: "TAX-003", name: "GST 12%", taxType: "GST", rate: 12, cgstRate: 6, sgstRate: 6, igstRate: 12, isDefault: false, description: "Standard rate tier 1" },
            { profileId: "TAX-004", name: "GST 18%", taxType: "GST", rate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, isDefault: true, description: "Standard rate — most services" },
            { profileId: "TAX-005", name: "GST 28%", taxType: "GST", rate: 28, cgstRate: 14, sgstRate: 14, igstRate: 28, isDefault: false, description: "Luxury & sin goods" },
            { profileId: "TAX-006", name: "TDS 10% (Professional)", taxType: "TDS", rate: 10, cgstRate: 0, sgstRate: 0, igstRate: 0, isDefault: false, description: "TDS u/s 194J — Professional services" },
            { profileId: "TAX-007", name: "TDS 2% (Contractor)", taxType: "TDS", rate: 2, cgstRate: 0, sgstRate: 0, igstRate: 0, isDefault: false, description: "TDS u/s 194C — Contractor payments" },
        ]);
        console.log("   💰 Tax Profiles seeded (GST slabs + TDS)");
    }

    // Seed Cash Forecasts
    const forecastCount = await CashForecast.countDocuments();
    if (forecastCount === 0) {
        const today = new Date();
        await CashForecast.insertMany([
            { forecastId: "CF-001", forecastDate: new Date(today.getFullYear(), today.getMonth() + 1, 5), type: "Expected Inflow", category: "Client Payment", description: "Singh vs. Metro Corp — final payment", amount: 345000, probability: 90, linkedReferenceType: "Invoice" },
            { forecastId: "CF-002", forecastDate: new Date(today.getFullYear(), today.getMonth() + 1, 1), type: "Recurring Outflow", category: "Salary", description: "Monthly staff salaries", amount: 250000, probability: 100, isRecurring: true, recurringInterval: "Monthly", linkedReferenceType: "Manual" },
            { forecastId: "CF-003", forecastDate: new Date(today.getFullYear(), today.getMonth() + 1, 10), type: "Recurring Outflow", category: "Rent", description: "Office rent — BKC Tower", amount: 85000, probability: 100, isRecurring: true, recurringInterval: "Monthly", linkedReferenceType: "Manual" },
            { forecastId: "CF-004", forecastDate: new Date(today.getFullYear(), today.getMonth() + 1, 15), type: "Expected Inflow", category: "Client Payment", description: "Verma Steel — partial payment", amount: 300000, probability: 60, linkedReferenceType: "Invoice" },
            { forecastId: "CF-005", forecastDate: new Date(today.getFullYear(), today.getMonth() + 1, 20), type: "Expected Outflow", category: "Vendor Payment", description: "TechSupply Hub — equipment order", amount: 150000, probability: 80, linkedReferenceType: "PurchaseOrder" },
        ]);
        console.log("   📈 Cash Forecasts seeded");
    }

    console.log("✅ Database seeded successfully!");
}

// ============ Auth Middleware ============
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "solvstrat_secret";

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token required" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

function roleGuard(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
}

// ============ Routes ============

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "solvstrat Backend",
        version: "1.0.0",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// ──────────── AUTH ────────────

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // In demo mode, accept any password
        // In production: const isMatch = await bcrypt.compare(password, user.password);

        const token = jwt.sign(
            { id: user.userId, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: { id: user.userId, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Me
app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.id }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ id: user.userId, name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Signup
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Check duplicate
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const validRoles = ["Admin", "Manager", "Staff"];
        const userRole = validRoles.includes(role) ? role : "Staff";

        // Generate next userId
        const count = await User.countDocuments();
        const userId = `T-${String(count + 1).padStart(3, "0")}`;

        const newUser = await User.create({
            userId,
            name,
            email,
            password, // In production, hash with bcrypt
            role: userRole,
        });

        const token = jwt.sign(
            { id: newUser.userId, email: newUser.email, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            token,
            user: { id: newUser.userId, name: newUser.name, email: newUser.email, role: newUser.role },
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── CASES ────────────

app.get("/api/cases", authMiddleware, async (req, res) => {
    try {
        const allCases = await Case.find().sort({ createdAt: -1 });
        res.json(allCases);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.get("/api/cases/:id", authMiddleware, async (req, res) => {
    try {
        const c = await Case.findOne({ caseId: req.params.id });
        if (!c) return res.status(404).json({ error: "Case not found" });
        res.json(c);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/cases", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const count = await Case.countDocuments();
        const caseId = `JF-2024-${String(count + 1).padStart(3, "0")}`;

        const newCase = await Case.create({
            caseId,
            ...req.body,
            stage: req.body.stage || "New",
        });
        res.status(201).json(newCase);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/cases/:id/stage", authMiddleware, async (req, res) => {
    try {
        const c = await Case.findOneAndUpdate(
            { caseId: req.params.id },
            { stage: req.body.stage },
            { new: true }
        );
        if (!c) return res.status(404).json({ error: "Case not found" });
        res.json(c);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── INVOICES ────────────

app.get("/api/invoices", authMiddleware, async (req, res) => {
    try {
        const allInvoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(allInvoices);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/invoices", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const amount = req.body.amount;
        const gst = Math.round(amount * 0.18);
        const count = await Invoice.countDocuments();

        const newInvoice = await Invoice.create({
            invoiceId: `INV-2024-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
            gst,
            total: amount + gst,
            status: req.body.status || "Draft",
            date: new Date(),
        });
        res.status(201).json(newInvoice);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── EXPENSES (GST-enhanced) ────────────

app.get("/api/expenses", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.caseId) filter.caseId = req.query.caseId;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.status) filter.status = req.query.status;

        const allExpenses = await Expense.find(filter).sort({ createdAt: -1 });
        res.json(allExpenses);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/expenses", authMiddleware, async (req, res) => {
    try {
        const { caseId, amount, category, description } = req.body;

        if (!caseId) return res.status(400).json({ error: "caseId is required" });
        if (!amount || !category) return res.status(400).json({ error: "amount and category are required" });

        const gstAmount = Math.round(amount * 0.18);
        const count = await Expense.countDocuments();

        const newExpense = await Expense.create({
            expenseId: `EXP-${String(count + 1).padStart(3, "0")}`,
            caseId,
            category,
            description: description || "",
            amount,
            gstAmount,
            totalWithGst: amount + gstAmount,
            loggedBy: req.user.id,
            status: "Pending",
        });
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── TRANSACTIONS (QuickBooks/Zoho Style) ────────────

app.get("/api/transactions", authMiddleware, async (req, res) => {
    try {
        const txs = await Transaction.find().sort({ date: -1 });
        res.json(txs);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/transactions", authMiddleware, async (req, res) => {
    try {
        const count = await Transaction.countDocuments();
        const trx = await Transaction.create({
            transactionId: `TRX-${String(count + 1).padStart(3, "0")}`,
            status: "Posted",
            ...req.body
        });
        res.status(201).json(trx);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// POSTING FLOW: Invoice -> Transaction
app.patch("/api/invoices/:id/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const inv = await Invoice.findOneAndUpdate({ invoiceId: req.params.id }, { status }, { new: true });
        if (!inv) return res.status(404).json({ error: "Invoice not found" });

        if (status === "Paid") {
            const count = await Transaction.countDocuments();
            await Transaction.create({
                transactionId: `TRX-${String(count + 1).padStart(3, "0")}`,
                type: "Income",
                category: "Legal Fees",
                amount: inv.total,
                status: "Posted",
                description: `Payment for Invoice ${inv.invoiceId}`,
                referenceId: inv.invoiceId,
                payee: inv.client,
                date: new Date()
            });
        }
        res.json(inv);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// POSTING FLOW: Expense -> Transaction
app.patch("/api/expenses/:id/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const exp = await Expense.findOneAndUpdate({ expenseId: req.params.id }, { status }, { new: true });
        if (!exp) return res.status(404).json({ error: "Expense not found" });

        if (status === "Approved") {
            const count = await Transaction.countDocuments();
            await Transaction.create({
                transactionId: `TRX-${String(count + 1).padStart(3, "0")}`,
                type: "Expense",
                category: exp.category,
                amount: exp.totalWithGst,
                status: "Posted",
                description: `Settlement for Expense ${exp.expenseId}`,
                referenceId: exp.expenseId,
                payee: "Vendor", // Simplified
                date: new Date()
            });
        }
        res.json(exp);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── TEAM ────────────

app.get("/api/team", authMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── DASHBOARD STATS ────────────

app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
    try {
        const allCases = await Case.find();
        const allInvoices = await Invoice.find();
        const allExpenses = await Expense.find();
        const userCount = await User.countDocuments();

        const totalRevenue = allCases.reduce((s, c) => s + c.amount, 0);
        const activeCases = allCases.filter((c) => c.stage !== "Closed").length;

        const totalPaidRevenue = allInvoices
            .filter((i) => i.status === "Paid")
            .reduce((s, i) => s + i.total, 0);

        const totalApprovedExpenses = allExpenses
            .filter((e) => e.status === "Approved")
            .reduce((s, e) => s + (e.totalWithGst || e.amount), 0);

        const currentBalance = totalPaidRevenue - totalApprovedExpenses;
        const pendingInvoices = allInvoices
            .filter((i) => i.status !== "Paid")
            .reduce((s, i) => s + i.total, 0);

        // Expense Categories Breakdown
        const expenseCategories = ["Court Filing", "Travel", "Staff Cost", "Documentation", "Expert Witness", "Miscellaneous"];
        const categoryBreakdown = expenseCategories.map(cat => {
            const catExpenses = allExpenses.filter(e => e.category === cat && e.status === "Approved");
            const catTotal = catExpenses.reduce((s, e) => s + (e.totalWithGst || e.amount), 0);
            return {
                label: cat,
                amount: catTotal,
                value: totalApprovedExpenses > 0 ? Math.round((catTotal / totalApprovedExpenses) * 100) : 0
            };
        }).sort((a, b) => b.amount - a.amount);

        // Recent Cases (Top 5)
        const recentCases = await Case.find().sort({ createdAt: -1 }).limit(5);

        // Recent Activity (Mixed feed from Cases, Invoices, Expenses)
        // For simplicity, we'll just pull the most recent entries from each and sort them
        const recentApprovedExpenses = allExpenses.filter(e => e.status === "Approved").slice(-2);
        const recentPaidInvoices = allInvoices.filter(i => i.status === "Paid").slice(-2);

        const activity = [
            ...recentApprovedExpenses.map(e => ({ action: "Expense Approved", desc: `₹${e.amount} — ${e.description}`, time: "Latest", icon: "Receipt", color: "var(--warning)" })),
            ...recentPaidInvoices.map(i => ({ action: "Invoice Paid", desc: `₹${i.total} for Case ${i.caseId}`, time: "Latest", icon: "FileText", color: "var(--teal-600)" })),
            ...recentCases.slice(0, 1).map(c => ({ action: "Case Created", desc: c.title, time: "Latest", icon: "Briefcase", color: "var(--info)" }))
        ].slice(0, 5);

        // health statistics calculations
        const monthlyBurn = totalApprovedExpenses / 12 || 50000; // Average or fallback
        const runwayValue = monthlyBurn > 0 ? (currentBalance / monthlyBurn) : 99;
        const riskLevel = runwayValue < 3 ? "High" : runwayValue < 6 ? "Medium" : "Low";
        const statusMessage = runwayValue > 6 ? "Healthy Cashflow" : "Monitor Burn Rate";

        res.json({
            currentBalance,
            totalRevenue,
            activeCases,
            pendingInvoices,
            teamCount: userCount,
            health: {
                runway: runwayValue === 99 ? "∞" : runwayValue.toFixed(1),
                riskLevel,
                statusMessage,
                monthlyBurn,
                isPositive: runwayValue > 1,
            },
            pipeline: {
                New: allCases.filter((c) => c.stage === "New").length,
                Assigned: allCases.filter((c) => c.stage === "Assigned").length,
                "In Progress": allCases.filter((c) => c.stage === "In Progress").length,
                Review: allCases.filter((c) => c.stage === "Review").length,
                Closed: allCases.filter((c) => c.stage === "Closed").length,
            },
            expenseCategories: categoryBreakdown,
            recentCases: recentCases.map(c => ({
                id: c.caseId,
                title: c.title,
                stage: c.stage,
                stageColor: c.stage === "In Progress" ? "badge-teal" : c.stage === "Review" ? "badge-warning" : "badge-info",
                amount: `₹${c.amount.toLocaleString("en-IN")}`,
                date: new Date(c.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
                assignee: "US", // Placeholder
                avatarClass: "avatar-teal"
            })),
            activity
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── CHART OF ACCOUNTS ────────────

app.get("/api/accounts", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
        const accounts = await Account.find(filter).sort({ accountCode: 1 });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/accounts", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const { accountCode, name, type } = req.body;
        if (!accountCode || !name || !type) {
            return res.status(400).json({ error: "accountCode, name, and type are required" });
        }
        const exists = await Account.findOne({ accountCode });
        if (exists) return res.status(409).json({ error: "Account code already exists" });
        const newAccount = await Account.create(req.body);
        res.status(201).json(newAccount);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/accounts/:code", authMiddleware, roleGuard("Admin"), async (req, res) => {
    try {
        const acc = await Account.findOneAndUpdate(
            { accountCode: req.params.code },
            req.body,
            { new: true }
        );
        if (!acc) return res.status(404).json({ error: "Account not found" });
        res.json(acc);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── JOURNAL ENTRIES (Double-Entry) ────────────

app.get("/api/journal-entries", authMiddleware, async (req, res) => {
    try {
        const entries = await JournalEntry.find().sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/journal-entries", authMiddleware, async (req, res) => {
    try {
        const { description, lines, date, referenceType } = req.body;
        if (!description || !lines || lines.length < 2) {
            return res.status(400).json({ error: "Description and at least 2 lines required" });
        }

        const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
        const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return res.status(400).json({ error: `Debits (₹${totalDebit}) must equal Credits (₹${totalCredit})` });
        }

        const count = await JournalEntry.countDocuments();
        const entry = await JournalEntry.create({
            entryId: `JE-${String(count + 1).padStart(3, "0")}`,
            description,
            lines,
            totalDebit,
            totalCredit,
            date: date || new Date(),
            referenceType: referenceType || "Manual",
            status: "Posted",
            createdBy: req.user.id,
        });

        // Update account balances
        for (const line of lines) {
            const acc = await Account.findOne({ accountCode: line.accountCode });
            if (acc) {
                // Assets & Expenses: Debit increases, Credit decreases
                // Liabilities, Equity, Revenue: Credit increases, Debit decreases
                if (["Asset", "Expense"].includes(acc.type)) {
                    acc.balance += (line.debit || 0) - (line.credit || 0);
                } else {
                    acc.balance += (line.credit || 0) - (line.debit || 0);
                }
                await acc.save();
            }
        }

        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── VENDORS ────────────

app.get("/api/vendors", authMiddleware, async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/vendors", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Vendor name is required" });
        const count = await Vendor.countDocuments();
        const vendor = await Vendor.create({
            vendorId: `VND-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
        });
        res.status(201).json(vendor);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/vendors/:id", authMiddleware, async (req, res) => {
    try {
        const v = await Vendor.findOneAndUpdate({ vendorId: req.params.id }, req.body, { new: true });
        if (!v) return res.status(404).json({ error: "Vendor not found" });
        res.json(v);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── BILLS (Accounts Payable) ────────────

app.get("/api/bills", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.vendorId) filter.vendorId = req.query.vendorId;
        const bills = await Bill.find(filter).sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/bills", authMiddleware, async (req, res) => {
    try {
        const { vendorId, amount } = req.body;
        if (!vendorId || !amount) return res.status(400).json({ error: "vendorId and amount are required" });

        const gst = Math.round(amount * 0.18);
        const count = await Bill.countDocuments();

        const vendor = await Vendor.findOne({ vendorId });
        const bill = await Bill.create({
            billId: `BILL-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
            vendorName: vendor?.name || req.body.vendorName || "Unknown",
            gst,
            total: amount + gst,
            status: req.body.status || "Pending",
        });

        // Update vendor outstanding balance
        if (vendor) {
            vendor.outstandingBalance += bill.total;
            await vendor.save();
        }

        res.status(201).json(bill);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/bills/:id/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const bill = await Bill.findOneAndUpdate({ billId: req.params.id }, { status }, { new: true });
        if (!bill) return res.status(404).json({ error: "Bill not found" });

        if (status === "Paid") {
            // Create transaction for the payment
            const txCount = await Transaction.countDocuments();
            await Transaction.create({
                transactionId: `TRX-${String(txCount + 1).padStart(3, "0")}`,
                type: "Expense",
                category: "Bill Payment",
                amount: bill.total,
                status: "Posted",
                description: `Payment for Bill ${bill.billId} to ${bill.vendorName}`,
                referenceId: bill.billId,
                payee: bill.vendorName,
                date: new Date(),
            });

            // Update vendor balances
            const vendor = await Vendor.findOne({ vendorId: bill.vendorId });
            if (vendor) {
                vendor.totalPaid += bill.total;
                vendor.outstandingBalance = Math.max(0, vendor.outstandingBalance - bill.total);
                await vendor.save();
            }
        }

        res.json(bill);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── COMPANY SETTINGS ────────────

app.get("/api/settings", authMiddleware, async (req, res) => {
    try {
        let settings = await CompanySettings.findOne();
        if (!settings) settings = await CompanySettings.create({});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/settings", authMiddleware, roleGuard("Admin"), async (req, res) => {
    try {
        let settings = await CompanySettings.findOne();
        if (!settings) settings = await CompanySettings.create(req.body);
        else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── FINANCIAL REPORTS (Bigcapital-inspired) ────────────

// Profit & Loss Statement
app.get("/api/reports/profit-loss", authMiddleware, async (req, res) => {
    try {
        const revenueAccounts = await Account.find({ type: "Revenue" });
        const expenseAccounts = await Account.find({ type: "Expense" });

        const totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0);
        const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0);
        const netIncome = totalRevenue - totalExpenses;

        // Also compute from actual invoices and expenses
        const paidInvoices = await Invoice.find({ status: "Paid" });
        const approvedExpenses = await Expense.find({ status: "Approved" });

        const invoiceRevenue = paidInvoices.reduce((s, i) => s + i.total, 0);
        const expenseTotal = approvedExpenses.reduce((s, e) => s + (e.totalWithGst || e.amount), 0);

        res.json({
            period: "Current Financial Year",
            revenue: {
                accounts: revenueAccounts.map(a => ({ code: a.accountCode, name: a.name, balance: a.balance })),
                fromInvoices: invoiceRevenue,
                total: Math.max(totalRevenue, invoiceRevenue),
            },
            expenses: {
                accounts: expenseAccounts.map(a => ({ code: a.accountCode, name: a.name, balance: a.balance })),
                fromExpenses: expenseTotal,
                total: Math.max(totalExpenses, expenseTotal),
            },
            netIncome: Math.max(totalRevenue, invoiceRevenue) - Math.max(totalExpenses, expenseTotal),
            generatedAt: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Balance Sheet
app.get("/api/reports/balance-sheet", authMiddleware, async (req, res) => {
    try {
        const assets = await Account.find({ type: "Asset" });
        const liabilities = await Account.find({ type: "Liability" });
        const equity = await Account.find({ type: "Equity" });

        const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
        const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
        const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

        res.json({
            period: "As of Today",
            assets: {
                accounts: assets.map(a => ({ code: a.accountCode, name: a.name, subType: a.subType, balance: a.balance })),
                total: totalAssets,
            },
            liabilities: {
                accounts: liabilities.map(a => ({ code: a.accountCode, name: a.name, subType: a.subType, balance: a.balance })),
                total: totalLiabilities,
            },
            equity: {
                accounts: equity.map(a => ({ code: a.accountCode, name: a.name, subType: a.subType, balance: a.balance })),
                total: totalEquity,
            },
            isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
            generatedAt: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Cash Flow Statement
app.get("/api/reports/cash-flow", authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: "Posted" });
        const income = transactions.filter(t => t.type === "Income");
        const expenses = transactions.filter(t => t.type === "Expense");

        const totalIncome = income.reduce((s, t) => s + t.amount, 0);
        const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
        const netCashFlow = totalIncome - totalExpense;

        // Group by category
        const categoryMap = {};
        transactions.forEach(t => {
            if (!categoryMap[t.category]) categoryMap[t.category] = { income: 0, expense: 0 };
            if (t.type === "Income") categoryMap[t.category].income += t.amount;
            else categoryMap[t.category].expense += t.amount;
        });

        // Monthly breakdown
        const monthlyMap = {};
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString("en-IN", { month: "short", year: "numeric" });
            if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
            if (t.type === "Income") monthlyMap[month].income += t.amount;
            else monthlyMap[month].expense += t.amount;
        });

        res.json({
            period: "Current Financial Year",
            operating: {
                inflows: totalIncome,
                outflows: totalExpense,
                net: netCashFlow,
            },
            byCategory: Object.entries(categoryMap).map(([cat, vals]) => ({
                category: cat,
                ...vals,
                net: vals.income - vals.expense,
            })),
            monthly: Object.entries(monthlyMap).map(([month, vals]) => ({
                month,
                ...vals,
                net: vals.income - vals.expense,
            })),
            totalTransactions: transactions.length,
            generatedAt: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── BANK ACCOUNTS ────────────

app.get("/api/bank-accounts", authMiddleware, async (req, res) => {
    try {
        const accounts = await BankAccount.find().sort({ bankAccountId: 1 });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/bank-accounts", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const { bankName, accountNumber } = req.body;
        if (!bankName || !accountNumber) return res.status(400).json({ error: "bankName and accountNumber are required" });
        const count = await BankAccount.countDocuments();
        const account = await BankAccount.create({
            bankAccountId: `BA-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
            currentBalance: req.body.openingBalance || 0,
        });
        res.status(201).json(account);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── BANK TRANSACTIONS & RECONCILIATION ────────────

app.get("/api/bank-transactions", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.bankAccountId) filter.bankAccountId = req.query.bankAccountId;
        if (req.query.status) filter.reconciliationStatus = req.query.status;
        const txns = await BankTransaction.find(filter).sort({ date: -1 });
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/bank-transactions", authMiddleware, async (req, res) => {
    try {
        const { bankAccountId, date, description, amount, type } = req.body;
        if (!bankAccountId || !date || !description || !amount || !type)
            return res.status(400).json({ error: "bankAccountId, date, description, amount, and type are required" });

        const count = await BankTransaction.countDocuments();
        const txn = await BankTransaction.create({
            bankTxnId: `BTX-${String(count + 1).padStart(4, "0")}`,
            ...req.body,
        });

        // Update bank account balance
        const bank = await BankAccount.findOne({ bankAccountId });
        if (bank) {
            bank.currentBalance += type === "Credit" ? Math.abs(amount) : -Math.abs(amount);
            await bank.save();
        }

        res.status(201).json(txn);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Bulk import bank transactions (CSV-style array)
app.post("/api/bank-transactions/import", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const { bankAccountId, transactions } = req.body;
        if (!bankAccountId || !transactions || !transactions.length)
            return res.status(400).json({ error: "bankAccountId and transactions array are required" });

        let count = await BankTransaction.countDocuments();
        const created = [];
        for (const t of transactions) {
            count++;
            const txn = await BankTransaction.create({
                bankTxnId: `BTX-${String(count).padStart(4, "0")}`,
                bankAccountId,
                date: t.date,
                description: t.description,
                reference: t.reference || "",
                amount: t.amount,
                type: t.type || (t.amount >= 0 ? "Credit" : "Debit"),
                runningBalance: t.runningBalance || 0,
                source: "Import",
            });
            created.push(txn);
        }
        res.status(201).json({ imported: created.length, transactions: created });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Auto-match bank transactions with system transactions
app.post("/api/bank-transactions/auto-match", authMiddleware, async (req, res) => {
    try {
        const { bankAccountId } = req.body;
        const unmatched = await BankTransaction.find({ bankAccountId, reconciliationStatus: "Unmatched" });
        const systemTxns = await Transaction.find({ status: "Posted" });
        const invoices = await Invoice.find();
        const bills = await Bill.find();

        let matchCount = 0;
        for (const btxn of unmatched) {
            // Try matching with system transactions (amount + date within 3 days)
            const match = systemTxns.find(st => {
                const amountMatch = Math.abs(st.amount - Math.abs(btxn.amount)) < 1;
                const dateMatch = Math.abs(new Date(st.date) - new Date(btxn.date)) < 3 * 86400000;
                return amountMatch && dateMatch;
            });

            if (match) {
                btxn.matchedTransactionId = match.transactionId;
                btxn.reconciliationStatus = "Matched";
                await btxn.save();
                matchCount++;
                continue;
            }

            // Try matching with invoices (paid amount)
            if (btxn.type === "Credit") {
                const invMatch = invoices.find(i => i.status === "Paid" && Math.abs(i.total - Math.abs(btxn.amount)) < 1);
                if (invMatch) {
                    btxn.matchedInvoiceId = invMatch.invoiceId;
                    btxn.reconciliationStatus = "Matched";
                    await btxn.save();
                    matchCount++;
                    continue;
                }
            }

            // Try matching with bills (paid amount)
            if (btxn.type === "Debit") {
                const billMatch = bills.find(b => b.status === "Paid" && Math.abs(b.total - Math.abs(btxn.amount)) < 1);
                if (billMatch) {
                    btxn.matchedBillId = billMatch.billId;
                    btxn.reconciliationStatus = "Matched";
                    await btxn.save();
                    matchCount++;
                }
            }
        }

        res.json({ matched: matchCount, total: unmatched.length });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Confirm reconciliation
app.patch("/api/bank-transactions/:id/reconcile", authMiddleware, async (req, res) => {
    try {
        const { status, matchedTransactionId, matchedInvoiceId, matchedBillId } = req.body;
        const update = { reconciliationStatus: status || "Reconciled" };
        if (matchedTransactionId) update.matchedTransactionId = matchedTransactionId;
        if (matchedInvoiceId) update.matchedInvoiceId = matchedInvoiceId;
        if (matchedBillId) update.matchedBillId = matchedBillId;

        const txn = await BankTransaction.findOneAndUpdate({ bankTxnId: req.params.id }, update, { new: true });
        if (!txn) return res.status(404).json({ error: "Bank transaction not found" });

        // If reconciled, update bank account last reconciled date
        if (update.reconciliationStatus === "Reconciled") {
            await BankAccount.findOneAndUpdate({ bankAccountId: txn.bankAccountId }, { lastReconciled: new Date() });
        }

        res.json(txn);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Reconciliation summary
app.get("/api/reconciliation/summary", authMiddleware, async (req, res) => {
    try {
        const bankAccountId = req.query.bankAccountId;
        const filter = bankAccountId ? { bankAccountId } : {};
        const allTxns = await BankTransaction.find(filter);
        const bankAccounts = await BankAccount.find();

        const summary = {
            totalTransactions: allTxns.length,
            unmatched: allTxns.filter(t => t.reconciliationStatus === "Unmatched").length,
            matched: allTxns.filter(t => t.reconciliationStatus === "Matched").length,
            reconciled: allTxns.filter(t => t.reconciliationStatus === "Reconciled").length,
            excluded: allTxns.filter(t => t.reconciliationStatus === "Excluded").length,
            bankAccounts: bankAccounts.map(b => ({
                ...b.toObject(),
                bankBalance: b.currentBalance,
                bookBalance: allTxns.filter(t => t.bankAccountId === b.bankAccountId && t.reconciliationStatus === "Reconciled").reduce((s, t) => s + (t.type === "Credit" ? t.amount : -t.amount), b.openingBalance),
            })),
        };
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── CASH POSITION & FORECASTING ────────────

app.get("/api/cash-position", authMiddleware, async (req, res) => {
    try {
        const bankAccounts = await BankAccount.find({ isActive: true });
        const totalCash = bankAccounts.reduce((s, b) => s + b.currentBalance, 0);

        // Receivables (unpaid invoices)
        const pendingInvoices = await Invoice.find({ status: { $in: ["Sent", "Overdue"] } });
        const totalReceivables = pendingInvoices.reduce((s, i) => s + i.total, 0);

        // Payables (unpaid bills)
        const pendingBills = await Bill.find({ status: { $in: ["Pending", "Overdue"] } });
        const totalPayables = pendingBills.reduce((s, b) => s + b.total, 0);

        // Net position
        const netPosition = totalCash + totalReceivables - totalPayables;

        res.json({
            totalCash,
            totalReceivables,
            totalPayables,
            netPosition,
            bankAccounts: bankAccounts.map(b => ({ id: b.bankAccountId, name: b.bankName, type: b.accountType, balance: b.currentBalance })),
            pendingInvoiceCount: pendingInvoices.length,
            pendingBillCount: pendingBills.length,
            generatedAt: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.get("/api/cash-forecast", authMiddleware, async (req, res) => {
    try {
        const forecasts = await CashForecast.find({ status: "Projected" }).sort({ forecastDate: 1 });
        const bankAccounts = await BankAccount.find({ isActive: true });
        const currentCash = bankAccounts.reduce((s, b) => s + b.currentBalance, 0);

        // Build 90-day projection
        const today = new Date();
        const projection = [];
        let runningBalance = currentCash;

        for (let d = 0; d < 90; d++) {
            const date = new Date(today);
            date.setDate(date.getDate() + d);
            const dateStr = date.toISOString().split("T")[0];

            const dayForecasts = forecasts.filter(f => {
                const fDate = new Date(f.forecastDate).toISOString().split("T")[0];
                return fDate === dateStr;
            });

            let dayInflow = 0, dayOutflow = 0;
            dayForecasts.forEach(f => {
                const weighted = f.amount * (f.probability / 100);
                if (f.type.includes("Inflow")) dayInflow += weighted;
                else dayOutflow += weighted;
            });

            runningBalance += dayInflow - dayOutflow;
            if (dayInflow > 0 || dayOutflow > 0 || d % 7 === 0) {
                projection.push({ date: dateStr, inflow: dayInflow, outflow: dayOutflow, balance: Math.round(runningBalance) });
            }
        }

        // Summary
        const totalExpectedInflow = forecasts.filter(f => f.type.includes("Inflow")).reduce((s, f) => s + f.amount * (f.probability / 100), 0);
        const totalExpectedOutflow = forecasts.filter(f => f.type.includes("Outflow")).reduce((s, f) => s + f.amount * (f.probability / 100), 0);

        res.json({
            currentCash,
            totalExpectedInflow: Math.round(totalExpectedInflow),
            totalExpectedOutflow: Math.round(totalExpectedOutflow),
            projectedBalance: Math.round(currentCash + totalExpectedInflow - totalExpectedOutflow),
            forecasts,
            projection,
            generatedAt: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/cash-forecast", authMiddleware, async (req, res) => {
    try {
        const { forecastDate, type, amount } = req.body;
        if (!forecastDate || !type || !amount) return res.status(400).json({ error: "forecastDate, type, and amount are required" });
        const count = await CashForecast.countDocuments();
        const forecast = await CashForecast.create({
            forecastId: `CF-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
        });
        res.status(201).json(forecast);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/cash-forecast/:id", authMiddleware, async (req, res) => {
    try {
        const f = await CashForecast.findOneAndUpdate({ forecastId: req.params.id }, req.body, { new: true });
        if (!f) return res.status(404).json({ error: "Forecast not found" });
        res.json(f);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── SALES ORDERS ────────────

app.get("/api/sales-orders", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const orders = await SalesOrder.find(filter).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/sales-orders", authMiddleware, async (req, res) => {
    try {
        const { client, items, isInterState } = req.body;
        if (!client || !items || !items.length) return res.status(400).json({ error: "client and items are required" });

        // Calculate GST for each item
        let subtotal = 0;
        let totalCgst = 0, totalSgst = 0, totalIgst = 0;
        const processedItems = items.map(item => {
            const amount = item.quantity * item.rate;
            const gstRate = item.gstRate || 18;
            const gstAmount = Math.round(amount * gstRate / 100);
            subtotal += amount;
            if (isInterState) {
                totalIgst += gstAmount;
            } else {
                totalCgst += Math.round(gstAmount / 2);
                totalSgst += Math.round(gstAmount / 2);
            }
            return { ...item, amount, gstAmount };
        });

        const totalGst = totalCgst + totalSgst + totalIgst;
        const count = await SalesOrder.countDocuments();

        const order = await SalesOrder.create({
            soId: `SO-${String(count + 1).padStart(3, "0")}`,
            client,
            clientGstin: req.body.clientGstin,
            caseId: req.body.caseId,
            items: processedItems,
            subtotal,
            cgst: totalCgst,
            sgst: totalSgst,
            igst: totalIgst,
            totalGst,
            grandTotal: subtotal + totalGst,
            isInterState: isInterState || false,
            placeOfSupply: req.body.placeOfSupply,
            orderDate: req.body.orderDate || new Date(),
            deliveryDate: req.body.deliveryDate,
            notes: req.body.notes,
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/sales-orders/:id/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await SalesOrder.findOneAndUpdate({ soId: req.params.id }, { status }, { new: true });
        if (!order) return res.status(404).json({ error: "Sales order not found" });

        // If marked as Invoiced, auto-create invoice
        if (status === "Invoiced" && !order.invoiceId) {
            const invCount = await Invoice.countDocuments();
            const inv = await Invoice.create({
                invoiceId: `INV-2024-${String(invCount + 1).padStart(3, "0")}`,
                caseId: order.caseId || "GENERAL",
                client: order.client,
                amount: order.subtotal,
                gst: order.totalGst,
                total: order.grandTotal,
                status: "Sent",
                date: new Date(),
            });
            order.invoiceId = inv.invoiceId;
            await order.save();
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── PURCHASE ORDERS ────────────

app.get("/api/purchase-orders", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.vendorId) filter.vendorId = req.query.vendorId;
        const orders = await PurchaseOrder.find(filter).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/purchase-orders", authMiddleware, async (req, res) => {
    try {
        const { vendorId, items, isInterState } = req.body;
        if (!vendorId || !items || !items.length) return res.status(400).json({ error: "vendorId and items are required" });

        const vendor = await Vendor.findOne({ vendorId });
        let subtotal = 0;
        let totalCgst = 0, totalSgst = 0, totalIgst = 0;
        const processedItems = items.map(item => {
            const amount = item.quantity * item.rate;
            const gstRate = item.gstRate || 18;
            const gstAmount = Math.round(amount * gstRate / 100);
            subtotal += amount;
            if (isInterState) {
                totalIgst += gstAmount;
            } else {
                totalCgst += Math.round(gstAmount / 2);
                totalSgst += Math.round(gstAmount / 2);
            }
            return { ...item, amount, gstAmount, receivedQty: 0 };
        });

        const totalGst = totalCgst + totalSgst + totalIgst;
        const count = await PurchaseOrder.countDocuments();

        const order = await PurchaseOrder.create({
            poId: `PO-${String(count + 1).padStart(3, "0")}`,
            vendorId,
            vendorName: vendor?.name || req.body.vendorName || "Unknown",
            vendorGstin: vendor?.gstin || req.body.vendorGstin,
            items: processedItems,
            subtotal,
            cgst: totalCgst,
            sgst: totalSgst,
            igst: totalIgst,
            totalGst,
            grandTotal: subtotal + totalGst,
            isInterState: isInterState || false,
            placeOfSupply: req.body.placeOfSupply,
            orderDate: req.body.orderDate || new Date(),
            expectedDate: req.body.expectedDate,
            notes: req.body.notes,
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/purchase-orders/:id/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await PurchaseOrder.findOneAndUpdate({ poId: req.params.id }, { status }, { new: true });
        if (!order) return res.status(404).json({ error: "Purchase order not found" });

        // If received, update inventory
        if (status === "Received") {
            for (const item of order.items) {
                if (item.itemId) {
                    const invItem = await InventoryItem.findOne({ itemId: item.itemId });
                    if (invItem) {
                        invItem.currentStock += item.quantity;
                        invItem.totalValue = invItem.currentStock * invItem.purchaseRate;
                        invItem.lastRestocked = new Date();
                        await invItem.save();
                    }
                }
            }
        }

        // If marked as Billed, auto-create bill
        if (status === "Billed" && !order.billId) {
            const billCount = await Bill.countDocuments();
            const bill = await Bill.create({
                billId: `BILL-${String(billCount + 1).padStart(3, "0")}`,
                vendorId: order.vendorId,
                vendorName: order.vendorName,
                amount: order.subtotal,
                gst: order.totalGst,
                total: order.grandTotal,
                status: "Pending",
                description: `Bill from PO ${order.poId}`,
            });
            order.billId = bill.billId;
            await order.save();

            // Update vendor outstanding
            const vendor = await Vendor.findOne({ vendorId: order.vendorId });
            if (vendor) {
                vendor.outstandingBalance += bill.total;
                await vendor.save();
            }
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── INVENTORY ────────────

app.get("/api/inventory", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.lowStock === "true") filter.$expr = { $lte: ["$currentStock", "$reorderLevel"] };
        const items = await InventoryItem.find(filter).sort({ itemId: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/inventory", authMiddleware, roleGuard("Admin", "Manager"), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Item name is required" });
        const count = await InventoryItem.countDocuments();
        const item = await InventoryItem.create({
            itemId: `ITEM-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
            totalValue: (req.body.currentStock || 0) * (req.body.purchaseRate || 0),
        });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/inventory/:id", authMiddleware, async (req, res) => {
    try {
        const item = await InventoryItem.findOneAndUpdate({ itemId: req.params.id }, req.body, { new: true });
        if (!item) return res.status(404).json({ error: "Item not found" });
        item.totalValue = item.currentStock * item.purchaseRate;
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Stock adjustment
app.post("/api/inventory/:id/adjust", authMiddleware, async (req, res) => {
    try {
        const { adjustment, reason } = req.body; // adjustment can be + or -
        const item = await InventoryItem.findOne({ itemId: req.params.id });
        if (!item) return res.status(404).json({ error: "Item not found" });

        item.currentStock += adjustment;
        item.totalValue = item.currentStock * item.purchaseRate;
        if (adjustment > 0) item.lastRestocked = new Date();
        await item.save();

        res.json({ item, adjustment, reason });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// Low stock alerts
app.get("/api/inventory/alerts/low-stock", authMiddleware, async (req, res) => {
    try {
        const items = await InventoryItem.find({ isActive: true });
        const lowStock = items.filter(i => i.currentStock <= i.reorderLevel);
        res.json({
            alertCount: lowStock.length,
            items: lowStock.map(i => ({
                itemId: i.itemId,
                name: i.name,
                currentStock: i.currentStock,
                reorderLevel: i.reorderLevel,
                deficit: i.reorderLevel - i.currentStock,
                estimatedCost: (i.reorderLevel - i.currentStock) * i.purchaseRate,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── TAX PROFILES & GST COMPLIANCE ────────────

app.get("/api/tax-profiles", authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.taxType) filter.taxType = req.query.taxType;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
        const profiles = await TaxProfile.find(filter).sort({ rate: 1 });
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.post("/api/tax-profiles", authMiddleware, roleGuard("Admin"), async (req, res) => {
    try {
        const { name, rate } = req.body;
        if (!name || rate === undefined) return res.status(400).json({ error: "name and rate are required" });
        const count = await TaxProfile.countDocuments();
        const profile = await TaxProfile.create({
            profileId: `TAX-${String(count + 1).padStart(3, "0")}`,
            ...req.body,
        });
        res.status(201).json(profile);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

app.patch("/api/tax-profiles/:id", authMiddleware, roleGuard("Admin"), async (req, res) => {
    try {
        const profile = await TaxProfile.findOneAndUpdate({ profileId: req.params.id }, req.body, { new: true });
        if (!profile) return res.status(404).json({ error: "Tax profile not found" });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// GST Summary Report (GSTR-style)
app.get("/api/reports/gst-summary", authMiddleware, async (req, res) => {
    try {
        // Output GST (collected from clients - invoices)
        const paidInvoices = await Invoice.find({ status: "Paid" });
        const totalOutputGst = paidInvoices.reduce((s, i) => s + i.gst, 0);

        // Input GST (paid to vendors - expenses + bills)
        const approvedExpenses = await Expense.find({ status: "Approved" });
        const paidBills = await Bill.find({ status: "Paid" });
        const totalInputGstExpenses = approvedExpenses.reduce((s, e) => s + (e.gstAmount || 0), 0);
        const totalInputGstBills = paidBills.reduce((s, b) => s + (b.gst || 0), 0);
        const totalInputGst = totalInputGstExpenses + totalInputGstBills;

        // Net GST liability
        const netGstLiability = totalOutputGst - totalInputGst;

        // Sales orders with GST split
        const salesOrders = await SalesOrder.find({ status: { $ne: "Cancelled" } });
        const totalSoCgst = salesOrders.reduce((s, so) => s + so.cgst, 0);
        const totalSoSgst = salesOrders.reduce((s, so) => s + so.sgst, 0);
        const totalSoIgst = salesOrders.reduce((s, so) => s + so.igst, 0);

        // Purchase orders with GST split
        const purchaseOrders = await PurchaseOrder.find({ status: { $ne: "Cancelled" } });
        const totalPoCgst = purchaseOrders.reduce((s, po) => s + po.cgst, 0);
        const totalPoSgst = purchaseOrders.reduce((s, po) => s + po.sgst, 0);
        const totalPoIgst = purchaseOrders.reduce((s, po) => s + po.igst, 0);

        // Tax profiles
        const taxProfiles = await TaxProfile.find({ isActive: true, taxType: "GST" });

        res.json({
            period: "Current Financial Year",
            outputGst: {
                total: totalOutputGst,
                fromInvoices: totalOutputGst,
                cgst: totalSoCgst,
                sgst: totalSoSgst,
                igst: totalSoIgst,
            },
            inputGst: {
                total: totalInputGst,
                fromExpenses: totalInputGstExpenses,
                fromBills: totalInputGstBills,
                cgst: totalPoCgst,
                sgst: totalPoSgst,
                igst: totalPoIgst,
            },
            netLiability: netGstLiability,
            itcAvailable: totalInputGst,
            gstPayable: Math.max(0, netGstLiability),
            gstRefundable: Math.max(0, -netGstLiability),
            taxSlabs: taxProfiles.map(t => ({
                name: t.name,
                rate: t.rate,
                cgst: t.cgstRate,
                sgst: t.sgstRate,
                igst: t.igstRate,
            })),
            generatedAt: new Date(),
        });
    } catch (err) {
        res.status(500).json({ error: "Server error", message: err.message });
    }
});

// ──────────── PYTHON AI PROXY ────────────

app.get("/api/ai/profit-margin/:caseId", authMiddleware, async (req, res) => {
    const pythonUrl = process.env.PYTHON_AI_URL || "http://localhost:8000";
    try {
        const response = await fetch(`${pythonUrl}/api/profit-margin/${req.params.caseId}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(503).json({ error: "AI service unavailable", message: error.message });
    }
});

app.post("/api/ai/analyze-expense", authMiddleware, async (req, res) => {
    const pythonUrl = process.env.PYTHON_AI_URL || "http://localhost:8000";
    try {
        const response = await fetch(`${pythonUrl}/analyze/expense`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(503).json({ error: "AI service unavailable", message: error.message });
    }
});

// ============ Start Server ============
app.listen(PORT, async () => {
    console.log(`\n🏛️  solvstrat API running on http://localhost:${PORT}`);
    console.log(`💾 Database: ${MONGO_URI}`);
    console.log(`📋 Endpoints:`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/signup`);
    console.log(`   GET  /api/cases`);
    console.log(`   GET  /api/invoices`);
    console.log(`   GET  /api/expenses`);
    console.log(`   GET  /api/bank-accounts`);
    console.log(`   GET  /api/bank-transactions`);
    console.log(`   GET  /api/cash-position`);
    console.log(`   GET  /api/cash-forecast`);
    console.log(`   GET  /api/sales-orders`);
    console.log(`   GET  /api/purchase-orders`);
    console.log(`   GET  /api/inventory`);
    console.log(`   GET  /api/tax-profiles`);
    console.log(`   GET  /api/reports/gst-summary\n`);

    // Seed DB after server starts
    await seedDatabase();
});
