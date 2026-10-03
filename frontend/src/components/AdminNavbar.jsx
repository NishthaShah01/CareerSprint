import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Users, LogOut, Menu, X, Sun, Moon, ShieldCheck, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ChangePasswordModal from './ChangePasswordModal'

const adminLinks = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Applications', to: '/admin/applications', icon: Briefcase },
    { label: 'Candidates', to: '/admin/candidates', icon: Users },
]

export default function AdminNavbar() {
    const { logout, user } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully.')
        navigate('/login', { replace: true })
    }

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')
    const closeDrawer = () => setDrawerOpen(false)

    return (
        <header className="bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-50 shadow-sm transition-colors duration-300 w-full min-w-0">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 max-w-7xl mx-auto w-full min-w-0">
                {/* Logo / Admin Badge */}
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 sm:gap-2 font-bold text-[var(--primary)] text-base sm:text-lg flex-shrink-0" onClick={closeDrawer}>
                    <ShieldCheck size={18} className="text-violet-500 flex-shrink-0" />
                    <span className="truncate max-w-[110px] sm:max-w-none">CareerSprint</span>
                    <span className="text-[10px] sm:text-xs font-medium bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">Admin</span>
                </Link>

                {/* Desktop nav (≥ 1024px) */}
                <nav className="hidden lg:flex items-center gap-1 text-sm">
                    {adminLinks.map(({ label, to, icon: Icon }) => (
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

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 ml-1 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] rounded-md transition-all duration-300 active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle Theme"
                    >
                        <div className="transition-transform duration-300 transform hover:rotate-12">
                            {theme === 'dark' ? (
                                <Sun size={17} className="text-amber-400" />
                            ) : (
                                <Moon size={17} className="text-slate-600" />
                            )}
                        </div>
                    </button>

                    <span className="text-xs text-[var(--text-muted)] ml-1 max-w-[120px] truncate">{user?.name}</span>

                    <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 ml-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors text-xs font-medium min-h-[44px]"
                        title="Change Password"
                    >
                        <KeyRound size={14} className="text-[var(--primary)]" />
                        <span>Password</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-md text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px]"
                        title="Logout"
                    >
                        <LogOut size={14} />
                        <span>Logout</span>
                    </button>
                </nav>

                {/* Mobile / Tablet controls (< 1024px) */}
                <div className="flex items-center gap-1 lg:hidden">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-[var(--text-muted)] hover:bg-[var(--card-hover)] rounded-md transition-all duration-300 active:scale-90 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <Sun size={18} className="text-amber-400" />
                        ) : (
                            <Moon size={18} className="text-slate-600" />
                        )}
                    </button>

                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-2 rounded-md text-[var(--text-muted)] hover:bg-[var(--card-hover)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Open Navigation Drawer"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* Left Slide-over Drawer Backdrop & Panel (< 1024px) */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={closeDrawer}
                    />

                    {/* Left Drawer Panel */}
                    <div className="relative w-4/5 max-w-xs bg-[var(--surface)] border-r border-[var(--border)] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border)]">
                            <div className="flex items-center gap-2 font-bold text-[var(--primary)] text-base">
                                <ShieldCheck size={18} className="text-violet-500" />
                                <span>CareerSprint</span>
                                <span className="text-[10px] font-medium bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full">Admin</span>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-2 text-[var(--text-muted)] hover:bg-[var(--card-hover)] rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                aria-label="Close Drawer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {adminLinks.map(({ label, to, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={closeDrawer}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                                        isActive(to)
                                            ? 'bg-primary-50 text-[var(--primary)] dark:bg-primary-950/60 dark:text-primary-400 font-semibold'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </Link>
                            ))}
                        </div>

                        {/* Drawer Footer (User Info & Password & Logout) */}
                        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-2">
                            {user && (
                                <div className="text-xs mb-2">
                                    <p className="font-semibold text-[var(--text)] truncate">{user.name}</p>
                                    <p className="text-[var(--text-muted)] truncate">{user.email}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { closeDrawer(); setPasswordModalOpen(true) }}
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors w-full min-h-[40px]"
                            >
                                <KeyRound size={14} className="text-[var(--primary)]" />
                                Change Password
                            </button>
                            <button
                                onClick={() => { closeDrawer(); handleLogout() }}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors w-full min-h-[44px]"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ChangePasswordModal
                isOpen={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </header>
    )
}
