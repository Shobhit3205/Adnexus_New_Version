import axios from 'axios'
 
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000'
})
 
// Campaign APIs
export const createCampaign = (data) => API.post('/api/campaigns/', data)
export const getCampaigns = () => API.get('/api/campaigns/')
export const getCampaign = (id) => API.get(`/api/campaigns/${id}`)
export const updateCampaign = (id, data) => API.put(`/api/campaigns/${id}`, data)
export const deleteCampaign = (id) => API.delete(`/api/campaigns/${id}`)
export const getCampaignDetail = (id) => API.get(`/api/campaigns/${id}/detail`)
export const getCampaignStats = (id) => API.get(`/api/campaigns/${id}/stats`)  // ← naya
 
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
