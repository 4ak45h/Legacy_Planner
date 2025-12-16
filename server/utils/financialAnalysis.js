const fetch = require('node-fetch'); // Import fetch to call Python API

const ANNUAL_INTEREST_RATE = 0.09; 

// Helper function to calculate EMI (Keep existing math functions)
const calculateEMI = (principal, annualRate, tenureYears) => {
  const monthlyRate = annualRate / 12;
  const months = tenureYears * 12;
  if (monthlyRate === 0 || months === 0) return principal / (months || 1);
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

// Helper: Call the Python ML Service
const getMLPrediction = async (data) => {
    try {
        const response = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result.success_probability || 0; // Return percentage or 0 on fail
    } catch (err) {
        console.error("ML Service Error (is python server running?):", err.message);
        return null; // Return null if service is down
    }
};

/**
 * Main function to perform calculations AND call ML model.
 * NOTE: This is now an ASYNC function.
 */
const runFinancialAnalysis = async (profile) => {
  const { 
    monthlyIncome, currentSavings, creditScore, monthlyExpensesTotal, budget,
    property: { targetPrice, downPaymentPercentage, desiredTimelineYears }
  } = profile;

  // 1. Standard Math Calculations
  const monthlySavingsPotential = monthlyIncome - monthlyExpensesTotal;
  const targetDownPayment = targetPrice * (downPaymentPercentage / 100);
  const loanAmount = targetPrice - targetDownPayment;
  const estimatedEMI = calculateEMI(loanAmount, ANNUAL_INTEREST_RATE, 20); 

  const shortfall = targetDownPayment - currentSavings;
  const monthsToGoal = desiredTimelineYears * 12;
  let monthlySavingsRequired = 0;
  if (shortfall > 0 && monthsToGoal > 0) {
    monthlySavingsRequired = shortfall / monthsToGoal;
  }

  // 2. ML Model Prediction
  const mlInput = {
      monthlyIncome,
      currentSavings,
      monthlyExpensesTotal,
      desiredTimelineYears,
      targetPrice
  };
  
  const mlScore = await getMLPrediction(mlInput); // Await the prediction

  // 3. Rule-Based Scoring
  const debtPayments = (budget && budget.debtPayments) ? budget.debtPayments : 0;
  const totalMonthlyDebt = estimatedEMI + debtPayments;
  const emiAffordability = (totalMonthlyDebt / (monthlyIncome || 1)) * 100;

  let ruleScore = 0;
  if (emiAffordability < 30) ruleScore = 80;
  else if (emiAffordability < 50) ruleScore = 50;
  else ruleScore = 20;

  // 4. Hybrid Score Calculation
  let finalScore = ruleScore;
  if (mlScore !== null) {
      // 50% weight to AI, 50% to Rule for the final Affordability Score
      finalScore = Math.round((ruleScore * 0.5) + (mlScore * 0.5));
  }
  
  // 5. Generate Report Text
  const aiAnalysisMarkdown = generateAnalysis(
      profile, monthlySavingsPotential, monthlySavingsRequired, 
      estimatedEMI, debtPayments, mlScore
  );

  return {
    analysis: {
      affordabilityScore: finalScore,
      estimatedEMI: Math.round(estimatedEMI),
      monthlySavingsRequired: Math.round(monthlySavingsRequired),
      monthlySavingsPotential: Math.round(monthlySavingsPotential),
      loanAmount: Math.round(loanAmount),
      targetDownPayment: Math.round(targetDownPayment),
      aiAnalysisMarkdown: aiAnalysisMarkdown,
    },
  };
};

const generateAnalysis = (profile, msp, msr, emi, debt, mlScore) => {
    let analysis = "";

    // Add ML Insight at the very top if available
    if (mlScore !== null) {
        analysis += `### 📈 AI Success Prediction\n`;
        analysis += `Our machine learning model calculates a **${mlScore}% probability** of you achieving this property goal based on successful profiles with similar finances. \n\n---\n\n`;
    }

    analysis += "### Financial Feasibility\n\n";

    const shortfall = profile.property.targetPrice * (profile.downPaymentPercentage / 100) - profile.currentSavings;
    
    if (shortfall > 0) {
        analysis += `You have a down payment shortfall of **₹${shortfall.toLocaleString('en-IN')}**.\n`;
        
        if (emi > (profile.monthlyIncome * 0.4)) {
            analysis += `* **EMI Warning:** Estimated EMI is **₹${Math.round(emi).toLocaleString('en-IN')}**, which is high relative to income.\n`;
        }
    } else {
        analysis += `✅ **Strong Position:** You have sufficient savings for the down payment.\n`;
    }

    analysis += "\n### Savings Strategy\n\n";
    if (msr > 0) {
        analysis += `1. **Target:** Save **₹${msr.toLocaleString('en-IN')}** monthly to reach your goal in ${profile.property.desiredTimelineYears} years.\n`;
        analysis += `2. **Current Potential:** You currently save about **₹${msp.toLocaleString('en-IN')}** per month.\n`;
    } else {
        analysis += `1. **Invest:** Focus on investing your surplus savings for better returns.\n`;
    }

    analysis += "\n### Actionable Steps\n\n";
    analysis += `1. **Budget:** Check your detailed budget (Housing, Food, Entertainment).\n`;
    if (debt > 0) {
         analysis += `2. **Debt:** You have existing debt payments of ₹${debt.toLocaleString('en-IN')} recorded. Prioritize paying these off.\n`;
    }
    analysis += `3. **Credit:** Keep your score above 750 for the best home loan rates.\n`;

    return analysis;
};

module.exports = { runFinancialAnalysis };