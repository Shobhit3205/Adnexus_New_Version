import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const offerings = [
  {
    icon: '💻',
    title: 'Custom Software Development',
    desc: 'We design and build bespoke software tailored to your exact workflow — from internal tools to customer-facing platforms. Every product is architected for your business logic, not forced into a generic template.',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '☁️',
    title: 'Cloud Solutions & Migration',
    desc: 'We help businesses move to the cloud with zero-downtime migration strategies, cost-optimized infrastructure and scalable architecture on AWS, Azure or GCP — built to grow with your traffic, not against it.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🌐',
    title: 'Web & Mobile App Development',
    desc: 'From responsive web platforms to native mobile apps, we build fast, reliable and user-friendly products across iOS, Android and the web — with clean handoff and long-term maintainability in mind.',
    images: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🔧',
    title: 'Legacy System Modernization',
    desc: 'We help businesses running on outdated systems transition to modern, maintainable architecture — without disrupting day-to-day operations. Incremental upgrades, careful data migration and minimal downtime.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🛡️',
    title: 'IT Consulting & Strategy',
    desc: 'Our consultants assess your existing tech stack, identify gaps and build a roadmap aligned with your business goals — covering security, scalability, tooling and team structure.',
    images: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🔗',
    title: 'API & Systems Integration',
    desc: 'We connect your tools, platforms and third-party services into one cohesive system — automating data flow between CRMs, ERPs, payment gateways and internal dashboards.',
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550439062-609e1531270e?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=70&auto=format&fit=crop',
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

const ITSoftware = () => {
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
        <div style={s.sectionLabel}>💻 Information Technology & Software Services</div>
        <h1 style={s.heroTitle}>Technology built around your business</h1>
        <p style={s.heroSub}>
          Custom development, cloud infrastructure and IT consulting — designed to solve
          real operational problems, not just ship features.
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
        <h2 style={s.ctaTitle}>Have a technology problem to solve?</h2>
        <p style={s.ctaSub}>Let's talk about what you're building.</p>
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

export default ITSoftware