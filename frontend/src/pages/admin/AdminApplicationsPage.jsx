import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
    Search, ChevronRight, Filter, X, ChevronDown, ChevronUp,
    Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminNavbar from '../../components/AdminNavbar'
import UserAvatar from '../../components/UserAvatar'
import { getAdminApplications } from '../../services/adminService'

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

export default function AdminApplicationsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [applications, setApplications] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [sortField, setSortField] = useState('newest')
    const [filterOpen, setFilterOpen] = useState(false)

    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const jobType = searchParams.get('jobType') || ''
    const page = Number(searchParams.get('page') || 1)

    const fetch = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await getAdminApplications({
                search,
                status,
                jobType,
                sort: sortField,
                page,
                limit: 20,
            })
            setApplications(data.applications || [])
            setTotal(data.total || 0)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load applications.')
        } finally {
            setLoading(false)
        }
    }, [search, status, jobType, sortField, page])

    useEffect(() => { fetch() }, [fetch])

    const setParam = (key, value) => {
        const p = new URLSearchParams(searchParams)
        if (value) p.set(key, value); else p.delete(key)
        p.delete('page')
        setSearchParams(p)
    }

    const setPage = (n) => {
        const p = new URLSearchParams(searchParams)
        p.set('page', n)
        setSearchParams(p)
    }

    const pages = Math.ceil(total / 20)

    return (
        <div className="min-h-screen w-full min-w-0 bg-[var(--bg)] transition-colors overflow-x-hidden">
            <AdminNavbar />

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] tracking-tight">All Applications</h1>
                        <p className="text-xs sm:text-sm lg:text-base text-[var(--text-muted)] mt-0.5">
                            {total} application{total !== 1 ? 's' : ''} across all candidates
                        </p>
                    </div>

                    <button
                        onClick={() => setFilterOpen(v => !v)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--card-hover)] transition-colors min-h-[44px] w-full sm:w-auto"
                    >
                        <Filter size={15} />
                        Filter & Search Options
                        {filterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {/* Filter / Search bar (Responsive Stack) */}
                <div className={`card p-4 sm:p-5 mb-6 space-y-4 transition-all ${filterOpen ? '' : 'hidden'}`}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search by candidate, company, role, location…"
                                value={search}
                                onChange={e => setParam('search', e.target.value)}
                                className="input-field pl-9 w-full text-sm min-h-[44px]"
                                id="admin-search"
                            />
                            {search && (
                                <button onClick={() => setParam('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Status filter */}
                        <select
                            value={status}
                            onChange={e => setParam('status', e.target.value)}
                            className="input-field text-sm w-full sm:w-44 min-h-[44px]"
                            id="admin-status-filter"
                        >
                            <option value="">All Statuses</option>
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        {/* Job Type filter */}
                        <select
                            value={jobType}
                            onChange={e => setParam('jobType', e.target.value)}
                            className="input-field text-sm w-full sm:w-40 min-h-[44px]"
                            id="admin-jobtype-filter"
                        >
                            <option value="">All Job Types</option>
                            <option value="Internship">Internship</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortField}
                            onChange={e => setSortField(e.target.value)}
                            className="input-field text-sm w-full sm:w-40 min-h-[44px]"
                            id="admin-sort"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="company">Company A-Z</option>
                            <option value="role">Role A-Z</option>
                        </select>
                    </div>

                    {(search || status) && (
                        <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                            <button
                                onClick={() => { setParam('search', ''); setParam('status', '') }}
                                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 min-h-[36px] px-2"
                            >
                                <X size={13} /> Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Applications Content */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="flex flex-col items-center py-20 px-4 text-center text-[var(--text-muted)]">
                            <Briefcase size={40} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">No applications found.</p>
                            {(search || status) && (
                                <button onClick={() => { setParam('search', ''); setParam('status', '') }} className="mt-3 text-xs text-[var(--primary)] hover:underline font-medium min-h-[44px] flex items-center">
                                    Clear filters and try again
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View (≥ 1024px) */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b border-[var(--border)] bg-[var(--card-hover)]">
                                            <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Candidate</th>
                                            <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Company / Role</th>
                                            <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Applied</th>
                                            <th className="px-5 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Interview</th>
                                            <th className="px-5 py-3.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {applications.map(app => (
                                            <tr key={app._id} className="hover:bg-[var(--card-hover)] transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar user={app.user} size="sm" />
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-[var(--text)] text-sm truncate">{app.user?.name || '—'}</p>
                                                            <p className="text-[var(--text-muted)] text-xs truncate max-w-[180px]">{app.user?.email || '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-[var(--text)] text-sm">{app.companyName}</p>
                                                    <p className="text-[var(--text-muted)] text-xs">{app.role}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BG[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-xs text-[var(--text-muted)]">
                                                    {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-5 py-4 text-xs text-[var(--text-muted)]">
                                                    {app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        to={`/admin/applications/${app._id}`}
                                                        className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1"
                                                    >
                                                        Review <ChevronRight size={13} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile & Tablet Card Layout (< 1024px) */}
                            <div className="lg:hidden divide-y divide-[var(--border)]">
                                {applications.map(app => (
                                    <div key={app._id} className="p-4 sm:p-5 space-y-3 hover:bg-[var(--card-hover)] transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-[var(--text)] text-sm sm:text-base truncate">{app.companyName}</h3>
                                                <p className="text-xs sm:text-sm text-[var(--text-muted)] truncate">{app.role}</p>
                                            </div>
                                            <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BG[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {app.status}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-xs sm:text-sm text-[var(--text-muted)]">
                                            <p className="truncate">👤 Candidate: <span className="font-medium text-[var(--text)]">{app.user?.name || '—'}</span></p>
                                            <p className="truncate">✉️ Email: <span className="text-[var(--text)]">{app.user?.email || '—'}</span></p>
                                            <p>📅 Applied Date: <span className="text-[var(--text)]">{app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : '—'}</span></p>
                                            {app.interviewDate && (
                                                <p className="text-amber-600 dark:text-amber-400 font-medium">🕒 Interview Date: {new Date(app.interviewDate).toLocaleDateString()}</p>
                                            )}
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <Link
                                                to={`/admin/applications/${app._id}`}
                                                className="btn-secondary w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 min-h-[44px]"
                                            >
                                                Review Application <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination (Touch Ready) */}
                {pages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium disabled:opacity-40 hover:bg-[var(--card-hover)] transition-colors min-h-[44px]"
                        >
                            Previous
                        </button>
                        <span className="text-xs sm:text-sm text-[var(--text-muted)] px-2 font-medium">Page {page} of {pages}</span>
                        <button
                            disabled={page >= pages}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium disabled:opacity-40 hover:bg-[var(--card-hover)] transition-colors min-h-[44px]"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
