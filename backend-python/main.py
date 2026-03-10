"""
solvstrat — Profit Margin AI Service
FastAPI service for calculating case profitability.

Formula: Profit = Revenue - (Staff Cost per Hour × Total Hours + Expenses)
Risk Levels: Low (>30%), Medium (15-30%), High (<15%)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

app = FastAPI(
    title="solvstrat Profit Margin AI",
    description="AI-powered profit margin analytics for legal cases",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Models ============

class TimeLog(BaseModel):
    case_id: str
    staff_id: str
    hours: float
    cost_per_hour: float
    description: Optional[str] = None
    date: str


class Expense(BaseModel):
    case_id: str
    category: str
    amount: float
    description: Optional[str] = None
    date: str


class ProfitMarginResponse(BaseModel):
    case_id: str
    case_name: str
    revenue: float
    staff_cost_per_hour: float
    total_hours: float
    staff_cost: float
    expenses: float
    total_cost: float
    profit: float
    profit_margin: float
    risk_level: str  # "Low", "Medium", "High"
    calculated_at: str


class CaseAnalytics(BaseModel):
    case_id: str
    revenue: float
    time_logs: list[TimeLog]
    expense_items: list[Expense]


# ============ In-Memory Case Data ============

case_data = {
    "JF-2024-001": {
        "case_name": "Singh vs. Metro Corp",
        "revenue": 345000,
        "time_logs": [
            {"staff_id": "T-001", "hours": 18, "cost_per_hour": 3000, "description": "Senior associate work"},
            {"staff_id": "T-003", "hours": 24, "cost_per_hour": 2000, "description": "Paralegal research"},
        ],
        "expenses": [
            {"category": "Court Filing", "amount": 12500},
            {"category": "Documentation", "amount": 4500},
            {"category": "Travel", "amount": 16500},
            {"category": "Expert Witness", "amount": 54000},
        ],
    },
    "JF-2024-002": {
        "case_name": "Verma Industrial Dispute",
        "revenue": 520000,
        "time_logs": [
            {"staff_id": "T-002", "hours": 56, "cost_per_hour": 2500, "description": "Case management"},
            {"staff_id": "T-004", "hours": 40, "cost_per_hour": 1500, "description": "Document prep"},
        ],
        "expenses": [
            {"category": "Court Filing", "amount": 18000},
            {"category": "Travel", "amount": 42000},
            {"category": "Staff Cost", "amount": 36000},
            {"category": "Expert Witness", "amount": 60000},
        ],
    },
    "JF-2024-003": {
        "case_name": "Apex Real Estate Fraud",
        "revenue": 1200000,
        "time_logs": [
            {"staff_id": "T-003", "hours": 120, "cost_per_hour": 3500, "description": "Lead counsel"},
            {"staff_id": "T-001", "hours": 90, "cost_per_hour": 3000, "description": "Senior review"},
        ],
        "expenses": [
            {"category": "Court Filing", "amount": 35000},
            {"category": "Travel", "amount": 89000},
            {"category": "Expert Witness", "amount": 125000},
            {"category": "Documentation", "amount": 63000},
        ],
    },
    "JF-2024-005": {
        "case_name": "Gupta Tax Compliance",
        "revenue": 260000,
        "time_logs": [
            {"staff_id": "T-001", "hours": 35, "cost_per_hour": 2000, "description": "Tax advisory"},
        ],
        "expenses": [
            {"category": "Documentation", "amount": 8500},
            {"category": "Court Filing", "amount": 12000},
            {"category": "Travel", "amount": 21500},
        ],
    },
    "JF-2024-008": {
        "case_name": "Raj Banking Fraud",
        "revenue": 1500000,
        "time_logs": [
            {"staff_id": "T-001", "hours": 100, "cost_per_hour": 4000, "description": "Senior counsel"},
            {"staff_id": "T-002", "hours": 80, "cost_per_hour": 3000, "description": "Case manager"},
        ],
        "expenses": [
            {"category": "Expert Witness", "amount": 175000},
            {"category": "Travel", "amount": 95000},
            {"category": "Court Filing", "amount": 45000},
            {"category": "Documentation", "amount": 110000},
        ],
    },
}


# ============ Core AI Logic ============

def calculate_profit_margin(case_id: str) -> ProfitMarginResponse:
    """
    Profit Margin AI Core Formula:
    Profit = Revenue - (Staff Cost Per Hour × Total Hours + Expenses)
    """
    if case_id not in case_data:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    data = case_data[case_id]
    revenue = data["revenue"]

    # Calculate staff costs
    total_hours = sum(log["hours"] for log in data["time_logs"])
    weighted_cost = sum(log["hours"] * log["cost_per_hour"] for log in data["time_logs"])
    avg_cost_per_hour = weighted_cost / total_hours if total_hours > 0 else 0
    staff_cost = weighted_cost

    # Calculate expenses
    total_expenses = sum(exp["amount"] for exp in data["expenses"])

    # Core calculation
    total_cost = staff_cost + total_expenses
    profit = revenue - total_cost
    profit_margin = (profit / revenue * 100) if revenue > 0 else 0

    # Risk assessment
    if profit_margin > 30:
        risk_level = "Low"
    elif profit_margin > 15:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return ProfitMarginResponse(
        case_id=case_id,
        case_name=data["case_name"],
        revenue=revenue,
        staff_cost_per_hour=round(avg_cost_per_hour, 2),
        total_hours=total_hours,
        staff_cost=staff_cost,
        expenses=total_expenses,
        total_cost=total_cost,
        profit=profit,
        profit_margin=round(profit_margin, 1),
        risk_level=risk_level,
        calculated_at=datetime.utcnow().isoformat() + "Z",
    )


# ============ API Endpoints ============

@app.get("/")
def root():
    return {
        "service": "solvstrat Profit Margin AI",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "GET /api/profit-margin",
            "GET /api/profit-margin/{case_id}",
            "POST /analyze/expense",
            "GET /api/cases-summary",
            "GET /health",
        ],
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "profit-margin-ai", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/profit-margin")
def get_all_profit_margins():
    """Calculate profit margins for all cases."""
    results = []
    for case_id in case_data:
        results.append(calculate_profit_margin(case_id))
    return {
        "total_cases": len(results),
        "cases": results,
        "summary": {
            "total_revenue": sum(r.revenue for r in results),
            "total_profit": sum(r.profit for r in results),
            "total_cost": sum(r.total_cost for r in results),
            "average_margin": round(sum(r.profit_margin for r in results) / len(results), 1),
            "high_risk_count": sum(1 for r in results if r.risk_level == "High"),
            "medium_risk_count": sum(1 for r in results if r.risk_level == "Medium"),
            "low_risk_count": sum(1 for r in results if r.risk_level == "Low"),
        },
        "calculated_at": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/profit-margin/{case_id}")
def get_case_profit_margin(case_id: str):
    """Calculate profit margin for a specific case."""
    return calculate_profit_margin(case_id)


@app.post("/api/compute/profit-margins")
def compute_all_profit_margins(payload: dict):
    """
    Calculate profit margins for dynamic data provided in the request.
    Data format: { "cases": [ { "case_id": "...", "case_name": "...", "revenue": 0, "time_logs": [], "expenses": [] } ] }
    """
    dynamic_cases = payload.get("cases", [])
    results = []
    
    for case in dynamic_cases:
        case_id = case.get("case_id")
        case_name = case.get("case_name", "Unknown")
        revenue = case.get("revenue", 0)
        time_logs = case.get("time_logs", [])
        expenses = case.get("expenses", [])

        # Calculate staff costs
        total_hours = sum(log.get("hours", 0) for log in time_logs)
        weighted_cost = sum(log.get("hours", 0) * log.get("cost_per_hour", 3000) for log in time_logs)
        avg_cost_per_hour = weighted_cost / total_hours if total_hours > 0 else 0
        staff_cost = weighted_cost

        # Calculate expenses
        total_expenses = sum(exp.get("amount", 0) for exp in expenses)

        # Core calculation
        total_cost = staff_cost + total_expenses
        profit = revenue - total_cost
        profit_margin = (profit / revenue * 100) if revenue > 0 else 0

        # Risk assessment
        if profit_margin > 30:
            risk_level = "Low"
        elif profit_margin > 15:
            risk_level = "Medium"
        else:
            risk_level = "High"

        results.append({
            "case_id": case_id,
            "case_name": case_name,
            "revenue": revenue,
            "staff_cost_per_hour": round(avg_cost_per_hour, 2),
            "total_hours": total_hours,
            "staff_cost": staff_cost,
            "expenses": total_expenses,
            "total_cost": total_cost,
            "profit": profit,
            "profit_margin": round(profit_margin, 1),
            "risk_level": risk_level,
            "calculated_at": datetime.utcnow().isoformat() + "Z",
        })

    if not results:
        return {"total_cases": 0, "cases": [], "summary": {}}

    return {
        "total_cases": len(results),
        "cases": results,
        "summary": {
            "total_revenue": sum(r["revenue"] for r in results),
            "total_profit": sum(r["profit"] for r in results),
            "total_cost": sum(r["total_cost"] for r in results),
            "average_margin": round(sum(r["profit_margin"] for r in results) / len(results), 1),
            "high_risk_count": sum(1 for r in results if r["risk_level"] == "High"),
            "medium_risk_count": sum(1 for r in results if r["risk_level"] == "Medium"),
            "low_risk_count": sum(1 for r in results if r["risk_level"] == "Low"),
        },
        "calculated_at": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/cases-summary")


# ============ Dynamic Expense Analysis ============

class ExpenseAnalysisRequest(BaseModel):
    caseId: str
    amount: float
    category: str
    description: Optional[str] = None
    gstAmount: Optional[float] = None


class ExpenseAnalysisDetail(BaseModel):
    netProfitImpact: float
    marginChange: str
    alert: str
    suggestion: str


class ExpenseAnalysisResponse(BaseModel):
    caseId: str
    status: str
    analysis: ExpenseAnalysisDetail
    timestamp: str


@app.post("/analyze/expense", response_model=ExpenseAnalysisResponse)
def analyze_expense(req: ExpenseAnalysisRequest):
    """
    Dynamic expense analysis endpoint.
    Calculates the real-time profit impact of adding a new expense to a case.
    Returns the exact JSON structure for frontend verification.
    """
    case_id = req.caseId
    new_expense_amount = req.amount
    gst = req.gstAmount if req.gstAmount is not None else round(new_expense_amount * 0.18, 2)
    total_new_cost = new_expense_amount + gst

    # If the case exists, calculate impact against existing data
    if case_id in case_data:
        data = case_data[case_id]
        revenue = data["revenue"]

        # Current state
        current_staff_cost = sum(
            log["hours"] * log["cost_per_hour"] for log in data["time_logs"]
        )
        current_expenses = sum(exp["amount"] for exp in data["expenses"])
        current_total_cost = current_staff_cost + current_expenses
        current_profit = revenue - current_total_cost
        current_margin = (current_profit / revenue * 100) if revenue > 0 else 0

        # After adding new expense
        new_total_cost = current_total_cost + total_new_cost
        new_profit = revenue - new_total_cost
        new_margin = (new_profit / revenue * 100) if revenue > 0 else 0

        net_impact = -total_new_cost
        margin_change = round(new_margin - current_margin, 1)
        margin_change_str = f"{margin_change:+.1f}%"

        # Generate contextual alert and suggestion
        if new_margin < 15:
            alert = f"CRITICAL: Profit margin drops to {new_margin:.1f}% — below safe threshold"
            suggestion = f"Review {req.category} costs. Consider renegotiating vendor rates or redistributing case budget."
        elif new_margin < 25:
            alert = f"WARNING: High expense detected for case stage. Margin now {new_margin:.1f}%"
            suggestion = f"Monitor {req.category} spending closely. Approve only essential expenses for this case."
        elif total_new_cost > revenue * 0.05:
            alert = f"High expense detected for this case stage"
            suggestion = f"Review vendor bill for potential overcharge. Expense is {(total_new_cost/revenue*100):.1f}% of case revenue."
        else:
            alert = "Expense within normal range"
            suggestion = f"No action needed. Case margin remains healthy at {new_margin:.1f}%."
    else:
        # Unknown case — use conservative estimates
        net_impact = -total_new_cost
        margin_change_str = f"-{(total_new_cost / 100000 * 2.5):.1f}%"
        alert = f"New expense logged for untracked case {case_id}"
        suggestion = "Ensure this case is registered in the system for accurate profit tracking."

    return ExpenseAnalysisResponse(
        caseId=case_id,
        status="success",
        analysis=ExpenseAnalysisDetail(
            netProfitImpact=round(net_impact, 2),
            marginChange=margin_change_str,
            alert=alert,
            suggestion=suggestion,
        ),
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

