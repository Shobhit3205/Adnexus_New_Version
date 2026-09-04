import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReferralSummary, getReferralList } from '../services/api'
import logo from '../assets/logo.png'
import {
  Sun, Moon, Link2, MessageCircle, Copy, Check, ChevronLeft,
  LayoutGrid, Megaphone, Users, BarChart3, Share2, Settings,
  Clock, IndianRupee, UserRound,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

/* ── Theme tokens (Dashboard.jsx se hubahu copy — consistency ke liye) ── */
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
  accent:       '#2563eb',
  accentHover:  '#1d4ed8',
  accentLight:  '#eff6ff',
  accentBorder: '#bfdbfe',
  navActiveBg:  '#eff6ff',
  navActiveColor:'#2563eb',
  navColor:     '#64748b',
  badgeBlue:    { bg:'#eff6ff',   color:'#1d4ed8', border:'#bfdbfe' },
  badgeGreen:   { bg:'#f0fdf4',   color:'#15803d', border:'#bbf7d0' },
  badgeAmber:   { bg:'#fffbeb',   color:'#b45309', border:'#fde68a' },
  badgePurple:  { bg:'#faf5ff',   color:'#7c3aed', border:'#ddd6fe' },
  badgeRed:     { bg:'#fef2f2',   color:'#dc2626', border:'#fecaca' },
  chipBg:       '#eff6ff',
  chipColor:    '#2563eb',
  avatarBg:     'linear-gradient(135deg,#2563eb,#7c3aed)',
  aiBoxBg:      '#eff6ff',
  aiBoxBorder:  '#bfdbfe',
  aiBoxColor:   '#1e40af',
  aiDot:        '#2563eb',
  manageBg:     '#f8faff',
  manageColor:  '#64748b',
  manageBorder: '#e4e9f5',
  emptyColor:   '#94a3b8',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  kpiShadow:    '0 1px 3px rgba(0,0,0,0.06)',
  heroGradient: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
  heroBorder:   '#dbe4ff',
  // ── Pastel/light KPI backgrounds — soft tint, matches Dashboard.jsx original style ──
  kpiReferralsBg: 'linear-gradient(135deg,#cbe0fd 0%,#e5f0ff 100%)',
  kpiPendingBg:   'linear-gradient(135deg,#fdecc0 0%,#fff8e5 100%)',
  kpiEarningsBg:  'linear-gradient(135deg,#b3efd0 0%,#dcf7e9 100%)',
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
  aiBoxBg:      'rgba(59,139,255,0.08)',
  aiBoxBorder:  'rgba(59,139,255,0.22)',
  aiBoxColor:   'rgba(180,210,255,0.9)',
  aiDot:        '#3b8bff',
  manageBg:     'rgba(255,255,255,0.07)',
  manageColor:  'rgba(255,255,255,0.4)',
  manageBorder: 'rgba(255,255,255,0.1)',
  emptyColor:   'rgba(255,255,255,0.25)',
  shadow:       'none',
  kpiShadow:    'none',
  heroGradient: 'linear-gradient(135deg, rgba(59,139,255,0.14) 0%, rgba(123,90,240,0.1) 100%)',
  heroBorder:   'rgba(59,139,255,0.25)',
  // ── Pastel/light KPI backgrounds (dark-mode tinted version) ──
  kpiReferralsBg: 'linear-gradient(135deg,rgba(59,139,255,0.28) 0%,rgba(59,139,255,0.1) 100%)',
  kpiPendingBg:   'linear-gradient(135deg,rgba(251,191,36,0.22) 0%,rgba(251,191,36,0.09) 100%)',
  kpiEarningsBg:  'linear-gradient(135deg,rgba(52,211,153,0.28) 0%,rgba(52,211,153,0.1) 100%)',
}

const ReferEarnStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .refer-kpis {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .refer-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .refer-table-scroll { overflow-x: auto; width: 100%; }
    .refer-table-scroll table { min-width: 640px; width: 100%; border-collapse: separate; border-spacing: 0; }
    .refer-table-scroll::-webkit-scrollbar { height: 7px; }
    .refer-table-scroll::-webkit-scrollbar-track { background: transparent; }
    .refer-table-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.25); border-radius: 9999px; }
    .refer-mobile-cards { display: none; }
    .refer-kpi-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .refer-kpi-card:hover { transform: translateY(-2px); }
    .refer-row:hover { background: var(--refer-row-hover); }
    .refer-copy-btn { transition: transform 0.12s ease, box-shadow 0.15s ease; }
    .refer-copy-btn:active { transform: scale(0.97); }
    .refer-wa-btn { transition: filter 0.15s ease, transform 0.12s ease; }
    .refer-wa-btn:hover { filter: brightness(1.06); }
    .refer-wa-btn:active { transform: scale(0.97); }
    @keyframes referSpin { to { transform: rotate(360deg); } }

    @media (max-width: 760px) {
      .refer-kpis { grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 10px; }
      .refer-steps { grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 10px; }
    }
    @media (max-width: 640px) {
      .refer-table-scroll { display: none; }
      .refer-mobile-cards { display: flex; flex-direction: column; gap: 10px; }
    }
    @media (max-width: 480px) {
      .refer-content { padding: 10px !important; gap: 12px !important; }
    }
  `}</style>
)

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Share your link',
    text: 'Send your unique referral link via WhatsApp, email, or anywhere else.',
  },
  {
    n: '02',
    title: 'Friend signs up',
    text: 'They create an account using your link and verify with OTP.',
  },
  {
    n: '03',
    title: 'You earn',
    text: 'Once verified, the referral is marked Completed and the reward is added.',
  },
]

const ReferEarn = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [darkMode, setDarkMode]         = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading]           = useState(true)
  const [copied, setCopied]             = useState(false)
  const [fetchError, setFetchError]     = useState('')

  const [referralCode, setReferralCode] = useState('')
  const [summary, setSummary]           = useState({
    totalReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
  })
  const [referralList, setReferralList] = useState([])

  const t = darkMode ? DARK : LIGHT

  const displayName = user?.name || 'User'
  const displayRole = user?.role || 'Member'
  const displayInitials = displayName
    .split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('') || 'U'

  useEffect(() => { fetchReferralData() }, [])

  useEffect(() => {
    const checkWidth = () => { if (window.innerWidth <= 640) setSidebarCollapsed(true) }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const fetchReferralData = async () => {
    setLoading(true)
    setFetchError('')
    try {
      const [summaryRes, listRes] = await Promise.all([getReferralSummary(), getReferralList()])

      setReferralCode(summaryRes.data.referral_code || '')
      setSummary({
        totalReferrals: summaryRes.data.totalReferrals || 0,
        pendingReferrals: summaryRes.data.pendingReferrals || 0,
        totalEarnings: summaryRes.data.totalEarnings || 0,
      })
      setReferralList(listRes.data.referrals || [])
    } catch (err) {
      console.error('Referral fetch error:', err)
      setFetchError('Referral data load nahi ho payi. Page refresh karke dekhein.')
    } finally {
      setLoading(false)
    }
  }

  const referralLink = referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : ''

  const handleCopyLink = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    if (!referralLink) return
    const msg = `AdNexus pe apna ad campaign banao — mera referral link use karo: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const navItems = [
    { id:'dashboard', label:'Dashboard', action:() => navigate('/dashboard'), Icon: LayoutGrid },
    { id:'campaigns', label:'Campaigns', action:() => navigate('/dashboard/create-campaign'), Icon: Megaphone },
    { id:'leads', label:'Leads', action:() => navigate('/dashboard/leads'), Icon: Users },
    { id:'analytics', label:'Analytics', action:() => navigate('/dashboard'), Icon: BarChart3 },
    { id:'refer', label:'Refer & Earn', action:() => {}, Icon: Share2 },
    { id:'settings', label:'Settings', action:() => navigate('/dashboard/settings'), Icon: Settings },
  ]

  const badge = (variant, text) => (
    <span style={{
      background: t[variant].bg, color: t[variant].color,
      border: `1px solid ${t[variant].border}`,
      padding:'3px 9px', borderRadius:'20px', fontSize:'10px', fontWeight:'700',
    }}>{text}</span>
  )

  const kpiAccentColors = ['#2563eb','#d97706','#16a34a']
  const kpiIconColors   = [
    { bg: darkMode ? 'rgba(59,139,255,0.2)'  : '#eff6ff', color: darkMode ? '#7bb8ff' : '#2563eb' },
    { bg: darkMode ? 'rgba(251,191,36,0.2)'  : '#fffbeb', color: darkMode ? '#fde68a' : '#d97706' },
    { bg: darkMode ? 'rgba(52,211,153,0.2)'  : '#f0fdf4', color: darkMode ? '#6ee7b7' : '#16a34a' },
  ]
  const kpiIcons = [UserRound, Clock, IndianRupee]
  // ── Pastel gradient background per KPI card (Total Referrals / Pending Rewards / Total Earnings) ──
  const kpiCardBg = [t.kpiReferralsBg, t.kpiPendingBg, t.kpiEarningsBg]

  const wrap        = { display:'flex', height:'100vh', background: darkMode ? 'linear-gradient(135deg,#05101f 0%,#091830 50%,#05101f 100%)' : t.pageBg, fontFamily:"'Inter',system-ui,-apple-system,sans-serif", fontSize:'13px' }
  const mainCol      = { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0, minHeight:0 }
  const sidebar     = { width: sidebarCollapsed ? '60px' : '230px', background: t.sidebarBg, borderRight: t.border, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden', transition:'width 0.22s ease', ...(darkMode ? { backdropFilter:'blur(20px)' } : { boxShadow:'1px 0 0 #e4e9f5' }) }
  const sbLogo      = { display:'flex', alignItems:'center', gap:'10px', padding:'18px 16px 14px', borderBottom: t.border, minHeight:'58px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const sbLogoText  = { fontSize:'16px', fontWeight:'700', color: t.textPrimary, letterSpacing:'-0.3px', whiteSpace:'nowrap' }
  const sbNav       = { display:'flex', flexDirection:'column', gap:'3px', padding:'12px 10px', flex:1 }
  const navItemBase = { display:'flex', alignItems:'center', gap:'11px', padding:'9px 12px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', width:'100%', textAlign:'left', fontFamily:'inherit', fontSize:'13px', fontWeight:'500', color: t.navColor, whiteSpace:'nowrap', overflow:'hidden', transition:'all 0.15s' }
  const navItemActiveStyle = { background: t.navActiveBg, color: t.navActiveColor, fontWeight:'600', ...(darkMode ? { border:'1px solid rgba(59,139,255,0.28)' } : {}) }
  const sbBottom    = { borderTop: t.border, padding:'12px 10px' }
  const userRow     = { display:'flex', alignItems:'center', gap:'10px', padding:'9px 8px', borderRadius:'10px', cursor:'pointer', marginBottom:'4px', overflow:'hidden', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const userAvatar  = { width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, background: t.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'12px', color:'#fff' }
  const userName    = { fontSize:'13px', fontWeight:'600', color: t.textPrimary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }
  const userRole    = { fontSize:'11px', color: t.textSecondary, whiteSpace:'nowrap' }
  const collapseBtn = { display:'flex', alignItems:'center', gap:'8px', padding:'8px', borderRadius:'10px', border:'none', background:'none', cursor:'pointer', width:'100%', fontFamily:'inherit', whiteSpace:'nowrap', overflow:'hidden', color: t.textSecondary, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }
  const topbar      = { background: t.topbarBg, borderBottom: t.border, padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, ...(darkMode ? { backdropFilter:'blur(12px)' } : { boxShadow:'0 1px 0 #e4e9f5' }) }
  const topbarTitle = { fontSize:'17px', fontWeight:'800', color: t.textPrimary, letterSpacing:'-0.3px' }
  const toggleBtn = { display:'flex', alignItems:'center', gap:'6px', background: darkMode ? 'rgba(255,255,255,0.1)' : t.accentLight, border: darkMode ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${t.accentBorder}`, borderRadius:'20px', padding:'6px 13px', fontSize:'12px', fontWeight:'600', cursor:'pointer', color: darkMode ? '#fff' : t.accent, fontFamily:'inherit' }
  const content     = { flex:1, overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:'18px' }
  const card        = { background: t.cardBg, border: t.border, borderRadius:'16px', padding:'20px 22px', ...(darkMode ? { backdropFilter:'blur(16px)' } : { boxShadow: t.shadow }) }
  const cardHeader  = { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }
  const cardTitle   = { fontSize:'11px', fontWeight:'700', color: t.textSecondary, textTransform:'uppercase', letterSpacing:'0.08em' }
  const table       = { width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:'12.5px' }
  const th          = { padding:'11px 12px', textAlign:'left', color: t.textMuted, fontWeight:'700', borderBottom: darkMode ? t.border : '1.5px solid #e4e9f5', fontSize:'10.5px', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap', background: t.tableHeadBg }
  const td          = { padding:'11px 12px', color: t.textPrimary, verticalAlign:'middle', borderBottom:`1px solid ${t.borderColor}` }
  const avatar      = { width:'28px', height:'28px', borderRadius:'50%', background: t.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'11px', color:'#fff', flexShrink:0 }
  const btnPrimary  = { background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', border:'none', borderRadius:'10px', padding:'9px 18px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'6px', boxShadow:'0 2px 10px rgba(37,99,235,0.35)', whiteSpace:'nowrap' }
  const btnWhatsApp = { background:'#25D366', color:'#fff', border:'none', borderRadius:'10px', padding:'9px 18px', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'7px', boxShadow:'0 2px 10px rgba(37,211,102,0.35)', whiteSpace:'nowrap' }

  return (
    <div style={wrap}>
      <ReferEarnStyles />

      {/* ── Sidebar (Dashboard.jsx jaisa hi) ── */}
      <aside style={sidebar}>
        <div style={sbLogo}>
          <img src={logo} alt="AdNexus" style={{ width: '34px', height: '34px', objectFit: 'contain', flexShrink: 0 }} />
          {!sidebarCollapsed && <span style={sbLogoText}>AdNexus</span>}
        </div>

        <nav style={sbNav}>
          {navItems.map(item => (
            <button key={item.id} title={sidebarCollapsed ? item.label : ''}
              onClick={item.action}
              style={{ ...navItemBase, ...(item.id === 'refer' ? navItemActiveStyle : {}), justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <span style={{ flexShrink:0, display:'flex' }}><item.Icon size={16} strokeWidth={2} /></span>
              {!sidebarCollapsed && <span style={{ overflow:'hidden', whiteSpace:'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={sbBottom}>
          <div style={userRow}>
            <div style={userAvatar}>{displayInitials}</div>
            {!sidebarCollapsed && (
              <div style={{ flex:1, overflow:'hidden', minWidth:0 }}>
                <div style={userName}>{displayName}</div>
                <div style={userRole}>{displayRole}</div>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(v => !v)} style={collapseBtn}>
            <ChevronLeft size={16} style={{ flexShrink:0, transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition:'transform 0.22s' }} />
            {!sidebarCollapsed && <span style={{ fontSize:'12px' }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={mainCol}>
        <header style={topbar}>
          <div style={topbarTitle}>Refer & Earn</div>
          <button style={toggleBtn} onClick={() => setDarkMode(v => !v)}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </header>

        <div className="refer-content" style={content}>

          {fetchError && (
            <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:'500' }}>
              {fetchError}
            </div>
          )}

          {/* ── Hero: Referral code + link card ── */}
          <div style={{
            background: t.heroGradient,
            border: `1px solid ${t.heroBorder}`,
            borderRadius:'18px',
            padding:'26px 26px 24px',
            position:'relative',
          }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'18px' }}>
              <div style={{
                width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
                background: darkMode ? 'rgba(59,139,255,0.18)' : '#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: darkMode ? 'none' : '0 2px 8px rgba(37,99,235,0.15)',
              }}>
                <Link2 size={19} color={t.accent} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize:'17px', fontWeight:'800', color: t.textPrimary, marginBottom:'3px', letterSpacing:'-0.3px' }}>
                  Refer a friend, earn together
                </div>
                <div style={{ fontSize:'12.5px', color: t.textSecondary, fontWeight:'500' }}>
                  Every new user who verifies through your link earns you a reward.
                </div>
              </div>
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center' }}>
              <div style={{
                flex:'1 1 260px', background: darkMode ? 'rgba(0,0,0,0.2)' : '#fff',
                border:`1px solid ${t.borderColor}`,
                borderRadius:'10px', padding:'11px 14px', fontSize:'13px', color: t.textPrimary,
                fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>
                {loading ? 'Loading…' : (referralLink || '—')}
              </div>
              <button className="refer-copy-btn" style={btnPrimary} onClick={handleCopyLink} disabled={!referralLink}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button className="refer-wa-btn" style={btnWhatsApp} onClick={handleShareWhatsApp} disabled={!referralLink}>
                <MessageCircle size={15} /> Share
              </button>
            </div>

            <div style={{ marginTop:'12px', fontSize:'11.5px', color: t.textSecondary, fontWeight:'500' }}>
              Referral code: <span style={{ fontWeight:'700', color: t.accent, letterSpacing:'0.3px' }}>{referralCode || '—'}</span>
            </div>
          </div>

          {/* ── KPI row — pastel/light cards, matches rest of page ── */}
          <div className="refer-kpis">
            {[
              { label:'Total Referrals',   value: summary.totalReferrals || '—' },
              { label:'Pending Rewards',   value: summary.pendingReferrals || '—' },
              { label:'Total Earnings',    value: `₹${(summary.totalEarnings || 0).toLocaleString()}` },
            ].map((k, i) => {
              const KpiIcon = kpiIcons[i]
              return (
                <div
                  key={k.label}
                  className="refer-kpi-card"
                  style={{
                    background: kpiCardBg[i],
                    border: darkMode ? `1px solid ${kpiAccentColors[i]}22` : `1px solid ${kpiAccentColors[i]}18`,
                    borderRadius: '16px',
                    padding: '20px 20px 18px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: darkMode ? 'none' : `0 4px 14px ${kpiAccentColors[i]}12`,
                  }}
                >
                  <div style={{
                    width:'34px', height:'34px', borderRadius:'10px',
                    background: kpiIconColors[i].bg, color: kpiIconColors[i].color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:'14px',
                  }}>
                    <KpiIcon size={16} strokeWidth={2.2} />
                  </div>
                  <div style={{ fontSize:'10px', fontWeight:'700', color: t.textMuted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px' }}>{k.label}</div>
                  <div style={{ fontSize:'25px', fontWeight:'800', color: t.textPrimary, lineHeight:1, letterSpacing:'-0.5px' }}>{k.value}</div>
                </div>
              )
            })}
          </div>

          {/* How it works */}
          <div style={card}>
            <div style={cardHeader}><span style={cardTitle}>How Refer & Earn Works</span></div>
            <div className="refer-steps">
              {HOW_IT_WORKS.map(step => (
                <div key={step.n} style={{ display:'flex', gap:'12px' }}>
                  <div style={{
                    fontSize:'11px', fontWeight:'800', color: t.accent,
                    background: t.accentLight, border:`1px solid ${t.accentBorder}`,
                    borderRadius:'8px', width:'28px', height:'28px', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize:'12.5px', fontWeight:'700', color: t.textPrimary, marginBottom:'3px' }}>{step.title}</div>
                    <div style={{ fontSize:'11.5px', color: t.textSecondary, lineHeight:1.5, fontWeight:'500' }}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral list */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={cardTitle}>Your Referrals</span>
              {!loading && referralList.length > 0 && (
                <span style={{ fontSize:'11px', color: t.textMuted, fontWeight:'600' }}>{referralList.length} total</span>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color: t.emptyColor, fontSize:'12px' }}>
                Loading…
              </div>
            ) : referralList.length === 0 ? (
              <div style={{ textAlign:'center', padding:'36px 20px' }}>
                <div style={{
                  width:'52px', height:'52px', borderRadius:'50%', margin:'0 auto 14px',
                  background: t.accentLight, display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <Link2 size={20} color={t.accent} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize:'13px', fontWeight:'700', color: t.textPrimary, marginBottom:'4px' }}>
                  No referrals yet
                </div>
                <div style={{ fontSize:'12px', color: t.emptyColor, marginBottom:'16px' }}>
                  Share your link to get your first referral started
                </div>
                <button className="refer-copy-btn" style={{ ...btnPrimary, margin:'0 auto' }} onClick={handleCopyLink} disabled={!referralLink}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            ) : (
              <>
              <div className="refer-table-scroll" style={{ borderRadius:'12px', border: darkMode ? t.border : '1px solid #e4e9f5', overflow:'hidden' }}>
                <table style={table}>
                  <thead><tr>{['User','Joined Date','Status','Campaigns Count'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {referralList.map((r, i) => (
                      <tr key={r.id || i} className="refer-row" style={{ '--refer-row-hover': t.rowHover, background: i % 2 === 1 ? (darkMode ? 'rgba(255,255,255,0.015)' : '#fafbff') : 'transparent' }}>
                        <td style={td}>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <div style={avatar}>{(r.name || '?').charAt(0).toUpperCase()}</div>
                            <span style={{ fontWeight:'600' }}>{r.name || '—'}</span>
                          </div>
                        </td>
                        <td style={td}>{r.joined_at ? new Date(r.joined_at).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={td}>{badge(r.status === 'completed' ? 'badgeGreen' : 'badgeAmber', r.status === 'completed' ? 'Completed' : 'Pending')}</td>
                        <td style={td}>{badge('badgeBlue', r.campaigns_count ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="refer-mobile-cards">
                {referralList.map((r, i) => (
                  <div key={r.id || i} style={{ border: t.border, borderRadius:'12px', padding:'12px 14px', background: darkMode ? 'rgba(255,255,255,0.03)' : '#fafbff' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                      <div style={avatar}>{(r.name || '?').charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight:'600', fontSize:'13px' }}>{r.name || '—'}</span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', fontSize:'11px', color: t.textSecondary }}>
                      <span>{r.joined_at ? new Date(r.joined_at).toLocaleDateString('en-IN') : '—'}</span>
                      {badge(r.status === 'completed' ? 'badgeGreen' : 'badgeAmber', r.status === 'completed' ? 'Completed' : 'Pending')}
                      {badge('badgeBlue', `${r.campaigns_count ?? 0} campaigns`)}
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default ReferEarn