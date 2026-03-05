const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "backend-node/.env") });

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cashflow";

const InvoiceSchema = new mongoose.Schema({ status: String, total: Number });
const Invoice = mongoose.model("Invoice", InvoiceSchema);

async function check() {
    await mongoose.connect(MONGO_URI);
    const count = await Invoice.countDocuments();
    const pending = await Invoice.find({ status: { $in: ["Sent", "Overdue"] } });
    console.log("Total Invoices:", count);
    console.log("Pending Invoices:", pending.length);
    console.log("Pending Sum:", pending.reduce((s, i) => s + (i.total || 0), 0));
    await mongoose.disconnect();
}

check();
