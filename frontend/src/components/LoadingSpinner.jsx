import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'Loading...', size = 20, className = '' }) {
    return (
        <div className={`flex items-center justify-center gap-2 text-gray-500 text-sm ${className}`}>
            <Loader2 size={size} className="animate-spin text-primary-600 shrink-0" />
            {text && <span>{text}</span>}
        </div>
    )
}
