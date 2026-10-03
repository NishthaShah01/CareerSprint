import React from 'react'
import { Briefcase } from 'lucide-react'

export default function EmptyState({
    title = 'No applications found',
    description = 'Start tracking your career journey by adding your first application.',
    icon: Icon = Briefcase,
    actionButton = null,
    className = '',
}) {
    return (
        <div className={`card p-12 text-center flex flex-col items-center justify-center ${className}`}>
            <div className="w-14 h-14 bg-[var(--card-hover)] text-[var(--text-muted)] rounded-full flex items-center justify-center mb-4 border border-[var(--border)]">
                <Icon size={26} />
            </div>
            <h3 className="text-base font-semibold text-[var(--text)] mb-1">{title}</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">{description}</p>
            {actionButton}
        </div>
    )
}
