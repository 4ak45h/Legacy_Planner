const fetch = require('node-fetch');

const ANNUAL_INTEREST_RATE = 0.09;

// Appreciation scenarios (IMPORTANT ADDITION)
const SCENARIO_RATES = {
  conservative: 0.05,
  expected: 0.07,
  aggressive: 0.10
};

// ================= EMI CALCULATION =================
const calculateEMI = (principal, annualRate, tenureYears) => {
  const monthlyRate = annualRate / 12;
  const months = tenureYears * 12;
  if (monthlyRate === 0 || months === 0) return principal / (months || 1);
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
};

// ================= ML SERVICE =================
const getMLPrediction = async (data) => {
  try {
    const response = await fetch('http://localhost:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return result.success_probability || null;
  } catch (err) {
    console.error('ML Service Error:', err.message);
    return null;
  }
};

// ================= MAIN ANALYSIS =================
const runFinancialAnalysis = async (profile) => {
  const {
    monthlyIncome,
    currentSavings,
    creditScore,
    monthlyExpensesTotal,
    budget,
    property: { targetPrice, downPaymentPercentage, desiredTimelineYears }
  } = profile;

  // ===== 1. PRICE PROJECTION (NEW) =====
  const priceScenarios = {
    conservative: targetPrice * Math.pow(1 + SCENARIO_RATES.conservative, desiredTimelineYears),
    expected: targetPrice * Math.pow(1 + SCENARIO_RATES.expected, desiredTimelineYears),
    aggressive: targetPrice * Math.pow(1 + SCENARIO_RATES.aggressive, desiredTimelineYears)
  };

  // Use EXPECTED price for all planning math
  const projectedPrice = priceScenarios.expected;

  // ===== 2. BASIC CALCULATIONS =====
  const monthlySavingsPotential = monthlyIncome - monthlyExpensesTotal;
  const targetDownPayment = projectedPrice * (downPaymentPercentage / 100);
  const loanAmount = projectedPrice - targetDownPayment;
  const estimatedEMI = calculateEMI(loanAmount, ANNUAL_INTEREST_RATE, 20);

  const shortfall = targetDownPayment - currentSavings;
  const monthsToGoal = desiredTimelineYears * 12;
  const monthlySavingsRequired =
    shortfall > 0 && monthsToGoal > 0 ? shortfall / monthsToGoal : 0;

  // ===== 3. ML MODEL =====
  const mlScore = await getMLPrediction({
    monthlyIncome,
    currentSavings,
    monthlyExpensesTotal,
    desiredTimelineYears,
    targetPrice: projectedPrice
  });

  // ===== 4. RULE-BASED SCORE =====
  const debtPayments = budget?.debtPayments || 0;
  const totalMonthlyDebt = estimatedEMI + debtPayments;
  const emiRatio = (totalMonthlyDebt / (monthlyIncome || 1)) * 100;

  let ruleScore = 20;
  if (emiRatio < 30) ruleScore = 80;
  else if (emiRatio < 50) ruleScore = 50;

  const finalScore =
    mlScore !== null ? Math.round(ruleScore * 0.5 + mlScore * 0.5) : ruleScore;

  // ===== 5. REPORT =====
  const aiAnalysisMarkdown = generateAnalysis(
    profile,
    monthlySavingsPotential,
    monthlySavingsRequired,
    estimatedEMI,
    debtPayments,
    mlScore,
    priceScenarios
  );

  return {
    analysis: {
      affordabilityScore: finalScore,
      estimatedEMI: Math.round(estimatedEMI),
      monthlySavingsRequired: Math.round(monthlySavingsRequired),
      monthlySavingsPotential: Math.round(monthlySavingsPotential),
      loanAmount: Math.round(loanAmount),
      targetDownPayment: Math.round(targetDownPayment),
      priceProjection: {
        currentPrice: Math.round(targetPrice),
        conservative: Math.round(priceScenarios.conservative),
        expected: Math.round(priceScenarios.expected),
        aggressive: Math.round(priceScenarios.aggressive),
        appreciationRates: { conservative: 5, expected: 7, aggressive: 10 }
      },
      aiAnalysisMarkdown
    }
  };
};

// ================= REPORT GENERATOR =================
const generateAnalysis = (
  profile,
  msp,
  msr,
  emi,
  debt,
  mlScore,
  scenarios
) => {
  let analysis = '';

  if (mlScore !== null) {
    analysis += `### 📈 AI Success Prediction\n`;
    analysis += `Based on similar financial profiles, the AI predicts a **${mlScore}% probability** of achieving this property goal.\n\n---\n\n`;
  }

  analysis += `### 📊 Land Price Growth Scenarios\n`;
  analysis += `The system evaluates multiple appreciation scenarios to avoid assuming static land prices:\n\n`;
  analysis += `• **Conservative (5%)**: ₹${Math.round(scenarios.conservative).toLocaleString('en-IN')}\n`;
  analysis += `• **Expected (7%)**: ₹${Math.round(scenarios.expected).toLocaleString('en-IN')}\n`;
  analysis += `• **Aggressive (10%)**: ₹${Math.round(scenarios.aggressive).toLocaleString('en-IN')}\n\n`;
  analysis += `All financial planning calculations are based on the **Expected growth scenario**.\n\n---\n\n`;

  analysis += `### 💰 Savings Strategy\n`;
  if (msr > 0) {
    analysis += `You need to save **₹${Math.round(msr).toLocaleString('en-IN')} per month** to reach your goal in ${profile.property.desiredTimelineYears} years.\n`;
    analysis += `Your current savings capacity is **₹${Math.round(msp).toLocaleString('en-IN')} per month**.\n`;
  } else {
    analysis += `You already have sufficient savings for the down payment.\n`;
  }

  analysis += `\n### 🧾 Actionable Steps\n`;
  analysis += `• Review your monthly budget and reduce discretionary expenses.\n`;
  if (debt > 0) {
    analysis += `• Prioritize clearing existing debt of ₹${debt.toLocaleString('en-IN')}.\n`;
  }
  analysis += `• Maintain a credit score above 750 for better loan terms.\n`;

  return analysis;
};

module.exports = { runFinancialAnalysis };
