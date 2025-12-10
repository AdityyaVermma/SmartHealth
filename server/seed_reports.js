require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('./models/Report'); // Adjust path as needed
const User = require('./models/User');     // Adjust path as needed

// Helper to get random array element
const random = arr => arr[Math.floor(Math.random() * arr.length)];

// Seed Data
const LOCATIONS = ['Dhemaji', 'Guwahati', 'Dibrugarh', 'Silchar', 'Tezpur', 'Jorhat', 'Nagaon'];
const SYMPTOMS = ['Fever', 'Diarrhea', 'Vomiting', 'Stomach Pain', 'Skin Rash', 'Nausea'];
const WATER_SOURCES = ['River', 'Pond', 'Community Well', 'Well', 'Tap Water', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High'];

const connectDB = async () => {
    try {
        const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/smarthealth_db';
        console.log('Connecting to:', connStr);
        await mongoose.connect(connStr);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const seedReports = async () => {
    await connectDB();

    try {
        // Find a user to assign reports to (preferably CHW or Citizen)
        let user = await User.findOne();
        if (!user) {
            console.log('No users found. Creating a mock user...');
            // Create a user directly
            user = await User.create({
                name: 'Seed User',
                email: 'seed@example.com',
                password: '$2b$10$YourHashedPasswordHereOrSomethingDummy',
                role: 'community',
                phoneNumber: '9876543210',
                location: 'Guwahati'
            });
            console.log('Created mock user:', user.email);
        } else {
            console.log('Using existing user:', user.email);
        }

        const reports = [];
        for (let i = 0; i < 50; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            reports.push({
                userId: user._id,
                state: 'Assam',
                location: random(LOCATIONS),
                symptoms: [random(SYMPTOMS), random(SYMPTOMS)],
                waterSource: random(WATER_SOURCES),
                severity: random(SEVERITIES),
                notes: 'Auto-generated seed report for testing monitoring dashboard',
                registeredCases: Math.floor(Math.random() * 5),
                timestamp: date
            });
        }

        await Report.insertMany(reports);
        console.log(`✅ Successfully seeded ${reports.length} reports!`);

    } catch (error) {
        console.error('Error seeding reports:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedReports();
