from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Transaction
from app import db
from collections import defaultdict

comparison_bp = Blueprint('comparison', __name__)

@comparison_bp.route('/monthly', methods=['GET'])
@jwt_required()
def compare_months():
    user_id = get_jwt_identity()

    month1 = request.args.get('month1')
    year1 = request.args.get('year1')
    month2 = request.args.get('month2')
    year2 = request.args.get('year2')

    if not all([month1, year1, month2, year2]):
        return jsonify({"error": "Provide month1, year1, month2, year2"}), 400

    def get_month_data(month, year):
        txns = Transaction.query.filter_by(user_id=user_id).filter(
            db.extract('month', Transaction.timestamp) == int(month),
            db.extract('year', Transaction.timestamp) == int(year)
        ).all()

        income = sum(t.amount for t in txns if t.category == 'Income')
        expenses = sum(t.amount for t in txns if t.category != 'Income')
        savings = max(0, income - expenses)
        savings_rate = round((savings / income) * 100, 1) if income > 0 else 0

        by_category = defaultdict(float)
        for t in txns:
            if t.category != 'Income':
                by_category[t.category] += t.amount

        return {
            "total_income": income,
            "total_expenses": expenses,
            "total_savings": savings,
            "savings_rate": savings_rate,
            "transaction_count": len(txns),
            "by_category": dict(by_category)
        }

    import calendar
    m1_name = f"{calendar.month_abbr[int(month1)]} {year1}"
    m2_name = f"{calendar.month_abbr[int(month2)]} {year2}"

    m1 = get_month_data(month1, year1)
    m2 = get_month_data(month2, year2)

    # Category comparison
    all_categories = set(list(m1['by_category'].keys()) + list(m2['by_category'].keys()))
    category_comparison = []
    for cat in all_categories:
        amt1 = m1['by_category'].get(cat, 0)
        amt2 = m2['by_category'].get(cat, 0)
        if amt1 > 0 and amt2 > 0:
            change_pct = round(((amt2 - amt1) / amt1) * 100, 1)
        elif amt1 == 0 and amt2 > 0:
            change_pct = 100
        else:
            change_pct = -100
        category_comparison.append({
            "category": cat,
            "month1_amount": round(amt1, 2),
            "month2_amount": round(amt2, 2),
            "change_pct": change_pct,
            "trend": "up" if change_pct > 0 else "down" if change_pct < 0 else "same"
        })

    category_comparison.sort(key=lambda x: abs(x['change_pct']), reverse=True)

    # Overall changes
    income_change = round(((m2['total_income'] - m1['total_income']) / m1['total_income']) * 100, 1) if m1['total_income'] > 0 else 0
    expense_change = round(((m2['total_expenses'] - m1['total_expenses']) / m1['total_expenses']) * 100, 1) if m1['total_expenses'] > 0 else 0
    savings_change = round(((m2['total_savings'] - m1['total_savings']) / m1['total_savings']) * 100, 1) if m1['total_savings'] > 0 else 0

    return jsonify({
        "month1_name": m1_name,
        "month2_name": m2_name,
        "month1": m1,
        "month2": m2,
        "changes": {
            "income_change": income_change,
            "expense_change": expense_change,
            "savings_change": savings_change
        },
        "category_comparison": category_comparison
    }), 200