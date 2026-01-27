const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('No MONGODB_URI found in .env, skipping Mongo connection.');
            return;
        }    

        const conn = await mongoose.connect(process.env.MONGODB_URI);   
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.log('Falling back to Local JSON Database mode.');
        isConnected = false;
    }
};

const isMongoConnected = () => isConnected;

module.exports = { connectDB, isMongoConnected };
