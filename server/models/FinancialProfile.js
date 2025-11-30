const mongoose = require('mongoose');

const FinancialProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // A user should only have one financial profile
  },
  // --- Personal/Income Data ---
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  familySize: { type: Number, default: 1 },
  employmentType: { type: String, required: true, enum: ['Salaried', 'Self-Employed', 'Business'] },
  monthlyIncome: { type: Number, required: true },
  annualIncome: { type: Number, required: true },
  currentSavings: { type: Number, default: 0 },
  investmentPortfolio: { type: Number, default: 0 },
  // existingLoans is now part of the new budget object
  creditScore: { type: Number, default: 700 },

  // --- NEW: Detailed Budget ---
  budget: {
    housing: { type: Number, default: 0 }, // Rent/Mortgage
    utilities: { type: Number, default: 0 }, // Electric, Water, Gas, Internet
    groceries: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    debtPayments: { type: Number, default: 0 }, // Replaces 'existingLoans'
    health: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  // This will be calculated on the server
  monthlyExpensesTotal: { type: Number, default: 0 },

  // --- Dream Property Data ---
  property: {
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    targetPrice: { type: Number, required: true },
    downPaymentPercentage: { type: Number, default: 20 },
    desiredTimelineYears: { type: Number, required: true },
  },

  // --- Analysis Results ---
  analysis: {
    affordabilityScore: { type: Number, default: 0 },
    estimatedEMI: { type: Number, default: 0 },
    monthlySavingsRequired: { type: Number, default: 0 },
    monthlySavingsPotential: { type: Number, default: 0 },
    keyRecommendations: { type: String, default: 'No analysis run yet.' },
    aiAnalysisMarkdown: { type: String, default: '' },
  },

  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FinancialProfile', FinancialProfileSchema);

