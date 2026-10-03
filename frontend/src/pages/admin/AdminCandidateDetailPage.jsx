import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Mail, Phone, GraduationCap, Globe,
    Briefcase, ChevronRight, AlertCircle, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminNavbar from '../../components/AdminNavbar'
import { getCandidateApplications } from '../../services/adminService'

import UserAvatar from '../../components/UserAvatar'

const STATUS_BG = {
    Applied: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'Under Review': 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    Shortlisted: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    OA: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    Interview: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    Offer: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    Rejected: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
}

export default function AdminCandidateDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [candidate, setCandidate] = useState(null)
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getCandidateApplications(id)
                setCandidate(data.candidate)
                setApplications(data.applications || [])
            } catch (err) {
                if (err.response?.status === 404) setNotFound(true)
                else toast.error(err.response?.data?.message || 'Failed to load candidate.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

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

    if (notFound || !candidate) {
        return (
            <div className="min-h-screen bg-[var(--bg)] transition-colors">
                <AdminNavbar />
                <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                    <AlertCircle size={40} className="mx-auto mb-4 text-rose-500 opacity-70" />
                    <h2 className="text-xl font-semibold text-[var(--text)]">Candidate Not Found</h2>
                    <button onClick={() => navigate(-1)} className="btn-primary mt-6 min-h-[44px]">
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full min-w-0 bg-[var(--bg)] transition-colors overflow-x-hidden">
            <AdminNavbar />

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-6 min-h-[44px] px-1"
                >
                    <ArrowLeft size={16} /> Back to Candidates
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Candidate Info Card */}
                    <div className="card p-5 sm:p-6 h-fit">
                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <UserAvatar user={candidate} size="lg" className="mb-3" />
                            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">{candidate.name}</h2>
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5 break-all">{candidate.email}</p>
                        </div>

                        {/* Extended Details */}
                        <div className="space-y-3 text-xs sm:text-sm border-t border-[var(--border)] pt-4">
                            {candidate.phone && (
                                <div className="flex items-center gap-2.5 text-[var(--text-muted)] min-w-0">
                                    <Phone size={14} className="flex-shrink-0" />
                                    <span className="break-all">{candidate.phone}</span>
                                </div>
                            )}
                            {candidate.university && (
                                <div className="flex items-center gap-2.5 text-[var(--text-muted)] min-w-0">
                                    <GraduationCap size={14} className="flex-shrink-0" />
                                    <span className="break-words">{candidate.university}</span>
                                </div>
                            )}
                            {candidate.linkedin && (
                                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[var(--primary)] hover:underline truncate min-h-[36px]">
                                    <ExternalLink size={14} className="flex-shrink-0" /> LinkedIn Profile
                                </a>
                            )}
                            {candidate.github && (
                                <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[var(--primary)] hover:underline truncate min-h-[36px]">
                                    <ExternalLink size={14} className="flex-shrink-0" /> GitHub Profile
                                </a>
                            )}
                            {candidate.portfolio && (
                                <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[var(--primary)] hover:underline truncate min-h-[36px]">
                                    <Globe size={14} className="flex-shrink-0" /> Portfolio Website
                                </a>
                            )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-[var(--border)] text-center">
                            <p className="text-xs text-[var(--text-muted)]">Member since</p>
                            <p className="text-xs sm:text-sm text-[var(--text)] font-semibold mt-0.5">
                                {new Date(candidate.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Applications List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                            <Briefcase size={18} className="text-[var(--primary)]" />
                            Submitted Applications ({applications.length})
                        </h3>

                        {applications.length === 0 ? (
                            <div className="card flex flex-col items-center justify-center py-16 px-4 text-center text-[var(--text-muted)]">
                                <Briefcase size={40} className="mb-3 opacity-30" />
                                <p className="text-sm font-medium">No applications submitted by this candidate yet.</p>
                            </div>
                        ) : (
                            <div className="card overflow-hidden">
                                <div className="divide-y divide-[var(--border)]">
                                    {applications.map(app => (
                                        <div key={app._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--card-hover)] transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-[var(--text)] text-sm sm:text-base truncate">{app.companyName}</h4>
                                                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BG[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate mt-0.5">{app.role}</p>
                                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                                    Applied: {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : '—'}
                                                    {app.location ? ` · Location: ${app.location}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex justify-end sm:flex-shrink-0 pt-2 sm:pt-0">
                                                <Link
                                                    to={`/admin/applications/${app._id}`}
                                                    className="btn-secondary w-full sm:w-auto px-4 py-2 text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                                                >
                                                    Review <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
