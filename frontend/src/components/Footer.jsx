import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
                            <Zap size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-base text-primary-600">CareerSprint</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <a href="/#features" className="hover:text-primary-600 transition-colors">Features</a>
                        <a href="/#about" className="hover:text-primary-600 transition-colors">About</a>
                        <Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link>
                        <Link to="/register" className="hover:text-primary-600 transition-colors">Register</Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} CareerSprint. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
