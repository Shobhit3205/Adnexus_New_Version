import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCampaignDetail } from '../services/api'

const platformColors = {
  'Google Ads': '#1A73E8',
  'LinkedIn': '#0A66C2',
  'Facebook': '#1877F2',
  'Instagram': '#E1306C',
}

const platformIcons = {
  'Google Ads': 'G',
  'LinkedIn': 'in',
  'Facebook': 'f',
  'Instagram': '📷',
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

// ── Responsive stylesheet (media queries override inline styles via className + !important) ──
const RESPONSIVE_STYLES = `
*::-webkit-scrollbar{display:none}
*{scrollbar-width:none;-ms-overflow-style:none}

.table-scroll{ width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.table-scroll table{ min-width:640px; }

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
  .kpi-val{ font-size: 16px !important; }
  .ad-item-body{ flex-direction: column !important; }
  .ad-item-image{ width: 100% !important; height: 180px !important; border-right: none !important; border-bottom: 1px solid #e8eaf0 !important; }
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
        const res = await fetch(`http://127.0.0.1:8000/public/submissions/${campaignId}`)
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

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (!campaign) return <div style={styles.loading}>Campaign nahi mila!</div>

  const platformStats = campaign.platform_stats || []
  const totalImpressions = platformStats.reduce((sum, s) => sum + (s.impressions || 0), 0)
  const totalClicks = platformStats.reduce((sum, s) => sum + (s.clicks || 0), 0)
  const totalLeads = platformStats.reduce((sum, s) => sum + (s.leads || 0), 0)
  const totalSpent = platformStats.reduce((sum, s) => sum + (s.budget_spent || 0), 0)
  const unifiedCPL = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 0

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
      await fetch(`http://127.0.0.1:8000/public/submissions/${lead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (err) {
      console.error('Status update sync error:', err.message)
    }
  }

  return (
    <div className="page-container" style={styles.container}>
      <style>{RESPONSIVE_STYLES}</style>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Back to Dashboard</button>
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
            {showAdContent ? '✕ Close Ad Content' : '📝 Manage Ad Content'}
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
          { label: 'Total Leads',       val: totalLeads },
          { label: 'Unified CPL',       val: `₹${unifiedCPL}` },
        ].map((k, i) => (
          <div key={i} style={styles.kpiCard}>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div className="kpi-val" style={styles.kpiVal}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Ad Content Modal */}
      {showAdContent && (
        <div style={styles.modalOverlay} onClick={() => setShowAdContent(false)}>
          <div className="modal" style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '860px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8eaf0', flexShrink: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e' }}>📝 Ad Content per Platform</div>
              <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8892b0', lineHeight: 1 }}
                onClick={() => setShowAdContent(false)}>✕</button>
            </div>
            <div style={{ padding: '24px', flex: 1 }}>
              {(!campaign.ad_contents || campaign.ad_contents.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '12px' }}>No ad content created yet.</p>
                  <button style={styles.adContentBtn} onClick={() => navigate(`/campaign/${campaignId}/ad-content`)}>
                    + Create Ad Content
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {campaign.ad_contents.map((ad, i) => {
                    const color = platformColors[ad.platform_name] || '#8892b0'
                    const icon = platformIcons[ad.platform_name] || '?'
                    return (
                      <div key={i} style={{ border: '1px solid #e8eaf0', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: color + '12', borderBottom: '1px solid #e8eaf0' }}>
                          <div style={{ ...styles.platIcon, background: color }}>{icon}</div>
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>{ad.platform_name}</span>
                          {ad.creative_score > 0 && (
                            <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                              {ad.creative_score}/100
                            </span>
                          )}
                        </div>
                        <div className="ad-item-body" style={{ display: 'flex', background: '#fff', minHeight: '180px' }}>
                          {ad.image_url && (
                            <div className="ad-item-image" style={{ flexShrink: 0, width: '200px', borderRight: '1px solid #e8eaf0' }}>
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
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '0.5px solid #f0f2f8', fontSize: '13px', gap: '16px' }}>
                                <span style={{ color: '#8892b0', flexShrink: 0, fontWeight: '500', minWidth: '90px' }}>{field.label}</span>
                                <span style={{ color: '#1a1a2e', fontWeight: '500', textAlign: 'right', wordBreak: 'break-word' }}>{field.val}</span>
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
        <div style={styles.cardTitle}>Platform Performance Breakdown</div>
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
                  const color = platformColors[stat.platform_name] || '#8892b0'
                  const icon = platformIcons[stat.platform_name] || '?'
                  const ctr = stat.impressions > 0 ? ((stat.clicks / stat.impressions) * 100).toFixed(2) : '0.00'
                  return (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.platformCell}>
                          <div style={{ ...styles.platIcon, background: color }}>{icon}</div>
                          <span style={{ fontWeight: '500' }}>{stat.platform_name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{(stat.impressions || 0).toLocaleString()}</td>
                      <td style={styles.td}>{(stat.clicks || 0).toLocaleString()}</td>
                      <td style={styles.td}>₹{(stat.budget_spent || 0).toLocaleString()}</td>
                      <td style={styles.td}>{stat.leads || 0}</td>
                      <td style={styles.td}>
                        <span style={stat.cpl > 0 ? styles.cplRed : styles.cplGray}>
                          {stat.cpl > 0 ? `₹${stat.cpl}` : '—'}
                        </span>
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
                <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '12px' }}>
                  No platforms connected yet. Will show here once advanced access is approved.
                </p>
                {campaign.ad_contents && campaign.ad_contents.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '8px', fontWeight: '600' }}>AD CONTENT CREATED FOR:</div>
                    {campaign.ad_contents.map((ad, i) => {
                      const color = platformColors[ad.platform_name] || '#8892b0'
                      const icon = platformIcons[ad.platform_name] || '?'
                      return (
                        <div key={i} style={styles.platformRow}>
                          <div style={{ ...styles.platIcon, background: color }}>{icon}</div>
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{ad.platform_name}</span>
                          <span style={{ ...styles.connectedBadge, background: '#fef9c3', color: '#ca8a04' }}>⏳ Pending</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              platformStats.map((stat, i) => {
                const color = platformColors[stat.platform_name] || '#8892b0'
                const icon = platformIcons[stat.platform_name] || '?'
                return (
                  <div key={i} style={styles.platformRow}>
                    <div style={{ ...styles.platIcon, background: color }}>{icon}</div>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{stat.platform_name}</span>
                    <span style={styles.connectedBadge}>✅ Connected</span>
                  </div>
                )
              })
            )}

            {campaign.goal === 'LEAD_GEN' && (
              <div style={{ marginTop: '12px', background: '#f0f4ff', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '4px' }}>🔗 Lead Form Link:</div>
                <div style={{ fontSize: '11px', color: '#1A73E8', fontWeight: '600', wordBreak: 'break-all', marginBottom: '6px' }}>
                  {window.location.origin}/lead/{campaignId}
                </div>
                <button
                  style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/lead/${campaignId}`)}>
                  📋 Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={styles.cardTitle}>Leads from Form ({submissions.length})</div>
          {submissions.length > 0 && (
            <span style={{ fontSize: '11px', color: '#8892b0' }}>Click on a lead to see full details</span>
          )}
        </div>

        {leadsLoading ? (
          <div style={styles.empty}>Loading leads...</div>
        ) : submissions.length === 0 ? (
          <div style={styles.empty}>
            Abhi koi leads nahi aaye. Share your form link to get leads!
            <div style={{ marginTop: '8px', background: '#f0f4ff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#1A73E8', fontWeight: '600', wordBreak: 'break-all' }}>
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
                    style={{ ...styles.tr, background: i % 2 === 0 ? '#fafbfd' : '#fff', cursor: 'pointer' }}
                    onClick={() => setSelectedLead(lead)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fafbfd' : '#fff'}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e8f0fe', color: '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                          {(lead.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: '#1A73E8' }}>{lead.full_name || '—'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{lead.phone || '—'}</td>
                    <td style={styles.td}>{lead.email || '—'}</td>
                    <td style={styles.td}>
                      <span style={{ background: '#e8f0fe', color: '#1A73E8', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                        {lead.platform || 'Direct'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                        background: lead.quality_score >= 8 ? '#dcfce7' : lead.quality_score >= 5 ? '#fef9c3' : '#fee2e2',
                        color: lead.quality_score >= 8 ? '#16a34a' : lead.quality_score >= 5 ? '#ca8a04' : '#dc2626',
                      }}>
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
                        <span style={{ fontSize: '10px', color: '#c7ccdb' }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={styles.td}>
                      <button
                        style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
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

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <div style={styles.modalOverlay} onClick={() => setSelectedLead(null)}>
          <div className="modal" style={styles.modal} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e8f0fe', color: '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', flexShrink: 0 }}>
                  {(selectedLead.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLead.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#8892b0' }}>
                    {selectedLead.form_type?.replace(/_/g, ' ').toUpperCase()} • {selectedLead.platform || 'Direct'}
                  </div>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8892b0', flexShrink: 0 }}
                onClick={() => setSelectedLead(null)}>✕</button>
            </div>

            {/* Score / Platform / Date chips */}
            <div className="lead-chips-row" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Quality Score', val: `${selectedLead.quality_score || 0}/10`, color: selectedLead.quality_score >= 8 ? '#16a34a' : selectedLead.quality_score >= 5 ? '#ca8a04' : '#dc2626' },
                { label: 'Platform', val: selectedLead.platform || 'Direct', color: '#1A73E8' },
                { label: 'Date', val: selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('en-IN') : '—', color: '#8892b0' },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, background: '#f8faff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e8eaf0' }}>
                  <div style={{ fontSize: '10px', color: '#8892b0', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* ── Status ── */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>🏷️ Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {STATUS_OPTIONS.map(opt => {
                  const isActive = selectedLead.status === opt
                  const c = statusColors[opt] || statusColors['Not Connected']
                  return (
                    <button
                      key={opt}
                      onClick={() => handleStatusChange(selectedLead, opt)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: isActive ? c.bg : '#fff',
                        color: isActive ? c.text : '#5a6178',
                        border: `1.5px solid ${isActive ? c.border : '#e0e4ef'}`,
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
              <div style={styles.modalSectionTitle}>📋 Contact Details</div>
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
              <div style={styles.modalSectionTitle}>🕐 Timeline</div>
              <div style={{ paddingLeft: '4px' }}>
                {getLeadTimeline(selectedLead).map((item, i, arr) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: '18px', paddingBottom: i === arr.length - 1 ? '0' : '16px' }}>
                    {/* dot */}
                    <div style={{ position: 'absolute', left: 0, top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: '#1A73E8' }} />
                    {/* connecting line */}
                    {i !== arr.length - 1 && (
                      <div style={{ position: 'absolute', left: '3.5px', top: '11px', bottom: '-4px', width: '1px', background: '#e0e4ef' }} />
                    )}
                    <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '2px' }}>{formatActivityDate(item.at)}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1a1a2e' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action Buttons: Call / WhatsApp / Email ── */}
            <div className="action-buttons-row" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>

              {/* 📞 Call Now */}
              <a
                href={`tel:${selectedLead.phone}`}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: '10px',
                  background: '#1A73E8', color: '#fff',
                  textAlign: 'center', fontSize: '13px', fontWeight: '600',
                  textDecoration: 'none', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px',
                }}
              >
                📞 Call Now
              </a>

              {/* 💬 WhatsApp */}
              {selectedLead.phone && (
                <a
                  href={getWhatsAppUrl(selectedLead.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: '10px',
                    background: '#25D366', color: '#fff',
                    textAlign: 'center', fontSize: '13px', fontWeight: '600',
                    textDecoration: 'none', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '6px',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}

              {/* ✉️ Send Email */}
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}`}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: '10px',
                    background: '#f0f4ff', color: '#1A73E8',
                    textAlign: 'center', fontSize: '13px', fontWeight: '600',
                    textDecoration: 'none', border: '1.5px solid #c7d2fe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  ✉️ Send Email
                </a>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container:    { padding: '24px', background: '#f4f6fb', minHeight: '100vh', boxSizing: 'border-box' },
  loading:      { textAlign: 'center', padding: '60px', color: '#8892b0', fontSize: '14px' },
  header:       { marginBottom: '20px' },
  backBtn:      { background: 'none', border: 'none', color: '#1A73E8', fontSize: '13px', cursor: 'pointer', marginBottom: '10px', padding: 0, fontFamily: 'inherit' },
  headerRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  title:        { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px 0' },
  metaRow:      { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  goalBadge:    { background: '#e8f0fe', color: '#1A73E8', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  nicheBadge:   { background: '#f4f6fb', color: '#8892b0', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', border: '0.5px solid #e0e4ef' },
  badgeActive:  { background: '#e6f9f0', color: '#1b7a4a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  badgePaused:  { background: '#fff3e0', color: '#e65100', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  adContentBtn: { background: '#1A73E8', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  kpiRow:       { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '16px' },
  kpiCard:      { background: '#fff', border: '0.5px solid #e0e4ef', borderRadius: '10px', padding: '14px 16px', minWidth: 0 },
  kpiLabel:     { fontSize: '10px', fontWeight: '500', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  kpiVal:       { fontSize: '18px', fontWeight: '600', color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  card:         { background: '#fff', border: '0.5px solid #e0e4ef', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  cardTitle:    { fontSize: '11px', fontWeight: '600', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th:           { padding: '8px 10px', textAlign: 'left', color: '#8892b0', fontWeight: '500', borderBottom: '0.5px solid #e0e4ef', fontSize: '11px', whiteSpace: 'nowrap' },
  tr:           { borderBottom: '0.5px solid #e0e4ef' },
  td:           { padding: '10px 10px', color: '#1a1a2e', verticalAlign: 'middle' },
  platformCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  platIcon:     { width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  cplRed:       { color: '#c62828', fontWeight: '500' },
  cplGray:      { color: '#8892b0' },
  empty:        { textAlign: 'center', padding: '30px', color: '#8892b0', fontSize: '13px' },
  infoGrid:     { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', marginBottom: '16px' },
  infoCard:     { background: '#fff', border: '0.5px solid #e0e4ef', borderRadius: '12px', padding: '16px' },
  infoRow:      { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #e0e4ef', gap: '12px', flexWrap: 'wrap' },
  infoLabel:    { fontSize: '12px', color: '#8892b0' },
  infoVal:      { fontSize: '12px', color: '#1a1a2e', fontWeight: '500', textAlign: 'right' },
  platformRow:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '0.5px solid #e0e4ef' },
  connectedBadge: { marginLeft: 'auto', background: '#e6f9f0', color: '#1b7a4a', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '500' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal:        { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', boxSizing: 'border-box' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e8eaf0', gap: '10px' },
  modalSection: { background: '#f8faff', borderRadius: '10px', padding: '14px', marginBottom: '12px', border: '1px solid #e8eaf0' },
  modalSectionTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  modalRow:     { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #e8eaf0', gap: '10px' },
  modalLabel:   { fontSize: '12px', color: '#8892b0', flexShrink: 0 },
  modalVal:     { fontSize: '12px', color: '#1a1a2e', fontWeight: '500', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' },
}

export default CampaignDetail