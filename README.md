# 🏦 Legacy Planner – AI Financial Advisor  
A full-stack personal finance and digital-legacy management system with ML-powered wealth prediction.

## 🚀 Overview

Legacy Planner is a comprehensive MERN-based financial planning platform designed to help users set, track, and achieve major wealth goals (such as buying property, long-term savings, or retirement planning).

A dedicated **Machine Learning microservice** predicts the user’s likelihood of achieving their financial goals, while a **Conversational AI Advisor** provides personalized financial insights using the Gemini API.

---

## ✨ Key Features

### 🔐 Secure MERN Stack Foundation  
Built using **MongoDB, Express.js, React, Node.js (MERN)** with JWT-based authentication and protected routes.

### 🤖 ML-Based Goal Success Prediction  
A **Random Forest model** (Python) generates a probability score based on income, savings rate, and financial targets.

### 📊 Smart Financial Analysis  
Automatically computes EMI, ideal savings rate, timeline feasibility, and generates high-quality, personalized insights.

### 💸 Advanced Budgeting Tool  
Categorized expense manager allows for granular monthly budgeting and better ML advisory accuracy.

### 📝 Will & Asset Management  
Store the details of your legal Will—location, executor, lawyer contact—behind an additional password-protected layer.

### 🗣️ Conversational AI Advisor (Gemini)  
Offers real-time, context-aware financial advice based on the user’s saved profile and budget data.

### 🧬 Digital Legacy & Executor Feature  
Users can assign a **Legacy Contact**, who can retrieve essential information securely using a one-time access token.

---

## 🗂️ Project Structure

```

legacy-planner/
│
├── client/              # React Frontend
├── server/              # Node.js + Express API
├── ml_service/          # Python ML Microservice
│
├── README.md
└── package.json

````

---

## ⚙️ Tech Stack

- **Frontend:** React, Axios, Tailwind/CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **Machine Learning:** Python, scikit-learn, Flask  
- **AI Assistant:** Gemini API  
- **Auth:** JWT, bcrypt  

---

## 🛠️ Setup & Installation

This project requires **three services running simultaneously**:  
1. Node.js API  
2. Python ML Service  
3. React Frontend  

### 📌 Prerequisites

- Node.js v18+  
- Python 3.x  
- MongoDB Atlas access  
- Gemini API Key  

---

## 1. Install Backend & Frontend Dependencies

```bash
# Navigate to the project
cd legacy-planner

# Install root dependencies
npm install

# Install frontend packages
cd client
npm install
cd ..

# Install backend packages
cd server
npm install node-fetch@2
npm install
````

---

## 2. Create Environment Variables

Inside:
`legacy-planner/server/.env`

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=YOUR_SECURE_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

## 3. Setup the Machine Learning Microservice

```bash
cd ml_service

# Install Python dependencies
pip install pandas scikit-learn joblib flask

# Train the model
python train_model.py
```

This generates: **success_predictor_model.pkl**

---

## 4. Run the Application (3 Terminals Required)

| Terminal | Location    | Command         | Purpose                       |
| -------- | ----------- | --------------- | ----------------------------- |
| 1        | /server     | `npm start`     | Node.js API (Port 5000)       |
| 2        | /ml_service | `python app.py` | Python ML service (Port 5001) |
| 3        | /client     | `npm start`     | React frontend (Port 3000)    |

---

## 🌐 Application Flow

1. Open: **[http://localhost:3000](http://localhost:3000)**
2. Register & log in
3. Add financial profile + budgeting data
4. Node.js calls ML API → prediction score generated
5. Dashboard updates with success probability & insights
6. Chat with AI Advisor for dynamic recommendations

---

## 🧪 API Architecture

```
React (Client)
     │
     ▼
Node.js API ─────▶ Calls Python ML microservice
     │
     ▼
MongoDB Atlas (Data Persistence)
```

---

## 📦 ML Model Details

* Algorithm: **Random Forest Classifier**
* Inputs: Income, savings %, target amount, timeline
* Outputs: Success Probability (0–1)
* Stored as: `success_predictor_model.pkl`

---

## 🔐 Security Considerations

* JWT for authentication
* Encrypted will details with additional password lock
* Executor access controlled by a one-time token
* CORS policies enabled

---

## 🤝 Contributing

Pull requests are welcome!
Before submitting:

* Follow clean commit messages
* Stick to project folder structure
* Create an issue for major feature discussions
