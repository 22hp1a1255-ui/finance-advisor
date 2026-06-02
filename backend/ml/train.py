import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.metrics import classification_report
import joblib
import os

df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'transactions_data.csv'))

print(f"Total training samples: {len(df)}")
print(f"Categories: {df['category'].nunique()}")
print(f"Samples per category:\n{df['category'].value_counts()}\n")

X = df['description']
y = df['category']

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(lowercase=True, ngram_range=(1, 2))),
    ('clf', LogisticRegression(max_iter=1000, C=5))
])

# Cross validation gives more reliable accuracy on small datasets
scores = cross_val_score(pipeline, X, y, cv=5, scoring='accuracy')

print(f"✅ Model trained successfully!")
print(f"Accuracy per fold : {[f'{s:.0%}' for s in scores]}")
print(f"Average Accuracy  : {scores.mean():.2%}")
print(f"Standard Deviation: {scores.std():.2%}")

# Train on full data and save
pipeline.fit(X, y)

# Quick sanity test
test_cases = [
    "Swiggy food order",
    "Netflix subscription",
    "Uber ride",
    "electricity bill",
    "salary credit",
    "Amazon purchase",
    "doctor consultation",
    "college fees",
    "SBI loan EMI"
]

print(f"\n🧪 Quick prediction test:")
for t in test_cases:
    print(f"  '{t}' → {pipeline.predict([t])[0]}")

model_path = os.path.join(os.path.dirname(__file__), 'categorizer_model.pkl')
joblib.dump(pipeline, model_path)
print(f"\n💾 Model saved!")