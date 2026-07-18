import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000'
})

// ── Auto-attach token to every request ──
// Har request jaane se pehle localStorage se token nikaal ke
// Authorization header mein daal deta hai. Isse har API function
// mein alag se token pass karne ki zaroorat nahi padti.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adnexus_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Campaign APIs
export const createCampaign = (data) => API.post('/api/campaigns/', data)
export const getCampaigns = () => API.get('/api/campaigns/')
export const getCampaign = (id) => API.get(`/api/campaigns/${id}`)
export const updateCampaign = (id, data) => API.put(`/api/campaigns/${id}`, data)
export const deleteCampaign = (id) => API.delete(`/api/campaigns/${id}`)
export const getCampaignDetail = (id) => API.get(`/api/campaigns/${id}/detail`)
export const getCampaignStats = (id) => API.get(`/api/campaigns/${id}/stats`)  // ← naya
export const updateMe = (data) => API.patch('/api/auth/me', data)
export const changePassword = (data) => API.patch('/api/auth/me/password', data)

// Ad Content APIs
export const createAdContent = (campaignId, data) =>
  API.post(`/api/campaigns/${campaignId}/ad-content`, data)
export const getAdContents = (campaignId) =>
  API.get(`/api/campaigns/${campaignId}/ad-content`)

// Leads APIs
export const createLead = (data) => API.post('/api/leads/', data)
export const getLeads = () => API.get('/api/leads/')
export const getCampaignLeads = (campaignId) => API.get(`/api/leads/campaign/${campaignId}`)
export const updateLeadStatus = (id, data) => API.put(`/api/leads/${id}`, data)
export const deleteLead = (id) => API.delete(`/api/leads/${id}`)
// ════════════════════════════════════════════════════
// AUTH FUNCTIONS
// ════════════════════════════════════════════════════

export const signup = (data) => API.post('/api/auth/signup', data)

export const verifyOtp = (data) => API.post('/api/auth/verify-otp', data)

export const resendOtp = (data) => API.post('/api/auth/resend-otp', data)

export const login = (data) => API.post('/api/auth/login', data)

export const googleLogin = (data) => API.post('/api/auth/google', data)

export const getMe = (token) =>
  API.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })


export const uploadPhoto = (formData) => {
  return api.post('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}