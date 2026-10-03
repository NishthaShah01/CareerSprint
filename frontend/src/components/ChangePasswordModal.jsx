import { useState } from 'react'
import { KeyRound, Eye, EyeOff, Lock, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function ChangePasswordModal({ isOpen, onClose }) {
    const { changePassword } = useAuth()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!currentPassword) {
            setError('Current password is required.')
            return
        }
        if (!newPassword) {
            setError('New password is required.')
            return
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.')
            return
        }
        if (newPassword === currentPassword) {
            setError('New password cannot be the same as your current password.')
            return
        }
        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match.')
            return
        }

        setLoading(true)
        try {
            const res = await changePassword({ currentPassword, newPassword, confirmPassword })
            toast.success(res?.message || 'Password changed successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            onClose()
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to change password.'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="card w-full max-w-md p-6 relative space-y-4 shadow-xl border border-[var(--border)]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
                    <div className="p-2 bg-primary-50 dark:bg-primary-950/60 text-[var(--primary)] rounded-lg">
                        <KeyRound size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-[var(--text)]">Change Password</h3>
                        <p className="text-xs text-[var(--text-muted)]">Update your account security credentials</p>
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label text-xs">Current Password *</label>
                        <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-field pl-9 pr-9 text-sm"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                                aria-label="Toggle password visibility"
                            >
                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label text-xs">New Password *</label>
                        <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field pl-9 pr-9 text-sm"
                                placeholder="Minimum 6 characters"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                                aria-label="Toggle password visibility"
                            >
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label text-xs">Confirm New Password *</label>
                        <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field pl-9 pr-9 text-sm"
                                placeholder="Re-enter new password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                                aria-label="Toggle password visibility"
                            >
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1 text-xs justify-center py-2"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1 text-xs justify-center py-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Updating...</span>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
