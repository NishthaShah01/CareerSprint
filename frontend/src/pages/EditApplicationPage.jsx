import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AppNavbar from '../components/AppNavbar'
import FileUpload from '../components/FileUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import LocationAutocomplete from '../components/LocationAutocomplete'
import { getApplication, updateApplication } from '../services/applicationService'

const STATUS_OPTIONS = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected']

export default function EditApplicationPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [form, setForm] = useState({
        companyName: '',
        role: '',
        status: 'Applied',
        applicationDate: '',
        interviewDate: '',
        location: '',
        jobType: '',
        salary: '',
        jobLink: '',
        notes: '',
        resumeUrl: '',
        resumeFilename: '',
    })
    const [loadingData, setLoadingData] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const { data } = await getApplication(id)
                const app = data.application
                setForm({
                    companyName: app.companyName || '',
                    role: app.role || '',
                    status: app.status || 'Applied',
                    applicationDate: app.applicationDate ? app.applicationDate.split('T')[0] : (app.dateApplied ? app.dateApplied.split('T')[0] : ''),
                    interviewDate: app.interviewDate ? app.interviewDate.split('T')[0] : '',
                    location: app.location || '',
                    jobType: app.jobType || '',
                    salary: app.salary || '',
                    jobLink: app.jobLink || '',
                    notes: app.notes || '',
                    resumeUrl: app.resumeUrl || '',
                    resumeFilename: app.resumeFilename || '',
                })
            } catch (err) {
                const msg = err.response?.status === 404 ? 'Application not found.' : 'Failed to load application.'
                toast.error(msg)
            } finally {
                setLoadingData(false)
            }
        }
        fetchApp()
    }, [id])

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
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

        setSaving(true)
        try {
            await updateApplication(id, {
                companyName: form.companyName.trim(),
                role: form.role.trim(),
                applicationDate: form.applicationDate || undefined,
                interviewDate: form.interviewDate || null,
                location: form.location.trim(),
                jobType: form.jobType,
                salary: form.salary.trim(),
                jobLink: form.jobLink.trim(),
                notes: form.notes.trim(),
                resumeUrl: form.resumeUrl,
                resumeFilename: form.resumeFilename,
            })
            toast.success('Application updated successfully!')
            navigate('/applications', { replace: true })
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update application.'
            toast.error(msg)
        } finally {
            setSaving(false)
        }
    }

    if (loadingData) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
                <AppNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner text="Loading application details..." size={28} />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            <AppNavbar />

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
                <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-6">
                    <ArrowLeft size={15} /> Back to Applications
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                        <Pencil size={22} className="text-[var(--primary)]" />
                        Edit Application
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Update your application details</p>
                </div>

                <div className="card p-6">
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="companyName">Company name *</label>
                                <input id="companyName" name="companyName" type="text" className="input-field" value={form.companyName} onChange={handleChange} disabled={saving} />
                            </div>
                            <div>
                                <label className="label" htmlFor="role">Role / Position *</label>
                                <input id="role" name="role" type="text" className="input-field" value={form.role} onChange={handleChange} disabled={saving} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="status">Status <span className="text-[var(--text-muted)] text-xs font-normal">(Managed by Admin)</span></label>
                                <input id="status" name="status" type="text" value={form.status} disabled className="input-field bg-[var(--card-hover)] opacity-80 cursor-not-allowed font-medium" />
                            </div>
                            <div>
                                <label className="label" htmlFor="applicationDate">Date applied</label>
                                <input id="applicationDate" name="applicationDate" type="date" className="input-field" value={form.applicationDate} onChange={handleChange} disabled={saving} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="interviewDate">Interview Date</label>
                                <input id="interviewDate" name="interviewDate" type="date" className="input-field" value={form.interviewDate} onChange={handleChange} disabled={saving} />
                            </div>
                            <div>
                                <label className="label" htmlFor="location">Location</label>
                                <LocationAutocomplete
                                    value={form.location}
                                    onChange={(loc) => setForm(prev => ({ ...prev, location: loc }))}
                                    disabled={saving}
                                    placeholder="e.g. Ahmedabad, Gujarat"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="jobType">Job Type</label>
                                <select id="jobType" name="jobType" className="input-field" value={form.jobType} onChange={handleChange} disabled={saving}>
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
                                <label className="label" htmlFor="salary">Salary</label>
                                <input id="salary" name="salary" type="text" placeholder="e.g. ₹50,000/month" className="input-field" value={form.salary} onChange={handleChange} disabled={saving} />
                            </div>
                        </div>

                        <div>
                            <label className="label" htmlFor="jobLink">Job Link</label>
                            <input id="jobLink" name="jobLink" type="url" className="input-field" value={form.jobLink} onChange={handleChange} disabled={saving} />
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

                        <div>
                            <label className="label" htmlFor="notes">Notes</label>
                            <textarea id="notes" name="notes" rows={3} className="input-field resize-none" value={form.notes} onChange={handleChange} disabled={saving} />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                                {saving ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                            <Link to="/applications" className="btn-secondary flex-1 text-center justify-center">Cancel</Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
