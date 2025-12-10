const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Don't exit process, just log the error
        console.log('Continuing without database connection...');
    }
};

module.exports = connectDB;
