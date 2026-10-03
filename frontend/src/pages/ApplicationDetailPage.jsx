import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, MapPin, Briefcase, DollarSign, ExternalLink, FileText, Award, CheckSquare, Download, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import AppNavbar from '../components/AppNavbar'
import StatusBadge from '../components/StatusBadge'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'
import FileUpload from '../components/FileUpload'
import InterviewTimeline from '../components/InterviewTimeline'
import ApplicationNotes from '../components/ApplicationNotes'
import { getApplication, updateApplication, deleteApplication } from '../services/applicationService'
import { getFileUrl } from '../utils/fileUtils'

const CHECKLIST_ITEMS = [
    { key: 'resumeSubmitted', label: 'Resume Submitted' },
    { key: 'aptitudePrep', label: 'Aptitude Preparation' },
    { key: 'dsaRevision', label: 'DSA Revision' },
    { key: 'hrPrep', label: 'HR Preparation' },
    { key: 'technicalPrep', label: 'Technical Preparation' },
]

export default function ApplicationDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [application, setApplication] = useState(null)
    const [loading, setLoading] = useState(true)

    // Delete modal
    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchApp = async () => {
        setLoading(true)
        try {
            const { data } = await getApplication(id)
            setApplication(data.application)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load application details.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApp()
    }, [id])

    // Calculate Checklist Completion % & count
    const checklistStats = useMemo(() => {
        if (!application?.checklist) return { completed: 0, total: CHECKLIST_ITEMS.length, percentage: 0 }
        const completedCount = CHECKLIST_ITEMS.filter(item => Boolean(application.checklist[item.key])).length
        const total = CHECKLIST_ITEMS.length
        const percentage = Math.round((completedCount / total) * 100)
        return { completed: completedCount, total, percentage }
    }, [application])

    const handleChecklistToggle = async (key) => {
        if (!application) return
        const currentChecklist = application.checklist || {}
        const updatedChecklist = {
            ...currentChecklist,
            [key]: !currentChecklist[key],
        }

        // Optimistic update
        setApplication(prev => ({ ...prev, checklist: updatedChecklist }))

        try {
            await updateApplication(id, { checklist: updatedChecklist })
            toast.success('Application updated')
        } catch (err) {
            toast.error('Failed to update checklist.')
            fetchApp()
        }
    }

    const handleSaveTimeline = async (updatedTimeline) => {
        if (!application) return
        setApplication(prev => ({ ...prev, timeline: updatedTimeline }))
        try {
            await updateApplication(id, { timeline: updatedTimeline })
        } catch (err) {
            toast.error('Failed to save timeline.')
        }
    }

    const handleSaveNotes = async (newNotes) => {
        if (!application) return
        try {
            const { data } = await updateApplication(id, { notes: newNotes })
            if (data.application) {
                setApplication(prev => ({
                    ...prev,
                    notes: data.application.notes,
                    notesLastEditedAt: data.application.notesLastEditedAt,
                }))
            }
        } catch (err) {
            toast.error('Failed to save notes.')
            throw err
        }
    }

    const handleResumeChange = async ({ url, filename }) => {
        if (!application) return
        setApplication(prev => ({ ...prev, resumeUrl: url, resumeFilename: filename }))
        try {
            await updateApplication(id, { resumeUrl: url, resumeFilename: filename })
            if (!url) {
                toast.success('Resume deleted')
            }
        } catch (err) {
            toast.error('Failed to update resume.')
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleting(true)
        try {
            await deleteApplication(deleteId)
            toast.success('Application deleted successfully!')
            navigate('/applications', { replace: true })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete application.')
        } finally {
            setDeleting(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return null
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
                <AppNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner text="Loading application details..." size={28} />
                </div>
            </div>
        )
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
                <AppNavbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">Application Not Found</h2>
                    <p className="text-sm text-[var(--text-muted)] mb-4">The application you are looking for does not exist or was removed.</p>
                    <Link to="/applications" className="btn-primary">Back to Applications</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            <AppNavbar />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
                {/* Back button */}
                <Link
                    to="/applications"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                    <ArrowLeft size={15} /> Back to Applications
                </Link>

                {/* Header Card */}
                <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-[var(--text)]">{application.companyName}</h1>
                            <StatusBadge status={application.status} />
                        </div>
                        <p className="text-base font-medium text-[var(--text-muted)] mt-1">{application.role}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Link to={`/applications/${id}/edit`} className="btn-secondary gap-1.5 py-2 text-xs">
                            <Pencil size={14} /> Edit Application
                        </Link>
                        <button
                            onClick={() => setDeleteId(id)}
                            className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-3 py-2 rounded-lg text-xs font-medium hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Details & Notes Column (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Specs Card */}
                        <div className="card p-6 space-y-4">
                            <h3 className="text-base font-semibold text-[var(--text)] pb-2 border-b border-[var(--border)]">
                                Overview & Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-[var(--text-muted)] block mb-1">Applied Date</span>
                                    <span className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                                        <Calendar size={15} className="text-[var(--primary)] shrink-0" />
                                        {formatDate(application.applicationDate || application.createdAt)}
                                    </span>
                                </div>

                                {application.interviewDate && (
                                    <div>
                                        <span className="text-xs text-[var(--text-muted)] block mb-1">Interview Date</span>
                                        <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                                            <Calendar size={15} className="shrink-0" />
                                            {formatDate(application.interviewDate)}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <span className="text-xs text-[var(--text-muted)] block mb-1">Location</span>
                                    <span className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                                        <MapPin size={15} className="text-[var(--text-muted)] shrink-0" />
                                        {application.location || 'Not specified'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[var(--text-muted)] block mb-1">Job Type</span>
                                    <span className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                                        <Briefcase size={15} className="text-[var(--text-muted)] shrink-0" />
                                        {application.jobType || 'Not specified'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[var(--text-muted)] block mb-1">Salary / Stipend</span>
                                    <span className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                                        <DollarSign size={15} className="text-emerald-500 shrink-0" />
                                        {application.salary || 'Not specified'}
                                    </span>
                                </div>

                                {application.jobLink && (
                                    <div>
                                        <span className="text-xs text-[var(--text-muted)] block mb-1">Job Posting</span>
                                        <a
                                            href={application.jobLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[var(--primary)] font-medium hover:underline"
                                        >
                                            View Job Link <ExternalLink size={13} />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Documents Upload & View Section */}
                            <div className="pt-4 border-t border-[var(--border)] space-y-4">
                                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Attached Documents</h4>
                                <div className="space-y-4">
                                    <FileUpload
                                        label="Resume"
                                        value={application.resumeUrl}
                                        filename={application.resumeFilename}
                                        onChange={handleResumeChange}
                                        isResume={true}
                                    />

                                    {/* Offer Letter Section — Rendered only when application status is Offer */}
                                    {application.status === 'Offer' && (
                                        application.offerLetterUrl ? (
                                            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Award size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span className="text-xs sm:text-sm font-semibold text-[var(--text)] truncate">
                                                            Offer Letter: {application.offerLetterFilename || 'Official Offer Letter.pdf'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    <a
                                                        href={getFileUrl(application.offerLetterUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                                                    >
                                                        <ExternalLink size={13} /> View Offer Letter
                                                    </a>
                                                    <a
                                                        href={getFileUrl(application.offerLetterUrl)}
                                                        download={application.offerLetterFilename || `${application.companyName}_OfferLetter.pdf`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                                                    >
                                                        <Download size={13} /> Download Offer Letter
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                                                <Award size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-sm mb-0.5">Offer Confirmed! 🎉</p>
                                                    <p>Your official offer letter will be available here once uploaded by the administrator.</p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Rich Notes Section */}
                        <ApplicationNotes
                            notes={application.notes}
                            notesLastEditedAt={application.notesLastEditedAt}
                            onSaveNotes={handleSaveNotes}
                        />

                        {/* Interview Timeline Section */}
                        <InterviewTimeline
                            timeline={application.timeline}
                            onSaveTimeline={handleSaveTimeline}
                        />
                    </div>

                    {/* Preparation Checklist Sidebar Column (1 col) */}
                    <div className="space-y-6">
                        <div className="card p-5 space-y-4 sticky top-20">
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                                <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                                    <CheckSquare size={18} className="text-[var(--primary)]" />
                                    Preparation Checklist
                                </h3>
                                <span className="text-xs font-bold text-[var(--primary)] bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-full">
                                    {checklistStats.percentage}%
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-[var(--card-hover)] rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-[var(--primary)] h-2.5 transition-all duration-500 rounded-full"
                                    style={{ width: `${checklistStats.percentage}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <span className="font-medium text-[var(--text)]">
                                    {checklistStats.completed} / {checklistStats.total} completed
                                </span>
                                <span>{checklistStats.percentage}%</span>
                            </div>

                            {/* Checkbox items */}
                            <div className="space-y-2.5 pt-2">
                                {CHECKLIST_ITEMS.map(({ key, label }) => {
                                    const isChecked = Boolean(application.checklist?.[key])
                                    return (
                                        <label
                                            key={key}
                                            className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                                                isChecked
                                                    ? 'bg-primary-50/50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-[var(--text)] font-medium'
                                                    : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleChecklistToggle(key)}
                                                className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                            />
                                            <span className={isChecked ? 'line-through opacity-90' : ''}>{label}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={!!deleteId}
                title="Delete Application?"
                message="This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    )
}
