import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem('cs_token') || null)
    const [loading, setLoading] = useState(true)

    // On mount, rehydrate user from token
    useEffect(() => {
        const restore = async () => {
            if (!token) {
                setLoading(false)
                return
            }
            try {
                const { data } = await api.get('/auth/me')
                if (data.success) setUser(data.user)
            } catch {
                // Token expired or invalid — clear it
                localStorage.removeItem('cs_token')
                setToken(null)
            } finally {
                setLoading(false)
            }
        }
        restore()
    }, [token])

    const saveSession = (tokenValue, userData) => {
        localStorage.setItem('cs_token', tokenValue)
        setToken(tokenValue)
        setUser(userData)
    }

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password })
        saveSession(data.token, data.user)
        return data
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        saveSession(data.token, data.user)
        return data
    }

    const updateProfile = async (profileData) => {
        const { data } = await api.put('/auth/profile', profileData)
        if (data.success && data.user) {
            setUser(data.user)
        }
        return data
    }

    const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
        const { data } = await api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword })
        return data
    }

    const logout = () => {
        localStorage.removeItem('cs_token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateProfile, changePassword }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
