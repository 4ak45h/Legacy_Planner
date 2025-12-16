// server/models/LedgerItem.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LedgerItemSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },

  // asset | liability | other
  type: { type: String, enum: ['asset', 'liability', 'other'], default: 'asset' },

  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  value: { type: Number, required: true, default: 0 },

  currency: { type: String, default: 'INR' },

  acquiredAt: { type: Date, default: Date.now },

  tags: [String],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

LedgerItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LedgerItem', LedgerItemSchema);
