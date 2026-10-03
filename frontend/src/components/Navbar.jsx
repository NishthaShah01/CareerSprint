import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const publicNavLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'About', href: '/#about' },
]

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const isLanding = location.pathname === '/'

    const handleLogout = () => {
        logout()
        navigate('/', { replace: true })
    }

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-xl text-primary-600">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-white" />
                    </div>
                    CareerSprint
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {isLanding && !user && publicNavLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-150"
                        >
                            {link.label}
                        </a>
                    ))}
                    {user && (
                        <Link
                            to="/dashboard"
                            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-150 flex items-center gap-1.5"
                        >
                            <LayoutDashboard size={15} />
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-600 font-medium hidden sm:block">
                                {user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn-secondary text-sm px-3 py-2 gap-1.5"
                                title="Logout"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-150 hidden sm:inline-block"
                            >
                                Login
                            </Link>
                            <Link to="/register" className="btn-primary text-sm px-4 py-2">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
