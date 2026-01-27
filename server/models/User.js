const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['community', 'health_worker', 'admin', 'national_admin'],
        default: 'community'
    },
    location: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 }, { unique: true });    // ascending index on email to  make faster performance for email lookups
userSchema.index({ role: 1 });

const createHybridModel = require('../utils/createHybridModel');

module.exports = createHybridModel('User', userSchema);
