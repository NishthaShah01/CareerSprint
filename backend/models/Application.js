const mongoose = require('mongoose')

const timelineStageSchema = new mongoose.Schema(
    {
        stage: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            default: null,
        },
        notes: {
            type: String,
            default: '',
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true, timestamps: true }
)

const applicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected'],
            default: 'Applied',
            index: true,
        },
        applicationDate: {
            type: Date,
            default: Date.now,
        },
        interviewDate: {
            type: Date,
            default: null,
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        jobType: {
            type: String,
            enum: ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid', 'Onsite', ''],
            default: '',
        },
        salary: {
            type: String,
            trim: true,
            default: '',
        },
        jobLink: {
            type: String,
            trim: true,
            default: '',
        },
        notes: {
            type: String,
            default: '',
        },
        notesLastEditedAt: {
            type: Date,
            default: Date.now,
        },
        resumeUrl: {
            type: String,
            default: '',
        },
        resumeFilename: {
            type: String,
            default: '',
        },
        offerLetterUrl: {
            type: String,
            default: '',
        },
        offerLetterFilename: {
            type: String,
            default: '',
        },
        checklist: {
            resumeSubmitted: { type: Boolean, default: false },
            aptitudePrep: { type: Boolean, default: false },
            dsaRevision: { type: Boolean, default: false },
            hrPrep: { type: Boolean, default: false },
            technicalPrep: { type: Boolean, default: false },
        },
        timeline: [timelineStageSchema],
    },
    { timestamps: true }
)

// Performance Compound Indexes for user-isolated queries
applicationSchema.index({ user: 1, createdAt: -1 })
applicationSchema.index({ user: 1, status: 1 })

module.exports = mongoose.model('Application', applicationSchema)
