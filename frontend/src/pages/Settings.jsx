import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateMe, changePassword } from '../services/api'


const AdminIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9.5 12l2 2 3.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>)
/* ── Theme tokens (same system as Dashboard) ── */
const LIGHT = {
  pageBg: '#f0f4ff', sidebarBg: '#ffffff', topbarBg: '#ffffff', cardBg: '#ffffff',
  border: '1px solid #e4e9f5', borderColor: '#e4e9f5',
  textPrimary: '#0f172a', textSecondary: '#64748b', textMuted: '#94a3b8',
  accent: '#2563eb', accentLight: '#eff6ff', accentBorder: '#bfdbfe',
  navActiveBg: '#eff6ff', navActiveColor: '#2563eb', navColor: '#64748b',
  inputBg: '#f8faff', avatarBg: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  dangerBg: '#fef2f2', dangerBorder: '#fecaca', dangerColor: '#dc2626',
  successBg: '#f0fdf4', successBorder: '#bbf7d0', successColor: '#15803d',
}
const DARK = {
  pageBg: '#05101f', sidebarBg: 'rgba(8,20,45,0.85)', topbarBg: 'rgba(8,20,45,0.75)', cardBg: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.09)', borderColor: 'rgba(255,255,255,0.09)',
  textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.55)', textMuted: 'rgba(255,255,255,0.3)',
  accent: '#3b8bff', accentLight: 'rgba(59,139,255,0.15)', accentBorder: 'rgba(59,139,255,0.3)',
  navActiveBg: 'rgba(59,139,255,0.18)', navActiveColor: '#7bb8ff', navColor: 'rgba(255,255,255,0.45)',
  inputBg: 'rgba(255,255,255,0.06)', avatarBg: 'linear-gradient(135deg,#3b8bff,#7b5af0)',
  shadow: 'none',
  dangerBg: 'rgba(248,113,113,0.1)', dangerBorder: 'rgba(248,113,113,0.25)', dangerColor: '#fca5a5',
  successBg: 'rgba(52,211,153,0.12)', successBorder: 'rgba(52,211,153,0.25)', successColor: '#6ee7b7',
}

const SunIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>)
const MoonIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>)
const EyeIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
const EyeOffIcon = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>)
const ShieldIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>)
const CalendarIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>)
const CardIcon = () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/></svg>)
const CheckCircleIcon = () => (<svg width="15" height="15" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>)
const MenuIcon = () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>)
const CloseIcon = () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>)

const TABS = [
  { key: 'profile', label: 'Profile', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { key: 'account', label: 'Account & Privacy', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { key: 'notifications', label: 'Notifications', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { key: 'billing', label: 'Billing & Plan', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { key: 'danger', label: 'Danger Zone', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86l-8.16 14.14A1 1 0 0 0 3 19.5h18a1 1 0 0 0 .87-1.5L13.7 3.86a1 1 0 0 0-1.73 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { key: 'signout', label: 'Sign Out', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
]

// Breakpoint below which the sidebar becomes an overlay drawer
const MOBILE_BREAKPOINT = 860

const Settings = () => {
  const navigate = useNavigate()
  const { user, loginUser, logoutUser, token } = useAuth()
  // NOTE: activeTab now tracks a single open key. Toggling is done with a
  // functional state update so it never reads a stale value.
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
   const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()

  const visibleTabs = isAdmin
    ? [...TABS.slice(0, -1), { key: 'admin', label: 'Admin Panel', icon: <AdminIcon /> }, TABS[TABS.length - 1]]
    : TABS
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  const handleToggle = (key) => {
    setActiveTab((prev) => (prev === key ? null : key))
  }

  const t = darkMode ? DARK : LIGHT
  const displayName = user?.name || 'Shobhit Pandey'
  const displayRole = user?.role || 'Member'
  const displayInitials = displayName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg> },
    { id: 'campaigns', label: 'Campaigns', path: '/dashboard/create-campaign', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'leads', label: 'Leads', path: '/dashboard/leads', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id: 'analytics', label: 'Analytics', path: '/dashboard', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'settings', label: 'Settings', path: '/dashboard/settings', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  ]

  // On mobile the sidebar is always "expanded" width when it slides in,
  // and never permanently collapsed (that control only matters on desktop).
  const effectiveCollapsed = isMobile ? false : sidebarCollapsed

  const wrap = { display: 'flex', height: '100vh', background: darkMode ? 'linear-gradient(135deg,#05101f 0%,#091830 50%,#05101f 100%)' : t.pageBg, fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: '13px', position: 'relative', overflow: 'hidden' }
  const sidebar = {
    width: effectiveCollapsed ? '60px' : '230px',
    background: t.sidebarBg, borderRight: t.border, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    transition: 'width 0.22s ease, transform 0.25s ease',
    ...(darkMode ? { backdropFilter: 'blur(20px)' } : { boxShadow: '1px 0 0 #e4e9f5' }),
    ...(isMobile ? {
      position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 40,
      transform: mobileNavOpen ? 'translateX(0)' : 'translateX(-100%)',
      boxShadow: mobileNavOpen ? '2px 0 24px rgba(0,0,0,0.25)' : 'none',
    } : {}),
  }
  const backdrop = {
    display: isMobile && mobileNavOpen ? 'block' : 'none',
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30,
  }
  const sbLogo = { display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px 14px', borderBottom: t.border, minHeight: '58px', justifyContent: effectiveCollapsed ? 'center' : 'space-between' }
  const sbLogoIcon = { width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(37,99,235,0.4)' }
  const sbNav = { display: 'flex', flexDirection: 'column', gap: '3px', padding: '12px 10px', flex: 1, overflowY: 'auto' }
  const navItemBase = { display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 12px', borderRadius: '10px', border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', color: t.navColor, whiteSpace: 'nowrap', overflow: 'hidden' }
  const navItemActiveStyle = { background: t.navActiveBg, color: t.navActiveColor, ...(darkMode ? { border: '1px solid rgba(59,139,255,0.28)' } : {}) }
  const sbBottom = { borderTop: t.border, padding: '12px 10px' }
  const userRow = { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 8px', borderRadius: '10px', marginBottom: '4px', overflow: 'hidden' }
  const userAvatar = { width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: '#fff' }
  const topbar = { background: t.topbarBg, borderBottom: t.border, padding: isMobile ? '0 14px' : '0 24px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '10px', ...(darkMode ? { backdropFilter: 'blur(12px)' } : { boxShadow: '0 1px 0 #e4e9f5' }) }
  const toggleBtn = { display: 'flex', alignItems: 'center', gap: '6px', background: darkMode ? 'rgba(255,255,255,0.1)' : t.accentLight, border: darkMode ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${t.accentBorder}`, borderRadius: '20px', padding: isMobile ? '5px 10px' : '5px 12px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', color: darkMode ? '#fff' : t.accent, fontFamily: 'inherit', flexShrink: 0 }
  const hamburgerBtn = { display: isMobile ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '9px', border: `1px solid ${t.borderColor}`, background: 'transparent', color: t.textPrimary, cursor: 'pointer', flexShrink: 0 }

  // ── Layout fills the width: an accordion settings list that adapts
  // its padding and max-width to the viewport.
  const content = { flex: 1, overflow: 'auto', padding: isMobile ? '16px 14px' : '24px 28px' }
  const accordionWrap = { maxWidth: isMobile ? '100%' : '600px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }
  const accordionItem = { background: t.cardBg, border: t.border, borderRadius: '16px', overflow: 'hidden', ...(darkMode ? { backdropFilter: 'blur(16px)' } : { boxShadow: t.shadow }) }
  const accordionHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: isMobile ? '14px 16px' : '17px 22px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', gap: '10px' }
  const accordionHeaderLeft = { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }
  const accordionIconBox = { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  const accordionLabel = { fontSize: '13.5px', fontWeight: '700', color: t.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
  const accordionChevron = { color: t.textMuted, transition: 'transform 0.2s', flexShrink: 0 }
  const accordionBody = { padding: isMobile ? '0 16px 20px 16px' : '0 22px 24px 22px' }
  const card = { position: 'relative' }
  const cardAccent = { display: 'none' }
  const cardTitle = { fontSize: '16px', fontWeight: '700', color: t.textPrimary, margin: 0 }
  const cardSubtitle = { fontSize: '12.5px', color: t.textSecondary, marginTop: '4px', marginBottom: '22px' }
  const label = { display: 'block', fontSize: '11px', fontWeight: '700', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '16px' }
  const input = { width: '100%', padding: '11px 13px', borderRadius: '10px', border: `1px solid ${t.borderColor}`, background: t.inputBg, color: t.textPrimary, fontSize: '13.5px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const passwordWrap = { position: 'relative', width: '100%' }
  const eyeIcon = { position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', color: t.textMuted }
  const primaryButton = { marginTop: '22px', padding: '11px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(37,99,235,0.35)', width: isMobile ? '100%' : 'auto' }
  const secondaryButton = { padding: '8px 16px', borderRadius: '10px', border: `1px solid ${t.borderColor}`, background: 'transparent', color: t.textPrimary, fontWeight: '600', fontSize: '12.5px', cursor: 'pointer', fontFamily: 'inherit' }
  const rulesBox = { marginTop: '10px', padding: '12px 14px', background: t.inputBg, borderRadius: '10px', border: `1px solid ${t.borderColor}` }
  const ruleRow = { display: 'flex', alignItems: 'center', gap: '8px', padding: '3px 0' }

  const passwordRules = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'At least 1 uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'At least 1 number', test: (pw) => /[0-9]/.test(pw) },
    { label: 'At least 1 special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\];'`~\\/]/.test(pw) },
  ]

  return (
    <div style={wrap}>
      {/* Mobile backdrop */}
      <div style={backdrop} onClick={() => setMobileNavOpen(false)} />

      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={sbLogo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={sbLogoIcon}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M8 24L16 8L24 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.5 19h11" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            {!effectiveCollapsed && <span style={{ fontSize: '16px', fontWeight: '700', color: t.textPrimary }}>AdNexus</span>}
          </div>
          {isMobile && (
            <button onClick={() => setMobileNavOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'transparent', color: t.textSecondary, cursor: 'pointer', flexShrink: 0 }} aria-label="Close menu">
              <CloseIcon />
            </button>
          )}
        </div>
        <nav style={sbNav}>
          {navItems.map(item => (
            <button key={item.id} title={effectiveCollapsed ? item.label : ''}
              onClick={() => { navigate(item.path); setMobileNavOpen(false) }}
              style={{ ...navItemBase, ...(item.id === 'settings' ? navItemActiveStyle : {}), justifyContent: effectiveCollapsed ? 'center' : 'flex-start' }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {!effectiveCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={sbBottom}>
          <div style={userRow}>
            <div style={userAvatar}>{displayInitials}</div>
            {!effectiveCollapsed && (
              <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: t.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                <div style={{ fontSize: '11px', color: t.textSecondary }}>{displayRole}</div>
              </div>
            )}
          </div>
          {!isMobile && (
            <button onClick={() => setSidebarCollapsed(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '10px', border: 'none', background: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', color: t.textSecondary, justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}><polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {!sidebarCollapsed && <span style={{ fontSize: '12px' }}>Collapse</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <button style={hamburgerBtn} onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
            <div style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '700', color: t.textPrimary, whiteSpace: 'nowrap' }}>Settings</div>
          </div>
          <button style={toggleBtn} onClick={() => setDarkMode(v => !v)}>
            {darkMode ? <SunIcon /> : <MoonIcon />}
            {!isMobile && (darkMode ? 'Light' : 'Dark')}
          </button>
         
        </header>

        <div style={content}>
          <div style={accordionWrap}>
            {visibleTabs.map(tab => {
  const isOpen = activeTab === tab.key
  const isDanger = tab.key === 'danger'
  const isAdminTab = tab.key === 'admin'
  return (
    <div key={tab.key} style={accordionItem}>
      <button
        type="button"
        style={accordionHeader}
        onClick={() => {
          if (isAdminTab) {
            navigate('/admin')   // seedha admin page pe le jao, accordion expand mat karo
          } else {
            handleToggle(tab.key)
          }
        }}
      >
        <div style={accordionHeaderLeft}>
          <span style={{ ...accordionIconBox, background: isDanger ? t.dangerBg : t.accentLight, color: isDanger ? t.dangerColor : t.accent }}>
            {tab.icon}
          </span>
          <span style={{ ...accordionLabel, ...(isDanger ? { color: t.dangerColor } : {}) }}>{tab.label}</span>
        </div>
        {!isAdminTab && (
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ ...accordionChevron, transform: isOpen ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {isOpen && !isAdminTab && (
        <div style={accordionBody}>
          {tab.key === 'profile' && <ProfileSection styles={{ card, cardAccent, cardTitle, cardSubtitle, label, input, primaryButton, secondaryButton, t }} displayInitials={displayInitials} isMobile={isMobile} user={user} />}
          {tab.key === 'account' && <AccountSection styles={{ card, cardAccent, cardTitle, cardSubtitle, label, input, passwordWrap, eyeIcon, primaryButton, rulesBox, ruleRow, t }} passwordRules={passwordRules} EyeIcon={EyeIcon} EyeOffIcon={EyeOffIcon} />}
          {tab.key === 'notifications' && <NotificationsSection styles={{ card, cardAccent, cardTitle, cardSubtitle, t, darkMode }} isMobile={isMobile} />}
          {tab.key === 'billing' && <BillingSection styles={{ card, cardAccent, cardTitle, cardSubtitle, label, primaryButton, t }} isMobile={isMobile} />}
          {tab.key === 'danger' && <DangerZoneSection styles={{ card, cardTitle, cardSubtitle, label, input, t }} />}
          {tab.key === 'signout' && <SignOutSection styles={{ card, cardAccent, cardTitle, cardSubtitle, primaryButton, t }} navigate={navigate} logoutUser={logoutUser} />}
        </div>
      )}
    </div>
  )
})}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Profile ---------------- */
const ProfileSection = ({ styles: s, displayInitials, isMobile, user }) => {
  const { loginUser, token } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)   // NEW: locally selected photo (no backend yet)
  const fileInputRef = React.useRef(null)

  // Agar user context thodi der baad load ho (page refresh case), fields sync kar do
  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
  }, [user?.name, user?.email])

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
    // Reset input so selecting the same file again still fires onChange
    e.target.value = ''
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await updateMe({ name, email })
      // Context ka user turant update kar do — sidebar bhi turant naya naam dikhayega
      loginUser(token, res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.card}>
      <p style={{ ...s.cardSubtitle, marginTop: 0 }}>Update your personal details</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <div style={{
          width: '58px', height: '58px', borderRadius: '50%',
          background: photoPreview ? `url(${photoPreview}) center/cover no-repeat` : s.t.avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '22px', color: '#fff', flexShrink: 0,
        }}>
          {!photoPreview && displayInitials}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelected}
          style={{ display: 'none' }}
        />
        <button type="button" style={s.secondaryButton} onClick={handleChangePhotoClick}>
          {photoPreview ? 'Change photo' : 'Upload photo'}
        </button>
      </div>
      {error && <div style={{ background: s.t.dangerBg, border: `1px solid ${s.t.dangerBorder}`, color: s.t.dangerColor, padding: '10px 12px', borderRadius: '10px', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSave}>
        <label style={s.label}>Full Name</label>
        <input style={s.input} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button style={s.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

/* ---------------- Account & Password ---------------- */
const AccountSection = ({ styles: s, passwordRules, EyeIcon, EyeOffIcon }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)   // NEW: current password visibility
  const [showNew, setShowNew] = useState(false)
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const isValid = passwordRules.every((r) => r.test(newPassword))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!isValid) { setError('New password does not meet all requirements.'); return }

    setSaving(true)
    try {
      // Yahi wo call hai jo pehle missing thi — backend ko actual request bhejta hai
      await changePassword({ current_password: currentPassword, new_password: newPassword })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.card}>
      <p style={{ ...s.cardSubtitle, marginTop: 0 }}>Change your password to keep your account secure</p>
      {error && <div style={{ background: s.t.dangerBg, border: `1px solid ${s.t.dangerBorder}`, color: s.t.dangerColor, padding: '10px 12px', borderRadius: '10px', fontSize: '13px' }}>{error}</div>}
      {success && <div style={{ background: s.t.successBg, border: `1px solid ${s.t.successBorder}`, color: s.t.successColor, padding: '10px 12px', borderRadius: '10px', fontSize: '13px' }}>Password updated successfully.</div>}
      <form onSubmit={handleSubmit}>
        <label style={s.label}>Current Password</label>
        <div style={s.passwordWrap}>
          <input
            style={{ ...s.input, paddingRight: '40px' }}
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <span
            style={s.eyeIcon}
            onClick={() => setShowCurrent((p) => !p)}
            role="button"
            aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
          >
            {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
          </span>
        </div>

        <label style={s.label}>New Password</label>
        <div style={s.passwordWrap}>
          <input
            style={{ ...s.input, paddingRight: '40px' }}
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setFocused(true)}
            required
          />
          <span
            style={s.eyeIcon}
            onClick={() => setShowNew((p) => !p)}
            role="button"
            aria-label={showNew ? 'Hide new password' : 'Show new password'}
          >
            {showNew ? <EyeOffIcon /> : <EyeIcon />}
          </span>
        </div>
        {(focused || newPassword.length > 0) && (
          <div style={s.rulesBox}>
            {passwordRules.map((rule, idx) => {
              const passed = rule.test(newPassword)
              return (
                <div key={idx} style={s.ruleRow}>
                  <span style={{ fontSize: '13px', fontWeight: '700', width: '14px', color: passed ? '#16a34a' : s.t.textMuted }}>{passed ? '✓' : '○'}</span>
                  <span style={{ fontSize: '12.5px', color: passed ? '#16a34a' : s.t.textSecondary }}>{rule.label}</span>
                </div>
              )
            })}
          </div>
        )}
        <button style={s.primaryButton} type="submit" disabled={saving}>
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}

/* ---------------- Notifications ---------------- */
const NotificationsSection = ({ styles: s, isMobile }) => {
  const [prefs, setPrefs] = useState({ campaignAlerts: true, weeklyReport: true, leadNotifications: true, productUpdates: false })
  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  const items = [
    { key: 'campaignAlerts', label: 'Campaign alerts', desc: 'Get notified when a campaign status changes' },
    { key: 'weeklyReport', label: 'Weekly performance report', desc: 'Summary email every Monday' },
    { key: 'leadNotifications', label: 'New lead notifications', desc: 'Instant alert when a new lead comes in' },
    { key: 'productUpdates', label: 'Product updates', desc: 'News about new AdNexus features' },
  ]
  return (
    <div style={s.card}>
      <p style={{ ...s.cardSubtitle, marginTop: 0 }}>Choose what you want to be notified about</p>
      {items.map((item, i) => (
        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '15px 0', borderBottom: i < items.length - 1 ? `1px solid ${s.t.borderColor}` : 'none' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: '600', color: s.t.textPrimary }}>{item.label}</div>
            <div style={{ fontSize: '12px', color: s.t.textSecondary, marginTop: '2px' }}>{item.desc}</div>
          </div>
          <span onClick={() => toggle(item.key)} role="switch" aria-checked={prefs[item.key]} style={{ width: '40px', height: '22px', borderRadius: '999px', position: 'relative', cursor: 'pointer', background: prefs[item.key] ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : (s.darkMode ? 'rgba(255,255,255,0.15)' : '#e2e8f0'), transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: '2px', left: prefs[item.key] ? '20px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Billing ---------------- */
const BillingSection = ({ styles: s, isMobile }) => (
  <div style={s.card}>
    <p style={{ ...s.cardSubtitle, marginTop: 0 }}>Manage your subscription and payment details</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '14px', padding: '18px 20px', background: s.t.inputBg, borderRadius: '12px', border: `1px solid ${s.t.borderColor}`, marginBottom: '18px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: s.t.textPrimary }}>Free Plan</div>
        <div style={{ fontSize: '12.5px', color: s.t.textSecondary, marginTop: '2px' }}>Up to ₹1,000 ad spend / month</div>
      </div>
      <button style={{ ...s.primaryButton, marginTop: 0, width: isMobile ? '100%' : 'auto' }}>Upgrade plan</button>
    </div>
    <label style={s.label}>Payment Method</label>
    <div style={{ padding: '16px', background: s.t.inputBg, borderRadius: '10px', border: `1px dashed ${s.t.borderColor}`, fontSize: '13px', color: s.t.textSecondary, marginTop: '6px' }}>No payment method added yet.</div>
  </div>
)

/* ---------------- Danger Zone ---------------- */
const DangerZoneSection = ({ styles: s }) => {
  const [confirmText, setConfirmText] = useState('')
  return (
    <div style={s.card}>
      <p style={{ ...s.cardSubtitle, marginTop: 0 }}>This action is permanent and cannot be undone</p>
      <label style={s.label}>Type "DELETE" to confirm</label>
      <input style={s.input} type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
      <button style={{ marginTop: '20px', padding: '11px 20px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit', opacity: confirmText === 'DELETE' ? 1 : 0.5, cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed', width: '100%' }} disabled={confirmText !== 'DELETE'}>
        Delete my account
      </button>
    </div>
  )
}

/* ---------------- Sign Out ---------------- */
const SignOutSection = ({ styles: s, navigate, logoutUser }) => {
  const handleSignOut = () => {
    logoutUser()
    navigate('/login')
  }
  return (
    <div style={s.card}>
      <div style={s.cardAccent} />
      <h3 style={s.cardTitle}>Sign Out</h3>
      <p style={s.cardSubtitle}>You'll be signed out of AdNexus on this device</p>
      <button style={s.primaryButton} onClick={handleSignOut}>Sign out</button>
    </div>
  )
}

export default Settings