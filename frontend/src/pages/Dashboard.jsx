import React, { useState, useEffect } from 'react'
import { getCampaigns, deleteCampaign, getCampaignStats, getLeads, syncPlatformStats } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from '../assets/logo.png'
import {
  LayoutGrid, TrendingUp, Users, BarChart3, Share2, Settings, Settings2,
  ChevronDown, ChevronsUpDown, ChevronLeft, Sun, Moon, Sparkles, Bell, CircleHelp,
  CalendarDays, Plus, Download, MoreHorizontal, Megaphone, ArrowUpRight,
  ArrowRight, MapPin, IndianRupee, UsersRound, BadgeIndianRupee, Activity, RefreshCw,
} from 'lucide-react'
import { SiGoogleads, SiMeta, SiInstagram } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'


const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

const fmt = n => {
  if (!n && n !== 0) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return n.toString()
}

/* ── Theme tokens ── */
const LIGHT = {
  pageBg:       '#f0f4ff',
  sidebarBg:    '#ffffff',
  topbarBg:     '#ffffff',
  filterbarBg:  '#ffffff',
  cardBg:       '#ffffff',
  kpiBg:        '#ffffff',
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
  navActiveBg:  '#eaf2ff',
  navActiveColor:'#2b7fff',
  navColor:     '#64748b',
  badgeBlue:    { bg:'#eaf2ff',   color:'#1668f5', border:'#bfdbfe' },
  badgeGreen:   { bg:'#f0fdf4',   color:'#15803d', border:'#bbf7d0' },
  badgeAmber:   { bg:'#fffbeb',   color:'#b45309', border:'#fde68a' },
  badgePurple:  { bg:'#faf5ff',   color:'#7c3aed', border:'#ddd6fe' },
  badgeRed:     { bg:'#fef2f2',   color:'#dc2626', border:'#fecaca' },
  chipBg:       '#eaf2ff',
  chipColor:    '#2b7fff',
  avatarBg:     'linear-gradient(135deg,#2b7fff,#7c3aed)',
  scoreTrack:   '#e2e8f0',
  geoBg:        'linear-gradient(135deg,#eaf2ff,#f0f9ff)',
  geoBlob:      'rgba(43,127,255,0.14)',
  geoBlobDeep:  'rgba(43,127,255,0.32)',
  geoText:      '#1e40af',
  aiBoxBg:      '#eaf2ff',
  aiBoxBorder:  '#bfdbfe',
  aiBoxColor:   '#1e40af',
  aiDot:        '#2b7fff',
  actionHoverBg:'#f8faff',
  manageBg:     '#f8faff',
  manageColor:  '#64748b',
  manageBorder: '#e4e9f5',
  kpiSpendBg:   'linear-gradient(135deg,#cbe0fd 0%,#e5f0ff 100%)',
  kpiLeadsBg:   'linear-gradient(135deg,#b3efd0 0%,#dcf7e9 100%)',
  kpiCplBg:     'linear-gradient(135deg,#fdecc0 0%,#fff8e5 100%)',
  kpiActiveBg:  'linear-gradient(135deg,#ecd9ff 0%,#f6ecff 100%)',
  kpiIconSpend: 'rgba(59,130,246,0.2)',
  kpiIconLeads: 'rgba(16,185,129,0.2)',
  kpiIconCpl:   'rgba(217,119,6,0.16)',
  kpiIconActive:'rgba(168,85,247,0.16)',
  kpiTextSpend: '#2563eb',
  kpiTextLeads: '#059669',
  kpiTextCpl:   '#c2760a',
  kpiTextActive:'#9333ea',
  deleteBg:     '#fef2f2',
  deleteColor:  '#dc2626',
  deleteBorder: '#fecaca',
  emptyColor:   '#94a3b8',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  kpiShadow:    '0 1px 3px rgba(0,0,0,0.06)',
  progressTrack:'#eef2fb',
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
  progressTrack:'rgba(255,255,255,0.08)',
  kpiSpendBg:   'linear-gradient(135deg,rgba(59,139,255,0.3) 0%,rgba(59,139,255,0.12) 100%)',
  kpiLeadsBg:   'linear-gradient(135deg,rgba(52,211,153,0.3) 0%,rgba(52,211,153,0.12) 100%)',
  kpiCplBg:     'linear-gradient(135deg,rgba(251,191,36,0.22) 0%,rgba(251,191,36,0.09) 100%)',
  kpiActiveBg:  'linear-gradient(135deg,rgba(167,139,250,0.22) 0%,rgba(167,139,250,0.09) 100%)',
  kpiIconSpend: 'rgba(59,139,255,0.28)',
  kpiIconLeads: 'rgba(52,211,153,0.28)',
  kpiIconCpl:   'rgba(251,191,36,0.22)',
  kpiIconActive:'rgba(167,139,250,0.2)',
  kpiTextSpend: '#7bb8ff',
  kpiTextLeads: '#6ee7b7',
  kpiTextCpl:   '#fde68a',
  kpiTextActive:'#c4b5fd',
}

/* ── Merged styles (was Dashboard.css) ── */
const DashboardStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

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
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
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

      .kpi-card {
        padding: 12px 10px 10px !important;
      }
      .kpi-card .kpi-icon {
        width: 26px !important;
        height: 26px !important;
        font-size: 13px !important;
        margin-bottom: 8px !important;
      }
      .kpi-card .kpi-label {
        font-size: 8.5px !important;
        margin-bottom: 4px !important;
        letter-spacing: 0.02em !important;
      }
      .kpi-card .kpi-value {
        font-size: 15px !important;
      }
      .kpi-card .kpi-sub {
        font-size: 10px !important;
        display: block;
      }
      .kpi-card .kpi-progress-wrap {
        margin-top: 8px !important;
      }
    }

    @media (max-width: 540px) {
      .dashboard-kpis {
        gap: 7px;
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

      .kpi-card {
        padding: 10px 8px 9px !important;
        border-radius: 12px !important;
      }
      .kpi-card .kpi-value {
        font-size: 13px !important;
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

    .platform-table-desktop {
      display: block;
    }
    .platform-row {
      transition: background 0.12s ease;
      cursor: default;
    }
    .platform-row:hover {
      background: var(--platform-row-hover);
    }
    .platform-table-mobile {
      display: none;
    }

    @media (max-width: 640px) {
      .platform-table-desktop {
        display: none;
      }
      .platform-table-mobile {
        display: block;
      }
    }

    .dashboard-topbar-actions {
      flex-shrink: 0;
    }

    .dashboard-topbar-actions button {
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .dashboard-topbar-actions {
        gap: 6px !important;
      }
      .dashboard-topbar-actions button span {
        display: none;
      }
    }

    .icon-tooltip {
      position: relative;
    }
    .icon-tooltip::after {
      content: attr(data-tooltip);
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--tt-bg);
      color: var(--tt-color);
      border: 1px solid var(--tt-border);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      pointer-events: none;
      z-index: 50;
    }
    .icon-tooltip:hover::after {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    /* ── Recent campaigns: row-card hover + "more" menu ── */
    .campaign-row-card {
      transition: background 0.12s ease;
    }
    .campaign-row-card:hover {
      background: var(--row-hover-bg);
    }
    .campaign-more-wrap {
      position: relative;
    }
    .campaign-more-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 6px;
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
  const [syncing, setSyncing]           = useState(false)
  const [syncError, setSyncError]       = useState('')
  const [activeNav, setActiveNav]       = useState('dashboard')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode]         = useState(false)
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [openMenuId, setOpenMenuId]     = useState(null)

  const t = darkMode ? DARK : LIGHT   // active theme tokens

  const displayName = user?.name || 'User'
  const displayRole = user?.role || 'Member'
  const displayFirstName = displayName.split(' ')[0]
  const displayInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'U'

  // Real time-of-day greeting — no mock text
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  useEffect(() => { fetchAll() }, [])

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
          const res  = await fetch(`${API_BASE}/public/submissions/${camp.id}`)
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

  const handleSyncStats = async () => {
    if (!selectedCampaign) return
    setSyncing(true)
    setSyncError('')
    try {
      await syncPlatformStats(selectedCampaign.id)
      await fetchStats(selectedCampaign.id)
    } catch (err) {
      setSyncError(err.response?.data?.detail || 'Sync failed')
    } finally {
      setSyncing(false)
    }
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

    doc.setFontSize(16)
    doc.setTextColor(37, 99, 235)
    doc.text('AdNexus — Leads Report', 14, 15)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 22)
    doc.text(`Total leads: ${leads.length}`, 14, 27)

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

  const isCampaignInRange = (c) => {
    if (!dateFrom && !dateTo) return true
    const campStart = c.start_date ? new Date(c.start_date) : null
    const campEnd   = c.end_date ? new Date(c.end_date) : campStart
    if (!campStart) return true
    const rangeStart = dateFrom ? new Date(dateFrom) : null
    const rangeEnd   = dateTo ? new Date(dateTo) : rangeStart
    if (rangeStart && campEnd && campEnd < rangeStart) return false
    if (rangeEnd && campStart > rangeEnd) return false
    return true
  }
  const filteredCampaigns = campaigns.filter(isCampaignInRange)
  const dateRangeLabel = () => {
    if (!dateFrom && !dateTo) return 'All time'
    if (dateFrom && dateTo && dateFrom === dateTo) return `${dateFrom}`
    if (dateFrom && dateTo) return `${dateFrom} → ${dateTo}`
    if (dateFrom) return `From ${dateFrom}`
    return `Until ${dateTo}`
  }

  const totalBudget     = filteredCampaigns.reduce((s, c) => s + (c.budget || 0), 0)
  const totalSpent      = filteredCampaigns.reduce((s, c) => s + (c.budget_spent || 0), 0)
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active').length
  const totalLeads      = leads.length
  const totalLeadsSpend = platformStats.reduce((s, p) => s + (p.spend || 0), 0)
  const campaignLeads   = leads.filter(l =>
    l.campaign_id === selectedCampaign?.id || l.campaign_id === String(selectedCampaign?.id)
  )
  const totalLeadsCount = campaignLeads.length
  const unifiedCPL      = totalLeadsCount > 0 ? (totalLeadsSpend / totalLeadsCount).toFixed(2) : null
  const PLATFORM_NAME_MAP = { google: 'Google Ads', meta: 'Facebook', instagram: 'Instagram', fb: 'Facebook', ig: 'Instagram', linkedin: 'LinkedIn' }
  const leadsByPlatform = {}
  campaignLeads.forEach(lead => {
    const rawPlatform = (lead.platform_name || lead.platform || '').toLowerCase()
    const key = PLATFORM_NAME_MAP[rawPlatform] || lead.platform_name || lead.platform || 'Direct'
    leadsByPlatform[key] = (leadsByPlatform[key] || 0) + 1
  })
  // Same name-mapping used everywhere we look up leadsByPlatform by a platformStats row —
  // fixes the bug where "meta" (raw) never matched "Facebook" (mapped) and always showed "—"
  const platformStatKey = (p) => {
    const raw = (p.platform_name || p.platform || '').toLowerCase()
    return PLATFORM_NAME_MAP[raw] || p.platform_name || p.platform || 'Direct'
  }
  // Real brand icon + official color per platform — falls back to a colored letter chip for anything unrecognized
  const PLATFORM_BRAND = {
  'Google Ads':  { Icon: SiGoogleads, bg: '#4285F4' },
  'Facebook':    { Icon: SiMeta,      bg: '#0866FF' },
  'Instagram':   { Icon: SiInstagram, bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
  'LinkedIn':    { Icon: FaLinkedin,  bg: '#0A66C2' },
}
  const platformBrand = (p) => PLATFORM_BRAND[platformStatKey(p)] || null

  // Real progress ratios for KPI cards (no invented targets)
  const budgetUsedPct    = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  const activeRatioPct   = filteredCampaigns.length > 0 ? Math.round((activeCampaigns / filteredCampaigns.length) * 100) : 0

  const navItems = [
    { id:'dashboard', label:'Dashboard', action:() => {}, icon:<LayoutGrid size={18} /> },
    { id:'campaigns', label:'Campaigns', action:() => navigate('/dashboard/create-campaign'), icon:<TrendingUp size={18} /> },
    { id:'leads', label:'Leads', action:() => navigate('/dashboard/leads'), icon:<Users size={18} /> },
    { id:'analytics', label:'Analytics', action:() => {}, icon:<BarChart3 size={18} /> },
    { id:'refer', label:'Refer & Earn', action:() => navigate('/dashboard/refer'), icon:<Share2 size={18} /> },
    { id:'settings', label:'Settings', action:() => navigate('/dashboard/settings'), icon:<Settings size={18} /> },
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

  const progressBar = (pct, color, trackColor) => (
    <div style={{ borderRadius:'20px', background: trackColor || t.progressTrack, height:'7px', overflow:'hidden' }}>
      <div style={{ width:`${Math.max(0, Math.min(100, pct))}%`, height:'100%', borderRadius:'20px', background: color, transition:'width 0.3s ease' }} />
    </div>
  )

  // Segmented pill bar (4 segments) — filled count derived from a real ratio, no invented data
  const segmentedBar = (pct, color) => {
    const filledSegments = Math.round((Math.max(0, Math.min(100, pct)) / 100) * 4)
    return (
      <div style={{ display:'flex', gap:'4px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex:1, height:'7px', borderRadius:'20px', background: color, opacity: i < filledSegments ? 1 : 0.25 }} />
        ))}
      </div>
    )
  }

  const kpiAccentColors = ['#3b82f6','#10b981','#f59e0b','#a855f7']
  // Gradient icon-box fills — tinted to match each card's pastel background
  const kpiIconColors   = [
    { bg: t.kpiIconSpend,  color: t.kpiTextSpend },
    { bg: t.kpiIconLeads,  color: t.kpiTextLeads },
    { bg: t.kpiIconCpl,    color: t.kpiTextCpl },
    { bg: t.kpiIconActive, color: t.kpiTextActive },
  ]
  const kpiTextColors = [t.kpiTextSpend, t.kpiTextLeads, t.kpiTextCpl, t.kpiTextActive]
  // Each KPI card gets its own full solid gradient background (like the AI Suggestions card)
  const kpiCardBg = [t.kpiSpendBg, t.kpiLeadsBg, t.kpiCplBg, t.kpiActiveBg]

  /* Shared inline styles driven by theme tokens */
  const wrap        = { display:'flex', height:'100vh', background: darkMode ? 'linear-gradient(135deg,#05101f 0%,#091830 50%,#05101f 100%)' : t.pageBg, fontFamily:"'Inter',system-ui,-apple-system,sans-serif", fontSize:'13px' }
  const mainCol      = { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, minHeight:0 }
  const sidebar     = { width: sidebarCollapsed ? '60px' : '230px', background: t.sidebarBg, borderRight: t.border, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', transition:'width 0.22s ease', ...(darkMode ? { backdropFilter:'blur(20px)' } : { boxShadow:'1px 0 0 #e4e9f5' }) }
  const sbLogo      = { display:'flex', alignItems:'center', gap:'10px', padding:'18px 16px 14px', borderBottom: t.border, minHeight:'58px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const sbLogoIcon  = { width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 10px rgba(37,99,235,0.4)' }
  const sbLogoText  = { fontSize:'16px', fontWeight:'700', color: t.textPrimary, letterSpacing:'-0.2px', whiteSpace:'nowrap' }
  const sbLogoSub   = { fontWeight:'700', textTransform:'uppercase', color: t.textMuted, fontSize:'9px', letterSpacing:'2.5px', marginTop:'1px', whiteSpace:'nowrap' }
  const sbNav       = { display:'flex', flexDirection:'column', gap:'3px', padding:'12px 10px', flex:1 }
  const sbSectionLbl= { fontWeight:'700', textTransform:'uppercase', color: t.textMuted, fontSize:'10px', letterSpacing:'2px', padding: sidebarCollapsed ? '0' : '4px 12px 6px', whiteSpace:'nowrap', overflow:'hidden' }
  const navItemBase = { display:'flex', alignItems:'center', gap:'11px', padding:'9px 12px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'13px', fontWeight:'500', color: t.navColor, whiteSpace:'nowrap', overflow:'hidden', transition:'all 0.15s' }
  const navItemActiveStyle = { background: t.navActiveBg, color: t.navActiveColor, ...(darkMode ? { border:'1px solid rgba(59,139,255,0.28)' } : {}) }
  const sbBottom    = { borderTop: t.border, padding:'12px 10px' }
  const userRow     = { display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', cursor:'pointer', marginBottom:'4px', overflow:'hidden', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const userAvatar  = { width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, background: t.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px', color:'#fff' }
  const userName    = { fontSize:'13px', fontWeight:'600', color: t.textPrimary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }
  const userRole    = { fontSize:'11px', color: t.textSecondary, whiteSpace:'nowrap' }
  const collapseBtn = { display:'flex', alignItems:'center', gap:'8px', padding:'8px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', width:'100%', fontFamily:'inherit', whiteSpace:'nowrap', overflow:'hidden', color: t.textSecondary, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const topbar      = { background: t.topbarBg, borderBottom: t.border, padding:'0 24px', minHeight:'70px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, ...(darkMode ? { backdropFilter:'blur(12px)' } : { boxShadow:'0 1px 0 #e4e9f5' }) }
  const topbarTitle = { fontSize:'21px', fontWeight:'800', color: t.textPrimary, letterSpacing:'-0.4px', display:'flex', alignItems:'center', gap:'6px' }
  const topbarSub   = { color: t.textSecondary, fontSize:'12px', marginTop:'2px' }
  const iconBtn     = { background: darkMode ? 'rgba(255,255,255,0.07)' : t.accentLight, border: darkMode ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${t.accentBorder}`, cursor:'pointer', width:'38px', height:'38px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', color: t.accent }
  const filterbar   = { background: t.filterbarBg, borderBottom: t.border, padding:'0 24px', height:'48px', display:'flex', alignItems:'center', gap:'12px', flexShrink:0, ...(darkMode ? { backdropFilter:'blur(8px)' } : {}) }
  const filterLabel = { fontSize:'11px', color: t.textMuted, fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.06em' }
  const filterSelect= { background: t.inputBg, border: `1.5px solid ${t.borderColor}`, borderRadius:'20px', padding:'7px 34px 7px 16px', fontSize:'12px', color: t.textPrimary, cursor:'pointer', fontFamily:'inherit', outline:'none', maxWidth:'220px', fontWeight:'700', appearance:'none', WebkitAppearance:'none', MozAppearance:'none' }
  const datePill    = { background: t.inputBg, border: `1px solid ${t.borderColor}`, borderRadius:'20px', padding:'5px 14px', fontSize:'12px', color: t.textSecondary, display:'flex', alignItems:'center', gap:'5px' }
  const btnPrimary  = { background:'linear-gradient(135deg,#2b7fff,#1668f5)', color:'#fff', border:'none', borderRadius:'12px', padding:'8px 18px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'5px', boxShadow:'0 4px 14px rgba(43,127,255,0.4)' }
  const btnGhost    = { background: darkMode ? 'rgba(255,255,255,0.07)' : '#fff', color: t.accent, border: `1px solid ${t.accentBorder}`, borderRadius:'10px', padding:'7px 16px', fontSize:'12px', fontWeight:'500', cursor:'pointer', fontFamily:'inherit' }
  const content     = { flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:'18px' }
  const card        = { background: t.cardBg, border: t.border, borderRadius:'20px', padding:'22px 24px', ...(darkMode ? { backdropFilter:'blur(16px)' } : { boxShadow: t.shadow }) }
  const cardHeader  = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }
  const cardTitle   = { fontSize:'14px', fontWeight:'800', color: t.textPrimary, letterSpacing:'-0.1px' }
  const cardSub     = { fontSize:'11px', color: t.textSecondary, marginTop:'2px' }
  const table       = { width:'100%', borderCollapse:'collapse', fontSize:'12px' }
  const th          = { padding:'10px 14px', textAlign:'left', color: t.textMuted, fontWeight:'700', borderBottom: t.border, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap', background: t.tableHeadBg }
  const td          = { padding:'12px 14px', color: t.textPrimary, verticalAlign:'middle', borderTop:`1px solid ${t.borderColor}` }
  const chip        = { width:'26px', height:'26px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'11px', flexShrink:0, background: t.chipBg, color: t.chipColor }
  const avatar      = { width:'28px', height:'28px', borderRadius:'50%', background: t.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'11px', color:'#fff', flexShrink:0 }
  const manageBtn   = { background: t.manageBg, color: t.manageColor, border:`1px solid ${t.manageBorder}`, borderRadius:'7px', padding:'4px 10px', fontSize:'11px', cursor:'default', fontFamily:'inherit' }
  const deleteBtn   = { background: t.deleteBg, color: t.deleteColor, border:`1px solid ${t.deleteBorder}`, borderRadius:'7px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', fontFamily:'inherit' }
  const scoreBar    = { width:'56px', height:'4px', borderRadius:'2px', background: t.scoreTrack, overflow:'hidden' }
  const actionBtn   = { width:'100%', padding:'11px 14px', borderRadius:'13px', border: t.border, background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff', color: t.textPrimary, fontSize:'12px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', fontFamily:'inherit', textAlign:'left', boxShadow: darkMode ? 'none' : t.shadow }
  const actionIcon  = { width:'26px', height:'26px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }
  const emptyStyle  = { textAlign:'center', padding:'28px', color: t.emptyColor, fontSize:'12px' }

  const toggleBtn = {
    display:'flex', alignItems:'center', gap:'6px',
    background: darkMode ? 'rgba(255,255,255,0.1)' : t.accentLight,
    border: darkMode ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${t.accentBorder}`,
    borderRadius:'20px', padding:'5px 12px',
    fontSize:'12px', fontWeight:'500', cursor:'pointer',
    color: darkMode ? '#fff' : t.accent,
    fontFamily:'inherit',
  }

  const tooltipVars = {
    '--tt-bg':     t.cardBg,
    '--tt-color':  t.textPrimary,
    '--tt-border': t.borderColor,
  }

  const platformTotals = {
    impressions: platformStats.reduce((s, p) => s + (p.impressions || 0), 0),
    clicks:      platformStats.reduce((s, p) => s + (p.clicks || 0), 0),
    spend:       platformStats.reduce((s, p) => s + (p.spend || 0), 0),
    leads:       totalLeadsCount,
  }
  const platformTotalCPL = platformTotals.leads > 0 ? (platformTotals.spend / platformTotals.leads).toFixed(2) : null

  return (
    <div className="dashboard-page" style={wrap}>
      <DashboardStyles />

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar" style={sidebar}>
        <div style={sbLogo}>
  <img src={logo} alt="AdNexus" style={{ width: '34px', height: '34px', objectFit: 'contain', flexShrink: 0 }} />
  {!sidebarCollapsed && (
    <div>
      <div style={sbLogoText}>AdNexus</div>
      <div style={sbLogoSub}>Growth OS</div>
    </div>
  )}
</div>

        <nav style={sbNav}>
          {!sidebarCollapsed && <div style={sbSectionLbl}>Workspace</div>}
          {navItems.filter(i => i.id !== 'settings').map(item => (
            <button key={item.id} title={sidebarCollapsed ? item.label : ''}
              onClick={() => { setActiveNav(item.id); item.action() }}
              style={{ ...navItemBase, ...(activeNav === item.id ? navItemActiveStyle : {}), justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <span style={{ flexShrink:0, display:'flex' }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ overflow:'hidden', whiteSpace:'nowrap' }}>{item.label}</span>}
            </button>
          ))}
          {!sidebarCollapsed && <div style={{ ...sbSectionLbl, marginTop:'14px' }}>Workspace settings</div>}
          {navItems.filter(i => i.id === 'settings').map(item => (
            <button key={item.id} title={sidebarCollapsed ? item.label : ''}
              onClick={() => { setActiveNav(item.id); item.action() }}
              style={{ ...navItemBase, ...(activeNav === item.id ? navItemActiveStyle : {}), justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <span style={{ flexShrink:0, display:'flex' }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ overflow:'hidden', whiteSpace:'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={sbBottom}>
          <div style={{ borderRadius:'14px', background: darkMode ? 'rgba(255,255,255,0.06)' : '#f8faff', padding: sidebarCollapsed ? '8px' : '10px' }}>
            <div style={userRow}>
              <div style={userAvatar}>{displayInitials}</div>
              {!sidebarCollapsed && (
                <>
                  <div style={{ flex:1, overflow:'hidden', minWidth:0 }}>
                    <div style={userName}>{displayName}</div>
                    <div style={userRole}>{displayRole}</div>
                  </div>
                  <ChevronsUpDown size={14} style={{ flexShrink:0, color: t.textMuted }} />
                </>
              )}
            </div>
            <button
              onClick={() => setDarkMode(v => !v)}
              style={{
                display:'flex', alignItems:'center', gap:'8px', marginTop:'8px',
                background: t.cardBg, border: t.border, borderRadius:'10px',
                padding:'7px 10px', width:'100%', cursor:'pointer', fontFamily:'inherit',
                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                color: t.textSecondary,
              }}
            >
              <span style={{ display:'flex', alignItems:'center', gap:'6px', color: darkMode ? '#7bb8ff' : '#d97706' }}>
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {!sidebarCollapsed && <span style={{ fontSize:'12px', color: t.textPrimary, fontWeight:'500' }}>{darkMode ? 'Dark' : 'Light'}</span>}
              </span>
            </button>
          </div>
          <button onClick={() => setSidebarCollapsed(v => !v)} style={{ ...collapseBtn, marginTop:'6px' }} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <ChevronLeft size={16}
              style={{ flexShrink:0, transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition:'transform 0.22s' }} />
            {!sidebarCollapsed && <span style={{ fontSize:'12px' }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard-main" style={mainCol}>

        {/* Topbar — real greeting + subtext */}
        <header className="dashboard-topbar" style={topbar}>
          <div>
            <div style={topbarTitle}>
              {greeting}, {displayFirstName}
              <span style={{ color:'#d97706', display:'flex' }}><Sparkles size={16} color="#d97706" /></span>
            </div>
            <div style={topbarSub}>Here's what's happening with your campaigns today.</div>
          </div>
          <div className="dashboard-topbar-actions" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <button
              className="icon-tooltip"
              style={{ ...iconBtn, ...tooltipVars }}
              data-tooltip="Notifications"
            >
              <Bell size={17} />
            </button>
            <button
              className="icon-tooltip"
              style={{ ...iconBtn, ...tooltipVars }}
              data-tooltip="Help & Support"
              onClick={() => window.dispatchEvent(new Event('adnexus:toggle-chat'))}
            >
              <CircleHelp size={17} />
            </button>
            <button
              className="icon-tooltip"
              style={{ ...iconBtn, ...tooltipVars }}
              data-tooltip={darkMode ? 'Switch to light' : 'Switch to dark'}
              onClick={() => setDarkMode(v => !v)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Filter bar */}
        <div className="dashboard-filterbar" style={filterbar}>
          <span style={filterLabel}>Campaign</span>
          <div style={{ position:'relative' }}>
            <select style={filterSelect} value={selectedCampaign?.id || ''}
              onChange={e => { const c = campaigns.find(x => x.id === parseInt(e.target.value)); if (c) handleCampaignChange(c) }}>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color: t.accent, pointerEvents:'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ ...datePill, cursor: 'pointer' }} onClick={() => setShowDatePicker(v => !v)}>
              <CalendarDays size={13} />
              {dateRangeLabel()}
            </div>
            {showDatePicker && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
                background: t.cardBg, border: t.border, borderRadius: '12px',
                padding: '14px', width: '260px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {[
                    { label: 'All time', from: '', to: '' },
                    { label: 'Today', from: new Date().toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) },
                    { label: 'Last 7 days', from: new Date(Date.now() - 6*86400000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) },
                    { label: 'Last 30 days', from: new Date(Date.now() - 29*86400000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) },
                  ].map(preset => (
                    <button key={preset.label} onClick={() => { setDateFrom(preset.from); setDateTo(preset.to) }}
                      style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '20px', border: `1px solid ${t.borderColor}`, background: t.inputBg, color: t.textPrimary, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Custom range</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: `1px solid ${t.borderColor}`, background: t.inputBg, color: t.textPrimary, fontSize: '12px', fontFamily: 'inherit' }} />
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: '8px', border: `1px solid ${t.borderColor}`, background: t.inputBg, color: t.textPrimary, fontSize: '12px', fontFamily: 'inherit' }} />
                </div>
                <button onClick={() => setShowDatePicker(false)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: t.accent, color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Apply
                </button>
              </div>
            )}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
            <button style={btnPrimary} onClick={() => navigate('/dashboard/create-campaign')}><Plus size={14} /> New campaign</button>
            <button style={{ ...btnGhost, display:'flex', alignItems:'center', gap:'5px' }} onClick={() => navigate('/dashboard/leads')}><Users size={14} /> View leads</button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content" style={content}>

          {selectedCampaign && (
            <div style={{ fontWeight:'700', textTransform:'uppercase', color: darkMode ? 'rgba(123,184,255,0.75)' : 'rgba(37,99,235,0.7)', fontSize:'10px', letterSpacing:'2.4px' }}>
              Total spend · {selectedCampaign.name}
            </div>
          )}

          {/* KPI row — every number/progress bar below is derived from real state, no invented targets */}
          <div className="dashboard-kpis">
            {[
              {
                label:'Total Spend', value:`₹${totalSpent.toLocaleString()}`,
                sub: totalBudget > 0 ? `of ₹${totalBudget.toLocaleString()} budget` : null,
                progress: totalBudget > 0 ? budgetUsedPct : null,
                progressColor: kpiAccentColors[0],
                progressNote: totalBudget > 0 ? [`${budgetUsedPct}% used`, `₹${totalBudget.toLocaleString()} budget`] : null,
              },
              {
                label:'Total Leads', value: totalLeads || '—',
                sub: null,
                progress: null,
              },
              {
                label:'Unified CPL', value: unifiedCPL ? `₹${unifiedCPL}` : '—',
                sub: null,
                progress: null,
              },
              {
                label:'Active Campaigns', value: activeCampaigns || '—',
                sub: filteredCampaigns.length > 0 ? `of ${filteredCampaigns.length} total` : null,
                progress: filteredCampaigns.length > 0 ? activeRatioPct : null,
                progressColor: kpiAccentColors[3],
                progressNote: filteredCampaigns.length > 0 ? [`${activeCampaigns} active`, `${filteredCampaigns.length} total`] : null,
                segmented: true,
              },
            ].map((k, i) => (
              <div key={k.label} className="kpi-card" style={{ background: kpiCardBg[i], border: darkMode ? `1px solid ${kpiAccentColors[i]}22` : `1px solid ${kpiAccentColors[i]}18`, borderRadius:'22px', padding:'22px 22px 20px', position:'relative', overflow:'hidden', boxShadow: darkMode ? 'none' : `0 4px 14px ${kpiAccentColors[i]}12` }}>
                <div className="kpi-icon" style={{ width:'44px', height:'44px', borderRadius:'14px', background: kpiIconColors[i].bg, color: kpiIconColors[i].color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'18px' }}>
                  {[<IndianRupee size={20} key="ir" />, <UsersRound size={20} key="ur" />, <BadgeIndianRupee size={20} key="bir" />, <Activity size={20} key="ac" />][i]}
                </div>
                <div className="kpi-label" style={{ fontSize:'10px', fontWeight:'700', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:'8px' }}>{k.label}</div>
                <div className="kpi-value" style={{ fontSize:'27px', fontWeight:'800', color: t.textPrimary, lineHeight:1, letterSpacing:'-0.4px' }}>
                  {k.value}
                </div>
                {k.sub && <div className="kpi-sub" style={{ fontSize:'11px', color: t.textSecondary, fontWeight:'400', marginTop:'8px' }}>{k.sub}</div>}
                {k.progress != null && (
                  <div className="kpi-progress-wrap" style={{ marginTop:'18px' }}>
                    {k.segmented ? segmentedBar(k.progress, kpiTextColors[i]) : progressBar(k.progress, kpiTextColors[i], darkMode ? 'rgba(255,255,255,0.08)' : `${kpiAccentColors[i]}18`)}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px', color: t.textMuted, marginTop:'8px' }}>
                      <span>{k.progressNote[0]}</span>
                      <span>{k.progressNote[1]}</span>
                    </div>
                  </div>
                )}
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
                  <div>
                    <div style={cardTitle}>Platform Performance</div>
                    <div style={cardSub}>Spend and lead quality for your active channels</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    {selectedCampaign && badge('badgeBlue', selectedCampaign.name)}
                    {selectedCampaign && (
                      <button
                        onClick={handleSyncStats}
                        disabled={syncing}
                        style={{
                          background: syncing ? '#93b8f4' : 'linear-gradient(135deg,#2b7fff,#1660e8)',
                          color: '#fff', border: 'none', borderRadius: '20px',
                          padding: '7px 16px', fontSize: '11px', fontWeight: '700',
                          cursor: syncing ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                          whiteSpace: 'nowrap', display:'flex', alignItems:'center', gap:'6px',
                          boxShadow: syncing ? 'none' : '0 4px 14px rgba(43,127,255,0.4)',
                        }}
                      >
                        <RefreshCw size={13} style={{ animation: syncing ? 'spin 0.9s linear infinite' : 'none' }} />
                        {syncing ? 'Syncing...' : 'Refresh Stats'}
                      </button>
                    )}
                  </div>
                </div>
                {syncError && (
                  <div style={{ background: t.badgeRed.bg, color: t.badgeRed.color, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', border: `1px solid ${t.badgeRed.border}` }}>
                    {syncError}
                  </div>
                )}
                {statsLoading ? <div style={emptyStyle}>Loading stats…</div>
                : platformStats.length === 0 ? <div style={emptyStyle}>{selectedCampaign ? 'No platform data for this campaign yet.' : 'Select a campaign to see stats.'}</div>
                : (
                  <>
                  {/* Desktop / tablet: bordered rounded table, all columns */}
                  <div className="dashboard-table-scroll platform-table-desktop" style={{ borderRadius:'14px', border: `1.5px solid ${t.borderColor}`, overflow:'hidden', boxShadow: darkMode ? 'none' : '0 4px 16px rgba(43,127,255,0.08)', '--platform-row-hover': darkMode ? 'rgba(59,139,255,0.14)' : '#eaf2ff' }}>
                    <table style={table}>
                      <thead><tr>{['Platform','Impressions','Clicks','Spend','Leads','CPL'].map(h => <th key={h} style={{ ...th, background: darkMode ? 'rgba(59,139,255,0.1)' : '#eaf2ff', color: darkMode ? '#7bb8ff' : '#1660e8' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {platformStats.map((p, i) => {
                          const rowColor = kpiAccentColors[i % kpiAccentColors.length]
                          const brand = platformBrand(p)
                          return (
                            <tr key={p.platform_id || i} className="platform-row">
                            <td style={{ ...td, borderTop: i === 0 ? 'none' : td.borderTop, fontWeight:'700' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                                {brand ? (
                                  <div style={{ ...chip, background: brand.bg, color:'#fff', boxShadow:'0 3px 8px rgba(0,0,0,0.15)' }}>
                                    <brand.Icon size={14} />
                                  </div>
                                ) : (
                                  <div style={{ ...chip, background: `linear-gradient(135deg,${rowColor},${rowColor}cc)`, color:'#fff', boxShadow:`0 3px 8px ${rowColor}55` }}>{(p.platform_name || p.platform || 'P').charAt(0).toUpperCase()}</div>
                                )}
                                <span>{p.platform_name || p.platform || '—'}</span>
                              </div>
                            </td>
                            <td style={{ ...td, borderTop: i === 0 ? 'none' : td.borderTop, color: t.textSecondary }}>{fmt(p.impressions)}</td>
                            <td style={{ ...td, borderTop: i === 0 ? 'none' : td.borderTop, color: t.textSecondary }}>{p.clicks ? p.clicks.toLocaleString() : '—'}</td>
                            <td style={{ ...td, borderTop: i === 0 ? 'none' : td.borderTop, fontWeight:'700' }}>{p.spend ? `₹${p.spend.toLocaleString()}` : '—'}</td>
                            <td style={{ ...td, borderTop: i === 0 ? 'none' : td.borderTop }}>{badge('badgeBlue', leadsByPlatform[platformStatKey(p)] ?? '—')}</td>
                            <td style={{ ...td, borderTop: i === 0 ? 'none' : td.borderTop }}>{badge('badgePurple', (() => {
                              const pLeads = leadsByPlatform[platformStatKey(p)] || 0
                              const pCpl = pLeads > 0 ? (p.spend / pLeads).toFixed(2) : null
                              return pCpl ? `₹${pCpl}` : '—'
                            })())}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>

                  {/* Mobile: compact 4-column table + Total row */}
                  <div className="platform-table-mobile">
                    <table style={table}>
                      <thead><tr>{['Platform','Spend','Leads','CPL'].map(h => <th key={h} style={{ ...th, padding:'6px 8px' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {platformStats.map((p, i) => {
                          const rowColor = kpiAccentColors[i % kpiAccentColors.length]
                          const brand = platformBrand(p)
                          return (
                            <tr key={p.platform_id || i}>
                              <td style={{ ...td, padding:'8px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                  {brand ? (
                                    <div style={{ ...chip, width:'20px', height:'20px', background: brand.bg, color:'#fff' }}>
                                      <brand.Icon size={11} />
                                    </div>
                                  ) : (
                                    <div style={{ ...chip, width:'20px', height:'20px', fontSize:'10px', background: `linear-gradient(135deg,${rowColor},${rowColor}cc)`, color:'#fff' }}>{(p.platform_name || p.platform || 'P').charAt(0).toUpperCase()}</div>
                                  )}
                                  <span style={{ fontWeight:'600', fontSize:'12px' }}>{p.platform_name || p.platform || '—'}</span>
                                </div>
                              </td>
                              <td style={{ ...td, padding:'8px', fontSize:'12px' }}>{p.spend ? `₹${p.spend.toLocaleString()}` : '—'}</td>
                              <td style={{ ...td, padding:'8px', fontSize:'12px' }}>{leadsByPlatform[platformStatKey(p)] ?? '—'}</td>
                              <td style={{ ...td, padding:'8px', fontSize:'12px' }}>{(() => {
                                const pLeads = leadsByPlatform[platformStatKey(p)] || 0
                                const pCpl = pLeads > 0 ? (p.spend / pLeads).toFixed(2) : null
                                return pCpl ? `₹${pCpl}` : '—'
                              })()}</td>
                            </tr>
                          )
                        })}
                        <tr>
                          <td style={{ ...td, padding:'8px', fontWeight:'700', fontSize:'12px', borderBottom:'none' }}>Total</td>
                          <td style={{ ...td, padding:'8px', fontWeight:'700', fontSize:'12px', borderBottom:'none' }}>{platformTotals.spend ? `₹${platformTotals.spend.toLocaleString()}` : '—'}</td>
                          <td style={{ ...td, padding:'8px', fontWeight:'700', fontSize:'12px', borderBottom:'none' }}>{platformTotals.leads || '—'}</td>
                          <td style={{ ...td, padding:'8px', fontWeight:'700', fontSize:'12px', borderBottom:'none' }}>{platformTotalCPL ? `₹${platformTotalCPL}` : '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </div>

              {/* Recent campaigns — row-card style */}
              <div style={card}>
                <div style={cardHeader}>
                  <div>
                    <div style={cardTitle}>Recent Campaigns</div>
                    <div style={cardSub}>Monitor your latest campaign activity</div>
                  </div>
                  <button onClick={() => navigate('/dashboard/leads')} style={{ background:'none', border:'none', cursor:'pointer', color: t.accent, fontSize:'12px', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px', fontFamily:'inherit' }}>
                    View all
                    <ArrowUpRight size={12} />
                  </button>
                </div>
                {loading ? <div style={emptyStyle}>Loading…</div>
                : campaigns.length === 0 ? <div style={emptyStyle}>No campaigns yet. Create one to get started.</div>
                : (
                  <>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    {filteredCampaigns.slice(0, 6).map(c => {
                      const cLeadsCount = leads.filter(l => l.campaign_id === c.id || l.campaign_id === String(c.id)).length
                      const cStat = platformStats.find(p => p.campaign_id === c.id || p.campaign_id === String(c.id))
                      // Real spend only — never fall back to budget (budget ≠ spend). Defaults to 0 when nothing tracked yet.
                      const cSpend = cStat?.spend ?? c.budget_spent ?? 0
                      // Real "ending soon" derivation — end_date within 7 days — no invented status
                      const daysToEnd = c.end_date ? Math.ceil((new Date(c.end_date) - new Date()) / 86400000) : null
                      const isEndingSoon = c.status === 'active' && daysToEnd != null && daysToEnd >= 0 && daysToEnd <= 7
                      const statusLabel = isEndingSoon ? 'Ending soon' : (c.status || '—')
                      return (
                        <div key={c.id} className="campaign-row-card" style={{ '--row-hover-bg': t.rowHover, borderRadius:'14px', display:'flex', padding:'12px', alignItems:'center', gap:'14px' }}>
                          <div style={{ width:'38px', height:'38px', borderRadius:'12px', background: t.chipBg, color: t.chipColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Megaphone size={16} color={t.chipColor} />
                          </div>
                          <div style={{ minWidth:0, flex:1, cursor:'pointer' }} onClick={() => navigate(`/dashboard/campaign/${c.id}`)}>
                            <div style={{ fontWeight:'700', fontSize:'14px', color: t.textPrimary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                            <div style={{ fontSize:'11px', color: t.textSecondary, marginTop:'3px' }}>
                              {(c.goal || '—')}{c.start_date ? ` · Started ${new Date(c.start_date).toLocaleDateString('en-IN', { month:'short', day:'numeric' })}` : ''}
                            </div>
                          </div>
                          {badge('badgeBlue', statusLabel)}
                          <div style={{ textAlign:'right', width:'96px', flexShrink:0 }}>
                            <div style={{ fontWeight:'700', fontSize:'12px', color: t.textPrimary }}>₹{cSpend.toLocaleString()}</div>
                            <div style={{ fontSize:'10px', color: t.textMuted, marginTop:'2px' }}>{cLeadsCount} leads</div>
                          </div>
                          <div className="campaign-more-wrap">
                            <button className="campaign-more-btn" onClick={() => setOpenMenuId(v => v === c.id ? null : c.id)} style={{ color: t.textMuted }}>
                              <MoreHorizontal size={16} color={t.textMuted} />
                            </button>
                            {openMenuId === c.id && (
                              <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', zIndex:20, background: t.cardBg, border: t.border, borderRadius:'10px', boxShadow:'0 8px 20px rgba(0,0,0,0.12)', overflow:'hidden', minWidth:'110px' }}>
                                <button style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 12px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', color: t.textPrimary, fontFamily:'inherit' }} onClick={() => { setOpenMenuId(null); navigate(`/dashboard/campaign/${c.id}`) }}>Manage</button>
                                <button style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 12px', background:'none', border:'none', cursor:'pointer', fontSize:'12px', color: t.deleteColor, fontFamily:'inherit' }} onClick={() => { setOpenMenuId(null); handleDelete(c.id) }}>Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
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

              {/* Quick actions */}
              <div style={card}>
                <div style={cardHeader}><span style={cardTitle}>Quick Actions</span></div>
                {[
                  { label:'Create new campaign', icon:<Plus size={15} />, iconBg: darkMode ? 'rgba(59,139,255,0.2)' : '#eaf2ff', iconColor: darkMode ? '#7bb8ff' : '#2b7fff', action: () => navigate('/dashboard/create-campaign') },
                  { label:'Download leads (PDF)', icon:<Download size={15} />, iconBg: darkMode ? 'rgba(52,211,153,0.15)' : '#f0fdf4', iconColor: darkMode ? '#6ee7b7' : '#16a34a', action: handleDownloadLeadsPDF },
                  { label:'Manage integrations', icon:<Settings2 size={15} />, iconBg: darkMode ? 'rgba(167,139,250,0.15)' : '#faf5ff', iconColor: darkMode ? '#c4b5fd' : '#7c3aed', action: () => navigate('/dashboard/settings') },
                ].map(a => (
                  <button key={a.label} style={actionBtn} onClick={a.action}>
                    <span style={{ ...actionIcon, background: a.iconBg, color: a.iconColor }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>

              {/* AI suggestions — solid accent card, real data from platformStats */}
              <div style={{
                borderRadius:'18px',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                color:'#eff6ff',
                padding:'20px 22px',
                boxShadow: darkMode ? '0 8px 24px rgba(37,99,235,0.35)' : '0 8px 24px rgba(37,99,235,0.25)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <Sparkles size={16} color="#eff6ff" />
                  <span style={{ fontWeight:'700', fontSize:'13px' }}>AI Suggestions</span>
                  <span style={{ marginLeft:'auto', fontSize:'9px', fontWeight:'700', background:'rgba(255,255,255,0.18)', padding:'3px 9px', borderRadius:'20px' }}>Live</span>
                </div>
                {aiSuggestions.length === 0 ? (
                  <p style={{ color:'rgba(239,246,255,0.75)', fontSize:'12px', lineHeight:'1.6', marginTop:'14px' }}>
                    Suggestions appear once platform data is available.
                  </p>
                ) : (
                  aiSuggestions.map((tip, i) => (
                    <p key={i} style={{ color:'rgba(239,246,255,0.85)', fontSize:'12px', lineHeight:'1.7', marginTop: i === 0 ? '14px' : '8px' }}>
                      {tip}
                    </p>
                  ))
                )}
                <button
                  onClick={() => { setActiveNav('analytics') }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#eff6ff', fontSize:'12px', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px', marginTop:'14px', marginLeft:'auto', fontFamily:'inherit' }}
                >
                  View analytics
                  <ArrowRight size={12} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard