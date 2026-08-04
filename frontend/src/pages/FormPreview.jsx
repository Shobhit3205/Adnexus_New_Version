import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

// ════════════════════════════════════════════════════
// FORM CONFIGS — same as PublicLeadForm
// ════════════════════════════════════════════════════
const FORM_CONFIGS = {
  working_capital: {
    title: 'Business Loan Enquiry', icon: '🏦',
    fields: [
      { name: 'full_name',        label: 'Full Name',                    type: 'text'   },
      { name: 'business_name',    label: 'Business Name',                type: 'text'   },
      { name: 'phone',            label: 'Phone Number',                 type: 'tel'    },
      { name: 'email',            label: 'Email Address',                type: 'email'  },
      { name: 'loan_amount',      label: 'Loan Amount Required (₹)',     type: 'text'   },
      { name: 'monthly_turnover', label: 'Monthly Business Turnover (₹)', type: 'text' },
      { name: 'business_type',    label: 'Business Type',                type: 'select',
        options: ['Proprietorship', 'Partnership', 'Private Limited', 'LLP'] },
      { name: 'years_in_business',label: 'Years in Business',            type: 'select',
        options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'] },
      { name: 'location',         label: 'City',                         type: 'text'   },
      { name: 'loan_purpose',     label: 'Purpose of Loan',              type: 'select',
        options: ['Working Capital', 'Business Expansion', 'Equipment Purchase', 'Raw Material', 'Other'] },
    ],
  },
  personal_loan: {
    title: 'Personal Loan Enquiry', icon: '💳',
    fields: [
      { name: 'full_name',       label: 'Full Name',               type: 'text'   },
      { name: 'phone',           label: 'Phone Number',            type: 'tel'    },
      { name: 'email',           label: 'Email Address',           type: 'email'  },
      { name: 'loan_amount',     label: 'Loan Amount Required (₹)', type: 'text' },
      { name: 'loan_purpose',    label: 'Loan Purpose',            type: 'select',
        options: ['Medical', 'Wedding', 'Travel', 'Home Renovation', 'Education', 'Other'] },
      { name: 'monthly_income',  label: 'Monthly Income (₹)',      type: 'text'   },
      { name: 'employment_type', label: 'Employment Type',         type: 'select',
        options: ['Salaried', 'Self Employed', 'Business Owner'] },
      { name: 'location',        label: 'City',                    type: 'text'   },
    ],
  },
  property_sale: {
    title: 'Property Enquiry', icon: '🏠',
    fields: [
      { name: 'full_name',    label: 'Full Name',              type: 'text'  },
      { name: 'phone',        label: 'Phone Number',           type: 'tel'   },
      { name: 'email',        label: 'Email Address',          type: 'email' },
      { name: 'budget_range', label: 'Budget Range',           type: 'select',
        options: ['Below ₹25 Lakh', '₹25L - ₹50L', '₹50L - ₹1 Cr', '₹1Cr - ₹2Cr', 'Above ₹2Cr'] },
      { name: 'location',     label: 'Preferred Location',     type: 'text'  },
      { name: 'purpose',      label: 'Purpose',                type: 'select',
        options: ['Self Use', 'Investment', 'Rental Income'] },
      { name: 'timeline',     label: 'Timeline',               type: 'select',
        options: ['Immediate', 'Within 3 Months', 'Within 6 Months', 'Just Exploring'] },
      { name: 'requirement',  label: 'Any Specific Requirement', type: 'textarea' },
    ],
  },
  product_sale: {
    title: 'Product Enquiry', icon: '🛍️',
    fields: [
      { name: 'full_name',       label: 'Full Name',              type: 'text'  },
      { name: 'phone',           label: 'Phone Number',           type: 'tel'   },
      { name: 'email',           label: 'Email Address',          type: 'email' },
      { name: 'product_interest',label: 'Product Interest',       type: 'text'  },
      { name: 'budget_range',    label: 'Budget Range',           type: 'select',
        options: ['Below ₹5,000', '₹5,000 - ₹25,000', '₹25,000 - ₹1 Lakh', 'Above ₹1 Lakh'] },
      { name: 'location',        label: 'City',                   type: 'text'  },
      { name: 'timeline',        label: 'When to buy?',           type: 'select',
        options: ['Immediate', 'Within 1 Month', 'Just Exploring'] },
      { name: 'requirement',     label: 'Any Requirement',        type: 'textarea' },
    ],
  },
  services: {
    title: 'Service Enquiry', icon: '🔧',
    fields: [
      { name: 'full_name',       label: 'Full Name',              type: 'text'  },
      { name: 'phone',           label: 'Phone Number',           type: 'tel'   },
      { name: 'email',           label: 'Email Address',          type: 'email' },
      { name: 'service_interest',label: 'Service Interested In',  type: 'text'  },
      { name: 'budget_range',    label: 'Budget Range',           type: 'select',
        options: ['Below ₹10,000', '₹10,000 - ₹50,000', '₹50,000 - ₹1 Lakh', 'Above ₹1 Lakh'] },
      { name: 'timeline',        label: 'Timeline',               type: 'select',
        options: ['Immediate', 'Within 1 Month', 'Within 3 Months', 'Just Exploring'] },
      { name: 'location',        label: 'City',                   type: 'text'  },
      { name: 'requirement',     label: 'Any Requirement',        type: 'textarea' },
    ],
  },
  manufacturing: {
    title: 'Manufacturing / Supply Enquiry', icon: '🏭',
    fields: [
      { name: 'full_name',       label: 'Full Name',              type: 'text'  },
      { name: 'company_name',    label: 'Company Name',           type: 'text'  },
      { name: 'phone',           label: 'Phone Number',           type: 'tel'   },
      { name: 'email',           label: 'Email Address',          type: 'email' },
      { name: 'product_required',label: 'Product Required',       type: 'text'  },
      { name: 'quantity',        label: 'Quantity Needed',        type: 'text'  },
      { name: 'budget_range',    label: 'Budget Range',           type: 'select',
        options: ['Below ₹1 Lakh', '₹1L - ₹5L', '₹5L - ₹25L', 'Above ₹25L'] },
      { name: 'location',        label: 'City',                   type: 'text'  },
      { name: 'timeline',        label: 'Delivery Timeline',      type: 'select',
        options: ['Immediate', 'Within 1 Month', 'Within 3 Months'] },
      { name: 'requirement',     label: 'Any Requirement',        type: 'textarea' },
    ],
  },
  appointment: {
    title: 'Book Appointment', icon: '📅',
    fields: [
      { name: 'full_name',      label: 'Full Name',         type: 'text'  },
      { name: 'phone',          label: 'Phone Number',      type: 'tel'   },
      { name: 'email',          label: 'Email Address',     type: 'email' },
      { name: 'service_needed', label: 'Service Needed',    type: 'text'  },
      { name: 'preferred_date', label: 'Preferred Date',    type: 'date'  },
      { name: 'preferred_time', label: 'Preferred Time',    type: 'select',
        options: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'] },
      { name: 'location',       label: 'City',              type: 'text'  },
      { name: 'requirement',    label: 'Reason / Notes',    type: 'textarea' },
    ],
  },
  admission: {
    title: 'Admission Enquiry', icon: '🎓',
    fields: [
      { name: 'student_name',   label: 'Student Name',           type: 'text'  },
      { name: 'parent_name',    label: 'Parent / Guardian Name', type: 'text'  },
      { name: 'phone',          label: 'Phone Number',           type: 'tel'   },
      { name: 'email',          label: 'Email Address',          type: 'email' },
      { name: 'course_interest',label: 'Course Interested In',   type: 'text'  },
      { name: 'qualification',  label: 'Current Qualification',  type: 'select',
        options: ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Other'] },
      { name: 'location',       label: 'City',                   type: 'text'  },
      { name: 'academic_year',  label: 'Academic Year',          type: 'select',
        options: ['2025-26', '2026-27', '2027-28'] },
      { name: 'requirement',    label: 'Any Requirement',        type: 'textarea' },
    ],
  },
}

const FORM_TYPE_MAP = {
  'Business Loan': 'working_capital', 'Working Capital Loan': 'working_capital',
  'Machinery Loan': 'working_capital', 'Invoice Finance': 'working_capital',
  'Trade Finance': 'working_capital', 'Personal Loan': 'personal_loan',
  'Home Loan': 'personal_loan', 'Gold Loan': 'personal_loan',
  'Vehicle Loan': 'personal_loan', 'Education Loan': 'personal_loan',
  'Residential Property': 'property_sale', 'Commercial Property': 'property_sale',
  'Villa / Plots': 'property_sale', 'Affordable Housing': 'property_sale',
  'Luxury Housing': 'property_sale', 'Co-working Space': 'property_sale',
  'Raw Material Supply': 'manufacturing', 'Industrial Goods': 'manufacturing',
  'Custom Furniture': 'manufacturing', 'Jewellery': 'manufacturing',
  'Packaging Material': 'manufacturing', 'Chemical Supply': 'manufacturing',
  'Pharmaceutical': 'manufacturing', 'Medical Equipment': 'manufacturing',
  'Farm Equipment': 'manufacturing', 'Agro Processing': 'manufacturing',
  'Food Processing': 'manufacturing', 'Wholesale Trading': 'product_sale',
  'Import / Export': 'product_sale', 'FMCG Distribution': 'product_sale',
  'Retail Distribution': 'product_sale', 'E-commerce': 'product_sale',
  'Fashion / Clothing': 'product_sale', 'Electronics': 'product_sale',
  'Home Decor': 'product_sale', 'Grocery / FMCG': 'product_sale',
  'Luxury Goods': 'product_sale', 'Sports / Fitness': 'product_sale',
  'Restaurant / Cafe': 'product_sale', 'Cloud Kitchen': 'product_sale',
  'Food Franchise': 'product_sale', 'Catering Services': 'services',
  'SaaS Product': 'services', 'IT Infrastructure': 'services',
  'Digital Agency': 'services', 'Product Development': 'services',
  'Cybersecurity': 'services', 'Cloud Services': 'services',
  'Courier Services': 'services', 'Fleet Management': 'services',
  'Warehouse Services': 'services', 'Cold Chain': 'services',
  'Last Mile Delivery': 'services', 'Irrigation Services': 'services',
  'Travel Agency': 'services', 'Event Management': 'services',
  'Adventure Tourism': 'services', 'Wedding Planning': 'appointment',
  'Hotel / Resort': 'appointment', 'Hospital / Clinic': 'appointment',
  'Dental Care': 'appointment', 'Eye Care': 'appointment',
  'Ayurveda / Wellness': 'appointment', 'Diagnostics / Lab': 'appointment',
  'School / College': 'admission', 'Coaching Center': 'admission',
  'Study Abroad': 'admission', 'Skill Development': 'admission',
  'Online Courses': 'admission', 'Vocational Training': 'admission',
  'Organic Products': 'product_sale', 'Seeds / Fertilizers': 'product_sale',
}

const INDUSTRY_DEFAULTS = {
  'Financial Services': 'working_capital',
  'Real Estate & Construction': 'property_sale',
  'Manufacturing': 'manufacturing',
  'Trading & Distribution': 'product_sale',
  'IT & Technology': 'services',
  'Healthcare & Pharma': 'appointment',
  'Education & Edtech': 'admission',
  'Retail': 'product_sale',
  'Food & Beverage': 'product_sale',
  'Logistics & Transport': 'services',
  'Agriculture & Agro-Processing': 'manufacturing',
  'Hospitality & Tourism': 'services',
}

const getFormType = (subCategory, industry) => {
  if (subCategory && FORM_TYPE_MAP[subCategory]) return FORM_TYPE_MAP[subCategory]
  return INDUSTRY_DEFAULTS[industry] || 'services'
}

// ════════════════════════════════════════════════════
// FORM PREVIEW COMPONENT
// Used inside CreateCampaign as Step 5
// Props passed from CreateCampaign
// ════════════════════════════════════════════════════
const FormPreview = ({ campaignData, onNext, onBack, campaignId }) => {
  const [branding, setBranding] = useState({
    company_name: '',
    company_logo: '',
    brand_color:  '#1A73E8',
    tagline:      '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const formType   = getFormType(campaignData?.sub_category, campaignData?.industry)
  const formConfig = FORM_CONFIGS[formType] || FORM_CONFIGS.services
  const brandColor = branding.brand_color || '#1A73E8'

  const handleBranding = (e) => {
    setBranding(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!campaignId) { onNext(); return }
    setSaving(true)
    setError('')
    try {
      await axios.post(`${API_BASE}/public/form/${campaignId}/setup`, {
        campaign_id:  campaignId,
        company_name: branding.company_name,
        company_logo: branding.company_logo,
        brand_color:  branding.brand_color,
        tagline:      branding.tagline,
      })
      setSaved(true)
      setTimeout(() => onNext(), 800)
    } catch (err) {
      setError('Could not save branding. Please try again!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.wrapper}>

      {/* ── Left: Live Form Preview ── */}
      <div style={s.previewSide}>
        <div style={s.previewLabel}>👁️ Customer will see this form</div>
        <div style={s.previewCard}>

          {/* Branding Header */}
          <div style={{ ...s.previewHeader, background: brandColor }}>
            {branding.company_logo
              ? <img src={branding.company_logo} alt="logo" style={s.logo} />
              : <div style={s.logoPlaceholder}>
                  {branding.company_name ? branding.company_name[0].toUpperCase() : 'A'}
                </div>
            }
            <div>
              <div style={s.previewCompany}>
                {branding.company_name || 'Your Company Name'}
              </div>
              {branding.tagline && (
                <div style={s.previewTagline}>{branding.tagline}</div>
              )}
            </div>
          </div>

          {/* Form Fields Preview */}
          <div style={s.previewBody}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '28px' }}>{formConfig.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginTop: '6px' }}>
                {formConfig.title}
              </div>
              <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '4px' }}>
                Fill in your details and we'll get back to you shortly.
              </div>
            </div>

            {formConfig.fields.map(field => (
              <div key={field.name} style={s.previewField}>
                <div style={s.previewFieldLabel}>{field.label}</div>
                <div style={s.previewFieldInput}>
                  {field.type === 'textarea'
                    ? <div style={{ color: '#c0c8da', fontSize: '12px' }}>Enter text...</div>
                    : field.type === 'select'
                    ? <div style={{ color: '#c0c8da', fontSize: '12px' }}>Select option ▾</div>
                    : <div style={{ color: '#c0c8da', fontSize: '12px' }}>Enter {field.label.toLowerCase()}...</div>
                  }
                </div>
              </div>
            ))}

            <div style={{ ...s.previewSubmit, background: brandColor }}>
              Submit Enquiry →
            </div>

            <div style={s.previewPowered}>
              Powered by <strong>AdNexus</strong> ✓
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Branding Setup ── */}
      <div style={s.brandingSide}>
        <div style={s.brandingLabel}>🎨 Setup Your Branding</div>
        <p style={s.brandingHint}>
          This form will be shown to your customers when they click your ad.
          Add your branding so it looks like your own form.
        </p>

        {/* Form Type Badge */}
        <div style={s.formTypeBadge}>
          <span style={{ fontSize: '20px' }}>{formConfig.icon}</span>
          <div>
            <div style={{ fontSize: '12px', color: '#8892b0' }}>Auto-detected form type</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>
              {formConfig.title}
            </div>
          </div>
        </div>

        {/* Branding Fields */}
        <div style={s.brandingFields}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Company Name</label>
            <input
              style={s.input}
              type="text"
              name="company_name"
              placeholder="e.g. XYZ Finance Pvt Ltd"
              value={branding.company_name}
              onChange={handleBranding}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Company Logo URL <span style={s.optional}>(optional)</span></label>
            <input
              style={s.input}
              type="text"
              name="company_logo"
              placeholder="https://yourcompany.com/logo.png"
              value={branding.company_logo}
              onChange={handleBranding}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Brand Color</label>
            <div style={s.colorRow}>
              <input
                type="color"
                name="brand_color"
                value={branding.brand_color}
                onChange={handleBranding}
                style={s.colorPicker}
              />
              <input
                style={{ ...s.input, flex: 1 }}
                type="text"
                name="brand_color"
                value={branding.brand_color}
                onChange={handleBranding}
                placeholder="#1A73E8"
              />
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Tagline <span style={s.optional}>(optional)</span></label>
            <input
              style={s.input}
              type="text"
              name="tagline"
              placeholder="e.g. Trusted by 10,000+ businesses"
              value={branding.tagline}
              onChange={handleBranding}
            />
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {saved && (
          <div style={s.success}>
            ✅ Branding saved! Moving to next step...
          </div>
        )}

        {/* Form URL Preview */}
        {campaignId && (
          <div style={s.urlBox}>
            <div style={{ fontSize: '11px', color: '#8892b0', marginBottom: '4px' }}>
              Your form link (share in ads):
            </div>
            <div style={s.urlText}>
              {window.location.origin}/lead/{campaignId}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={s.navRow}>
          <button style={s.backBtn} onClick={onBack}>
            ← Back
          </button>
          <button
            style={{ ...s.nextBtn, background: saving ? '#93b8f4' : '#1A73E8' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : 'Save & Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrapper:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' },
  previewSide:  { display: 'flex', flexDirection: 'column', gap: '10px' },
  previewLabel: { fontSize: '12px', fontWeight: '700', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  previewCard:  { borderRadius: '14px', border: '1px solid #e8eaf0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  previewHeader:{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
  logo:         { width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' },
  logoPlaceholder: { width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#fff' },
  previewCompany:{ fontSize: '15px', fontWeight: '700', color: '#fff' },
  previewTagline:{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' },
  previewBody:  { background: '#fff', padding: '20px' },
  previewField: { marginBottom: '10px' },
  previewFieldLabel: { fontSize: '11px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' },
  previewFieldInput: { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0e4ef', background: '#f8faff' },
  previewSubmit:{ padding: '12px', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginTop: '16px', cursor: 'default' },
  previewPowered:{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '12px' },
  brandingSide: { display: 'flex', flexDirection: 'column', gap: '16px' },
  brandingLabel:{ fontSize: '12px', fontWeight: '700', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  brandingHint: { fontSize: '12px', color: '#8892b0', lineHeight: '1.6', margin: 0 },
  formTypeBadge:{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '12px 16px' },
  brandingFields:{ display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '13px', fontWeight: '600', color: '##1a1a2e' },
  optional:     { fontSize: '11px', color: '#8892b0', fontWeight: '400' },
  input:        { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e0e4ef', fontSize: '13px', color: '#1a1a2e', fontFamily: 'inherit', outline: 'none' },
  colorRow:     { display: 'flex', gap: '10px', alignItems: 'center' },
  colorPicker:  { width: '44px', height: '44px', borderRadius: '10px', border: '1.5px solid #e0e4ef', cursor: 'pointer', padding: '2px' },
  urlBox:       { background: '#f8faff', border: '1px solid #e8eaf0', borderRadius: '10px', padding: '12px 14px' },
  urlText:      { fontSize: '12px', color: '#1A73E8', fontWeight: '600', wordBreak: 'break-all' },
  navRow:       { display: 'flex', gap: '12px' },
  backBtn:      { padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #e0e4ef', background: '#fff', color: '#8892b0', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  nextBtn:      { flex: 1, padding: '12px 20px', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  error:        { background: '#fff5f5', color: '#c62828', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '0.5px solid #ffcdd2' },
  success:      { background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '0.5px solid #bbf7d0' },
}

export default FormPreview