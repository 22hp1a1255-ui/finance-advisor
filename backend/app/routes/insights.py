from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Transaction
from datetime import datetime, timedelta
from collections import defaultdict

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    if len(transactions) < 3:
        return jsonify({"error": "Add at least 3 transactions to see insights"}), 400

    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    # Split into this week and last week
    this_week = [t for t in transactions if t.timestamp >= week_ago]
    last_week = [t for t in transactions if two_weeks_ago <= t.timestamp < week_ago]

    # Category breakdown
    category_totals = defaultdict(float)
    for t in transactions:
        if t.category != 'Income':
            category_totals[t.category] += t.amount

    top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5]

    # This week vs last week comparison
    this_week_by_cat = defaultdict(float)
    last_week_by_cat = defaultdict(float)
    for t in this_week:
        if t.category != 'Income':
            this_week_by_cat[t.category] += t.amount
    for t in last_week:
        if t.category != 'Income':
            last_week_by_cat[t.category] += t.amount

    # Generate alerts
    alerts = []
    for cat, this_amt in this_week_by_cat.items():
        last_amt = last_week_by_cat.get(cat, 0)
        if last_amt > 0:
            change = ((this_amt - last_amt) / last_amt) * 100
            if change >= 40:
                alerts.append({
                    "type": "warning",
                    "message": f"You spent {round(change)}% more on {cat} this week vs last week",
                    "category": cat
                })
            elif change <= -30:
                alerts.append({
                    "type": "success",
                    "message": f"Great job! You spent {round(abs(change))}% less on {cat} this week",
                    "category": cat
                })

    # Income and savings
    total_income = sum(t.amount for t in transactions if t.category == 'Income')
    total_expenses = sum(t.amount for t in transactions if t.category != 'Income')
    savings = max(0, total_income - total_expenses)
    savings_rate = round((savings / total_income) * 100, 1) if total_income > 0 else 0

    # Health rating
    if savings_rate >= 20:
        health = "Excellent"
        health_color = "green"
    elif savings_rate >= 10:
        health = "Good"
        health_color = "blue"
    elif savings_rate >= 0:
        health = "Average"
        health_color = "orange"
    else:
        health = "Poor"
        health_color = "red"

    # Monthly trend (last 6 months)
    monthly = defaultdict(float)
    for t in transactions:
        if t.category != 'Income':
            key = t.timestamp.strftime('%b %Y')
            monthly[key] += t.amount

    return jsonify({
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_savings": savings,
        "savings_rate": savings_rate,
        "financial_health": health,
        "financial_health_color": health_color,
        "top_categories": [
            {"category": cat, "amount": round(amt, 2)}
            for cat, amt in top_categories
        ],
        "alerts": alerts,
        "monthly_trend": [
            {"month": month, "amount": round(amt, 2)}
            for month, amt in sorted(monthly.items())
        ]
    }), 200