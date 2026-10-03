import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3500) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function Toast({ toast, onClose }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setShow(true))
    }, [])

    const isSuccess = toast.type === 'success'

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                } ${isSuccess
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
        >
            {isSuccess ? <CheckCircle size={16} className="shrink-0 text-green-600" /> : <XCircle size={16} className="shrink-0 text-red-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={onClose} className="ml-2 p-0.5 rounded hover:bg-black/5 transition-colors">
                <X size={14} />
            </button>
        </div>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}
