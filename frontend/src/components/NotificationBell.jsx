import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, CheckCheck, Loader2 } from 'lucide-react'
import {
    getNotifications,
    getUnreadCount,
    markOneRead,
    markAllRead,
} from '../services/notificationService'

// How often to silently refresh the unread count (milliseconds)
const POLL_INTERVAL = 30_000

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    const hrs = Math.floor(diff / 3_600_000)
    const days = Math.floor(diff / 86_400_000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATUS_DOT = {
    Offer: 'bg-emerald-500',
    Interview: 'bg-amber-500',
    Shortlisted: 'bg-indigo-500',
    OA: 'bg-violet-500',
    'Under Review': 'bg-sky-500',
    Rejected: 'bg-rose-500',
    Applied: 'bg-blue-500',
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [markingAll, setMarkingAll] = useState(false)
    const panelRef = useRef(null)
    const buttonRef = useRef(null)

    // ── Fetch unread count silently (used for polling) ────────────────────────
    const refreshCount = useCallback(async () => {
        try {
            const { data } = await getUnreadCount()
            if (data.success) setUnreadCount(data.count)
        } catch {
            // Silently fail — don't spam the user with errors on polling
        }
    }, [])

    // ── Fetch full notification list (used when panel opens) ─────────────────
    const loadNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await getNotifications()
            if (data.success) {
                setNotifications(data.notifications)
                const unread = data.notifications.filter(n => !n.isRead).length
                setUnreadCount(unread)
            }
        } catch {
            // fail silently
        } finally {
            setLoading(false)
        }
    }, [])

    // ── Poll unread count every POLL_INTERVAL ms ──────────────────────────────
    useEffect(() => {
        refreshCount()
        const id = setInterval(refreshCount, POLL_INTERVAL)
        return () => clearInterval(id)
    }, [refreshCount])

    // ── Open panel → load full list ───────────────────────────────────────────
    const handleOpen = () => {
        setOpen(v => {
            if (!v) loadNotifications()
            return !v
        })
    }

    // ── Close when clicking outside ───────────────────────────────────────────
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // ── Mark single notification read ─────────────────────────────────────────
    const handleMarkRead = async (id) => {
        try {
            await markOneRead(id)
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch {
            // fail silently
        }
    }

    // ── Mark all read ─────────────────────────────────────────────────────────
    const handleMarkAllRead = async () => {
        setMarkingAll(true)
        try {
            await markAllRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch {
            // fail silently
        } finally {
            setMarkingAll(false)
        }
    }

    const dot = STATUS_DOT

    return (
        <div className="relative">
            {/* Bell button */}
            <button
                ref={buttonRef}
                onClick={handleOpen}
                aria-label="Notifications"
                id="notification-bell-btn"
                className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] rounded-md transition-colors"
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center px-0.5 leading-none animate-in zoom-in duration-150">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-[calc(100%+6px)] w-[340px] sm:w-[380px] max-h-[480px] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-[200] overflow-hidden"
                    role="dialog"
                    aria-label="Notifications panel"
                >
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Bell size={14} className="text-[var(--primary)]" />
                            <span className="text-sm font-semibold text-[var(--text)]">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-xs font-medium bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={markingAll}
                                    className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline disabled:opacity-50 px-1.5 py-1"
                                    title="Mark all as read"
                                >
                                    {markingAll
                                        ? <Loader2 size={11} className="animate-spin" />
                                        : <CheckCheck size={12} />
                                    }
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] rounded transition-colors"
                                aria-label="Close notifications"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 size={20} className="animate-spin text-[var(--text-muted)]" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                                <Bell size={32} className="text-[var(--text-muted)] opacity-30 mb-3" />
                                <p className="text-sm font-medium text-[var(--text-muted)]">No new notifications</p>
                                <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">
                                    You're all caught up!
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[var(--border)]">
                                {notifications.map(n => (
                                    <li
                                        key={n._id}
                                        onClick={() => { if (!n.isRead) handleMarkRead(n._id) }}
                                        className={`px-4 py-3 transition-colors cursor-pointer group ${
                                            n.isRead
                                                ? 'hover:bg-[var(--card-hover)]'
                                                : 'bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Status colour dot */}
                                            <div className="flex-shrink-0 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${dot[n.status] || 'bg-gray-400'} ${n.isRead ? 'opacity-40' : ''}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-semibold mb-0.5 ${n.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                                                    {n.title}
                                                </p>
                                                <p className={`text-xs leading-relaxed ${n.isRead ? 'text-[var(--text-muted)] opacity-70' : 'text-[var(--text-muted)]'}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-[var(--text-muted)] opacity-60 mt-1">
                                                    {timeAgo(n.createdAt)}
                                                </p>
                                            </div>

                                            {/* Unread indicator dot */}
                                            {!n.isRead && (
                                                <div className="flex-shrink-0 mt-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
