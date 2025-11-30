const mongoose = require('mongoose');

const WillSchema = new mongoose.Schema({
  // Link to the user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Location of the physical or digital will
  location: {
    type: String,
    required: true,
    default: 'e.g., Safe deposit box at HDFC Bank, Indiranagar Branch',
  },
  // Details of the executor
  executorName: {
    type: String,
    required: true,
  },
  executorPhone: {
    type: String,
  },
  // Contact info for the lawyer
  lawyerName: {
    type: String,
    default: 'N/A',
  },
  lawyerContact: {
    type: String,
    default: 'N/A',
  },
  // Any other important notes
  notes: {
    type: String,
  },
  // NEW: Reason for the latest update
  lastUpdateReason: {
    type: String,
    default: 'Initial Draft',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Will', WillSchema);