// server/routes/aiRoutes.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const auth = require('../middleware/auth');

function normalizeProbability(v) {
  if (v == null) return null;
  if (typeof v === 'number' && v > 0 && v <= 1) return +(v * 100).toFixed(2);
  if (typeof v === 'number') return +v.toFixed(2);
  const n = Number(v);
  if (!Number.isNaN(n)) {
    if (n > 0 && n <= 1) return +(n * 100).toFixed(2);
    return +n.toFixed(2);
  }
  return null;
}

router.post('/analyze', auth, async (req, res) => {
  try {
    const body = req.body || {};
    const monthlyIncome = body.monthlyIncome ?? body.profile?.monthlyIncome;
    const currentSavings = body.currentSavings ?? body.profile?.currentSavings;
    let monthlyExpensesTotal = body.monthlyExpensesTotal;
    if (monthlyExpensesTotal == null && body.profile?.budget) {
      monthlyExpensesTotal = Object.values(body.profile.budget || {}).reduce((s, v) => s + Number(v || 0), 0);
    }
    const desiredTimelineYears = body.desiredTimelineYears ?? body.profile?.property?.desiredTimelineYears ?? body.profile?.property?.timeline;
    const targetPrice = body.targetPrice ?? body.profile?.property?.targetPrice;

    if ([monthlyIncome, currentSavings, monthlyExpensesTotal, desiredTimelineYears, targetPrice].some(v => v == null)) {
      return res.status(400).json({ msg: 'Missing required fields: monthlyIncome, currentSavings, monthlyExpensesTotal, desiredTimelineYears, targetPrice' });
    }

    const mlPayload = {
      monthlyIncome: Number(monthlyIncome),
      currentSavings: Number(currentSavings),
      monthlyExpensesTotal: Number(monthlyExpensesTotal),
      desiredTimelineYears: Number(desiredTimelineYears),
      targetPrice: Number(targetPrice)
    };

    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001/predict';
    const mlRes = await fetch(mlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mlPayload),
      timeout: 15000
    });

    if (!mlRes.ok) {
      const text = await mlRes.text().catch(() => '');
      return res.status(502).json({ msg: 'ML service error', status: mlRes.status, detail: text });
    }

    const mlJson = await mlRes.json();
    const rawProb = mlJson.success_probability ?? mlJson.probability ?? mlJson.score ?? null;
    const probPercent = normalizeProbability(rawProb);

    const analysis = {
      success_probability: probPercent,
      success_probability_percent: probPercent,
      aiAnalysisMarkdown: mlJson.aiAnalysisMarkdown || `**AI Advisor**\n\n- Success probability: **${probPercent != null ? probPercent + '%' : 'N/A'}**`
    };

    return res.json({ analysis });
  } catch (err) {
    console.error('AI analyze error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
