import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Set seed for reproducibility
np.random.seed(42)
n_samples = 1500 # Using more samples for better training

# 1. Generate Synthetic Data
# We create 1500 dummy user profiles based on standard ranges
data = {
    'income': np.random.normal(120000, 40000, n_samples), # Avg monthly income 1.2L
    'savings': np.random.normal(600000, 250000, n_samples), # Avg current savings 6L
    'expenses': np.random.normal(50000, 15000, n_samples), # Avg monthly expenses 50k
    'timeline': np.random.choice([3, 5, 7, 10], n_samples), # Desired Goal Timeline
    'target_price': np.random.normal(6000000, 1500000, n_samples) # Avg target 60L
}

df = pd.DataFrame(data)

# Feature Engineering: Create meaningful ratios
df['savings_rate'] = (df['income'] - df['expenses']) / df['income']
# Calculate required down payment (20% default)
df['required_downpayment'] = df['target_price'] * 0.2
# Affordability ratio: current savings vs. required down payment
df['affordability_ratio'] = df['savings'] / df['required_downpayment']
# Savings momentum ratio: how quickly they can save the remaining amount
df['momentum_ratio'] = (df['required_downpayment'] - df['savings']) / (df['income'] - df['expenses'])

# Define Logic for "Success" (Label)
# Success is high if: High Savings Rate (over 40%) AND they can cover the down payment quickly (momentum < 3 years)
df['success'] = (
    (df['savings_rate'] > 0.4) & 
    (df['affordability_ratio'] > 0.3) & # Already 30% of the way there
    (df['momentum_ratio'] < (3 * 12)) # Can cover the rest in < 3 years
).astype(int)

# Add small noise: Flip 8% of labels to simulate real-world factors (unpredictability)
noise_indices = np.random.choice(n_samples, int(n_samples * 0.08), replace=False)
df.loc[noise_indices, 'success'] = 1 - df.loc[noise_indices, 'success']

# 2. Train the Model
# Features used for prediction (must match what the Flask API receives)
X = df[['income', 'savings', 'expenses', 'timeline', 'target_price']]
y = df['success']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Using Random Forest Classifier for robust prediction
model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42)
model.fit(X_train, y_train)

# 3. Evaluate and Save
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Training Complete. Accuracy: {accuracy:.2f}")

# Save the trained model object using joblib
joblib.dump(model, 'success_predictor_model.pkl')
print("Model saved to success_predictor_model.pkl")

