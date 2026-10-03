import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Plus, Trash2, Calendar, FileText, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const PRESET_STAGES = [
    'Applied',
    'OA Scheduled',
    'OA Completed',
    'Interview Round 1',
    'Interview Round 2',
    'HR Interview',
    'Offer',
    'Rejected',
]

export default function InterviewTimeline({ timeline = [], onSaveTimeline }) {
    const [stages, setStages] = useState(timeline)
    const [newStageName, setNewStageName] = useState('')
    const [adding, setAdding] = useState(false)

    const handleToggleStage = (index) => {
        const updated = stages.map((item, i) => {
            if (i === index) {
                return { ...item, completed: !item.completed, date: item.date || new Date().toISOString() }
            }
            return item
        })
        setStages(updated)
        onSaveTimeline(updated)
        toast.success('Timeline updated')
    }

    const handleNoteChange = (index, notes) => {
        const updated = stages.map((item, i) => (i === index ? { ...item, notes } : item))
        setStages(updated)
    }

    const handleDateChange = (index, date) => {
        const updated = stages.map((item, i) => (i === index ? { ...item, date } : item))
        setStages(updated)
        onSaveTimeline(updated)
    }

    const handleAddStage = () => {
        if (!newStageName.trim()) return
        const updated = [
            ...stages,
            { stage: newStageName.trim(), completed: false, notes: '', date: new Date().toISOString() },
        ]
        setStages(updated)
        setNewStageName('')
        setAdding(false)
        onSaveTimeline(updated)
        toast.success('Stage added to timeline')
    }

    const handleDeleteStage = (index) => {
        const updated = stages.filter((_, i) => i !== index)
        setStages(updated)
        onSaveTimeline(updated)
        toast.success('Stage removed')
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Set date'
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                    <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
                        <Clock size={18} className="text-[var(--primary)]" />
                        Interview Timeline
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">Track application milestones and interview progress</p>
                </div>
                <button
                    onClick={() => setAdding(v => !v)}
                    className="btn-secondary py-1 px-2.5 text-xs gap-1"
                >
                    <Plus size={13} /> Add Stage
                </button>
            </div>

            {/* Add Custom Stage Bar */}
            {adding && (
                <div className="flex items-center gap-2 p-3 bg-[var(--card-hover)] rounded-lg border border-[var(--border)] animate-in">
                    <select
                        className="input-field py-1 text-xs"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                    >
                        <option value="">Select or type stage</option>
                        {PRESET_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Custom stage name..."
                        className="input-field py-1 text-xs"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                    />
                    <button onClick={handleAddStage} className="btn-primary py-1 px-3 text-xs shrink-0">
                        Add
                    </button>
                </div>
            )}

            {/* Timeline Vertical List */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                {stages.map((item, index) => {
                    const isCompleted = item.completed
                    return (
                        <div key={index} className="relative group">
                            {/* Icon Indicator */}
                            <button
                                onClick={() => handleToggleStage(index)}
                                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]'
                                }`}
                                title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                            >
                                {isCompleted ? <Check size={12} /> : <Circle size={10} />}
                            </button>

                            {/* Stage Details */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${isCompleted ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                                            {item.stage}
                                        </span>
                                        {isCompleted && (
                                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                Completed
                                            </span>
                                        )}
                                    </div>

                                    {/* Date display & input */}
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                                        <Calendar size={12} />
                                        {item.date ? (
                                            <input
                                                type="date"
                                                value={new Date(item.date).toISOString().split('T')[0]}
                                                onChange={(e) => handleDateChange(index, e.target.value)}
                                                className="bg-transparent text-xs text-[var(--text-muted)] hover:text-[var(--text)] border-none p-0 focus:ring-0 cursor-pointer font-medium"
                                            />
                                        ) : (
                                            <span className="text-xs text-[var(--text-muted)] italic font-normal">
                                                Pending / Not scheduled
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteStage(index)}
                                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 p-1 rounded transition-opacity self-start sm:self-auto"
                                    title="Delete stage"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            {/* Optional Stage Notes */}
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Add notes for this stage..."
                                    value={item.notes || ''}
                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                    onBlur={() => onSaveTimeline(stages)}
                                    className="w-full text-xs bg-[var(--card-hover)] text-[var(--text)] border border-[var(--border)] rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] placeholder-[var(--text-muted)]"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
