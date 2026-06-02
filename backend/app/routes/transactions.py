from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Transaction
from ml.categorizer import categorize_transaction

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = data.get('amount')
    description = data.get('description', '')
    source = data.get('source', 'manual')
    if not amount:
        return jsonify({"error": "Amount is required"}), 400
    category = categorize_transaction(description)
    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        raw_description=description,
        category=category,
        source=source
    )
    db.session.add(transaction)
    db.session.commit()
    return jsonify({
        "message": "Transaction added",
        "transaction_id": transaction.id,
        "category": category,
        "amount": amount,
        "description": description
    }), 201

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": t.id,
        "amount": t.amount,
        "description": t.raw_description,
        "category": t.category,
        "source": t.source,
        "timestamp": t.timestamp.isoformat()
    } for t in transactions]), 200