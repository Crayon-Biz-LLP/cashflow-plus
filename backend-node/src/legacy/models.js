const mongoose = require("mongoose");

// ============ User Schema ============
const UserSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true }, // e.g., "T-001"
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["Admin", "Manager", "Staff"],
            default: "Staff",
        },
        phone: String,
        status: {
            type: String,
            enum: ["Active", "Away", "Offline"],
            default: "Active",
        },
    },
    { timestamps: true }
);

// ============ Case Schema ============
const CaseSchema = new mongoose.Schema(
    {
        caseId: { type: String, required: true, unique: true }, // e.g., "JF-2024-001"
        title: { type: String, required: true },
        client: { type: String, required: true },
        stage: {
            type: String,
            enum: ["New", "Assigned", "In Progress", "Review", "Closed"],
            default: "New",
        },
        priority: {
            type: String,
            enum: ["Critical", "High", "Medium", "Low"],
            default: "Medium",
        },
        assigneeId: { type: String, ref: "User" }, // String-based reference
        amount: { type: Number, default: 0 },
        tags: [String],
        dueDate: Date,
        notes: String,
    },
    { timestamps: true }
);

// ============ Invoice Schema ============
const InvoiceSchema = new mongoose.Schema(
    {
        invoiceId: { type: String, required: true, unique: true }, // e.g., "INV-2024-001"
        caseId: { type: String, required: true }, // Links to Case.caseId
        client: { type: String, required: true },
        title: String,
        amount: { type: Number, required: true },
        gst: { type: Number, required: true }, // 18% GST
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Draft", "Sent", "Paid", "Overdue"],
            default: "Draft",
        },
        taxProfileId: String, // Links to TaxProfile.profileId
        taxType: String, // "GST" or "Sales Tax"
        taxRate: Number,
        taxAmount: Number, // Replaces gst for multi-region support
        date: { type: Date, default: Date.now },
        dueDate: Date,
    },
    { timestamps: true }
);

// ============ Expense Schema ============
const ExpenseSchema = new mongoose.Schema(
    {
        expenseId: { type: String, required: true, unique: true }, // e.g., "EXP-001"
        caseId: { type: String, required: true }, // MUST link to a CaseID
        category: {
            type: String,
            enum: [
                "Court Filing",
                "Travel",
                "Staff Cost",
                "Documentation",
                "Expert Witness",
                "Miscellaneous",
            ],
            required: true,
        },
        description: String,
        amount: { type: Number, required: true },
        gstAmount: { type: Number, default: 0 }, // Auto-calculated 18%
        totalWithGst: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
        loggedBy: { type: String }, // String-based reference to User.userId
        taxProfileId: String,
        taxType: String,
        taxRate: Number,
        taxAmount: Number, // Auto-calculated based on profile
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        bankAccountId: { type: String }, // Links to BankAccount
    },
    { timestamps: true }
);

// ============ TimeLog Schema ============
const TimeLogSchema = new mongoose.Schema(
    {
        caseId: { type: String, required: true }, // MUST link to a CaseID
        staffId: { type: String }, // String-based reference to User.userId
        hours: { type: Number, required: true },
        costPerHour: { type: Number, required: true },
        description: String,
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// ============ Transaction Schema (General Ledger) ============
const TransactionSchema = new mongoose.Schema(
    {
        transactionId: { type: String, required: true, unique: true }, // e.g., "TRX-001"
        type: {
            type: String,
            enum: ["Income", "Expense", "Transfer"],
            required: true,
        },
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Posted", "Void"],
            default: "Pending",
        },
        date: { type: Date, default: Date.now },
        description: String,
        referenceId: String, // ID of Invoice, Expense, or Case
        payee: String, // Client or Vendor name
    },
    { timestamps: true }
);

// ============ Notification Schema ============
const NotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["alert", "info", "warning", "success"],
            required: true,
        },
        title: { type: String, required: true },
        description: String,
        targetRoles: [
            {
                type: String,
                enum: ["Admin", "Manager", "Staff"],
            },
        ],
        targetUserId: { type: String },
        caseId: { type: String },
        isRead: { type: Boolean, default: false },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
    },
    { timestamps: true }
);

// ============ Chart of Accounts Schema ============
const AccountSchema = new mongoose.Schema(
    {
        accountCode: { type: String, required: true, unique: true }, // e.g., "1000"
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
            required: true,
        },
        subType: { type: String }, // e.g., "Current Asset", "Fixed Asset"
        description: String,
        balance: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        parentAccountCode: { type: String }, // For sub-accounts
    },
    { timestamps: true }
);

// ============ Journal Entry Schema (Double-Entry) ============
const JournalEntrySchema = new mongoose.Schema(
    {
        entryId: { type: String, required: true, unique: true }, // e.g., "JE-001"
        date: { type: Date, default: Date.now },
        description: { type: String, required: true },
        referenceId: String, // Link to Invoice/Expense/Transaction
        referenceType: {
            type: String,
            enum: ["Invoice", "Expense", "Bill", "Manual", "Transfer"],
            default: "Manual",
        },
        lines: [
            {
                accountCode: { type: String, required: true },
                accountName: String,
                debit: { type: Number, default: 0 },
                credit: { type: Number, default: 0 },
                description: String,
            },
        ],
        totalDebit: { type: Number, default: 0 },
        totalCredit: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Draft", "Posted", "Void"],
            default: "Draft",
        },
        createdBy: String,
    },
    { timestamps: true }
);

// ============ Vendor Schema ============
const VendorSchema = new mongoose.Schema(
    {
        vendorId: { type: String, required: true, unique: true }, // e.g., "VND-001"
        name: { type: String, required: true },
        email: String,
        phone: String,
        address: String,
        gstin: String, // GST Identification Number
        category: {
            type: String,
            enum: ["Legal Services", "Travel", "Office Supplies", "Technology", "Consulting", "Other"],
            default: "Other",
        },
        totalPaid: { type: Number, default: 0 },
        outstandingBalance: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ============ Bill Schema (Accounts Payable) ============
const BillSchema = new mongoose.Schema(
    {
        billId: { type: String, required: true, unique: true }, // e.g., "BILL-001"
        vendorId: { type: String, required: true },
        vendorName: String,
        caseId: String, // Optional link to a case
        amount: { type: Number, required: true },
        gst: { type: Number, default: 0 },
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Draft", "Pending", "Paid", "Overdue", "Void"],
            default: "Draft",
        },
        date: { type: Date, default: Date.now },
        dueDate: Date,
        description: String,
        items: [
            {
                description: String,
                quantity: { type: Number, default: 1 },
                rate: { type: Number, default: 0 },
                amount: { type: Number, default: 0 },
            },
        ],
    },
    { timestamps: true }
);

// ============ Company Settings Schema ============
const CompanySettingsSchema = new mongoose.Schema(
    {
        companyName: { type: String, default: "solvstrat" },
        legalName: String,
        gstin: String,
        pan: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
        currency: { type: String, default: "INR" },
        financialYearStart: { type: String, default: "April" },
        taxRate: { type: Number, default: 18 }, // GST %
        logoUrl: String,
        invoicePrefix: { type: String, default: "INV" },
        billPrefix: { type: String, default: "BILL" },
    },
    { timestamps: true }
);

// ============ Bank Account Schema ============
const BankAccountSchema = new mongoose.Schema(
    {
        bankAccountId: { type: String, required: true, unique: true }, // e.g., "BA-001"
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: String,
        accountType: {
            type: String,
            enum: ["Current", "Savings", "Cash-in-Hand", "Petty Cash"],
            default: "Current",
        },
        currency: { type: String, default: "INR" },
        openingBalance: { type: Number, default: 0 },
        currentBalance: { type: Number, default: 0 },
        linkedAccountCode: { type: String }, // Links to Chart of Accounts
        isActive: { type: Boolean, default: true },
        lastReconciled: Date,
    },
    { timestamps: true }
);

// ============ Bank Transaction Schema (for reconciliation) ============
const BankTransactionSchema = new mongoose.Schema(
    {
        bankTxnId: { type: String, required: true, unique: true }, // e.g., "BTX-001"
        bankAccountId: { type: String, required: true },
        date: { type: Date, required: true },
        description: { type: String, required: true },
        reference: String, // Cheque no, UTR, NEFT ref
        amount: { type: Number, required: true }, // Positive = credit, Negative = debit
        type: { type: String, enum: ["Credit", "Debit"], required: true },
        runningBalance: { type: Number, default: 0 },
        matchedTransactionId: String, // Links to Transaction.transactionId
        matchedInvoiceId: String,
        matchedBillId: String,
        reconciliationStatus: {
            type: String,
            enum: ["Unmatched", "Matched", "Reconciled", "Excluded"],
            default: "Unmatched",
        },
        source: {
            type: String,
            enum: ["Import", "Manual", "Auto"],
            default: "Manual",
        },
    },
    { timestamps: true }
);

// ============ Cash Forecast Schema ============
const CashForecastSchema = new mongoose.Schema(
    {
        forecastId: { type: String, required: true, unique: true },
        forecastDate: { type: Date, required: true },
        type: {
            type: String,
            enum: ["Expected Inflow", "Expected Outflow", "Recurring Inflow", "Recurring Outflow"],
            required: true,
        },
        category: String, // "Salary", "Rent", "Client Payment", etc.
        description: String,
        amount: { type: Number, required: true },
        probability: { type: Number, default: 100, min: 0, max: 100 }, // % likelihood
        isRecurring: { type: Boolean, default: false },
        recurringInterval: { type: String, enum: ["Weekly", "Monthly", "Quarterly", "Yearly"] },
        linkedReferenceId: String, // Link to Invoice/Bill/SO/PO
        linkedReferenceType: { type: String, enum: ["Invoice", "Bill", "SalesOrder", "PurchaseOrder", "Manual"] },
        status: {
            type: String,
            enum: ["Projected", "Realized", "Cancelled"],
            default: "Projected",
        },
    },
    { timestamps: true }
);

// ============ Sales Order Schema ============
const SalesOrderSchema = new mongoose.Schema(
    {
        soId: { type: String, required: true, unique: true }, // e.g., "SO-001"
        client: { type: String, required: true },
        clientGstin: String,
        caseId: String, // Optional case link
        items: [
            {
                itemId: String,
                name: { type: String, required: true },
                hsnCode: String,
                quantity: { type: Number, required: true, default: 1 },
                rate: { type: Number, required: true },
                amount: { type: Number, required: true },
                gstRate: { type: Number, default: 18 },
                gstAmount: { type: Number, default: 0 },
            },
        ],
        subtotal: { type: Number, required: true },
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        totalGst: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Draft", "Confirmed", "Partially Delivered", "Delivered", "Invoiced", "Cancelled"],
            default: "Draft",
        },
        orderDate: { type: Date, default: Date.now },
        deliveryDate: Date,
        notes: String,
        placeOfSupply: String, // State code for GST
        isInterState: { type: Boolean, default: false },
        invoiceId: String, // Generated invoice
    },
    { timestamps: true }
);

// ============ Purchase Order Schema ============
const PurchaseOrderSchema = new mongoose.Schema(
    {
        poId: { type: String, required: true, unique: true }, // e.g., "PO-001"
        vendorId: { type: String, required: true },
        vendorName: String,
        vendorGstin: String,
        items: [
            {
                itemId: String,
                name: { type: String, required: true },
                hsnCode: String,
                quantity: { type: Number, required: true, default: 1 },
                rate: { type: Number, required: true },
                amount: { type: Number, required: true },
                gstRate: { type: Number, default: 18 },
                gstAmount: { type: Number, default: 0 },
                receivedQty: { type: Number, default: 0 },
            },
        ],
        subtotal: { type: Number, required: true },
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        totalGst: { type: Number, default: 0 },
        grandTotal: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Draft", "Sent", "Partially Received", "Received", "Billed", "Cancelled"],
            default: "Draft",
        },
        orderDate: { type: Date, default: Date.now },
        expectedDate: Date,
        notes: String,
        placeOfSupply: String,
        isInterState: { type: Boolean, default: false },
        billId: String, // Generated bill
    },
    { timestamps: true }
);

// ============ Inventory Item Schema ============
const InventoryItemSchema = new mongoose.Schema(
    {
        itemId: { type: String, required: true, unique: true }, // e.g., "ITEM-001"
        name: { type: String, required: true },
        sku: { type: String, unique: true, sparse: true },
        hsnCode: String, // HSN/SAC code for GST
        category: {
            type: String,
            enum: ["Office Supplies", "Equipment", "Software", "Legal Materials", "Stationery", "Other"],
            default: "Other",
        },
        description: String,
        unit: { type: String, default: "Nos" }, // Nos, Kg, Ltr, etc.
        purchaseRate: { type: Number, default: 0 },
        sellingRate: { type: Number, default: 0 },
        gstRate: { type: Number, default: 18 },
        currentStock: { type: Number, default: 0 },
        reorderLevel: { type: Number, default: 5 },
        totalValue: { type: Number, default: 0 }, // currentStock * purchaseRate
        location: String, // Warehouse or location
        isActive: { type: Boolean, default: true },
        lastRestocked: Date,
    },
    { timestamps: true }
);

// ============ Tax Profile / GST Config Schema ============
const TaxProfileSchema = new mongoose.Schema(
    {
        profileId: { type: String, required: true, unique: true },
        name: { type: String, required: true }, // e.g., "GST 18%", "GST 12%", "GST 5%"
        taxType: {
            type: String,
            enum: ["GST", "TDS", "TCS", "Sales Tax", "Custom"],
            default: "GST",
        },
        rate: { type: Number, required: true }, // Total rate (e.g., 18)
        cgstRate: { type: Number, default: 0 }, // 9% for intra-state
        sgstRate: { type: Number, default: 0 }, // 9% for intra-state
        igstRate: { type: Number, default: 0 }, // 18% for inter-state
        cessRate: { type: Number, default: 0 },
        hsnCodes: [String], // Applicable HSN codes
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        effectiveFrom: { type: Date, default: Date.now },
        description: String,
    },
    { timestamps: true }
);

// ============ Export Models ============
module.exports = {
    User: mongoose.model("User", UserSchema),
    Case: mongoose.model("Case", CaseSchema),
    Invoice: mongoose.model("Invoice", InvoiceSchema),
    Expense: mongoose.model("Expense", ExpenseSchema),
    TimeLog: mongoose.model("TimeLog", TimeLogSchema),
    Transaction: mongoose.model("Transaction", TransactionSchema),
    Notification: mongoose.model("Notification", NotificationSchema),
    Account: mongoose.model("Account", AccountSchema),
    JournalEntry: mongoose.model("JournalEntry", JournalEntrySchema),
    Vendor: mongoose.model("Vendor", VendorSchema),
    Bill: mongoose.model("Bill", BillSchema),
    CompanySettings: mongoose.model("CompanySettings", CompanySettingsSchema),
    BankAccount: mongoose.model("BankAccount", BankAccountSchema),
    BankTransaction: mongoose.model("BankTransaction", BankTransactionSchema),
    CashForecast: mongoose.model("CashForecast", CashForecastSchema),
    SalesOrder: mongoose.model("SalesOrder", SalesOrderSchema),
    PurchaseOrder: mongoose.model("PurchaseOrder", PurchaseOrderSchema),
    InventoryItem: mongoose.model("InventoryItem", InventoryItemSchema),
    TaxProfile: mongoose.model("TaxProfile", TaxProfileSchema),
};
