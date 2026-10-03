import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Mail, GraduationCap, Briefcase, ChevronRight, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminNavbar from '../../components/AdminNavbar'
import UserAvatar from '../../components/UserAvatar'
import { getAdminCandidates } from '../../services/adminService'

export default function AdminCandidatesPage() {
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await getAdminCandidates()
                setCandidates(data.candidates || [])
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load candidates.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = candidates.filter(c => {
        const q = search.toLowerCase()
        return (
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.university?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="min-h-screen w-full min-w-0 bg-[var(--bg)] transition-colors overflow-x-hidden">
            <AdminNavbar />

            <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] tracking-tight">Candidates</h1>
                        <p className="text-xs sm:text-sm lg:text-base text-[var(--text-muted)] mt-0.5">
                            {candidates.length} registered candidate{candidates.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Search Bar (Full Width & Touch Ready) */}
                <div className="relative mb-6">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search by candidate name, email, or university…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-10 pr-10 w-full text-sm min-h-[44px]"
                        id="candidate-search"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Candidates List / Grid */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-[var(--text-muted)]">
                            <Users size={40} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">{search ? 'No candidates match your search query.' : 'No candidates registered yet.'}</p>
                            {search && (
                                <button onClick={() => setSearch('')} className="mt-3 text-xs text-[var(--primary)] hover:underline font-medium min-h-[44px] flex items-center">
                                    Clear search filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {filtered.map(c => (
                                <Link
                                    key={c._id}
                                    to={`/admin/candidates/${c._id}`}
                                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-[var(--card-hover)] transition-colors group min-h-[64px]"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-3">
                                        {/* Avatar circle */}
                                        <UserAvatar user={c} size="md" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-[var(--text)] text-sm sm:text-base truncate">{c.name}</p>
                                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5 truncate">
                                                <Mail size={12} className="flex-shrink-0" /> <span className="truncate">{c.email}</span>
                                            </p>
                                            {c.university && (
                                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5 truncate">
                                                    <GraduationCap size={12} className="flex-shrink-0" /> <span className="truncate">{c.university}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--card-hover)] px-2.5 py-1 rounded-full font-medium border border-[var(--border)]">
                                            <Briefcase size={12} className="flex-shrink-0 text-[var(--primary)]" />
                                            <span>{c.applicationCount} app{c.applicationCount !== 1 ? 's' : ''}</span>
                                        </span>
                                        <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
