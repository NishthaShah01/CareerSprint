const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect } = require('../middleware/authMiddleware')
const { uploadFile } = require('../controllers/uploadController')

const router = express.Router()

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    },
})

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()

    // Resume uploads strict validation (PDF & DOCX only)
    if (req.query.type === 'resume') {
        if (ext === '.pdf' || ext === '.docx') {
            return cb(null, true)
        }
        return cb(new Error('Invalid format. Resumes must be PDF or DOCX files only.'))
    }

    // General document uploads
    const allowedExts = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg']
    if (allowedExts.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file format. Allowed formats: PDF, DOC, DOCX, PNG, JPG'))
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter,
})

router.post('/', protect, upload.single('file'), uploadFile)

module.exports = router
