from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import SavingsGoal, Transaction
from datetime import datetime
import uuid

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json(force=True, silent=True)

    if not data:
        return jsonify({"error": "Invalid data"}), 400

    goal_name = data.get('goal_name')
    target_amount = data.get('target_amount')
    deadline = data.get('deadline')

    if not goal_name or not target_amount or not deadline:
        return jsonify({"error": "goal_name, target_amount and deadline are required"}), 400

    try:
        deadline_date = datetime.strptime(deadline, '%Y-%m-%d')
    except:
        return jsonify({"error": "deadline format must be YYYY-MM-DD"}), 400

    goal = SavingsGoal(
        id=str(uuid.uuid4()),
        user_id=user_id,
        goal_name=goal_name,
        target_amount=float(target_amount),
        current_amount=0,
        deadline=deadline_date
    )
    db.session.add(goal)
    db.session.commit()

    return jsonify({
        "message": "Goal created!",
        "goal_id": goal.id,
        "goal_name": goal.goal_name,
        "target_amount": goal.target_amount,
        "deadline": deadline
    }), 201

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    goals = SavingsGoal.query.filter_by(user_id=user_id).all()
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    # Calculate monthly savings from transactions
    total_income = sum(t.amount for t in transactions if t.category == 'Income')
    total_expenses = sum(t.amount for t in transactions if t.category != 'Income')
    monthly_savings = max(0, total_income - total_expenses)

    result = []
    now = datetime.utcnow()

    for goal in goals:
        months_left = max(0, ((goal.deadline.year - now.year) * 12 +
                          (goal.deadline.month - now.month)))
        remaining = max(0, goal.target_amount - goal.current_amount)
        progress_pct = round((goal.current_amount / goal.target_amount) * 100, 1)

        # Can you reach it in time?
        projected_savings = monthly_savings * months_left
        on_track = projected_savings >= remaining

        if months_left > 0 and remaining > 0:
            required_monthly = round(remaining / months_left, 2)
        else:
            required_monthly = 0

        result.append({
            "id": goal.id,
            "goal_name": goal.goal_name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "remaining": remaining,
            "progress_pct": min(progress_pct, 100),
            "deadline": goal.deadline.strftime('%d %b %Y'),
            "months_left": months_left,
            "monthly_savings": monthly_savings,
            "required_monthly": required_monthly,
            "on_track": on_track,
            "is_completed": goal.is_completed
        })

    return jsonify({
        "goals": result,
        "monthly_savings": monthly_savings
    }), 200

@goals_bp.route('/<goal_id>/deposit', methods=['POST'])
@jwt_required()
def add_deposit(goal_id):
    user_id = get_jwt_identity()
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    data = request.get_json(force=True, silent=True)
    amount = float(data.get('amount', 0))

    if amount <= 0:
        return jsonify({"error": "Amount must be positive"}), 400

    goal.current_amount += amount
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True

    db.session.commit()

    return jsonify({
        "message": f"₹{amount} added to {goal.goal_name}",
        "current_amount": goal.current_amount,
        "target_amount": goal.target_amount,
        "is_completed": goal.is_completed
    }), 200

@goals_bp.route('/<goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    db.session.delete(goal)
    db.session.commit()
    return jsonify({"message": "Goal deleted"}), 200