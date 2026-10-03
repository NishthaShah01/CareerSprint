const fs = require('fs')
const path = require('path')
const cloudinary = require('cloudinary').v2

// Configure Cloudinary if credentials are present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
} else if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL })
}

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' })
        }

        const isCloudinaryConfigured = Boolean(
            (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) || process.env.CLOUDINARY_URL
        )

        if (isCloudinaryConfigured) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'careersprint_docs',
                resource_type: 'auto',
            })
            // Remove temp local file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path)
            }
            return res.json({
                success: true,
                message: 'File uploaded to Cloudinary successfully',
                url: result.secure_url,
                filename: req.file.originalname,
            })
        } else {
            // Serve from local uploads directory
            const protocol = req.protocol
            const host = req.get('host')
            const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`

            return res.json({
                success: true,
                message: 'File uploaded locally successfully',
                url: fileUrl,
                filename: req.file.originalname,
            })
        }
    } catch (err) {
        console.error('Upload controller error:', err)
        res.status(500).json({ success: false, message: err.message || 'File upload failed' })
    }
}

module.exports = { uploadFile }
