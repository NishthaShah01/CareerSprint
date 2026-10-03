import api from './api'

export const getAdminStats = () => api.get('/admin/stats')

export const getAdminApplications = (params = {}) =>
    api.get('/admin/applications', { params })

export const getAdminApplicationById = (id) =>
    api.get(`/admin/applications/${id}`)

export const updateApplicationStatus = (id, payload) =>
    api.patch(`/admin/applications/${id}/status`, typeof payload === 'string' ? { status: payload } : payload)

export const getAdminCandidates = () => api.get('/admin/candidates')

export const getCandidateApplications = (candidateId) =>
    api.get(`/admin/candidates/${candidateId}/applications`)
