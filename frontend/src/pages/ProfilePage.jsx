import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle, ArrowLeft, Loader2, Globe, Phone, GraduationCap, Link as LinkIcon, Code, Camera, Trash2, KeyRound, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AppNavbar from '../components/AppNavbar'
import UserAvatar from '../components/UserAvatar'
import ChangePasswordModal from '../components/ChangePasswordModal'
import api from '../services/api'

export default function ProfilePage() {
    const { user, updateProfile } = useAuth()

    const [form, setForm] = useState({
        name: user?.name || '',
        university: user?.university || '',
        phone: user?.phone || '',
        linkedin: user?.linkedin || '',
        github: user?.github || '',
        portfolio: user?.portfolio || '',
    })

    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                university: user.university || '',
                phone: user.phone || '',
                linkedin: user.linkedin || '',
                github: user.github || '',
                portfolio: user.portfolio || '',
            })
            setAvatarUrl(user.avatarUrl || '')
        }
    }, [user])

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleAvatarChange = async (e) => {
        const file = e.target?.files?.[0]
        if (!file) return

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid image format. Please upload JPG, PNG, or WebP.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Profile image size must be under 5MB.')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setUploadingAvatar(true)
        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            if (data.success && data.url) {
                setAvatarUrl(data.url)
                await updateProfile({ avatarUrl: data.url })
                toast.success('Profile picture updated successfully!')
            } else {
                toast.error(data.message || 'Failed to upload profile picture.')
            }
        } catch (err) {
            console.error('Avatar upload error:', err)
            toast.error(err.response?.data?.message || 'Failed to upload profile picture.')
        } finally {
            setUploadingAvatar(false)
            if (e.target) e.target.value = ''
        }
    }

    const handleRemoveAvatar = async () => {
        setAvatarUrl('')
        try {
            await updateProfile({ avatarUrl: '' })
            toast.success('Profile picture removed.')
        } catch (err) {
            toast.error('Failed to remove profile picture.')
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()

        if (!form.name.trim()) {
            toast.error('Full name is required.')
            return
        }

        setLoading(true)
        try {
            await updateProfile({
                name: form.name.trim(),
                university: form.university.trim(),
                phone: form.phone.trim(),
                linkedin: form.linkedin.trim(),
                github: form.github.trim(),
                portfolio: form.portfolio.trim(),
                avatarUrl,
            })
            toast.success('Profile updated successfully!')
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile. Please try again.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            <AppNavbar />

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 space-y-6">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-2"
                >
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                        <UserCircle size={22} className="text-[var(--primary)]" />
                        Profile & Account Settings
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Manage your identity, security credentials, and contact details</p>
                </div>

                {/* Main Profile Card */}
                <div className="card p-6">
                    {/* Avatar Upload + Identity Header */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 pb-6 border-b border-[var(--border)]">
                        <div className="relative group">
                            <UserAvatar name={user?.name} avatarUrl={avatarUrl} size="lg" />
                            <label
                                htmlFor="avatar-file-input"
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                title="Upload profile picture"
                            >
                                {uploadingAvatar ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                            </label>
                            <input
                                id="avatar-file-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={uploadingAvatar}
                            />
                        </div>

                        <div className="text-center sm:text-left flex-1 min-w-0">
                            <h2 className="font-bold text-[var(--text)] text-lg truncate">{user?.name || 'Applicant'}</h2>
                            <p className="text-sm text-[var(--text-muted)] truncate">{user?.email}</p>
                            {user?.university && (
                                <p className="text-xs text-[var(--primary)] font-medium mt-1 flex items-center justify-center sm:justify-start gap-1">
                                    <GraduationCap size={13} /> {user.university}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                <label
                                    htmlFor="avatar-file-input"
                                    className="btn-secondary px-2.5 py-1 text-xs gap-1.5 cursor-pointer"
                                >
                                    <Camera size={13} /> {avatarUrl ? 'Change Picture' : 'Upload Picture'}
                                </label>
                                {avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSave} noValidate>
                        {/* Name & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="name">Full name *</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="label" htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={user?.email ?? ''}
                                    className="input-field opacity-70 cursor-not-allowed bg-[var(--card-hover)]"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* University & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="university">University / College</label>
                                <div className="relative">
                                    <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="university"
                                        name="university"
                                        type="text"
                                        placeholder="e.g. LD College of Engineering"
                                        value={form.university}
                                        onChange={handleChange}
                                        className="input-field pl-9"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label" htmlFor="phone">Phone number <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+91 98765 01001"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="input-field pl-9"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links: LinkedIn & GitHub */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="linkedin">LinkedIn URL <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="linkedin"
                                        name="linkedin"
                                        type="url"
                                        placeholder="https://linkedin.com/in/..."
                                        value={form.linkedin}
                                        onChange={handleChange}
                                        className="input-field pl-9"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label" htmlFor="github">GitHub URL <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                                <div className="relative">
                                    <Code size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input
                                        id="github"
                                        name="github"
                                        type="url"
                                        placeholder="https://github.com/..."
                                        value={form.github}
                                        onChange={handleChange}
                                        className="input-field pl-9"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Portfolio */}
                        <div>
                            <label className="label" htmlFor="portfolio">Portfolio / Website <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    id="portfolio"
                                    name="portfolio"
                                    type="url"
                                    placeholder="https://yourportfolio.com"
                                    value={form.portfolio}
                                    onChange={handleChange}
                                    className="input-field pl-9"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-4 justify-center" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> Saving changes...
                                </span>
                            ) : (
                                'Save Profile Changes'
                            )}
                        </button>
                    </form>
                </div>

                {/* Account & Security Card */}
                <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-[var(--text)] flex items-center gap-2 text-base">
                            <Shield size={18} className="text-[var(--primary)]" />
                            Account Security & Credentials
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Change your password to keep your account safe and secure.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setPasswordModalOpen(true)}
                        className="btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2 shrink-0"
                    >
                        <KeyRound size={14} /> Change Password
                    </button>
                </div>

                <ChangePasswordModal
                    isOpen={passwordModalOpen}
                    onClose={() => setPasswordModalOpen(false)}
                />
            </main>
        </div>
    )
}
