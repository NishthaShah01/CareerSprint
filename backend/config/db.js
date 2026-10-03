const mongoose = require('mongoose')
const dns = require('dns')

// Fix for Node.js 17+ Windows DNS SRV lookup timeouts on MongoDB Atlas
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first')
}

const connectDB = async () => {
    const uri = process.env.MONGO_URI

    if (!uri || uri === 'your_mongodb_connection_string_here') {
        console.warn(
            '⚠  MONGO_URI is not configured. Update the MONGO_URI value in backend/.env to connect to MongoDB.'
        )
        return
    }

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        console.log(`✓ MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`✗ MongoDB connection error: ${error.message}`)
    }
}

module.exports = connectDB
