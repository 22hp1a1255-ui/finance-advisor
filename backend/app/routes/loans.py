from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Transaction

loans_bp = Blueprint('loans', __name__)

LOAN_PRODUCTS = [
    {
        "type": "Home Loan",
        "min_income": 25000,
        "max_dti": 0.5,
        "min_savings": 50000,
        "interest_rate": "8.5% - 9.5%",
        "max_tenure": 240,
        "description": "Purchase or construct your dream home",
        "icon": "🏠"
    },
    {
        "type": "Personal Loan",
        "min_income": 15000,
        "max_dti": 0.6,
        "min_savings": 5000,
        "interest_rate": "10.5% - 18%",
        "max_tenure": 60,
        "description": "For medical, travel, or personal needs",
        "icon": "💳"
    },
    {
        "type": "Education Loan",
        "min_income": 10000,
        "max_dti": 0.5,
        "min_savings": 0,
        "interest_rate": "7.5% - 11%",
        "max_tenure": 120,
        "description": "Fund your higher education or skill courses",
        "icon": "🎓"
    },
    {
        "type": "Vehicle Loan",
        "min_income": 20000,
        "max_dti": 0.5,
        "min_savings": 10000,
        "interest_rate": "7.9% - 12%",
        "max_tenure": 84,
        "description": "Buy a new or used car or two-wheeler",
        "icon": "🚗"
    },
    {
        "type": "Gold Loan",
        "min_income": 5000,
        "max_dti": 0.8,
        "min_savings": 0,
        "interest_rate": "7% - 10%",
        "max_tenure": 24,
        "description": "Quick loan against your gold assets",
        "icon": "🥇"
    },
    {
        "type": "Business Loan",
        "min_income": 30000,
        "max_dti": 0.4,
        "min_savings": 20000,
        "interest_rate": "11% - 16%",
        "max_tenure": 60,
        "description": "Grow or start your business",
        "icon": "💼"
    }
]

def calculate_emi(principal, annual_rate, months):
    r = annual_rate / (12 * 100)
    if r == 0:
        return round(principal / months, 2)
    emi = principal * r * ((1 + r) ** months) / (((1 + r) ** months) - 1)
    return round(emi, 2)

def get_eligibility_amount(monthly_income, monthly_expenses, tenure_months):
    disposable = monthly_income - monthly_expenses
    affordable_emi = disposable * 0.4
    r = 0.01
    if r == 0:
        return round(affordable_emi * tenure_months, 2)
    amount = affordable_emi * (((1 + r) ** tenure_months) - 1) / (r * ((1 + r) ** tenure_months))
    return round(amount, 2)

@loans_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_loan_recommendations():
    from app import db
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    if len(transactions) < 3:
        return jsonify({"error": "Add at least 3 transactions to get loan recommendations"}), 400

    monthly_income = sum(t.amount for t in transactions if t.category == 'Income')
    monthly_expenses = sum(t.amount for t in transactions if t.category != 'Income')
    savings = max(0, monthly_income - monthly_expenses)
    dti = monthly_expenses / monthly_income if monthly_income > 0 else 1

    recommended = []
    not_eligible = []

    for loan in LOAN_PRODUCTS:
        if (monthly_income >= loan['min_income'] and
                dti <= loan['max_dti'] and
                savings >= loan['min_savings']):
            eligibility = get_eligibility_amount(monthly_income, monthly_expenses, loan['max_tenure'])
            min_rate = float(loan['interest_rate'].split('%')[0].strip())
            emi = calculate_emi(eligibility * 0.5, min_rate, loan['max_tenure'])
            recommended.append({
                **loan,
                "eligible": True,
                "eligibility_amount": eligibility,
                "sample_emi": emi,
                "sample_note": f"EMI for 50% of eligible amount over {loan['max_tenure']} months"
            })
        else:
            reason = []
            if monthly_income < loan['min_income']:
                reason.append(f"Minimum income ₹{loan['min_income']} required")
            if dti > loan['max_dti']:
                reason.append(f"Debt-to-income ratio too high ({round(dti*100)}%)")
            if savings < loan['min_savings']:
                reason.append(f"Minimum savings ₹{loan['min_savings']} required")
            not_eligible.append({
                **loan,
                "eligible": False,
                "reason": ", ".join(reason)
            })

    return jsonify({
        "financial_summary": {
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "monthly_savings": savings,
            "debt_to_income_ratio": f"{round(dti * 100, 1)}%",
            "savings_rate": f"{round((savings/monthly_income)*100, 1)}%" if monthly_income > 0 else "0%"
        },
        "recommended_loans": recommended,
        "not_eligible": not_eligible
    }), 200