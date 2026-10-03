import { useState, useEffect } from 'react'
import { FileText, Save, Clock, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplicationNotes({ notes = '', notesLastEditedAt = null, onSaveNotes }) {
    const [text, setText] = useState(notes)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(notesLastEditedAt)

    useEffect(() => {
        setText(notes)
        setLastSaved(notesLastEditedAt)
    }, [notes, notesLastEditedAt])

    const handleSave = async () => {
        if (text === notes) return // No changes

        setSaving(true)
        try {
            await onSaveNotes(text)
            const now = new Date()
            setLastSaved(now)
            toast.success('Notes saved')
        } catch (err) {
            toast.error('Failed to save notes')
        } finally {
            setSaving(false)
        }
    }

    const formatLastSaved = (dateStr) => {
        if (!dateStr) return 'Not edited yet'
        const date = new Date(dateStr)
        return `Last saved ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    }

    return (
        <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[var(--primary)]" />
                    <h3 className="text-base font-semibold text-[var(--text)]">Notes & Journal</h3>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || text === notes}
                    className="btn-primary py-1 px-3 text-xs gap-1 disabled:opacity-50"
                >
                    {saving ? (
                        <span className="flex items-center gap-1">Saving...</span>
                    ) : text === notes ? (
                        <span className="flex items-center gap-1 text-emerald-100"><Check size={12} /> Saved</span>
                    ) : (
                        <span className="flex items-center gap-1"><Save size={12} /> Save Notes</span>
                    )}
                </button>
            </div>

            <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave}
                placeholder="Write interview preparation notes, recruiter contacts, questions asked, or follow-up details..."
                className="input-field resize-y font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatLastSaved(lastSaved)}
                </span>
                <span>Auto-saves on blur</span>
            </div>
        </div>
    )
}
