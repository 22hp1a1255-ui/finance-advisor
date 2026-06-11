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
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()

    query = Transaction.query.filter_by(user_id=user_id)

    if month and year:
        query = query.filter(
            db.extract('month', Transaction.timestamp) == int(month),
            db.extract('year', Transaction.timestamp) == int(year)
        )

    if search:
        query = query.filter(
            Transaction.raw_description.ilike(f'%{search}%')
        )

    if category:
        query = query.filter(Transaction.category == category)

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

@transactions_bp.route('/<transaction_id>', methods=['PUT'])
@jwt_required()
def edit_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(
        id=transaction_id, user_id=user_id
    ).first()

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    data = request.get_json(force=True, silent=True)

    if 'description' in data:
        transaction.raw_description = data['description']
        transaction.category = categorize_transaction(data['description'])

    if 'amount' in data:
        transaction.amount = float(data['amount'])

    if 'date' in data:
        try:
            transaction.timestamp = datetime.strptime(data['date'], '%Y-%m-%d')
        except:
            pass

    db.session.commit()

    return jsonify({
        "message": "Transaction updated",
        "id": transaction.id,
        "description": transaction.raw_description,
        "amount": transaction.amount,
        "category": transaction.category,
        "date": transaction.timestamp.strftime('%d %b %Y')
    }), 200

@transactions_bp.route('/<transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(
        id=transaction_id, user_id=user_id
    ).first()

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({"message": "Transaction deleted"}), 200