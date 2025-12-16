// server/routes/ledgerRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LedgerItem = require('../models/LedgerItem');

// ---------------------------
// GET all items for a user
// ---------------------------
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.user.id };

    if (req.query.type && ['asset', 'liability', 'other'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    const items = await LedgerItem.find(filter).sort({ createdAt: -1 }).lean();

    const totals = items.reduce(
      (acc, item) => {
        const val = Number(item.value || 0);
        acc[item.type] += val;
        acc.total += val;
        return acc;
      },
      { asset: 0, liability: 0, other: 0, total: 0 }
    );

    res.json({ items, totals });
  } catch (err) {
    console.error("Ledger GET Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------------------
// CREATE item
// ---------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { title, value, type, acquiredAt, description } = req.body;

    if (!title || !value) {
      return res.status(400).json({ msg: "Title and value are required" });
    }

    const item = new LedgerItem({
      user: req.user.id,
      title,
      value: Number(value),
      type: type || "asset",
      description: description || "",
      acquiredAt: acquiredAt ? new Date(acquiredAt) : Date.now()
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Ledger POST Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------------------
// UPDATE item
// ---------------------------
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await LedgerItem.findById(req.params.id);

    if (!item || item.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Item not found" });
    }

    Object.assign(item, req.body, {
      value: Number(req.body.value),
      updatedAt: Date.now()
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Ledger PUT Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------------------
// DELETE item
// ---------------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await LedgerItem.findById(req.params.id);

    if (!item || item.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Item not found" });
    }

    await item.remove();
    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error("Ledger DELETE Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
