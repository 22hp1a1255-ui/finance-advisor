import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'categorizer_model.pkl')
model = joblib.load(MODEL_PATH)

def categorize_transaction(description: str) -> str:
    if not description or not description.strip():
        return "Uncategorized"
    prediction = model.predict([description.strip()])
    return prediction[0]

def categorize_batch(descriptions: list) -> list:
    return [categorize_transaction(d) for d in descriptions]