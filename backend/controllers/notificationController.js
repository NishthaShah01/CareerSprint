const Notification = require('../models/Notification')

// ─── GET /api/notifications ────────────────────────────────────────────────────
// Returns the logged-in user's notifications, newest first (max 50)
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        res.json({ success: true, notifications })
    } catch (err) {
        console.error('[notifications.getNotifications]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── GET /api/notifications/unread-count ──────────────────────────────────────
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false,
        })
        res.json({ success: true, count })
    } catch (err) {
        console.error('[notifications.getUnreadCount]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── PATCH /api/notifications/:id/read ────────────────────────────────────────
const markOneRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // scoped to this user only
            { isRead: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' })
        }

        res.json({ success: true, notification })
    } catch (err) {
        console.error('[notifications.markOneRead]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── PATCH /api/notifications/read-all ────────────────────────────────────────
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        )
        res.json({ success: true, message: 'All notifications marked as read' })
    } catch (err) {
        console.error('[notifications.markAllRead]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

module.exports = { getNotifications, getUnreadCount, markOneRead, markAllRead }
