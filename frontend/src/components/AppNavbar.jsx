import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Plus, UserCircle, LogOut, Menu, X, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'

import UserAvatar from './UserAvatar'

const navLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', to: '/applications', icon: Briefcase },
]

export default function AppNavbar() {
    const { logout, user } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully.')
        navigate('/login', { replace: true })
    }

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    const closeMenu = () => setMenuOpen(false)

    return (
        <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between px-4 sm:px-6 h-14 max-w-7xl mx-auto">
                {/* Logo */}
                <Link to="/dashboard" className="font-bold text-[var(--primary)] text-lg flex items-center gap-2" onClick={closeMenu}>
                    CareerSprint
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1 text-sm">
                    {navLinks.map(({ label, to, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                                isActive(to)
                                    ? 'bg-primary-50 text-[var(--primary)] dark:bg-primary-950/60 dark:text-primary-400 font-medium'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]'
                            }`}
                        >
                            <Icon size={14} />
                            {label}
                        </Link>
                    ))}

                    <Link
                        to="/profile"
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md transition-colors ${
                            isActive('/profile')
                                ? 'bg-primary-50 text-[var(--primary)] dark:bg-primary-950/60 dark:text-primary-400 font-medium'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]'
                        }`}
                        title="Profile & Settings"
                    >
                        <UserAvatar user={user} size="xs" />
                        <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">{user?.name || 'Profile'}</span>
                    </Link>

                    {/* Animated Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 ml-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] rounded-md transition-all duration-300 active:scale-90"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle Theme"
                    >
                        <div className="transition-transform duration-300 transform hover:rotate-12">
                            {theme === 'dark' ? (
                                <Sun size={17} className="text-amber-400 animate-in fade-in zoom-in-75 duration-200" />
                            ) : (
                                <Moon size={17} className="text-slate-600 animate-in fade-in zoom-in-75 duration-200" />
                            )}
                        </div>
                    </button>

                    <Link to="/applications/new" className="btn-primary px-3 py-1.5 text-xs gap-1.5 ml-1">
                        <Plus size={13} />
                        Add
                    </Link>

                    {/* Notification Bell */}
                    <NotificationBell />

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-md text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={14} />
                        <span className="hidden lg:inline">Logout</span>
                    </button>
                </nav>

                {/* Mobile Controls */}
                <div className="flex items-center gap-1 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-[var(--text-muted)] hover:bg-[var(--card-hover)] rounded-md transition-all duration-300 active:scale-90"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <Sun size={18} className="text-amber-400" />
                        ) : (
                            <Moon size={18} className="text-slate-600" />
                        )}
                    </button>
                    {/* Notification Bell (mobile) */}
                    <NotificationBell />
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="p-2 rounded-md text-[var(--text-muted)] hover:bg-[var(--card-hover)] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <nav className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-3 pt-2 space-y-1 animate-in">
                    {navLinks.map(({ label, to, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={closeMenu}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
                                isActive(to)
                                    ? 'bg-primary-50 text-[var(--primary)] dark:bg-primary-950/60 dark:text-primary-400 font-medium'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
                            }`}
                        >
                            <Icon size={15} />
                            {label}
                        </Link>
                    ))}
                    <Link
                        to="/profile"
                        onClick={closeMenu}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
                            isActive('/profile')
                                ? 'bg-primary-50 text-[var(--primary)] dark:bg-primary-950/60 dark:text-primary-400 font-medium'
                                : 'text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
                        }`}
                    >
                        <UserAvatar user={user} size="xs" />
                        Profile
                    </Link>
                    <Link
                        to="/applications/new"
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-[var(--primary)] font-medium hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                    >
                        <Plus size={15} />
                        Add Application
                    </Link>
                    <button
                        onClick={() => { closeMenu(); handleLogout() }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors w-full"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </nav>
            )}
        </header>
    )
}
