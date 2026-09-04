import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const industries = [
  {
    icon: '🏦',
    title: 'Financial Services',
    desc: 'We run targeted campaigns for banks, NBFCs, insurance providers and fintech companies. Our ads are built to generate qualified leads for loans, investment products and financial consultations — with compliance-friendly creatives designed for the finance sector.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🏗️',
    title: 'Real Estate & Construction',
    desc: 'From residential projects to commercial spaces, we help builders and real estate consultants reach serious buyers. Location-based targeting and visually rich ad formats showcase your properties to the right audience at the right time.',
    images: [
      'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1462396240927-52058a6a84ec?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🏭',
    title: 'Manufacturing',
    desc: 'B2B manufacturing businesses need ads that speak to procurement teams and decision-makers. We craft campaigns highlighting product capability, capacity and reliability to generate high-intent industrial leads.',
    images: [
      'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🏬',
    title: 'Trading & Distribution',
    desc: 'For traders and distributors, we build campaigns that connect you with bulk buyers, retailers and business partners across regions — driving inquiries that convert into long-term supply relationships.',
    images: [
      'https://images.unsplash.com/photo-1553413077-190083ec01ff?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601598851547-4137b04b5cf3?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '💻',
    title: 'IT & Technology',
    desc: 'We help software companies, SaaS platforms and IT service providers generate demo requests and qualified B2B leads. Our creatives focus on clear value propositions that resonate with technical and business buyers alike.',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563986768711-b3bde3dc821e?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🏥',
    title: 'Healthcare & Pharma',
    desc: 'Hospitals, clinics, diagnostic centers and pharma businesses trust us to run sensitive, compliant campaigns that build credibility while driving patient inquiries and appointment bookings.',
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🎓',
    title: 'Education & Edtech',
    desc: 'From coaching institutes to edtech platforms, we run admission and enrollment-focused campaigns that reach students and parents at the right moment in their decision journey.',
    images: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🏪',
    title: 'Retail',
    desc: 'We help retail brands drive footfall and online sales through targeted local and national campaigns, showcasing offers, new arrivals and seasonal promotions to nearby and relevant audiences.',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555529771-7888783a18d3?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🍽️',
    title: 'Food & Beverage',
    desc: 'Restaurants, cloud kitchens and F&B brands rely on us to run appetite-driving visual campaigns that boost orders, table bookings and brand visibility in their local market.',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🚚',
    title: 'Logistics & Transport',
    desc: 'We craft B2B lead campaigns for logistics and transport companies looking to reach businesses that need freight, warehousing and fleet solutions — focusing on reliability and reach.',
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🌾',
    title: 'Agriculture & Agro-Processing',
    desc: 'From agri-input companies to food processing units, we run campaigns that connect you with farmers, distributors and B2B buyers across India\'s agricultural supply chain.',
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=70&auto=format&fit=crop',
    ],
  },
  {
    icon: '🏨',
    title: 'Hospitality & Tourism',
    desc: 'Hotels, resorts and travel businesses trust us to run visually engaging campaigns that drive bookings, showcase experiences and reach travelers planning their next trip.',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=70&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=70&auto=format&fit=crop',
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

const ServiceAdvertising = () => {
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
        <div style={s.sectionLabel}>📢 Advertising Platform & Media Solutions</div>
        <h1 style={s.heroTitle}>Ads that reach every industry</h1>
        <p style={s.heroSub}>
          We run performance-driven ad campaigns across Google, Meta, LinkedIn and Instagram —
          tailored to the unique needs of every industry we work with.
        </p>
      </section>

      <section style={s.section}>
        <div style={s.list}>
          {industries.map((ind, i) => {
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
                    <span style={s.iconEmoji}>{ind.icon}</span>
                  </div>
                  <h3 style={s.title}>{ind.title}</h3>
                </div>
                <div style={s.blockRow}>
                  <ImageSlider images={ind.images} icon={ind.icon} />
                  <p style={s.desc}>{ind.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section style={s.cta}>
        <h2 style={s.ctaTitle}>Ready to advertise in your industry?</h2>
        <p style={s.ctaSub}>Let's build a campaign tailored to your business.</p>
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

export default ServiceAdvertising