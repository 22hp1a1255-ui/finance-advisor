# 💰 AI-Powered Personal Finance Advisor

A full-stack AI application that helps users track expenses, get auto-categorized transactions, receive credit scores with explainable AI, and personalized budget recommendations.

## 🔗 Live Demo
- Frontend: https://finance-advisor-nu.vercel.app
- Backend API: https://finance-advisor-backend-okeg.onrender.com

## 🧠 AI/ML Features
- **Transaction Categorizer** — TF-IDF + Logistic Regression auto-labels transactions
- **Credit Scoring** — Random Forest model with SHAP explainability
- **Budget Engine** — Rule-based + ML recommendations per spending category

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Flask, Python |
| Database | PostgreSQL |
| ML | Scikit-learn, SHAP |
| Auth | JWT + Firebase OTP |
| Deployment | Vercel + Render |

## 📸 Screenshots
[Add screenshots of your running app here]

## ⚙️ Local Setup
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py

# Frontend
cd frontend
npm install
npm start
```

## 🔌 API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/signup | Register user |
| POST | /api/v1/auth/login | Login + get JWT |
| POST | /api/v1/transactions/ | Add + auto-categorize transaction |
| GET | /api/v1/transactions/ | Get all transactions |
| GET | /api/v1/credit/score | Get AI credit score + SHAP explanation |
| GET | /api/v1/budget/recommendations | Get budget recommendations |