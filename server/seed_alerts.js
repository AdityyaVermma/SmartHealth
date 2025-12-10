const mongoose = require('mongoose');
const Alert = require('./models/Alert');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarthealth_db';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Create a pending alert from a "Health Worker"
        const pendingAlert = {
            location: 'Dhemaji',
            level: 'high',
            message: 'High turbidity levels detected in river water. 5 cases of severe diarrhea reported in Ward 3.',
            status: 'pending', // Key for admin to see
            isActive: true,
            channels: [],
            targetAudience: 'affected_area',
            createdBy: null, // Anonymous or Mock ID
            createdAt: new Date()
        };

        await Alert.create(pendingAlert);
        console.log('✅ Pending Alert Requested: Dhemaji (High Risk)');

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
