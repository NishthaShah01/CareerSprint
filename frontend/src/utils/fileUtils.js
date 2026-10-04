/**
 * Utility to format file URLs (resumes, offer letters, attachments)
 * Converts relative paths like '/uploads/resume.pdf' to absolute backend URLs in dev,
 * or serves relative paths when deployed on Vercel single-domain.
 */
export const getFileUrl = (url) => {
    if (!url || typeof url !== 'string') return ''

    // Return untouched if already absolute (http://, https://, blob:, data:)
    if (/^(https?:\/\/|blob:|data:)/i.test(url)) {
        return url
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`
    if (import.meta.env.VITE_BACKEND_URL) {
        return `${import.meta.env.VITE_BACKEND_URL}${cleanPath}`
    }
    if (import.meta.env.DEV) {
        return `http://localhost:5000${cleanPath}`
    }
    // Production Vercel single-domain default
    return cleanPath
}
