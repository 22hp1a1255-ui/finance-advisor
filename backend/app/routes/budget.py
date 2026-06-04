from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Transaction

budget_bp = Blueprint('budget', __name__)

BUDGET_RULES = {
    'Food': 0.30,
    'Transport': 0.10,
    'Entertainment': 0.05,
    'Utilities': 0.15,
    'Healthcare': 0.10,
    'Shopping': 0.10,
    'Finance': 0.15,
    'Education': 0.10,
    'Income': 0.00
}

@budget_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_budget():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    income = sum(t.amount for t in transactions if t.category == 'Income')
    if income == 0:
        income = 30000

    actual_spend = {}
    for t in transactions:
        if t.category != 'Income':
            actual_spend[t.category] = actual_spend.get(t.category, 0) + t.amount

    recommendations = []
    for category, ratio in BUDGET_RULES.items():
        if category == 'Income':
            continue
        recommended = round(income * ratio, 2)
        actual = round(actual_spend.get(category, 0), 2)
        status = 'good' if actual <= recommended else 'overspending'
        recommendations.append({
            "category": category,
            "recommended_limit": recommended,
            "actual_spend": actual,
            "status": status,
            "difference": round(recommended - actual, 2)
        })

    return jsonify({
        "monthly_income": income,
        "recommendations": recommendations
    }), 200