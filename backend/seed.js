require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const connectDB = require('./config/db')
const User = require('./models/User')
const Application = require('./models/Application')
const Notification = require('./models/Notification')

// Helper — Generate valid candidate-specific PDF buffer
const createCandidatePdfBuffer = (name, university, email, roleFocus) => {
    const streamContent = `BT
/F1 18 Tf
50 720 Td
(${name} - CANDIDATE RESUME) Tj
/F1 11 Tf
0 -25 Td
(Email: ${email}) Tj
0 -18 Td
(University: ${university}) Tj
0 -18 Td
(Primary Focus: ${roleFocus}) Tj
0 -30 Td
/F1 14 Tf
(CAREER OBJECTIVE) Tj
/F1 11 Tf
0 -20 Td
(Dedicated engineering student seeking internship opportunities in software engineering.) Tj
0 -15 Td
(Passionate about scalable systems, modern web development, and algorithmic problem solving.) Tj
0 -30 Td
/F1 14 Tf
(TECHNICAL SKILLS) Tj
/F1 11 Tf
0 -20 Td
(Languages: JavaScript, TypeScript, Python, C++, SQL, HTML/CSS) Tj
0 -15 Td
(Frameworks: React.js, Node.js, Express.js, Tailwind CSS) Tj
0 -15 Td
(Tools & Databases: MongoDB, Git, RESTful APIs, Postman) Tj
0 -30 Td
/F1 14 Tf
(EDUCATION) Tj
/F1 11 Tf
0 -20 Td
(Bachelor of Technology in Computer Science & Engineering) Tj
0 -15 Td
(${university} | CGPA: 8.9 / 10) Tj
ET`

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${Buffer.byteLength(streamContent)} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000414 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
485
%%EOF`
    return Buffer.from(pdfContent)
}

// Helper — Generate valid offer letter PDF buffer
const createOfferLetterPdfBuffer = (candidateName, companyName, role, salary) => {
    const streamContent = `BT
/F1 18 Tf
50 720 Td
(OFFICIAL INTERNSHIP OFFER LETTER) Tj
/F1 12 Tf
0 -30 Td
(Date: August 20, 2026) Tj
0 -20 Td
(Company: ${companyName}) Tj
0 -20 Td
(Dear ${candidateName},) Tj
0 -25 Td
(We are delighted to offer you the position of ${role} at ${companyName}.) Tj
0 -20 Td
(Stipend / Compensation: ${salary}) Tj
0 -20 Td
(Location: Hybrid / Onsite as specified in your application terms.) Tj
0 -30 Td
(Congratulations on passing all interview rounds and welcome to the team!) Tj
0 -35 Td
(Sincerely,) Tj
0 -20 Td
(${companyName} Recruitment Team) Tj
ET`

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${Buffer.byteLength(streamContent)} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000414 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
485
%%EOF`
    return Buffer.from(pdfContent)
}

const seedDatabase = async () => {
    try {
        console.log('=== CAREERSPRINT DATABASE CLEANUP & SEEDING ===\n')
        await connectDB()

        // 1. Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, 'uploads')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // 2. Define candidate data & write individual candidate PDFs
        const candidateDefs = [
            {
                name: 'Piya Sharma',
                email: 'piya.sharma.demo@example.com',
                university: 'LD College of Engineering',
                phone: '+91 9876501001',
                linkedin: 'https://www.linkedin.com/in/piyasharma',
                github: 'https://github.com/piyasharma',
                portfolio: 'https://piyasharma.dev',
                roleFocus: 'Software Engineering & Web Development',
                resumeFileName: 'Piya_Sharma_Resume.pdf'
            },
            {
                name: 'Aarav Patel',
                email: 'aarav.patel.demo@example.com',
                university: 'Nirma University',
                phone: '+91 9876501002',
                linkedin: 'https://www.linkedin.com/in/aaravpatel',
                github: 'https://github.com/aaravpatel',
                roleFocus: 'Full Stack & Software Systems',
                resumeFileName: 'Aarav_Patel_Resume.pdf'
            },
            {
                name: 'Ananya Mehta',
                email: 'ananya.mehta.demo@example.com',
                university: 'DA-IICT',
                phone: '+91 9876501003',
                linkedin: 'https://www.linkedin.com/in/ananyamehta',
                github: 'https://github.com/ananyamehta',
                roleFocus: 'Backend Engineering & Data Analytics',
                resumeFileName: 'Ananya_Mehta_Resume.pdf'
            },
            {
                name: 'Rohan Shah',
                email: 'rohan.shah.demo@example.com',
                university: 'IIT Gandhinagar',
                phone: '+91 9876501004',
                linkedin: 'https://www.linkedin.com/in/rohanshah',
                github: 'https://github.com/rohanshah',
                roleFocus: 'Cloud Infrastructure & Frontend Systems',
                resumeFileName: 'Rohan_Shah_Resume.pdf'
            },
            {
                name: 'Kavya Desai',
                email: 'kavya.desai.demo@example.com',
                university: 'Ahmedabad University',
                phone: '+91 9876501005',
                linkedin: 'https://www.linkedin.com/in/kavyadesai',
                github: 'https://github.com/kavyadesai',
                roleFocus: 'Software Engineering & Systems Architecture',
                resumeFileName: 'Kavya_Desai_Resume.pdf'
            },
            {
                name: 'Dhruv Joshi',
                email: 'dhruv.joshi.demo@example.com',
                university: 'Gujarat Technological University',
                phone: '+91 9876501006',
                linkedin: 'https://www.linkedin.com/in/dhruvjoshi',
                github: 'https://github.com/dhruvjoshi',
                roleFocus: 'Full Stack Web & React Development',
                resumeFileName: 'Dhruv_Joshi_Resume.pdf'
            }
        ]

        console.log('[1] Generating candidate-specific resume PDFs in /uploads/...')
        for (const candidate of candidateDefs) {
            const resumePath = path.join(uploadsDir, candidate.resumeFileName)
            const pdfBuf = createCandidatePdfBuffer(
                candidate.name,
                candidate.university,
                candidate.email,
                candidate.roleFocus
            )
            fs.writeFileSync(resumePath, pdfBuf)
            console.log(`  ✓ Generated Resume: ${candidate.resumeFileName}`)
        }

        // Generate Offer Letters for candidates with offers
        const aaravOfferPath = path.join(uploadsDir, 'Aarav_Patel_Microsoft_Offer_Letter.pdf')
        fs.writeFileSync(
            aaravOfferPath,
            createOfferLetterPdfBuffer('Aarav Patel', 'Microsoft', 'Software Engineering Intern', '₹70,000/month')
        )

        const kavyaOfferPath = path.join(uploadsDir, 'Kavya_Desai_Google_Offer_Letter.pdf')
        fs.writeFileSync(
            kavyaOfferPath,
            createOfferLetterPdfBuffer('Kavya Desai', 'Google', 'Software Engineering Intern', '₹70,000/month')
        )
        console.log('  ✓ Generated Offer Letters for Aarav Patel (Microsoft) & Kavya Desai (Google)')

        // 3. Clean candidate data, applications, notifications (Preserve admin user)
        console.log('\n[2] Cleaning old test data...')
        await Application.deleteMany({})
        await Notification.deleteMany({})
        await User.deleteMany({ role: { $ne: 'admin' } })

        let activeAdmin = await User.findOne({ role: 'admin' })
        if (!activeAdmin) {
            activeAdmin = new User({
                name: 'System Admin',
                email: 'admin@careersprint.com',
                password: 'Admin@CareerSprint2026!',
                role: 'admin',
                university: 'CareerSprint HQ'
            })
            await activeAdmin.save()
            console.log('✓ Created fresh Admin account: admin@careersprint.com / Admin@CareerSprint2026!')
        } else {
            activeAdmin.password = 'Admin@CareerSprint2026!'
            await activeAdmin.save()
            console.log('✓ Reset Admin account password: admin@careersprint.com / Admin@CareerSprint2026!')
        }

        // 4. Create Candidate Accounts
        console.log('\n[3] Seeding 6 Candidate Accounts...')
        const createdUsers = []
        for (const candidate of candidateDefs) {
            const { roleFocus, resumeFileName, ...candidateFields } = candidate
            const userDoc = new User({
                ...candidateFields,
                password: 'password123',
                role: 'candidate',
            })
            await userDoc.save()
            createdUsers.push(userDoc)
            console.log(`  ✓ Created Candidate: ${userDoc.name} (${userDoc.email})`)
        }

        const userMap = {}
        createdUsers.forEach(u => { userMap[u.email] = u })

        // 5. Create 11 Logically Consistent Applications with Unique Resumes
        console.log('\n[4] Seeding 11 Applications with Unique Candidate Resumes...')

        const applicationsData = [
            // Piya Sharma Apps
            {
                user: userMap['piya.sharma.demo@example.com']._id,
                companyName: 'Google',
                role: 'Software Engineering Intern',
                status: 'Interview',
                applicationDate: new Date('2026-08-05'),
                interviewDate: new Date('2026-10-25'),
                location: 'Bengaluru, Karnataka',
                jobType: 'Internship',
                salary: '₹75,000/month',
                jobLink: 'https://careers.google.com/jobs/results/swe-intern-bengaluru',
                notes: 'Preparing for system design and advanced DSA questions.',
                resumeUrl: '/uploads/Piya_Sharma_Resume.pdf',
                resumeFilename: 'Piya_Sharma_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-08-05'), completed: true, notes: 'Application submitted online' },
                    { stage: 'Under Review', date: new Date('2026-08-08'), completed: true, notes: 'Resume reviewed by HR team' },
                    { stage: 'Shortlisted', date: new Date('2026-08-12'), completed: true, notes: 'Shortlisted for online assessment' },
                    { stage: 'OA', date: new Date('2026-08-17'), completed: true, notes: 'Scored 100% on coding assessment' },
                    { stage: 'Interview', date: new Date('2026-10-25'), completed: true, notes: 'Interview round scheduled' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },
            {
                user: userMap['piya.sharma.demo@example.com']._id,
                companyName: 'Microsoft',
                role: 'Frontend Developer Intern',
                status: 'Shortlisted',
                applicationDate: new Date('2026-08-10'),
                location: 'Hyderabad, Telangana',
                jobType: 'Internship',
                salary: '₹65,000/month',
                jobLink: 'https://careers.microsoft.com/us/en/job/frontend-intern',
                notes: 'Reviewing React.js and browser performance optimization.',
                resumeUrl: '/uploads/Piya_Sharma_Resume.pdf',
                resumeFilename: 'Piya_Sharma_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-08-10'), completed: true, notes: 'Application submitted' },
                    { stage: 'Under Review', date: new Date('2026-08-15'), completed: true, notes: 'Profile selected by recruiter' },
                    { stage: 'Shortlisted', date: new Date('2026-08-20'), completed: true, notes: 'Shortlisted for OA' },
                    { stage: 'OA', date: null, completed: false, notes: '' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },

            // Aarav Patel Apps
            {
                user: userMap['aarav.patel.demo@example.com']._id,
                companyName: 'Microsoft',
                role: 'Software Engineering Intern',
                status: 'Offer',
                applicationDate: new Date('2026-08-01'),
                location: 'Hyderabad, Telangana',
                jobType: 'Full-time',
                salary: '₹70,000/month',
                jobLink: 'https://careers.microsoft.com/swe-intern',
                notes: 'Received official offer letter from HR!',
                resumeUrl: '/uploads/Aarav_Patel_Resume.pdf',
                resumeFilename: 'Aarav_Patel_Resume.pdf',
                offerLetterUrl: '/uploads/Aarav_Patel_Microsoft_Offer_Letter.pdf',
                offerLetterFilename: 'Microsoft_Offer_Letter.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-08-01'), completed: true, notes: 'Applied on portal' },
                    { stage: 'Under Review', date: new Date('2026-08-05'), completed: true, notes: 'Screening passed' },
                    { stage: 'Shortlisted', date: new Date('2026-08-10'), completed: true, notes: 'Shortlisted' },
                    { stage: 'OA', date: new Date('2026-08-15'), completed: true, notes: 'OA Cleared' },
                    { stage: 'Interview', date: new Date('2026-08-22'), completed: true, notes: 'Final Tech & HR interview cleared' },
                    { stage: 'Offer', date: new Date('2026-08-30'), completed: true, notes: 'Offer letter attached by Admin' },
                ]
            },
            {
                user: userMap['aarav.patel.demo@example.com']._id,
                companyName: 'Paytm',
                role: 'Backend Developer Intern',
                status: 'Under Review',
                applicationDate: new Date('2026-09-01'),
                location: 'GIFT City, Gandhinagar, Gujarat',
                jobType: 'Internship',
                salary: '₹45,000/month',
                jobLink: 'https://paytm.com/careers/backend-intern',
                notes: 'Application under recruiter review.',
                resumeUrl: '/uploads/Aarav_Patel_Resume.pdf',
                resumeFilename: 'Aarav_Patel_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-09-01'), completed: true, notes: 'Application submitted' },
                    { stage: 'Under Review', date: new Date('2026-09-05'), completed: true, notes: 'Application under initial screening' },
                    { stage: 'Shortlisted', date: null, completed: false, notes: '' },
                    { stage: 'OA', date: null, completed: false, notes: '' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },

            // Ananya Mehta Apps
            {
                user: userMap['ananya.mehta.demo@example.com']._id,
                companyName: 'Paytm',
                role: 'Backend Developer Intern',
                status: 'Rejected',
                applicationDate: new Date('2026-08-02'),
                location: 'Bengaluru, Karnataka',
                jobType: 'Internship',
                salary: '₹50,000/month',
                jobLink: 'https://paytm.com/careers/backend-intern',
                notes: 'Role closed.',
                resumeUrl: '/uploads/Ananya_Mehta_Resume.pdf',
                resumeFilename: 'Ananya_Mehta_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-08-02'), completed: true, notes: 'Application submitted' },
                    { stage: 'Under Review', date: new Date('2026-08-06'), completed: true, notes: 'Application reviewed' },
                    { stage: 'Rejected', date: new Date('2026-08-10'), completed: true, notes: 'Position filled' },
                ]
            },
            {
                user: userMap['ananya.mehta.demo@example.com']._id,
                companyName: 'Google',
                role: 'Data Analyst Intern',
                status: 'OA',
                applicationDate: new Date('2026-08-12'),
                location: 'Gurugram, Haryana',
                jobType: 'Remote',
                salary: '₹60,000/month',
                jobLink: 'https://careers.google.com/jobs/results/data-analyst-intern',
                notes: 'Preparing SQL and Python data structures.',
                resumeUrl: '/uploads/Ananya_Mehta_Resume.pdf',
                resumeFilename: 'Ananya_Mehta_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-08-12'), completed: true, notes: 'Applied online' },
                    { stage: 'Under Review', date: new Date('2026-08-16'), completed: true, notes: 'Resume selected' },
                    { stage: 'Shortlisted', date: new Date('2026-08-20'), completed: true, notes: 'Shortlisted for assessment' },
                    { stage: 'OA', date: new Date('2026-08-25'), completed: true, notes: 'Assessment link received' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },

            // Rohan Shah Apps
            {
                user: userMap['rohan.shah.demo@example.com']._id,
                companyName: 'Myntra',
                role: 'Frontend Developer Intern',
                status: 'Shortlisted',
                applicationDate: new Date('2026-08-15'),
                location: 'Bengaluru, Karnataka',
                jobType: 'Internship',
                salary: '₹55,000/month',
                jobLink: 'https://myntra.com/careers/frontend-intern',
                notes: 'Shortlisted for coding round.',
                resumeUrl: '/uploads/Rohan_Shah_Resume.pdf',
                resumeFilename: 'Rohan_Shah_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-08-15'), completed: true, notes: 'Applied on company portal' },
                    { stage: 'Under Review', date: new Date('2026-08-19'), completed: true, notes: 'Profile reviewed by hiring manager' },
                    { stage: 'Shortlisted', date: new Date('2026-08-24'), completed: true, notes: 'Shortlisted for tech round' },
                    { stage: 'OA', date: null, completed: false, notes: '' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },
            {
                user: userMap['rohan.shah.demo@example.com']._id,
                companyName: 'Google',
                role: 'Cloud Solutions Engineer',
                status: 'Applied',
                applicationDate: new Date('2026-09-10'),
                location: 'GIFT City, Gandhinagar, Gujarat',
                jobType: 'Full-time',
                salary: '₹80,000/month',
                jobLink: 'https://careers.google.com/cloud-solutions-eng',
                notes: 'Application submitted.',
                resumeUrl: '/uploads/Rohan_Shah_Resume.pdf',
                resumeFilename: 'Rohan_Shah_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-09-10'), completed: true, notes: 'Application submitted' },
                    { stage: 'Under Review', date: null, completed: false, notes: '' },
                    { stage: 'Shortlisted', date: null, completed: false, notes: '' },
                    { stage: 'OA', date: null, completed: false, notes: '' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },

            // Kavya Desai Apps
            {
                user: userMap['kavya.desai.demo@example.com']._id,
                companyName: 'Google',
                role: 'Software Engineering Intern',
                status: 'Offer',
                applicationDate: new Date('2026-07-20'),
                location: 'Ahmedabad, Gujarat',
                jobType: 'Hybrid',
                salary: '₹70,000/month',
                jobLink: 'https://careers.google.com/jobs/results/swe-intern-ahmedabad',
                notes: 'Offer letter received! Accepts internship offer.',
                resumeUrl: '/uploads/Kavya_Desai_Resume.pdf',
                resumeFilename: 'Kavya_Desai_Resume.pdf',
                offerLetterUrl: '/uploads/Kavya_Desai_Google_Offer_Letter.pdf',
                offerLetterFilename: 'Google_Offer_Letter.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-07-20'), completed: true, notes: 'Applied' },
                    { stage: 'Under Review', date: new Date('2026-07-25'), completed: true, notes: 'Under Review' },
                    { stage: 'Shortlisted', date: new Date('2026-07-30'), completed: true, notes: 'Shortlisted' },
                    { stage: 'OA', date: new Date('2026-08-05'), completed: true, notes: 'OA Passed' },
                    { stage: 'Interview', date: new Date('2026-08-12'), completed: true, notes: 'Interview Cleared' },
                    { stage: 'Offer', date: new Date('2026-08-20'), completed: true, notes: 'Official offer letter received' },
                ]
            },
            {
                user: userMap['kavya.desai.demo@example.com']._id,
                companyName: 'Microsoft',
                role: 'Systems Engineer Intern',
                status: 'Under Review',
                applicationDate: new Date('2026-09-02'),
                location: 'Pune, Maharashtra',
                jobType: 'Onsite',
                salary: '₹60,000/month',
                jobLink: 'https://careers.microsoft.com/systems-eng-intern',
                notes: 'Under review by engineering team.',
                resumeUrl: '/uploads/Kavya_Desai_Resume.pdf',
                resumeFilename: 'Kavya_Desai_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-09-02'), completed: true, notes: 'Applied' },
                    { stage: 'Under Review', date: new Date('2026-09-07'), completed: true, notes: 'Under Review' },
                    { stage: 'Shortlisted', date: null, completed: false, notes: '' },
                    { stage: 'OA', date: null, completed: false, notes: '' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            },

            // Dhruv Joshi Apps
            {
                user: userMap['dhruv.joshi.demo@example.com']._id,
                companyName: 'Paytm',
                role: 'Full Stack Developer Intern',
                status: 'Applied',
                applicationDate: new Date('2026-09-12'),
                location: 'Noida, Uttar Pradesh',
                jobType: 'Remote',
                salary: '₹40,000/month',
                jobLink: 'https://paytm.com/careers/fullstack-intern',
                notes: 'Submitted application on company portal.',
                resumeUrl: '/uploads/Dhruv_Joshi_Resume.pdf',
                resumeFilename: 'Dhruv_Joshi_Resume.pdf',
                timeline: [
                    { stage: 'Applied', date: new Date('2026-09-12'), completed: true, notes: 'Application submitted' },
                    { stage: 'Under Review', date: null, completed: false, notes: '' },
                    { stage: 'Shortlisted', date: null, completed: false, notes: '' },
                    { stage: 'OA', date: null, completed: false, notes: '' },
                    { stage: 'Interview', date: null, completed: false, notes: '' },
                    { stage: 'Offer', date: null, completed: false, notes: '' },
                ]
            }
        ]

        for (const appData of applicationsData) {
            const appDoc = await Application.create(appData)
            console.log(`  ✓ Created Application: ${appDoc.companyName} - ${appDoc.role} (${appDoc.status}) -> Resume: ${appDoc.resumeFilename}`)

            // Create notification for candidate
            await Notification.create({
                userId: appDoc.user,
                applicationId: appDoc._id,
                type: 'status_update',
                title: appDoc.status === 'Offer' ? 'Offer Received! 🎉' : `Status Updated: ${appDoc.status}`,
                message: `Your application for ${appDoc.role} at ${appDoc.companyName} is currently ${appDoc.status}.`,
                company: appDoc.companyName,
                role: appDoc.role,
                status: appDoc.status,
            })
        }

        console.log('\n=== SEEDING COMPLETED SUCCESSFULLY! ===')
        console.log(`- Candidates Created: ${createdUsers.length}`)
        console.log(`- Applications Created: ${applicationsData.length}`)
        console.log(`- Resumes Created: 6 Unique Candidate Resumes`)
        console.log(`- Admin Account Preserved: ${activeAdmin.email}`)

        process.exit(0)
    } catch (err) {
        console.error('Seeding error:', err)
        process.exit(1)
    }
}

seedDatabase()
