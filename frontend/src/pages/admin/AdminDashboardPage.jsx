import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Briefcase, Users, TrendingUp, Calendar,
    ChevronRight, Activity, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdminNavbar from '../../components/AdminNavbar'
import { getAdminStats, getAdminApplications } from '../../services/adminService'

const STATUS_COLOR = {
    Applied: 'text-blue-600 dark:text-blue-400',
    'Under Review': 'text-sky-600 dark:text-sky-400',
    Shortlisted: 'text-indigo-600 dark:text-indigo-400',
    OA: 'text-violet-600 dark:text-violet-400',
    Interview: 'text-amber-600 dark:text-amber-400',
    Offer: 'text-emerald-600 dark:text-emerald-400',
    Rejected: 'text-rose-600 dark:text-rose-400',
}

const STATUS_BG = {
    Applied: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'Under Review': 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    Shortlisted: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    OA: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    Interview: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    Offer: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    Rejected: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
}

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="card p-5 h-full flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] truncate">{label}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] mt-1">{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${color} bg-opacity-15 flex-shrink-0`}>
                    <Icon size={22} className={color} />
                </div>
            </div>
            {sub && <p className="text-xs text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">{sub}</p>}
        </div>
    )
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [recent, setRecent] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, appsRes] = await Promise.all([
                    getAdminStats(),
                    getAdminApplications({ limit: 8, sort: 'newest' }),
                ])
                setStats(statsRes.data.stats)
                setRecent(appsRes.data.applications || [])
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load admin overview.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const byStatus = stats?.byStatus || {}

    return (
        <div className="min-h-screen w-full min-w-0 bg-[var(--bg)] transition-colors overflow-x-hidden">
            <AdminNavbar />

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
                {/* Responsive Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] tracking-tight">Admin Overview</h1>
                    <p className="text-xs sm:text-sm lg:text-base text-[var(--text-muted)] mt-1">
                        Monitor all applications and candidates across the platform.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Key Stats Cards (Mobile: 1, Tablet: 2, Desktop: 4) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                            <StatCard
                                icon={Briefcase}
                                label="Total Applications"
                                value={stats?.totalApplications ?? 0}
                                color="text-blue-500"
                                sub="All time applications"
                            />
                            <StatCard
                                icon={Users}
                                label="Total Candidates"
                                value={stats?.totalCandidates ?? 0}
                                color="text-violet-500"
                                sub="Registered candidates"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="This Week"
                                value={stats?.recentApplications ?? 0}
                                color="text-emerald-500"
                                sub="New this week"
                            />
                            <StatCard
                                icon={Calendar}
                                label="Upcoming Interviews"
                                value={stats?.upcomingInterviews ?? 0}
                                color="text-amber-500"
                                sub="Next 14 days"
                            />
                        </div>

                        {/* Status Breakdown */}
                        <div className="card p-4 sm:p-5 mb-6 sm:mb-8">
                            <h2 className="text-sm sm:text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-[var(--primary)]" />
                                Status Breakdown
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {['Applied', 'Under Review', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected'].map(s => (
                                    <Link
                                        key={s}
                                        to={`/admin/applications?status=${encodeURIComponent(s)}`}
                                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl hover:bg-[var(--card-hover)] transition-all border border-transparent hover:border-[var(--border)] text-center group min-h-[44px]"
                                    >
                                        <span className={`text-lg sm:text-xl font-bold ${STATUS_COLOR[s]}`}>{byStatus[s] ?? 0}</span>
                                        <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BG[s]}`}>{s}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Applications Section */}
                        <div className="card overflow-hidden">
                            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[var(--border)]">
                                <h2 className="text-sm sm:text-base font-semibold text-[var(--text)] flex items-center gap-2">
                                    <Clock size={16} className="text-[var(--primary)]" />
                                    Recent Applications
                                </h2>
                                <Link to="/admin/applications" className="text-xs sm:text-sm text-[var(--primary)] hover:underline flex items-center gap-1 font-medium">
                                    View all <ChevronRight size={14} />
                                </Link>
                            </div>

                            {recent.length === 0 ? (
                                <div className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">
                                    No applications yet.
                                </div>
                            ) : (
                                <>
                                    {/* Desktop & Tablet List View (≥ sm) */}
                                    <div className="hidden sm:block overflow-x-auto">
                                        <div className="divide-y divide-[var(--border)] min-w-[600px]">
                                            {recent.map(app => (
                                                <Link
                                                    key={app._id}
                                                    to={`/admin/applications/${app._id}`}
                                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--card-hover)] transition-colors group"
                                                >
                                                    <div className="min-w-0 flex-1 pr-4">
                                                        <p className="text-sm font-semibold text-[var(--text)] truncate">{app.companyName}</p>
                                                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{app.role}</p>
                                                        {app.user && (
                                                            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                                                                👤 {app.user.name} · {app.user.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 flex-shrink-0">
                                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BG[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                                            {app.status}
                                                        </span>
                                                        <ChevronRight size={16} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile Stacked Card View (< sm) */}
                                    <div className="sm:hidden divide-y divide-[var(--border)]">
                                        {recent.map(app => (
                                            <div key={app._id} className="p-4 space-y-3 hover:bg-[var(--card-hover)] transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-[var(--text)] text-sm truncate">{app.companyName}</h3>
                                                        <p className="text-xs text-[var(--text-muted)] truncate">{app.role}</p>
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_BG[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {app.status}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-xs text-[var(--text-muted)]">
                                                    <p className="truncate">👤 <span className="font-medium text-[var(--text)]">{app.user?.name || '—'}</span></p>
                                                    <p className="truncate">✉️ {app.user?.email || '—'}</p>
                                                    <p>📅 Applied: {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : '—'}</p>
                                                    {app.interviewDate && (
                                                        <p className="text-amber-600 dark:text-amber-400">🕒 Interview: {new Date(app.interviewDate).toLocaleDateString()}</p>
                                                    )}
                                                </div>

                                                <div className="pt-2 flex justify-end">
                                                    <Link
                                                        to={`/admin/applications/${app._id}`}
                                                        className="btn-secondary w-full justify-center px-4 py-2.5 text-xs inline-flex items-center gap-1.5 min-h-[44px]"
                                                    >
                                                        Review Application <ChevronRight size={13} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
