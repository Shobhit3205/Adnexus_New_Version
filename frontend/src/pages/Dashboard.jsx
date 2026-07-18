import React, { useState, useEffect } from 'react'
import { getCampaigns, deleteCampaign, getCampaignStats, getLeads } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt = n => {
  if (!n && n !== 0) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toString()
}

/* ── Theme tokens ── */
const LIGHT = {
  // backgrounds
  pageBg:       '#f0f4ff',
  sidebarBg:    '#ffffff',
  topbarBg:     '#ffffff',
  filterbarBg:  '#ffffff',
  cardBg:       '#ffffff',
  kpiBg:        '#ffffff',
  tableHeadBg:  '#f8faff',
  rowHover:     '#f0f4ff',
  inputBg:      '#f0f4ff',
  // borders
  border:       '1px solid #e4e9f5',
  borderColor:  '#e4e9f5',
  // text
  textPrimary:  '#0f172a',
  textSecondary:'#64748b',
  textMuted:    '#94a3b8',
  // accent
  accent:       '#2563eb',
  accentHover:  '#1d4ed8',
  accentLight:  '#eff6ff',
  accentBorder: '#bfdbfe',
  // nav active
  navActiveBg:  '#eff6ff',
  navActiveColor:'#2563eb',
  navColor:     '#64748b',
  // badges
  badgeBlue:    { bg:'#eff6ff',   color:'#1d4ed8', border:'#bfdbfe' },
  badgeGreen:   { bg:'#f0fdf4',   color:'#15803d', border:'#bbf7d0' },
  badgeAmber:   { bg:'#fffbeb',   color:'#b45309', border:'#fde68a' },
  badgePurple:  { bg:'#faf5ff',   color:'#7c3aed', border:'#ddd6fe' },
  badgeRed:     { bg:'#fef2f2',   color:'#dc2626', border:'#fecaca' },
  // misc
  chipBg:       '#eff6ff',
  chipColor:    '#2563eb',
  avatarBg:     'linear-gradient(135deg,#2563eb,#7c3aed)',
  scoreTrack:   '#e2e8f0',
  geoBg:        'linear-gradient(135deg,#eff6ff,#f0f4ff)',
  geoBlob:      'rgba(37,99,235,0.12)',
  geoBlobDeep:  'rgba(37,99,235,0.30)',
  geoText:      '#1e40af',
  aiBoxBg:      '#eff6ff',
  aiBoxBorder:  '#bfdbfe',
  aiBoxColor:   '#1e40af',
  aiDot:        '#2563eb',
  actionHoverBg:'#f8faff',
  manageBg:     '#f8faff',
  manageColor:  '#64748b',
  manageBorder: '#e4e9f5',
  deleteBg:     '#fef2f2',
  deleteColor:  '#dc2626',
  deleteBorder: '#fecaca',
  emptyColor:   '#94a3b8',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  kpiShadow:    '0 1px 3px rgba(0,0,0,0.06)',
}

const DARK = {
  pageBg:       '#05101f',
  sidebarBg:    'rgba(8,20,45,0.85)',
  topbarBg:     'rgba(8,20,45,0.75)',
  filterbarBg:  'rgba(8,20,45,0.6)',
  cardBg:       'rgba(255,255,255,0.055)',
  kpiBg:        'rgba(255,255,255,0.055)',
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
  navActiveBg:  'rgba(59,139,255,0.18)',
  navActiveColor:'#7bb8ff',
  navColor:     'rgba(255,255,255,0.45)',
  badgeBlue:    { bg:'rgba(59,139,255,0.18)',  color:'#93c5fd', border:'rgba(59,139,255,0.3)' },
  badgeGreen:   { bg:'rgba(52,211,153,0.15)',  color:'#6ee7b7', border:'rgba(52,211,153,0.25)' },
  badgeAmber:   { bg:'rgba(251,191,36,0.15)',  color:'#fde68a', border:'rgba(251,191,36,0.25)' },
  badgePurple:  { bg:'rgba(167,139,250,0.15)', color:'#c4b5fd', border:'rgba(167,139,250,0.25)' },
  badgeRed:     { bg:'rgba(248,113,113,0.15)', color:'#fca5a5', border:'rgba(248,113,113,0.25)' },
  chipBg:       'rgba(59,139,255,0.2)',
  chipColor:    '#7bb8ff',
  avatarBg:     'linear-gradient(135deg,#3b8bff,#7b5af0)',
  scoreTrack:   'rgba(255,255,255,0.1)',
  geoBg:        'rgba(59,139,255,0.06)',
  geoBlob:      'rgba(59,139,255,0.15)',
  geoBlobDeep:  'rgba(59,139,255,0.35)',
  geoText:      'rgba(180,210,255,0.8)',
  aiBoxBg:      'rgba(59,139,255,0.08)',
  aiBoxBorder:  'rgba(59,139,255,0.22)',
  aiBoxColor:   'rgba(180,210,255,0.9)',
  aiDot:        '#3b8bff',
  actionHoverBg:'rgba(255,255,255,0.09)',
  manageBg:     'rgba(255,255,255,0.07)',
  manageColor:  'rgba(255,255,255,0.4)',
  manageBorder: 'rgba(255,255,255,0.1)',
  deleteBg:     'rgba(248,113,113,0.12)',
  deleteColor:  '#fca5a5',
  deleteBorder: 'rgba(248,113,113,0.25)',
  emptyColor:   'rgba(255,255,255,0.25)',
  shadow:       'none',
  kpiShadow:    'none',
}

/* ── Sun icon ── */
const SunIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

/* ── Moon icon ── */
const MoonIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Merged styles (was Dashboard.css) ── */
const DashboardStyles = () => (
  <style>{`
    .dashboard-kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }

    .dashboard-midrow {
      display: grid;
      grid-template-columns: 1fr 274px;
      gap: 16px;
      align-items: start;
    }

    .dashboard-left-col,
    .dashboard-right-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dashboard-page {
      min-height: 100vh;
    }

    .dashboard-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .dashboard-topbar,
    .dashboard-filterbar {
      width: 100%;
    }

    .dashboard-table-scroll {
      overflow-x: auto;
      width: 100%;
    }

    .dashboard-table-scroll table {
      min-width: 680px;
      width: 100%;
      border-collapse: collapse;
    }

    .dashboard-table-scroll::-webkit-scrollbar {
      height: 7px;
    }

    .dashboard-table-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .dashboard-table-scroll::-webkit-scrollbar-thumb {
      background: rgba(100, 116, 139, 0.25);
      border-radius: 9999px;
    }

    @media (max-width: 1100px) {
      .dashboard-kpis {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .dashboard-midrow {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .dashboard-kpis {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .dashboard-midrow {
        gap: 12px;
      }

      .dashboard-left-col,
      .dashboard-right-col {
        gap: 12px;
      }

      .dashboard-content {
        padding: 14px !important;
      }

      .dashboard-filterbar {
        flex-wrap: wrap;
        height: auto !important;
        padding: 10px 14px !important;
        gap: 8px !important;
      }

      .dashboard-filterbar > div:last-child {
        margin-left: 0 !important;
        width: 100%;
        justify-content: flex-start;
      }
    }

    @media (max-width: 540px) {
      .dashboard-kpis {
        gap: 10px;
      }

      .dashboard-midrow {
        gap: 10px;
      }

      .dashboard-topbar {
        padding: 0 14px !important;
      }
    }

    @media (max-width: 480px) {
      .dashboard-content {
        padding: 10px !important;
        gap: 12px !important;
      }

      .dashboard-topbar {
        height: auto !important;
        padding: 10px !important;
        flex-wrap: wrap;
        gap: 8px;
      }

      .dashboard-filterbar select {
        max-width: 140px !important;
      }
    }

    .dashboard-mobile-cards {
      display: none;
    }

    @media (max-width: 640px) {
      .dashboard-table-scroll {
        display: none;
      }

      .dashboard-mobile-cards {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }

    @media (max-width: 640px) {
      .dashboard-left-col > div,
      .dashboard-right-col > div {
        padding: 14px 16px !important;
      }
    }
  `}</style>
)

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [campaigns, setCampaigns]       = useState([])
  const [platformStats, setPlatformStats] = useState([])
  const [leads, setLeads]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [activeNav, setActiveNav]       = useState('dashboard')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode]         = useState(false)

  const t = darkMode ? DARK : LIGHT   // active theme tokens

  // Sidebar mein dikhane ke liye logged-in user ka naam/role — koi bhi login kare, sahi naam dikhna chahiye
  const displayName = user?.name || 'User'
  const displayRole = user?.role || 'Member'
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'U'

  useEffect(() => { fetchAll() }, [])

  // Chhoti screens par sidebar apne aap collapse ho jaye taaki content ko jagah mile
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth <= 640) setSidebarCollapsed(true)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const fetchAll = async () => {
    try {
      const [campRes, leadsRes] = await Promise.all([getCampaigns(), getLeads()])
      const list = campRes.data.campaigns || campRes.data || []
      setCampaigns(list)
      const oldLeads = leadsRes.data.leads || leadsRes.data || []
      let formLeads = []
      try {
        for (const camp of list) {
          const res  = await fetch(`http://127.0.0.1:8000/public/submissions/${camp.id}`)
          const data = await res.json()
          formLeads  = [...formLeads, ...(data.submissions || []).map(s => ({ ...s, name: s.full_name, campaign_id: camp.id }))]
        }
      } catch (e) { console.error('Form submissions fetch failed', e) }
      setLeads([...oldLeads, ...formLeads])
      if (list.length > 0) { setSelectedCampaign(list[0]); fetchStats(list[0].id) }
    } catch (err) { console.error('Fetch error:', err) }
    finally { setLoading(false) }
  }

  const fetchStats = async (id) => {
    setStatsLoading(true)
    try {
      const res = await getCampaignStats(id)
      setPlatformStats(res.data.stats || res.data || [])
    } catch { setPlatformStats([]) }
    finally { setStatsLoading(false) }
  }

  const handleCampaignChange = c => { setSelectedCampaign(c); fetchStats(c.id) }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this campaign?')) {
      try { await deleteCampaign(id); fetchAll() } catch {}
    }
  }

  const handleDownloadLeadsPDF = () => {
  if (leads.length === 0) {
    alert('No leads available to download.')
    return
  }

  const doc = new jsPDF()

  // Header
  doc.setFontSize(16)
  doc.setTextColor(37, 99, 235)
  doc.text('AdNexus — Leads Report', 14, 15)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 22)
  doc.text(`Total leads: ${leads.length}`, 14, 27)

  // Table
  autoTable(doc, {
    startY: 33,
    head: [['Name', 'Phone', 'Platform', 'Campaign', 'Date', 'Score']],
    body: leads.map(lead => [
      lead.name || lead.full_name || '—',
      lead.phone || '—',
      lead.platform_name || lead.platform || 'Direct',
      campaigns.find(c => c.id === lead.campaign_id || c.id === String(lead.campaign_id))?.name || '—',
      lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—',
      lead.quality_score != null ? `${lead.quality_score}/10` : '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [240, 244, 255] },
  })

  doc.save(`adnexus-leads-${Date.now()}.pdf`)
}

  const totalBudget     = campaigns.reduce((s, c) => s + (c.budget || 0), 0)
  const totalSpent      = campaigns.reduce((s, c) => s + (c.budget_spent || 0), 0)
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalLeads      = leads.length
  const totalLeadsSpend = platformStats.reduce((s, p) => s + (p.spend || 0), 0)
  const totalLeadsCount = platformStats.reduce((s, p) => s + (p.leads || 0), 0)
  const unifiedCPL      = totalLeadsCount > 0 ? (totalLeadsSpend / totalLeadsCount).toFixed(2) : null
  const campaignLeads   = leads.filter(l =>
    l.campaign_id === selectedCampaign?.id || l.campaign_id === String(selectedCampaign?.id)
  )

  const navItems = [
    { id:'dashboard', label:'Dashboard', action:() => {},
      icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg> },
    { id:'campaigns', label:'Campaigns', action:() => navigate('/dashboard/create-campaign'),
      icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:'leads', label:'Leads', action:() => navigate('/dashboard/leads'),
      icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id:'analytics', label:'Analytics', action:() => {},
      icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
   { id:'settings', label:'Settings', action:() => navigate('/dashboard/settings'),
      icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  ]

  const aiSuggestions = []
  if (platformStats.length > 0) {
    const best = [...platformStats].sort((a, b) => (b.leads || 0) - (a.leads || 0))[0]
    if (best?.leads > 0) aiSuggestions.push(`${best.platform_name || best.platform} has the most leads (${best.leads}) — consider increasing its budget.`)
    const withCPL = platformStats.filter(p => p.leads > 0)
    if (withCPL.length >= 2) {
      const cheapest = [...withCPL].sort((a, b) => (a.spend / a.leads) - (b.spend / b.leads))[0]
      aiSuggestions.push(`${cheapest.platform_name || cheapest.platform} has the lowest CPL (₹${(cheapest.spend / cheapest.leads).toFixed(2)}) — invest more here.`)
    }
  }

  /* ── Helpers ── */
  const badge = (variant, text) => (
    <span style={{
      background: t[variant].bg, color: t[variant].color,
      border: `1px solid ${t[variant].border}`,
      padding:'3px 9px', borderRadius:'20px', fontSize:'10px', fontWeight:'600',
    }}>{text}</span>
  )

  const kpiAccentColors = ['#2563eb','#16a34a','#d97706','#7c3aed']
  const kpiIconColors   = [
    { bg: darkMode ? 'rgba(59,139,255,0.2)'  : '#eff6ff', color: darkMode ? '#7bb8ff' : '#2563eb' },
    { bg: darkMode ? 'rgba(52,211,153,0.2)'  : '#f0fdf4', color: darkMode ? '#6ee7b7' : '#16a34a' },
    { bg: darkMode ? 'rgba(251,191,36,0.2)'  : '#fffbeb', color: darkMode ? '#fde68a' : '#d97706' },
    { bg: darkMode ? 'rgba(167,139,250,0.2)' : '#faf5ff', color: darkMode ? '#c4b5fd' : '#7c3aed' },
  ]

  /* Shared inline styles driven by theme tokens */
  const wrap        = { display:'flex', height:'100vh', background: darkMode ? 'linear-gradient(135deg,#05101f 0%,#091830 50%,#05101f 100%)' : t.pageBg, fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:'13px' }
  const mainCol      = { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, minHeight:0 }
  const sidebar     = { width: sidebarCollapsed ? '60px' : '230px', background: t.sidebarBg, borderRight: t.border, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', transition:'width 0.22s ease', ...(darkMode ? { backdropFilter:'blur(20px)' } : { boxShadow:'1px 0 0 #e4e9f5' }) }
  const sbLogo      = { display:'flex', alignItems:'center', gap:'10px', padding:'18px 16px 14px', borderBottom: t.border, minHeight:'58px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const sbLogoIcon  = { width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 10px rgba(37,99,235,0.4)' }
  const sbLogoText  = { fontSize:'16px', fontWeight:'700', color: t.textPrimary, letterSpacing:'-0.2px', whiteSpace:'nowrap' }
  const sbNav       = { display:'flex', flexDirection:'column', gap:'3px', padding:'12px 10px', flex:1 }
  const navItemBase = { display:'flex', alignItems:'center', gap:'11px', padding:'9px 12px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'13px', fontWeight:'500', color: t.navColor, whiteSpace:'nowrap', overflow:'hidden', transition:'all 0.15s' }
  const navItemActiveStyle = { background: t.navActiveBg, color: t.navActiveColor, ...(darkMode ? { border:'1px solid rgba(59,139,255,0.28)' } : {}) }
  const sbBottom    = { borderTop: t.border, padding:'12px 10px' }
  const userRow     = { display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', cursor:'pointer', marginBottom:'4px', overflow:'hidden', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const userAvatar  = { width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, background: t.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px', color:'#fff' }
  const userName    = { fontSize:'13px', fontWeight:'600', color: t.textPrimary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }
  const userRole    = { fontSize:'11px', color: t.textSecondary, whiteSpace:'nowrap' }
  const collapseBtn = { display:'flex', alignItems:'center', gap:'8px', padding:'8px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', width:'100%', fontFamily:'inherit', whiteSpace:'nowrap', overflow:'hidden', color: t.textSecondary, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const topbar      = { background: t.topbarBg, borderBottom: t.border, padding:'0 24px', height:'54px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, ...(darkMode ? { backdropFilter:'blur(12px)' } : { boxShadow:'0 1px 0 #e4e9f5' }) }
  const topbarTitle = { fontSize:'16px', fontWeight:'700', color: t.textPrimary, letterSpacing:'-0.2px' }
  const iconBtn     = { background: darkMode ? 'rgba(255,255,255,0.07)' : t.accentLight, border: darkMode ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${t.accentBorder}`, cursor:'pointer', width:'34px', height:'34px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color: t.accent }
  const filterbar   = { background: t.filterbarBg, borderBottom: t.border, padding:'0 24px', height:'48px', display:'flex', alignItems:'center', gap:'12px', flexShrink:0, ...(darkMode ? { backdropFilter:'blur(8px)' } : {}) }
  const filterLabel = { fontSize:'11px', color: t.textMuted, fontWeight:'500', textTransform:'uppercase', letterSpacing:'0.06em' }
  const filterSelect= { background: t.inputBg, border: `1px solid ${t.borderColor}`, borderRadius:'20px', padding:'5px 14px', fontSize:'12px', color: t.textPrimary, cursor:'pointer', fontFamily:'inherit', outline:'none', maxWidth:'220px' }
  const datePill    = { background: t.inputBg, border: `1px solid ${t.borderColor}`, borderRadius:'20px', padding:'5px 14px', fontSize:'12px', color: t.textSecondary, display:'flex', alignItems:'center', gap:'5px' }
  const btnPrimary  = { background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', border:'none', borderRadius:'10px', padding:'7px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'5px', boxShadow:'0 2px 10px rgba(37,99,235,0.35)' }
  const btnGhost    = { background: darkMode ? 'rgba(255,255,255,0.07)' : '#fff', color: t.accent, border: `1px solid ${t.accentBorder}`, borderRadius:'10px', padding:'7px 16px', fontSize:'12px', fontWeight:'500', cursor:'pointer', fontFamily:'inherit' }
  const content     = { flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:'18px' }
  const card        = { background: t.cardBg, border: t.border, borderRadius:'16px', padding:'20px 22px', ...(darkMode ? { backdropFilter:'blur(16px)' } : { boxShadow: t.shadow }) }
  const cardHeader  = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }
  const cardTitle   = { fontSize:'11px', fontWeight:'700', color: t.textSecondary, textTransform:'uppercase', letterSpacing:'0.08em' }
  const table       = { width:'100%', borderCollapse:'collapse', fontSize:'12px' }
  const th          = { padding:'8px 10px', textAlign:'left', color: t.textMuted, fontWeight:'600', borderBottom: t.border, fontSize:'11px', whiteSpace:'nowrap', background: t.tableHeadBg }
  const td          = { padding:'10px 10px', color: t.textPrimary, verticalAlign:'middle', borderBottom:`1px solid ${t.borderColor}` }
  const chip        = { width:'26px', height:'26px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'11px', flexShrink:0, background: t.chipBg, color: t.chipColor }
  const avatar      = { width:'28px', height:'28px', borderRadius:'50%', background: t.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'11px', color:'#fff', flexShrink:0 }
  const manageBtn   = { background: t.manageBg, color: t.manageColor, border:`1px solid ${t.manageBorder}`, borderRadius:'7px', padding:'4px 10px', fontSize:'11px', cursor:'default', fontFamily:'inherit' }
  const deleteBtn   = { background: t.deleteBg, color: t.deleteColor, border:`1px solid ${t.deleteBorder}`, borderRadius:'7px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', fontFamily:'inherit' }
  const scoreBar    = { width:'56px', height:'4px', borderRadius:'2px', background: t.scoreTrack, overflow:'hidden' }
  const geoMap      = { background: t.geoBg, border: t.border, borderRadius:'12px', height:'128px', overflow:'hidden', marginBottom:'14px' }
  const targetRow   = { display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'6px 0', borderBottom:`1px solid ${t.borderColor}` }
  const actionBtn   = { width:'100%', padding:'10px 14px', borderRadius:'12px', border: t.border, background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.textPrimary, fontSize:'12px', fontWeight:'500', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', fontFamily:'inherit', textAlign:'left', boxShadow: darkMode ? 'none' : t.shadow }
  const actionIcon  = { width:'26px', height:'26px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }
  const aiBox       = { background: t.aiBoxBg, border:`1px solid ${t.aiBoxBorder}`, borderRadius:'12px', padding:'10px 13px', fontSize:'11px', color: t.aiBoxColor, lineHeight:'1.6', display:'flex', gap:'9px', alignItems:'flex-start' }
  const aiPulse     = { width:'7px', height:'7px', borderRadius:'50%', background: t.aiDot, marginTop:'4px', flexShrink:0, boxShadow: darkMode ? '0 0 7px rgba(59,139,255,0.7)' : 'none' }
  const emptyStyle  = { textAlign:'center', padding:'28px', color: t.emptyColor, fontSize:'12px' }

  /* Dark mode toggle button */
  const toggleBtn = {
    display:'flex', alignItems:'center', gap:'6px',
    background: darkMode ? 'rgba(255,255,255,0.1)' : t.accentLight,
    border: darkMode ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${t.accentBorder}`,
    borderRadius:'20px', padding:'5px 12px',
    fontSize:'12px', fontWeight:'500', cursor:'pointer',
    color: darkMode ? '#fff' : t.accent,
    fontFamily:'inherit',
  }

  return (
    <div className="dashboard-page" style={wrap}>
      <DashboardStyles />

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar" style={sidebar}>
        <div style={sbLogo}>
          <div style={sbLogoIcon}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M8 24L16 8L24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 19h11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {!sidebarCollapsed && <span style={sbLogoText}>AdNexus</span>}
        </div>

        <nav style={sbNav}>
          {navItems.map(item => (
            <button key={item.id} title={sidebarCollapsed ? item.label : ''}
              onClick={() => { setActiveNav(item.id); item.action() }}
              style={{ ...navItemBase, ...(activeNav === item.id ? navItemActiveStyle : {}), justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <span style={{ flexShrink:0, display:'flex' }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ overflow:'hidden', whiteSpace:'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={sbBottom}>
          <div style={userRow}>
            <div style={userAvatar}>{displayInitials}</div>
            {!sidebarCollapsed && (
              <>
                <div style={{ flex:1, overflow:'hidden', minWidth:0 }}>
                  <div style={userName}>{displayName}</div>
                  <div style={userRole}>{displayRole}</div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ flexShrink:0, color: t.textMuted }}>
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(v => !v)} style={collapseBtn} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              style={{ flexShrink:0, transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition:'transform 0.22s' }}>
              <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span style={{ fontSize:'12px' }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard-main" style={mainCol}>

        {/* Topbar */}
        <header className="dashboard-topbar" style={topbar}>
          <div style={topbarTitle}>{navItems.find(n => n.id === activeNav)?.label || 'Dashboard'}</div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {/* Dark mode toggle */}
            <button style={toggleBtn} onClick={() => setDarkMode(v => !v)}>
              {darkMode ? <SunIcon /> : <MoonIcon />}
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <button style={iconBtn} title="Notifications">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <button style={iconBtn} title="Help">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </header>

        {/* Filter bar */}
        <div className="dashboard-filterbar" style={filterbar}>
          <span style={filterLabel}>Campaign</span>
          <select style={filterSelect} value={selectedCampaign?.id || ''}
            onChange={e => { const c = campaigns.find(x => x.id === parseInt(e.target.value)); if (c) handleCampaignChange(c) }}>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={datePill}>📅 All time</div>
          <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
            <button style={btnPrimary} onClick={() => navigate('/dashboard/create-campaign')}>+ New campaign</button>
            <button style={btnGhost}   onClick={() => navigate('/dashboard/leads')}>View leads</button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content" style={content}>

          {/* KPI row */}
          <div className="dashboard-kpis">
            {[
              { label:'Total Spend',      value:`₹${totalSpent.toLocaleString()}`, sub: totalBudget > 0 ? ` / ₹${totalBudget.toLocaleString()}` : null },
              { label:'Total Leads',      value: totalLeads || '—' },
              { label:'Unified CPL',      value: unifiedCPL ? `₹${unifiedCPL}` : '—' },
              { label:'Active Campaigns', value: activeCampaigns || '—' },
            ].map((k, i) => (
              <div key={k.label} style={{ background: t.kpiBg, border: t.border, borderRadius:'16px', padding:'20px 20px 18px', position:'relative', overflow:'hidden', ...(darkMode ? { backdropFilter:'blur(12px)' } : { boxShadow: t.kpiShadow }) }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: kpiAccentColors[i], borderRadius:'16px 16px 0 0' }} />
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background: kpiIconColors[i].bg, color: kpiIconColors[i].color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', fontWeight:'700', marginBottom:'14px' }}>
                  {['₹','↗','⌀','◈'][i]}
                </div>
                <div style={{ fontSize:'10px', fontWeight:'600', color: t.textSecondary, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>{k.label}</div>
                <div style={{ fontSize:'24px', fontWeight:'700', color: t.textPrimary, lineHeight:1, letterSpacing:'-0.5px' }}>
                  {k.value}
                  {k.sub && <span style={{ fontSize:'13px', color: t.textMuted, fontWeight:'400' }}>{k.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Mid row */}
          <div className="dashboard-midrow">

            {/* Left col */}
            <div className="dashboard-left-col">

              {/* Platform performance */}
              <div style={card}>
                <div style={cardHeader}>
                  <span style={cardTitle}>Platform Performance</span>
                  {selectedCampaign && badge('badgeBlue', selectedCampaign.name)}
                </div>
                {statsLoading ? <div style={emptyStyle}>Loading stats…</div>
                : platformStats.length === 0 ? <div style={emptyStyle}>{selectedCampaign ? 'No platform data for this campaign yet.' : 'Select a campaign to see stats.'}</div>
                : (
                  <div className="dashboard-table-scroll">
                    <table style={table}>
                      <thead><tr>{['Platform','Impressions','Clicks','Spend','Leads','CPL'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {platformStats.map((p, i) => {
                          const cpl = p.leads > 0 ? (p.spend / p.leads).toFixed(2) : null
                          return (
                            <tr key={p.platform_id || i}>
                            <td style={td}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <div style={chip}>{(p.platform_name || p.platform || 'P').charAt(0).toUpperCase()}</div>
                                <span style={{ fontWeight:'500' }}>{p.platform_name || p.platform || '—'}</span>
                              </div>
                            </td>
                            <td style={td}>{fmt(p.impressions)}</td>
                            <td style={td}>{p.clicks ? p.clicks.toLocaleString() : '—'}</td>
                            <td style={td}>{p.spend ? `₹${p.spend.toLocaleString()}` : '—'}</td>
                            <td style={td}>{badge('badgeBlue', p.leads ?? '—')}</td>
                            <td style={td}>{badge('badgePurple', cpl ? `₹${cpl}` : '—')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>

              {/* Campaigns */}
              <div style={card}>
                <div style={cardHeader}>
                  <span style={cardTitle}>Your Campaigns</span>
                  <button style={btnPrimary} onClick={() => navigate('dashboard/create-campaign')}>+ New</button>
                </div>
                {loading ? <div style={emptyStyle}>Loading…</div>
                : campaigns.length === 0 ? <div style={emptyStyle}>No campaigns yet. Create one to get started.</div>
                : (
                  <>
                  <div className="dashboard-table-scroll">
                    <table style={table}>
                      <thead><tr>{['Campaign','Goal','Budget','Status','Start date','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {campaigns.map(c => (
                        <tr key={c.id}>
                          <td style={{ ...td, cursor:'pointer', color: t.accent, fontWeight:'600' }} onClick={() => navigate(`/dashboard/campaign/${c.id}`)}>{c.name}</td>
                          <td style={td}>{badge('badgeBlue', c.goal || '—')}</td>
                          <td style={td}>{c.budget ? `₹${c.budget.toLocaleString()}` : '—'}</td>
                          <td style={td}>{badge(c.status === 'active' ? 'badgeGreen' : 'badgeAmber', c.status || '—')}</td>
                          <td style={td}>{c.start_date || '—'}</td>
                          <td style={td}>
                            <div style={{ display:'flex', gap:'5px' }}>
                              <button style={manageBtn}>Manage</button>
                              <button style={deleteBtn} onClick={() => handleDelete(c.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>

                  {/* Mobile card view — table par horizontal scroll ki jagah ye dikhta hai */}
                  <div className="dashboard-mobile-cards">
                    {campaigns.map(c => (
                      <div key={c.id} style={{ border: t.border, borderRadius:'12px', padding:'12px 14px', background: darkMode ? 'rgba(255,255,255,0.03)' : '#fafbff' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                          <span style={{ fontWeight:'600', color: t.accent, cursor:'pointer', fontSize:'13px' }} onClick={() => navigate(`/dashboard/campaign/${c.id}`)}>{c.name}</span>
                          {badge(c.status === 'active' ? 'badgeGreen' : 'badgeAmber', c.status || '—')}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px', marginBottom:'10px', fontSize:'11px', color: t.textSecondary }}>
                          {badge('badgeBlue', c.goal || '—')}
                          <span>₹{c.budget ? c.budget.toLocaleString() : '—'}</span>
                          <span style={{ color: t.textMuted }}>{c.start_date || '—'}</span>
                        </div>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button style={{ ...manageBtn, flex:1, textAlign:'center' }}>Manage</button>
                          <button style={{ ...deleteBtn, flex:1, textAlign:'center' }} onClick={() => handleDelete(c.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </div>

              {/* Leads feed */}
              <div style={card}>
                <div style={cardHeader}>
                  <span style={cardTitle}>Leads{selectedCampaign ? ` — ${selectedCampaign.name}` : ''}</span>
                  <button style={btnGhost} onClick={() => navigate('/dashboard/leads')}>View all</button>
                </div>
                {campaignLeads.length === 0 ? <div style={emptyStyle}>No leads for this campaign yet.</div>
                : (
                  <>
                  <div className="dashboard-table-scroll">
                    <table style={table}>
                      <thead><tr>{['Name','Phone','Platform','Date','Score'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {campaignLeads.slice(0, 5).map((lead, i) => {
                        const score = lead.quality_score
                        const scoreColor = score >= 8 ? '#16a34a' : score >= 5 ? '#d97706' : '#dc2626'
                        return (
                          <tr key={lead.id || i} style={{ cursor:'pointer' }} onClick={() => navigate(`/dashboard/campaign/${selectedCampaign?.id}`)}>
                            <td style={td}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <div style={avatar}>{(lead.name || lead.full_name || '?').charAt(0).toUpperCase()}</div>
                                <span style={{ fontWeight:'600', color: t.accent }}>{lead.name || lead.full_name || '—'}</span>
                              </div>
                            </td>
                            <td style={td}>{lead.phone || '—'}</td>
                            <td style={td}>{badge('badgeGreen', lead.platform_name || lead.platform || 'Direct')}</td>
                            <td style={td}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}</td>
                            <td style={td}>
                              {score != null ? (
                                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                  <div style={scoreBar}><div style={{ height:'100%', borderRadius:'2px', width:`${score * 10}%`, background: scoreColor }} /></div>
                                  <span style={{ fontSize:'11px', color: t.textSecondary }}>{score}/10</span>
                                </div>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>

                  {/* Mobile card view */}
                  <div className="dashboard-mobile-cards">
                    {campaignLeads.slice(0, 5).map((lead, i) => {
                      const score = lead.quality_score
                      const scoreColor = score >= 8 ? '#16a34a' : score >= 5 ? '#d97706' : '#dc2626'
                      return (
                        <div key={lead.id || i} style={{ border: t.border, borderRadius:'12px', padding:'12px 14px', background: darkMode ? 'rgba(255,255,255,0.03)' : '#fafbff' }}
                          onClick={() => navigate(`/dashboard/campaign/${selectedCampaign?.id}`)}>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                            <div style={avatar}>{(lead.name || lead.full_name || '?').charAt(0).toUpperCase()}</div>
                            <span style={{ fontWeight:'600', color: t.accent, fontSize:'13px' }}>{lead.name || lead.full_name || '—'}</span>
                          </div>
                          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px', fontSize:'11px', color: t.textSecondary }}>
                            <span>{lead.phone || '—'}</span>
                            {badge('badgeGreen', lead.platform_name || lead.platform || 'Direct')}
                            <span style={{ color: t.textMuted }}>{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—'}</span>
                            {score != null && <span style={{ color: scoreColor, fontWeight:'600' }}>{score}/10</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  </>
                )}
              </div>

            </div>

            {/* Right col */}
            <div className="dashboard-right-col">

              {/* Geo */}
              <div style={card}>
                <div style={cardHeader}><span style={cardTitle}>Geographic Reach</span></div>
                <div style={geoMap}>
                  <svg viewBox="0 0 240 130" width="100%" height="100%" fill="none">
                    <ellipse cx="130" cy="65" rx="90" ry="55" fill={t.geoBlob} opacity="0.5"/>
                    <circle cx="148" cy="52" r="22" fill={t.geoBlob}/>
                    <circle cx="148" cy="52" r="13" fill={t.geoBlobDeep}/>
                    <circle cx="128" cy="62" r="14" fill={t.geoBlob}/>
                    <circle cx="82"  cy="38" r="11" fill={t.geoBlob}/>
                    <circle cx="95"  cy="90" r="15" fill={t.geoBlob}/>
                    <text x="57"  y="30"  fontSize="9" fill={t.geoText}>Ludhiana</text>
                    <text x="157" y="45"  fontSize="9" fill={t.geoText}>Noida</text>
                    <text x="130" y="70"  fontSize="9" fill={t.geoText}>Delhi NCR</text>
                    <text x="70"  y="108" fontSize="9" fill={t.geoText}>Mumbai</text>
                  </svg>
                </div>
                {selectedCampaign ? (
                  <div>
                    {[
                      ['Campaign', selectedCampaign.name],
                      selectedCampaign.goal && ['Goal', selectedCampaign.goal],
                      selectedCampaign.budget != null && ['Budget', `₹${selectedCampaign.budget.toLocaleString()}`],
                      selectedCampaign.status && ['Status', selectedCampaign.status],
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} style={targetRow}>
                        <span style={{ color: t.textSecondary }}>{k}</span>
                        <span style={{ color: t.textPrimary, fontWeight:'500' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : <div style={emptyStyle}>Select a campaign.</div>}
              </div>

              {/* Quick actions */}
              <div style={card}>
                <div style={cardHeader}><span style={cardTitle}>Quick Actions</span></div>
                {[
                  { label:'Create new campaign', icon:'+', iconBg: darkMode ? 'rgba(59,139,255,0.2)' : '#eff6ff', iconColor: darkMode ? '#7bb8ff' : '#2563eb', action: () => navigate('/dashboard/create-campaign') },
                 { label:'Download leads (PDF)', icon:'↓', iconBg: darkMode ? 'rgba(52,211,153,0.15)' : '#f0fdf4', iconColor: darkMode ? '#6ee7b7' : '#16a34a', action: handleDownloadLeadsPDF },
                 ].map(a => (
                  <button key={a.label} style={{ ...actionBtn, ...(a.danger ? { color: darkMode ? '#fca5a5' : '#dc2626', borderColor: darkMode ? 'rgba(248,113,113,0.2)' : '#fecaca' } : {}) }} onClick={a.action}>
                    <span style={{ ...actionIcon, background: a.iconBg, color: a.iconColor }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>

              {/* AI suggestions */}
              <div style={card}>
                <div style={cardHeader}>
                  <span style={cardTitle}>AI Suggestions</span>
                  <span style={{ fontSize:'10px', fontWeight:'600', color: t.accent, background: t.accentLight, padding:'2px 8px', borderRadius:'20px', border:`1px solid ${t.accentBorder}` }}>Live</span>
                </div>
                {aiSuggestions.length === 0
                  ? <div style={emptyStyle}>Suggestions appear once platform data is available.</div>
                  : aiSuggestions.map((tip, i) => (
                    <div key={i} style={{ ...aiBox, marginBottom: i < aiSuggestions.length - 1 ? '8px' : 0 }}>
                      <div style={aiPulse} />
                      {tip}
                    </div>
                  ))
                }
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard