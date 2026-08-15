import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

// ════════════════════════════════════════════════════
// COLOR HELPERS — derive the whole chrome from one brand color
// ════════════════════════════════════════════════════
const hexToRgba = (hex, alpha) => {
  let h = (hex || '#1A73E8').replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const num = parseInt(h, 16)
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const shadeColor = (hex, percent) => {
  let h = (hex || '#1A73E8').replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const num = parseInt(h, 16)
  let r = (num >> 16), g = (num >> 8 & 0x00FF), b = (num & 0x0000FF)
  r = Math.min(255, Math.max(0, r + Math.round(2.55 * percent)))
  g = Math.min(255, Math.max(0, g + Math.round(2.55 * percent)))
  b = Math.min(255, Math.max(0, b + Math.round(2.55 * percent)))
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`
}

// ════════════════════════════════════════════════════
// FORM FIELDS CONFIG
// Each form type has its own fields
// Adding new form type = just add here, nothing else
// ════════════════════════════════════════════════════
const FORM_CONFIGS = {
  working_capital: {
    title:  'Business Loan Enquiry',
    icon:   '🏦',
    fields: [
      { name: 'full_name',     label: 'Full Name',                type: 'text',  required: true  },
      { name: 'business_name', label: 'Business Name',            type: 'text',  required: true, extra: true },
      { name: 'phone',         label: 'Phone Number',             type: 'tel',   required: true  },
      { name: 'email',         label: 'Email Address',            type: 'email', required: false },
      { name: 'loan_amount',   label: 'Loan Amount Required (₹)', type: 'text',  required: true, extra: true },
      { name: 'location',      label: 'City',                     type: 'text',  required: true  },
    ],
  },

  personal_loan: {
    title:  'Personal Loan Enquiry',
    icon:   '💳',
    fields: [
      { name: 'full_name',        label: 'Full Name',              type: 'text',   required: true  },
      { name: 'phone',            label: 'Phone Number',           type: 'tel',    required: true  },
      { name: 'email',            label: 'Email Address',          type: 'email',  required: false },
      { name: 'loan_amount',      label: 'Loan Amount Required (₹)', type: 'text', required: true, extra: true },
      { name: 'loan_purpose',     label: 'Loan Purpose',           type: 'select', required: true, extra: true,
        options: ['Medical', 'Wedding', 'Travel', 'Home Renovation', 'Education', 'Other'] },
      { name: 'monthly_income',   label: 'Monthly Income (₹)',     type: 'text',   required: true, extra: true },
      { name: 'employment_type',  label: 'Employment Type',        type: 'select', required: true, extra: true,
        options: ['Salaried', 'Self Employed', 'Business Owner'] },
      { name: 'location',         label: 'City',                   type: 'text',   required: true  },
    ],
  },

  property_sale: {
    title:  'Property Enquiry',
    icon:   '🏠',
    fields: [
      { name: 'full_name',    label: 'Full Name',        type: 'text',   required: true  },
      { name: 'phone',        label: 'Phone Number',     type: 'tel',    required: true  },
      { name: 'email',        label: 'Email Address',    type: 'email',  required: false },
      { name: 'budget_range', label: 'Budget Range',     type: 'select', required: true,
        options: ['Below ₹25 Lakh', '₹25L - ₹50L', '₹50L - ₹1 Cr', '₹1Cr - ₹2Cr', 'Above ₹2Cr'] },
      { name: 'location',     label: 'Preferred Location', type: 'text', required: true  },
      { name: 'purpose',      label: 'Purpose',          type: 'select', required: true, extra: true,
        options: ['Self Use', 'Investment', 'Rental Income'] },
      { name: 'timeline',     label: 'Timeline',         type: 'select', required: true,
        options: ['Immediate', 'Within 3 Months', 'Within 6 Months', 'Just Exploring'] },
      { name: 'requirement',  label: 'Any Specific Requirement', type: 'textarea', required: false },
    ],
  },

  product_sale: {
    title:  'Product Enquiry',
    icon:   '🛍️',
    fields: [
      { name: 'full_name',    label: 'Full Name',           type: 'text',     required: true  },
      { name: 'phone',        label: 'Phone Number',        type: 'tel',      required: true  },
      { name: 'email',        label: 'Email Address',       type: 'email',    required: false },
      { name: 'product_interest', label: 'Product Interest', type: 'text',   required: false, extra: true },
      { name: 'budget_range', label: 'Budget Range',        type: 'select',   required: true,
        options: ['Below ₹5,000', '₹5,000 - ₹25,000', '₹25,000 - ₹1 Lakh', 'Above ₹1 Lakh'] },
      { name: 'location',     label: 'City',                type: 'text',     required: true  },
      { name: 'timeline',     label: 'When do you want to buy?', type: 'select', required: true,
        options: ['Immediate', 'Within 1 Month', 'Just Exploring'] },
      { name: 'requirement',  label: 'Any Specific Requirement', type: 'textarea', required: false },
    ],
  },

  services: {
    title:  'Service Enquiry',
    icon:   '🔧',
    fields: [
      { name: 'full_name',    label: 'Full Name',           type: 'text',     required: true  },
      { name: 'phone',        label: 'Phone Number',        type: 'tel',      required: true  },
      { name: 'email',        label: 'Email Address',       type: 'email',    required: false },
      { name: 'service_interest', label: 'Service Interested In', type: 'text', required: false, extra: true },
      { name: 'budget_range', label: 'Budget Range',        type: 'select',   required: true,
        options: ['Below ₹10,000', '₹10,000 - ₹50,000', '₹50,000 - ₹1 Lakh', 'Above ₹1 Lakh'] },
      { name: 'timeline',     label: 'Timeline',            type: 'select',   required: true,
        options: ['Immediate', 'Within 1 Month', 'Within 3 Months', 'Just Exploring'] },
      { name: 'location',     label: 'City',                type: 'text',     required: true  },
      { name: 'requirement',  label: 'Any Specific Requirement', type: 'textarea', required: false },
    ],
  },

  manufacturing: {
    title:  'Manufacturing / Supply Enquiry',
    icon:   '🏭',
    fields: [
      { name: 'full_name',    label: 'Full Name',           type: 'text',   required: true  },
      { name: 'company_name', label: 'Company Name',        type: 'text',   required: true, extra: true },
      { name: 'phone',        label: 'Phone Number',        type: 'tel',    required: true  },
      { name: 'email',        label: 'Email Address',       type: 'email',  required: false },
      { name: 'product_required', label: 'Product Required', type: 'text', required: true, extra: true },
      { name: 'quantity',     label: 'Quantity Needed',     type: 'text',   required: true, extra: true },
      { name: 'budget_range', label: 'Budget Range',        type: 'select', required: true,
        options: ['Below ₹1 Lakh', '₹1L - ₹5L', '₹5L - ₹25L', 'Above ₹25L'] },
      { name: 'location',     label: 'City',                type: 'text',   required: true  },
      { name: 'timeline',     label: 'Delivery Timeline',   type: 'select', required: true,
        options: ['Immediate', 'Within 1 Month', 'Within 3 Months'] },
      { name: 'requirement',  label: 'Any Specific Requirement', type: 'textarea', required: false },
    ],
  },

  appointment: {
    title:  'Book Appointment',
    icon:   '📅',
    fields: [
      { name: 'full_name',    label: 'Full Name',           type: 'text',   required: true  },
      { name: 'phone',        label: 'Phone Number',        type: 'tel',    required: true  },
      { name: 'email',        label: 'Email Address',       type: 'email',  required: false },
      { name: 'service_needed', label: 'Service Needed',   type: 'text',   required: false, extra: true },
      { name: 'preferred_date', label: 'Preferred Date',   type: 'date',   required: true, extra: true },
      { name: 'preferred_time', label: 'Preferred Time',   type: 'select', required: true, extra: true,
        options: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] },
      { name: 'location',     label: 'City',                type: 'text',   required: true  },
      { name: 'requirement',  label: 'Reason / Notes',      type: 'textarea', required: false },
    ],
  },

  admission: {
    title:  'Admission Enquiry',
    icon:   '🎓',
    fields: [
      { name: 'student_name', label: 'Student Name',        type: 'text',   required: true, extra: true },
      { name: 'parent_name',  label: 'Parent / Guardian Name', type: 'text', required: true, extra: true },
      { name: 'phone',        label: 'Phone Number',        type: 'tel',    required: true  },
      { name: 'email',        label: 'Email Address',       type: 'email',  required: false },
      { name: 'course_interest', label: 'Course Interested In', type: 'text', required: true, extra: true },
      { name: 'qualification', label: 'Current Qualification', type: 'select', required: true, extra: true,
        options: ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Other'] },
      { name: 'location',     label: 'City',                type: 'text',   required: true  },
      { name: 'academic_year', label: 'Academic Year',      type: 'select', required: true, extra: true,
        options: ['2025-26', '2026-27', '2027-28'] },
      { name: 'requirement',  label: 'Any Specific Requirement', type: 'textarea', required: false },
    ],
  },
}

// ════════════════════════════════════════════════════
// FIELD PAIRING — which fields sit side-by-side per form type
// Only the FIRST name in each pair needs to be matched in render;
// its partner is pulled in automatically. Unlisted fields render full-width.
// ════════════════════════════════════════════════════
const FIELD_PAIRS = {
  working_capital: [['phone', 'email'], ['loan_amount', 'location']],
  personal_loan:   [['phone', 'email'], ['loan_amount', 'monthly_income'], ['loan_purpose', 'employment_type']],
  property_sale:   [['phone', 'email'], ['budget_range', 'location'], ['purpose', 'timeline']],
  product_sale:    [['phone', 'email'], ['product_interest', 'budget_range'], ['location', 'timeline']],
  services:        [['phone', 'email'], ['service_interest', 'budget_range'], ['timeline', 'location']],
  manufacturing:   [['full_name', 'company_name'], ['phone', 'email'], ['product_required', 'quantity'], ['budget_range', 'location']],
  appointment:     [['phone', 'email'], ['preferred_date', 'preferred_time'], ['service_needed', 'location']],
  admission:       [['student_name', 'parent_name'], ['phone', 'email'], ['course_interest', 'qualification'], ['location', 'academic_year']],
}

// ════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════
const PublicLeadForm = () => {
  const { campaignId }              = useParams()
  const navigate                    = useNavigate()
  const [searchParams]              = useSearchParams()
  const platform                    = searchParams.get('platform') || ''
  const utm_source                  = searchParams.get('utm_source') || ''

  const [config, setConfig]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [formData, setFormData]     = useState({})

  // Fetch form config on load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/public/form/${campaignId}`)
        setConfig(res.data)
      } catch (err) {
        setError('Form not found!')
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [campaignId])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    const formConfig = FORM_CONFIGS[config?.form_type]
    if (!formConfig) return

    // Validate required fields
    const missing = formConfig.fields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label)

    if (missing.length > 0) {
      setError(`Please fill: ${missing.join(', ')}`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Separate common fields from extra fields
      const extra_data = {}
      formConfig.fields
        .filter(f => f.extra)
        .forEach(f => { if (formData[f.name]) extra_data[f.name] = formData[f.name] })

      await axios.post(`${API_BASE}/public/submit/${campaignId}`, {
        full_name:    formData.full_name || formData.student_name || '',
        phone:        formData.phone        || '',
        email:        formData.email        || '',
        location:     formData.location     || '',
        budget_range: formData.budget_range || '',
        timeline:     formData.timeline     || '',
        requirement:  formData.requirement  || '',
        extra_data,
        platform,
        utm_source,
      })

      // Go to thank you page
      navigate('/thank-you', {
        state: {
          company_name: config.company_name,
          brand_color:  config.brand_color,
          form_type:    config.form_type,
        }
      })
    } catch (err) {
      setError('Something went wrong. Please try again!')
    } finally {
      setSubmitting(false)
    }
  }

  const brandColor  = config?.brand_color || '#1A73E8'

  // ── Loading ──
  if (loading) return (
    <div style={s.centered}>
      <style>{GLOBAL_CSS}</style>
      <div className="adnx-spinner" />
      <p style={{ color: '#8892b0', marginTop: '14px', fontSize: '13px', letterSpacing: '0.02em' }}>Loading form...</p>
    </div>
  )

  // ── Error ──
  if (error && !config) return (
    <div style={s.centered}>
      <div style={{ fontSize: '44px', marginBottom: '14px' }}>❌</div>
      <p style={{ color: '#c62828', fontSize: '14px' }}>{error}</p>
    </div>
  )

  const formConfig  = FORM_CONFIGS[config?.form_type] || FORM_CONFIGS.services
  const companyName = config?.company_name || config?.campaign_name || 'AdNexus'
  const brandDark    = shadeColor(brandColor, -22)
  const brandSoft     = hexToRgba(brandColor, 0.08)
  const brandGlow      = hexToRgba(brandColor, 0.16)
  const brandShadow     = hexToRgba(brandColor, 0.35)

  // Renders a single field (label + input/select/textarea)
  const renderField = (field) => (
    <div key={field.name} style={s.fieldGroup}>
      <label style={s.label}>
        {field.label}
        {field.required && <span style={{ color: '#e0464f' }}> *</span>}
      </label>

      {field.type === 'select' ? (
        <select
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          className="adnx-input adnx-select"
          style={{ ...s.input, '--brand-ring': brandGlow, '--brand-border': brandColor }}
        >
          <option value="">Select...</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          className="adnx-input"
          style={{ ...s.input, '--brand-ring': brandGlow, '--brand-border': brandColor, height: '86px', resize: 'vertical' }}
        />
      ) : (
        <input
          type={field.type}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          className="adnx-input"
          style={{ ...s.input, '--brand-ring': brandGlow, '--brand-border': brandColor }}
        />
      )}
    </div>
  )

  // Builds the field rows — paired fields render side-by-side per FIELD_PAIRS,
  // everything else falls back to full-width single column automatically.
  const renderFieldRows = () => {
    const pairs = FIELD_PAIRS[config?.form_type] || []
    const rendered = new Set()
    const rows = []

    formConfig.fields.forEach(field => {
      if (rendered.has(field.name)) return

      const pair = pairs.find(p => p[0] === field.name)
      if (pair) {
        const partner = formConfig.fields.find(f => f.name === pair[1])
        rendered.add(pair[0])
        if (partner) rendered.add(pair[1])
        rows.push(
          <div key={field.name} style={s.pairRow}>
            {renderField(field)}
            {partner && renderField(partner)}
          </div>
        )
      } else {
        rendered.add(field.name)
        rows.push(<div key={field.name}>{renderField(field)}</div>)
      }
    })

    return rows
  }

  return (
    <div
      style={{
        ...s.page,
        background: `radial-gradient(60% 50% at 12% 0%, ${brandSoft}, transparent 60%),
                      radial-gradient(50% 40% at 100% 10%, ${hexToRgba(brandColor, 0.05)}, transparent 55%),
                      #f3f5fa`,
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {/* ── Header: Company Branding ── */}
      <div
        style={{
          ...s.header,
          background: `radial-gradient(120% 160% at 100% 0%, rgba(255,255,255,0.16), transparent 55%),
                        linear-gradient(135deg, ${brandColor} 0%, ${brandDark} 100%)`,
        }}
      >
        {config?.company_logo
          ? <img src={config.company_logo} alt="logo" style={s.logo} />
          : <div style={s.logoPlaceholder}>{companyName[0]}</div>
        }
        <div>
          <div style={s.companyName}>{companyName}</div>
          {config?.tagline && <div style={s.tagline}>{config.tagline}</div>}
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="adnx-card" style={s.card}>
        <div style={s.formHeader}>
          <span style={{ ...s.formIconWrap, background: brandSoft }}>
            <span style={s.formIcon}>{formConfig.icon}</span>
          </span>
          <h1 style={s.formTitle}>{formConfig.title}</h1>
          <p style={s.formSubtitle}>Fill in your details and we'll get back to you shortly.</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.fields}>
          {renderFieldRows()}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="adnx-submit-btn"
          style={{
            ...s.submitBtn,
            background: submitting ? '#a9c3ef' : `linear-gradient(135deg, ${brandColor} 0%, ${brandDark} 100%)`,
            boxShadow: submitting ? 'none' : `0 12px 24px -10px ${brandShadow}`,
            cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? '⏳ Submitting...' : 'Submit Enquiry →'}
        </button>

        <div style={s.trustLine}>
          🔒 Your information is safe with us
        </div>

        <div style={s.poweredBy}>
          Powered by <strong style={{ color: '#5b6480' }}>AdNexus</strong> ✓
        </div>
      </div>
    </div>
  )
}

// Hover / focus / animation rules that plain inline styles can't express.
// Brand-dependent colors are passed in as CSS custom properties (--brand-ring / --brand-border).
const GLOBAL_CSS = `
  @keyframes adnx-spin { to { transform: rotate(360deg); } }
  .adnx-spinner {
    width: 34px; height: 34px; border-radius: 50%;
    border: 3px solid #e4e7f0; border-top-color: #1A73E8;
    animation: adnx-spin 0.7s linear infinite;
  }
  .adnx-card { transition: box-shadow 0.25s ease; }
  .adnx-input {
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .adnx-input:hover { border-color: #c7cce0; }
  .adnx-input:focus {
    outline: none;
    background: #fff;
    border-color: var(--brand-border, #1A73E8);
    box-shadow: 0 0 0 4px var(--brand-ring, rgba(26,115,232,0.16));
  }
  .adnx-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%238892b0' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px !important;
    cursor: pointer;
  }
  .adnx-submit-btn { transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease; }
  .adnx-submit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.03); }
  .adnx-submit-btn:active:not(:disabled) { transform: translateY(0); }
`

const s = {
  page:       { minHeight: '100vh', fontFamily: '"DM Sans", sans-serif', paddingBottom: '48px' },
  centered:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f5fa' },
  header:     { padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '16px', color: '#fff' },
  logo:       { width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.35)' },
  logoPlaceholder: { width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: '#fff' },
  companyName:{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.01em' },
  tagline:    { fontSize: '13px', opacity: 0.85, marginTop: '2px' },
  card:       { maxWidth: '560px', margin: '36px auto', background: '#fff', borderRadius: '20px', border: '1px solid rgba(15,23,42,0.06)', padding: '36px', boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 24px 48px -20px rgba(15,23,42,0.18)' },
  formHeader: { textAlign: 'center', marginBottom: '28px' },
  formIconWrap:{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px' },
  formIcon:   { fontSize: '28px' },
  formTitle:  { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '14px 0 4px', letterSpacing: '-0.01em' },
  formSubtitle:{ fontSize: '13px', color: '#8892b0' },
  fields:     { display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '26px' },
  pairRow:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label:      { fontSize: '13px', fontWeight: '600', color: '#1a1a2e' },
  input:      { padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e4e7f0', background: '#fbfbfe', fontSize: '13.5px', color: '#1a1a2e', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  submitBtn:  { width: '100%', padding: '15px', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '15px', fontWeight: '700', letterSpacing: '0.01em', fontFamily: 'inherit' },
  trustLine:  { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  poweredBy:  { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #eef0f6' },
  error:      { background: '#fff5f5', color: '#c62828', padding: '11px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '18px', border: '1px solid #ffd4d6', borderLeft: '3px solid #e0464f' },
}

export default PublicLeadForm