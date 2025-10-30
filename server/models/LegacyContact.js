    const mongoose = require('mongoose');

    const LegacyContactSchema = new mongoose.Schema({
      // The user who made the designation
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      // Contact's details
      contactName: {
        type: String,
        required: true,
      },
      contactEmail: {
        type: String,
        required: true,
      },
      // Status of the designation
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Active'], // Pending: invited, Accepted: acknowledged, Active: access granted
        default: 'Pending',
      },
      // Unique token for external verification (e.g., if we were to send an email link)
      verificationToken: {
        type: String,
        required: true,
        unique: true,
      },
      // Date the contact was designated
      dateDesignated: {
        type: Date,
        default: Date.now,
      },
    });

    module.exports = mongoose.model('LegacyContact', LegacyContactSchema);
    
