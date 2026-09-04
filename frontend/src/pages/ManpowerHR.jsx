import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const offerings = [
  {
    icon: '🧑‍💼',
    title: 'Talent Recruitment & Sourcing',
    desc: 'We identify, screen and shortlist candidates across levels — from entry-level hires to leadership positions — using a structured sourcing process built around your role requirements and company culture.',
    images: [
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '📋',
    title: 'Contract & Temporary Staffing',
    desc: 'Scale your workforce up or down without the overhead of permanent hiring. We manage sourcing, onboarding and compliance for contract, seasonal and project-based staffing needs.',
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '💵',
    title: 'Payroll Management',
    desc: 'Accurate, on-time payroll processing with full statutory compliance — PF, ESI, TDS and more — so your team gets paid correctly and your business stays audit-ready.',
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '📜',
    title: 'HR Compliance & Policy',
    desc: 'We help you build and maintain HR policies that meet labour law requirements — covering employment contracts, leave policy, workplace conduct and statutory filings.',
    images: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🎯',
    title: 'Executive Search',
    desc: 'For leadership and specialized roles, our executive search process combines targeted headhunting with deep vetting — connecting you with candidates who fit both the role and the company.',
    images: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '📈',
    title: 'Employee Engagement & Training',
    desc: 'We design onboarding, training and engagement programs that reduce attrition and build stronger teams — tailored to your industry and workforce size.',
    images: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=70&auto=format&fit=crop',
    ],
  },
]

// Auto-sliding image block. Falls back to a styled placeholder when no images are provided yet.
const ImageSlider = ({ images, icon }) => {
  const [index, setIndex] = useState(0)
  const slides = images && images.length > 0 ? images : [1, 2, 3] // 3 placeholder slides

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [slides.length])

  const hasRealImages = images && images.length > 0

  return (
    <div style={s.sliderBox}>
      {hasRealImages ? (
        <img src={slides[index]} alt="" style={s.sliderImg} />
      ) : (
        <div style={s.sliderPlaceholder}>
          <span style={s.sliderIcon}>{icon}</span>
          <span style={s.sliderText}>Photo coming soon</span>
        </div>
      )}
      <div style={s.dots}>
        {slides.map((_, i) => (
          <span key={i} style={{ ...s.dot, ...(i === index ? s.dotActive : {}) }} />
        ))}
      </div>
    </div>
  )
}

const palette = [
  { accent: '#E8477A', tint: '#FDF3F7', border: '#F6D3E1' },
  { accent: '#1A73E8', tint: '#F1F7FE', border: '#CFE0FB' },
  { accent: '#D97706', tint: '#FFF9F0', border: '#FBE3BA' },
  { accent: '#0F9D58', tint: '#F1FAF5', border: '#C4E9D4' },
  { accent: '#7C3AED', tint: '#F8F4FE', border: '#E2D3FA' },
  { accent: '#0891B2', tint: '#F0FAFC', border: '#BFE7F0' },
]

const ManpowerHR = () => {
  const navigate = useNavigate()

  return (
    <div style={s.page}>
      <style>{blockCSS}</style>

      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo} onClick={() => navigate('/')}>
            <div style={s.logoMark}>A</div>
            <span style={s.logoText}>AdNexus</span>
          </div>
          <button style={s.backBtn} onClick={() => navigate('/services')}>← Back to Services</button>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.sectionLabel}>🧑‍💼 Corporate Manpower & HR Services</div>
        <h1 style={s.heroTitle}>Build the right team, the right way</h1>
        <p style={s.heroSub}>
          From recruitment to payroll, we handle the full employee lifecycle so you can
          focus on running your business, not managing paperwork.
        </p>
      </section>

      <section style={s.section}>
        <div style={s.list}>
          {offerings.map((item, i) => {
            const c = palette[i % palette.length]
            return (
              <div
                key={i}
                style={{ ...s.block, borderColor: c.border, background: c.tint }}
                className="ind-block"
              >
                <div style={{ ...s.accentBar, background: c.accent }} />
                <div style={s.blockHeading}>
                  <div style={{ ...s.iconBadge, background: c.accent }}>
                    <span style={s.iconEmoji}>{item.icon}</span>
                  </div>
                  <h3 style={s.title}>{item.title}</h3>
                </div>
                <div style={s.blockRow}>
                  <ImageSlider images={item.images} icon={item.icon} />
                  <p style={s.desc}>{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section style={s.cta}>
        <h2 style={s.ctaTitle}>Need to build or manage your team?</h2>
        <p style={s.ctaSub}>Let's find the right HR solution for your business.</p>
        <button style={s.ctaBtn} onClick={() => navigate('/signup')}>Start Free Trial →</button>
      </section>
    </div>
  )
}

const blockCSS = `
  .ind-block { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
  .ind-block:hover { box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); border-color: #cfe0fb; }
  @media (max-width: 640px) {
    .ind-block { padding: 24px 20px !important; }
  }
`

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', minHeight: '100vh' },

  nav: { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700' },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  backBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },

  hero: { padding: '64px 32px 48px', textAlign: 'center', maxWidth: '740px', margin: '0 auto' },
  sectionLabel: { fontSize: '13px', fontWeight: '700', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' },
  heroTitle: { fontSize: '38px', fontWeight: '800', marginBottom: '14px', letterSpacing: '-0.5px' },
  heroSub: { fontSize: '16px', color: '#6b7280', lineHeight: '1.75' },

  section: { padding: '10px 32px 60px', maxWidth: '960px', margin: '0 auto' },
  list: { display: 'flex', flexDirection: 'column', gap: '22px' },

  block: {
    position: 'relative',
    border: '1px solid #e5e9f2',
    borderRadius: '18px',
    padding: '36px 34px 36px 40px',
    overflow: 'hidden',
  },
  accentBar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px' },
  blockHeading: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '26px' },
  iconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  },
  iconEmoji: { fontSize: '20px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#1a1a2e', margin: 0, letterSpacing: '-0.4px', lineHeight: '1.2' },

  blockRow: { display: 'flex', gap: '36px', alignItems: 'center', flexWrap: 'wrap' },

  sliderBox: {
    position: 'relative',
    width: '320px',
    height: '200px',
    borderRadius: '14px',
    overflow: 'hidden',
    flexShrink: 0,
    background: '#f0f4fb',
  },
  sliderImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  sliderPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f8faff 100%)',
  },
  sliderIcon: { fontSize: '40px' },
  sliderText: { fontSize: '13px', color: '#93a5c4', fontWeight: '500' },
  dots: { position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px' },
  dot: { width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(26,115,232,0.25)', transition: 'background 0.3s ease' },
  dotActive: { background: '#1A73E8' },

  desc: { flex: 1, minWidth: '280px', fontSize: '15px', color: '#6b7280', lineHeight: '1.85' },

  cta: { padding: '64px 32px', background: '#f8faff', textAlign: 'center', borderTop: '0.5px solid #e8eaf0' },
  ctaTitle: { fontSize: '26px', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.3px' },
  ctaSub: { fontSize: '15px', color: '#6b7280', marginBottom: '28px' },
  ctaBtn: { padding: '13px 30px', borderRadius: '10px', border: 'none', background: '#1A73E8', fontSize: '15px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },
}

export default ManpowerHR