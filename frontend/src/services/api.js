import axios from 'axios'

const defaultBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

const api = axios.create({
    baseURL: defaultBaseUrl,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request if present
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('cs_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for session cleanup on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('cs_token')
        }
        return Promise.reject(error)
    }
)

export default api
