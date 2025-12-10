const mongoose = require('mongoose');

const contactGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['sms', 'email', 'mixed'],
        default: 'mixed'
    },
    contacts: [{
        type: String, // email or phone number
        required: true
    }],
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ContactGroup', contactGroupSchema);
