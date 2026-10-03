const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized — no token provided' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: decoded.id, role: decoded.role || 'candidate' }
        next()
    } catch {
        return res.status(401).json({ success: false, message: 'Not authorized — token invalid or expired' })
    }
}

/** Must be used AFTER protect() */
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied — admin only' })
    }
    next()
}

module.exports = { protect, adminOnly }
