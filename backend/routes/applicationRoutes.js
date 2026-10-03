const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
    createApplication,
    getApplications,
    getApplication,
    updateApplication,
    deleteApplication,
} = require('../controllers/applicationController')

router.use(protect) // all application routes require authentication

router.route('/').get(getApplications).post(createApplication)
router.route('/:id').get(getApplication).put(updateApplication).delete(deleteApplication)

module.exports = router
