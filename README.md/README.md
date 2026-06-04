cat > README.md << 'EOF'
# AI-Powered Personal Finance Advisor

A full-stack AI application for budgeting, credit scoring, and financial education.

## Tech Stack
- Backend: Flask, PostgreSQL, JWT Auth
- ML: Scikit-learn, SHAP
- Frontend: React (Week 3)

## Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
createdb financedb
python run.py
```

## API Endpoints
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- GET  /api/v1/auth/me (protected)
EOF