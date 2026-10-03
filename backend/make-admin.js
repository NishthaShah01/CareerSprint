/**
 * make-admin.js
 * 
 * One-time utility to promote a user to the admin role.
 * 
 * Usage:
 *   node make-admin.js user@example.com
 */

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

const email = process.argv[2]

if (!email) {
    console.error('Usage: node make-admin.js <email>')
    process.exit(1)
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
        console.error(`User not found: ${email}`)
        process.exit(1)
    }

    user.role = 'admin'
    await user.save()

    console.log(`✓ ${user.name} (${user.email}) is now an admin.`)
    process.exit(0)
}

run().catch(err => {
    console.error(err)
    process.exit(1)
})
