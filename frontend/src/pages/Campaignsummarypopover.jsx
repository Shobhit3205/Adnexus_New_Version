import React, { useState, useRef, useEffect } from 'react'

// ─── reuse the platform list from CreateCampaign ───────────────────────────
// Pass `platforms` as a prop, or import directly if co-located.

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

/**
 * CampaignSummaryPopover
 *
 * Drop-in replacement for the old `<CampaignSummary>` right-sidebar panel.
 * Renders a floating "Summary" pill button fixed to the bottom-right of the
 * viewport. Clicking it toggles a compact popover showing all campaign fields
 * and a progress bar. Clicking outside closes it.
 *
 * Props:
 *   formData          – same shape as CreateCampaign's formData state
 *   selectedPlatforms – array of platform ids (numbers)
 *   step              – current step number (1-7)
 *   selectedCities    – array of city objects { name, ... }
 *   platforms         – the platforms array from CreateCampaign
 *   totalSteps        – defaults to 7
 */
const CampaignSummaryPopover = ({
  formData,
  selectedPlatforms,
  step,
  selectedCities,
  platforms,
  totalSteps = 7,
}) => {
  const [open, setOpen] = useState(false)
  const popoverRef      = useRef(null)
  const buttonRef       = useRef(null)

  // close on outside click
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

  // close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  const platformNames = selectedPlatforms
    .map(id => platforms.find(p => p.id === id)?.name)
    .filter(Boolean)

  const progress = Math.round((step / totalSteps) * 100)

  const rows = [
    { type:'goal',     label:'Goal',        val: formData.goal,                                                                   empty:'Not selected' },
    { type:'industry', label:'Industry',     val: formData.industry,                                                               empty:'Not selected' },
    { type:'subcat',   label:'Sub category', val: formData.sub_category,                                                           empty:'Not selected' },
    { type:'platform', label:'Platforms',    val: platformNames.length > 0 ? platformNames.join(', ') : null,                     empty:'Not selected' },
    { type:'budget',   label:'Budget',       val: formData.budget ? `₹${parseInt(formData.budget).toLocaleString()}/day` : null,  empty:'Not set'      },
    { type:'location', label:'Location',     val: selectedCities.length > 0 ? selectedCities.map(c => c.name).join(', ') : null, empty:'Not set'      },
  ]

  // count how many rows are actually filled in
  const filledCount = rows.filter(r => r.val).length

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle campaign summary"
        aria-expanded={open}
        style={{
          position:       'fixed',
          bottom:         '28px',
          right:          '28px',
          zIndex:         1000,
          display:        'flex',
          alignItems:     'center',
          gap:            '8px',
          padding:        '10px 18px',
          background:     open ? '#1A73E8' : '#fff',
          color:          open ? '#fff'    : '#1a1a2e',
          border:         open ? '1.5px solid #1A73E8' : '1.5px solid #e0e4ef',
          borderRadius:   '40px',
          fontSize:       '13px',
          fontWeight:     '600',
          fontFamily:     'DM Sans, sans-serif',
          cursor:         'pointer',
          boxShadow:      '0 4px 16px rgba(26,115,232,0.18)',
          transition:     'background 0.15s, color 0.15s, border-color 0.15s',
          whiteSpace:     'nowrap',
        }}
      >
        {/* document icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={open ? '#fff' : '#4f6ef7'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>

        Summary

        {/* filled-fields badge */}
        <span style={{
          fontSize:       '11px',
          fontWeight:     '700',
          background:     open ? 'rgba(255,255,255,0.25)' : '#e8f0fe',
          color:          open ? '#fff' : '#1A73E8',
          padding:        '2px 7px',
          borderRadius:   '12px',
          lineHeight:     '1.5',
        }}>
          {step}/{totalSteps}
        </span>
      </button>

      {/* ── Popover panel ── */}
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Campaign summary"
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
            // subtle slide-up feel via transform (no animation needed for streaming)
            transformOrigin: 'bottom right',
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
              display:       'flex',
              alignItems:    'center',
              gap:           '10px',
              padding:       '7px 0',
              borderBottom:  i < rows.length - 1 ? '0.5px solid #f0f2f7' : 'none',
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
              <span style={{ fontSize:'11px', color:'#8892b0' }}>Step {step} of {totalSteps}</span>
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

export default CampaignSummaryPopover