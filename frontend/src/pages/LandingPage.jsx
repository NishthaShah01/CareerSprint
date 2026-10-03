import { Link } from 'react-router-dom'
import {
    BarChart2,
    CalendarCheck,
    CheckSquare,
    TrendingUp,
    ArrowRight,
    ChevronRight,
} from 'lucide-react'
import PublicLayout from '../layouts/PublicLayout'

const features = [
    {
        icon: CheckSquare,
        title: 'Application Tracking',
        description:
            'Organize every internship application in one place. Track status, deadlines, and next steps at a glance.',
    },
    {
        icon: CalendarCheck,
        title: 'Interview Management',
        description:
            'Log interview rounds, dates, and outcomes. Never miss a scheduled interview again.',
    },
    {
        icon: BarChart2,
        title: 'Preparation Progress',
        description:
            'Track your preparation for each role — from resume reviews to coding practice and research notes.',
    },
    {
        icon: TrendingUp,
        title: 'Analytics Dashboard',
        description:
            'Visualize your application journey with clear charts showing response rates and pipeline health.',
    },
]

export default function LandingPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                        Built for students, by students
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
                        CareerSprint
                    </h1>
                    <p className="text-xl sm:text-2xl font-medium text-primary-600 mb-4">
                        Track every application. Prepare smarter. Land your dream internship.
                    </p>
                    <p className="text-base text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
                        CareerSprint helps students organize their internship applications, monitor progress across
                        every stage, and stay on top of interview prep — all in one clean dashboard.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link to="/register" className="btn-primary text-base px-6 py-3 gap-2">
                            Get Started <ArrowRight size={16} />
                        </Link>
                        <a href="#features" className="btn-secondary text-base px-6 py-3">
                            View Features
                        </a>
                    </div>

                    {/* Stats row */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-10 text-center">
                        {[
                            { value: '100%', label: 'Free to use' },
                            { value: '1 dashboard', label: 'Everything in one place' },
                            { value: 'Zero clutter', label: 'Focused & minimal' },
                        ].map(stat => (
                            <div key={stat.label}>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-12">
                        <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-2">
                            Features
                        </p>
                        <h2 className="text-3xl font-bold text-gray-900">Everything you need to stay organized</h2>
                        <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
                            Stop losing track of applications in spreadsheets. CareerSprint gives you a structured,
                            clear workspace to manage your entire internship hunt.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(feature => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={feature.title}
                                    className="card p-6 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                                        <Icon size={20} className="text-primary-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* About / CTA Section */}
            <section id="about" className="bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to take control of your job search?
                    </h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                        Join students who use CareerSprint to stay organized, track progress, and land the
                        internships they want.
                    </p>
                    <Link to="/register" className="btn-primary text-base px-6 py-3 gap-2 inline-flex">
                        Create your free account <ChevronRight size={16} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    )
}
