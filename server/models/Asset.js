const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  // The user who owns this asset (linked to the User model)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the 'User' model
    required: true,
  },
  // General classification of the asset (e.g., 'Digital', 'Financial', 'Physical')
  category: {
    type: String,
    required: true,
  },
  // A recognizable name for the asset (e.g., 'Google Account', 'Investment Portfolio')
  name: {
    type: String,
    required: true,
  },
  // The secure, primary piece of data (e.g., website URL, account number, or location of physical doc)
  primaryData: {
    type: String,
    required: true,
  },
  // Optional: A secure place for notes, passwords, or detailed instructions
  notes: {
    type: String,
    required: false,
  },
  // Date the asset was last updated
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Asset', AssetSchema);