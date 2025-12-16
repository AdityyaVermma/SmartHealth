const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'support', 'bug', 'feedback', 'other',
            'water', 'sanitation', 'infrastructure', 'health_concern',
            'supplies', 'equipment', 'staffing', 'emergency', 'logistics'
        ],
        default: 'support'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved'],
        default: 'open'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    messages: [{
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
