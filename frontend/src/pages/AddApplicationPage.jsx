import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AppNavbar from '../components/AppNavbar'
import FileUpload from '../components/FileUpload'
import LocationAutocomplete from '../components/LocationAutocomplete'
import { createApplication } from '../services/applicationService'

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected']

export default function AddApplicationPage() {
    const navigate = useNavigate()
    const today = new Date().toISOString().split('T')[0]

    const [form, setForm] = useState({
        companyName: '',
        role: '',
        status: 'Applied',
        applicationDate: today,
        interviewDate: '',
        location: '',
        jobType: '',
        salary: '',
        jobLink: '',
        notes: '',
        resumeUrl: '',
        resumeFilename: '',
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleLocationChange = (loc) => {
        setForm((prev) => ({ ...prev, location: loc }))
    }

    const handleResumeChange = (val) => {
        const url = typeof val === 'object' && val !== null ? val.url : val
        const filename = typeof val === 'object' && val !== null ? val.filename : ''
        setForm(prev => ({ ...prev, resumeUrl: url || '', resumeFilename: filename || '' }))
    }

    const validate = () => {
        if (!form.companyName.trim()) return 'Company name is required.'
        if (!form.role.trim()) return 'Role is required.'
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationError = validate()
        if (validationError) {
            toast.error(validationError)
            return
        }

        setLoading(true)
        try {
            await createApplication({
                companyName: form.companyName.trim(),
                role: form.role.trim(),
                status: 'Applied',
                applicationDate: form.applicationDate || undefined,
                interviewDate: form.interviewDate || undefined,
                location: form.location.trim(),
                jobType: form.jobType,
                salary: form.salary.trim(),
                jobLink: form.jobLink.trim(),
                notes: form.notes.trim(),
                resumeUrl: form.resumeUrl,
                resumeFilename: form.resumeFilename,
            })
            toast.success('Application saved successfully!')
            navigate('/applications', { replace: true })
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save application. Please try again.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            <AppNavbar />

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
                <Link
                    to="/applications"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-6"
                >
                    <ArrowLeft size={15} /> Back to Applications
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                        <PlusCircle size={22} className="text-[var(--primary)]" />
                        Add Application
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Track a new job or internship application</p>
                </div>

                <div className="card p-6">
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        {/* Row 1: Company + Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="companyName">Company name *</label>
                                <input id="companyName" name="companyName" type="text" placeholder="e.g. Google India" className="input-field" value={form.companyName} onChange={handleChange} disabled={loading} />
                            </div>
                            <div>
                                <label className="label" htmlFor="role">Role / Position *</label>
                                <input id="role" name="role" type="text" placeholder="e.g. Software Engineering Intern" className="input-field" value={form.role} onChange={handleChange} disabled={loading} />
                            </div>
                        </div>

                        {/* Row 2: Status + Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="status">Status <span className="text-[var(--text-muted)] text-xs font-normal">(Managed by Admin)</span></label>
                                <input id="status" name="status" type="text" value="Applied" disabled className="input-field bg-[var(--card-hover)] cursor-not-allowed opacity-80" />
                            </div>
                            <div>
                                <label className="label" htmlFor="applicationDate">Date applied</label>
                                <input id="applicationDate" name="applicationDate" type="date" className="input-field" value={form.applicationDate} onChange={handleChange} disabled={loading} />
                            </div>
                        </div>

                        {/* Row 3: Interview Date + Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="interviewDate">Interview Date <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <input id="interviewDate" name="interviewDate" type="date" className="input-field" value={form.interviewDate} onChange={handleChange} disabled={loading} />
                            </div>
                            <div>
                                <label className="label" htmlFor="location">Location <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <LocationAutocomplete
                                    value={form.location}
                                    onChange={handleLocationChange}
                                    disabled={loading}
                                    placeholder="e.g. Ahmedabad, Gujarat"
                                />
                            </div>
                        </div>

                        {/* Row 4: Job Type + Salary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="jobType">Job Type <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <select id="jobType" name="jobType" className="input-field" value={form.jobType} onChange={handleChange} disabled={loading}>
                                    <option value="">Select type</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Onsite">Onsite</option>
                                </select>
                            </div>
                            <div>
                                <label className="label" htmlFor="salary">Salary <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <input id="salary" name="salary" type="text" placeholder="e.g. ₹50,000/month" className="input-field" value={form.salary} onChange={handleChange} disabled={loading} />
                            </div>
                        </div>

                        {/* Job Link */}
                        <div>
                            <label className="label" htmlFor="jobLink">Job Link <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                            <input id="jobLink" name="jobLink" type="url" placeholder="https://..." className="input-field" value={form.jobLink} onChange={handleChange} disabled={loading} />
                        </div>

                        {/* Document Upload (Resume PDF) */}
                        <div className="pt-2 border-t border-[var(--border)]">
                            <FileUpload
                                label="Resume PDF"
                                value={form.resumeUrl}
                                filename={form.resumeFilename}
                                onChange={handleResumeChange}
                                isResume={true}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="label" htmlFor="notes">Notes <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                            <textarea id="notes" name="notes" rows={3} placeholder="Any notes about this application..." className="input-field resize-none" value={form.notes} onChange={handleChange} disabled={loading} />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> Saving...
                                    </span>
                                ) : 'Save Application'}
                            </button>
                            <Link to="/applications" className="btn-secondary flex-1 text-center justify-center">Cancel</Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
