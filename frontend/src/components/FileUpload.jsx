import { useState } from 'react'
import { UploadCloud, FileText, Trash2, ExternalLink, Download, Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getFileUrl } from '../utils/fileUtils'

export default function FileUpload({
    label = 'File',
    value = '',
    filename = '',
    filesize = '',
    onChange,
    accept = '.pdf,.docx,.doc,.png,.jpg,.jpeg',
    isResume = false,
}) {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [localSize, setLocalSize] = useState(filesize || '')

    // Defensive parsing: ensure fileUrl is strictly a string
    const rawUrl = typeof value === 'string' ? value : (value && typeof value === 'object' && value.url ? value.url : '')
    const fileUrl = getFileUrl(rawUrl)
    const displayName = filename || (typeof rawUrl === 'string' && rawUrl ? rawUrl.split('/').pop() : '')

    const formatBytes = (bytes) => {
        if (!bytes || isNaN(bytes)) return ''
        const kb = bytes / 1024
        if (kb < 1024) return `${Math.round(kb)} KB`
        return `${(kb / 1024).toFixed(1)} MB`
    }

    const handleFileChange = async (e) => {
        try {
            const file = e.target?.files?.[0]
            if (!file) return

            const ext = file.name ? file.name.split('.').pop().toLowerCase() : ''

            // Strict resume validation (PDF & DOCX only)
            if (isResume && !['pdf', 'docx'].includes(ext)) {
                toast.error('Invalid resume format. Only PDF and DOCX files are allowed.')
                if (e.target) e.target.value = ''
                return
            }

            // 10MB file limit
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB.')
                if (e.target) e.target.value = ''
                return
            }

            const formattedSize = formatBytes(file.size)
            setLocalSize(formattedSize)

            const formData = new FormData()
            formData.append('file', file)

            setUploading(true)
            setProgress(0)

            const queryParam = isResume ? '?type=resume' : ''
            const { data } = await api.post(`/upload${queryParam}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        setProgress(percent)
                    }
                },
            })

            if (data && data.success && data.url) {
                const uploadedName = data.filename || file.name || 'Uploaded Document'
                if (typeof onChange === 'function') {
                    onChange({ url: data.url, filename: uploadedName, size: formattedSize })
                }
                toast.success(`${label} uploaded!`)
            } else {
                toast.error(data?.message || `Failed to upload ${label.toLowerCase()}`)
            }
        } catch (err) {
            console.error('Upload Error:', err)
            const msg = err.response?.data?.message || err.message || `Failed to upload ${label.toLowerCase()}`
            toast.error(msg)
        } finally {
            setUploading(false)
            if (e.target) e.target.value = ''
        }
    }

    const handleRemove = () => {
        setLocalSize('')
        if (typeof onChange === 'function') {
            onChange({ url: '', filename: '', size: '' })
        }
        toast.success(`${label} deleted.`)
    }

    const inputId = `file-input-${label.replace(/\s+/g, '-').toLowerCase()}`
    const replaceId = `replace-file-${label.replace(/\s+/g, '-').toLowerCase()}`

    return (
        <div className="w-full">
            <label className="label mb-1.5 block font-medium">{label} <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
            {fileUrl ? (
                /* Card Layout */
                <div className="group relative flex flex-col p-4 bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] hover:border-[var(--primary)] rounded-xl transition-all duration-200 shadow-sm space-y-3">
                    {/* Header info row */}
                    <div className="flex items-start justify-between gap-3 overflow-hidden">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2.5 bg-primary-50 dark:bg-primary-950/60 text-[var(--primary)] rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                <FileText size={22} />
                            </div>
                            <div className="truncate min-w-0">
                                <p className="truncate text-[var(--text)] font-semibold text-sm leading-tight" title={displayName}>
                                    {displayName || `Uploaded ${label}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    {localSize && (
                                        <span className="text-[11px] text-[var(--text-muted)] font-medium">
                                            {localSize}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 size={11} /> Uploaded successfully
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Row - All inside card in 1 row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)] overflow-x-auto">
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary px-2.5 py-1.5 text-xs gap-1.5 flex-1 justify-center whitespace-nowrap hover:border-[var(--primary)] transition-colors"
                            title="View document"
                        >
                            <ExternalLink size={13} /> View
                        </a>

                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={displayName || 'document'}
                            className="btn-secondary px-2.5 py-1.5 text-xs gap-1.5 flex-1 justify-center whitespace-nowrap hover:border-[var(--primary)] transition-colors"
                            title="Download document"
                        >
                            <Download size={13} /> Download
                        </a>

                        <label
                            htmlFor={replaceId}
                            className="btn-secondary px-2.5 py-1.5 text-xs gap-1.5 flex-1 justify-center cursor-pointer whitespace-nowrap hover:border-[var(--primary)] transition-colors"
                            title="Replace document"
                        >
                            <RefreshCw size={13} /> Replace
                        </label>

                        <input
                            type="file"
                            accept={isResume ? '.pdf,.docx' : accept}
                            onChange={handleFileChange}
                            className="hidden"
                            id={replaceId}
                        />

                        <button
                            type="button"
                            onClick={handleRemove}
                            className="px-2.5 py-1.5 text-xs gap-1.5 flex-1 inline-flex items-center justify-center font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                            title="Delete document"
                        >
                            <Trash2 size={13} className="shrink-0" /> Delete
                        </button>
                    </div>
                </div>
            ) : (
                /* Upload State Container */
                <div className="relative">
                    <input
                        type="file"
                        accept={isResume ? '.pdf,.docx' : accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id={inputId}
                    />
                    <label
                        htmlFor={inputId}
                        className={`flex items-center justify-center gap-2.5 p-4 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card)] hover:bg-[var(--card-hover)] text-[var(--text-muted)] rounded-xl text-sm cursor-pointer transition-all duration-200 shadow-sm ${
                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2 font-medium text-xs">
                                <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                                Uploading {label}... {progress}%
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 font-medium text-xs">
                                <UploadCloud size={18} className="text-[var(--primary)] shrink-0" />
                                Upload {label} ({isResume ? 'PDF or DOCX only' : 'PDF, DOC, PNG'})
                            </span>
                        )}
                    </label>
                </div>
            )}
        </div>
    )
}
