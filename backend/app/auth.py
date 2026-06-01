from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    phone = data.get('phone_number')
    if not phone:
        return jsonify({"error": "Phone number required"}), 400
    if User.query.filter_by(phone_number=phone).first():
        return jsonify({"error": "User already exists"}), 409
    user = User(
        phone_number=phone,
        name=data.get('name', ''),
        income_estimate=data.get('income_estimate', 0)
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=user.id)
    return jsonify({"message": "User created", "token": token, "user_id": user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    phone = data.get('phone_number')
    user = User.query.filter_by(phone_number=phone).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user_id": user.id}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({
        "id": user.id,
        "phone_number": user.phone_number,
        "name": user.name,
        "income_estimate": user.income_estimate,
        "created_at": user.created_at.isoformat()
    }), 200