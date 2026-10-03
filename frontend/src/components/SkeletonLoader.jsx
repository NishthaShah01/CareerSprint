import React from 'react'

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-4 h-24 bg-[var(--card-hover)] flex flex-col justify-between border border-[var(--border)]">
                        <div className="h-3 w-16 bg-[var(--border)] rounded" />
                        <div className="h-6 w-10 bg-[var(--border)] rounded" />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5 h-72 bg-[var(--card-hover)] flex flex-col justify-between border border-[var(--border)]">
                    <div className="h-4 w-40 bg-[var(--border)] rounded mb-4" />
                    <div className="flex-1 bg-[var(--border)]/50 rounded-xl" />
                </div>
                <div className="card p-5 h-72 bg-[var(--card-hover)] flex flex-col justify-between border border-[var(--border)]">
                    <div className="h-4 w-40 bg-[var(--border)] rounded mb-4" />
                    <div className="flex-1 bg-[var(--border)]/50 rounded-xl" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="card p-5 space-y-4 border border-[var(--border)]">
                <div className="h-4 w-36 bg-[var(--border)] rounded" />
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-10 bg-[var(--card-hover)] rounded flex items-center justify-between px-4">
                            <div className="h-3 w-28 bg-[var(--border)] rounded" />
                            <div className="h-3 w-16 bg-[var(--border)] rounded" />
                            <div className="h-3 w-20 bg-[var(--border)] rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="card p-4 animate-pulse space-y-4 border border-[var(--border)]">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="h-12 bg-[var(--card-hover)] rounded-lg flex items-center justify-between px-4">
                    <div className="space-y-1">
                        <div className="h-3.5 w-32 bg-[var(--border)] rounded" />
                        <div className="h-2.5 w-20 bg-[var(--border)] rounded" />
                    </div>
                    <div className="h-5 w-16 bg-[var(--border)] rounded-full" />
                    <div className="h-3 w-24 bg-[var(--border)] rounded hidden md:block" />
                    <div className="h-4 w-12 bg-[var(--border)] rounded" />
                </div>
            ))}
        </div>
    )
}
