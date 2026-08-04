import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeads, getCampaigns, updateLeadStatus, deleteLead } from '../services/api'

const platforms = [
  { id: 1, name: 'Google Ads',  color: '#1A73E8', icon: 'G'  },
  { id: 2, name: 'LinkedIn',    color: '#0A66C2', icon: 'in' },
  { id: 3, name: 'Facebook',    color: '#1877F2', icon: 'f'  },
  { id: 4, name: 'Instagram',   color: '#E1306C', icon: 'ig' },
]

// ── CRM lead statuses (backed by /api/leads/{id} via updateLeadStatus) ──
const crmStatusOptions = ['new', 'contacted', 'meeting_set', 'converted', 'lost']

const crmStatusStyles = {
  new:         { background: '#EFF6FF', color: '#1d4ed8', border: '0.5px solid #BFDBFE' },
  contacted:   { background: '#F0FDF4', color: '#15803d', border: '0.5px solid #BBF7D0' },
  meeting_set: { background: '#FFFBEB', color: '#d97706', border: '0.5px solid #FDE68A' },
  converted:   { background: '#F0FDF4', color: '#15803d', border: '0.5px solid #86efac' },
  lost:        { background: '#FEF2F2', color: '#dc2626', border: '0.5px solid #FECACA' },
}

// ── Form-submission lead statuses (backed by /public/submissions/{id}/status) ──
// Same vocabulary already used on the Campaign Detail page's lead modal.
const formStatusOptions = ['Interested', 'Not Connected', 'In Progress', 'Not Answered', 'Converted', 'Visited', 'Dead']

const formStatusColors = {
  'Interested':    { text: '#16a34a', border: '#16a34a', bg: '#f0fdf4' },
  'Converted':     { text: '#16a34a', border: '#16a34a', bg: '#f0fdf4' },
  'Not Connected': { text: '#8892b0', border: '#c7ccdb', bg: '#fff'    },
  'In Progress':   { text: '#ca8a04', border: '#ca8a04', bg: '#fefce8' },
  'Not Answered':  { text: '#ca8a04', border: '#ca8a04', bg: '#fefce8' },
  'Visited':       { text: '#1A73E8', border: '#1A73E8', bg: '#f0f4ff' },
  'Dead':          { text: '#dc2626', border: '#dc2626', bg: '#fef2f2' },
}

const avatarColors = [
  { bg: '#DBEAFE', color: '#1d4ed8' },
  { bg: '#D1FAE5', color: '#065f46' },
  { bg: '#EDE9FE', color: '#6d28d9' },
  { bg: '#FEF3C7', color: '#92400e' },
  { bg: '#FCE7F3', color: '#9d174d' },
]

const getAvatarColor = (name = '') => {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

const navItems = [
  { label: 'Dashboard',  icon: '⊞', path: '/dashboard' },
  { label: 'Campaigns',  icon: '📢', path: '/campaigns' },
  { label: 'Leads',      icon: '👤', path: '/leads'     },
  { label: 'Settings',   icon: '⚙',  path: '/settings'  },
]

// ── Per-lead activity timeline, stored in localStorage (same key/shape as Campaign Detail) ──
const ACTIVITY_KEY = 'lead_activity_log'

const loadActivityLog = () => {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveActivityLog = (log) => {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log))
  } catch {
    // ignore storage errors, timeline just won't persist
  }
}

const formatActivityDate = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const diffSec = Math.floor((now - d) / 1000)
  if (diffSec < 5) return 'Just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return d.toLocaleDateString('en-IN')
}

const getWhatsAppUrl = (phone) => {
  if (!phone) return '#'
  const digits = phone.replace(/\D/g, '').replace(/^0/, '')
  const number = digits.startsWith('91') ? digits : `91${digits}`
  return `https://wa.me/${number}`
}

// Breakpoint below which the sidebar becomes an overlay drawer
const MOBILE_BREAKPOINT = 860

const Leads = () => {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('all')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [activityLog, setActivityLog] = useState({})

  // ── Responsive state ──
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (!mobile) setMobileNavOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setActivityLog(loadActivityLog())
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    setLoadError('')
    try {
      // 1) Campaigns list chahiye taaki har campaign ke form-submissions fetch kar sakein
      const campRes = await getCampaigns()
      const campaignList = campRes.data?.campaigns || campRes.data || []

      // 2) CRM leads table se leads
      const leadsRes = await getLeads()
      const crmLeads = (Array.isArray(leadsRes.data) ? leadsRes.data : (leadsRes.data?.leads || []))
        .map(l => ({ ...l, source: 'crm' }))

      // 3) Har campaign ke public form-submissions
      let formLeads = []
      try {
        for (const camp of campaignList) {
          const res = await fetch(`http://127.0.0.1:8000/public/submissions/${camp.id}`)
          const data = await res.json()
          formLeads = [
            ...formLeads,
            ...(data.submissions || []).map(sub => ({
              ...sub,
              id: sub.id ?? `form-${camp.id}-${sub.phone || sub.full_name}`,
              name: sub.full_name || sub.name,
              full_name: sub.full_name || sub.name,
              company_sector: sub.company_sector || sub.sector || null,
              turnover: sub.turnover || null,
              location: sub.location || null,
              platform_name: sub.platform || sub.platform_name || 'Direct',
              status: sub.status || null,
              campaign_id: camp.id,
              campaign_name: camp.name,
              source: 'form',
            })),
          ]
        }
      } catch (e) {
        console.error('Form submissions fetch failed', e)
      }

      setLeads([...crmLeads, ...formLeads])
    } catch (err) {
      console.error('Leads fetch nahi hue!', err)
      setLoadError('Leads load nahi ho paaye. Backend/API connection check karein.')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const getLeadKey = (lead) => lead?.id ?? lead?.phone ?? lead?.name

  const getLeadTimeline = (lead) => {
    const key = getLeadKey(lead)
    const stored = activityLog[key] || []
    const seed = lead?.created_at
      ? [{ label: `Added via ${lead.platform_name || 'Direct'}`, at: lead.created_at }]
      : []
    return [...stored, ...seed].sort((a, b) => new Date(b.at) - new Date(a.at))
  }

  const recordActivity = (lead, label) => {
    const key = getLeadKey(lead)
    const entry = { label, at: new Date().toISOString() }
    setActivityLog(prev => {
      const updated = { ...prev, [key]: [entry, ...(prev[key] || [])] }
      saveActivityLog(updated)
      return updated
    })
  }

  // Status change — CRM leads go through /api/leads/{id}, form leads through /public/submissions/{id}/status
  const handleStatusChange = async (lead, newStatus) => {
    setLeads(prev => prev.map(l => (l.id === lead.id ? { ...l, status: newStatus } : l)))
    setSelectedLead(prev => (prev && prev.id === lead.id ? { ...prev, status: newStatus } : prev))
    recordActivity(lead, `Status Changed: ${newStatus}`)

    if (lead.source === 'crm') {
      try {
        await updateLeadStatus(lead.id, { status: newStatus })
      } catch (err) {
        console.error('Status update nahi hua!', err)
        fetchLeads()
      }
    } else {
      try {
        await fetch(`http://127.0.0.1:8000/public/submissions/${lead.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      } catch (err) {
        console.error('Status update sync error:', err.message)
      }
    }
  }

  const handleDelete = async (lead) => {
    if (lead.source !== 'crm') return // form-submission leads ke liye delete endpoint nahi hai
    if (window.confirm('Lead delete karna chahte ho?')) {
      try {
        await deleteLead(lead.id)
        fetchLeads()
      } catch (err) {
        console.error('Delete nahi hua!', err)
      }
    }
  }

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const totalLeads     = leads.length
  const newLeads       = leads.filter(l => l.status === 'new' || l.status === 'Interested').length
  const contactedLeads = leads.filter(l => l.status === 'contacted' || l.status === 'In Progress').length
  const convertedLeads = leads.filter(l => l.status === 'converted' || l.status === 'Converted').length

  const filterTabs = [
    { key: 'all',         label: `All (${totalLeads})` },
    { key: 'new',         label: `New (${leads.filter(l => l.status === 'new').length})` },
    { key: 'contacted',   label: `Contacted (${leads.filter(l => l.status === 'contacted').length})` },
    { key: 'meeting_set', label: `Meeting Set (${leads.filter(l => l.status === 'meeting_set').length})` },
    { key: 'converted',   label: `Converted (${leads.filter(l => l.status === 'converted' || l.status === 'Converted').length})` },
    { key: 'lost',        label: `Lost (${leads.filter(l => l.status === 'lost').length})` },
    { key: 'Interested',    label: `Interested (${leads.filter(l => l.status === 'Interested').length})` },
    { key: 'Not Connected', label: `Not Connected (${leads.filter(l => l.status === 'Not Connected').length})` },
    { key: 'Visited',       label: `Visited (${leads.filter(l => l.status === 'Visited').length})` },
    { key: 'Dead',          label: `Dead (${leads.filter(l => l.status === 'Dead').length})` },
  ]

  // ── Responsive style overrides ──
  const shellStyle = isMobile ? { ...s.shell, display: 'block' } : s.shell
  const sidebarStyle = isMobile
    ? {
        ...s.sidebar,
        position: 'fixed', top: 0, left: 0, height: '100%', width: '240px',
        zIndex: 40, transform: mobileNavOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        boxShadow: mobileNavOpen ? '2px 0 24px rgba(0,0,0,0.3)' : 'none',
        boxSizing: 'border-box',
      }
    : s.sidebar
  const mainStyle = isMobile ? { ...s.main, padding: '16px 14px' } : s.main
  const kpiRowStyle = isMobile ? { ...s.kpiRow, gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' } : s.kpiRow
  const pageTitleStyle = isMobile ? { ...s.pageTitle, fontSize: '19px' } : s.pageTitle

  return (
    <div style={shellStyle}>

      {/* Mobile backdrop for sidebar drawer */}
      {isMobile && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            display: mobileNavOpen ? 'block' : 'none',
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30,
          }}
        />
      )}

      {/* ───────── SIDEBAR ───────── */}
      <div style={sidebarStyle}>
        <div style={s.brand}>
          <div style={s.brandIcon}>A</div>
          <span style={s.brandName}>AdNexus</span>
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#93b4d4', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={s.sbTitle}>B2B Leads Feed</div>
        <div style={s.sbSub}>Verified ₹10Cr+ turnover leads from your campaigns</div>

        {[
          '✦  Verified decision makers',
          '✦  Real-time lead tracking',
          '✦  AI-powered lead scoring',
          '✦  Smart pipeline filters',
        ].map((f, i) => (
          <div key={i} style={s.sbFeat}>{f}</div>
        ))}

        <div style={s.navSection}>
          {navItems.map(item => (
            <div
              key={item.label}
              style={{
                ...s.navItem,
                ...(item.label === 'Leads' ? s.navItemActive : {}),
              }}
              onClick={() => { navigate(item.path); setMobileNavOpen(false) }}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ───────── MAIN ───────── */}
      <div style={mainStyle}>

        {/* Top nav */}
        <div style={{ ...s.topNav, flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isMobile && (
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: '0.5px solid #d0d5e8', background: '#fff',
                  color: '#1a1a2e', cursor: 'pointer', flexShrink: 0, fontSize: '15px',
                }}
              >
                ☰
              </button>
            )}
            <button style={s.backBtn} onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
          <button style={s.refreshBtn} onClick={fetchLeads} disabled={loading}>
            {loading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {/* Page title */}
        <div style={pageTitleStyle}>B2B Leads Feed</div>
        <div style={s.pageSub}>Verified ₹10Cr+ turnover leads — live from your campaigns</div>

        {/* KPI Cards */}
        <div style={kpiRowStyle}>
          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Total leads</div>
            <div style={s.kpiVal}>{totalLeads}</div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>New</div>
            <div style={{ ...s.kpiVal, color: '#2563eb' }}>{newLeads}</div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Contacted</div>
            <div style={{ ...s.kpiVal, color: '#d97706' }}>{contactedLeads}</div>
          </div>
          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Converted</div>
            <div style={{ ...s.kpiVal, color: '#16a34a' }}>{convertedLeads}</div>
          </div>
        </div>

        {loadError && <div style={s.errorBox}>{loadError}</div>}

        {/* Filter Tabs */}
        <div style={{ ...s.filterRow, overflowX: isMobile ? 'auto' : 'visible', flexWrap: isMobile ? 'nowrap' : 'wrap', paddingBottom: isMobile ? '4px' : 0 }}>
          {filterTabs.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                ...(filter === f.key ? s.filterBtnActive : s.filterBtn),
                flexShrink: 0,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          {loading ? (
            <div style={s.emptyState}>
              <div style={s.spinner} />
              Leads load ho rahe hain...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📭</div>
              <div style={{ fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                Koi lead nahi hai abhi
              </div>
              <div style={{ fontSize: '12px', color: '#8892b0' }}>
                Jaise hi aapke campaigns se naya real lead aayega, wo yahan automatically show hoga.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ ...s.table, minWidth: isMobile ? '760px' : '100%' }}>
                <thead>
                  <tr style={s.theadRow}>
                    <th style={s.th}>Lead name</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Sector</th>
                    <th style={s.th}>Location</th>
                    <th style={s.th}>Via</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Added</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    const platform = platforms.find(p => p.name === lead.platform_name)
                    const av = getAvatarColor(lead.name)
                    const isCrm = lead.source === 'crm'
                    const statusOptionsForLead = isCrm ? crmStatusOptions : formStatusOptions
                    const statusStyleForLead = isCrm
                      ? (crmStatusStyles[lead.status] || {})
                      : (formStatusColors[lead.status]
                          ? { background: formStatusColors[lead.status].bg, color: formStatusColors[lead.status].text, border: `0.5px solid ${formStatusColors[lead.status].border}` }
                          : { background: '#f4f6fb', color: '#8892b0', border: '0.5px solid #e0e4ef' })
                    return (
                      <tr
                        key={lead.id}
                        style={{
                          ...s.tr,
                          cursor: 'pointer',
                          background: hoveredRow === lead.id ? '#f8faff' : 'transparent',
                        }}
                        onMouseEnter={() => setHoveredRow(lead.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td style={s.td}>
                          <div style={s.leadCell}>
                            <div style={{ ...s.avatar, background: av.bg, color: av.color }}>
                              {lead.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontWeight: 500, fontSize: '13px' }}>{lead.name || '—'}</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontSize: '13px' }}>{lead.phone || '—'}</span>
                        </td>
                        <td style={s.td}>
                          {lead.company_sector
                            ? <span style={s.sectorPill}>{lead.company_sector}</span>
                            : <span style={{ fontSize: '12px', color: '#c7ccdb' }}>—</span>}
                        </td>
                        <td style={s.td}>
                          <span style={{ fontSize: '13px' }}>📍 {lead.location || '—'}</span>
                        </td>
                        <td style={s.td}>
                          {platform ? (
                            <div style={{ ...s.platIcon, background: platform.color }}>
                              {platform.icon}
                            </div>
                          ) : (
                            <span style={s.turnoverPill}>{lead.platform_name || 'Direct'}</span>
                          )}
                        </td>
                        <td style={s.td}>
                          <select
                            value={lead.status || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(lead, e.target.value)}
                            style={{ ...s.statusSelect, ...statusStyleForLead }}
                          >
                            {!lead.status && <option value="">Set status</option>}
                            {statusOptionsForLead.map(opt => (
                              <option key={opt} value={opt}>
                                {isCrm ? opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={s.td}>
                          <span style={s.dateText}>
                            {lead.created_at
                              ? new Date(lead.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </td>
                        <td style={s.td}>
                          {isCrm && (
                            <button
                              style={s.deleteBtn}
                              onClick={(e) => { e.stopPropagation(); handleDelete(lead) }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#FEF2F2'
                                e.currentTarget.style.borderColor = '#f87171'
                                e.currentTarget.style.color = '#dc2626'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.borderColor = '#e0e4ef'
                                e.currentTarget.style.color = '#8892b0'
                              }}
                            >
                              🗑
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ───────── LEAD DETAIL MODAL ───────── */}
        {selectedLead && (() => {
          const isCrm = selectedLead.source === 'crm'
          const statusOptionsForLead = isCrm ? crmStatusOptions : formStatusOptions
          const av = getAvatarColor(selectedLead.name)
          return (
            <div style={s.modalOverlay} onClick={() => setSelectedLead(null)}>
              <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={s.modalHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ ...s.avatar, width: '44px', height: '44px', fontSize: '17px', background: av.bg, color: av.color }}>
                      {selectedLead.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedLead.name || '—'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8892b0' }}>
                        {selectedLead.company_sector || (isCrm ? 'CRM Lead' : 'Form Lead')} • {selectedLead.platform_name || 'Direct'}
                      </div>
                    </div>
                  </div>
                  <button style={s.modalClose} onClick={() => setSelectedLead(null)}>✕</button>
                </div>

                {/* Quick stats row */}
                <div style={{ ...s.modalStatsRow, gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)' }}>
                  <div style={s.modalStatBox}>
                    <div style={s.modalStatLabel}>Quality Score</div>
                    <div style={{ ...s.modalStatVal, color: '#16a34a' }}>
                      {selectedLead.quality_score != null ? `${selectedLead.quality_score}/10` : '—'}
                    </div>
                  </div>
                  <div style={s.modalStatBox}>
                    <div style={s.modalStatLabel}>Platform</div>
                    <div style={{ ...s.modalStatVal, color: '#2563eb' }}>
                      {selectedLead.platform_name || 'Direct'}
                    </div>
                  </div>
                  <div style={s.modalStatBox}>
                    <div style={s.modalStatLabel}>Date</div>
                    <div style={s.modalStatVal}>
                      {selectedLead.created_at
                        ? new Date(selectedLead.created_at).toLocaleDateString('en-IN')
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div style={s.modalSection}>
                  <div style={s.modalSectionTitle}>🏷️ Status</div>
                  <div style={s.statusPillRow}>
                    {statusOptionsForLead.map(opt => {
                      const isActive = selectedLead.status === opt
                      const c = isCrm
                        ? (crmStatusStyles[opt] ? { text: crmStatusStyles[opt].color, border: crmStatusStyles[opt].color, bg: crmStatusStyles[opt].background } : { text: '#5a6178', border: '#e0e4ef', bg: '#fff' })
                        : (formStatusColors[opt] || { text: '#5a6178', border: '#e0e4ef', bg: '#fff' })
                      return (
                        <button
                          key={opt}
                          onClick={() => handleStatusChange(selectedLead, opt)}
                          style={{
                            ...s.statusPillBtn,
                            background: isActive ? c.bg : '#fff',
                            color: isActive ? c.text : '#5a6178',
                            border: `1.5px solid ${isActive ? c.border : '#e0e4ef'}`,
                          }}
                        >
                          {isCrm ? opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : opt}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Contact details */}
                <div style={s.modalSection}>
                  <div style={s.modalSectionTitle}>📋 Contact Details</div>
                  <div style={s.modalDetailBox}>
                    {[
                      ['Full Name',    selectedLead.name],
                      ['Phone',        selectedLead.phone],
                      ['Email',        selectedLead.email],
                      ['Location',     selectedLead.location],
                      ['Sector',       selectedLead.company_sector],
                      ['Turnover',     selectedLead.turnover],
                      ['Budget Range', selectedLead.budget_range],
                      ['Timeline',     selectedLead.timeline],
                      ['Requirement',  selectedLead.requirement],
                      ['Campaign',     selectedLead.campaign_name],
                    ].filter(([, val]) => val).map(([label, value]) => (
                      <div key={label} style={s.modalDetailRow}>
                        <span style={s.modalDetailLabel}>{label}</span>
                        <span style={s.modalDetailValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra / Additional Details (form leads only) */}
                {selectedLead.extra_data && Object.keys(selectedLead.extra_data).length > 0 && (
                  <div style={s.modalSection}>
                    <div style={s.modalSectionTitle}>📊 Additional Details</div>
                    <div style={s.modalDetailBox}>
                      {Object.entries(selectedLead.extra_data).map(([key, val]) => (
                        <div key={key} style={s.modalDetailRow}>
                          <span style={s.modalDetailLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          <span style={s.modalDetailValue}>{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div style={s.modalSection}>
                  <div style={s.modalSectionTitle}>🕐 Timeline</div>
                  <div style={{ paddingLeft: '4px' }}>
                    {getLeadTimeline(selectedLead).map((item, i, arr) => (
                      <div key={i} style={{ position: 'relative', paddingLeft: '18px', paddingBottom: i === arr.length - 1 ? '0' : '16px' }}>
                        <div style={{ position: 'absolute', left: 0, top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                        {i !== arr.length - 1 && (
                          <div style={{ position: 'absolute', left: '3.5px', top: '11px', bottom: '-4px', width: '1px', background: '#e0e4ef' }} />
                        )}
                        <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '2px' }}>{formatActivityDate(item.at)}</div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1a1a2e' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons: Call / WhatsApp / Email */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                  {selectedLead.phone && (
                    <a href={`tel:${selectedLead.phone}`} style={{ ...s.actionBtn, background: '#2563eb', color: '#fff' }}>
                      📞 Call Now
                    </a>
                  )}
                  {selectedLead.phone && (
                    <a href={getWhatsAppUrl(selectedLead.phone)} target="_blank" rel="noopener noreferrer"
                      style={{ ...s.actionBtn, background: '#25D366', color: '#fff' }}>
                      💬 WhatsApp
                    </a>
                  )}
                  {selectedLead.email && (
                    <a href={`mailto:${selectedLead.email}`} style={{ ...s.actionBtn, background: '#f0f4ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }}>
                      ✉️ Send Email
                    </a>
                  )}
                </div>

                {/* Delete — sirf CRM leads ke liye */}
                {isCrm && (
                  <button
                    style={s.modalDeleteBtn}
                    onClick={() => { handleDelete(selectedLead); setSelectedLead(null) }}
                  >
                    🗑 Delete this lead
                  </button>
                )}

              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}

/* ─────────────────── STYLES ─────────────────── */
const s = {

  shell: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    minHeight: '100vh',
    fontFamily: 'inherit',
  },

  /* ── Sidebar ── */
  sidebar: {
    background: '#1e3a5f',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.75rem' },
  brandIcon: {
    width: '28px', height: '28px', background: '#3b82f6',
    borderRadius: '6px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700',
  },
  brandName: { color: '#fff', fontSize: '15px', fontWeight: '500' },
  sbTitle: { color: '#fff', fontSize: '16px', fontWeight: '500', lineHeight: '1.4', marginBottom: '6px' },
  sbSub:   { color: '#93b4d4', fontSize: '12px', lineHeight: '1.5', marginBottom: '1.25rem' },
  sbFeat:  { color: '#93b4d4', fontSize: '12px', marginBottom: '10px' },
  navSection: {
    marginTop: 'auto', paddingTop: '1.25rem',
    borderTop: '0.5px solid rgba(255,255,255,0.12)',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '9px',
    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', color: '#93b4d4', marginBottom: '2px',
  },
  navItemActive: {
    background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
  },

  /* ── Main area ── */
  main: {
    background: '#f4f6fb',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
  },

  /* Top nav */
  topNav: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '18px',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#2563eb',
    fontSize: '13px', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
  },
  refreshBtn: {
    background: 'transparent', color: '#2563eb',
    border: '0.5px solid #bfdbfe', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  /* Title */
  pageTitle: { fontSize: '22px', fontWeight: '500', color: '#1a1a2e', marginBottom: '3px' },
  pageSub:   { fontSize: '12px', color: '#8892b0', marginBottom: '20px' },

  /* KPI */
  kpiRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', marginBottom: '18px',
  },
  kpiCard: {
    background: '#fff', border: '0.5px solid #e0e4ef',
    borderRadius: '10px', padding: '16px 18px',
  },
  kpiLabel: {
    fontSize: '11px', fontWeight: '500', color: '#8892b0',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
  },
  kpiVal: { fontSize: '24px', fontWeight: '500', color: '#1a1a2e' },

  /* Alerts */
  errorBox: {
    background: '#FEF2F2', color: '#dc2626', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '14px',
    border: '0.5px solid #FECACA',
  },

  /* Filters */
  filterRow: { display: 'flex', gap: '7px', marginBottom: '14px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '5px 14px', borderRadius: '20px',
    border: '0.5px solid #d0d5e8', background: '#fff',
    fontSize: '12px', color: '#8892b0', cursor: 'pointer', fontFamily: 'inherit',
  },
  filterBtnActive: {
    padding: '5px 14px', borderRadius: '20px',
    border: '0.5px solid #2563eb', background: '#2563eb',
    fontSize: '12px', color: '#fff', cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: '500',
  },

  /* Table */
  tableCard: {
    background: '#fff', border: '0.5px solid #e0e4ef',
    borderRadius: '12px', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  theadRow: { background: '#f8faff' },
  th: {
    padding: '10px 14px', textAlign: 'left', color: '#8892b0',
    fontWeight: '500', borderBottom: '0.5px solid #e0e4ef',
    fontSize: '11px', textTransform: 'uppercase',
    letterSpacing: '0.05em', whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '0.5px solid #f0f2f8', transition: 'background 0.1s' },
  td: { padding: '11px 14px', color: '#1a1a2e', verticalAlign: 'middle' },

  /* Cell parts */
  leadCell:    { display: 'flex', alignItems: 'center', gap: '9px' },
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '500', flexShrink: 0,
  },
  sectorPill: {
    fontSize: '11px', background: '#EFF6FF', color: '#1d4ed8',
    borderRadius: '20px', padding: '3px 10px', display: 'inline-block',
  },
  turnoverPill: {
    fontSize: '11px', background: '#f4f6fb', color: '#8892b0',
    borderRadius: '20px', padding: '3px 10px', display: 'inline-block',
    border: '0.5px solid #e0e4ef',
  },
  platIcon: {
    width: '26px', height: '26px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: '700', color: '#fff',
  },
  statusSelect: {
    padding: '4px 22px 4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '500', cursor: 'pointer',
    fontFamily: 'inherit', outline: 'none',
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23888'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 7px center',
  },
  dateText:  { fontSize: '12px', color: '#8892b0' },
  deleteBtn: {
    width: '28px', height: '28px', borderRadius: '7px',
    border: '0.5px solid #e0e4ef', background: 'transparent',
    color: '#8892b0', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#8892b0', fontSize: '13px',
  },
  emptyIcon: { fontSize: '32px', marginBottom: '10px' },
  spinner: {
    width: '20px', height: '20px', margin: '0 auto 12px',
    border: '2px solid #e0e4ef', borderTopColor: '#2563eb',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },

  /* ── Lead detail modal ── */
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,20,35,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
  },
  modalCard: {
    background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px',
    maxHeight: '88vh', overflowY: 'auto', padding: '22px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)', boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: '18px', gap: '10px',
  },
  modalClose: {
    background: '#f4f6fb', border: 'none', borderRadius: '8px',
    width: '30px', height: '30px', cursor: 'pointer', color: '#8892b0',
    fontSize: '14px', flexShrink: 0,
  },
  modalStatsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
    marginBottom: '18px',
  },
  modalStatBox: {
    background: '#f8faff', border: '0.5px solid #e0e4ef',
    borderRadius: '10px', padding: '10px 12px',
  },
  modalStatLabel: {
    fontSize: '10px', color: '#8892b0', marginBottom: '4px',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  modalStatVal: { fontSize: '14px', fontWeight: 600, color: '#1a1a2e' },
  modalSection: { marginBottom: '14px' },
  modalSectionTitle: {
    fontSize: '12px', fontWeight: 600, color: '#1a1a2e', marginBottom: '10px',
  },
  statusPillRow: { display: 'flex', flexWrap: 'wrap', gap: '7px' },
  statusPillBtn: {
    padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
    fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
  modalDetailBox: {
    background: '#f8faff', border: '0.5px solid #e0e4ef',
    borderRadius: '10px', padding: '4px 14px',
  },
  modalDetailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '0.5px solid #e6eaf5', fontSize: '13px', gap: '10px',
  },
  modalDetailLabel: { color: '#8892b0', flexShrink: 0 },
  modalDetailValue: { color: '#1a1a2e', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' },
  actionBtn: {
    flex: '1 1 auto', minWidth: '110px', padding: '11px 8px', borderRadius: '10px',
    textAlign: 'center', fontSize: '13px', fontWeight: 600,
    textDecoration: 'none', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px', border: 'none', fontFamily: 'inherit',
  },
  modalDeleteBtn: {
    width: '100%', marginTop: '14px', padding: '10px', borderRadius: '10px',
    border: '0.5px solid #fecaca', background: '#FEF2F2', color: '#dc2626',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
}

export default Leads