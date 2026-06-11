from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Transaction
from ml.categorizer import categorize_transaction
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True)
    amount = data.get('amount')
    description = data.get('description', '')
    source = data.get('source', 'manual')
    date_str = data.get('date')

    if not amount:
        return jsonify({"error": "Amount is required"}), 400

    category = categorize_transaction(description)

    # Use provided date or default to now
    if date_str:
        try:
            timestamp = datetime.strptime(date_str, '%Y-%m-%d')
        except:
            timestamp = datetime.utcnow()
    else:
        timestamp = datetime.utcnow()

    transaction = Transaction(
        user_id=user_id,
        amount=amount,
        raw_description=description,
        category=category,
        source=source,
        timestamp=timestamp
    )
    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        "message": "Transaction added",
        "transaction_id": transaction.id,
        "category": category,
        "amount": amount,
        "description": description,
        "date": timestamp.strftime('%d %b %Y')
    }), 201

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    month = request.args.get('month')
    year = request.args.get('year')

    query = Transaction.query.filter_by(user_id=user_id)

    if month and year:
        query = query.filter(
            db.extract('month', Transaction.timestamp) == int(month),
            db.extract('year', Transaction.timestamp) == int(year)
        )

    transactions = query.order_by(Transaction.timestamp.desc()).all()

    return jsonify([{
        "id": t.id,
        "amount": t.amount,
        "description": t.raw_description,
        "category": t.category,
        "source": t.source,
        "timestamp": t.timestamp.isoformat(),
        "date": t.timestamp.strftime('%d %b %Y')
    } for t in transactions]), 200