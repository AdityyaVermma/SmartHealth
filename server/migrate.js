require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Report = require('./models/Report');

const DATA_FILE = path.join(__dirname, 'ne_data.json');

const migrateData = async () => {
    try {
        console.log('🚀 Starting data migration (Reports Only)...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Read existing data
        if (!fs.existsSync(DATA_FILE)) {
            console.log('❌ ne_data.json not found!');
            process.exit(1);
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

        // Fetch existing users to assign reports to
        const existingUsers = await User.find({});
        if (existingUsers.length === 0) {
            console.log('❌ No existing users found in DB! Please register a user first.');
            process.exit(1);
        }

        const defaultUser = existingUsers[0];
        console.log(`ℹ️  Assigning new reports to existing user: ${defaultUser.email}\n`);

        // Clear existing REPORTS only
        console.log('🗑️  Clearing existing REPORTS (Keeping Users)...');
        await Report.deleteMany({});
        console.log('✅ Cleared existing reports\n');

        // Migrate Reports
        console.log('📝 Migrating new NE reports...');
        let migratedReports = 0;
        let skippedReports = 0;

        if (data.reports && data.reports.length > 0) {
            for (const oldReport of data.reports) {
                try {
                    // Ensure symptoms is an array
                    let symptoms = oldReport.symptoms;
                    if (typeof symptoms === 'string') {
                        symptoms = [symptoms];
                    } else if (!Array.isArray(symptoms)) {
                        symptoms = ['Unknown'];
                    }

                    const newReport = await Report.create({
                        userId: defaultUser._id,
                        state: oldReport.state || 'Assam',
                        location: oldReport.location,
                        symptoms: symptoms,
                        waterSource: oldReport.waterSource,
                        severity: oldReport.severity || 'Low',
                        notes: oldReport.notes || '',
                        registeredCases: oldReport.registeredCases || 0,
                        timestamp: oldReport.timestamp ? new Date(oldReport.timestamp) : new Date()
                    });

                    migratedReports++;
                    if (migratedReports % 5 === 0) {
                        console.log(`  ✅ Migrated ${migratedReports} reports...`);
                    }
                } catch (error) {
                    console.log(`  ⚠️  Skipped report: ${error.message}`);
                    skippedReports++;
                }
            }
        }

        console.log(`\n✅ Migrated ${migratedReports} reports`);
        if (skippedReports > 0) {
            console.log(`⚠️  Skipped ${skippedReports} reports`);
        }

        console.log('\n✅ Migration completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
};

// Run migration
migrateData();
