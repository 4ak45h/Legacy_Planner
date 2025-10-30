// **NOTE: Interest Rate Assumption**
// We'll use a fixed, typical annual interest rate for calculation purposes (e.g., 9% or 0.09)
const ANNUAL_INTEREST_RATE = 0.09; 

// Helper function to calculate EMI (Equated Monthly Installment)
const calculateEMI = (principal, annualRate, tenureYears) => {
  const monthlyRate = annualRate / 12; // Monthly interest rate
  const months = tenureYears * 12; // Total number of months

  if (monthlyRate === 0) return principal / months; // Avoid division by zero if rate is 0

  // EMI Formula: P * R * (1 + R)^N / ((1 + R)^N - 1)
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
};

/**
 * Main function to perform all calculations and generate analysis.
 * @param {object} profile The user's financial and property profile data.
 */
const runFinancialAnalysis = (profile) => {
  const { 
    monthlyIncome, monthlyExpenses, currentSavings, existingLoans, creditScore,
    property: { targetPrice, downPaymentPercentage, desiredTimelineYears }
  } = profile;

  // 1. Calculate Core Metrics
  const monthlySavingsPotential = monthlyIncome - monthlyExpenses;
  const targetDownPayment = targetPrice * (downPaymentPercentage / 100);
  const loanAmount = targetPrice - targetDownPayment;

  // We'll assume a standard 20-year loan tenure for EMI calculation
  const LOAN_TENURE_YEARS = 20; 
  const estimatedEMI = calculateEMI(loanAmount, ANNUAL_INTEREST_RATE, LOAN_TENURE_YEARS);

  // 2. Calculate Savings Goal
  // Shortfall in savings needed for down payment
  const savingsShortfall = targetDownPayment - currentSavings;
  const monthsToDownPayment = desiredTimelineYears * 12;

  // Monthly savings required to meet the shortfall within the desired timeline
  let monthlySavingsRequired = 0;
  if (savingsShortfall > 0 && monthsToDownPayment > 0) {
    monthlySavingsRequired = savingsShortfall / monthsToDownPayment;
  }

  // 3. Calculate Affordability Score (Based on key financial ratios)
  // Ideal Debt-to-Income Ratio (DTI) is < 40%
  const debtToIncomeRatio = (existingLoans / monthlyIncome) * 100; 

  // Calculate total monthly debt (EMI + Existing Loans)
  const totalMonthlyDebt = estimatedEMI + existingLoans;

  // Check if EMI is affordable based on income (e.g., total debt < 50% of income)
  const emiAffordability = (totalMonthlyDebt / monthlyIncome) * 100;

  let affordabilityScore = 0;
  if (emiAffordability < 30) affordabilityScore = 80;
  else if (emiAffordability < 40) affordabilityScore = 60;
  else if (emiAffordability < 50) affordabilityScore = 40;
  else affordabilityScore = 10;

  // Credit score adjustment
  if (creditScore > 780) affordabilityScore += 10;
  else if (creditScore < 650) affordabilityScore -= 10;

  // Ensure score is between 0 and 100
  affordabilityScore = Math.max(0, Math.min(100, affordabilityScore));

  // 4. Generate Analysis Text (This mimics the AI output)
  const aiAnalysisMarkdown = generateAnalysis(profile, monthlySavingsPotential, monthlySavingsRequired, estimatedEMI, debtToIncomeRatio);

  // 5. Return the results
  return {
    analysis: {
      affordabilityScore: Math.round(affordabilityScore),
      estimatedEMI: Math.round(estimatedEMI),
      monthlySavingsRequired: Math.round(monthlySavingsRequired),
      monthlySavingsPotential: Math.round(monthlySavingsPotential), // Include for dashboard
      loanAmount: Math.round(loanAmount),
      targetDownPayment: Math.round(targetDownPayment),
      aiAnalysisMarkdown: aiAnalysisMarkdown,
    },
  };
};

// Function to generate the structured analysis based on metrics
const generateAnalysis = (profile, msp, msr, emi, dti) => {
    let analysis = "### Financial Feasibility\n\n";

    // --- Feasibility Section ---
    const shortfall = profile.property.targetPrice * (profile.downPaymentPercentage / 100) - profile.currentSavings;
    if (shortfall > 0) {
        analysis += `Based on your current financial situation, purchasing the ${profile.property.name} seems infeasible in the immediate future. Here's why:\n\n`;

        // Down Payment Check
        analysis += `**Down Payment:** You need **₹${shortfall.toLocaleString('en-IN')}** more in savings to meet the down payment target.\n\n`;

        // EMI Check
        if (emi > (profile.monthlyIncome * 0.4)) {
            analysis += `**EMI Requirements:** At **₹${Math.round(emi).toLocaleString('en-IN')}** per month, the EMI would be **${((emi / profile.monthlyIncome) * 100).toFixed(1)}%** of your monthly income (**₹${profile.monthlyIncome.toLocaleString('en-IN')}**). This is beyond the comfortable limit.\n\n`;
        }
        // DTI Check
        analysis += `**Debt-to-Income Ratio:** At **${dti.toFixed(1)}%**, your current DTI is high (ideal is below 40%), which may affect loan approval.\n\n`;

    } else {
        analysis += `Your profile shows excellent financial stability. You have sufficient savings for the down payment and a healthy income to support the loan.\n\n`;
    }

    // --- Savings Strategy Section ---
    analysis += "\n\n### Savings Strategy\n\n";
    if (msr > 0) {
        analysis += `To achieve your goal in ${profile.property.desiredTimelineYears} years, you need to save **₹${msr.toLocaleString('en-IN')}** monthly.\n\n`;
        analysis += `1. **Target Savings:** Aim to save **₹${msr.toLocaleString('en-IN')}** monthly, which is **${((msr / msp) * 100).toFixed(1)}%** of your current saving potential.\n\n`;
    } else {
        analysis += `1. **Actionable Step:** Since you already have enough saved for the down payment, focus on building an emergency fund or increasing your investment portfolio.\n\n`;
    }

    // --- Actionable Steps Section ---
    analysis += "\n\n### Actionable Steps\n\n";
    analysis += `1. **Increase Income:** Seek opportunities for salary increments or additional side jobs.\n`;
    analysis += `2. **Budget Refinement:** Cut unnecessary expenses and channel funds towards savings.\n`;
    if (dti > 40) {
         analysis += `3. **Debt Repayment:** Prioritize clearing existing loans to reduce your financial burden.\n`;
    }

    analysis += `4. **Build Credit:** Improve your score (currently ${profile.creditScore}) for better loan terms.\n`;


    return analysis;
};


module.exports = { runFinancialAnalysis };