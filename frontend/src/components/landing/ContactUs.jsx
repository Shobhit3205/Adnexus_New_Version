import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, MapPin, ArrowUp } from 'lucide-react'

const ContactUs = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

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
            <a href="/#how" style={s.navLink}>How it works</a>
            <Link to="/contact" style={{ ...s.navLink, color: '#1A73E8', fontWeight: '600' }}>Contact</Link>
            <Link to="/about" style={s.navLink}>About</Link>
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
            <a href="/#how" style={s.mobileMenuLink}>How it works</a>
            <Link to="/contact" style={{ ...s.mobileMenuLink, color: '#1A73E8', fontWeight: '600' }} onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link to="/about" style={s.mobileMenuLink} onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/services" style={s.mobileMenuLink} onClick={() => setMenuOpen(false)}>Services</Link>
            <div style={s.mobileMenuDivider} />
            <button style={{ ...s.btnGhost, width: '100%' }} onClick={() => navigate('/login')}>Login</button>
            <button style={{ ...s.btnBlue, width: '100%' }} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero} className="hero">
        <div style={s.heroBadge}>💬 We'd love to hear from you</div>
        <h1 style={s.heroTitle} className="hero-title">
          Get in <span style={{ color: '#1A73E8' }}>touch</span> with us
        </h1>
        <p style={s.heroSub} className="hero-sub">
          Questions about AdNexus? Need help with your campaigns? Reach out and
          our team will get back to you.
        </p>
      </section>

      {/* ── Contact cards ── */}
      <section style={s.section} className="section">
        <div style={s.contactGrid} className="contact-grid">
          <a href="mailto:support@adnexus.co.in" style={{ ...s.contactCard, background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div style={{ ...s.iconCircle, background: '#ffffff' }}>
              <svg width="26" height="26" viewBox="0 0 48 48">
                <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
                <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
                <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
                <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2l-3.622-2.716C8.249,7.85,7.099,7.5,5.922,7.5C4.311,7.5,3,8.811,3,10.422V12.298z"/>
                <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.622-2.716C39.751,7.85,40.901,7.5,42.078,7.5C43.689,7.5,45,8.811,45,10.422V12.298z"/>
              </svg>
            </div>
            <div style={s.contactTitle}>Email Us</div>
            <div style={{ ...s.contactValue, color: '#1A73E8' }}>support@adnexus.co.in</div>
            <div style={s.contactNote}>We respond within 24 hours</div>
          </a>

          <a href="tel:+919410207475" style={{ ...s.contactCard, background: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <div style={{ ...s.iconCircle, background: '#ffffff' }}>
              <Phone size={24} color="#10b981" strokeWidth={2.2} />
            </div>
            <div style={s.contactTitle}>Call Us</div>
            <div style={{ ...s.contactValue, color: '#10b981' }}>+91 94102 07475</div>
            <div style={s.contactNote}>Mon–Sat, 10 AM – 7 PM</div>
          </a>

          <div style={{ ...s.contactCard, background: '#fff7ed', borderColor: '#fed7aa' }}>
            <div style={{ ...s.iconCircle, background: '#ffffff' }}>
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
        <button style={s.btnCta} onClick={() => navigate('/signup')}>🚀 Start Free Trial</button>
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
    .contact-grid { grid-template-columns: 1fr !important; }
    .footer-top { grid-template-columns: 1fr !important; gap: 40px !important; }
  }
  @media (max-width: 640px) {
    .nav-inner { padding: 0 16px !important; }
    .hero { padding: 48px 20px 40px !important; }
    .hero-title { font-size: 30px !important; }
    .hero-sub { font-size: 15px !important; }
    .section { padding: 48px 20px !important; }
    .footer-links { grid-template-columns: 1fr !important; gap: 24px 12px !important; }
    .footer-bottom { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
    .cta { padding: 48px 20px !important; }
    .cta-title { font-size: 26px !important; }
  }
`

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', overflowX: 'hidden' },
  nav: { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', gap: '28px', marginLeft: '32px' },
  navLink: { fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' },
  navRight: { marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' },
  btnGhost: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },
  btnBlue: { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1A73E8', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },
  hamburger: { marginLeft: 'auto', width: '36px', height: '36px', border: '1px solid #e0e4ef', borderRadius: '8px', background: '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' },
  hamburgerLine: { width: '18px', height: '2px', background: '#1a1a2e', borderRadius: '2px' },
  mobileMenu: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 16px 20px', borderTop: '0.5px solid #e8eaf0', background: '#fff' },
  mobileMenuLink: { fontSize: '15px', color: '#374151', textDecoration: 'none', fontWeight: '500', padding: '10px 4px' },
  mobileMenuDivider: { height: '1px', background: '#e8eaf0', margin: '8px 0' },
  hero: { padding: '80px 32px 60px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1e40af', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', marginBottom: '24px', border: '1px solid #bfdbfe' },
  heroTitle: { fontSize: '44px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-1px' },
  heroSub: { fontSize: '18px', color: '#6b7280', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto' },
  section: { padding: '20px 32px 80px', maxWidth: '1200px', margin: '0 auto' },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  contactCard: { padding: '32px 24px', border: '1px solid #e0e4ef', borderRadius: '14px', textAlign: 'center', textDecoration: 'none', display: 'block' },
  iconCircle: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  contactTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  contactValue: { fontSize: '16px', fontWeight: '600', marginBottom: '6px' },
  contactNote: { fontSize: '12px', color: '#6b7280' },
  cta: { padding: '80px 32px', background: '#1A73E8', textAlign: 'center' },
  ctaTitle: { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px' },
  ctaSub: { fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px' },
  btnCta: { padding: '14px 32px', borderRadius: '10px', border: 'none', background: '#fff', fontSize: '15px', color: '#1A73E8', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' },
  footer: { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '16px', maxWidth: '320px' },
  footerSocial: { display: 'flex', gap: '10px', marginTop: '18px' },
  socialIcon: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  footerAddress: { marginTop: '20px' },
  footerAddressName: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' },
  footerAddressRow: { display: 'flex', gap: '8px' },
  footerAddressText: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', maxWidth: '260px' },
  footerLinks: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle: { fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom: { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy: { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },

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

export default ContactUs