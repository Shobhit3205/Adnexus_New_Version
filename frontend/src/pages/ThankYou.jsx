import React from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

const ThankYou = () => {

  const location    = useLocation()

  const navigate    = useNavigate()

  const state       = location.state || {}

  const companyName = state.company_name || 'the company'

  const brandColor  = state.brand_color  || '#1A73E8'

  return (

    <div style={s.page}>

      <div style={s.card}>

        {/* ── Success Icon ── */}

        <div style={{ ...s.iconWrap, background: brandColor + '18', border: `2px solid ${brandColor}` }}>

          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">

            <path d="M20 6L9 17L4 12" stroke={brandColor} strokeWidth="2.5"

              strokeLinecap="round" strokeLinejoin="round"/>

          </svg>

        </div>

        {/* ── Message ── */}

        <h1 style={s.title}>Thank You! 🎉</h1>

        <p style={s.subtitle}>

          Your enquiry has been submitted successfully.

        </p>

        <p style={s.desc}>

          Our team from <strong>{companyName}</strong> will

          contact you within <strong>24 hours.</strong>

        </p>

        {/* ── What happens next ── */}

        <div style={s.nextBox}>

          <div style={s.nextTitle}>What happens next?</div>

          {[

            'Our team reviews your enquiry',

            'We will call you within 24 hours',

            'We discuss your requirements',

            'We provide the best solution for you',

          ].map((item, i) => (

            <div key={i} style={s.nextItem}>

              <div style={{ ...s.nextDot, background: brandColor }}>{i + 1}</div>

              <span style={s.nextText}>{item}</span>

            </div>

          ))}

        </div>

        {/* ── Powered By ── */}

        <div style={s.poweredBy}>

          Powered by <strong>AdNexus</strong> ✓

        </div>

      </div>

    </div>

  )

}

const s = {

  page:      { minHeight: '100vh', background: '#f0f2f8', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },

  card:      { background: '#fff', borderRadius: '20px', border: '1px solid #e8eaf0', padding: '40px 36px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },

  iconWrap:  { width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },

  title:     { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px' },

  subtitle:  { fontSize: '15px', color: '#8892b0', margin: '0 0 8px' },

  desc:      { fontSize: '14px', color: '#374151', margin: '0 0 28px', lineHeight: '1.6' },

  nextBox:   { background: '#f8faff', borderRadius: '12px', padding: '20px', border: '1px solid #e8eaf0', textAlign: 'left', marginBottom: '24px' },

  nextTitle: { fontSize: '13px', fontWeight: '700', color: '#1a1a2e', marginBottom: '14px' },

  nextItem:  { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },

  nextDot:   { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },

  nextText:  { fontSize: '13px', color: '#374151' },

  poweredBy: { fontSize: '12px', color: '#9ca3af' },

}

export default ThankYou