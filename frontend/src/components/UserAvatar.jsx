import { getFileUrl } from '../utils/fileUtils'

export default function UserAvatar({ user, name, avatarUrl, size = 'md', className = '' }) {
    const targetName = name || user?.name || ''
    const targetAvatar = avatarUrl || user?.avatarUrl || ''

    const getInitials = (str) => {
        if (!str) return 'U'
        const parts = str.trim().split(/\s+/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return str.substring(0, 2).toUpperCase()
    }

    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
    }

    const dimensions = sizeClasses[size] || sizeClasses.md

    if (targetAvatar) {
        return (
            <img
                src={getFileUrl(targetAvatar)}
                alt={targetName || 'User Avatar'}
                className={`${dimensions} rounded-full object-cover border border-[var(--border)] shadow-xs shrink-0 ${className}`}
            />
        )
    }

    const initials = getInitials(targetName)

    return (
        <div
            className={`${dimensions} rounded-full bg-primary-100 dark:bg-primary-950/80 text-[var(--primary)] font-bold flex items-center justify-center border border-primary-200 dark:border-primary-800 shadow-xs shrink-0 ${className}`}
            title={targetName}
        >
            {initials}
        </div>
    )
}
