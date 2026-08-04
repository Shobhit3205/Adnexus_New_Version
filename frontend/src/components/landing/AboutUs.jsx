import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AboutUs = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const values = [
    { icon: '🇮🇳', title: 'Built for India', desc: 'Every feature is designed around the realities of Indian B2B markets — from ₹ budgets to regional targeting across all 28 states and 8 union territories.' },
    { icon: '🤖', title: 'AI First', desc: 'We believe every business deserves world-class ad content. Our AI generates platform-optimized copy so you never need a copywriter or agency again.' },
    { icon: '⚡', title: 'Speed Over Complexity', desc: 'What used to take agencies days now takes minutes. We obsess over removing every unnecessary step between your idea and a live campaign.' },
    { icon: '🎯', title: 'Results Over Vanity', desc: 'We measure success in qualified leads and cost per lead — not impressions or reach. Every feature we build drives real business outcomes.' },
    { icon: '🔒', title: 'Data Privacy', desc: 'Your campaign data, lead data and business information is yours. We never sell, share or use your data for any purpose outside of running your campaigns.' },
    { icon: '🤝', title: 'Transparent Pricing', desc: 'No hidden fees, no agency commissions, no percentage of ad spend. You always know exactly what you are paying and why.' },
  ]

  const stats = [
    { num: '4+',    label: 'Ad Platforms Supported' },
    { num: '28+',   label: 'States Covered' },
    { num: '10x',   label: 'Faster Than Traditional Agencies' },
    { num: '₹100-200',  label: 'Average Cost Per Lead' },
  ]

  const platforms = [
    { name: 'Google Ads',  color: '#1A73E8', desc: 'Search & Display' },
    { name: 'Facebook',    color: '#1877F2', desc: 'Social Media'     },
    { name: 'Instagram',   color: '#E1306C', desc: 'Visual Content'   },
    { name: 'LinkedIn',    color: '#0A66C2', desc: 'B2B Professional' },
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
            <a href="/about"     style={{ ...s.navLink, color: '#1A73E8', fontWeight: '600' }}>About</a>
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
            <a href="/about"     style={{ ...s.mobileMenuLink, color: '#1A73E8', fontWeight: '600' }}>About</a>
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
            <div style={s.highlightCard}>
              <div style={s.highlightIcon}>🏆</div>
              <div style={s.highlightTitle}>India-First Platform</div>
              <div style={s.highlightDesc}>Built ground up for Indian B2B businesses, with ₹ budgets, Indian city targeting, and GST-compliant invoicing.</div>
            </div>
            <div style={s.highlightCard}>
              <div style={s.highlightIcon}>🔬</div>
              <div style={s.highlightTitle}>AI-Powered Validation</div>
              <div style={s.highlightDesc}>Every ad is automatically checked against all 4 platform policies before publishing. No more rejected campaigns.</div>
            </div>
            <div style={s.highlightCard}>
              <div style={s.highlightIcon}>📍</div>
              <div style={s.highlightTitle}>Pan-India Coverage</div>
              <div style={s.highlightDesc}>Target any city, district or state across India with our built-in geo-targeting and radius zone technology.</div>
            </div>
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
                <div style={{ ...s.platformDot, background: p.color }} />
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
          {values.map((v, i) => (
            <div key={i} style={s.valueCard}>
              <div style={s.valueIcon}>{v.icon}</div>
              <div style={s.valueTitle}>{v.title}</div>
              <div style={s.valueDesc}>{v.desc}</div>
            </div>
          ))}
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
              <div key={i} style={s.cityTag}>📍 {city}</div>
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
          <div style={s.contactCard}>
            <div style={s.contactIcon}>📧</div>
            <div style={s.contactTitle}>Email Us</div>
            <div style={s.contactValue}>adnexus@adnexus.co.in</div>
            <div style={s.contactNote}>We respond within 24 hours</div>
          </div>
          <div style={s.contactCard}>
            <div style={s.contactIcon}>🌐</div>
            <div style={s.contactTitle}>Website</div>
            <div style={s.contactValue}>adnexus.co.in</div>
            <div style={s.contactNote}>Visit our platform</div>
          </div>
          <div style={s.contactCard}>
            <div style={s.contactIcon}>📍</div>
            <div style={s.contactTitle}>Operations</div>
            <div style={s.contactValue}>Pan India</div>
            <div style={s.contactNote}>All 28 states & 8 UTs</div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta} className="cta">
        <h2 style={s.ctaTitle} className="cta-title">Ready to grow your business?</h2>
        <p style={s.ctaSub}>Join businesses across India already using AdNexus to launch smarter ad campaigns.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={s.btnCta} onClick={() => navigate('/signup')}>🚀 Start Free Trial</button>
          <a href="/#pricing" style={s.btnCtaGhost}>View Pricing →</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerTop} className="footer-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={s.logoMark}>A</div>
              <span style={{ ...s.logoText, color: '#fff' }}>AdNexus</span>
            </div>
            <p style={s.footerDesc}>India's smartest ad management platform. Launch campaigns across all major platforms from one dashboard.</p>
            <div style={s.footerContact}>
              <div style={s.footerContactItem}>📧 adnexus@adnexus.co.in</div>
              <div style={s.footerContactItem}>🌐 adnexus.co.in</div>
            </div>
          </div>
          <div style={s.footerLinks} className="footer-links">
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Product</div>
              <a href="/#features" style={s.footerLink}>Features</a>
              <a href="/#pricing"  style={s.footerLink}>Pricing</a>
              <a href="/#how"      style={s.footerLink}>How it works</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Company</div>
              <a href="/about"   style={s.footerLink}>About Us</a>
              <a href="/#contact" style={s.footerLink}>Contact</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Legal</div>
              <a href="/privacy-policy" style={s.footerLink}>Privacy Policy</a>
              <a href="/terms"style={s.footerLink}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom} className="footer-bottom">
          <span style={s.footerCopy}>© 2026 AdNexus. All rights reserved.</span>
          <span style={s.footerCopy}>adnexus.co.in</span>
        </div>
      </footer>

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
    .footer-links { grid-template-columns: 1fr !important; gap: 24px !important; }
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
  storyGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' },
  storyText:       {},
  storyPara:       { fontSize: '15px', color: '#374151', lineHeight: '1.8', marginBottom: '20px' },
  storyHighlights: { display: 'flex', flexDirection: 'column', gap: '16px' },
  highlightCard:   { padding: '20px', background: '#f8faff', borderRadius: '12px', border: '0.5px solid #e0e4ef' },
  highlightIcon:   { fontSize: '24px', marginBottom: '10px' },
  highlightTitle:  { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  highlightDesc:   { fontSize: '13px', color: '#6b7280', lineHeight: '1.6' },

  // Platforms
  platformsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  platformCard:  { padding: '24px', background: '#fff', borderRadius: '14px', border: '0.5px solid #e0e4ef', textAlign: 'center' },
  platformDot:   { width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 14px' },
  platformName:  { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  platformDesc:  { fontSize: '12px', color: '#6b7280', marginBottom: '12px' },
  platformBadge: { display: 'inline-block', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },

  // Values
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  valueCard:  { padding: '28px', border: '0.5px solid #e0e4ef', borderRadius: '14px', background: '#fff' },
  valueIcon:  { fontSize: '32px', marginBottom: '14px' },
  valueTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  valueDesc:  { fontSize: '14px', color: '#6b7280', lineHeight: '1.65' },

  // Coverage
  coverageGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '8px' },
  cityTag:      { padding: '7px 14px', background: '#f0f7ff', border: '0.5px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', color: '#1e40af', fontWeight: '500' },

  // Contact
  contactGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  contactCard:  { padding: '32px 24px', border: '0.5px solid #e0e4ef', borderRadius: '14px', background: '#f8faff', textAlign: 'center' },
  contactIcon:  { fontSize: '36px', marginBottom: '14px' },
  contactTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  contactValue: { fontSize: '16px', fontWeight: '600', color: '#1A73E8', marginBottom: '6px' },
  contactNote:  { fontSize: '12px', color: '#6b7280' },

  // CTA
  cta:        { padding: '80px 32px', background: '#1A73E8', textAlign: 'center' },
  ctaTitle:   { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px' },
  ctaSub:     { fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px' },
  btnCta:     { padding: '14px 32px', borderRadius: '10px', border: 'none', background: '#fff', fontSize: '15px', color: '#1A73E8', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' },
  btnCtaGhost:{ padding: '14px 32px', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.5)', background: 'transparent', fontSize: '15px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block' },

  // Footer
  footer:          { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop:       { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerDesc:      { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '16px', maxWidth: '320px' },
  footerContact:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  footerContactItem:{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  footerLinks:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  footerCol:       { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle:  { fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink:      { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom:    { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy:      { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
}

export default AboutUs