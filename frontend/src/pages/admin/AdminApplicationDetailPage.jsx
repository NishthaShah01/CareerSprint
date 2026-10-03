import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Briefcase, MapPin, Clock, Calendar, DollarSign,
    FileText, ExternalLink, User, Mail, Phone, GraduationCap, Check, Loader2,
    AlertCircle, Download, Award, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminNavbar from '../../components/AdminNavbar'
import FileUpload from '../../components/FileUpload'
import { getAdminApplicationById, updateApplicationStatus } from '../../services/adminService'
import { getFileUrl } from '../../utils/fileUtils'

const ALL_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected']

const STATUS_BG = {
    Applied: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'Under Review': 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    Shortlisted: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    OA: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    Interview: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    Offer: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    Rejected: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
}

function DetailRow({ icon: Icon, label, value }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 min-w-0">
            <Icon size={16} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text)] mt-0.5 truncate">{value}</p>
            </div>
        </div>
    )
}

export default function AdminApplicationDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [app, setApp] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newStatus, setNewStatus] = useState('')
    const [interviewDate, setInterviewDate] = useState('')
    const [offerLetterUrl, setOfferLetterUrl] = useState('')
    const [offerLetterFilename, setOfferLetterFilename] = useState('')
    const [updating, setUpdating] = useState(false)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getAdminApplicationById(id)
                const application = data.application
                setApp(application)
                setNewStatus(application.status)
                setInterviewDate(application.interviewDate ? new Date(application.interviewDate).toISOString().split('T')[0] : '')
                setOfferLetterUrl(application.offerLetterUrl || '')
                setOfferLetterFilename(application.offerLetterFilename || '')
            } catch (err) {
                if (err.response?.status === 404) setNotFound(true)
                else toast.error(err.response?.data?.message || 'Failed to load application.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleStatusUpdate = async () => {
        setUpdating(true)
        try {
            const payload = {
                status: newStatus,
                interviewDate: interviewDate || null,
                offerLetterUrl,
                offerLetterFilename,
            }
            const { data } = await updateApplicationStatus(id, payload)
            setApp(data.application)
            toast.success(`Application updated successfully!`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update application.')
        } finally {
            setUpdating(false)
        }
    }

    const downloadDocument = async (url, defaultFilename) => {
        if (!url) return
        const formattedUrl = getFileUrl(url)
        try {
            const toastId = toast.loading('Starting download...')
            const response = await fetch(formattedUrl)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            const name = defaultFilename || formattedUrl.split('/').pop() || 'document.pdf'
            link.download = name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
            toast.dismiss(toastId)
            toast.success('Download started')
        } catch (err) {
            console.error('Download error:', err)
            const link = document.createElement('a')
            link.href = formattedUrl
            link.target = '_blank'
            link.download = defaultFilename || 'document.pdf'
            link.click()
        }
    }

    const statusChanged = newStatus !== app?.status

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg)] transition-colors">
                <AdminNavbar />
                <div className="flex justify-center py-32">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    if (notFound || !app) {
        return (
            <div className="min-h-screen bg-[var(--bg)] transition-colors">
                <AdminNavbar />
                <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                    <AlertCircle size={40} className="mx-auto mb-4 text-rose-500 opacity-70" />
                    <h2 className="text-xl font-semibold text-[var(--text)]">Application Not Found</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-2">This application may have been deleted.</p>
                    <button onClick={() => navigate(-1)} className="btn-primary mt-6 min-h-[44px]">
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        )
    }

    const candidate = app.user || {}

    return (
        <div className="min-h-screen w-full min-w-0 bg-[var(--bg)] transition-colors overflow-x-hidden">
            <AdminNavbar />

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-6 min-h-[44px] px-1"
                >
                    <ArrowLeft size={16} /> Back to Applications
                </button>

                {/* 2-Column Responsive Grid (Mobile: Stack, Desktop: 2:1) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Application Content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Application Header Card */}
                        <div className="card p-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] tracking-tight">{app.companyName}</h1>
                                    <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium mt-1">{app.role}</p>
                                </div>
                                <span className={`self-start text-xs sm:text-sm px-3 py-1 rounded-full font-semibold flex-shrink-0 ${STATUS_BG[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {app.status}
                                </span>
                            </div>

                            {/* Key Application Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[var(--border)]">
                                <DetailRow icon={Calendar} label="Applied Date" value={app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : null} />
                                <DetailRow icon={Clock} label="Interview Date" value={app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : null} />
                                <DetailRow icon={MapPin} label="Location" value={app.location || null} />
                                <DetailRow icon={Briefcase} label="Job Type" value={app.jobType || null} />
                                <DetailRow icon={DollarSign} label="Salary" value={app.salary || null} />
                            </div>

                            {app.jobLink && (
                                <div className="mt-5 pt-3 border-t border-[var(--border)]">
                                    <a
                                        href={app.jobLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[var(--primary)] hover:underline font-medium min-h-[44px]"
                                    >
                                        <ExternalLink size={14} /> View Original Job Posting
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        {app.notes && (
                            <div className="card p-5">
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                                    <FileText size={16} className="text-[var(--primary)]" />
                                    Notes
                                </h3>
                                <p className="text-xs sm:text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                                    {app.notes}
                                </p>
                                {app.notesLastEditedAt && (
                                    <p className="text-xs text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">
                                        Last edited {new Date(app.notesLastEditedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Documents (Resume & Offer Letter) */}
                        <div className="card p-5">
                            <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-[var(--primary)]" />
                                Attached Documents
                            </h3>
                            <div className="space-y-4">
                                {/* Resume Box */}
                                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText size={18} className="text-[var(--primary)] shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold text-[var(--text)] truncate">
                                                Resume: {app.resumeFilename || (app.resumeUrl ? 'Uploaded Resume' : 'No Resume attached')}
                                            </span>
                                        </div>
                                    </div>
                                    {app.resumeUrl ? (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <a
                                                href={getFileUrl(app.resumeUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 min-h-[40px]"
                                            >
                                                <ExternalLink size={13} /> View Resume
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => downloadDocument(app.resumeUrl, app.resumeFilename || `${app.companyName}_Resume.pdf`)}
                                                className="btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 min-h-[40px]"
                                            >
                                                <Download size={13} /> Download Resume
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[var(--text-muted)] italic">No resume uploaded for this application.</p>
                                    )}
                                </div>

                                {/* Offer Letter Box — Only displayed when available */}
                                {app.offerLetterUrl && (
                                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <FileText size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span className="text-xs sm:text-sm font-semibold text-[var(--text)] truncate">
                                                    Offer Letter: {app.offerLetterFilename || 'Uploaded Offer Letter'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <a
                                                href={getFileUrl(app.offerLetterUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 min-h-[40px]"
                                            >
                                                <ExternalLink size={13} /> View Offer Letter
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => downloadDocument(app.offerLetterUrl, app.offerLetterFilename || `${app.companyName}_OfferLetter.pdf`)}
                                                className="btn-secondary px-3 py-2 text-xs inline-flex items-center gap-1.5 min-h-[40px]"
                                            >
                                                <Download size={13} /> Download Offer Letter
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interview Timeline */}
                        {app.timeline?.length > 0 && (
                            <div className="card p-5">
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                                    <Clock size={16} className="text-[var(--primary)]" />
                                    Interview Timeline
                                </h3>
                                <ol className="space-y-4">
                                    {app.timeline.map((stage, i) => (
                                        <li key={stage._id || i} className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${stage.completed ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--border)]'}`}>
                                                {stage.completed && <Check size={11} className="text-white" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-xs sm:text-sm font-semibold ${stage.completed ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                                                    {stage.stage}
                                                </p>
                                                {stage.date && (
                                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                        {new Date(stage.date).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {stage.notes && (
                                                    <p className="text-xs text-[var(--text-muted)] mt-1">{stage.notes}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Status Control (Mobile: Stacks below main content) */}
                    <div className="space-y-5">
                        {/* Status & Schedule Update Control Panel */}
                        <div className="card p-5 border-2 border-primary-500/20 shadow-md space-y-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mb-1 flex items-center gap-2">
                                    <Briefcase size={16} className="text-[var(--primary)]" />
                                    Admin Application Control
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                    Manage candidate recruitment status, interview schedule, and offer letters.
                                </p>
                            </div>

                            {/* Status Selector */}
                            <div>
                                <label htmlFor="admin-status-select" className="label text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
                                    Application Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value)}
                                    className="input-field text-sm w-full min-h-[44px]"
                                    id="admin-status-select"
                                >
                                    {ALL_STATUSES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Interview Date Picker */}
                            <div>
                                <label htmlFor="admin-interview-date" className="label text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Calendar size={13} className="text-amber-500" /> Interview Date
                                </label>
                                <input
                                    type="date"
                                    id="admin-interview-date"
                                    value={interviewDate}
                                    onChange={e => setInterviewDate(e.target.value)}
                                    className="input-field text-sm w-full min-h-[44px]"
                                />
                            </div>

                            {/* Offer Letter Upload for Admin — Only available when status is Offer */}
                            <div className="pt-2 border-t border-[var(--border)] space-y-2">
                                {newStatus === 'Offer' ? (
                                    <FileUpload
                                        label="Upload Candidate Offer Letter"
                                        value={offerLetterUrl}
                                        filename={offerLetterFilename}
                                        onChange={(val) => {
                                            const url = typeof val === 'object' && val !== null ? val.url : val
                                            const filename = typeof val === 'object' && val !== null ? val.filename : ''
                                            setOfferLetterUrl(url || '')
                                            setOfferLetterFilename(filename || '')
                                        }}
                                    />
                                ) : (
                                    <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                        <Lock size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                        <span>
                                            <strong>Offer Letter Upload Locked:</strong> Offer letters can only be attached when application status is set to <strong>Offer</strong>.
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                className="btn-primary w-full text-sm justify-center gap-2 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                id="admin-update-status-btn"
                            >
                                {updating ? (
                                    <><Loader2 size={16} className="animate-spin" /> Saving Changes…</>
                                ) : (
                                    <><Check size={16} /> Save Application Changes</>
                                )}
                            </button>
                        </div>

                        {/* Candidate Info Card */}
                        <div className="card p-5">
                            <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                                <User size={16} className="text-[var(--primary)]" />
                                Candidate Profile
                            </h3>
                            <div className="space-y-3 text-xs sm:text-sm">
                                <div>
                                    <p className="text-xs text-[var(--text-muted)]">Candidate Name</p>
                                    <p className="font-semibold text-[var(--text)] mt-0.5">{candidate.name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-muted)]">Email Address</p>
                                    <a href={`mailto:${candidate.email}`} className="text-[var(--primary)] hover:underline mt-0.5 flex items-center gap-1.5 break-all">
                                        <Mail size={12} className="flex-shrink-0" /> {candidate.email || '—'}
                                    </a>
                                </div>
                                {candidate.phone && (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Phone Number</p>
                                        <p className="text-[var(--text)] mt-0.5 flex items-center gap-1.5">
                                            <Phone size={12} className="flex-shrink-0" /> {candidate.phone}
                                        </p>
                                    </div>
                                )}
                                {candidate.university && (
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">University</p>
                                        <p className="text-[var(--text)] mt-0.5 flex items-center gap-1.5 break-words">
                                            <GraduationCap size={12} className="flex-shrink-0" /> {candidate.university}
                                        </p>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-[var(--border)]">
                                    <Link
                                        to={`/admin/candidates/${candidate._id}`}
                                        className="text-xs text-[var(--primary)] hover:underline font-medium min-h-[44px] flex items-center"
                                    >
                                        View candidate's full profile →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
