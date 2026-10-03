const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Helper — generate a signed JWT
const generateToken = (userId, role) =>
    jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Helper — safe user object (no password)
const safeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'candidate',
    university: user.university || '',
    phone: user.phone || '',
    linkedin: user.linkedin || '',
    github: user.github || '',
    portfolio: user.portfolio || '',
    avatarUrl: user.avatarUrl || '',
})

// ─── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' })
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' })
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
        }

        const normalizedEmail = email.toLowerCase().trim()
        const existing = await User.findOne({ email: normalizedEmail })
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' })
        }

        // User.create triggers pre('save') hook in User model to hash password
        const user = await User.create({ name: name.trim(), email: normalizedEmail, password })
        console.log(`[register] User registered successfully: ${normalizedEmail}`)
        const token = generateToken(user._id, user.role || 'candidate')

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: safeUser(user),
        })
    } catch (err) {
        console.error('[register] Auth Error:', err)
        res.status(500).json({ success: false, message: `Registration error: ${err.message}` })
    }
}

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' })
        }

        const normalizedEmail = email.toLowerCase().trim()
        console.log(`[login] Attempting login for: ${normalizedEmail}`)

        // Explicitly select password field (excluded by default in schema)
        const user = await User.findOne({ email: normalizedEmail }).select('+password')
        if (!user) {
            console.log(`[login] ✗ User not found: ${normalizedEmail}`)
            return res.status(401).json({ success: false, message: 'No account found with this email address' })
        }

        // Compare entered password with stored hashed password using bcrypt
        const isMatch = await user.matchPassword(password)
        if (!isMatch) {
            console.log(`[login] ✗ Password mismatch for: ${normalizedEmail}`)
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' })
        }

        const token = generateToken(user._id, user.role || 'candidate')
        console.log(`[login] ✓ Login successful: ${normalizedEmail}`)

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: safeUser(user),
        })
    } catch (err) {
        console.error('[login] Auth Error:', err)
        res.status(500).json({ success: false, message: `Authentication error: ${err.message}` })
    }
}

// ─── GET /api/auth/me (protected) ────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user: safeUser(user) })
    } catch (err) {
        console.error('[getMe] Auth Error:', err)
        res.status(500).json({ success: false, message: `Server error: ${err.message}` })
    }
}

// ─── PUT /api/auth/profile (protected) ─────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name, fullName, university, phone, linkedin, github, portfolio, avatarUrl } = req.body

        const updateData = {}
        const newName = name || fullName
        if (newName !== undefined) updateData.name = newName.trim()
        if (university !== undefined) updateData.university = university.trim()
        if (phone !== undefined) updateData.phone = phone.trim()
        if (linkedin !== undefined) updateData.linkedin = linkedin.trim()
        if (github !== undefined) updateData.github = github.trim()
        if (portfolio !== undefined) updateData.portfolio = portfolio.trim()
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim()

        const user = await User.findByIdAndUpdate(req.user.id, updateData, {
            new: true,
            runValidators: true,
        })

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: safeUser(user),
        })
    } catch (err) {
        console.error('[updateProfile] Auth Error:', err)
        res.status(500).json({ success: false, message: `Profile update error: ${err.message}` })
    }
}

// ─── PUT /api/auth/change-password (protected) ────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New password and confirmation do not match' })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' })
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'New password cannot be the same as your current password' })
        }

        const user = await User.findById(req.user.id).select('+password')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const isMatch = await user.matchPassword(currentPassword)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' })
        }

        // Setting user.password and saving triggers User pre('save') bcrypt hashing
        user.password = newPassword
        await user.save()

        console.log(`[changePassword] ✓ Password changed successfully for user: ${user.email}`)

        res.json({
            success: true,
            message: 'Password changed successfully',
        })
    } catch (err) {
        console.error('[changePassword] Error:', err)
        res.status(500).json({ success: false, message: `Failed to change password: ${err.message}` })
    }
}

module.exports = { register, login, getMe, updateProfile, changePassword }
