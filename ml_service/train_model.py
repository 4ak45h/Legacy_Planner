import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# 1. Generate Synthetic Data
# We create 1000 dummy user profiles
np.random.seed(42)
n_samples = 1000

data = {
    'income': np.random.normal(100000, 30000, n_samples), # Avg income 100k
    'savings': np.random.normal(500000, 200000, n_samples), # Avg savings 500k
    'expenses': np.random.normal(40000, 10000, n_samples), # Avg expenses 40k
    'loan_term': np.random.choice([5, 10, 15, 20], n_samples),
    'target_price': np.random.normal(5000000, 1000000, n_samples) # Avg target 50L
}

df = pd.DataFrame(data)

# Feature Engineering: Create meaningful ratios
# Success depends on: High Savings Rate, Low Expense Ratio
df['savings_rate'] = (df['income'] - df['expenses']) / df['income']
df['affordability'] = df['savings'] / (df['target_price'] * 0.2) # Can they afford 20% down?

# Define Logic for "Success" (Label)
# If they can save > 30% of income AND afford > 50% of down payment already -> Success
# We add some random noise to make it realistic (not perfect rule-based)
df['success'] = (
    (df['savings_rate'] > 0.3) & 
    (df['affordability'] > 0.5)
).astype(int)

# Add noise: Flip 5% of labels to simulate real-world unpredictability
noise_indices = np.random.choice(n_samples, int(n_samples * 0.05), replace=False)
df.loc[noise_indices, 'success'] = 1 - df.loc[noise_indices, 'success']

# 2. Train the Model
X = df[['income', 'savings', 'expenses', 'loan_term', 'target_price']]
y = df['success']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Training Complete. Accuracy: {accuracy:.2f}")

# 3. Save the Model
joblib.dump(model, 'success_predictor_model.pkl')
print("Model saved to success_predictor_model.pkl")