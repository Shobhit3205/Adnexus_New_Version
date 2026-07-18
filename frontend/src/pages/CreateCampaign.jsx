import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import AdContent from './AdContent'
import FormPreview from './FormPreview'
import { ALL_CITIES, POPULAR_CITIES } from '../data/cities'

const API_BASE = 'http://127.0.0.1:8000'

const platforms = [
  {
    id: 1, name: 'Google Ads', apiKey: 'google', color: '#1A73E8',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" style={{width:'20px',height:'20px'}} alt="Google" />,
    desc: 'Search & Display'
  },
  {
    id: 2, name: 'LinkedIn', apiKey: 'linkedin', color: '#0A66C2',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" style={{width:'20px',height:'20px',borderRadius:'3px'}} alt="LinkedIn" />,
    desc: 'B2B Professional'
  },
  {
    id: 3, name: 'Facebook', apiKey: 'meta', color: '#1877F2',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" style={{width:'20px',height:'20px'}} alt="Facebook" />,
    desc: 'Social Media'
  },
  {
    id: 4, name: 'Instagram', apiKey: 'instagram', color: '#E1306C',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" style={{width:'20px',height:'20px',borderRadius:'5px'}} alt="Instagram" />,
    desc: 'Visual Content'
  },
]

const steps = [
  { num: 1, label: 'Campaign Information' },
  { num: 2, label: 'Platforms'            },
  { num: 3, label: 'Budget & Dates'       },
  { num: 4, label: 'Location'             },
  { num: 5, label: 'Form / URL Setup'     },
  { num: 6, label: 'Ad Content'           },
  { num: 7, label: 'Review & Launch'      },
]

const INDUSTRY_MAP = {
  'Financial Services': {
    icon: '🏦',
    subcategories: [
      'Business Loan', 'Working Capital Loan', 'Machinery Loan',
      'Invoice Finance', 'Trade Finance', 'Personal Loan',
      'Home Loan', 'Gold Loan', 'Vehicle Loan', 'Education Loan',
    ]
  },
  'Real Estate & Construction': {
    icon: '🏗️',
    subcategories: [
      'Residential Property', 'Commercial Property', 'Villa / Plots',
      'Affordable Housing', 'Luxury Housing', 'Co-working Space',
    ]
  },
  'Manufacturing': {
    icon: '🏭',
    subcategories: [
      'Raw Material Supply', 'Industrial Goods', 'Custom Furniture',
      'Jewellery', 'Packaging Material', 'Chemical Supply',
    ]
  },
  'Trading & Distribution': {
    icon: '🛒',
    subcategories: [
      'Wholesale Trading', 'Import / Export', 'FMCG Distribution',
      'Retail Distribution', 'E-commerce',
    ]
  },
  'IT & Technology': {
    icon: '💻',
    subcategories: [
      'SaaS Product', 'IT Infrastructure', 'Digital Agency',
      'Product Development', 'Cybersecurity', 'Cloud Services',
    ]
  },
  'Healthcare & Pharma': {
    icon: '🏥',
    subcategories: [
      'Hospital / Clinic', 'Dental Care', 'Eye Care',
      'Ayurveda / Wellness', 'Diagnostics / Lab', 'Pharmaceutical',
    ]
  },
  'Education & Edtech': {
    icon: '🎓',
    subcategories: [
      'School / College', 'Coaching Center', 'Study Abroad',
      'Skill Development', 'Online Courses', 'Vocational Training',
    ]
  },
  'Retail': {
    icon: '🏪',
    subcategories: [
      'Fashion / Clothing', 'Electronics', 'Home Decor',
      'Grocery / FMCG', 'Luxury Goods', 'Sports / Fitness',
    ]
  },
  'Food & Beverage': {
    icon: '🍽️',
    subcategories: [
      'Restaurant / Cafe', 'Food Processing', 'Cloud Kitchen',
      'Catering Services', 'Food Franchise',
    ]
  },
  'Logistics & Transport': {
    icon: '🚚',
    subcategories: [
      'Courier Services', 'Fleet Management', 'Warehouse Services',
      'Cold Chain', 'Last Mile Delivery',
    ]
  },
  'Agriculture & Agro-Processing': {
    icon: '🌾',
    subcategories: [
      'Farm Equipment', 'Agro Processing', 'Organic Products',
      'Seeds / Fertilizers', 'Irrigation Services',
    ]
  },
  'Hospitality & Tourism': {
    icon: '🏨',
    subcategories: [
      'Hotel / Resort', 'Travel Agency', 'Event Management',
      'Wedding Planning', 'Adventure Tourism',
    ]
  },
}

const GOALS = [
  {
    val: 'Lead Generation', apiVal: 'LEAD_GEN',
    desc: 'Generate qualified B2B leads',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke="#1A73E8" strokeWidth="2"/>
        <circle cx="18" cy="18" r="9" stroke="#1A73E8" strokeWidth="2"/>
        <circle cx="18" cy="18" r="4" fill="#1A73E8"/>
        <line x1="18" y1="4" x2="18" y2="8" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="28" x2="18" y2="32" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4" y1="18" x2="8" y2="18" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
        <line x1="28" y1="18" x2="32" y2="18" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    val: 'Brand Awareness', apiVal: 'BRAND_AWARENESS',
    desc: 'Increase brand visibility and reach',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M8 24 L8 12 L24 6 L24 30 Z" fill="#F59E0B" strokeLinejoin="round"/>
        <rect x="4" y="22" width="5" height="10" rx="2" fill="#F59E0B"/>
        <path d="M24 13 Q30 18 24 23" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M24 9 Q34 18 24 27" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  {
    val: 'Website Traffic', apiVal: 'WEBSITE_TRAFFIC',
    desc: 'Drive traffic to your website',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M6 26 L14 16 L20 22 L26 12 L32 18" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M26 12 L32 12 L32 18" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
]

const competitionColor = {
  'Low': '#1b7a4a', 'Medium': '#e65100', 'High': '#c62828', 'Very High': '#6a1b9a',
}

// ════════════════════════════════════════════════════
// MAP CANVAS
// ════════════════════════════════════════════════════

// ════════════════════════════════════════════════════
// MAP CANVAS
// ════════════════════════════════════════════════════
const MapCanvas = ({ selectedCities, radiusKm }) => {
  const mapRef      = useRef(null)
  const leafletMap  = useRef(null)
  const layersRef   = useRef([])   // holds {marker, circle} per city
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (window.L) { setMapLoaded(true); return }
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    js.onload = () => setMapLoaded(true)
    document.head.appendChild(js)
  }, [])

  // init map once
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || leafletMap.current) return
    const L = window.L
    const first = selectedCities.length > 0 ? selectedCities[0] : { lat: 28.6139, lng: 77.2090 }
    leafletMap.current = L.map(mapRef.current, { center: [first.lat, first.lng], zoom: 10, zoomControl: true, scrollWheelZoom: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM', maxZoom: 18 }).addTo(leafletMap.current)
  }, [mapLoaded])

  // redraw markers + circles whenever cities or radius change
  useEffect(() => {
    if (!leafletMap.current) return
    const L = window.L

    // clear old layers
    layersRef.current.forEach(({ marker, circle }) => {
      leafletMap.current.removeLayer(marker)
      leafletMap.current.removeLayer(circle)
    })
    layersRef.current = []

    if (!selectedCities.length) return

    const bounds = []

    selectedCities.forEach(city => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:#0A66C2;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(10,102,194,.6)"></div>`,
        iconSize: [16,16], iconAnchor: [8,8],
      })
      const marker = L.marker([city.lat, city.lng], { icon }).addTo(leafletMap.current)
      const circle = L.circle([city.lat, city.lng], {
        radius: radiusKm * 1000,
        color: '#0A66C2', fillColor: '#0A66C2',
        fillOpacity: 0.4, weight: 2, opacity: 0.8,
      }).addTo(leafletMap.current)

      marker.bindTooltip(city.name, { permanent: false, direction: 'top', offset: [0, -10] })

      layersRef.current.push({ marker, circle })
      bounds.push(circle.getBounds())
    })

    // fit map to show all selected cities' circles
    if (bounds.length === 1) {
      leafletMap.current.flyTo([selectedCities[0].lat, selectedCities[0].lng], radiusKm <= 5 ? 13 : radiusKm <= 15 ? 12 : radiusKm <= 35 ? 11 : radiusKm <= 70 ? 10 : 9, { duration: 1.0 })
    } else if (bounds.length > 1) {
      let combined = bounds[0]
      bounds.slice(1).forEach(b => { combined = combined.extend(b) })
      leafletMap.current.fitBounds(combined, { padding: [30, 30], duration: 1.0 })
    }
  }, [selectedCities, radiusKm])

  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '0.5px solid #e0e4ef', height: '200px' }}>
      {!mapLoaded && (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', color: '#8892b0', fontSize: '12px', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #e0e4ef', borderTopColor: '#1A73E8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Loading map...
        </div>
      )}
      <div ref={mapRef} style={{ height: '200px', display: mapLoaded ? 'block' : 'none' }} />
    </div>
  )
}
// ════════════════════════════════════════════════════
// SUMMARY ICON (used inside popover)
// ════════════════════════════════════════════════════
const SummaryIcon = ({ type }) => {
  const icons = {
    goal:     { bg:'#eef2ff', el:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> },
    industry: { bg:'#f0f4ff', el:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
    subcat:   { bg:'#fff7ed', el:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
    platform: { bg:'#f5f3ff', el:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    budget:   { bg:'#f0fdf4', el:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    location: { bg:'#fff1f2', el:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  }
  const ic = icons[type] || icons.goal
  return (
    <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:ic.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {ic.el}
    </div>
  )
}

// ════════════════════════════════════════════════════
// CAMPAIGN SUMMARY POPOVER (replaces right sidebar)
// ════════════════════════════════════════════════════
const CampaignSummaryPopover = ({ formData, selectedPlatforms, step, selectedCities }) => {
  const [open, setOpen] = useState(false)
  const popoverRef      = useRef(null)
  const buttonRef       = useRef(null)

  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        buttonRef.current  && !buttonRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  const platformNames = selectedPlatforms
    .map(id => platforms.find(p => p.id === id)?.name)
    .filter(Boolean)

  const progress = Math.round((step / steps.length) * 100)

  const rows = [
    { type:'goal',     label:'Goal',        val: formData.goal,                                                                   empty:'Not selected' },
    { type:'industry', label:'Industry',     val: formData.industry,                                                               empty:'Not selected' },
    { type:'subcat',   label:'Sub category', val: formData.sub_category,                                                           empty:'Not selected' },
    { type:'platform', label:'Platforms',    val: platformNames.length > 0 ? platformNames.join(', ') : null,                     empty:'Not selected' },
    { type:'budget',   label:'Budget',       val: formData.budget ? `₹${parseInt(formData.budget).toLocaleString()}/day` : null,  empty:'Not set'      },
    { type:'location', label:'Location',     val: selectedCities.length > 0 ? selectedCities.map(c => c.name).join(', ') : null, empty:'Not set'      },
  ]

  return (
    <>
      {/* Floating trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle campaign summary"
        aria-expanded={open}
        className="summary-trigger"
        style={{
          position:    'fixed',
          bottom:      '28px',
          right:       '28px',
          zIndex:      1000,
          display:     'flex',
          alignItems:  'center',
          gap:         '8px',
          padding:     '10px 18px',
          background:  open ? '#1A73E8' : '#fff',
          color:       open ? '#fff'    : '#1a1a2e',
          border:      open ? '1.5px solid #1A73E8' : '1.5px solid #e0e4ef',
          borderRadius:'40px',
          fontSize:    '13px',
          fontWeight:  '600',
          fontFamily:  'DM Sans, sans-serif',
          cursor:      'pointer',
          boxShadow:   '0 4px 20px rgba(26,115,232,0.2)',
          whiteSpace:  'nowrap',
          transition:  'background 0.15s, color 0.15s, border-color 0.15s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={open ? '#fff' : '#4f6ef7'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Summary
        <span style={{
          fontSize:    '11px',
          fontWeight:  '700',
          background:  open ? 'rgba(255,255,255,0.25)' : '#e8f0fe',
          color:       open ? '#fff' : '#1A73E8',
          padding:     '2px 7px',
          borderRadius:'12px',
          lineHeight:  '1.5',
        }}>
          {step}/{steps.length}
        </span>
      </button>

      {/* Popover panel */}
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Campaign summary"
          className="summary-panel"
          style={{
            position:      'fixed',
            bottom:        '78px',
            right:         '28px',
            zIndex:        999,
            width:         '300px',
            background:    '#fff',
            borderRadius:  '16px',
            border:        '1px solid #e0e4ef',
            boxShadow:     '0 8px 32px rgba(26,26,46,0.12)',
            padding:       '20px',
            fontFamily:    'DM Sans, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <span style={{ fontSize:'14px', fontWeight:'700', color:'#1a1a2e' }}>Campaign summary</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close summary"
              style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', color:'#9ca3af', display:'flex', alignItems:'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ height:'0.5px', background:'#e8eaf0', marginBottom:'12px' }} />

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={i} style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              padding:      '7px 0',
              borderBottom: i < rows.length - 1 ? '0.5px solid #f0f2f7' : 'none',
            }}>
              <SummaryIcon type={row.type} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:'500', marginBottom:'1px', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  {row.label}
                </div>
                <div style={{
                  fontSize:     '12px',
                  fontWeight:   row.val ? '600' : '400',
                  color:        row.val ? '#111827' : '#9ca3af',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}>
                  {row.val || row.empty}
                </div>
              </div>
              {row.val && (
                <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Progress */}
          <div style={{ marginTop:'14px', paddingTop:'14px', borderTop:'0.5px solid #e8eaf0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#1a1a2e' }}>Progress</span>
              <span style={{ fontSize:'11px', color:'#8892b0' }}>Step {step} of {steps.length}</span>
            </div>
            <div style={{ height:'5px', background:'#e8eaf0', borderRadius:'4px', overflow:'hidden' }}>
              <div style={{
                height:     '100%',
                width:      `${progress}%`,
                background: progress === 100 ? '#22c55e' : '#1A73E8',
                borderRadius:'4px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ textAlign:'right', fontSize:'11px', fontWeight:'700', color: progress === 100 ? '#16a34a' : '#1A73E8', marginTop:'4px' }}>
              {progress}%
            </div>
          </div>

          {/* Secure badge */}
          <div style={{
            display:      'flex',
            gap:          '8px',
            alignItems:   'flex-start',
            padding:      '10px 12px',
            background:   '#f8faff',
            borderRadius: '10px',
            border:       '0.5px solid #e8eaf0',
            marginTop:    '12px',
          }}>
            <div style={{ width:'26px', height:'26px', borderRadius:'7px', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:'600', color:'#1a1a2e', marginBottom:'1px' }}>Setup is secure</div>
              <div style={{ fontSize:'10px', color:'#8892b0', lineHeight:'1.5' }}>Data used only to optimise your campaign.</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ════════════════════════════════════════════════════
// AGE RANGE SLIDER
// ════════════════════════════════════════════════════
const AgeRangeSlider = ({ ageMin, ageMax, setAgeMin, setAgeMax }) => {
  const MIN = 18, MAX = 65
  const pct = (val) => ((val - MIN) / (MAX - MIN)) * 100
  return (
    <div style={{ position: 'relative', height: '36px', margin: '4px 0' }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', transform: 'translateY(-50%)', background: '#e0e4ef', borderRadius: '2px' }} />
      <div style={{ position: 'absolute', top: '50%', height: '4px', transform: 'translateY(-50%)', background: '#1A73E8', borderRadius: '2px', left: `${pct(ageMin)}%`, width: `${pct(ageMax) - pct(ageMin)}%` }} />
      <input type="range" min={MIN} max={MAX} step={1} value={ageMin}
        onChange={e => { const val = parseInt(e.target.value); if (val < ageMax) setAgeMin(val) }}
        className="age-range-thumb" style={{ ...sliderStyle, zIndex: ageMin >= ageMax - 2 ? 5 : 3 }} />
      <input type="range" min={MIN} max={MAX} step={1} value={ageMax}
        onChange={e => { const val = parseInt(e.target.value); if (val > ageMin) setAgeMax(val) }}
        className="age-range-thumb" style={{ ...sliderStyle, zIndex: ageMin >= ageMax - 2 ? 4 : 5 }} />
      <style>{`.age-range-thumb{pointer-events:none}.age-range-thumb::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:all;width:20px;height:20px;border-radius:50%;background:#fff;border:2.5px solid #1A73E8;cursor:pointer;box-shadow:0 1px 4px rgba(26,115,232,0.3)}.age-range-thumb::-moz-range-thumb{pointer-events:all;width:20px;height:20px;border-radius:50%;background:#fff;border:2.5px solid #1A73E8;cursor:pointer}`}</style>
    </div>
  )
}

const sliderStyle = {
  position: 'absolute', top: 0, left: 0,
  width: '100%', height: '100%',
  appearance: 'none', WebkitAppearance: 'none',
  background: 'transparent', outline: 'none', cursor: 'pointer',
}

// ════════════════════════════════════════════════════
// LAUNCH SUCCESS SCREEN
// ════════════════════════════════════════════════════
const LaunchSuccess = ({ launchResult, formData, selectedPlatforms, selectedCities, radiusKm, locationData, navigate }) => {
  const getDuration = () => {
    if (!formData.start_date || !formData.end_date) return 0
    return Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000*60*60*24))
  }
  const getTotalWithGST = () => {
  const base = parseFloat(formData.budget || 0) * getDuration()
  return base + base * 0.18
}
  const platformNames = selectedPlatforms.map(id => platforms.find(p => p.id === id)?.name).filter(Boolean)
  const estLeads      = locationData?.total_summary?.total_leads || '450 - 700 Leads'
  const estCPL        = '₹1 - ₹2'

  const overviewItems = [
    { icon:'💰', bg:'#dcfce7', label:'Daily Budget',       val: formData.budget ? `₹${parseInt(formData.budget).toLocaleString()}/day` : '—' },
    { icon:'📅', bg:'#ede9fe', label:'Duration',           val: getDuration() > 0 ? `${getDuration()} Days` : '—' },
    { icon:'📣', bg:'#fef3c7', label:'Platform',           val: platformNames.join(', ') || '—' },
    { icon:'📂', bg:'#fce7f3', label:'Sub Category',       val: formData.sub_category || formData.industry || '—' },
    { icon:'⚙️', bg:'#e0f2fe', label:'Estimated Reach',   val: estLeads },
    { icon:'₹',  bg:'#d1fae5', label:'Est. Cost Per Lead', val: estCPL },
  ]

  const whatsNext = [
    'Campaign saved successfully',
    'Ad content generated',
    'Target audience configured',
    'Budget & schedule set',
    'Campaign is ready for publishing',
  ]

  return (
    <div className="app-page" style={{ display:'flex', minHeight:'100vh', fontFamily:'DM Sans, sans-serif', background:'#f0f2f8', overflow:'hidden' }}>
      <style>{globalStyles}</style>
      <div className="app-sidebar" style={{ width:'260px', background:'linear-gradient(160deg,#0f1535 0%,#1a3a8f 100%)', padding:'28px 20px', display:'flex', flexDirection:'column', flexShrink:0, height:'100vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'32px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'800', color:'#fff', fontFamily:'Georgia,serif' }}>A</div>
          <span style={{ color:'#fff', fontSize:'18px', fontWeight:'700' }}>AdNexus</span>
        </div>
        <div className="mobile-step-info">Step {steps.length}/{steps.length} · Campaign launched</div>
        <div className="desktop-only" style={{ flex:1, color:'rgba(255,255,255,0.7)', fontSize:'13px', lineHeight:'1.7' }}>
          <div style={{ fontSize:'17px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>Launch your next B2B campaign</div>
          <div style={{ fontSize:'12px', marginBottom:'28px' }}>Reach ₹10Cr+ turnover businesses across Google, LinkedIn, Facebook & Instagram.</div>
        </div>
        <div className="desktop-only" style={{ display:'flex', flexDirection:'column', gap:'4px', marginBottom:'24px' }}>
          {steps.map(st => (
            <div key={st.num} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'5px 0' }}>
              <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'#22c55e', border:'1.5px solid #22c55e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'#fff', fontWeight:'700', flexShrink:0 }}>✓</div>
              <span style={{ color:'#fff', fontWeight:'600', fontSize:'12px' }}>{st.label}</span>
            </div>
          ))}
        </div>
        <div className="desktop-only" style={{ background:'rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px', border:'1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
            <span style={{ fontSize:'16px' }}>📞</span>
            <span style={{ fontSize:'13px', fontWeight:'700', color:'#fff' }}>Need Help?</span>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', margin:'0 0 10px 0', lineHeight:'1.5' }}>Book a call with our ad experts</p>
          <button style={{ width:'100%', padding:'9px', borderRadius:'8px', border:'1.5px solid rgba(255,255,255,0.4)', background:'transparent', color:'#fff', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' }}>Book a Call</button>
        </div>
      </div>

      <div className="app-main" style={{ flex:1, padding:'24px 28px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'20px' }}>
        <button style={{ background:'none', border:'none', color:'#1A73E8', fontSize:'13px', cursor:'pointer', padding:0, fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px', alignSelf:'flex-start' }} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="hero-card" style={{ background:'#fff', borderRadius:'20px', border:'1px solid #e8eaf0', padding:'32px 40px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'24px', position:'relative', overflow:'hidden' }}>
          {[{top:'18px',left:'200px',color:'#F59E0B',size:8},{top:'40px',left:'320px',color:'#EC4899',size:6},{top:'60px',left:'150px',color:'#10B981',size:5},{top:'30px',right:'320px',color:'#6366F1',size:7},{top:'70px',right:'200px',color:'#F59E0B',size:5}].map((d,i) => (
            <div key={i} style={{ position:'absolute', top:d.top, left:d.left, right:d.right, width:d.size, height:d.size, borderRadius:'50%', background:d.color, opacity:0.7 }} />
          ))}
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg,#d1fae5,#a7f3d0)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'40px' }}>🎉</div>
            <h1 style={{ fontSize:'32px', fontWeight:'800', color:'#1a1a2e', margin:'0 0 8px 0' }}>Campaign Launched successfully!</h1>
            <p style={{ fontSize:'14px', color:'#8892b0', margin:'0 0 20px 0' }}>Your campaign is now live and ready to reach businesses.</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#f0f4ff', border:'1.5px solid #c7d2fe', borderRadius:'30px', padding:'8px 20px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span style={{ fontSize:'14px', fontWeight:'700', color:'#4f6ef7' }}>Campaign ID: #{launchResult.campaignId}</span>
            </div>
            <div style={{ display:'flex', gap:'12px', marginTop:'20px', justifyContent:'center', flexWrap:'wrap' }}>
              {[
                { icon:'🎯', label:'Goal',     val: formData.goal || 'Lead Generation' },
                { icon:'🏭', label:'Industry', val: formData.industry || '—' },
                { icon:'📍', label:'Location', val: selectedCities.length > 0 ? `${selectedCities[0].name}${selectedCities.length > 1 ? ` +${selectedCities.length-1}` : ''} (${radiusKm}km)` : '—' },
              ].map((it, i) => (
                <div key={i} style={{ background:'#f8faff', border:'1px solid #e8eaf0', borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', minWidth:'160px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>{it.icon}</div>
                  <div>
                    <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:'500', marginBottom:'2px' }}>{it.label}</div>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#1a1a2e' }}>{it.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="success-columns" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px' }}>
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e8eaf0', padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span style={{ fontSize:'16px', fontWeight:'700', color:'#1a1a2e' }}>Campaign Overview</span>
            </div>
            <div className="overview-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
              {overviewItems.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:'#f8faff', borderRadius:'12px', border:'1px solid #f0f2f8' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', flexShrink:0 }}>{item.icon}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'10px', color:'#9ca3af', fontWeight:'500', marginBottom:'3px' }}>{item.label}</div>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#1a1a2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(launchResult.platformResults).length > 0 && (
              <div style={{ marginTop:'16px', padding:'14px', background:'#f8faff', borderRadius:'12px', border:'1px solid #f0f2f8' }}>
                <div style={{ fontSize:'12px', fontWeight:'700', color:'#1a1a2e', marginBottom:'10px' }}>Platform Status</div>
                {Object.entries(launchResult.platformResults).map(([platform, result]) => (
                  <div key={platform} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'0.5px solid #e8eaf0', fontSize:'13px' }}>
                    <span style={{ textTransform:'capitalize', fontWeight:'500', color:'#374151' }}>{platform}</span>
                    <span style={{ color: result.success ? '#16a34a' : '#dc2626', fontSize:'12px', fontWeight:'600' }}>
                      {result.success ? '✅ Live' : `❌ ${result.error || 'Pending'}`}
                    </span>
                  </div>
                ))}
                {launchResult.audienceProfile && (
              <div style={{ marginTop:'16px', padding:'14px', background:'#f8faff', borderRadius:'12px', border:'1px solid #f0f2f8' }}>
                <div style={{ fontSize:'12px', fontWeight:'700', color:'#1a1a2e', marginBottom:'6px' }}>
                  🎯 AI Suggested Audience
                </div>
                <div style={{ fontSize:'11px', color:'#8892b0', marginBottom:'10px' }}>
                  {launchResult.audienceProfile.reasoning}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {[
                    ...launchResult.audienceProfile.job_functions,
                    ...launchResult.audienceProfile.job_seniorities,
                    ...launchResult.audienceProfile.interests,
                  ].map((tag, i) => (
                    <span key={i} style={{ fontSize:'11px', fontWeight:'500', color:'#1A73E8', background:'#e8f0fe', padding:'3px 10px', borderRadius:'20px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
              </div>
            )}
            {Object.keys(launchResult.platformResults).length === 0 && (
              <div style={{ marginTop:'12px', padding:'10px 14px', background:'#f0fdf4', borderRadius:'8px', fontSize:'12px', color:'#16a34a', fontWeight:'500' }}>
                ✅ Campaign saved — will go live once platform credentials are configured
              </div>
            )}
            {launchResult.adContentWarnings?.length > 0 && (
              <div style={{ marginTop:'12px', padding:'10px 14px', background:'#fff7ed', borderRadius:'8px', fontSize:'12px', color:'#92400e', fontWeight:'500', border:'1px solid #fed7aa' }}>
                ⚠️ Ad content could not be saved for: {launchResult.adContentWarnings.join(', ')}. Please go to the campaign and re-save the ad content.
              </div>
            )}
          </div>

          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #e8eaf0', padding:'24px', display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ fontSize:'16px', fontWeight:'700', color:'#1a1a2e', marginBottom:'4px' }}>What's Next?</div>
            {whatsNext.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize:'13px', color:'#374151', fontWeight:'500' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="success-actions" style={{ display:'flex', gap:'16px', maxWidth:'720px' }}>
          <button style={{ flex:1, padding:'16px', borderRadius:'14px', border:'1.5px solid #e0e4ef', background:'#fff', color:'#1a1a2e', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
            onClick={() => navigate(`/campaigns/${launchResult.campaignId}`)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            View Campaign
          </button>
          <button style={{ flex:1, padding:'16px', borderRadius:'14px', border:'none', background:'#1A73E8', color:'#fff', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
            onClick={() => navigate('/dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════
const globalStyles = `
*::-webkit-scrollbar{display:none}
*{scrollbar-width:none;-ms-overflow-style:none}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── Responsive layout ── */
.mobile-step-info{ display:none; }

@media (max-width: 1024px){
  .radius-section{ grid-template-columns: 1fr !important; }
  .overview-grid{ grid-template-columns: 1fr 1fr !important; }
  .goal-row{ grid-template-columns: 1fr 1fr !important; }
  .success-columns{ grid-template-columns: 1fr !important; }
  .city-metrics{ grid-template-columns: repeat(3, 1fr) !important; }
}

@media (max-width: 900px){
  .app-page{ flex-direction: column !important; height: auto !important; }
  .app-sidebar{
    width: 100% !important;
    height: auto !important;
    position: relative !important;
    top: auto !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 14px 18px !important;
    overflow: visible !important;
    gap: 10px;
  }
  .app-sidebar .desktop-only{ display: none !important; }
  .app-sidebar .mobile-step-info{
    display: block !important;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    background: rgba(255,255,255,0.12);
    padding: 6px 12px;
    border-radius: 20px;
    white-space: nowrap;
  }
  .app-main{
    padding: 18px 16px !important;
    height: auto !important;
    overflow-y: visible !important;
  }
  .form-card{ padding: 20px 18px !important; }
  .form-card h1{ font-size: 21px !important; }
}

@media (max-width: 768px){
  .goal-row{ grid-template-columns: 1fr !important; }
  .date-row{ flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
  .date-row > div:nth-child(2){ display:none; }
  .summary-row-grid{ grid-template-columns: 1fr 1fr !important; }
  .overview-grid{ grid-template-columns: 1fr !important; }
  .city-metrics{ grid-template-columns: repeat(2, 1fr) !important; }
  .bottom-bar{ flex-direction: column !important; }
  .bottom-bar button{ width: 100% !important; }
  .success-actions{ flex-direction: column !important; max-width: 100% !important; }

  .summary-trigger{
    bottom: 16px !important;
    right: 16px !important;
    padding: 9px 14px !important;
    font-size: 12px !important;
  }
  .summary-panel{
    left: 12px !important;
    right: 12px !important;
    bottom: 12px !important;
    width: auto !important;
    max-height: 75vh;
    overflow-y: auto;
    border-radius: 16px !important;
  }
}

@media (max-width: 480px){
  .form-card{ padding: 16px 14px !important; }
  .form-card h1{ font-size: 19px !important; }
  .summary-row-grid{ grid-template-columns: 1fr !important; }
  .city-metrics{ grid-template-columns: repeat(2, 1fr) !important; }
}
`

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [loading, setLoading]                     = useState(false)
  const [error, setError]                         = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [step, setStep]                           = useState(1)
  const [launchResult, setLaunchResult]           = useState(null)
  const [selectedCities, setSelectedCities]       = useState([])
  const [locationData, setLocationData]           = useState(null)
  const [locationLoading, setLocationLoading]     = useState(false)
  const [locationError, setLocationError]         = useState('')
  const [locationAnalyzed, setLocationAnalyzed]   = useState(false)
  const [radiusKm, setRadiusKm]                   = useState(25)
  const [radiusUnit, setRadiusUnit]               = useState('km')
  const [searchQuery, setSearchQuery]             = useState('')
  const [showDropdown, setShowDropdown]           = useState(false)
  const [dropdownResults, setDropdownResults]     = useState([])
  const searchRef                                 = useRef(null)
  const [ageMin, setAgeMin]                       = useState(25)
  const [ageMax, setAgeMax]                       = useState(45)
  const [formData, setFormData]                   = useState({
    name:'', goal:'Lead Generation', industry:'', sub_category:'',
    business_niche:'', budget:'', start_date:'', end_date:'', status:'active',
  })
  const [adContents, setAdContents]   = useState({})
  const [websiteUrl, setWebsiteUrl]   = useState('')
  const [campaignId, setCampaignId]   = useState(null)
  const [audienceProfile, setAudienceProfile] = useState(null)
  const [connections, setConnections]         = useState({})
  const [connectionsLoading, setConnectionsLoading] = useState(true)
  const popupRef = useRef(null)

  const isLeadGen = formData.goal === 'Lead Generation'

  const industryList    = Object.keys(INDUSTRY_MAP)
  const subcategoryList = formData.industry ? INDUSTRY_MAP[formData.industry]?.subcategories || [] : []

  const handleChange = (e) => {
    const {name, value } = e.target
    if (name === 'industry') setFormData(prev => ({ ...prev, industry:value, sub_category:'' }))
    else setFormData(prev => ({ ...prev, [name]:value }))

   
}

  const togglePlatform = (id) =>
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const toggleCity = (cityObj) => {
    setSelectedCities(prev => {
      const exists = prev.find(c => c.name === cityObj.name)
      return exists ? prev.filter(c => c.name !== cityObj.name) : [...prev, cityObj]
    })
    setLocationAnalyzed(false); setLocationData(null)
  }

  const handleSearch = (val) => {
    setSearchQuery(val)
    if (!val.trim()) { setShowDropdown(false); return }
    const q = val.toLowerCase()
    const results = ALL_CITIES
      .map(c => {
        const name  = c.name.toLowerCase()
        const state = c.state.toLowerCase()
        let score = 0
        if (name === q) score = 100
        else if (name.startsWith(q)) score = 80
        else if (name.includes(q)) score = 60
        else if (state.startsWith(q)) score = 40
        else if (state.includes(q)) score = 20
        return { c, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(x => x.c)
    setDropdownResults(results)
    setShowDropdown(true)
  }

  const addCityFromDropdown = (cityObj) => {
    if (!selectedCities.find(c => c.name === cityObj.name)) {
      setSelectedCities(prev => [...prev, cityObj])
      setLocationAnalyzed(false); setLocationData(null)
    }
    setSearchQuery(''); setShowDropdown(false)
  }

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => {
  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/oauth/connections`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adnexus_token')}` },
      })
      setConnections(res.data || {})
    } catch (e) {
      setConnections({})
    } finally {
      setConnectionsLoading(false)
    }
  }
  fetchConnections()

  const handleMessage = (event) => {
    if (event.data?.type === 'oauth-connected') {
      const platform = event.data.platform
      setConnections(prev => ({
        ...prev,
        [platform]: { ...(prev[platform] || {}), connected: true },
      }))
    }
  }
  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [])

const connectPlatform = async (apiKey) => {
  try {
    const res = await axios.get(`${API_BASE}/api/oauth/${apiKey}/connect`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adnexus_token')}` },
    })
    const authUrl = res.data?.auth_url
    if (!authUrl) { setError('Could not start connection. Please try again.'); return }
    popupRef.current = window.open(authUrl, 'oauth-popup', 'width=520,height=650')
  } catch (e) {
    setError(`Failed to connect ${apiKey}: ${e.response?.data?.detail || e.message}`)
  }
}

  const getSliderValue     = () => radiusUnit === 'km' ? radiusKm : Math.round(radiusKm * 0.621)
  const handleRadiusChange = (val) => { const v = parseInt(val); setRadiusKm(radiusUnit==='km' ? v : Math.round(v/0.621)) }

  const getReachEstimate = () => {
    const base = 4 + (radiusKm/100)*18
    const lo   = (base*(selectedCities.length||1)).toFixed(1)
    const hi   = (base*(selectedCities.length||1)*1.5).toFixed(1)
    return { lo, hi, cityName: selectedCities.length===1 ? selectedCities[0].name : `${selectedCities.length} cities` }
  }

  const getDuration = () => {
    if (!formData.start_date || !formData.end_date) return 0
    return Math.ceil((new Date(formData.end_date)-new Date(formData.start_date))/(1000*60*60*24))
  }
  const getTotalWithGST = () => {
  const base = parseFloat(formData.budget || 0) * getDuration()
  return base + base * 0.18
}

  const getSelectedPlatformKeys  = () => selectedPlatforms.map(id => platforms.find(p => p.id===id)?.apiKey).filter(Boolean)
  const getSelectedPlatformNames = () => selectedPlatforms.map(id => platforms.find(p => p.id===id)?.name).filter(Boolean)
  const getGoalApiVal            = () => GOALS.find(g => g.val===formData.goal)?.apiVal || 'LEAD_GEN'

  const getGoogleAdContent = () => {
    const content = adContents[platforms.find(p => p.apiKey==='google')?.id] || {}
    return {
      headlines:    content.headlines    || [content.headline    || '', '', ''].filter(Boolean),
      descriptions: content.descriptions || [content.description || ''].filter(Boolean),
      final_url:    content.final_url    || content.link_url || '',
      display_url:  content.display_url  || '',
      primary_text: content.primary_text || content.description || '',
      headline:     content.headline     || '',
      cta:          content.cta_button   || 'LEARN_MORE',
      link_url:     content.link_url     || content.final_url || '',
      image_url:    content.image_url    || '',
    }
  }

  const handleAnalyzeLocations = async () => {
    if (!selectedCities.length) { setLocationError('Please select at least one city!'); return }
    setLocationLoading(true); setLocationError('')
    try {
      const res = await fetch(`${API_BASE}/api/campaigns/location-reach`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adnexus_token')}` },
        body: JSON.stringify({
          platforms:      getSelectedPlatformNames(),
          daily_budget:   parseFloat(formData.budget) || 0,
          duration_days:  getDuration() || 30,
          business_niche: formData.business_niche,
          goal:           formData.goal,
          cities:         selectedCities.map(c => c.name),
          radius_km:      radiusKm,
        }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Server error') }
      const data = await res.json()
      setLocationData(data); setLocationAnalyzed(true)
    } catch (err) {
      setLocationError(`Analysis failed: ${err.message}`)
    } finally { setLocationLoading(false) }
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const dailyBudget = parseFloat(formData.budget)
      const totalBudget = dailyBudget * getDuration()

      const payload = {
        name:           formData.name,
        goal:           getGoalApiVal(),
        industry:       formData.industry,
        sub_category:   formData.sub_category,
        business_niche: formData.business_niche,
        budget:         dailyBudget,
        budget_amount:  totalBudget,
        start_date:     formData.start_date,
        end_date:       formData.end_date,
        platforms:      getSelectedPlatformKeys(),
        keywords:       formData.business_niche ? formData.business_niche.split(',').map(k => k.trim()) : ['business loan'],
        targeting: {
          locations: selectedCities.length > 0 ? selectedCities.map(c => c.name) : ['Delhi', 'Mumbai'],
          radius_km: radiusKm,
          age_min:   ageMin,
          age_max:   ageMax,
          genders:   [1, 2],
        },
        ad_content: getGoogleAdContent(),
      }

      const res           = await axios.post(`${API_BASE}/api/campaigns/`, payload)
      const newCampaignId = res.data.campaign_id || res.data.id
      const platformResults = res.data.platforms || {}
      setCampaignId(newCampaignId)

     let generatedAudience = null
      if (newCampaignId) {
        try {
          const primaryAdContent = getGoogleAdContent()
          const audienceRes = await axios.post(
            `${API_BASE}/api/campaigns/${newCampaignId}/audience/generate`,
            {
              ad_title: primaryAdContent.headline || formData.name,
              ad_description: primaryAdContent.primary_text || primaryAdContent.descriptions?.[0] || formData.business_niche,
              industry: formData.industry,
              sub_category: formData.sub_category,
            }
          )
          generatedAudience = audienceRes.data
        } catch (e) {
          console.warn('Audience targeting generation failed:', e)
        }
      }
      setAudienceProfile(generatedAudience)

      const adContentWarnings = []
      for (const platformId of selectedPlatforms) {
        const content = adContents[platformId]
        if (content?.headline) {
          try {
            await axios.post(`${API_BASE}/api/campaigns/${newCampaignId}/ad-content`, {
              platform_id:     platformId,
              headline:        content.headline       || '',
              description:     content.description    || '',
              image_url:       content.image_url      || '',
              cta_button:      content.cta_button     || 'Apply Now',
              target_audience: content.target_audience || '',
              target_age_min:  parseInt(content.target_age_min) || 25,
              target_age_max:  parseInt(content.target_age_max) || 55,
            })
          } catch (e) {
            const platformName = platforms.find(p => p.id === platformId)?.name || `Platform ${platformId}`
            adContentWarnings.push(platformName)
          }
        }
      }

      setLaunchResult({
        campaignId: newCampaignId,
        platformResults,
        adContentWarnings,
        audienceProfile: generatedAudience,
        success: true,
      })
    } catch (err) {
      setError(`Error launching campaign: ${err.response?.data?.detail || err.message}`)
    } finally { setLoading(false) }
  }

  const reach = getReachEstimate()

  if (launchResult?.success) {
    return (
      <LaunchSuccess
        launchResult={launchResult}
        formData={formData}
        selectedPlatforms={selectedPlatforms}
        selectedCities={selectedCities}
        radiusKm={radiusKm}
        locationData={locationData}
        navigate={navigate}
      />
    )
  }

  return (
    <div className="app-page" style={s.page}>
      <style>{globalStyles}</style>

      {/* ── Left Panel ── */}
      <div className="app-sidebar" style={s.leftPanel}>
        <div style={s.leftLogo}>
          <div style={s.logoMark}>A</div>
          <span style={s.leftLogoText}>AdNexus</span>
        </div>
        <div className="mobile-step-info">Step {step}/{steps.length} · {steps[step-1].label}</div>
        <div className="desktop-only" style={s.leftContent}>
          <h2 style={s.leftTitle}>Launch your next B2B campaign</h2>
          <p style={s.leftDesc}>Reach ₹10Cr+ turnover businesses across Google, LinkedIn, Facebook & Instagram.</p>
        </div>
        <div className="desktop-only" style={s.stepsIndicator}>
          {steps.map(st => (
            <div key={st.num} style={s.stepItem}>
              <div style={{ ...s.stepCircle, ...(step>st.num ? s.stepCircleDone:{}), ...(step===st.num ? s.stepCircleActive:{}) }}>
                {step>st.num ? '✓' : st.num}
              </div>
              <span style={{ ...s.stepLabel, ...(step>=st.num ? s.stepLabelActive:{}) }}>{st.label}</span>
            </div>
          ))}
        </div>
        <div className="desktop-only" style={s.needHelp}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
            <span style={{ fontSize:'16px' }}>❓</span>
            <span style={{ fontSize:'13px', fontWeight:'700', color:'#fff' }}>Need Help?</span>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', margin:'0 0 10px 0', lineHeight:'1.5' }}>Book a call with our ad experts</p>
          <button style={s.bookNowBtn}>Book Now</button>
        </div>
      </div>

      {/* ── Center (now full width — no right panel) ── */}
      <div className="app-main" style={s.mainContent}>
        <button style={s.backBtn} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <div className="form-card" style={s.formCard}>
          <div style={s.formHeader}>
            <h1 style={s.formTitle}>{steps[step-1].label}</h1>
            <p style={s.formSubtitle}>Step {step} of {steps.length}</p>
          </div>
          {error && <div style={s.error}>{error}</div>}

          {/* ══ Step 1 ══ */}
          {step === 1 && (
            <div>
              <div style={s.formGroup}>
                <label style={s.label}>Campaign Name</label>
                <input style={s.input} type="text" name="name" placeholder="e.g. Working Capital Finance Q1 2026" value={formData.name} onChange={handleChange} />
                <span style={s.hint}>Give your campaign a clear, descriptive name</span>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Goal <span style={s.labelSub}>(What do you want to achieve?)</span></label>
                <div className="goal-row" style={s.goalRow}>
                  {GOALS.map(g => (
                    <div key={g.val} onClick={() => setFormData({...formData, goal:g.val})}
                      style={{ ...s.goalCard, ...(formData.goal===g.val ? s.goalCardActive:{}) }}>
                      {formData.goal===g.val && (
                        <div style={s.goalCheckmark}>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                      <div style={s.goalIconWrap}>{g.icon}</div>
                      <div style={s.goalName}>{g.val}</div>
                      <div style={s.goalDesc}>{g.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Industry</label>
                <div style={s.selectWrap}>
                  <span style={s.selectIcon}>{formData.industry ? INDUSTRY_MAP[formData.industry]?.icon : '🏢'}</span>
                  <select style={s.select} name="industry" value={formData.industry} onChange={handleChange}>
                    <option value="">Select your industry...</option>
                    {industryList.map(ind => <option key={ind} value={ind}>{INDUSTRY_MAP[ind].icon} {ind}</option>)}
                  </select>
                  <span style={s.selectChevron}>▾</span>
                </div>
              </div>
              {formData.industry && (
                <div style={s.formGroup}>
                  <label style={s.label}>Sub Category</label>
                  <div style={s.selectWrap}>
                    <span style={s.selectIcon}>📂</span>
                    <select style={s.select} name="sub_category" value={formData.sub_category} onChange={handleChange}>
                      <option value="">Select sub category...</option>
                      {subcategoryList.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                    <span style={s.selectChevron}>▾</span>
                  </div>
                </div>
              )}
              <div style={s.formGroup}>
                <label style={s.label}>Business Niche / Keywords</label>
                <input style={s.input} type="text" name="business_niche" placeholder="e.g. Working Capital, Machinery Loan" value={formData.business_niche} onChange={handleChange} />
                <span style={s.hint}>Keywords that describe your business offering</span>
              </div>
            </div>
          )}

          {/* ══ Step 2 ══ */}
       {step === 2 && (
  <div>
    <div style={s.formGroup}>
      <label style={s.label}>Select Platforms</label>
      <p style={s.hint}>Choose where your ads will run</p>
      <div style={s.platformGrid}>
        {platforms.map(p => {
const isConnectable = ['google', 'meta', 'instagram'].includes(p.apiKey)
// Instagram Meta ke hi connection se chalta hai — isliye instagram ke liye bhi meta ka connection status check karo
const connectionKey = p.apiKey === 'instagram' ? 'meta' : p.apiKey
const isConnected = connections[connectionKey]?.connected
          return (
            <div key={p.id} style={{ ...s.platformCard, ...(selectedPlatforms.includes(p.id) ? {...s.platformCardActive, borderColor:p.color}:{}) }}>
              <div onClick={() => togglePlatform(p.id)} style={{ display:'flex', alignItems:'center', gap:'14px', flex:1, cursor:'pointer' }}>
                <div style={{ ...s.platIcon, background:p.color }}>{p.icon}</div>
                <div style={s.platInfo}><div style={s.platName}>{p.name}</div><div style={s.platDesc}>{p.desc}</div></div>
                <div style={{ ...s.platCheck, ...(selectedPlatforms.includes(p.id) ? {background:p.color, borderColor:p.color}:{}) }}>
                  {selectedPlatforms.includes(p.id) && '✓'}
                </div>
              </div>

              {isConnectable && selectedPlatforms.includes(p.id) && (
                isConnected ? (
                  <span style={{ fontSize:'11px', color:'#16a34a', fontWeight:'600', marginLeft:'10px', whiteSpace:'nowrap' }}>✅ Connected</span>
                ) : (
                  <button
                    type="button"
                 onClick={(e) => { e.stopPropagation(); connectPlatform(connectionKey) }}
                    style={{ marginLeft:'10px', padding:'6px 12px', fontSize:'11px', fontWeight:'600', color:'#fff', background:p.color, border:'none', borderRadius:'8px', cursor:'pointer', whiteSpace:'nowrap' }}
                  >
                    Connect Account
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>
      {selectedPlatforms.length > 0 && <div style={s.selectedInfo}>✅ {selectedPlatforms.length} platform{selectedPlatforms.length>1?'s':''} selected</div>}
    </div>
  </div>
)}

          {/* ══ Step 3 ══ */}
          {step === 3 && (
            <div>
              <div style={s.formGroup}>
                <label style={s.label}>Daily Budget (₹)</label>
                <div style={s.budgetInputWrap}>
                  <span style={s.budgetSymbol}>₹</span>
                  <input style={s.budgetInput} type="number" name="budget" placeholder="150000" value={formData.budget} onChange={handleChange} />
                  <span style={s.budgetUnit}>/day</span>
                </div>
              </div>
              <div className="date-row" style={s.dateRow}>
                <div style={{ flex:1 }}>
                  <label style={s.label}>Start Date</label>
                  <div style={s.dateInputWrap}>
                    <svg style={s.dateIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input style={s.dateInput} type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
                  </div>
                </div>
                <div style={s.dateSeparator}>→</div>
                <div style={{ flex:1 }}>
                  <label style={s.label}>End Date</label>
                  <div style={s.dateInputWrap}>
                    <svg style={s.dateIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8892b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input style={s.dateInput} type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div style={s.ageSection}>
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'15px', fontWeight:'700', color:'#1a1a2e', marginBottom:'4px' }}>Age Targeting</div>
                  <div style={{ fontSize:'12px', color:'#8892b0' }}>Select age range for your audience</div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                  <div><div style={{ fontSize:'11px', color:'#8892b0', marginBottom:'4px', fontWeight:'500' }}>Start Age</div><div style={s.ageBadge}>{ageMin} Years</div></div>
                  <div style={{ textAlign:'right' }}><div style={{ fontSize:'11px', color:'#8892b0', marginBottom:'4px', fontWeight:'500' }}>End Age</div><div style={s.ageBadge}>{ageMax} Years</div></div>
                </div>
                <AgeRangeSlider ageMin={ageMin} ageMax={ageMax} setAgeMin={setAgeMin} setAgeMax={setAgeMax} />
                <div style={s.ageTicks}>{[18,25,30,35,40,45,55,60,'65+'].map(t => <span key={t} style={{ fontSize:'10px', color:'#8892b0' }}>{t}</span>)}</div>
                <div style={s.ageReachCard}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="10" r="5" stroke="#1A73E8" strokeWidth="1.8"/><circle cx="18" cy="10" r="5" stroke="#1A73E8" strokeWidth="1.8"/><path d="M3 24c0-4 3-6 7-6s7 2 7 6" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 18c2 0 5 1 5 6" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <div>
                    <span style={{ fontSize:'14px', fontWeight:'700', color:'#1A73E8' }}>{((ageMax-ageMin)*0.08+0.5).toFixed(1)}M people</span>
                    <span style={{ fontSize:'13px', color:'#8892b0' }}> in this age range</span>
                  </div>
                </div>
              </div>
              {getDuration() > 0 && (
                <div style={s.budgetSummaryBar}>
                  <div style={s.budgetSummaryItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize:'13px', color:'#4b5563' }}><strong>Duration:</strong> {getDuration()} days</span>
                  </div>
                  <div style={s.budgetSummaryDivider} />
                  <div style={s.budgetSummaryItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    <span style={{ fontSize:'13px', color:'#4b5563' }}><strong>Total (incl. 18% GST):</strong> ₹{getTotalWithGST().toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ Step 4 ══ */}
          {step === 4 && (
            <div>
              <div style={s.contextBar}>
                <span style={s.contextChip}>{selectedPlatforms.map(id=>platforms.find(p=>p.id===id)?.name).join(', ')}</span>
                <span style={s.contextChip}>₹{parseInt(formData.budget||0).toLocaleString()}/day</span>
                <span style={s.contextChip}>{getDuration()} days</span>
                <span style={s.contextChip}>₹{getTotalWithGST().toLocaleString('en-IN', {maximumFractionDigits:0})} total (incl. GST)</span>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Select Target Cities</label>
                <p style={s.hint}>Search or pick from popular cities below</p>
                <div ref={searchRef} style={{ position:'relative', marginBottom:'12px' }}>
                  <span style={s.searchIcon}>🔍</span>
                  <input style={s.searchInput} type="text" placeholder="Search any city in India..." value={searchQuery}
                    onChange={e => handleSearch(e.target.value)} onFocus={() => searchQuery && setShowDropdown(true)} autoComplete="off" />
                  {searchQuery && <button style={s.searchClear} onClick={() => { setSearchQuery(''); setShowDropdown(false) }}>✕</button>}
                  {showDropdown && dropdownResults.length > 0 && (
                    <div style={s.dropdown}>
                      {dropdownResults.map(city => {
                        const isSel = selectedCities.find(c => c.name===city.name)
                        return (
                          <div key={city.name} style={{ ...s.dropItem, ...(isSel?s.dropItemSelected:{}) }} onClick={() => addCityFromDropdown(city)}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ color:'#8892b0', fontSize:'13px' }}>📍</span>
                              <div>
                                <div style={{ fontSize:'13px', color: isSel?'#1A73E8':'#1a1a2e' }}>{city.name}</div>
                                <div style={{ fontSize:'11px', color:'#8892b0' }}>{city.state}</div>
                              </div>
                            </div>
                            {isSel && <span style={{ color:'#1A73E8', fontSize:'14px' }}>✓</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize:'11px', fontWeight:'600', color:'#8892b0', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px' }}>Popular cities</div>
                <div style={s.cityGrid}>
                  {POPULAR_CITIES.map(city => {
                    const isSel = selectedCities.find(c => c.name===city.name)
                    return (
                      <div key={city.name} onClick={() => toggleCity(city)} style={{ ...s.cityChip, ...(isSel?s.cityChipActive:{}) }}>
                        📍 {city.name}{isSel && <span style={s.cityCheck}>✓</span>}
                      </div>
                    )
                  })}
                </div>
                {selectedCities.length > 0
                  ? <div style={s.selectedInfo}>📍 {selectedCities.length} cit{selectedCities.length>1?'ies':'y'} selected: {selectedCities.map(c=>c.name).join(', ')}</div>
                  : <div style={{ ...s.selectedInfo, background:'#fff5f5', color:'#c62828' }}>No city selected — pick at least one</div>
                }
              </div>
              <div style={s.divider} />
              <div style={{ fontSize:'11px', fontWeight:'600', color:'#8892b0', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Set targeting radius</div>
              <p style={{ fontSize:'12px', color:'#8892b0', marginBottom:'14px' }}>Adjust how far around the city your ads will show</p>
              <div className="radius-section" style={s.radiusSection}>
                <div style={s.mapWrap}><MapCanvas selectedCities={selectedCities} radiusKm={radiusKm} /></div>
                <div style={s.radiusControls}>
                  <div style={s.toggleRow}>
                    {['km','mi'].map(u => (
                      <button key={u} style={{ ...s.toggleBtn, ...(radiusUnit===u?s.toggleBtnActive:{}) }} onClick={() => setRadiusUnit(u)}>
                        {u==='km'?'Kilometres':'Miles'}
                      </button>
                    ))}
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                      <span style={{ fontSize:'28px', fontWeight:'500', color:'#1a1a2e' }}>{radiusUnit==='km'?radiusKm:Math.round(radiusKm*0.621)}</span>
                      <span style={{ fontSize:'14px', color:'#8892b0' }}>{radiusUnit}</span>
                    </div>
                    <p style={{ fontSize:'11px', color:'#8892b0', marginTop:'2px' }}>radius around city center</p>
                  </div>
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#8892b0', marginBottom:'4px' }}>
                      <span>{radiusUnit==='km'?'5 km':'3 mi'}</span><span>{radiusUnit==='km'?'100 km':'62 mi'}</span>
                    </div>
                    <input type="range" min={radiusUnit==='km'?5:3} max={radiusUnit==='km'?100:62} step="1"
                      value={getSliderValue()} onChange={e => handleRadiusChange(e.target.value)}
                      style={{ width:'100%', accentColor:'#1A73E8' }} />
                  </div>
                  <div style={s.reachCard}>
                    <div style={{ fontSize:'11px', color:'#8892b0', marginBottom:'3px' }}>Estimated reach</div>
                    <div style={{ fontSize:'15px', fontWeight:'600', color:'#1a1a2e' }}>{reach.lo}L – {reach.hi}L businesses</div>
                    <div style={{ fontSize:'11px', color:'#8892b0', marginTop:'2px' }}>within {radiusKm} km of {reach.cityName}</div>
                  </div>
                </div>
              </div>
              {locationError && <div style={{ ...s.error, marginTop:'12px' }}>{locationError}</div>}
              {!locationAnalyzed && (
                <button type="button"
                  style={{ ...(locationLoading||selectedCities.length===0 ? s.analyzeDisabled:s.analyzeBtn), marginTop:'16px' }}
                  disabled={locationLoading||selectedCities.length===0} onClick={handleAnalyzeLocations}>
                  {locationLoading
                    ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><span style={s.spinner} /> Analyzing...</span>
                    : `🔍 Analyze Reach for ${selectedCities.length} Cit${selectedCities.length!==1?'ies':'y'}`}
                </button>
              )}
              {locationAnalyzed && locationData && (
                <div style={s.reachResults}>
                  <div style={s.strategyTip}><span>💡</span><span style={{ fontSize:'12px', color:'#92400e', lineHeight:'1.6' }}>{locationData.strategy_tip}</span></div>
                  <div className="summary-row-grid" style={s.summaryRowGrid}>
                    {[
                      {label:'Total Reach',  val:locationData.total_summary?.total_reach||'—',       icon:'👥'},
                      {label:'Impressions',  val:locationData.total_summary?.total_impressions||'—', icon:'👁️'},
                      {label:'Est. Leads',   val:locationData.total_summary?.total_leads||'—',       icon:'🎯'},
                      {label:'Avg CPM',      val:locationData.total_summary?.avg_cpm||'—',           icon:'💰'},
                    ].map((item,i) => (
                      <div key={i} style={s.summaryCardItem}>
                        <div style={{ fontSize:'18px', marginBottom:'4px' }}>{item.icon}</div>
                        <div style={{ fontSize:'16px', fontWeight:'700', color:'#1A73E8', marginBottom:'2px' }}>{item.val}</div>
                        <div style={{ fontSize:'10px', color:'#8892b0', fontWeight:'500' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  {locationData.best_city && <div style={s.bestCityBadge}>🏆 Best City: <strong>{locationData.best_city}</strong></div>}
                  <div style={s.cityCards}>
                    {Object.entries(locationData.cities).map(([cityName, data]) => (
                      <div key={cityName} style={{ ...s.cityCard, ...(locationData.best_city===cityName?s.cityCardBest:{}) }}>
                        <div style={s.cityCardHeader}>
                          <div style={s.cityCardName}>📍 {cityName}{locationData.best_city===cityName&&<span style={s.bestTag}>🏆 Best</span>}</div>
                          <span style={{ ...s.competitionBadge, color:competitionColor[data.competition_level]||'#8892b0', background:(competitionColor[data.competition_level]||'#8892b0')+'18' }}>
                            {data.competition_level} Competition
                          </span>
                        </div>
                        <div className="city-metrics" style={s.cityMetrics}>
                          {[
                            {label:'Total Audience',val:data.total_audience},{label:'Est. Reach',val:data.estimated_reach},
                            {label:'Impressions',   val:data.estimated_impressions},{label:'Est. Leads',val:data.estimated_leads},
                            {label:'CPM',           val:data.cpm},{label:'CPC',val:data.cpc},
                          ].map((m,i) => (
                            <div key={i} style={s.metricItem}><div style={s.metricVal}>{m.val}</div><div style={s.metricLabel}>{m.label}</div></div>
                          ))}
                        </div>
                        <div style={s.cityRecommendation}>💬 {data.recommendation}</div>
                      </div>
                    ))}
                  </div>
                  <button type="button" style={s.reanalyzeBtn} onClick={() => { setLocationAnalyzed(false); setLocationData(null) }}>🔄 Change Cities & Re-analyze</button>
                </div>
              )}
            </div>
          )}

          {/* ══ Step 5: Form Preview (Lead Gen) OR Website URL ══ */}
          {step === 5 && isLeadGen && (
            <FormPreview
              campaignData={formData}
              campaignId={campaignId}
              onBack={() => setStep(4)}
              onNext={() => { setError(''); setStep(6) }}
            />
          )}

          {step === 5 && !isLeadGen && (
            <div>
              <div style={s.formGroup}>
                <label style={s.label}>
                  {formData.goal === 'Brand Awareness' ? '🎯 Brand Awareness' : '🌐 Website Traffic'} — Enter Your Website URL
                </label>
                <p style={s.hint}>When someone clicks your ad they will be redirected to this URL</p>
                <input
                  style={s.input}
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                />
              </div>
              <div style={{ background:'#f0f4ff', border:'1px solid #c7d2fe', borderRadius:'12px', padding:'16px', marginTop:'8px' }}>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#1a1a2e', marginBottom:'8px' }}>
                  {formData.goal === 'Brand Awareness' ? '📣 How Brand Awareness works:' : '🌐 How Website Traffic works:'}
                </div>
                {[
                  'Person sees your ad on selected platforms',
                  'They click the ad CTA button',
                  'They are redirected to your website URL',
                  'We track clicks in your leads dashboard',
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
                    <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#1A73E8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#fff', fontWeight:'700', flexShrink:0 }}>{i + 1}</div>
                    <span style={{ fontSize:'12px', color:'#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ Step 6: Ad Content ══ */}
          {step === 6 && (
            <AdContent
              embedded={true}
              selectedPlatforms={selectedPlatforms}
              adContents={adContents}
              onAdContentsChange={setAdContents}
              onBack={() => setStep(5)}
              onNext={() => { setError(''); setStep(7) }}
              campaignData={formData}
            />
          )}

          {/* ══ Step 7: Review & Launch ══ */}
          {step === 7 && (
            <div>
              <div style={s.reviewSection}>
                <div style={s.reviewTitle}>📋 Campaign Details</div>
                {[
                  {label:'Campaign Name', val:formData.name},
                  {label:'Goal',          val:formData.goal},
                  {label:'Industry',      val:formData.industry||'—'},
                  {label:'Sub Category',  val:formData.sub_category||'—'},
                  {label:'Business Niche',val:formData.business_niche},
                  {label:'Daily Budget',  val:`₹${parseFloat(formData.budget||0).toLocaleString()}/day`},
                  {label:'Age Targeting', val:`${ageMin} – ${ageMax} Years`},
                  {label:'Duration',      val:`${formData.start_date} → ${formData.end_date} (${getDuration()} days)`},
                  {label:'Subtotal',      val:`₹${(parseFloat(formData.budget||0)*getDuration()).toLocaleString('en-IN')}`},
                 {label:'GST (18%)',     val:`₹${(parseFloat(formData.budget||0)*getDuration()*0.18).toLocaleString('en-IN', {maximumFractionDigits:0})}`},
                 {label:'Total Payable', val:`₹${getTotalWithGST().toLocaleString('en-IN', {maximumFractionDigits:0})}`},
                ].map((item,i) => (
                  <div key={i} style={s.reviewRow}>
                    <span style={s.reviewLabel}>{item.label}</span>
                    <span style={s.reviewVal}>{item.val}</span>
                  </div>
                ))}
              </div>
              <div style={s.reviewSection}>
                <div style={s.reviewTitle}>🚀 Selected Platforms</div>
                <div style={s.reviewPlatforms}>
                  {selectedPlatforms.map(id => {
                    const p          = platforms.find(pl => pl.id===id)
                    const hasContent = adContents[id]?.headline
                    return (
                      <div key={id} style={s.reviewPlatformItem}>
                        <div style={{ ...s.platIcon, background:p.color }}>{p.icon}</div>
                        <div>
                          <div style={s.platName}>{p.name}</div>
                          <div style={{ fontSize:'11px', color:hasContent?'#1b7a4a':'#e65100' }}>{hasContent?'✅ Ad content ready':'⚠️ No ad content'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {selectedCities.length > 0 && (
                <div style={s.reviewSection}>
                  <div style={s.reviewTitle}>📍 Location Targeting</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:4 }}>
                    {selectedCities.map(city => <span key={city.name} style={s.locationTag}>📍 {city.name}</span>)}
                  </div>
                  <div style={{ marginTop:'8px', fontSize:'12px', color:'#8892b0' }}>📏 Radius: {radiusKm} km around each city</div>
                </div>
              )}
              <div style={s.launchBox}>
                <div style={s.launchBoxTitle}>🎯 Ready to Launch?</div>
                <p style={s.launchBoxDesc}>Campaign will be saved and submitted to selected platforms.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom navigation ── */}
        <div className="bottom-bar" style={s.bottomBar}>
          {step > 1 && step !== 5 && step !== 6 && (
            <button type="button" style={s.backStepBtn} onClick={() => setStep(step-1)}>← Back</button>
          )}
          {step === 1 && (
            <button type="button" style={s.nextBtnFull} onClick={() => {
              if (!formData.name||!formData.business_niche) { setError('Please fill all required fields!'); return }
              setError(''); setStep(2)
            }}>Next: Select Platforms →</button>
          )}
          {step === 2 && (
  <button type="button" style={s.nextBtnFull} onClick={() => {
    if (!selectedPlatforms.length) { setError('Please select at least one platform!'); return }
const unconnected = selectedPlatforms
  .map(id => platforms.find(p => p.id === id))
  .filter(p => {
    if (!['google','meta','instagram'].includes(p.apiKey)) return false
    const key = p.apiKey === 'instagram' ? 'meta' : p.apiKey
    return !connections[key]?.connected
  })
   if (unconnected.length) {
   setError(`Please connect your ${unconnected.map(p=>p.name).join(', ')} account first!`)
   return

    }
    setError(''); setStep(3)
  }}>Next: Budget & Dates →</button>
)}
          {step === 3 && (
            <button type="button" style={s.nextBtnFull} onClick={() => {
              if (!formData.budget||!formData.start_date||!formData.end_date) { setError('Please fill all required fields!'); return }
              setError(''); setStep(4)
            }}>Next: Location Targeting →</button>
          )}
          {step === 4 && (
            <button type="button" style={s.nextBtnFull} onClick={() => {
              if (!selectedCities.length) { setLocationError('Please select at least one city!'); return }
              setLocationError(''); setError(''); setStep(5)
            }}>Next: {isLeadGen ? 'Form Setup' : 'Website URL'} →</button>
          )}
          {step === 5 && !isLeadGen && (
            <button type="button" style={s.nextBtnFull} onClick={() => {
              if (!websiteUrl) { setError('Please enter your website URL!'); return }
              setError(''); setStep(6)
            }}>Next: Ad Content →</button>
          )}
          {step === 7 && (
            <button type="button" style={loading ? s.submitBtnDisabled : s.nextBtnFull} disabled={loading} onClick={handleSubmit}>
              {loading ? '⏳ Launching...' : '🚀 Launch Campaign'}
            </button>
          )}
        </div>
      </div>

      {/* ── Floating Summary Popover (replaces old right sidebar) ── */}
      <CampaignSummaryPopover
        formData={formData}
        selectedPlatforms={selectedPlatforms}
        step={step}
        selectedCities={selectedCities}
      />
    </div>
  )
}

const s = {
  // ── Layout ──
  page:        { display:'flex', minHeight:'100vh', fontFamily:'DM Sans, sans-serif', background:'#f0f2f8', overflow:'hidden' },
  // Left panel unchanged
  leftPanel:   { width:'260px', background:'linear-gradient(160deg,#0f1535 0%,#1a3a8f 100%)', padding:'28px 20px', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' },
  logoMark:    { width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'800', color:'#fff', fontFamily:'Georgia,serif', flexShrink:0 },
  leftLogo:    { display:'flex', alignItems:'center', gap:'10px', marginBottom:'32px' },
  leftLogoText:{ color:'#fff', fontSize:'18px', fontWeight:'700', letterSpacing:'-0.3px' },
  leftContent: { flex:1 },
  leftTitle:   { color:'#fff', fontSize:'18px', fontWeight:'700', marginBottom:'10px', lineHeight:'1.35' },
  leftDesc:    { color:'rgba(255,255,255,0.65)', fontSize:'12px', lineHeight:'1.65', marginBottom:'28px' },
  stepsIndicator: { display:'flex', flexDirection:'column', gap:'4px', marginBottom:'24px' },
  stepItem:       { display:'flex', alignItems:'center', gap:'10px', padding:'5px 0' },
  stepCircle:     { width:'24px', height:'24px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:'700', flexShrink:0 },
  stepCircleActive:{ background:'#fff', color:'#1A73E8', border:'1.5px solid #fff' },
  stepCircleDone: { background:'#22c55e', color:'#fff', border:'1.5px solid #22c55e' },
  stepLabel:      { color:'rgba(255,255,255,0.45)', fontSize:'12px' },
  stepLabelActive:{ color:'#fff', fontWeight:'600' },
  needHelp:   { background:'rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px', border:'1px solid rgba(255,255,255,0.12)', marginTop:'8px' },
  bookNowBtn: { width:'100%', padding:'9px', borderRadius:'8px', border:'1.5px solid rgba(255,255,255,0.4)', background:'transparent', color:'#fff', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' },
  // Main content — now fills all space (no right panel)
 mainContent: { flex:1, padding:'28px 24px', overflowY:'auto', minWidth:0, height:'100vh', display:'flex', flexDirection:'column' },
  backBtn:      { background:'none', border:'none', color:'#1A73E8', fontSize:'13px', cursor:'pointer', padding:'0 0 16px 0', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px', alignSelf:'flex-start' },
  formCard: { background:'#fff', borderRadius:'16px', border:'0.5px solid #e0e4ef', padding:'32px 36px', width:'100%', maxWidth:'100%', boxSizing:'border-box' },
  formTitle:    { fontSize:'26px', fontWeight:'700', color:'#1a1a2e', margin:'0 0 4px 0' },
  formSubtitle: { fontSize:'13px', color:'#8892b0', margin:0 },
  // Form elements
  formGroup:  { marginBottom:'22px' },
  label:      { display:'block', fontSize:'13px', fontWeight:'600', color:'#1a1a2e', marginBottom:'8px' },
  labelSub:   { fontWeight:'400', color:'#8892b0', fontSize:'12px' },
  hint:       { display:'block', fontSize:'11px', color:'#8892b0', marginTop:'5px' },
  input:      { width:'100%', padding:'12px 16px', borderRadius:'10px', border:'1.5px solid #e0e4ef', background:'#fff', fontSize:'13px', color:'#1a1a2e', outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  selectWrap:    { position:'relative', display:'flex', alignItems:'center' },
  selectIcon:    { position:'absolute', left:'12px', fontSize:'16px', zIndex:1, pointerEvents:'none' },
  selectChevron: { position:'absolute', right:'12px', fontSize:'12px', color:'#8892b0', pointerEvents:'none' },
  select:        { width:'100%', padding:'12px 36px 12px 40px', borderRadius:'10px', border:'1.5px solid #e0e4ef', background:'#fff', fontSize:'13px', color:'#1a1a2e', outline:'none', fontFamily:'inherit', appearance:'none', cursor:'pointer' },
  goalRow:        { display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:'12px' },
  goalCard:       { position:'relative', padding:'20px 14px 18px', borderRadius:'12px', border:'1.5px solid #e0e4ef', background:'#fff', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'8px', transition:'all 0.15s', minWidth:0 },
  goalCardActive: { border:'1.5px solid #1A73E8', background:'#f6f9ff' },
  goalCheckmark:  { position:'absolute', top:'10px', right:'10px', background:'#1A73E8', width:'20px', height:'20px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  goalIconWrap:   { display:'flex', alignItems:'center', justifyContent:'center', height:'44px' },
  goalName:       { fontSize:'13px', fontWeight:'700', color:'#1a1a2e', lineHeight:'1.3' },
  goalDesc:       { fontSize:'11px', color:'#8892b0', lineHeight:'1.4' },
  // Navigation
 bottomBar: { display:'flex', gap:'12px', marginTop:'20px', width:'100%' },
  nextBtnFull:       { flex:1, padding:'15px 24px', borderRadius:'12px', border:'none', background:'#1A73E8', color:'#fff', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', textAlign:'center' },
  backStepBtn:       { padding:'15px 24px', borderRadius:'12px', border:'1.5px solid #e0e4ef', background:'#fff', color:'#8892b0', fontSize:'15px', cursor:'pointer', fontFamily:'inherit' },
  submitBtnDisabled: { flex:1, padding:'15px 24px', borderRadius:'12px', border:'none', background:'#93b8f4', color:'#fff', fontSize:'15px', fontWeight:'600', cursor:'not-allowed', fontFamily:'inherit' },
  // Step 3
  budgetInputWrap: { display:'flex', alignItems:'center', border:'1.5px solid #e0e4ef', borderRadius:'10px', background:'#fff', overflow:'hidden' },
  budgetSymbol:    { padding:'12px 14px', background:'#f4f6fb', color:'#8892b0', fontSize:'14px', fontWeight:'600', borderRight:'1.5px solid #e0e4ef' },
  budgetInput:     { flex:1, padding:'12px 14px', border:'none', fontSize:'13px', color:'#1a1a2e', outline:'none', fontFamily:'inherit', minWidth:0 },
  budgetUnit:      { padding:'12px 14px', background:'#f4f6fb', color:'#8892b0', fontSize:'12px', borderLeft:'1.5px solid #e0e4ef' },
  dateRow:         { display:'flex', gap:'12px', alignItems:'flex-end', marginBottom:'12px' },
  dateSeparator:   { color:'#8892b0', fontSize:'18px', paddingBottom:'12px', flexShrink:0 },
  dateInputWrap:   { position:'relative', display:'flex', alignItems:'center', border:'1.5px solid #e0e4ef', borderRadius:'10px', background:'#fff', overflow:'hidden' },
  dateIcon:        { position:'absolute', left:'12px', pointerEvents:'none', flexShrink:0 },
  dateInput:       { width:'100%', padding:'12px 12px 12px 36px', border:'none', background:'transparent', fontSize:'13px', color:'#1a1a2e', outline:'none', fontFamily:'inherit', cursor:'pointer' },
  ageSection:    { background:'#f8faff', border:'1.5px solid #e0e4ef', borderRadius:'12px', padding:'20px', marginBottom:'20px' },
  ageBadge:      { display:'inline-block', background:'#dbeafe', color:'#1d4ed8', fontSize:'13px', fontWeight:'600', padding:'4px 12px', borderRadius:'6px' },
  ageTicks:      { display:'flex', justifyContent:'space-between', marginTop:'8px', padding:'0 2px' },
  ageReachCard:  { display:'flex', alignItems:'center', gap:'12px', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'12px 16px', marginTop:'16px' },
  budgetSummaryBar:     { display:'flex', alignItems:'center', border:'1.5px solid #e0e4ef', borderRadius:'10px', overflow:'hidden', background:'#fff', flexWrap:'wrap' },
  budgetSummaryItem:    { display:'flex', alignItems:'center', gap:'8px', flex:1, padding:'14px 18px' },
  budgetSummaryDivider: { width:'1px', height:'40px', background:'#e0e4ef', flexShrink:0 },
  // Step 2
  platformGrid:     { display:'flex', flexDirection:'column', gap:'10px' },
  platformCard:     { padding:'14px', borderRadius:'10px', border:'1.5px solid #e0e4ef', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px' },
  platformCardActive:{ background:'#f8fbff' },
  platIcon:  { width:'36px', height:'36px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#fff', flexShrink:0 },
  platInfo:  { flex:1, minWidth:0 }, platName: { fontSize:'13px', fontWeight:'600', color:'#1a1a2e' }, platDesc: { fontSize:'11px', color:'#8892b0' },
  platCheck: { width:'22px', height:'22px', borderRadius:'50%', border:'2px solid #d0d5e8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#fff', fontWeight:'700', flexShrink:0 },
  selectedInfo: { marginTop:'10px', fontSize:'12px', color:'#1b7a4a', fontWeight:'500', background:'#e6f9f0', padding:'8px 12px', borderRadius:'8px' },
  // Step 4
  contextBar:  { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px', padding:'10px 14px', background:'#f4f6fb', borderRadius:'10px', border:'0.5px solid #e0e4ef' },
  contextChip: { fontSize:'11px', fontWeight:'600', color:'#1A73E8', background:'#e8f0fe', padding:'3px 10px', borderRadius:'20px' },
  searchInput:  { width:'100%', padding:'10px 36px', borderRadius:'10px', border:'1.5px solid #e0e4ef', background:'#fff', fontSize:'13px', color:'#1a1a2e', fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  searchIcon:   { position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', pointerEvents:'none' },
  searchClear:  { position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#8892b0', fontSize:'13px', padding:'2px' },
  dropdown:     { position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'0.5px solid #e0e4ef', borderRadius:'10px', zIndex:10, maxHeight:'200px', overflowY:'auto', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' },
  dropItem:         { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 14px', cursor:'pointer', fontSize:'13px' },
  dropItemSelected: { color:'#1A73E8' },
  cityGrid:      { display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'10px' },
  cityChip:      { padding:'7px 14px', borderRadius:'20px', border:'1.5px solid #e0e4ef', background:'#fff', fontSize:'12px', color:'#8892b0', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontFamily:'inherit' },
  cityChipActive:{ border:'1.5px solid #1A73E8', background:'#e8f0fe', color:'#1A73E8', fontWeight:'600' },
  cityCheck:    { background:'#1A73E8', color:'#fff', width:'14px', height:'14px', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700' },
  divider:      { height:'0.5px', background:'#e0e4ef', margin:'18px 0' },
  radiusSection: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'start' },
  mapWrap:        { borderRadius:'10px', overflow:'hidden', border:'0.5px solid #e0e4ef' },
  radiusControls: { display:'flex', flexDirection:'column', gap:'14px' },
  toggleRow:      { display:'flex', gap:'8px' },
  toggleBtn:      { flex:1, padding:'7px', borderRadius:'8px', border:'0.5px solid #e0e4ef', background:'#fff', fontSize:'12px', color:'#8892b0', cursor:'pointer', fontFamily:'inherit' },
  toggleBtnActive:{ background:'#e8f0fe', borderColor:'#1A73E8', color:'#1A73E8', fontWeight:'500' },
  reachCard:     { background:'#f4f6fb', borderRadius:'8px', padding:'10px 12px' },
  analyzeBtn:    { width:'100%', padding:'13px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' },
  analyzeDisabled:{ width:'100%', padding:'13px', borderRadius:'10px', border:'none', background:'#c0c8da', color:'#fff', fontSize:'14px', fontWeight:'600', cursor:'not-allowed', fontFamily:'inherit' },
  spinner:       { width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' },
  reachResults:  { marginTop:'4px', marginBottom:'8px' },
  strategyTip:   { display:'flex', gap:'10px', alignItems:'flex-start', background:'#fffbeb', border:'1px solid #fbbf24', borderRadius:'10px', padding:'12px 14px', marginBottom:'16px' },
  summaryRowGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px' },
  summaryCardItem: { background:'#f4f6fb', borderRadius:'10px', padding:'12px', textAlign:'center', border:'0.5px solid #e0e4ef' },
  bestCityBadge:   { background:'#e8f0fe', border:'1px solid #93b8f4', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', color:'#1a1a2e', marginBottom:'14px', textAlign:'center' },
  cityCards:     { display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' },
  cityCard:      { background:'#f4f6fb', borderRadius:'12px', padding:'14px', border:'1px solid #e0e4ef' },
  cityCardBest:  { background:'#e8f0fe', border:'1.5px solid #1A73E8' },
  cityCardHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', flexWrap:'wrap', gap:'6px' },
  cityCardName:  { fontSize:'14px', fontWeight:'700', color:'#1a1a2e', display:'flex', alignItems:'center', gap:'8px' },
  bestTag:       { fontSize:'10px', fontWeight:'700', background:'#1A73E8', color:'#fff', padding:'2px 8px', borderRadius:'10px' },
  competitionBadge:{ fontSize:'10px', fontWeight:'600', padding:'3px 10px', borderRadius:'20px' },
  cityMetrics:   { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'10px' },
  metricItem:    { textAlign:'center', background:'#fff', borderRadius:'8px', padding:'8px 6px', border:'0.5px solid #e0e4ef' },
  metricVal:     { fontSize:'14px', fontWeight:'700', color:'#1a1a2e' },
  metricLabel:   { fontSize:'10px', color:'#8892b0', marginTop:'2px' },
  cityRecommendation: { fontSize:'11px', color:'#8892b0', lineHeight:'1.5', background:'#fff', borderRadius:'8px', padding:'8px 10px', border:'0.5px solid #e0e4ef' },
  reanalyzeBtn:  { background:'none', border:'1.5px solid #e0e4ef', color:'#8892b0', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontFamily:'inherit' },
  // Step 7
  reviewSection:    { background:'#f4f6fb', borderRadius:'10px', padding:'16px', marginBottom:'16px', border:'0.5px solid #e0e4ef' },
  reviewTitle:      { fontSize:'13px', fontWeight:'700', color:'#1a1a2e', marginBottom:'12px' },
  reviewRow:        { display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'0.5px solid #e0e4ef', gap:'12px', flexWrap:'wrap' },
  reviewLabel:      { fontSize:'12px', color:'#8892b0' },
  reviewVal:        { fontSize:'12px', color:'#1a1a2e', fontWeight:'500', textAlign:'right', maxWidth:'60%' },
  reviewPlatforms:  { display:'flex', flexDirection:'column', gap:'10px' },
  reviewPlatformItem:{ display:'flex', alignItems:'center', gap:'12px' },
  locationTag:      { fontSize:'11px', fontWeight:'500', color:'#1A73E8', background:'#e8f0fe', padding:'3px 10px', borderRadius:'20px' },
  launchBox:     { background:'#e8f0fe', borderRadius:'10px', padding:'16px', marginBottom:'20px', border:'0.5px solid #93b8f4' },
  launchBoxTitle:{ fontSize:'14px', fontWeight:'700', color:'#1a1a2e', marginBottom:'6px' },
  launchBoxDesc: { fontSize:'12px', color:'#8892b0', lineHeight:'1.6', margin:0 },
  error: { background:'#fff5f5', color:'#c62828', padding:'10px 14px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px', border:'0.5px solid #ffcdd2' },
}

export default CreateCampaign