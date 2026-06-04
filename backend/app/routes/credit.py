from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Transaction, CreditScore
import joblib
import os
import pandas as pd

credit_bp = Blueprint('credit', __name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'credit_model.pkl')
model, explainer, FEATURES = joblib.load(MODEL_PATH)

@credit_bp.route('/score', methods=['GET'])
@jwt_required()
def get_score():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    if len(transactions) < 3:
        return jsonify({"error": "Add at least 3 transactions to generate a credit score"}), 400

    income = sum(t.amount for t in transactions if t.category == 'Income')
    expenses = sum(t.amount for t in transactions if t.category != 'Income')
    bill_payments = len([t for t in transactions if t.category == 'Utilities'])
    loans = len([t for t in transactions if t.category == 'Finance'])
    savings = max(0, income - expenses)

    user_data = {
        'monthly_income': income or 30000,
        'monthly_expenses': expenses or 15000,
        'bill_payments_ontime': min(bill_payments, 12),
        'loan_count': loans,
        'savings_amount': savings,
        'transaction_count': len(transactions),
        'months_active': 6
    }

    df_input = pd.DataFrame([user_data])[FEATURES]
    score = float(model.predict(df_input)[0])
    shap_values = explainer.shap_values(df_input)

    drivers = {}
    for i, feature in enumerate(FEATURES):
        drivers[feature] = round(float(shap_values[0][i]), 3)

    top_drivers = dict(sorted(drivers.items(), key=lambda x: abs(x[1]), reverse=True)[:3])

    credit_entry = CreditScore(
        user_id=user_id,
        score_value=round(score, 1),
        model_version='rf_v1',
        drivers=top_drivers
    )
    db.session.add(credit_entry)
    db.session.commit()

    return jsonify({
        "credit_score": round(score, 1),
        "out_of": 100,
        "top_drivers": top_drivers,
        "explanation": f"Your score is driven mainly by: {', '.join(top_drivers.keys())}",
        "model_version": "rf_v1"
    }), 200