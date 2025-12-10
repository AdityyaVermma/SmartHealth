const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    state: {
        type: String,
        required: true,
        default: 'Assam'
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    symptoms: {
        type: [String],
        required: [true, 'At least one symptom is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one symptom must be provided'
        }
    },
    waterSource: {
        type: String,
        required: [true, 'Water source is required'],
        enum: ['River', 'Well', 'Community Well', 'Pond', 'Tap Water', 'Other']
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    notes: {
        type: String,
        trim: true
    },
    registeredCases: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
reportSchema.index({ location: 1 });
reportSchema.index({ severity: 1 });
reportSchema.index({ timestamp: -1 });
reportSchema.index({ userId: 1 });
reportSchema.index({ state: 1, location: 1 });

module.exports = mongoose.model('Report', reportSchema);
