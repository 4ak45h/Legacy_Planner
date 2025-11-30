from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load the trained model
model = joblib.load('success_predictor_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Prepare input features in the same order as training
        features = pd.DataFrame([{
            'income': data['monthlyIncome'],
            'savings': data['currentSavings'],
            'expenses': data['monthlyExpensesTotal'],
            'loan_term': data['desiredTimelineYears'],
            'target_price': data['targetPrice']
        }])

        # Predict Probability (gives us a score from 0.0 to 1.0)
        # We take the probability of class "1" (Success)
        probability = model.predict_proba(features)[0][1]
        
        return jsonify({
            'success_probability': round(probability * 100, 2),
            'message': 'Prediction successful'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)