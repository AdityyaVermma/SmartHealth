const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical', 'Yellow', 'Orange', 'Red', 'Low', 'Medium', 'High'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    reportCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    channels: [{
        type: String, // 'sms', 'email'
        default: []
    }],
    targetAudience: {
        type: String,
        default: 'all'
    },
    resolvedAt: {
        type: Date
    },
    broadcastSummary: {
        totalSent: Number,
        recipientTypeCount: {
            community: Number,
            health_worker: Number,
            admin: Number
        },
        sentAt: Date
    },
    manualPhoneNumbers: {
        type: [String],
        default: []
    },
    manualEmails: {
        type: [String],
        default: []
    },
    targetGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContactGroup'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
alertSchema.index({ location: 1, isActive: 1 });
alertSchema.index({ level: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
