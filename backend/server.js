require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json())

// Ensure MongoDB connection is ready for incoming requests (Serverless & Standalone)
app.use(async (req, res, next) => {
    await connectDB()
    next()
})

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Allow frontend origins — localhost in dev, Vercel deployments, or CLIENT_ORIGIN in prod
const allowedOrigin = process.env.CLIENT_ORIGIN
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true)
        }
        if (allowedOrigin && origin === allowedOrigin) return callback(null, true)
        if (origin.endsWith('.vercel.app')) return callback(null, true)
        callback(null, true)
    },
    credentials: true,
}
app.use(cors(corsOptions))

// ─── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'CareerSprint API is running' })
})

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'))

// Application routes
app.use('/api/applications', require('./routes/applicationRoutes'))

// File Upload route (Resume / Offer Letter)
app.use('/api/upload', require('./routes/uploadRoutes'))

// Admin routes (requires admin role)
app.use('/api/admin', require('./routes/adminRoutes'))

// Notification routes (requires auth)
app.use('/api/notifications', require('./routes/notificationRoutes'))

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ─── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    })
})

// ─── Start Server if run directly ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`CareerSprint server running on http://localhost:${PORT}`)
        await connectDB()
    })
}

module.exports = app
