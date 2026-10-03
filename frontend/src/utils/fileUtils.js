/**
 * Utility to format file URLs (resumes, offer letters, attachments)
 * Converts relative paths like '/uploads/resume.pdf' to absolute backend URLs.
 */
export const getFileUrl = (url) => {
    if (!url || typeof url !== 'string') return ''

    // Return untouched if already absolute (http://, https://, blob:, data:)
    if (/^(https?:\/\/|blob:|data:)/i.test(url)) {
        return url
    }

    const cleanPath = url.startsWith('/') ? url : `/${url}`
    // If backend host is specified in env, use it, otherwise default to http://localhost:5000
    const backendHost = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    return `${backendHost}${cleanPath}`
}
