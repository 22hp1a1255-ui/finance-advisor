from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    jwt.init_app(app)

    CORS(app)

    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')

    from app.routes.transactions import transactions_bp
    app.register_blueprint(transactions_bp, url_prefix='/api/v1/transactions')

    from app.routes.credit import credit_bp
    app.register_blueprint(credit_bp, url_prefix='/api/v1/credit')

    from app.routes.budget import budget_bp
    app.register_blueprint(budget_bp, url_prefix='/api/v1/budget')

    from app.routes.loans import loans_bp
    app.register_blueprint(loans_bp, url_prefix='/api/v1/loans')

    @app.route('/init-db')
    def init_db():
        db.create_all()
        return "Tables created!", 200

    return app