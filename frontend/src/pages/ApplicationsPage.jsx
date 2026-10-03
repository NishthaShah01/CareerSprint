import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, ArrowUpDown, Pencil, Trash2, ExternalLink, Briefcase, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import AppNavbar from '../components/AppNavbar'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import { TableSkeleton } from '../components/SkeletonLoader'
import { getApplications, deleteApplication } from '../services/applicationService'

const ITEMS_PER_PAGE = 8

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)

    // Filters & Sorting
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [sortBy, setSortBy] = useState('newest')
    const [currentPage, setCurrentPage] = useState(1)

    // Delete Modal State
    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchApps = async () => {
        setLoading(true)
        try {
            const { data } = await getApplications()
            setApplications(data.applications || [])
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch applications.')
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
            setApplications(prev => prev.filter(app => app._id !== deleteId))
            setDeleteId(null)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete application.')
        } finally {
            setDeleting(false)
        }
    }

    // Instant search & filter logic (Company, Role, Location, Status)
    const filteredApps = useMemo(() => {
        return applications
            .filter((app) => {
                const query = search.toLowerCase()
                const matchesSearch =
                    app.companyName?.toLowerCase().includes(query) ||
                    app.role?.toLowerCase().includes(query) ||
                    app.status?.toLowerCase().includes(query) ||
                    app.location?.toLowerCase().includes(query)

                const matchesStatus = statusFilter === 'All' || app.status === statusFilter
                return matchesSearch && matchesStatus
            })
            .sort((a, b) => {
                const dateA = new Date(a.applicationDate || a.createdAt || a.dateApplied)
                const dateB = new Date(b.applicationDate || b.createdAt || b.dateApplied)

                if (sortBy === 'newest') return dateB - dateA
                if (sortBy === 'oldest') return dateA - dateB
                if (sortBy === 'company') return a.companyName.localeCompare(b.companyName)
                return 0
            })
    }, [applications, search, statusFilter, sortBy])

    // Pagination
    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE) || 1
    const paginatedApps = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredApps.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredApps, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [search, statusFilter, sortBy])

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            <AppNavbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text)]">Applications</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Manage and track your job application pipeline</p>
                    </div>
                    <Link to="/applications/new" className="btn-primary gap-1.5 self-start sm:self-auto">
                        <Plus size={16} /> Add Application
                    </Link>
                </div>

                {/* Controls Card */}
                <div className="card p-4 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
                    {/* Instant Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search company, role, location, status..."
                            className="input-field pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filters & Sorting */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={15} className="text-[var(--text-muted)] shrink-0" />
                            <select
                                className="input-field py-1.5 text-sm w-auto"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Applied">Applied</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="OA">OA</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <ArrowUpDown size={15} className="text-[var(--text-muted)] shrink-0" />
                            <select
                                className="input-field py-1.5 text-sm w-auto"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="company">Company A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <TableSkeleton rows={6} />
                ) : filteredApps.length === 0 ? (
                    <EmptyState
                        title={search || statusFilter !== 'All' ? 'No matching applications found' : "You haven't added any applications."}
                        description={
                            search || statusFilter !== 'All'
                                ? 'Try adjusting your search query or filter settings.'
                                : 'Start tracking your internship applications by adding your first application.'
                        }
                        icon={Briefcase}
                        actionButton={
                            !search && statusFilter === 'All' ? (
                                <Link to="/applications/new" className="btn-primary inline-flex gap-1.5">
                                    <Plus size={16} /> Add First Application
                                </Link>
                            ) : null
                        }
                    />
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-[var(--text)]">
                                <thead className="bg-[var(--card-hover)] border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3.5">Company & Role</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Date Applied</th>
                                        <th className="px-6 py-3.5 hidden md:table-cell">Location & Type</th>
                                        <th className="px-6 py-3.5 hidden lg:table-cell">Salary</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                                    {paginatedApps.map((app) => (
                                        <tr key={app._id} className="hover:bg-[var(--card-hover)] transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/applications/${app._id}`} className="font-semibold text-[var(--text)] hover:text-[var(--primary)] flex items-center gap-1.5">
                                                    {app.companyName}
                                                    {app.jobLink && (
                                                        <a
                                                            href={app.jobLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[var(--text-muted)] hover:text-[var(--primary)]"
                                                            title="View Job Post"
                                                        >
                                                            <ExternalLink size={13} />
                                                        </a>
                                                    )}
                                                </Link>
                                                <div className="text-xs text-[var(--text-muted)] mt-0.5">{app.role}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="px-6 py-4 text-xs whitespace-nowrap text-[var(--text-muted)]">
                                                {formatDate(app.applicationDate || app.dateApplied || app.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-xs hidden md:table-cell text-[var(--text-muted)]">
                                                {app.location || '—'}
                                                {app.jobType && (
                                                    <span className="ml-1.5 px-1.5 py-0.5 bg-[var(--card-hover)] border border-[var(--border)] rounded text-[11px] text-[var(--text)]">
                                                        {app.jobType}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs hidden lg:table-cell text-[var(--text-muted)]">
                                                {app.salary || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/applications/${app._id}`}
                                                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card-hover)] rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={15} />
                                                    </Link>
                                                    <Link
                                                        to={`/applications/${app._id}/edit`}
                                                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card-hover)] rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteId(app._id)}
                                                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-[var(--card-hover)] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                                <div>
                                    Showing <span className="font-medium text-[var(--text)]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                    <span className="font-medium text-[var(--text)]">
                                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)}
                                    </span>{' '}
                                    of <span className="font-medium text-[var(--text)]">{filteredApps.length}</span> results
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-2 font-medium text-[var(--text)]">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Reusable Delete Confirmation Modal */}
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
