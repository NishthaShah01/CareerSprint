import React from 'react'

export default function DashboardCard({ label, count, icon: Icon, colorClass, borderClass }) {
    return (
        <div
            className={`card p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:border-gray-700 ${borderClass || ''}`}
        >
            <div className="text-[11px] sm:text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider truncate" title={label}>{label}</div>
            <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[var(--text)]">{count || 0}</span>
                {Icon && (
                    <div className={`p-2 rounded-lg ${colorClass || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        <Icon size={16} />
                    </div>
                )}
            </div>
        </div>
    )
}
