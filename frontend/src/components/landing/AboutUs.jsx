import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Flag,
  Bot,
  Zap,
  Target,
  Lock,
  Handshake,
  Award,
  FlaskConical,
  MapPin,
  Globe,
  Rocket,
  ArrowUp,
  ArrowRight,
} from 'lucide-react'

const AboutUs = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const values = [
    { icon: Flag, color: '#1A73E8', bg: '#eff6ff', title: 'Built for India', desc: 'Every feature is designed around the realities of Indian B2B markets — from ₹ budgets to regional targeting across all 28 states and 8 union territories.' },
    { icon: Bot, color: '#8b5cf6', bg: '#f5f3ff', title: 'AI First', desc: 'We believe every business deserves world-class ad content. Our AI generates platform-optimized copy so you never need a copywriter or agency again.' },
    { icon: Zap, color: '#f97316', bg: '#fff7ed', title: 'Speed Over Complexity', desc: 'What used to take agencies days now takes minutes. We obsess over removing every unnecessary step between your idea and a live campaign.' },
    { icon: Target, color: '#ef4444', bg: '#fef2f2', title: 'Results Over Vanity', desc: 'We measure success in qualified leads and cost per lead — not impressions or reach. Every feature we build drives real business outcomes.' },
    { icon: Lock, color: '#10b981', bg: '#ecfdf5', title: 'Data Privacy', desc: 'Your campaign data, lead data and business information is yours. We never sell, share or use your data for any purpose outside of running your campaigns.' },
    { icon: Handshake, color: '#06b6d4', bg: '#ecfeff', title: 'Transparent Pricing', desc: 'No hidden fees, no agency commissions, no percentage of ad spend. You always know exactly what you are paying and why.' },
  ]

  const stats = [
    { num: '4+',    label: 'Ad Platforms Supported' },
    { num: '28+',   label: 'States Covered' },
    { num: '10x',   label: 'Faster Than Traditional Agencies' },
    { num: '₹100-200',  label: 'Average Cost Per Lead' },
  ]

  const platforms = [
    {
      name: 'Google Ads',
      desc: 'Search & Display',
      color: '#1A73E8',
      noBadge: false,
      icon: (
        <svg width="26" height="26" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
          <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      desc: 'Social Media',
      color: '#1877F2',
      noBadge: false,
      icon: (
        <svg width="30" height="30" viewBox="0 0 36 36">
          <path fill="#1877F2" d="M36 18c0-9.94-8.06-18-18-18S0 8.06 0 18c0 8.98 6.58 16.41 15.19 17.76V23.2h-4.57V18h4.57v-3.97c0-4.51 2.69-7.01 6.8-7.01 1.97 0 4.03.35 4.03.35v4.43h-2.27c-2.24 0-2.94 1.39-2.94 2.81V18h5l-.8 5.2h-4.2v12.56C29.42 34.41 36 26.98 36 18z"/>
          <path fill="#fff" d="M25 23.2l.8-5.2h-5v-3.39c0-1.42.7-2.81 2.94-2.81h2.27V7.37s-2.06-.35-4.03-.35c-4.11 0-6.8 2.5-6.8 7.01V18h-4.57v5.2h4.57v12.56a18.18 18.18 0 0 0 5.62 0V23.2H25z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      desc: 'Visual Content',
      color: '#E1306C',
      noBadge: true,
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48">
          <defs>
            <radialGradient id="ig-grad-about" cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="5%" stopColor="#fdf497" />
              <stop offset="45%" stopColor="#fd5949" />
              <stop offset="60%" stopColor="#d6249f" />
              <stop offset="90%" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ig-grad-about)"></rect>
          <rect x="13" y="13" width="22" height="22" rx="6" fill="none" stroke="#fff" strokeWidth="2.4"></rect>
          <circle cx="24" cy="24" r="6.2" fill="none" stroke="#fff" strokeWidth="2.4"></circle>
          <circle cx="33.2" cy="14.8" r="1.6" fill="#fff"></circle>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      desc: 'B2B Professional',
      color: '#0A66C2',
      noBadge: true,
      icon: (
        <svg width="40" height="40" viewBox="0 0 48 48">
          <rect x="2" y="2" width="44" height="44" rx="9" fill="#0A66C2"></rect>
          <g transform="translate(11, 11) scale(0.052)">
            <path fill="#fff" d="M100.28 448H7.4V148.9h92.88zM53.84 108.2C24.09 108.2 0 84.1 0 54.3a54.3 54.3 0 0 1 108.6 0c0 29.8-24.1 53.9-54.3 53.9zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
          </g>
        </svg>
      ),
    },
  ]

  const highlights = [
    { icon: Award, color: '#f59e0b', bg: '#fffbeb', title: 'India-First Platform', desc: 'Built ground up for Indian B2B businesses, with ₹ budgets, Indian city targeting, and GST-compliant invoicing.' },
    { icon: FlaskConical, color: '#8b5cf6', bg: '#f5f3ff', title: 'AI-Powered Validation', desc: 'Every ad is automatically checked against all 4 platform policies before publishing. No more rejected campaigns.' },
    { icon: MapPin, color: '#10b981', bg: '#ecfdf5', title: 'Pan-India Coverage', desc: 'Target any city, district or state across India with our built-in geo-targeting and radius zone technology.' },
  ]

  return (
    <div style={s.page}>
      {/* ── Responsive CSS ── */}
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
            <a href="/#how"      style={s.navLink}>How it works</a>
            {/* <a href="/#pricing"  style={s.navLink}>Pricing</a> */}
            <Link to="/contact"  style={s.navLink}>Contact</Link>
            <Link to="/about"    style={{ ...s.navLink, color: '#1A73E8', fontWeight: '600' }}>About</Link>
            <Link to="/services" style={s.navLink}>Services</Link>
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
            <a href="/#how"      style={s.mobileMenuLink}>How it works</a>
            <Link to="/contact"  style={s.mobileMenuLink} onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link to="/about"    style={{ ...s.mobileMenuLink, color: '#1A73E8', fontWeight: '600' }} onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/services" style={s.mobileMenuLink} onClick={() => setMenuOpen(false)}>Services</Link>
            <div style={s.mobileMenuDivider} />
            <button style={{ ...s.btnGhost, width: '100%' }} onClick={() => navigate('/login')}>Login</button>
            <button style={{ ...s.btnBlue, width: '100%' }} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero} className="hero">
        <div style={s.heroBadge}>🇮🇳 Proudly Built in India</div>
        <h1 style={s.heroTitle} className="hero-title">
          We're on a mission to make<br />
          <span style={{ color: '#1A73E8' }}>great advertising accessible</span><br />
          to every Indian business
        </h1>
        <p style={s.heroSub} className="hero-sub">
          AdNexus was built because Indian B2B businesses deserve better than
          expensive agencies, complicated tools, and opaque pricing. We built the
          platform we always wished existed.
        </p>
      </section>

      {/* ── Stats ── */}
      <div style={s.statsBar}>
        <div style={s.statsInner} className="stats-inner">
          {stats.map((stat, i) => (
            <div key={i} style={s.statItem}>
              <div style={s.statNum} className="stat-num">{stat.num}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <section style={s.section} className="section">
        <div style={s.sectionLabel}>Our Story</div>
        <h2 style={s.sectionTitle} className="section-title">Why we built AdNexus</h2>
        <div style={s.storyGrid} className="story-grid">
          <div style={s.storyText}>
            <p style={s.storyPara}>
              Running ads across Google, Facebook, Instagram and LinkedIn used to mean
              hiring multiple agencies, managing separate dashboards, and spending weeks
              just to get a single campaign live. For most Indian SMEs and B2B companies,
              this was simply out of reach.
            </p>
            <p style={s.storyPara}>
              We built AdNexus to change that. One platform. One dashboard. All four
              major ad networks. With AI that writes your ad copy, validates your creatives,
              and ensures every ad meets platform requirements before it goes live.
            </p>
            <p style={s.storyPara}>
              Today AdNexus serves businesses across all 28 states and 8 union territories
              of India — from manufacturing companies in Gujarat to fintech startups in
              Bangalore to logistics firms in Delhi NCR. Our goal is simple: help every
              Indian business grow with smarter, faster, more affordable advertising.
            </p>
          </div>
          <div style={s.storyHighlights}>
            {highlights.map((h, i) => {
              const Icon = h.icon
              return (
                <div key={i} style={s.highlightCard}>
                  <div style={{ ...s.highlightIconCircle, background: h.bg }}>
                    <Icon size={20} color={h.color} strokeWidth={2.2} />
                  </div>
                  <div style={s.highlightTitle}>{h.title}</div>
                  <div style={s.highlightDesc}>{h.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── What we do ── */}
      <section style={{ ...s.section, background: '#f8faff', maxWidth: '100%', padding: '80px 32px' }} className="section-wide">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={s.sectionLabel}>What We Do</div>
          <h2 style={s.sectionTitle} className="section-title">One platform for all your ad campaigns</h2>
          <p style={s.sectionSub}>We connect your campaigns to all major ad networks and manage the complexity so you don't have to.</p>
          <div style={s.platformsGrid} className="platforms-grid">
            {platforms.map((p, i) => (
              <div key={i} style={s.platformCard}>
                <div style={p.noBadge ? s.platformIconFlat : s.platformIconBadge}>{p.icon}</div>
                <div style={s.platformName}>{p.name}</div>
                <div style={s.platformDesc}>{p.desc}</div>
                <div style={{ ...s.platformBadge, color: p.color, background: p.color + '15' }}>✓ Supported</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={s.section} className="section">
        <div style={s.sectionLabel}>Our Values</div>
        <h2 style={s.sectionTitle} className="section-title">What we stand for</h2>
        <p style={s.sectionSub}>These aren't just words on a wall. They are the decisions we make every day when building AdNexus.</p>
        <div style={s.valuesGrid} className="values-grid">
          {values.map((v, i) => {
            const Icon = v.icon
            return (
              <div key={i} style={{ ...s.valueCard, background: v.bg, borderColor: v.color + '30' }}>
                <div style={{ ...s.valueIconCircle, background: '#fff' }}>
                  <Icon size={22} color={v.color} strokeWidth={2.2} />
                </div>
                <div style={s.valueTitle}>{v.title}</div>
                <div style={s.valueDesc}>{v.desc}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Coverage ── */}
      <section style={{ ...s.section, background: '#f8faff', maxWidth: '100%', padding: '80px 32px' }} className="section-wide">
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={s.sectionLabel}>Coverage</div>
          <h2 style={s.sectionTitle} className="section-title">Serving businesses across all of India</h2>
          <p style={s.sectionSub}>From metro cities to tier-2 and tier-3 towns — AdNexus helps businesses of every size reach their audience.</p>
          <div style={s.coverageGrid}>
            {[
              'Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
              'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat',
              'Lucknow', 'Chandigarh', 'Indore', 'Coimbatore', 'Kochi',
              'Nagpur', 'Visakhapatnam', 'Bhopal', 'Patna', 'Vadodara',
            ].map((city, i) => (
              <div key={i} style={s.cityTag}>
                <MapPin size={12} color="#1e40af" strokeWidth={2.4} /> {city}
              </div>
            ))}
            <div style={{ ...s.cityTag, background: '#1A73E8', color: '#fff', border: 'none', fontWeight: '600' }}>+ All cities across India</div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={s.section} className="section">
        <div style={s.sectionLabel}>Contact</div>
        <h2 style={s.sectionTitle} className="section-title">Get in touch</h2>
        <p style={s.sectionSub}>Have questions about AdNexus? We'd love to hear from you.</p>
        <div style={s.contactGrid} className="contact-grid">
          <div style={{ ...s.contactCard, background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div style={{ ...s.contactIconCircle, background: '#ffffff' }}>
              <svg width="26" height="26" viewBox="0 0 48 48">
                <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
                <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
                <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
                <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2l-3.622-2.716C8.249,7.85,7.099,7.5,5.922,7.5C4.311,7.5,3,8.811,3,10.422V12.298z"/>
                <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.622-2.716C39.751,7.85,40.901,7.5,42.078,7.5C43.689,7.5,45,8.811,45,10.422V12.298z"/>
              </svg>
            </div>
            <div style={s.contactTitle}>Email Us</div>
            <div style={{ ...s.contactValue, color: '#1A73E8' }}>adnexus@adnexus.co.in</div>
            <div style={s.contactNote}>We respond within 24 hours</div>
          </div>

          <div style={{ ...s.contactCard, background: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <div style={{ ...s.contactIconCircle, background: '#ffffff' }}>
              <Globe size={24} color="#10b981" strokeWidth={2.2} />
            </div>
            <div style={s.contactTitle}>Website</div>
            <div style={{ ...s.contactValue, color: '#10b981' }}>adnexus.co.in</div>
            <div style={s.contactNote}>Visit our platform</div>
          </div>

          <div style={{ ...s.contactCard, background: '#fff7ed', borderColor: '#fed7aa' }}>
            <div style={{ ...s.contactIconCircle, background: '#ffffff' }}>
              <MapPin size={24} color="#f97316" strokeWidth={2.2} />
            </div>
            <div style={s.contactTitle}>Operations</div>
            <div style={{ ...s.contactValue, color: '#f97316' }}>Pan India</div>
            <div style={s.contactNote}>All 28 states & 8 UTs</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta} className="cta">
        <h2 style={s.ctaTitle} className="cta-title">Ready to grow your business?</h2>
        <p style={s.ctaSub}>Join businesses across India already using AdNexus to launch smarter ad campaigns.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={s.btnCta} onClick={() => navigate('/signup')}>
            <Rocket size={16} strokeWidth={2.3} /> Start Free Trial
          </button>
          <a href="/#pricing" style={s.btnCtaGhost}>
            View Pricing <ArrowRight size={16} strokeWidth={2.3} />
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
    .story-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
    .platforms-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .contact-grid { grid-template-columns: 1fr !important; }
    .footer-top { grid-template-columns: 1fr !important; gap: 40px !important; }
  }

  @media (max-width: 640px) {
    .nav-inner { padding: 0 16px !important; }
    .hero { padding: 48px 20px 40px !important; }
    .hero-title { font-size: 30px !important; }
    .hero-sub { font-size: 15px !important; }
    .stats-inner { flex-wrap: wrap !important; gap: 24px !important; padding: 28px 20px !important; }
    .stats-inner > div { flex: 1 1 40% !important; }
    .stat-num { font-size: 26px !important; }
    .section, .section-wide { padding: 48px 20px !important; }
    .section-title { font-size: 26px !important; }
    .platforms-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
    .values-grid { grid-template-columns: 1fr !important; }
    .footer-links { grid-template-columns: 1fr !important; gap: 24px 12px !important; }
    .footer-bottom { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
    .cta { padding: 48px 20px !important; }
    .cta-title { font-size: 26px !important; }
  }

  @media (max-width: 420px) {
    .platforms-grid { grid-template-columns: 1fr !important; }
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

  // Hamburger
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

  // Stats
  statsBar:   { background: '#1A73E8', padding: '0' },
  statsInner: { maxWidth: '1200px', margin: '0 auto', padding: '36px 32px', display: 'flex', gap: '0', justifyContent: 'space-around' },
  statItem:   { textAlign: 'center' },
  statNum:    { fontSize: '36px', fontWeight: '800', color: '#fff' },
  statLabel:  { fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' },

  // Section
  section:     { padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' },
  sectionLabel:{ fontSize: '12px', fontWeight: '600', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', textAlign: 'center' },
  sectionTitle:{ fontSize: '36px', fontWeight: '800', color: '#1a1a2e', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.5px' },
  sectionSub:  { fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '52px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7' },

  // Story
  storyGrid:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' },
  storyText:          {},
  storyPara:          { fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' },
  storyHighlights:    { display: 'flex', flexDirection: 'column', gap: '16px' },
  highlightCard:      { padding: '20px', background: '#f8faff', borderRadius: '12px', border: '0.5px solid #e0e4ef' },
  highlightIconCircle:{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  highlightTitle:     { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  highlightDesc:      { fontSize: '13px', color: '#6b7280', lineHeight: '1.6' },

  // Platforms
  platformsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  platformCard:     { padding: '24px', background: '#fff', borderRadius: '14px', border: '0.5px solid #e0e4ef', textAlign: 'center' },
  platformIconBadge:{ width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8faff', border: '1px solid #eef0f6' },
  platformIconFlat: { width: '44px', height: '44px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  platformName:     { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  platformDesc:     { fontSize: '12px', color: '#6b7280', marginBottom: '12px' },
  platformBadge:    { display: 'inline-block', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },

  // Values
  valuesGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  valueCard:       { padding: '28px', border: '1px solid #e0e4ef', borderRadius: '14px' },
  valueIconCircle: { width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  valueTitle:      { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  valueDesc:       { fontSize: '14px', color: '#6b7280', lineHeight: '1.65' },

  // Coverage
  coverageGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '8px' },
  cityTag:      { padding: '7px 14px', background: '#f0f7ff', border: '0.5px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', color: '#1e40af', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' },

  // Contact
  contactGrid:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  contactCard:       { padding: '32px 24px', border: '1px solid #e0e4ef', borderRadius: '14px', textAlign: 'center' },
  contactIconCircle: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  contactTitle:      { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  contactValue:      { fontSize: '16px', fontWeight: '600', marginBottom: '6px' },
  contactNote:       { fontSize: '12px', color: '#6b7280' },

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

export default AboutUs