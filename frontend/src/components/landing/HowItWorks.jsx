import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Bot,
  Link2,
  Rocket,
  Inbox,
  BarChart3,
  Check,
  X,
  HelpCircle,
  ArrowUp,
  ArrowRight,
} from 'lucide-react'

const HowItWorks = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const steps = [
    {
      n: '01',
      icon: ClipboardList,
      color: '#1A73E8',
      bg: '#eff6ff',
      title: 'Create your campaign',
      desc: 'Tell us your goal — leads, sales or awareness — pick your industry, set your budget and choose which cities or radius zones to target.',
      points: [
        'Choose from ready-made goal categories (Business Loan, Real Estate, Education & more)',
        'Set budget, start/end dates in a few clicks',
        'Pin exact locations on the map with radius targeting',
      ],
    },
    {
      n: '02',
      icon: Bot,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      title: 'AI writes & designs your ad',
      desc: 'Our AI generates platform-optimized headlines, descriptions and creatives tailored to your industry and audience — no copywriter needed.',
      points: [
        'AI-generated ad copy for each platform automatically',
        'Live split-screen preview as you edit',
        'Every ad auto-checked against platform policies before it goes live',
      ],
    },
    {
      n: '03',
      icon: Link2,
      color: '#10b981',
      bg: '#ecfdf5',
      title: 'Connect your ad accounts',
      desc: 'Securely connect your own Google, Meta, LinkedIn or Instagram ad accounts with one click — your campaigns run on your account, not ours.',
      points: [
        'One-click OAuth connection per platform',
        'Your data and spend stay on your own ad accounts',
        'Connect once, reuse for every future campaign',
      ],
    },
    {
      n: '04',
      icon: Rocket,
      color: '#f97316',
      bg: '#fff7ed',
      title: 'Launch across platforms',
      desc: 'Review everything on one screen and go live on Google, Meta, LinkedIn and Instagram simultaneously with a single click.',
      points: [
        'One dashboard for all 4 platforms',
        'Real-time status as each platform approves your ad',
        'No manual re-entry of the same campaign per platform',
      ],
    },
    {
      n: '05',
      icon: Inbox,
      color: '#ec4899',
      bg: '#fdf2f8',
      title: 'Capture leads instantly',
      desc: 'Interested customers fill out your branded lead form. Every lead lands directly in your dashboard — no spreadsheets, no delays.',
      points: [
        'White-labeled forms with your logo & colors',
        'Auto-detected form fields based on your industry',
        'Instant WhatsApp notification option for new leads',
      ],
    },
    {
      n: '06',
      icon: BarChart3,
      color: '#06b6d4',
      bg: '#ecfeff',
      title: 'Track & optimize',
      desc: 'Follow every lead from new to closed, and monitor impressions, clicks and cost-per-lead across all platforms in one unified view.',
      points: [
        'Lead status pipeline with follow-up scheduling and notes',
        'Unified analytics across Google, Meta, LinkedIn & Instagram',
        'See what is working and reallocate budget accordingly',
      ],
    },
  ]

  const faqs = [
    {
      q: 'Do I need a separate agency or ad account?',
      a: 'No agency needed. You connect your own ad accounts on each platform — AdNexus just makes creating, launching and tracking campaigns across all of them simple from one place.',
    },
    {
      q: 'How long does it take to launch my first campaign?',
      a: 'Most businesses go from signup to a live campaign in under 15 minutes using the guided wizard — no technical knowledge required.',
    },
    {
      q: 'Can I run the same campaign on multiple platforms at once?',
      a: 'Yes. Once you complete the wizard, your campaign can launch on Google, Meta, LinkedIn and Instagram simultaneously from a single review screen.',
    },
    {
      q: 'What happens to leads after someone fills my form?',
      a: 'Leads appear instantly in your dashboard with a status pipeline — you can add notes, schedule follow-ups and reach out over WhatsApp directly from there.',
    },
  ]

  return (
    <div style={s.page}>
      <style>{responsiveCSS}</style>

      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <div style={s.navInner} className="nav-inner">
          <a href="/" style={s.logo}>
            <div style={s.logoMark}>A</div>
            <span style={s.logoText}>AdNexus</span>
          </a>
          <div style={s.navLinks} className="nav-links">
            <a href="/#features" style={s.navLink}>Features</a>
            <a href="/how-it-works" style={{ ...s.navLink, color: '#1A73E8', fontWeight: '600' }}>How it works</a>
            <a href="/contact" style={s.navLink}>Contact</a>
            <a href="/about" style={s.navLink}>About</a>
            <a href="/services" style={s.navLink}>Services</a>
          </div>
          <div style={s.navRight} className="nav-right">
            <button style={s.btnGhost} onClick={() => navigate('/login')}>Login</button>
            <button style={s.btnBlue} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
          <button
            style={s.hamburger}
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
          </button>
        </div>
        {menuOpen && (
          <div style={s.mobileMenu} className="mobile-menu">
            <a href="/#features" style={s.mobileMenuLink}>Features</a>
            <a href="/how-it-works" style={{ ...s.mobileMenuLink, color: '#1A73E8', fontWeight: '600' }}>How it works</a>
            <a href="/contact" style={s.mobileMenuLink}>Contact</a>
            <a href="/about" style={s.mobileMenuLink}>About</a>
            <a href="/services" style={s.mobileMenuLink}>Services</a>
            <div style={s.mobileMenuDivider} />
            <button style={{ ...s.btnGhost, width: '100%' }} onClick={() => navigate('/login')}>Login</button>
            <button style={{ ...s.btnBlue, width: '100%' }} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero} className="hero">
        <div style={s.heroBadge}>⚡ From idea to live ad in minutes</div>
        <h1 style={s.heroTitle} className="hero-title">
          Here's exactly how<br />
          <span style={{ color: '#1A73E8' }}>AdNexus works</span>
        </h1>
        <p style={s.heroSub} className="hero-sub">
          No agencies, no jargon, no waiting days for approvals. Six simple steps take
          you from a blank campaign to real leads landing in your dashboard.
        </p>
      </section>

      {/* ── Steps ── */}
      <section style={s.section} className="section">
        <div style={s.sectionLabel}>The Process</div>
        <h2 style={s.sectionTitle} className="section-title">Six steps, start to finish</h2>
        <p style={s.sectionSub}>Each step is designed to remove friction — most businesses complete all six in under 15 minutes.</p>

        <div style={s.stepsList}>
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} style={s.stepRow} className="step-row">
                <div style={s.stepLeft} className="step-left">
                  <div style={{ ...s.stepNumBadge, background: step.color }}>{step.n}</div>
                  {i < steps.length - 1 && <div style={s.stepLine} className="step-line" />}
                </div>
                <div style={s.stepCard}>
                  <div style={{ ...s.stepIconCircle, background: step.bg }}>
                    <Icon size={22} color={step.color} strokeWidth={2.2} />
                  </div>
                  <div style={s.stepTitle}>{step.title}</div>
                  <div style={s.stepDesc}>{step.desc}</div>
                  <ul style={s.stepPoints}>
                    {step.points.map((p, j) => (
                      <li key={j} style={s.stepPoint}>
                        <Check size={15} color={step.color} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Why it's fast ── */}
      <section style={{ ...s.section, background: '#f8faff', maxWidth: '100%', padding: '80px 32px' }} className="section-wide">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={s.sectionLabel}>Why It's Faster</div>
          <h2 style={s.sectionTitle} className="section-title">What usually takes days, takes minutes</h2>
          <div style={s.compareGrid} className="compare-grid">
            <div style={s.compareCard}>
              <div style={s.compareLabel}>Traditional Agency</div>
              <ul style={s.compareList}>
                <li style={s.compareItemBad}><X size={16} color="#ef4444" strokeWidth={2.5} /> Days of back-and-forth briefs</li>
                <li style={s.compareItemBad}><X size={16} color="#ef4444" strokeWidth={2.5} /> Separate logins per platform</li>
                <li style={s.compareItemBad}><X size={16} color="#ef4444" strokeWidth={2.5} /> Manual copywriting & design</li>
                <li style={s.compareItemBad}><X size={16} color="#ef4444" strokeWidth={2.5} /> Leads scattered across emails/sheets</li>
              </ul>
            </div>
            <div style={{ ...s.compareCard, border: '2px solid #1A73E8', background: '#fff' }}>
              <div style={{ ...s.compareLabel, color: '#1A73E8' }}>With AdNexus</div>
              <ul style={s.compareList}>
                <li style={s.compareItemGood}><Check size={16} color="#10b981" strokeWidth={2.5} /> Guided wizard, live in minutes</li>
                <li style={s.compareItemGood}><Check size={16} color="#10b981" strokeWidth={2.5} /> One dashboard, all platforms</li>
                <li style={s.compareItemGood}><Check size={16} color="#10b981" strokeWidth={2.5} /> AI-generated copy & creatives</li>
                <li style={s.compareItemGood}><Check size={16} color="#10b981" strokeWidth={2.5} /> Leads auto-organized with follow-ups</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={s.section} className="section">
        <div style={s.sectionLabel}>FAQ</div>
        <h2 style={s.sectionTitle} className="section-title">Common questions</h2>
        <div style={s.faqList}>
          {faqs.map((f, i) => (
            <div key={i} style={s.faqCard}>
              <div style={s.faqQ}>
                <HelpCircle size={18} color="#1A73E8" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span>{f.q}</span>
              </div>
              <div style={s.faqA}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta} className="cta">
        <h2 style={s.ctaTitle} className="cta-title">Ready to see it in action?</h2>
        <p style={s.ctaSub}>Create your first campaign free — no credit card required.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={s.btnCta} onClick={() => navigate('/signup')}>
            <Rocket size={16} strokeWidth={2.3} /> Start Free Trial
          </button>
          <a href="/about" style={s.btnCtaGhost}>
            Learn About Us <ArrowRight size={16} strokeWidth={2.3} />
          </a>
        </div>
      </section>

      {/* ── Back to top ── */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{ ...s.backToTop, opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'auto' : 'none' }}
      >
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>
    </div>
  )
}

const responsiveCSS = `
  * { box-sizing: border-box; }
  .hamburger-btn { display: none; }

  @media (max-width: 968px) {
    .nav-links, .nav-right { display: none !important; }
    .hamburger-btn { display: flex !important; }
    .compare-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
    .footer-top { grid-template-columns: 1fr !important; gap: 40px !important; }
    .step-row { grid-template-columns: 56px 1fr !important; }
  }

  @media (max-width: 640px) {
    .nav-inner { padding: 0 16px !important; }
    .hero { padding: 48px 20px 40px !important; }
    .hero-title { font-size: 30px !important; }
    .hero-sub { font-size: 15px !important; }
    .section, .section-wide { padding: 48px 20px !important; }
    .section-title { font-size: 26px !important; }
    .footer-links { grid-template-columns: 1fr !important; gap: 24px 12px !important; }
    .footer-bottom { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
    .cta { padding: 48px 20px !important; }
    .cta-title { font-size: 26px !important; }
    .step-row { grid-template-columns: 44px 1fr !important; gap: 14px !important; }
  }
`

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', overflowX: 'hidden' },

  // Nav
  nav:      { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' },
  logo:     { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', gap: '28px', marginLeft: '32px' },
  navLink:  { fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' },
  navRight: { marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' },
  btnGhost: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },
  btnBlue:  { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1A73E8', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },

  hamburger:     { marginLeft: 'auto', width: '36px', height: '36px', border: '1px solid #e0e4ef', borderRadius: '8px', background: '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' },
  hamburgerLine: { width: '18px', height: '2px', background: '#1a1a2e', borderRadius: '2px' },
  mobileMenu:    { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 16px 20px', borderTop: '0.5px solid #e8eaf0', background: '#fff' },
  mobileMenuLink:{ fontSize: '15px', color: '#374151', textDecoration: 'none', fontWeight: '500', padding: '10px 4px' },
  mobileMenuDivider: { height: '1px', background: '#e8eaf0', margin: '8px 0' },

  // Hero
  hero:      { padding: '80px 32px 60px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1e40af', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', marginBottom: '24px', border: '1px solid #bfdbfe' },
  heroTitle: { fontSize: '48px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-1px' },
  heroSub:   { fontSize: '18px', color: '#6b7280', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto' },

  // Section
  section:     { padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' },
  sectionLabel:{ fontSize: '12px', fontWeight: '600', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', textAlign: 'center' },
  sectionTitle:{ fontSize: '36px', fontWeight: '800', color: '#1a1a2e', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.5px' },
  sectionSub:  { fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '52px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7' },

  // Steps (vertical timeline)
  stepsList:      { display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '760px', margin: '0 auto' },
  stepRow:        { display: 'grid', gridTemplateColumns: '64px 1fr', gap: '20px' },
  stepLeft:       { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  stepNumBadge:   { width: '48px', height: '48px', borderRadius: '50%', color: '#fff', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
  stepLine:       { width: '2px', flex: 1, background: '#e0e4ef', margin: '4px 0' },
  stepCard:       { padding: '4px 0 40px', flex: 1 },
  stepIconCircle: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' },
  stepTitle:      { fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  stepDesc:       { fontSize: '14px', color: '#6b7280', lineHeight: '1.7', marginBottom: '14px' },
  stepPoints:     { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0 },
  stepPoint:      { fontSize: '13px', color: '#374151', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: '1.5' },

  // Compare
  compareGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '900px', margin: '0 auto' },
  compareCard: { padding: '28px', borderRadius: '14px', border: '0.5px solid #e0e4ef', background: '#fff' },
  compareLabel:{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '18px' },
  compareList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', margin: 0, padding: 0 },
  compareItemBad:  { fontSize: '14px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' },
  compareItemGood: { fontSize: '14px', color: '#1a1a2e', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },

  // FAQ
  faqList: { display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '760px', margin: '0 auto' },
  faqCard: { padding: '22px 24px', border: '0.5px solid #e0e4ef', borderRadius: '12px', background: '#fff' },
  faqQ:    { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
  faqA:    { fontSize: '14px', color: '#6b7280', lineHeight: '1.7' },

  // CTA
  cta:        { padding: '80px 32px', background: '#1A73E8', textAlign: 'center' },
  ctaTitle:   { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px' },
  ctaSub:     { fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px' },
  btnCta:     { padding: '14px 32px', borderRadius: '10px', border: 'none', background: '#fff', fontSize: '15px', color: '#1A73E8', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  btnCtaGhost:{ padding: '14px 32px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.5)', background: 'transparent', fontSize: '15px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },

  // Footer
  footer:          { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop:       { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerDesc:      { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '16px', maxWidth: '320px' },
  footerContact:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  footerContactItem:{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  footerSocial:    { display: 'flex', gap: '10px', marginTop: '18px' },
  socialIcon:      { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  footerAddress:   { marginTop: '20px' },
  footerAddressName: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' },
  footerAddressRow:  { display: 'flex', gap: '8px' },
  footerAddressText: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', maxWidth: '260px' },
  footerLinks:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  footerCol:       { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle:  { fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink:      { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom:    { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy:      { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },

  // Back to top
  backToTop: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: 'none',
    background: '#1A73E8',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(26,115,232,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    transition: 'opacity 0.25s ease, transform 0.2s ease',
  },
}

export default HowItWorks