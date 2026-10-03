import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

export default function ConfirmModal({
    isOpen,
    title = 'Delete Application?',
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-[var(--modal-overlay)] backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card max-w-sm w-full p-6 space-y-4 animate-in border border-[var(--border)] shadow-xl">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">{message}</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex-1 justify-center flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 size={15} className="animate-spin" /> Deleting...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="btn-secondary flex-1 justify-center disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    )
}
