import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ══════════════════════════════════════════════════════════════
// Token key matches AuthContext.jsx exactly: "adnexus_token".
// axios.defaults.headers.common['Authorization'] is already set
// globally by AuthContext after login, but we also read the raw
// token here for the plain fetch() calls below.
// ══════════════════════════════════════════════════════════════
const API_BASE = 'http://127.0.0.1:8000/api'

const authHeaders = () => {
  const token = localStorage.getItem('adnexus_token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// Icon + accent color per stat card — purely visual, keyed off the same
// overview fields the API already returns. No new data required.
const STAT_META = {
  total_users: { label: 'Total Users', bg: '#EEF2FF', fg: '#4F46E5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  total_campaigns: { label: 'Total Campaigns', bg: '#F3E8FF', fg: '#9333EA', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
  )},
  active_campaigns: { label: 'Active Campaigns', bg: '#DCFCE7', fg: '#16A34A', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  )},
  total_leads: { label: 'Total Leads', bg: '#FFEDD5', fg: '#EA580C', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
  )},
  total_budget_spent: { label: 'Budget Spent', bg: '#FEE2E2', fg: '#DC2626', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg>
  )},
}

const initials = (name = '') => name.trim().charAt(0).toUpperCase() || '?'

const PaginationBar = ({ activeRows, page, setPage, totalPages, pageNumbers, PAGE_SIZE, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '10px' }}>
    <span style={{ fontSize: '12px', color: '#6B7280' }}>
      Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, activeRows.length)} of {activeRows.length} {label}
    </span>
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: page === 1 ? '#D1D5DB' : '#374151', cursor: page === 1 ? 'default' : 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
      >‹</button>
      {pageNumbers.map(p => (
        <button
          key={p}
          onClick={() => setPage(p)}
          style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid ' + (p === page ? '#1A73E8' : '#E5E7EB'), background: p === page ? '#1A73E8' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit' }}
        >{p}</button>
      ))}
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: page === totalPages ? '#D1D5DB' : '#374151', cursor: page === totalPages ? 'default' : 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
      >›</button>
    </div>
  </div>
)

const AVATAR_COLORS = ['#EEF2FF', '#F3E8FF', '#DCFCE7', '#FFEDD5', '#FEE2E2', '#E0F2FE']
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0]

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState('users')
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => { fetchOverview() }, [])
  useEffect(() => { setPage(1) }, [tab])
  useEffect(() => {
    if (tab === 'users') fetchUsers()
    if (tab === 'campaigns') fetchCampaigns()
    if (tab === 'leads') fetchLeads()
  }, [tab])

  const handleAuthError = (status) => {
    if (status === 403) {
      setError('Access denied — this account is not an admin.')
    } else if (status === 401) {
      setError('Session expired. Please log in again.')
      navigate('/login')
    } else {
      setError('Something went wrong fetching admin data.')
    }
  }

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, { headers: authHeaders() })
      if (!res.ok) return handleAuthError(res.status)
      setOverview(await res.json())
    } catch (e) { setError('Could not reach server.') }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() })
      if (!res.ok) return handleAuthError(res.status)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) { setError('Could not reach server.') } finally { setLoading(false) }
  }

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns`, { headers: authHeaders() })
      if (!res.ok) return handleAuthError(res.status)
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (e) { setError('Could not reach server.') } finally { setLoading(false) }
  }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/leads`, { headers: authHeaders() })
      if (!res.ok) return handleAuthError(res.status)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (e) { setError('Could not reach server.') } finally { setLoading(false) }
  }

  const openUserDetail = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, { headers: authHeaders() })
      if (!res.ok) return handleAuthError(res.status)
      setSelectedUser(await res.json())
    } catch (e) { setError('Could not load user detail.') }
  }

  const openCampaignDetail = async (campaignId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}`, { headers: authHeaders() })
      if (!res.ok) return handleAuthError(res.status)
      setSelectedCampaign(await res.json())
    } catch (e) { setError('Could not load campaign detail.') }
  }

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'inherit' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚫</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#DC2626' }}>{error}</div>
      </div>
    )
  }

  const activeRows = tab === 'users' ? users : tab === 'campaigns' ? campaigns : leads
  const totalPages = Math.max(1, Math.ceil(activeRows.length / PAGE_SIZE))
  const pagedRows = activeRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageWindowStart = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => pageWindowStart + i).filter(n => n >= 1 && n <= totalPages)

  return (
    <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', marginBottom: '16px',
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px',
            fontSize: '13px', fontWeight: '600', color: '#374151',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '4px', letterSpacing: '-0.02em' }}>Admin Dashboard</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>All users, campaigns, and leads across AdNexus.</p>

        {/* ── Overview cards ── */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {[
              { key: 'total_users', value: overview.total_users },
              { key: 'total_campaigns', value: overview.total_campaigns },
              { key: 'active_campaigns', value: overview.active_campaigns },
              { key: 'total_leads', value: overview.total_leads },
              { key: 'total_budget_spent', value: `₹${Number(overview.total_budget_spent || 0).toLocaleString()}` },
            ].map((card) => {
              const meta = STAT_META[card.key]
              return (
                <div key={card.key} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: meta.bg, color: meta.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {meta.icon}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>{meta.label}</div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{card.value}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '0', borderBottom: '1px solid #E5E7EB', background: '#fff', borderRadius: '14px 14px 0 0', padding: '4px 16px 0' }}>
          {[
            { id: 'users', label: 'Users' },
            { id: 'campaigns', label: 'Campaigns' },
            { id: 'leads', label: 'Leads' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit',
                color: tab === t.id ? '#1A73E8' : '#6B7280',
                borderBottom: tab === t.id ? '2.5px solid #1A73E8' : '2.5px solid transparent',
                marginBottom: '-1px',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderTop: 'none', padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            Loading...
          </div>
        )}

        {/* ── Users table ── */}
        {!loading && tab === 'users' && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFF', textAlign: 'left' }}>
                  {['Name', 'Email', 'Provider', 'Verified', 'Campaigns', 'Budget Spent', 'Joined', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: avatarColor(u.name), color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                          {initials(u.name)}
                        </div>
                        <span style={{ fontWeight: '600', color: '#111827' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>{u.auth_provider}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: u.is_verified ? '#D1FAE5' : '#FEE2E2', color: u.is_verified ? '#065F46' : '#991B1B' }}>
                        {u.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{u.campaign_count}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>₹{Number(u.total_budget_spent || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => openUserDetail(u.id)} style={{ fontSize: '12px', color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No users yet.</div>}
            {activeRows.length > 0 && <PaginationBar activeRows={activeRows} page={page} setPage={setPage} totalPages={totalPages} pageNumbers={pageNumbers} PAGE_SIZE={PAGE_SIZE} label="users" />}
          </div>
        )}

        {/* ── Campaigns table ── */}
        {!loading && tab === 'campaigns' && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFF', textAlign: 'left' }}>
                  {['Campaign', 'Owner', 'Goal', 'Industry', 'Status', 'Budget', 'Spent', 'Created', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map(c => (
                  <tr key={c.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{c.name}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{c.owner_name}<br /><span style={{ fontSize: '11px', color: '#9CA3AF' }}>{c.owner_email}</span></td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{c.goal}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{c.industry}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: c.status === 'active' ? '#D1FAE5' : '#F3F4F6', color: c.status === 'active' ? '#065F46' : '#6B7280' }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>₹{Number(c.budget || 0).toLocaleString()}/day</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>₹{Number(c.budget_spent || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => openCampaignDetail(c.id)} style={{ fontSize: '12px', color: '#1A73E8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No campaigns yet.</div>}
            {activeRows.length > 0 && <PaginationBar activeRows={activeRows} page={page} setPage={setPage} totalPages={totalPages} pageNumbers={pageNumbers} PAGE_SIZE={PAGE_SIZE} label="campaigns" />}
          </div>
        )}

        {/* ── Leads table ── */}
        {!loading && tab === 'leads' && (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFF', textAlign: 'left' }}>
                  {['Name', 'Phone', 'Email', 'Campaign', 'Platform', 'Quality', 'Received'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map(l => (
                  <tr key={l.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{l.full_name}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{l.phone}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{l.email}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{l.campaign_name}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{l.platform}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{l.quality_score}</td>
                    <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No leads yet.</div>}
            {activeRows.length > 0 && <PaginationBar activeRows={activeRows} page={page} setPage={setPage} totalPages={totalPages} pageNumbers={pageNumbers} PAGE_SIZE={PAGE_SIZE} label="leads" />}
          </div>
        )}

        {/* ── User detail modal ── */}
        {selectedUser && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}
            onClick={() => setSelectedUser(null)}>
            <div style={{ background: '#fff', borderRadius: '20px', width: '640px', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}>

              {/* Header banner */}
              <div style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #4F46E5 100%)', padding: '24px 28px', position: 'relative' }}>
                <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', fontSize: '15px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '19px' }}>
                    {initials(selectedUser.user.name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '19px', fontWeight: '800', color: '#fff' }}>{selectedUser.user.name}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 9px', borderRadius: '20px', background: selectedUser.user.is_verified ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', color: selectedUser.user.is_verified ? '#065F46' : '#fff' }}>
                        {selectedUser.user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{selectedUser.user.email}</div>
                  </div>
                </div>
              </div>

              {/* Stat strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #F0F1F3' }}>
                <div style={{ padding: '14px 20px', borderRight: '1px solid #F0F1F3' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>Campaigns</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{selectedUser.campaigns.length}</div>
                </div>
                <div style={{ padding: '14px 20px', borderRight: '1px solid #F0F1F3' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>Total Spent</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    ₹{selectedUser.campaigns.reduce((s, c) => s + Number(c.budget_spent || 0), 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>Total Leads</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    {selectedUser.campaigns.reduce((s, c) => s + Number(c.leads_count || 0), 0)}
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ padding: '20px 28px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Campaigns ({selectedUser.campaigns.length})</div>
                </div>
                {selectedUser.campaigns.map(c => (
                  <div key={c.id}
                    onClick={() => { setSelectedUser(null); openCampaignDetail(c.id) }}
                    style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '13px 14px', marginBottom: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: c.status === 'active' ? '#D1FAE5' : '#F3F4F6', color: c.status === 'active' ? '#065F46' : '#6B7280' }}>{c.status}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: c.ad_contents.length > 0 ? '6px' : '0' }}>
                      {c.goal} · {c.industry} · ₹{Number(c.budget_spent || 0).toLocaleString()} spent · {c.leads_count} leads
                    </div>
                    {c.ad_contents.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {c.ad_contents.length} ad creative{c.ad_contents.length > 1 ? 's' : ''} · avg score {(
                          c.ad_contents.reduce((s, ac) => s + (ac.creative_score || 0), 0) / c.ad_contents.length
                        ).toFixed(0)}/100
                      </div>
                    )}
                  </div>
                ))}
                {selectedUser.campaigns.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px', background: '#F9FAFB', borderRadius: '12px' }}>No campaigns created yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Campaign detail modal ── */}
        {selectedCampaign && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}
            onClick={() => setSelectedCampaign(null)}>
            <div style={{ background: '#fff', borderRadius: '20px', width: '640px', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}>

              {/* Header banner */}
              <div style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #4F46E5 100%)', padding: '24px 28px', position: 'relative' }}>
                <button onClick={() => setSelectedCampaign(null)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', fontSize: '15px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: selectedCampaign.campaign.status === 'active' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', color: selectedCampaign.campaign.status === 'active' ? '#065F46' : '#fff', textTransform: 'capitalize' }}>
                    {selectedCampaign.campaign.status}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>{selectedCampaign.campaign.goal}</span>
                </div>
                <div style={{ fontSize: '21px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{selectedCampaign.campaign.name}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
                  {selectedCampaign.campaign.owner_name} · {selectedCampaign.campaign.owner_email}
                </div>
              </div>

              {/* Stat strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #F0F1F3' }}>
                <div style={{ padding: '14px 20px', borderRight: '1px solid #F0F1F3' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>Industry</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{selectedCampaign.campaign.industry}</div>
                </div>
                <div style={{ padding: '14px 20px', borderRight: '1px solid #F0F1F3' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>Budget / day</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>₹{Number(selectedCampaign.campaign.budget || 0).toLocaleString()}</div>
                </div>
                <div style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>Spent</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>₹{Number(selectedCampaign.campaign.budget_spent || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ padding: '20px 28px', overflowY: 'auto' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Leads ({selectedCampaign.leads.length})</div>
                </div>
                {selectedCampaign.leads.map(l => (
                  <div key={l.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '13px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827', marginBottom: '3px' }}>{l.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{l.phone} · {l.email}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '3px' }}>{l.platform}</div>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#EEF2FF', color: '#4F46E5' }}>Q {l.quality_score}</span>
                    </div>
                  </div>
                ))}
                {selectedCampaign.leads.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '8px' }}>No leads yet.</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '22px 0 12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Ad Creatives ({selectedCampaign.ad_contents.length})</div>
                </div>
                {selectedCampaign.ad_contents.map(ac => (
                  <div key={ac.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '13px 14px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>{ac.headline || ac.description || 'Ad creative'}</div>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#DCFCE7', color: '#16A34A', flexShrink: 0 }}>{ac.creative_score ?? '—'}/100</span>
                  </div>
                ))}
                {selectedCampaign.ad_contents.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px', background: '#F9FAFB', borderRadius: '12px' }}>No ad creatives yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard