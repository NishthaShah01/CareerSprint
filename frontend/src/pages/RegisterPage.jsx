import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const validate = () => {
        const { name, email, password, confirmPassword } = form
        if (!name.trim() || !email.trim() || !password || !confirmPassword)
            return 'All fields are required.'
        if (!/^\S+@\S+\.\S+$/.test(email))
            return 'Please enter a valid email address.'
        if (password.length < 6)
            return 'Password must be at least 6 characters.'
        if (password !== confirmPassword)
            return 'Passwords do not match.'
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationError = validate()
        if (validationError) {
            toast.error(validationError)
            return
        }

        setLoading(true)
        try {
            await register(form.name.trim(), form.email.trim(), form.password)
            toast.success('Account created successfully!')
            navigate('/dashboard', { replace: true })
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4 py-10 transition-colors duration-300">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-[var(--primary)]">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                            <Zap size={16} className="text-white" />
                        </div>
                        CareerSprint
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold text-[var(--text)]">Create your account</h1>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Start tracking your internship applications</p>
                </div>

                {/* Form Card */}
                <div className="card p-6">
                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label className="label" htmlFor="name">Full name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Jane Doe"
                                    className="input-field pl-9"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

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
                                    placeholder="Min. 6 characters"
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

                        <div>
                            <label className="label" htmlFor="confirmPassword">Confirm password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Repeat password"
                                    className="input-field pl-9"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <>Create account <ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[var(--primary)] font-medium hover:underline">
                            Sign in
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
