import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import shap
import os

BASE = os.path.dirname(__file__)

df = pd.read_csv(os.path.join(BASE, 'credit_data.csv'))

FEATURES = [
    'monthly_income', 'monthly_expenses', 'bill_payments_ontime',
    'loan_count', 'savings_amount', 'transaction_count', 'months_active'
]

X = df[FEATURES]
y = df['credit_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"✅ Credit score model trained!")
print(f"Mean Absolute Error : {mae:.2f} points")
print(f"R2 Score            : {r2:.2%}")

# SHAP explainability
explainer = shap.TreeExplainer(model)

def get_credit_score(user_data: dict) -> dict:
    df_input = pd.DataFrame([user_data])[FEATURES]
    score = float(model.predict(df_input)[0])
    shap_values = explainer.shap_values(df_input)
    drivers = {}
    for i, feature in enumerate(FEATURES):
        drivers[feature] = round(float(shap_values[0][i]), 3)
    top_drivers = sorted(drivers.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
    return {
        "score": round(score, 1),
        "drivers": dict(top_drivers),
        "model_version": "rf_v1"
    }

joblib.dump((model, explainer, FEATURES), os.path.join(BASE, 'credit_model.pkl'))
print(f"💾 Credit model saved!")

# Test prediction
test_user = {
    'monthly_income': 50000,
    'monthly_expenses': 25000,
    'bill_payments_ontime': 10,
    'loan_count': 1,
    'savings_amount': 50000,
    'transaction_count': 30,
    'months_active': 24
}

result = get_credit_score(test_user)
print(f"\n🧪 Test prediction:")
print(f"Credit Score : {result['score']}/100")
print(f"Top drivers  : {result['drivers']}")