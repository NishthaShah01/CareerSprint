import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Send, Code, Users, Award, XCircle, Plus, Pencil, Trash2, ExternalLink, Calendar, CheckSquare, TrendingUp, Eye, Activity, Clock } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import toast from 'react-hot-toast'
import AppNavbar from '../components/AppNavbar'
import DashboardCard from '../components/DashboardCard'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import { DashboardSkeleton } from '../components/SkeletonLoader'
import { getApplications, deleteApplication } from '../services/applicationService'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const STATUS_CONFIG = {
    Applied: { label: 'Applied', color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300', icon: Send },
    'Under Review': { label: 'Under Review', color: '#0284c7', bg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300', icon: Eye },
    Shortlisted: { label: 'Shortlisted', color: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300', icon: TrendingUp },
    OA: { label: 'OA', color: '#a855f7', bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300', icon: Code },
    Interview: { label: 'Interview', color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300', icon: Users },
    Offer: { label: 'Offer', color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300', icon: Award },
    Rejected: { label: 'Rejected', color: '#f43f5e', bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300', icon: XCircle },
}

const CHECKLIST_KEYS = ['resumeSubmitted', 'aptitudePrep', 'dsaRevision', 'hrPrep', 'technicalPrep']

export default function DashboardPage() {
    const { user } = useAuth()
    const { theme } = useTheme()

    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)

    // Delete Modal State
    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const isDark = theme === 'dark'

    const fetchApps = async () => {
        setLoading(true)
        try {
            const { data } = await getApplications()
            setApplications(data.applications || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch dashboard data.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApps()
    }, [])

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleting(true)
        try {
            await deleteApplication(deleteId)
            toast.success('Application deleted successfully!')
            setApplications((prev) => prev.filter((app) => app._id !== deleteId))
            setDeleteId(null)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete application.')
        } finally {
            setDeleting(false)
        }
    }

    // Real MongoDB Metrics Calculations across all 7 canonical statuses
    const metrics = useMemo(() => {
        const counts = {
            Total: applications.length,
            Applied: 0,
            'Under Review': 0,
            Shortlisted: 0,
            OA: 0,
            Interview: 0,
            Offer: 0,
            Rejected: 0,
        }
        let upcomingInterviews = 0
        let totalChecklistItems = 0
        let completedChecklistItems = 0
        let thisMonthCount = 0
        let thisWeekCount = 0

        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        applications.forEach((app) => {
            if (counts[app.status] !== undefined) {
                counts[app.status]++
            }

            if (app.status === 'Interview' || (app.interviewDate && new Date(app.interviewDate) >= now)) {
                upcomingInterviews++
            }

            const appDate = new Date(app.applicationDate || app.createdAt)
            if (!isNaN(appDate.getTime())) {
                if (appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear) {
                    thisMonthCount++
                }
                if (appDate >= sevenDaysAgo) {
                    thisWeekCount++
                }
            }

            if (app.checklist) {
                CHECKLIST_KEYS.forEach(key => {
                    totalChecklistItems++
                    if (app.checklist[key]) completedChecklistItems++
                })
            } else {
                totalChecklistItems += 5
            }
        })

        const avgChecklistPct = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0

        return {
            counts,
            upcomingInterviews,
            avgChecklistPct,
            completedChecklistItems,
            totalChecklistItems,
            thisMonthCount,
            thisWeekCount,
        }
    }, [applications])

    // Deduplicated Activity Feed from real application timeline & status transitions
    const activityFeed = useMemo(() => {
        const events = []
        const seen = new Set()

        applications.forEach(app => {
            const submitKey = `${app._id}-submit`
            if (!seen.has(submitKey)) {
                seen.add(submitKey)
                events.push({
                    id: submitKey,
                    type: 'application',
                    companyName: app.companyName,
                    role: app.role,
                    status: app.status,
                    text: `Submitted application for ${app.role} at ${app.companyName}`,
                    timestamp: new Date(app.applicationDate || app.createdAt),
                    appId: app._id,
                })
            }

            if (app.timeline && Array.isArray(app.timeline)) {
                app.timeline.forEach(t => {
                    if (t.completed) {
                        const stageName = t.stage?.trim()
                        if (stageName && stageName.toLowerCase() !== 'applied') {
                            const eventKey = `${app._id}-${stageName.toLowerCase()}`
                            if (!seen.has(eventKey)) {
                                seen.add(eventKey)
                                events.push({
                                    id: eventKey,
                                    type: 'timeline',
                                    companyName: app.companyName,
                                    role: app.role,
                                    status: app.status,
                                    text: `Moved to ${stageName} for ${app.role} at ${app.companyName}`,
                                    timestamp: new Date(t.date || app.updatedAt || app.createdAt),
                                    appId: app._id,
                                })
                            }
                        }
                    }
                })
            }
        })

        return events
            .filter(evt => !isNaN(evt.timestamp.getTime()))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 6)
    }, [applications])

    // Recharts Data - Status Distribution (Pie Chart displays non-zero statuses)
    const pieChartData = useMemo(() => {
        return Object.keys(STATUS_CONFIG)
            .map((status) => ({
                name: status,
                value: metrics.counts[status] || 0,
                color: STATUS_CONFIG[status].color,
            }))
            .filter((item) => item.value > 0)
    }, [metrics])

    // Bar Chart Data (Displays all 7 canonical statuses)
    const barChartData = useMemo(() => {
        return Object.keys(STATUS_CONFIG).map((status) => ({
            status,
            count: metrics.counts[status] || 0,
            fill: STATUS_CONFIG[status].color,
        }))
    }, [metrics])

    // Recent 5 applications
    const recentApplications = useMemo(() => {
        return [...applications]
            .sort((a, b) => new Date(b.createdAt || b.applicationDate) - new Date(a.createdAt || a.applicationDate))
            .slice(0, 5)
    }, [applications])

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const tooltipStyle = {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e2e8f0',
        color: isDark ? '#f8fafc' : '#0f172a',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        fontSize: '0.875rem',
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            <AppNavbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text)]">
                            Welcome back, {user?.name || 'Applicant'} 👋
                        </h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Here is an overview of your internship application metrics
                        </p>
                    </div>
                    <Link to="/applications/new" className="btn-primary gap-1.5 self-start sm:self-auto">
                        <Plus size={16} /> Add Application
                    </Link>
                </div>

                {loading ? (
                    <DashboardSkeleton />
                ) : (
                    <>
                        {/* Highlights Cards (Upcoming Interviews, Applications This Month, Applications This Week, Checklist %) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Upcoming Interviews</div>
                                    <div className="text-2xl font-bold text-[var(--text)] mt-1">{metrics.upcomingInterviews}</div>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Scheduled or active</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                                    <Calendar size={22} />
                                </div>
                            </div>

                            <div className="card p-5 border-l-4 border-l-primary-500 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">This Month</div>
                                    <div className="text-2xl font-bold text-[var(--text)] mt-1">{metrics.thisMonthCount}</div>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Submitted in current month</p>
                                </div>
                                <div className="p-3 bg-primary-50 dark:bg-primary-950/60 text-[var(--primary)] rounded-xl">
                                    <TrendingUp size={22} />
                                </div>
                            </div>

                            <div className="card p-5 border-l-4 border-l-purple-500 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">This Week</div>
                                    <div className="text-2xl font-bold text-[var(--text)] mt-1">{metrics.thisWeekCount}</div>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Submitted in last 7 days</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
                                    <Clock size={22} />
                                </div>
                            </div>

                            <div className="card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Checklist Progress</div>
                                    <div className="text-2xl font-bold text-[var(--text)] mt-1">{metrics.avgChecklistPct}%</div>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {metrics.completedChecklistItems} / {metrics.totalChecklistItems} tasks done
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <CheckSquare size={22} />
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards (Total + 7 Canonical Status Cards) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {/* Total Card */}
                            <DashboardCard
                                label="Total"
                                count={metrics.counts.Total}
                                icon={Briefcase}
                                colorClass="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                borderClass="border-l-4 border-l-gray-900 dark:border-l-primary-500"
                            />

                            {/* Status Cards */}
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <DashboardCard
                                    key={key}
                                    label={config.label}
                                    count={metrics.counts[key] || 0}
                                    icon={config.icon}
                                    colorClass={config.bg}
                                />
                            ))}
                        </div>

                        {/* Charts & Activity Feed Section */}
                        {applications.length === 0 ? (
                            <div className="card p-8 text-center space-y-3">
                                <Briefcase size={36} className="mx-auto text-[var(--text-muted)] opacity-50" />
                                <h3 className="text-lg font-semibold text-[var(--text)]">No applications yet</h3>
                                <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                                    Start tracking your first application to see your status distribution, progress analytics, and activity feed here.
                                </p>
                                <Link to="/applications/new" className="btn-primary inline-flex gap-1.5 mt-2">
                                    <Plus size={16} /> Add First Application
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Pie Chart */}
                                <div className="card p-5 flex flex-col">
                                    <h3 className="text-base font-semibold text-[var(--text)] mb-4">
                                        Status Distribution
                                    </h3>
                                    <div className="h-64 w-full flex items-center justify-center">
                                        {pieChartData.length === 0 ? (
                                            <p className="text-xs text-[var(--text-muted)] italic">No status distribution data.</p>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        isAnimationActive={true}
                                                        animationDuration={800}
                                                    >
                                                        {pieChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={tooltipStyle} formatter={(val, name) => [`${val} applications`, name]} />
                                                    <Legend wrapperStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="card p-5 flex flex-col">
                                    <h3 className="text-base font-semibold text-[var(--text)] mb-4">
                                        Application Counts
                                    </h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                                                <XAxis
                                                    dataKey="status"
                                                    tickLine={false}
                                                    interval={0}
                                                    stroke={isDark ? '#94a3b8' : '#64748b'}
                                                    style={{ fontSize: 10 }}
                                                    angle={-20}
                                                    textAnchor="end"
                                                />
                                                <YAxis allowDecimals={false} tickLine={false} stroke={isDark ? '#94a3b8' : '#64748b'} style={{ fontSize: 12 }} />
                                                <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val} applications`, 'Count']} />
                                                <Bar
                                                    dataKey="count"
                                                    radius={[4, 4, 0, 0]}
                                                    isAnimationActive={true}
                                                    animationDuration={800}
                                                >
                                                    {barChartData.map((entry, index) => (
                                                        <Cell key={`bar-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Latest Activity Feed Widget */}
                                <div className="card p-5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                                            <Activity size={18} className="text-[var(--primary)]" />
                                            Latest Activity Feed
                                        </h3>
                                        {activityFeed.length === 0 ? (
                                            <p className="text-xs text-[var(--text-muted)] py-4 text-center">No recent activities logged.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {activityFeed.map(evt => (
                                                    <Link
                                                        key={evt.id}
                                                        to={`/applications/${evt.appId}`}
                                                        className="block p-2.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                                                    >
                                                        <p className="text-xs font-medium text-[var(--text)]">{evt.text}</p>
                                                        <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                                                            {formatDate(evt.timestamp)}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Applications Section */}
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-[var(--text)]">Recent Applications</h3>
                                    <p className="text-xs text-[var(--text-muted)]">Your latest 5 submitted applications</p>
                                </div>
                                {applications.length > 0 && (
                                    <Link to="/applications" className="text-xs font-medium text-[var(--primary)] hover:underline">
                                        View all ({applications.length}) →
                                    </Link>
                                )}
                            </div>

                            {recentApplications.length === 0 ? (
                                <EmptyState
                                    title="No applications yet"
                                    description="Start tracking your career journey by adding your first application."
                                    actionButton={
                                        <Link to="/applications/new" className="btn-primary inline-flex gap-1.5 mt-2">
                                            <Plus size={16} /> Add First Application
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-[var(--text)]">
                                        <thead className="bg-[var(--card-hover)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Company & Role</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Applied Date</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                                            {recentApplications.map((app) => (
                                                <tr key={app._id} className="hover:bg-[var(--card-hover)] transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <Link to={`/applications/${app._id}`} className="font-semibold text-[var(--text)] hover:text-[var(--primary)] flex items-center gap-1.5">
                                                            {app.companyName}
                                                            {app.jobLink && (
                                                                <a
                                                                    href={app.jobLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-[var(--text-muted)] hover:text-[var(--primary)]"
                                                                    title="Job Link"
                                                                >
                                                                    <ExternalLink size={12} />
                                                                </a>
                                                            )}
                                                        </Link>
                                                        <div className="text-xs text-[var(--text-muted)]">{app.role}</div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <StatusBadge status={app.status} />
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs whitespace-nowrap text-[var(--text-muted)]">
                                                        {formatDate(app.applicationDate || app.dateApplied || app.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/applications/${app._id}`}
                                                                className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card-hover)] rounded"
                                                                title="View Details"
                                                            >
                                                                <Eye size={14} />
                                                            </Link>
                                                            <Link
                                                                to={`/applications/${app._id}/edit`}
                                                                className="p-1 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card-hover)] rounded"
                                                                title="Edit"
                                                            >
                                                                <Pencil size={14} />
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeleteId(app._id)}
                                                                className="p-1 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
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
