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

const CampaignDetail = () => {
  console.log('CampaignDetail render hua!')
  const { campaignId } = useParams()
  console.log('campaignId:', campaignId)
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [showAdContent, setShowAdContent] = useState(false)

  useEffect(() => {
    console.log('useEffect chala! campaignId =', campaignId)

    const loadData = async () => {
      console.log('loadData start!')

      // Fetch campaign detail
      try {
        console.log('API call kar raha hoon...')
        const res = await getCampaignDetail(campaignId)
        console.log('API success:', res.data)
        setCampaign(res.data)
      } catch (err) {
        console.error('API error:', err.message)
      } finally {
        setLoading(false)
      }

      // Fetch submissions
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

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>{campaign.name}</h1>
            <div style={styles.metaRow}>
              <span style={styles.goalBadge}>{campaign.goal}</span>
              <span style={styles.nicheBadge}>{campaign.business_niche}</span>
              <span style={campaign.status === 'active' ? styles.badgeActive : styles.badgePaused}>
                {campaign.status}
              </span>
            </div>
          </div>
          <button style={styles.adContentBtn} onClick={() => setShowAdContent(!showAdContent)}>
            {showAdContent ? '✕ Close Ad Content' : '📝 Manage Ad Content'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiRow}>
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
            <div style={styles.kpiVal}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Ad Content Modal */}
      {showAdContent && (
        <div style={styles.modalOverlay} onClick={() => setShowAdContent(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '860px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}
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
                        <div style={{ display: 'flex', background: '#fff', minHeight: '180px' }}>
                          {ad.image_url && (
                            <div style={{ flexShrink: 0, width: '200px', borderRight: '1px solid #e8eaf0' }}>
                              <img src={ad.image_url} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                          )}
                          <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
        )}
      </div>

      {/* Campaign Info */}
      <div style={styles.infoGrid}>
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

      {/* Leads from Form */}
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
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
            <div style={{ marginTop: '8px', background: '#f0f4ff', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#1A73E8', fontWeight: '600' }}>
              Form Link: {window.location.origin}/lead/{campaignId}
            </div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Phone', 'Email', 'Platform', 'Score', 'Date', 'Action'].map(h => (
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
                  <td style={styles.td}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={styles.td}>
                    <button
                      style={{ background: '#1A73E8', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={e => { e.stopPropagation(); setSelectedLead(lead) }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div style={styles.modalOverlay} onClick={() => setSelectedLead(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#e8f0fe', color: '#1A73E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                  {(selectedLead.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>{selectedLead.full_name}</div>
                  <div style={{ fontSize: '12px', color: '#8892b0' }}>
                    {selectedLead.form_type?.replace(/_/g, ' ').toUpperCase()} • {selectedLead.platform || 'Direct'}
                  </div>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8892b0' }}
                onClick={() => setSelectedLead(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
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

            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>📋 Contact Details</div>
              {[
                { label: 'Full Name',     val: selectedLead.full_name },
                { label: 'Phone',         val: selectedLead.phone },
                { label: 'Email',         val: selectedLead.email },
                { label: 'Location',      val: selectedLead.location },
                { label: 'Budget Range',  val: selectedLead.budget_range },
                { label: 'Timeline',      val: selectedLead.timeline },
                { label: 'Requirement',   val: selectedLead.requirement },
              ].filter(f => f.val).map((field, i) => (
                <div key={i} style={styles.modalRow}>
                  <span style={styles.modalLabel}>{field.label}</span>
                  <span style={styles.modalVal}>{field.val}</span>
                </div>
              ))}
            </div>

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

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <a href={`tel:${selectedLead.phone}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#1A73E8', color: '#fff', textAlign: 'center', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                📞 Call Now
              </a>
              {selectedLead.email && (
                <a href={`mailto:${selectedLead.email}`} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#f0f4ff', color: '#1A73E8', textAlign: 'center', fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: '1px solid #c7d2fe' }}>
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
  container:    { padding: '24px', background: '#f4f6fb', minHeight: '100vh' },
  loading:      { textAlign: 'center', padding: '60px', color: '#8892b0', fontSize: '14px' },
  header:       { marginBottom: '20px' },
  backBtn:      { background: 'none', border: 'none', color: '#1A73E8', fontSize: '13px', cursor: 'pointer', marginBottom: '10px', padding: 0, fontFamily: 'inherit' },
  headerRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:        { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 8px 0' },
  metaRow:      { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  goalBadge:    { background: '#e8f0fe', color: '#1A73E8', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  nicheBadge:   { background: '#f4f6fb', color: '#8892b0', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', border: '0.5px solid #e0e4ef' },
  badgeActive:  { background: '#e6f9f0', color: '#1b7a4a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  badgePaused:  { background: '#fff3e0', color: '#e65100', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' },
  adContentBtn: { background: '#1A73E8', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
  kpiRow:       { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '16px' },
  kpiCard:      { background: '#fff', border: '0.5px solid #e0e4ef', borderRadius: '10px', padding: '14px 16px' },
  kpiLabel:     { fontSize: '10px', fontWeight: '500', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  kpiVal:       { fontSize: '18px', fontWeight: '600', color: '#1a1a2e' },
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
  infoRow:      { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #e0e4ef' },
  infoLabel:    { fontSize: '12px', color: '#8892b0' },
  infoVal:      { fontSize: '12px', color: '#1a1a2e', fontWeight: '500' },
  platformRow:  { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '0.5px solid #e0e4ef' },
  connectedBadge: { marginLeft: 'auto', background: '#e6f9f0', color: '#1b7a4a', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '500' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal:        { background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e8eaf0' },
  modalSection: { background: '#f8faff', borderRadius: '10px', padding: '14px', marginBottom: '12px', border: '1px solid #e8eaf0' },
  modalSectionTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  modalRow:     { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #e8eaf0' },
  modalLabel:   { fontSize: '12px', color: '#8892b0' },
  modalVal:     { fontSize: '12px', color: '#1a1a2e', fontWeight: '500', textAlign: 'right', maxWidth: '60%' },
}

export default CampaignDetail