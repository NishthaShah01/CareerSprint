const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
    getNotifications,
    getUnreadCount,
    markOneRead,
    markAllRead,
} = require('../controllers/notificationController')

// All notification routes require the user to be logged in
router.use(protect)

router.get('/', getNotifications)
router.get('/unread-count', getUnreadCount)
router.patch('/read-all', markAllRead)
router.patch('/:id/read', markOneRead)

module.exports = router
