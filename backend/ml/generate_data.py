import pandas as pd
import numpy as np

np.random.seed(42)
n = 500

data = {
    'monthly_income': np.random.randint(10000, 100000, n),
    'monthly_expenses': np.random.randint(5000, 80000, n),
    'bill_payments_ontime': np.random.randint(0, 13, n),
    'loan_count': np.random.randint(0, 5, n),
    'savings_amount': np.random.randint(0, 200000, n),
    'transaction_count': np.random.randint(5, 100, n),
    'months_active': np.random.randint(1, 60, n),
}

df = pd.DataFrame(data)

# Generate credit score based on logical rules
df['credit_score'] = (
    (df['monthly_income'] / 1000) * 0.3 +
    (df['bill_payments_ontime'] / 12) * 30 +
    (df['savings_amount'] / 10000) * 0.2 +
    (df['months_active'] / 60) * 20 -
    (df['loan_count'] * 3) -
    ((df['monthly_expenses'] / df['monthly_income']) * 20)
).clip(20, 100).round(1)

df.to_csv('ml/credit_data.csv', index=False)
print(f"✅ Generated {n} synthetic user records")
print(df.head())
print(f"\nCredit score range: {df['credit_score'].min()} - {df['credit_score'].max()}")