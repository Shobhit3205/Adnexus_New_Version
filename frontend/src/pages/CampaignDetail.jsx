import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCampaignDetail, syncPlatformStats } from '../services/api'
import {
  ArrowLeft, RefreshCw, Sun, Moon, FileEdit, X, Tag, ClipboardList,
  Clock, Phone, Mail, Link2, Copy, CheckCircle2, Hourglass, Plus,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

const platformColors = {
  'Google Ads': '#1A73E8',
  'google': '#1A73E8',
  'LinkedIn': '#0A66C2',
  'linkedin': '#0A66C2',
  'Facebook': '#1877F2',
  'facebook': '#1877F2',
  'meta': '#1877F2',
  'Instagram': '#E1306C',
  'instagram': '#E1306C',
}

const platformIcons = {
  'Google Ads': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  'google':     'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
  'LinkedIn':   'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'linkedin':   'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'Facebook':   'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg',
  'facebook':   'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg',
  'meta':       'https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg',
  'Instagram':  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
  'instagram':  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
}
// ── Status options shown as pill buttons in Lead Detail modal ──
const STATUS_OPTIONS = ['Interested', 'Not Connected', 'In Progress', 'Not Answered', 'Converted', 'Visited', 'Dead']

const statusColors = {
  'Interested': { text: '#16a34a', border: '#16a34a', bg: '#f0fdf4' },
  'Converted': { text: '#16a34a', border: '#16a34a', bg: '#f0fdf4' },
  'Not Connected': { text: '#8892b0', border: '#c7ccdb', bg: '#fff' },
  'In Progress': { text: '#ca8a04', border: '#ca8a04', bg: '#fefce8' },
  'Not Answered': { text: '#ca8a04', border: '#ca8a04', bg: '#fefce8' },
  'Visited': { text: '#1A73E8', border: '#1A73E8', bg: '#f0f4ff' },
  'Dead': { text: '#dc2626', border: '#dc2626', bg: '#fef2f2' },
}

// ── LocalStorage helpers for per-lead activity timeline ──
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
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 5) return 'Just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return d.toLocaleDateString('en-IN')
}

/* ── Theme tokens (same system as Dashboard.jsx) ── */
const LIGHT = {
  pageBg:       '#f0f4ff',
  cardBg:       '#ffffff',
  tableHeadBg:  '#f8faff',
  rowHover:     '#f0f4ff',
  inputBg:      '#f0f4ff',
  border:       '1px solid #e4e9f5',
  borderColor:  '#e4e9f5',
  textPrimary:  '#0f172a',
  textSecondary:'#64748b',
  textMuted:    '#94a3b8',
  accent:       '#2b7fff',
  accentHover:  '#1668f5',
  accentLight:  '#eaf2ff',
  accentBorder: '#bfdbfe',
  badgeBlue:    { bg:'#eaf2ff',   color:'#1668f5', border:'#bfdbfe' },
  badgeGreen:   { bg:'#f0fdf4',   color:'#15803d', border:'#bbf7d0' },
  badgeAmber:   { bg:'#fffbeb',   color:'#b45309', border:'#fde68a' },
  badgeRed:     { bg:'#fef2f2',   color:'#dc2626', border:'#fecaca' },
  chipBg:       '#eaf2ff',
  chipColor:    '#2b7fff',
  avatarBg:     'linear-gradient(135deg,#2b7fff,#7c3aed)',
  emptyColor:   '#94a3b8',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  // ── Pastel/light KPI backgrounds — soft tint instead of solid saturated fill ──
  kpiSpendBg:   'linear-gradient(135deg,#cbe0fd 0%,#e5f0ff 100%)',
  kpiLeadsBg:   'linear-gradient(135deg,#b3efd0 0%,#dcf7e9 100%)',
  kpiCplBg:     'linear-gradient(135deg,#fdecc0 0%,#fff8e5 100%)',
  kpiActiveBg:  'linear-gradient(135deg,#ecd9ff 0%,#f6ecff 100%)',
  kpiPinkBg:    'linear-gradient(135deg,#fbd5e8 0%,#fdeef5 100%)',
  kpiTealBg:    'linear-gradient(135deg,#bdf0ea 0%,#e2fbf8 100%)',
  kpiTextSpend: '#2563eb',
  kpiTextLeads: '#059669',
  kpiTextCpl:   '#c2760a',
  kpiTextActive:'#9333ea',
  kpiTextPink:  '#db2777',
  kpiTextTeal:  '#0f766e',
}

const DARK = {
  pageBg:       '#05101f',
  cardBg:       'rgba(255,255,255,0.055)',
  tableHeadBg:  'transparent',
  rowHover:     'rgba(255,255,255,0.04)',
  inputBg:      'rgba(255,255,255,0.08)',
  border:       '1px solid rgba(255,255,255,0.09)',
  borderColor:  'rgba(255,255,255,0.09)',
  textPrimary:  '#ffffff',
  textSecondary:'rgba(255,255,255,0.55)',
  textMuted:    'rgba(255,255,255,0.3)',
  accent:       '#3b8bff',
  accentHover:  '#2563eb',
  accentLight:  'rgba(59,139,255,0.15)',
  accentBorder: 'rgba(59,139,255,0.3)',
  badgeBlue:    { bg:'rgba(59,139,255,0.18)',  color:'#93c5fd', border:'rgba(59,139,255,0.3)' },
  badgeGreen:   { bg:'rgba(52,211,153,0.15)',  color:'#6ee7b7', border:'rgba(52,211,153,0.25)' },
  badgeAmber:   { bg:'rgba(251,191,36,0.15)',  color:'#fde68a', border:'rgba(251,191,36,0.25)' },
  badgeRed:     { bg:'rgba(248,113,113,0.15)', color:'#fca5a5', border:'rgba(248,113,113,0.25)' },
  chipBg:       'rgba(59,139,255,0.2)',
  chipColor:    '#7bb8ff',
  avatarBg:     'linear-gradient(135deg,#3b8bff,#7b5af0)',
  emptyColor:   'rgba(255,255,255,0.25)',
  shadow:       'none',
  kpiSpendBg:   'linear-gradient(135deg,rgba(59,139,255,0.28) 0%,rgba(59,139,255,0.1) 100%)',
  kpiLeadsBg:   'linear-gradient(135deg,rgba(52,211,153,0.28) 0%,rgba(52,211,153,0.1) 100%)',
  kpiCplBg:     'linear-gradient(135deg,rgba(251,191,36,0.22) 0%,rgba(251,191,36,0.09) 100%)',
  kpiActiveBg:  'linear-gradient(135deg,rgba(167,139,250,0.22) 0%,rgba(167,139,250,0.09) 100%)',
  kpiPinkBg:    'linear-gradient(135deg,rgba(244,114,182,0.24) 0%,rgba(244,114,182,0.09) 100%)',
  kpiTealBg:    'linear-gradient(135deg,rgba(45,212,191,0.24) 0%,rgba(45,212,191,0.09) 100%)',
  kpiTextSpend: '#7bb8ff',
  kpiTextLeads: '#6ee7b7',
  kpiTextCpl:   '#fde68a',
  kpiTextActive:'#c4b5fd',
  kpiTextPink:  '#f9a8d4',
  kpiTextTeal:  '#5eead4',
}

// ── Responsive stylesheet (media queries override inline styles via className + !important) ──
const RESPONSIVE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

*::-webkit-scrollbar{display:none}
*{scrollbar-width:none;-ms-overflow-style:none}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.table-scroll{ width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.table-scroll table{ min-width:640px; }

.cd-row:hover{ background: var(--cd-row-hover) !important; }
.cd-status-pill:hover{ opacity: 0.85; }

@media (max-width: 1024px){
  .kpi-row{ grid-template-columns: repeat(3, 1fr) !important; }
  .info-grid{ grid-template-columns: 1fr !important; }
}

@media (max-width: 768px){
  .page-container{ padding: 16px !important; }
  .header-row{ flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
  .header-row > button{ align-self: flex-start; }
  .ad-content-btn-wrap{ width: 100% !important; }
  .kpi-row{ grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
  .kpi-val{ font-size: 20px !important; }
  .ad-item-body{ flex-direction: column !important; }
  .ad-item-image{ width: 100% !important; height: 180px !important; border-right: none !important; border-bottom: 1px solid var(--cd-border) !important; }
  .lead-chips-row{ flex-direction: column !important; }
  .modal{ padding: 18px !important; max-height: 92vh !important; }
  .action-buttons-row{ flex-wrap: wrap !important; }
  .action-buttons-row > a{ flex: 1 1 calc(50% - 5px) !important; min-width: 120px; }
}

@media (max-width: 480px){
  .kpi-row{ grid-template-columns: 1fr 1fr !important; }
  .title{ font-size: 19px !important; }
  .modal{ padding: 14px !important; }
  .action-buttons-row > a{ flex: 1 1 100% !important; }
}
`

const CampaignDetail = () => {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [showAdContent, setShowAdContent] = useState(false)
  const [activityLog, setActivityLog] = useState({}) // { [leadId]: [ {label, at} ] }
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const t = darkMode ? DARK : LIGHT   // active theme tokens

  useEffect(() => {
    setActivityLog(loadActivityLog())

    const loadData = async () => {
      try {
        const res = await getCampaignDetail(campaignId)
        setCampaign(res.data)
      } catch (err) {
        console.error('API error:', err.message)
      } finally {
        setLoading(false)
      }

      setLeadsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/public/submissions/${campaignId}`)
        const data = await res.json()
        setSubmissions(data.submissions || [])
      } catch (err) {
        console.error('Submissions error:', err.message)
      } finally {
        setLeadsLoading(false)
      }
    }
    loadData()
  }, [campaignId])

  const styles = getStyles(t, darkMode)

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!campaign) return <div style={styles.loading}>Campaign nahi mila!</div>

const platformStats = campaign.platform_stats || []
const isLeadGen = campaign.goal === 'LEAD_GEN'
const totalImpressions = platformStats.reduce((sum, s) => sum + (s.impressions || 0), 0)
const totalClicks = platformStats.reduce((sum, s) => sum + (s.clicks || 0), 0)
const totalSpent = platformStats.reduce((sum, s) => sum + (s.budget_spent || 0), 0)

// ── Fix: Lead Gen campaigns ke liye asli lead count humare apne form-submissions
//    se aana chahiye — Google/Meta ko in custom-form leads ka pata nahi hota,
//    isliye unki API hamesha 0 bolti thi. ──
const platformLeadsFromApi = platformStats.reduce((sum, s) => sum + (s.leads || 0), 0)
const totalLeads = isLeadGen ? submissions.length : platformLeadsFromApi
const unifiedCPL = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 0

// ── Fix: platform-wise "Leads" column bhi submissions se match karo (LEAD_GEN ke liye) ──
const PLATFORM_NAME_MAP = { google: 'Google Ads', meta: 'Facebook', instagram: 'Instagram', fb: 'Facebook', ig: 'Instagram', linkedin: 'LinkedIn' }
const leadsByPlatform = {}
if (isLeadGen) {
  submissions.forEach(lead => {
    const key = PLATFORM_NAME_MAP[(lead.platform || '').toLowerCase()] || lead.platform || 'Direct'
    leadsByPlatform[key] = (leadsByPlatform[key] || 0) + 1
  })
}

 // 🆕 Website Traffic / Brand Awareness ke liye real Meta data se cost per calculate
const totalReach = platformStats.reduce((sum, s) => sum + (s.reach || 0), 0)
const costPer = totalReach > 0 ? ((totalSpent / totalReach) * 1000).toFixed(2) : 0

  // ── WhatsApp URL helper ──
  const getWhatsAppUrl = (phone) => {
    if (!phone) return '#'
    // Strip non-digits, remove leading 0, ensure country code 91
    const digits = phone.replace(/\D/g, '').replace(/^0/, '')
    const number = digits.startsWith('91') ? digits : `91${digits}`
    return `https://wa.me/${number}`
  }

  // ── Status + Timeline helpers ──
  const getLeadKey = (lead) => lead?.id ?? lead?.phone ?? lead?.full_name

  const getLeadTimeline = (lead) => {
    const key = getLeadKey(lead)
    const stored = activityLog[key] || []
    // Seed with an "Added via <Platform>" entry so timeline is never empty
    const seed = lead?.created_at
      ? [{ label: `Added via ${lead.platform || 'Direct'}`, at: lead.created_at }]
      : []
    return [...stored, ...seed].sort((a, b) => new Date(b.at) - new Date(a.at))
  }

  const handleSyncStats = async () => {
    setSyncing(true)
    setSyncError('')
    try {
      await syncPlatformStats(campaignId)
      const res = await getCampaignDetail(campaignId)
      setCampaign(res.data)
    } catch (err) {
      setSyncError(err.response?.data?.detail || 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleStatusChange = async (lead, newStatus) => {
    const key = getLeadKey(lead)

    // 1) Update the lead's status in the submissions list + open modal
    setSubmissions(prev => prev.map(s => (getLeadKey(s) === key ? { ...s, status: newStatus } : s)))
    setSelectedLead(prev => (prev ? { ...prev, status: newStatus } : prev))

    // 2) Record activity in the timeline
    const entry = { label: `Status Changed: ${newStatus}`, at: new Date().toISOString() }
    setActivityLog(prev => {
      const updated = { ...prev, [key]: [entry, ...(prev[key] || [])] }
      saveActivityLog(updated)
      return updated
    })

    // 3) Best-effort persist to backend (won't break UI if this endpoint doesn't exist)
    try {
      await fetch(`${API_BASE}/public/submissions/${lead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (err) {
      console.error('Status update sync error:', err.message)
    }
  }

  const kpiGradients = [t.kpiSpendBg, t.kpiSpendBg, t.kpiCplBg, t.kpiActiveBg, t.kpiLeadsBg, t.kpiPinkBg, t.kpiTealBg]
  const kpiTextColors = [t.kpiTextSpend, t.kpiTextSpend, t.kpiTextCpl, t.kpiTextActive, t.kpiTextLeads, t.kpiTextPink, t.kpiTextTeal]

  return (
    <div className="page-container" style={styles.container}>
      <style>{RESPONSIVE_STYLES}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <button
            className="icon-tooltip"
            style={styles.iconBtn}
            onClick={() => setDarkMode(v => !v)}
            title={darkMode ? 'Switch to light' : 'Switch to dark'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="header-row" style={styles.headerRow}>
          <div>
            <h1 className="title" style={styles.title}>{campaign.name}</h1>
            <div style={styles.metaRow}>
              <span style={styles.goalBadge}>{campaign.goal}</span>
              <span style={styles.nicheBadge}>{campaign.business_niche}</span>
              <span style={campaign.status === 'active' ? styles.badgeActive : styles.badgePaused}>
                {campaign.status}
              </span>
            </div>
          </div>
          <button className="ad-content-btn-wrap" style={styles.adContentBtn} onClick={() => setShowAdContent(!showAdContent)}>
            {showAdContent ? <><X size={14} /> Close Ad Content</> : <><FileEdit size={14} /> Manage Ad Content</>}
          </button>
        </div>
      </div>

      
      {/* KPI Cards */}
      <div className="kpi-row" style={styles.kpiRow}>
        {[
          { label: 'Total Budget',      val: `₹${(campaign.budget || 0).toLocaleString()}` },
          { label: 'Total Spent',       val: `₹${totalSpent.toLocaleString()}` },
          { label: 'Total Impressions', val: totalImpressions.toLocaleString() },
          { label: 'Total Clicks',      val: totalClicks.toLocaleString() },
          ...(isLeadGen
            ? [
                { label: 'Total Leads', val: totalLeads },
                { label: 'Unified CPL', val: `₹${unifiedCPL}` },
              ]
            : [
                { label: 'Cost per 1,000 Reached', val: `₹${costPer}` },
              ]
          ),
        ].map((k, i) => (
          <div key={i} style={{ ...styles.kpiCard, background: kpiGradients[i % kpiGradients.length] }}>
            <div style={{ ...styles.kpiLabel, color: t.textMuted }}>{k.label}</div>
            <div className="kpi-val" style={{ ...styles.kpiVal, color: t.textPrimary }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Ad Content Modal */}
      {showAdContent && (
        <div style={styles.modalOverlay} onClick={() => setShowAdContent(false)}>
          <div className="modal" style={{ ...styles.modal, maxWidth: '860px', display: 'flex', flexDirection: 'column', padding: 0 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: t.border, flexShrink: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: t.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileEdit size={16} /> Ad Content per Platform
              </div>
              <button style={styles.modalCloseBtn}
                onClick={() => setShowAdContent(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', flex: 1 }}>
              {(!campaign.ad_contents || campaign.ad_contents.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p style={{ color: t.textSecondary, fontSize: '13px', marginBottom: '12px' }}>No ad content created yet.</p>
                  <button style={styles.adContentBtn} onClick={() => navigate(`/campaign/${campaignId}/ad-content`)}>
                    <Plus size={14} /> Create Ad Content
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {campaign.ad_contents.map((ad, i) => {
                    const color = platformColors[ad.platform_name] || t.textMuted
                    const icon = platformIcons[ad.platform_name] || '?'
                    return (
                      <div key={i} style={{ border: t.border, borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: color + '12', borderBottom: t.border }}>
                          <div style={{ ...styles.platIcon, background: color, padding: '4px' }}>
                          <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: t.textPrimary }}>{ad.platform_name}</span>
                          {ad.creative_score > 0 && (
                            <span style={{ marginLeft: 'auto', ...styles.scoreBadge }}>
                              {ad.creative_score}/100
                            </span>
                          )}
                        </div>
                        <div className="ad-item-body" style={{ display: 'flex', background: t.cardBg, minHeight: '180px' }}>
                          {ad.image_url && (
                            <div className="ad-item-image" style={{ flexShrink: 0, width: '200px', borderRight: t.border }}>
                              <img src={ad.image_url} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                          )}
                          <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                            {[
                              { label: 'Headline',    val: ad.headline },
                              { label: 'Description', val: ad.description },
                              { label: 'CTA Button',  val: ad.cta_button },
                              { label: 'Audience',    val: ad.target_audience },
                              { label: 'Age Range',   val: ad.target_age_min ? `${ad.target_age_min} - ${ad.target_age_max} yrs` : null },
                              { label: 'Form URL',    val: ad.lead_form_url },
                            ].filter(f => f.val).map((field, j) => (
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: `0.5px solid ${t.borderColor}`, fontSize: '13px', gap: '16px' }}>
                                <span style={{ color: t.textSecondary, flexShrink: 0, fontWeight: '500', minWidth: '90px' }}>{field.label}</span>
                                <span style={{ color: t.textPrimary, fontWeight: '500', textAlign: 'right', wordBreak: 'break-word' }}>{field.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform Stats */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ ...styles.cardTitle, marginBottom: 0 }}>Platform Performance Breakdown</div>
          <button
            onClick={handleSyncStats}
            disabled={syncing}
            style={styles.syncBtn(syncing)}
          >
            <RefreshCw size={13} style={{ animation: syncing ? 'spin 0.9s linear infinite' : 'none' }} />
            {syncing ? 'Syncing...' : 'Refresh Stats'}
          </button>
        </div>
        {syncError && (
          <div style={styles.errorBanner}>
            {syncError}
          </div>
        )}
        {platformStats.length === 0 ? (
          <div style={styles.empty}>No platform is Connected.</div>
        ) : (
          <div className="table-scroll">
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Platform', 'Impressions', 'Clicks', 'Budget Spent', 'Leads', 'CPL', 'CTR'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platformStats.map((stat, i) => {
                  const color = platformColors[stat.platform_name] || t.textMuted
                  const icon = platformIcons[stat.platform_name] || '?'
                  const ctr = stat.impressions > 0 ? ((stat.clicks / stat.impressions) * 100).toFixed(2) : '0.00'
                  return (
                    <tr key={i} className="cd-row" style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.platformCell}>
                          <div style={{ ...styles.platIcon, background: color, padding: '4px' }}>
  <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
</div>
                          <span style={{ fontWeight: '500' }}>{stat.platform_name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{(stat.impressions || 0).toLocaleString()}</td>
                      <td style={styles.td}>{(stat.clicks || 0).toLocaleString()}</td>
                      <td style={styles.td}>₹{(stat.budget_spent || 0).toLocaleString()}</td>
                      <td style={styles.td}>{isLeadGen ? (leadsByPlatform[stat.platform_name] || 0) : (stat.leads || 0)}</td>
<td style={styles.td}>
                        {(() => {
                          const platformLeads = isLeadGen ? (leadsByPlatform[stat.platform_name] || 0) : (stat.leads || 0)
                          const platformCpl = platformLeads > 0 ? (stat.budget_spent / platformLeads).toFixed(2) : 0
                          return (
                            <span style={platformCpl > 0 ? styles.cplRed : styles.cplGray}>
                              {platformCpl > 0 ? `₹${platformCpl}` : '—'}
                            </span>
                          )
                        })()}
                      </td>
                      <td style={styles.td}>{ctr}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Info */}
      <div className="info-grid" style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <div style={styles.cardTitle}>Campaign Info</div>
          {[
            { label: 'Campaign Name',  val: campaign.name },
            { label: 'Goal',           val: campaign.goal },
            { label: 'Industry',       val: campaign.industry || '—' },
            { label: 'Sub Category',   val: campaign.sub_category || '—' },
            { label: 'Business Niche', val: campaign.business_niche || '—' },
            { label: 'Start Date',     val: campaign.start_date || '—' },
            { label: 'End Date',       val: campaign.end_date || '—' },
            { label: 'Daily Budget',   val: `₹${(campaign.budget || 0).toLocaleString()}` },
            { label: 'Total Budget',   val: `₹${(campaign.total_budget || 0).toLocaleString()}` },
            { label: 'Status',         val: campaign.status },
            { label: 'Age Targeting',  val: campaign.targeting?.age_min ? `${campaign.targeting.age_min} - ${campaign.targeting.age_max} Years` : '—' },
            { label: 'Location',       val: campaign.targeting?.locations || '—' },
            { label: 'Radius',         val: campaign.targeting?.radius_km ? `${campaign.targeting.radius_km} km` : '—' },
          ].map((item, i) => (
            <div key={i} style={styles.infoRow}>
              <span style={styles.infoLabel}>{item.label}</span>
              <span style={styles.infoVal}>{item.val}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.infoCard}>
            <div style={styles.cardTitle}>Connected Platforms</div>
            {platformStats.length === 0 ? (
              <div>
                <p style={{ color: t.textSecondary, fontSize: '13px', marginBottom: '12px' }}>
                  No platforms connected yet. Will show here once advanced access is approved.
                </p>
                {campaign.ad_contents && campaign.ad_contents.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ad content created for:</div>
                    {campaign.ad_contents.map((ad, i) => {
                      const color = platformColors[ad.platform_name] || t.textMuted
                      const icon = platformIcons[ad.platform_name] || '?'
                      return (
                        <div key={i} style={styles.platformRow}>
                          <div style={{ ...styles.platIcon, background: color, padding: '4px' }}>
  <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
</div>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{ad.platform_name}</span>
                          <span style={{ ...styles.connectedBadge, background: t.badgeAmber.bg, color: t.badgeAmber.color, border: `1px solid ${t.badgeAmber.border}` }}>
                            <Hourglass size={11} /> Pending
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              platformStats.map((stat, i) => {
                const color = platformColors[stat.platform_name] || t.textMuted
                const icon = platformIcons[stat.platform_name] || '?'
                return (
                  <div key={i} style={styles.platformRow}>
                    <div style={{ ...styles.platIcon, background: color, padding: '4px' }}>
  <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
</div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{stat.platform_name}</span>
                    <span style={{ ...styles.connectedBadge, background: t.badgeGreen.bg, color: t.badgeGreen.color, border: `1px solid ${t.badgeGreen.border}` }}>
                      <CheckCircle2 size={11} /> Connected
                    </span>
                  </div>
                )
              })
            )}

            {campaign.goal === 'LEAD_GEN' && (
              <div style={{ marginTop: '12px', background: t.accentLight, borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: t.textSecondary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}><Link2 size={11} /> Lead Form Link:</div>
                <div style={{ fontSize: '11px', color: t.accent, fontWeight: '600', wordBreak: 'break-all', marginBottom: '6px' }}>
                  {window.location.origin}/lead/{campaignId}
                </div>
                <button
                  style={styles.copyBtn}
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/lead/${campaignId}`)}>
                  <Copy size={12} /> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {isLeadGen && (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={styles.cardTitle}>Leads from Form ({submissions.length})</div>
          {submissions.length > 0 && (
            <span style={{ fontSize: '11px', color: t.textMuted }}>Click on a lead to see full details</span>
          )}
        </div>

        {leadsLoading ? (
          <div style={styles.empty}>Loading leads...</div>
        ) : submissions.length === 0 ? (
          <div style={styles.empty}>
            Abhi koi leads nahi aaye. Share your form link to get leads!
            <div style={{ marginTop: '8px', background: t.accentLight, borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: t.accent, fontWeight: '600', wordBreak: 'break-all' }}>
              Form Link: {window.location.origin}/lead/{campaignId}
            </div>
          </div>
        ) : (
          <div className="table-scroll">
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Name', 'Phone', 'Email', 'Platform', 'Score', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((lead, i) => (
                  <tr key={lead.id || i}
                    className="cd-row"
                    style={{ ...styles.tr, cursor: 'pointer' }}
                    onClick={() => setSelectedLead(lead)}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.avatar}>
                          {(lead.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: t.accent }}>{lead.full_name || '—'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{lead.phone || '—'}</td>
                    <td style={styles.td}>{lead.email || '—'}</td>
                    <td style={styles.td}>
                      <span style={styles.platformBadge}>
                        {lead.platform || 'Direct'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.scorePill(lead.quality_score)}>
                        {lead.quality_score || 0}/10
                      </span>
                    </td>
                    <td style={styles.td}>
                      {lead.status ? (
                        <span style={{
                          padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                          background: (statusColors[lead.status] || statusColors['Not Connected']).bg,
                          color: (statusColors[lead.status] || statusColors['Not Connected']).text,
                          border: `1px solid ${(statusColors[lead.status] || statusColors['Not Connected']).border}`,
                        }}>
                          {lead.status}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: t.textMuted }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewDetailsBtn}
                        onClick={e => { e.stopPropagation(); setSelectedLead(lead) }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <div style={styles.modalOverlay} onClick={() => setSelectedLead(null)}>
          <div className="modal" style={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ ...styles.avatar, width: '44px', height: '44px', fontSize: '18px' }}>
                  {(selectedLead.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: t.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLead.full_name}</div>
                  <div style={{ fontSize: '12px', color: t.textSecondary }}>
                    {selectedLead.form_type?.replace(/_/g, ' ').toUpperCase()} • {selectedLead.platform || 'Direct'}
                  </div>
                </div>
              </div>
              <button style={styles.modalCloseBtn}
                onClick={() => setSelectedLead(null)}><X size={18} /></button>
            </div>

            {/* Score / Platform / Date chips */}
            <div className="lead-chips-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Quality Score', val: `${selectedLead.quality_score || 0}/10`, color: selectedLead.quality_score >= 8 ? '#16a34a' : selectedLead.quality_score >= 5 ? '#ca8a04' : '#dc2626' },
                { label: 'Platform', val: selectedLead.platform || 'Direct', color: t.accent },
                { label: 'Date', val: selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('en-IN') : '—', color: t.textSecondary },
              ].map((item, i) => (
                <div key={i} style={styles.chipCard}>
                  <div style={{ fontSize: '10px', color: t.textMuted, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* ── Status ── */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}><Tag size={13} /> Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {STATUS_OPTIONS.map(opt => {
                  const isActive = selectedLead.status === opt
                  const c = statusColors[opt] || statusColors['Not Connected']
                  return (
                    <button
                      key={opt}
                      className="cd-status-pill"
                      onClick={() => handleStatusChange(selectedLead, opt)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: isActive ? c.bg : t.inputBg,
                        color: isActive ? c.text : t.textSecondary,
                        border: `1.5px solid ${isActive ? c.border : t.borderColor}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contact Details */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}><ClipboardList size={13} /> Contact Details</div>
              {[
                { label: 'Full Name',    val: selectedLead.full_name },
                { label: 'Phone',        val: selectedLead.phone },
                { label: 'Email',        val: selectedLead.email },
                { label: 'Location',     val: selectedLead.location },
                { label: 'Budget Range', val: selectedLead.budget_range },
                { label: 'Timeline',     val: selectedLead.timeline },
                { label: 'Requirement',  val: selectedLead.requirement },
              ].filter(f => f.val).map((field, i) => (
                <div key={i} style={styles.modalRow}>
                  <span style={styles.modalLabel}>{field.label}</span>
                  <span style={styles.modalVal}>{field.val}</span>
                </div>
              ))}
            </div>

            {/* Extra / Additional Details */}
            {selectedLead.extra_data && Object.keys(selectedLead.extra_data).length > 0 && (
              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>📊 Additional Details</div>
                {Object.entries(selectedLead.extra_data).map(([key, val], i) => (
                  <div key={i} style={styles.modalRow}>
                    <span style={styles.modalLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span style={styles.modalVal}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Timeline ── */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}><Clock size={13} /> Timeline</div>
              <div style={{ paddingLeft: '4px' }}>
                {getLeadTimeline(selectedLead).map((item, i, arr) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: '18px', paddingBottom: i === arr.length - 1 ? '0' : '16px' }}>
                    {/* dot */}
                    <div style={{ position: 'absolute', left: 0, top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: t.accent }} />
                    {/* connecting line */}
                    {i !== arr.length - 1 && (
                      <div style={{ position: 'absolute', left: '3.5px', top: '11px', bottom: '-4px', width: '1px', background: t.borderColor }} />
                    )}
                    <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '2px' }}>{formatActivityDate(item.at)}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: t.textPrimary }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action Buttons: Call / WhatsApp / Email ── */}
            <div className="action-buttons-row" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>

              {/* Call Now */}
              <a
                href={`tel:${selectedLead.phone}`}
                style={styles.actionBtnCall}
              >
                <Phone size={14} /> Call Now
              </a>

              {/* WhatsApp */}
              {selectedLead.phone && (
                <a
                  href={getWhatsAppUrl(selectedLead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.actionBtnWhatsapp}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}

              {/* Send Email */}
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}`}
                  style={styles.actionBtnEmail}
                >
                  <Mail size={14} /> Send Email
                </a>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

/* ── Theme-driven style factory (values only — same structure/keys as before) ── */
const getStyles = (t, darkMode) => ({
  container:    { padding: '24px', background: darkMode ? 'linear-gradient(135deg,#05101f 0%,#091830 50%,#05101f 100%)' : t.pageBg, minHeight: '100vh', boxSizing: 'border-box', fontFamily: "'Inter',system-ui,-apple-system,sans-serif" },
  loading:      { textAlign: 'center', padding: '60px', color: t.emptyColor, fontSize: '14px', background: darkMode ? '#05101f' : t.pageBg, minHeight: '100vh' },
  header:       { marginBottom: '20px' },
  backBtn:      { background: 'none', border: 'none', color: t.accent, fontSize: '13px', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' },
  iconBtn:      { background: darkMode ? 'rgba(255,255,255,0.07)' : t.accentLight, border: darkMode ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${t.accentBorder}`, cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent },
  headerRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  title:        { fontSize: '22px', fontWeight: '800', color: t.textPrimary, margin: '0 0 8px 0', letterSpacing: '-0.3px' },
  metaRow:      { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  goalBadge:    { background: t.badgeBlue.bg, color: t.badgeBlue.color, border: `1px solid ${t.badgeBlue.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  nicheBadge:   { background: t.inputBg, color: t.textSecondary, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', border: t.border },
  badgeActive:  { background: t.badgeGreen.bg, color: t.badgeGreen.color, border: `1px solid ${t.badgeGreen.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  badgePaused:  { background: t.badgeAmber.bg, color: t.badgeAmber.color, border: `1px solid ${t.badgeAmber.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  adContentBtn: { background: 'linear-gradient(135deg,#2b7fff,#1668f5)', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(43,127,255,0.35)' },
  kpiRow:       { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '18px' },
  kpiCard:      { border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.05)', borderRadius: '18px', padding: '16px 18px', minWidth: 0, boxShadow: darkMode ? 'none' : '0 4px 14px rgba(43,127,255,0.08)' },
  kpiLabel:     { fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
  kpiVal:       { fontSize: '20px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.3px' },
  card:         { background: t.cardBg, border: t.border, borderRadius: '20px', padding: '22px', marginBottom: '16px', ...(darkMode ? { backdropFilter: 'blur(16px)' } : { boxShadow: t.shadow }) },
  cardTitle:    { fontSize: '11px', fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th:           { padding: '10px 10px', textAlign: 'left', color: t.textMuted, fontWeight: '700', borderBottom: t.border, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', background: t.tableHeadBg },
  tr:           { borderBottom: `1px solid ${t.borderColor}`, '--cd-row-hover': t.rowHover },
  td:           { padding: '12px 10px', color: t.textPrimary, verticalAlign: 'middle' },
  platformCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  platIcon:     { width: '24px', height: '24px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
  cplRed:       { color: t.badgeRed.color, fontWeight: '600' },
  cplGray:      { color: t.textMuted },
  empty:        { textAlign: 'center', padding: '30px', color: t.emptyColor, fontSize: '13px' },
  infoGrid:     { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', marginBottom: '16px' },
  infoCard:     { background: t.cardBg, border: t.border, borderRadius: '20px', padding: '22px', ...(darkMode ? { backdropFilter: 'blur(16px)' } : { boxShadow: t.shadow }) },
  infoRow:      { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${t.borderColor}`, gap: '12px', flexWrap: 'wrap' },
  infoLabel:    { fontSize: '12px', color: t.textSecondary },
  infoVal:      { fontSize: '12px', color: t.textPrimary, fontWeight: '600', textAlign: 'right' },
  platformRow:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: `1px solid ${t.borderColor}` },
  connectedBadge: { marginLeft: 'auto', padding: '2px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' },
  copyBtn:      { background: 'linear-gradient(135deg,#2b7fff,#1668f5)', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '5px' },
  avatar:       { width: '28px', height: '28px', borderRadius: '50%', background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px', color: '#fff', flexShrink: 0 },
  platformBadge:{ background: t.badgeBlue.bg, color: t.badgeBlue.color, border: `1px solid ${t.badgeBlue.border}`, padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700' },
  scorePill:    (score) => ({
    padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
    background: score >= 8 ? t.badgeGreen.bg : score >= 5 ? t.badgeAmber.bg : t.badgeRed.bg,
    color: score >= 8 ? t.badgeGreen.color : score >= 5 ? t.badgeAmber.color : t.badgeRed.color,
    border: `1px solid ${score >= 8 ? t.badgeGreen.border : score >= 5 ? t.badgeAmber.border : t.badgeRed.border}`,
  }),
  viewDetailsBtn: { background: 'linear-gradient(135deg,#2b7fff,#1668f5)', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  syncBtn:      (syncing) => ({
    background: syncing ? '#93b8f4' : 'linear-gradient(135deg,#2b7fff,#1660e8)',
    color: '#fff', border: 'none', borderRadius: '20px',
    padding: '7px 16px', fontSize: '12px', fontWeight: '700',
    cursor: syncing ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: syncing ? 'none' : '0 4px 14px rgba(43,127,255,0.35)',
  }),
  errorBanner:  { background: t.badgeRed.bg, color: t.badgeRed.color, border: `1px solid ${t.badgeRed.border}`, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal:        { background: t.cardBg, borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', boxSizing: 'border-box', ...(darkMode ? { backdropFilter: 'blur(20px)', border: t.border } : {}) },
  modalCloseBtn:{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.textMuted, flexShrink: 0, display: 'flex', alignItems: 'center' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: t.border, gap: '10px' },
  chipCard:     { flex: 1, background: t.inputBg, borderRadius: '10px', padding: '10px 12px', border: t.border },
  modalSection: { background: t.inputBg, borderRadius: '12px', padding: '14px', marginBottom: '12px', border: t.border },
  modalSectionTitle: { fontSize: '12px', fontWeight: '700', color: t.textPrimary, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' },
  modalRow:     { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${t.borderColor}`, gap: '10px' },
  modalLabel:   { fontSize: '12px', color: t.textSecondary, flexShrink: 0 },
  modalVal:     { fontSize: '12px', color: t.textPrimary, fontWeight: '600', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' },
  scoreBadge:   { background: t.badgeGreen.bg, color: t.badgeGreen.color, border: `1px solid ${t.badgeGreen.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  actionBtnCall:      { flex: 1, padding: '12px 8px', borderRadius: '12px', background: 'linear-gradient(135deg,#2b7fff,#1668f5)', color: '#fff', textAlign: 'center', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(43,127,255,0.35)' },
  actionBtnWhatsapp:  { flex: 1, padding: '12px 8px', borderRadius: '12px', background: '#25D366', color: '#fff', textAlign: 'center', fontSize: '13px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' },
  actionBtnEmail:     { flex: 1, padding: '12px 8px', borderRadius: '12px', background: t.accentLight, color: t.accent, textAlign: 'center', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: `1.5px solid ${t.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
})

export default CampaignDetail