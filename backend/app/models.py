from app import db
import uuid
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    name = db.Column(db.String(100))
    preferred_language = db.Column(db.String(10), default='en')
    income_estimate = db.Column(db.Float)
    consent_flags = db.Column(db.JSON, default={})
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship('Transaction', backref='user', lazy=True)

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(5), default='INR')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    raw_description = db.Column(db.String(255))
    category = db.Column(db.String(50))   # filled by ML in Week 2
    source = db.Column(db.String(50))     # 'manual', 'csv', 'sms'

class CreditScore(db.Model):
    __tablename__ = 'credit_scores'
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=False)
    score_value = db.Column(db.Float)     # 0–100
    model_version = db.Column(db.String(20))
    drivers = db.Column(db.JSON)          # SHAP explanation — filled in Week 3
    created_at = db.Column(db.DateTime, default=datetime.utcnow)