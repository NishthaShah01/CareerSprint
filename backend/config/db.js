const mongoose = require('mongoose')
const dns = require('dns')

// Fix for Node.js 17+ Windows DNS SRV lookup timeouts on MongoDB Atlas
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first')
}

let isConnected = false

const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState >= 1) {
        isConnected = true
        return mongoose.connection
    }

    const uri = process.env.MONGO_URI

    if (!uri || uri === 'your_mongodb_connection_string_here') {
        console.warn(
            '⚠ MONGO_URI is not configured. Set MONGO_URI in your environment variables to connect to MongoDB.'
        )
        return
    }

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        isConnected = true
        console.log(`✓ MongoDB connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error(`✗ MongoDB connection error: ${error.message}`)
    }
}

module.exports = connectDB
