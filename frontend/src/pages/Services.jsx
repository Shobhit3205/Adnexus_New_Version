import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Laptop, Users, Wallet, Building2, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'

const Services = () => {
  const navigate = useNavigate()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const services = [
    {
      slug: 'advertising-media',
      icon: Megaphone,
      title: 'Advertising Platform & Media Solutions',
      desc: 'End-to-end ad campaign management across Google, Meta, LinkedIn and Instagram. Our AI-powered platform generates compelling creatives, tracks unified analytics and helps you launch campaigns 10x faster — all from a single dashboard built for Indian businesses.',
      accent: '#E8477A',
      tint: '#FDF0F5',
      border: '#F7C6DA',
    },
    {
      slug: 'it-software',
      icon: Laptop,
      title: 'Information Technology & Software Services',
      desc: 'Custom software development, cloud solutions and IT consulting tailored to your business needs. From building scalable web applications to modernizing legacy systems, our team delivers reliable technology solutions that grow with you.',
      accent: '#1A73E8',
      tint: '#EEF5FF',
      border: '#BFDBFE',
    },
    {
      slug: 'manpower-hr',
      icon: Users,
      title: 'Corporate Manpower & HR Services',
      desc: 'Recruitment, staffing and end-to-end HR solutions to help you build and manage the right team. We handle everything from talent sourcing to payroll and compliance, so you can focus on growing your business.',
      accent: '#D97706',
      tint: '#FFF7ED',
      border: '#FDE1B8',
    },
    {
      slug: 'financial-advisory',
      icon: Wallet,
      title: 'Financial Advisory & Corporate Consulting Services',
      desc: 'Strategic financial planning, advisory and corporate consulting to help your business grow sustainably. Our experts guide you through budgeting, investment strategy and corporate structuring decisions.',
      accent: '#0F9D58',
      tint: '#EFFBF4',
      border: '#BBE8CE',
    },
    {
      slug: 'real-estate',
      icon: Building2,
      title: 'Property & Real Estate Consulting Services',
      desc: 'Expert guidance on property investment, real estate consulting and end-to-end transaction support. We help you evaluate opportunities, navigate paperwork and make confident property decisions.',
      accent: '#7C3AED',
      tint: '#F6F1FE',
      border: '#DCC9FA',
    },
  ]

  return (
    <div style={s.page}>
      <style>{responsiveCSS}</style>

      <nav style={s.nav}>
        <div style={s.navInner} className="nav-inner">
          <div style={s.logo} onClick={() => navigate('/')}>
            <div style={s.logoMark}>A</div>
            <span style={s.logoText}>AdNexus</span>
          </div>
          <button style={s.backBtn} onClick={() => navigate('/')}><ArrowLeft size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} /><span className="back-btn-label">Back to Home</span></button>
        </div>
      </nav>

      <section style={s.hero} className="hero">
        <div style={s.sectionLabel}>Our Services</div>
        <h1 style={s.heroTitle} className="hero-title">What we offer</h1>
        <p style={s.heroSub} className="hero-sub">A complete suite of business solutions — from advertising to advisory — all under one roof.</p>
      </section>

      <section style={s.section} className="section">
        <div style={s.list} className="list">
          {services.map((svc) => {
            const Icon = svc.icon
            return (
              <div
                key={svc.slug}
                style={{ ...s.card, background: svc.tint, borderColor: svc.border }}
                className="card"
                onClick={() => navigate(`/services/${svc.slug}`)}
              >
                <div style={{ ...s.cardAccent, background: svc.accent }} />
                <div style={{ ...s.iconBadge, background: svc.accent }}>
                  <Icon size={22} color="#fff" strokeWidth={2} />
                </div>
                <div style={s.cardBody}>
                  <h3 style={s.title} className="title">{svc.title}</h3>
                  <p style={s.desc} className="desc">{svc.desc}</p>
                  <button
                    style={{ ...s.explore, color: svc.accent }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/services/${svc.slug}`) }}
                  >
                    Explore <ArrowRight size={15} style={s.exploreArrow} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section style={s.cta} className="cta">
        <h2 style={s.ctaTitle} className="cta-title">Need a custom solution?</h2>
        <p style={s.ctaSub}>Talk to our team and we'll help you find the right service for your business.</p>
        <button style={s.ctaBtn} onClick={() => navigate('/contact')}>Contact Us <ArrowRight size={16} style={{ verticalAlign: '-2px', marginLeft: '4px' }} /></button>
      </section>

      {showTop && (
        <button
          style={s.backToTop}
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

const responsiveCSS = `
  * { box-sizing: border-box; }
  .back-to-top:hover { transform: translateY(-3px); background: #1557b0 !important; }
  .card { transition: transform 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15, 20, 40, 0.08); }
  @media (max-width: 640px) {
    .nav-inner { padding: 0 16px !important; }
    .back-btn-label { display: none; }
    .hero { padding: 48px 20px 32px !important; }
    .hero-title { font-size: 28px !important; }
    .hero-sub { font-size: 14px !important; }
    .section { padding: 10px 20px 48px !important; }
    .card { flex-direction: column !important; padding: 22px 20px 20px !important; }
    .title { font-size: 18px !important; }
    .desc { font-size: 14px !important; }
    .cta { padding: 48px 20px !important; }
    .cta-title { font-size: 22px !important; }
  }
`

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', minHeight: '100vh', overflowX: 'hidden' },

  nav: { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700' },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  backBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },

  hero: { padding: '72px 32px 48px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' },
  sectionLabel: { fontSize: '12px', fontWeight: '600', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' },
  heroTitle: { fontSize: '40px', fontWeight: '800', marginBottom: '14px', letterSpacing: '-0.5px' },
  heroSub: { fontSize: '16px', color: '#6b7280', lineHeight: '1.7' },

  section: { padding: '10px 32px 60px', maxWidth: '780px', margin: '0 auto' },
  list: { display: 'flex', flexDirection: 'column', gap: '18px' },

  card: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    border: '1px solid',
    borderRadius: '16px',
    padding: '26px 28px',
    overflow: 'hidden',
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px' },
  iconBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  },
  cardBody: { flex: 1, minWidth: 0 },
  title: { fontSize: '19px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 10px', letterSpacing: '-0.2px', lineHeight: '1.3' },
  desc: { fontSize: '14.5px', color: '#5b6270', lineHeight: '1.7', marginBottom: '18px' },
  explore: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'inherit',
  },
  exploreArrow: { transition: 'transform 0.2s ease' },

  cta: { padding: '64px 32px', background: '#f8faff', textAlign: 'center', borderTop: '0.5px solid #e8eaf0' },
  ctaTitle: { fontSize: '26px', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.3px' },
  ctaSub: { fontSize: '15px', color: '#6b7280', marginBottom: '28px' },
  ctaBtn: { padding: '13px 30px', borderRadius: '10px', border: 'none', background: '#1A73E8', fontSize: '15px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },

  backToTop: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: '#1A73E8',
    color: '#fff',
    border: 'none',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(26, 115, 232, 0.4)',
    zIndex: 200,
    transition: 'transform 0.2s ease, background 0.2s ease',
  },
}

export default Services