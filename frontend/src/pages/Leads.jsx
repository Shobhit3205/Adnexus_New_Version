import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeads, createLead, updateLeadStatus, deleteLead } from '../services/api'
 
const platforms = [
  { id: 1, name: 'Google Ads',  color: '#1A73E8', icon: 'G'  },
  { id: 2, name: 'LinkedIn',    color: '#0A66C2', icon: 'in' },
  { id: 3, name: 'Facebook',    color: '#1877F2', icon: 'f'  },
  { id: 4, name: 'Instagram',   color: '#E1306C', icon: 'ig' },
]
 
const statusOptions = ['new', 'contacted', 'meeting_set', 'converted', 'lost']
 
const statusStyles = {
  new:         { background: '#EFF6FF', color: '#1d4ed8', border: '0.5px solid #BFDBFE' },
  contacted:   { background: '#F0FDF4', color: '#15803d', border: '0.5px solid #BBF7D0' },
  meeting_set: { background: '#FFFBEB', color: '#d97706', border: '0.5px solid #FDE68A' },
  converted:   { background: '#F0FDF4', color: '#15803d', border: '0.5px solid #86efac' },
  lost:        { background: '#FEF2F2', color: '#dc2626', border: '0.5px solid #FECACA' },
}
 
const avatarColors = [
  { bg: '#DBEAFE', color: '#1d4ed8' },
  { bg: '#D1FAE5', color: '#065f46' },
  { bg: '#EDE9FE', color: '#6d28d9' },
  { bg: '#FEF3C7', color: '#92400e' },
  { bg: '#FCE7F3', color: '#9d174d' },
]
 
const getAvatarColor = (name = '') => {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}
 
const navItems = [
  { label: 'Dashboard',  icon: '⊞', path: '/'          },
  { label: 'Campaigns',  icon: '📢', path: '/campaigns' },
  { label: 'Leads',      icon: '👤', path: '/leads'     },
  { label: 'Settings',   icon: '⚙',  path: '/settings'  },
]
 
const Leads = () => {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')
  const [hoveredRow, setHoveredRow] = useState(null)
 
  const [formData, setFormData] = useState({
    campaign_id: '',
    platform_id: 1,
    name: '',
    company_sector: '',
    turnover: '',
    location: '',
    status: 'new',
  })
 
  useEffect(() => { fetchLeads() }, [])
 
  const fetchLeads = async () => {
    try {
      const res = await getLeads()
      setLeads(res.data.leads)
    } catch (err) {
      console.error('Leads fetch nahi hue!')
    } finally {
      setLoading(false)
    }
  }
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    try {
      await createLead({
        ...formData,
        campaign_id: parseInt(formData.campaign_id),
        platform_id: parseInt(formData.platform_id),
      })
      setSuccess('Lead add ho gaya!')
      setShowForm(false)
      fetchLeads()
      setFormData({ campaign_id: '', platform_id: 1, name: '', company_sector: '', turnover: '', location: '', status: 'new' })
    } catch (err) {
      setError('Lead add nahi hua!')
    } finally {
      setFormLoading(false)
    }
  }
 
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateLeadStatus(id, { status: newStatus })
      fetchLeads()
    } catch (err) {
      console.error('Status update nahi hua!')
    }
  }
 
  const handleDelete = async (id) => {
    if (window.confirm('Lead delete karna chahte ho?')) {
      try {
        await deleteLead(id)
        fetchLeads()
      } catch (err) {
        console.error('Delete nahi hua!')
      }
    }
  }
 
  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const totalLeads    = leads.length
  const newLeads      = leads.filter(l => l.status === 'new').length
  const contactedLeads = leads.filter(l => l.status === 'contacted').length
  const convertedLeads = leads.filter(l => l.status === 'converted').length
 
  const filterTabs = [
    { key: 'all',         label: `All (${totalLeads})` },
    { key: 'new',         label: 'New'          },
    { key: 'contacted',   label: 'Contacted'    },
    { key: 'meeting_set', label: 'Meeting Set'  },
    { key: 'converted',   label: 'Converted'    },
    { key: 'lost',        label: 'Lost'         },
  ]
 
  return (
    <div style={s.shell}>
 
      {/* ───────── SIDEBAR ───────── */}
      <div style={s.sidebar}>
 
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}>A</div>
          <span style={s.brandName}>AdNexus</span>
        </div>
 
        {/* Sidebar heading */}
        <div style={s.sbTitle}>B2B Leads Feed</div>
        <div style={s.sbSub}>Verified ₹10Cr+ turnover leads from your campaigns</div>
 
        {/* Features */}
        {[
          '✦  Verified decision makers',
          '✦  Real-time lead tracking',
          '✦  AI-powered lead scoring',
          '✦  Smart pipeline filters',
        ].map((f, i) => (
          <div key={i} style={s.sbFeat}>{f}</div>
        ))}
 
        {/* Nav */}
        <div style={s.navSection}>
          {navItems.map(item => (
            <div
              key={item.label}
              style={{
                ...s.navItem,
                ...(item.label === 'Leads' ? s.navItemActive : {}),
              }}
              onClick={() => navigate(item.path)}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
 
      {/* ───────── MAIN ───────── */}
      <div style={s.main}>
 
        {/* Top nav */}
        <div style={s.topNav}>
          <button style={s.backBtn} onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
          <button
            style={showForm ? s.cancelBtn : s.addBtn}
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          >
            {showForm ? '✕ Cancel' : '+ Add Lead'}
          </button>
        </div>
 
        {/* Page title */}
        <div style={s.pageTitle}>B2B Leads Feed</div>
        <div style={s.pageSub}>Verified ₹10Cr+ turnover leads</div>
 
        {/* KPI Cards */}
        <div style={s.kpiRow}>
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
 
        {/* Add Lead Form */}
        {showForm && (
          <div style={s.formCard}>
            <div style={s.formTitle}>Add new lead</div>
            {error && <div style={s.errorBox}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>
                <div>
                  <label style={s.label}>Lead name</label>
                  <input style={s.input} type="text" name="name" placeholder="Rahul M." value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label style={s.label}>Company sector</label>
                  <input style={s.input} type="text" name="company_sector" placeholder="Manufacturing" value={formData.company_sector} onChange={handleChange} required />
                </div>
                <div>
                  <label style={s.label}>Turnover</label>
                  <input style={s.input} type="text" name="turnover" placeholder="₹15 Cr+" value={formData.turnover} onChange={handleChange} required />
                </div>
                <div>
                  <label style={s.label}>Location</label>
                  <input style={s.input} type="text" name="location" placeholder="Delhi" value={formData.location} onChange={handleChange} required />
                </div>
                <div>
                  <label style={s.label}>Campaign ID</label>
                  <input style={s.input} type="number" name="campaign_id" placeholder="1" value={formData.campaign_id} onChange={handleChange} required />
                </div>
                <div>
                  <label style={s.label}>Platform</label>
                  <select style={s.input} name="platform_id" value={formData.platform_id} onChange={handleChange}>
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" style={formLoading ? s.btnDisabled : s.btn} disabled={formLoading}>
                {formLoading ? 'Adding...' : 'Add Lead'}
              </button>
            </form>
          </div>
        )}
 
        {success && <div style={s.successBox}>{success}</div>}
 
        {/* Filter Tabs */}
        <div style={s.filterRow}>
          {filterTabs.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={filter === f.key ? s.filterBtnActive : s.filterBtn}
            >
              {f.label}
            </button>
          ))}
        </div>
 
        {/* Table */}
        <div style={s.tableCard}>
          {loading ? (
            <div style={s.emptyState}>Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div style={s.emptyState}>Koi lead nahi hai abhi.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.theadRow}>
                  <th style={s.th}>Lead name</th>
                  <th style={s.th}>Sector</th>
                  <th style={s.th}>Turnover</th>
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
                  return (
                    <tr
                      key={lead.id}
                      style={{
                        ...s.tr,
                        background: hoveredRow === lead.id ? '#f8faff' : 'transparent',
                      }}
                      onMouseEnter={() => setHoveredRow(lead.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={s.td}>
                        <div style={s.leadCell}>
                          <div style={{ ...s.avatar, background: av.bg, color: av.color }}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: '13px' }}>{lead.name}</span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={s.sectorPill}>{lead.company_sector}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.turnoverPill}>{lead.turnover}</span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: '13px' }}>📍 {lead.location}</span>
                      </td>
                      <td style={s.td}>
                        <div style={{ ...s.platIcon, background: platform?.color || '#8892b0' }}>
                          {platform?.icon || '?'}
                        </div>
                      </td>
                      <td style={s.td}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{ ...s.statusSelect, ...statusStyles[lead.status] }}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>
                              {opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={s.td}>
                        <span style={s.dateText}>
                          {new Date(lead.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button
                          style={s.deleteBtn}
                          onClick={() => handleDelete(lead.id)}
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
 
      </div>
    </div>
  )
}
 
/* ─────────────────── STYLES ─────────────────── */
const s = {
 
  /* Layout */
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
  addBtn: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  },
  cancelBtn: {
    background: 'transparent', color: '#8892b0',
    border: '0.5px solid #d0d5e8', borderRadius: '8px',
    padding: '9px 18px', fontSize: '13px',
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
 
  /* Form */
  formCard: {
    background: '#fff', border: '0.5px solid #e0e4ef',
    borderRadius: '12px', padding: '20px', marginBottom: '18px',
  },
  formTitle: { fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '16px' },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px', marginBottom: '16px',
  },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '500', color: '#8892b0',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '0.5px solid #d0d5e8', background: '#f8faff',
    fontSize: '13px', color: '#1a1a2e', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  },
  btn: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 22px', fontSize: '13px',
    fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDisabled: {
    background: '#93b8f4', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 22px', fontSize: '13px',
    fontWeight: '500', cursor: 'not-allowed', fontFamily: 'inherit',
  },
 
  /* Alerts */
  errorBox: {
    background: '#FEF2F2', color: '#dc2626', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '14px',
    border: '0.5px solid #FECACA',
  },
  successBox: {
    background: '#F0FDF4', color: '#15803d', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '14px',
    border: '0.5px solid #BBF7D0',
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
  emptyState: { textAlign: 'center', padding: '48px', color: '#8892b0', fontSize: '13px' },
}
 
export default Leads