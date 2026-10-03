const Application = require('../models/Application')
const User = require('../models/User')
const Notification = require('../models/Notification')

const ADMIN_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected']

// Build a human-friendly notification for each status transition
// Build a human-friendly notification for each status transition
const buildNotification = (newStatus, companyName, role) => {
    const messages = {
        Applied: {
            title: 'Application Submitted',
            message: `Your application for ${role} at ${companyName} has been submitted.`,
        },
        'Under Review': {
            title: 'Application Under Review',
            message: `Your application for ${role} at ${companyName} is now under review.`,
        },
        Shortlisted: {
            title: 'You\'ve Been Shortlisted!',
            message: `Good news! You have been shortlisted for ${role} at ${companyName}.`,
        },
        OA: {
            title: 'Online Assessment Stage',
            message: `Your application for ${role} at ${companyName} has moved to the Online Assessment stage.`,
        },
        Interview: {
            title: 'Interview Scheduled',
            message: `Your application for ${role} at ${companyName} has moved to the Interview stage.`,
        },
        Offer: {
            title: 'Offer Received! 🎉',
            message: `Congratulations! You have received an offer for ${role} at ${companyName}.`,
        },
        Rejected: {
            title: 'Application Rejected',
            message: `Your application for ${role} at ${companyName} has been marked as Rejected.`,
        },
    }
    return messages[newStatus] || {
        title: 'Application Status Updated',
        message: `Your application for ${role} at ${companyName} is now ${newStatus}.`,
    }
}

// ─── GET /api/admin/applications ──────────────────────────────────────────────
// Returns ALL applications across ALL users, populated with user info
const getAllApplications = async (req, res) => {
    try {
        const { search = '', status = '', jobType = '', page = 1, limit = 50, sort = 'newest' } = req.query

        const filter = {}

        if (status && ADMIN_STATUSES.includes(status)) {
            filter.status = status
        }

        if (jobType) {
            filter.jobType = jobType
        }

        if (search.trim()) {
            const re = new RegExp(search.trim(), 'i')
            const matchingUsers = await User.find({
                $or: [{ name: re }, { email: re }]
            }).select('_id').lean()
            const matchingUserIds = matchingUsers.map(u => u._id)

            filter.$or = [
                { companyName: re },
                { role: re },
                { location: re },
                { user: { $in: matchingUserIds } }
            ]
        }

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            company: { companyName: 1 },
            role: { role: 1 },
        }
        const sortOrder = sortMap[sort] || { createdAt: -1 }

        const skip = (Number(page) - 1) * Number(limit)
        const total = await Application.countDocuments(filter)

        const applications = await Application.find(filter)
            .populate('user', 'name email university phone')
            .sort(sortOrder)
            .skip(skip)
            .limit(Number(limit))
            .lean()

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            applications,
        })
    } catch (err) {
        console.error('[admin.getAllApplications]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── GET /api/admin/applications/:id ──────────────────────────────────────────
const getApplicationById = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id)
            .populate('user', 'name email university phone linkedin github portfolio')
            .lean()

        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found' })
        }

        res.json({ success: true, application: app })
    } catch (err) {
        console.error('[admin.getApplicationById]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

const STAGE_ORDER = ['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer']

// Helper to synchronize application timeline with status transitions
const syncTimeline = (existingTimeline = [], newStatus, interviewDate, applicationDate) => {
    const timeline = [...(existingTimeline || [])]
    const existingStageNames = timeline.map(t => t.stage.toLowerCase())

    // Ensure standard stages exist in timeline array
    STAGE_ORDER.forEach(st => {
        if (!existingStageNames.includes(st.toLowerCase())) {
            timeline.push({
                stage: st,
                completed: false,
                date: null,
                notes: '',
            })
        }
    })

    const statusLower = newStatus.toLowerCase()

    if (statusLower === 'rejected') {
        let rejectedIndex = timeline.findIndex(t => t.stage.toLowerCase() === 'rejected')
        if (rejectedIndex === -1) {
            timeline.push({
                stage: 'Rejected',
                completed: true,
                date: new Date(),
                notes: 'Application marked as Rejected',
            })
        } else {
            timeline[rejectedIndex].completed = true
            if (!timeline[rejectedIndex].date) {
                timeline[rejectedIndex].date = new Date()
            }
        }
        return timeline
    }

    const targetIdx = STAGE_ORDER.findIndex(st => st.toLowerCase() === statusLower)

    if (targetIdx !== -1) {
        STAGE_ORDER.forEach((st, idx) => {
            const stageIdx = timeline.findIndex(t => t.stage.toLowerCase() === st.toLowerCase())
            if (stageIdx !== -1) {
                if (idx <= targetIdx) {
                    timeline[stageIdx].completed = true
                    if (st === 'Interview' && interviewDate) {
                        timeline[stageIdx].date = new Date(interviewDate)
                    } else if (st === 'Applied' && applicationDate) {
                        timeline[stageIdx].date = new Date(applicationDate)
                    } else if (!timeline[stageIdx].date) {
                        timeline[stageIdx].date = new Date()
                    }
                } else {
                    // Future stage: pending
                    timeline[stageIdx].completed = false
                    timeline[stageIdx].date = null
                }
            }
        })

        // Reset Rejected stage if status is moved back to an active stage
        const rejectedIdx = timeline.findIndex(t => t.stage.toLowerCase() === 'rejected')
        if (rejectedIdx !== -1) {
            timeline[rejectedIdx].completed = false
            timeline[rejectedIdx].date = null
        }
    }

    return timeline
}

// ─── PATCH /api/admin/applications/:id/status ─────────────────────────────────
// Admin updates a candidate's application status; candidate immediately sees the change.
// A notification is created when status or offer letter changes.
const updateStatus = async (req, res) => {
    try {
        const { status, interviewDate, offerLetterUrl, offerLetterFilename } = req.body

        const existing = await Application.findById(req.params.id).populate('user', 'name email')
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Application not found' })
        }

        const oldStatus = existing.status
        const statusChanged = status && ADMIN_STATUSES.includes(status) && oldStatus !== status

        if (status && ADMIN_STATUSES.includes(status)) {
            existing.status = status
        }

        if (interviewDate !== undefined) {
            existing.interviewDate = interviewDate ? new Date(interviewDate) : null
        }

        const effectiveStatus = status && ADMIN_STATUSES.includes(status) ? status : existing.status
        const effectiveInterviewDate = existing.interviewDate

        // Offer Letter validation: Only allowed when status is 'Offer'
        if (offerLetterUrl && offerLetterUrl.trim() !== '' && effectiveStatus !== 'Offer') {
            return res.status(400).json({
                success: false,
                message: 'Offer Letter can only be attached when application status is set to Offer.',
            })
        }

        // Synchronize timeline stages automatically
        existing.timeline = syncTimeline(
            existing.timeline,
            effectiveStatus,
            effectiveInterviewDate,
            existing.applicationDate
        )

        // Handle Offer Letter updates
        const offerLetterChanged = offerLetterUrl !== undefined && existing.offerLetterUrl !== offerLetterUrl
        if (effectiveStatus === 'Offer' && offerLetterUrl !== undefined) {
            existing.offerLetterUrl = offerLetterUrl || ''
            existing.offerLetterFilename = offerLetterFilename || ''
        } else if (effectiveStatus !== 'Offer') {
            // Clear offer letter if application is no longer in Offer status
            existing.offerLetterUrl = ''
            existing.offerLetterFilename = ''
        }

        await existing.save()

        console.log(
            `[admin] Status ${statusChanged ? 'updated' : 'processed'}: ${existing._id} ${oldStatus} → ${existing.status} (candidate: ${existing.user?.email})`
        )

        // Create status update notification
        if (statusChanged && existing.user?._id) {
            const { title, message } = buildNotification(existing.status, existing.companyName, existing.role)
            await Notification.create({
                userId: existing.user._id,
                applicationId: existing._id,
                type: 'status_update',
                title,
                message,
                company: existing.companyName,
                role: existing.role,
                status: existing.status,
            })
            console.log(`[admin] Notification created for user ${existing.user.email}: "${title}"`)
        }

        // Create offer letter notification
        if (offerLetterChanged && offerLetterUrl && existing.user?._id) {
            await Notification.create({
                userId: existing.user._id,
                applicationId: existing._id,
                type: 'document_update',
                title: 'Offer Letter Attached! 🎉',
                message: `An official offer letter has been attached to your application for ${existing.role} at ${existing.companyName}.`,
                company: existing.companyName,
                role: existing.role,
                status: existing.status,
            })
            console.log(`[admin] Offer letter notification created for user ${existing.user.email}`)
        }

        res.json({ success: true, message: 'Application updated successfully', application: existing })
    } catch (err) {
        console.error('[admin.updateStatus]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const totalApplications = await Application.countDocuments()
        const totalCandidates = await User.countDocuments({ role: { $ne: 'admin' } })

        const byStatus = await Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ])

        // Applications submitted in last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentApplications = await Application.countDocuments({ createdAt: { $gte: weekAgo } })

        // Upcoming interviews (next 14 days)
        const now = new Date()
        const twoWeeksOut = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        const upcomingInterviews = await Application.countDocuments({
            interviewDate: { $gte: now, $lte: twoWeeksOut },
        })

        res.json({
            success: true,
            stats: {
                totalApplications,
                totalCandidates,
                byStatus: byStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc }, {}),
                recentApplications,
                upcomingInterviews,
            },
        })
    } catch (err) {
        console.error('[admin.getStats]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── GET /api/admin/candidates ────────────────────────────────────────────────
const getCandidates = async (req, res) => {
    try {
        const candidates = await User.find({ role: { $ne: 'admin' } }, '-password').sort({ createdAt: -1 }).lean()

        // attach app count per candidate
        const ids = candidates.map(c => c._id)
        const counts = await Application.aggregate([
            { $match: { user: { $in: ids } } },
            { $group: { _id: '$user', count: { $sum: 1 } } },
        ])
        const countMap = counts.reduce((acc, c) => { acc[c._id.toString()] = c.count; return acc }, {})

        const result = candidates.map(c => ({
            ...c,
            applicationCount: countMap[c._id.toString()] || 0,
        }))

        res.json({ success: true, candidates: result })
    } catch (err) {
        console.error('[admin.getCandidates]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─── GET /api/admin/candidates/:id/applications ───────────────────────────────
const getCandidateApplications = async (req, res) => {
    try {
        const candidate = await User.findById(req.params.id, '-password').lean()
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' })
        }

        const applications = await Application.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .lean()

        res.json({ success: true, candidate, applications })
    } catch (err) {
        console.error('[admin.getCandidateApplications]', err)
        res.status(500).json({ success: false, message: err.message })
    }
}

module.exports = {
    getAllApplications,
    getApplicationById,
    updateStatus,
    getStats,
    getCandidates,
    getCandidateApplications,
}
