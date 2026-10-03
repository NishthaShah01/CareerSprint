import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4 transition-colors duration-300">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200 dark:border-rose-800">
                    <AlertCircle size={30} className="text-rose-500" />
                </div>
                <h1 className="text-6xl font-extrabold text-[var(--text)] mb-3">404</h1>
                <h2 className="text-xl font-semibold text-[var(--text)] mb-2">Page not found</h2>
                <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/" className="btn-primary gap-2 justify-center">
                        <ArrowLeft size={15} /> Back to Home
                    </Link>
                    <Link to="/dashboard" className="btn-secondary justify-center">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
