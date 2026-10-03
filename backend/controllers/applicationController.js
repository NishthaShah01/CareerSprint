const mongoose = require('mongoose')
const Application = require('../models/Application')

const VALID_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected']
const VALID_JOB_TYPES = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid', 'Onsite', '']

// Helper — Validate ObjectId format
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// ─── POST /api/applications ────────────────────────────────────────────────────
const createApplication = async (req, res) => {
    try {
        const {
            companyName,
            role,
            status,
            applicationDate,
            interviewDate,
            location,
            jobType,
            salary,
            jobLink,
            notes,
            resumeUrl,
            resumeFilename,
            offerLetterUrl,
            offerLetterFilename,
            checklist,
            timeline,
        } = req.body

        // Validations
        if (!companyName?.trim()) {
            return res.status(400).json({ success: false, message: 'Company name is required' })
        }
        if (!role?.trim()) {
            return res.status(400).json({ success: false, message: 'Role is required' })
        }
        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' })
        }
        if (jobType && !VALID_JOB_TYPES.includes(jobType)) {
            return res.status(400).json({ success: false, message: 'Invalid job type value' })
        }

        // Future date validation
        if (applicationDate) {
            const dateObj = new Date(applicationDate)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (dateObj > today) {
                return res.status(400).json({ success: false, message: 'Applied date cannot be in the future' })
            }
        }

        // Default timeline stages if none provided
        const defaultTimeline = timeline || [
            { stage: 'Applied', date: applicationDate || Date.now(), completed: true, notes: 'Application submitted' },
            { stage: 'Under Review', completed: false, date: null, notes: '' },
            { stage: 'Shortlisted', completed: false, date: null, notes: '' },
            { stage: 'OA', completed: false, date: null, notes: '' },
            { stage: 'Interview', completed: false, date: null, notes: '' },
            { stage: 'Offer', completed: false, date: null, notes: '' },
        ]

        const application = await Application.create({
            user: req.user.id,
            companyName: companyName.trim(),
            role: role.trim(),
            status: status || 'Applied',
            applicationDate: applicationDate || Date.now(),
            interviewDate: interviewDate || null,
            location: location?.trim() || '',
            jobType: jobType || '',
            salary: salary?.trim() || '',
            jobLink: jobLink?.trim() || '',
            notes: notes?.trim() || '',
            notesLastEditedAt: Date.now(),
            resumeUrl: resumeUrl || '',
            resumeFilename: resumeFilename || '',
            offerLetterUrl: offerLetterUrl || '',
            offerLetterFilename: offerLetterFilename || '',
            checklist: checklist || {
                resumeSubmitted: Boolean(resumeUrl),
                aptitudePrep: false,
                dsaRevision: false,
                hrPrep: false,
                technicalPrep: false,
            },
            timeline: defaultTimeline,
        })

        res.status(201).json({ success: true, message: 'Application created successfully', application })
    } catch (err) {
        console.error('Create application error:', err.message)
        res.status(500).json({ success: false, message: err.message || 'Server error' })
    }
}

// ─── GET /api/applications ─────────────────────────────────────────────────────
const getApplications = async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .lean()
        res.json({ success: true, applications })
    } catch (err) {
        console.error('Get applications error:', err.message)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

// ─── GET /api/applications/:id ─────────────────────────────────────────────────
const getApplication = async (req, res) => {
    try {
        const { id } = req.params
        if (!isValidId(id)) {
            return res.status(404).json({ success: false, message: 'Invalid application ID format' })
        }

        const application = await Application.findOne({ _id: id, user: req.user.id }).lean()
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' })
        }
        res.json({ success: true, application })
    } catch (err) {
        console.error('Get application error:', err.message)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

// ─── PUT /api/applications/:id ─────────────────────────────────────────────────
const updateApplication = async (req, res) => {
    try {
        const { id } = req.params
        if (!isValidId(id)) {
            return res.status(404).json({ success: false, message: 'Invalid application ID format' })
        }

        const {
            companyName,
            role,
            status,
            applicationDate,
            interviewDate,
            location,
            jobType,
            salary,
            jobLink,
            notes,
            resumeUrl,
            resumeFilename,
            offerLetterUrl,
            offerLetterFilename,
            checklist,
            timeline,
        } = req.body

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' })
        }
        if (jobType !== undefined && jobType !== '' && !VALID_JOB_TYPES.includes(jobType)) {
            return res.status(400).json({ success: false, message: 'Invalid job type value' })
        }

        // Future date validation
        if (applicationDate) {
            const dateObj = new Date(applicationDate)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (dateObj > today) {
                return res.status(400).json({ success: false, message: 'Applied date cannot be in the future' })
            }
        }

        const updates = {}
        if (companyName !== undefined) updates.companyName = companyName.trim()
        if (role !== undefined) updates.role = role.trim()
        if (status !== undefined) updates.status = status
        if (applicationDate !== undefined) updates.applicationDate = applicationDate
        if (interviewDate !== undefined) updates.interviewDate = interviewDate
        if (location !== undefined) updates.location = location.trim()
        if (jobType !== undefined) updates.jobType = jobType
        if (salary !== undefined) updates.salary = salary.trim()
        if (jobLink !== undefined) updates.jobLink = jobLink.trim()

        if (notes !== undefined) {
            updates.notes = notes.trim()
            updates.notesLastEditedAt = Date.now()
        }

        if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl
        if (resumeFilename !== undefined) updates.resumeFilename = resumeFilename
        if (checklist !== undefined) updates.checklist = checklist
        if (timeline !== undefined) updates.timeline = timeline

        const application = await Application.findOneAndUpdate(
            { _id: id, user: req.user.id },
            updates,
            { new: true, runValidators: true }
        ).lean()

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' })
        }
        res.json({ success: true, message: 'Application updated', application })
    } catch (err) {
        console.error('Update application error:', err.message)
        res.status(500).json({ success: false, message: err.message || 'Server error' })
    }
}

// ─── DELETE /api/applications/:id ──────────────────────────────────────────────
const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params
        if (!isValidId(id)) {
            return res.status(404).json({ success: false, message: 'Invalid application ID format' })
        }

        const application = await Application.findOneAndDelete({
            _id: id,
            user: req.user.id,
        })
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' })
        }
        res.json({ success: true, message: 'Application deleted' })
    } catch (err) {
        console.error('Delete application error:', err.message)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

module.exports = { createApplication, getApplications, getApplication, updateApplication, deleteApplication }
