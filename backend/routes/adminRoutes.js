const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
    getAllApplications,
    getApplicationById,
    updateStatus,
    getStats,
    getCandidates,
    getCandidateApplications,
} = require('../controllers/adminController')

// All admin routes require authentication + admin role
router.use(protect, adminOnly)

router.get('/stats', getStats)
router.get('/applications', getAllApplications)
router.get('/applications/:id', getApplicationById)
router.patch('/applications/:id/status', updateStatus)
router.get('/candidates', getCandidates)
router.get('/candidates/:id/applications', getCandidateApplications)

module.exports = router
