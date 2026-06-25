import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

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
      { name: 'full_name',     label: 'Full Name',               type: 'text',   required: true  },
      { name: 'business_name', label: 'Business Name',           type: 'text',   required: true, extra: true  },
      { name: 'phone',         label: 'Phone Number',            type: 'tel',    required: true  },
      { name: 'email',         label: 'Email Address',           type: 'email',  required: false },
      { name: 'loan_amount',   label: 'Loan Amount Required (₹)',type: 'text',   required: true, extra: true  },
      { name: 'monthly_turnover', label: 'Monthly Business Turnover (₹)', type: 'text', required: true, extra: true },
      { name: 'business_type', label: 'Business Type',          type: 'select', required: true, extra: true,
        options: ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Other'] },
      { name: 'years_in_business', label: 'Years in Business',  type: 'select', required: true, extra: true,
        options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'] },
      { name: 'location',      label: 'City',                    type: 'text',   required: true  },
      { name: 'loan_purpose',  label: 'Purpose of Loan',         type: 'select', required: true, extra: true,
        options: ['Working Capital', 'Business Expansion', 'Equipment Purchase', 'Raw Material', 'Other'] },
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

  // ── Loading ──
  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
      <p style={{ color: '#8892b0', marginTop: '12px' }}>Loading form...</p>
    </div>
  )

  // ── Error ──
  if (error && !config) return (
    <div style={s.centered}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
      <p style={{ color: '#c62828' }}>{error}</p>
    </div>
  )

  const formConfig  = FORM_CONFIGS[config?.form_type] || FORM_CONFIGS.services
  const brandColor  = config?.brand_color || '#1A73E8'
  const companyName = config?.company_name || config?.campaign_name || 'AdNexus'

  return (
    <div style={s.page}>

      {/* ── Header: Company Branding ── */}
      <div style={{ ...s.header, background: brandColor }}>
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
      <div style={s.card}>
        <div style={s.formHeader}>
          <span style={s.formIcon}>{formConfig.icon}</span>
          <h1 style={s.formTitle}>{formConfig.title}</h1>
          <p style={s.formSubtitle}>Fill in your details and we'll get back to you shortly.</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.fields}>
          {formConfig.fields.map(field => (
            <div key={field.name} style={s.fieldGroup}>
              <label style={s.label}>
                {field.label}
                {field.required && <span style={{ color: '#c62828' }}> *</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  style={s.input}
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
                  style={{ ...s.input, height: '80px', resize: 'vertical' }}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  style={s.input}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ ...s.submitBtn, background: submitting ? '#93b8f4' : brandColor }}
        >
          {submitting ? '⏳ Submitting...' : 'Submit Enquiry →'}
        </button>

        <div style={s.poweredBy}>
          Powered by <strong>AdNexus</strong> ✓
        </div>
      </div>
    </div>
  )
}

const s = {
  page:       { minHeight: '100vh', background: '#f0f2f8', fontFamily: 'DM Sans, sans-serif', paddingBottom: '40px' },
  centered:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner:    { width: '32px', height: '32px', border: '3px solid #e0e4ef', borderTop: '3px solid #1A73E8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header:     { padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '16px', color: '#fff' },
  logo:       { width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' },
  logoPlaceholder: { width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: '#fff' },
  companyName:{ fontSize: '20px', fontWeight: '700' },
  tagline:    { fontSize: '13px', opacity: 0.85, marginTop: '2px' },
  card:       { maxWidth: '560px', margin: '32px auto', background: '#fff', borderRadius: '16px', border: '1px solid #e8eaf0', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  formHeader: { textAlign: 'center', marginBottom: '28px' },
  formIcon:   { fontSize: '40px' },
  formTitle:  { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '8px 0 4px' },
  formSubtitle:{ fontSize: '13px', color: '#8892b0' },
  fields:     { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '13px', fontWeight: '600', color: '#1a1a2e' },
  input:      { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0e4ef', fontSize: '13px', color: '#1a1a2e', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' },
  submitBtn:  { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  poweredBy:  { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' },
  error:      { background: '#fff5f5', color: '#c62828', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '0.5px solid #ffcdd2' },
}

export default PublicLeadForm