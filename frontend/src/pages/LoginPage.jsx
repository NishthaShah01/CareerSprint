import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const from = location.state?.from?.pathname || '/dashboard'

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email.trim() || !form.password) {
            toast.error('Email and password are required.')
            return
        }

        setLoading(true)
        try {
            const data = await login(form.email.trim(), form.password)
            toast.success('Welcome back! Signed in successfully.')
            const role = data?.user?.role
            if (role === 'admin') {
                navigate('/admin/dashboard', { replace: true })
            } else {
                navigate(from === '/dashboard' ? '/dashboard' : from, { replace: true })
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4 transition-colors duration-300">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-[var(--primary)]">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Zap size={16} className="text-white" />
                        </div>
                        CareerSprint
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-[var(--text)]">Welcome back</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Sign in to your account to continue</p>
                </div>

                {/* Form Card */}
                <div className="card p-6">
                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label className="label" htmlFor="email">Email address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="input-field pl-9"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-9 pr-10"
                                    value={form.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <>Sign in <ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-5">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-[var(--primary)] font-medium hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>

                <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                    <Link to="/" className="text-[var(--primary)] hover:underline">← Back to home</Link>
                </p>
            </div>
        </div>
    )
}
