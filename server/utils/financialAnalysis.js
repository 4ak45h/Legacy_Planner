const fetch = require('node-fetch'); // Import fetch to call Python API

// **NOTE: Interest Rate Assumption**
const ANNUAL_INTEREST_RATE = 0.09; 

// Helper function to calculate EMI
const calculateEMI = (principal, annualRate, tenureYears) => {
  const monthlyRate = annualRate / 12;
  const months = tenureYears * 12;
  if (monthlyRate === 0 || months === 0) return principal / (months || 1);
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
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
 * NOTE: This is now an ASYNC function because it calls an external API.
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
  // We send exactly what the Python model expects
  const mlInput = {
      monthlyIncome,
      currentSavings,
      monthlyExpensesTotal,
      desiredTimelineYears,
      targetPrice
  };
  
  const mlSuccessScore = await getMLPrediction(mlInput);

  // 3. Rule-Based Scoring
  const debtPayments = (budget && budget.debtPayments) ? budget.debtPayments : 0;
  const totalMonthlyDebt = estimatedEMI + debtPayments;
  const debtToIncomeRatio = (debtPayments / (monthlyIncome || 1)) * 100;
  const emiAffordability = (totalMonthlyDebt / (monthlyIncome || 1)) * 100;

  let ruleScore = 0;
  if (emiAffordability < 30) ruleScore = 80;
  else if (emiAffordability < 50) ruleScore = 50;
  else ruleScore = 20;

  // 4. Hybrid Score Calculation
  // If ML works, weight it 40% vs 60% rule-based. If ML fails, use rules only.
  let finalScore = ruleScore;
  if (mlSuccessScore !== null) {
      finalScore = Math.round((ruleScore * 0.6) + (mlSuccessScore * 0.4));
  }
  
  // 5. Generate Report Text
  const aiAnalysisMarkdown = generateAnalysis(
      profile, monthlySavingsPotential, monthlySavingsRequired, 
      estimatedEMI, debtToIncomeRatio, mlSuccessScore
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

const generateAnalysis = (profile, msp, msr, emi, dti, mlScore) => {
    let analysis = "### Financial Feasibility\n\n";

    // Add ML Insight if available
    if (mlScore !== null) {
        analysis += `### 🤖 AI Prediction: ${mlScore}%\n`;
        analysis += `Our machine learning model calculates a **${mlScore}% probability** of you achieving this goal based on successful profiles with similar income and targets.\n\n---\n\n`;
    }

    const shortfall = profile.property.targetPrice * (profile.downPaymentPercentage / 100) - profile.currentSavings;
    
    if (shortfall > 0) {
        analysis += `Based on current financials, purchasing ${profile.property.name} requires planning:\n\n`;
        analysis += `* **Down Payment Gap:** You need **₹${shortfall.toLocaleString('en-IN')}** more.\n`;
        
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
    analysis += `1. **Budget:** Check your 'Debt Payments' and 'Entertainment' categories in the budget tool.\n`;
    if (dti > 40) {
         analysis += `2. **Debt:** Your Debt-to-Income ratio (${dti.toFixed(1)}%) is high. Prioritize paying off existing loans.\n`;
    }
    analysis += `3. **Credit:** Keep your score above 750 for the best home loan rates.\n`;

    return analysis;
};

module.exports = { runFinancialAnalysis };