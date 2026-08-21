import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup, validateReferralCode } from '../services/api'

const Signup = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [otpChannel, setOtpChannel] = useState('email') // 'email' ya 'phone'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [manualRefCode, setManualRefCode] = useState('')
  const [refCheckStatus, setRefCheckStatus] = useState('idle') // idle | checking | valid | invalid
  const [referrerName, setReferrerName] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      try {
        localStorage.setItem('adnexus_referral_code', ref)
        setManualRefCode(ref)
      } catch (e) {
        // storage disabled (e.g. Safari private mode) — ignore, form still works
      }
    } else {
      try {
        const saved = localStorage.getItem('adnexus_referral_code')
        if (saved) setManualRefCode(saved)
      } catch (e) {
        // storage disabled — ignore
      }
    }
  }, [])

  // Referral code type karte hi (debounced) backend se check karo — kiske through refer hua
  useEffect(() => {
    const code = manualRefCode.trim()
    if (!code) {
      setRefCheckStatus('idle')
      setReferrerName('')
      return
    }
    setRefCheckStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await validateReferralCode(code)
        setReferrerName(res.data.name)
        setRefCheckStatus('valid')
      } catch (err) {
        setReferrerName('')
        setRefCheckStatus('invalid')
      }
    }, 500) // typing rukne ke 500ms baad hi call hoga, har keystroke pe nahi

    return () => clearTimeout(timer) // pichla pending check cancel, agar user abhi bhi type kar raha hai
  }, [manualRefCode])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm({ ...form, phone: digitsOnly })
  }

  // Password rules
  const passwordRules = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'At least 1 uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'At least 1 number', test: (pw) => /[0-9]/.test(pw) },
    { label: 'At least 1 special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\];'`~\\/]/.test(pw) },
  ]

  const isPasswordValid = passwordRules.every((rule) => rule.test(form.password))
  const isPhoneValid = /^[6-9]\d{9}$/.test(form.phone)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isPhoneValid) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements.')
      return
    }

    setLoading(true)
    try {
      const refCode = manualRefCode.trim() || null

      await signup({ ...form, otp_channel: otpChannel, referral_code: refCode })

      // Signup successful ho gaya — ab referral code ki zaroorat nahi,
      // clean up kar do taaki agla signup (agar koi test kare) affect na ho
      try {
        localStorage.removeItem('adnexus_referral_code')
      } catch (e) {
        // storage disabled — ignore
      }

      navigate('/verify-otp', {
        state: { email: form.email, phone: form.phone, otpChannel },
      })
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong. Please try again.'
      setError(detail)

      // Signup ho chuka hai DB mein but OTP send fail hua (500 + "Resend OTP" wala message)
      // — user ko verify-otp page pe bhej do taaki wo Resend OTP use kar sake,
      // signup form pe stuck na rahe.
      const otpSendFailed =
        err.response?.status === 500 && /resend otp/i.test(detail)

      if (otpSendFailed) {
        navigate('/verify-otp', {
          state: { email: form.email, phone: form.phone, otpChannel },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create your AdNexus account</h2>
        <p style={styles.subtitle}>Manage all your ad campaigns in one place</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Phone Number</label>
          <div style={styles.phoneWrap}>
            <span style={styles.phonePrefix}>+91</span>
            <input
              style={styles.phoneInput}
              type="tel"
              name="phone"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              required
            />
          </div>

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrap}>
            <input
              style={styles.passwordInput}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              required
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPassword((prev) => !prev)}
              role="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </div>

          {(passwordFocused || form.password.length > 0) && (
            <div style={styles.rulesBox}>
              {passwordRules.map((rule, idx) => {
                const passed = rule.test(form.password)
                return (
                  <div key={idx} style={styles.ruleRow}>
                    <span style={{ ...styles.ruleIcon, color: passed ? '#16a34a' : '#94a3b8' }}>
                      {passed ? '✓' : '○'}
                    </span>
                    <span style={{ ...styles.ruleText, color: passed ? '#16a34a' : '#64748b' }}>
                      {rule.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <label style={styles.label}>Referral Code (optional)</label>
          <input
            style={styles.input}
            type="text"
            name="referralCode"
            placeholder="Enter referral code if you have one"
            value={manualRefCode}
            onChange={(e) => setManualRefCode(e.target.value.toUpperCase())}
          />
          {refCheckStatus === 'checking' && (
            <p style={styles.refHint}>Checking code...</p>
          )}
          {refCheckStatus === 'valid' && (
            <p style={{ ...styles.refHint, color: '#16a34a' }}>Referred by: {referrerName}</p>
          )}
          {refCheckStatus === 'invalid' && (
            <p style={{ ...styles.refHint, color: '#dc2626' }}>Invalid referral code</p>
          )}

          {/* OTP channel choice */}
          <label style={styles.label}>Send verification code via</label>
          <div style={styles.channelWrap}>
            <button
              type="button"
              style={{ ...styles.channelBtn, ...(otpChannel === 'email' ? styles.channelBtnActive : {}) }}
              onClick={() => setOtpChannel('email')}
            >
              Email
            </button>
            <button
              type="button"
              style={{ ...styles.channelBtn, ...(otpChannel === 'phone' ? styles.channelBtnActive : {}) }}
              onClick={() => setOtpChannel('phone')}
            >
              Phone
            </button>
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>

        <p style={styles.supportText}>
          For any help contact us at{' '}
          <a href="mailto:support@adnexus.co.in" style={styles.link}>support@adnexus.co.in</a>
        </p>
      </div>
    </div>
  )
}

// Simple inline eye icons (no external icon library needed)
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const styles = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff', fontFamily: "'DM Sans', system-ui, sans-serif" },
  card: { background: '#fff', borderRadius: '16px', padding: '36px', width: '380px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px', marginTop: '14px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  phoneWrap: { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  phonePrefix: { padding: '10px 10px', fontSize: '14px', color: '#64748b', background: '#f8fafc', borderRight: '1px solid #e2e8f0' },
  phoneInput: { flex: 1, padding: '10px 12px', border: 'none', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  passwordWrap: { position: 'relative', width: '100%' },
  passwordInput: { width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  eyeIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  rulesBox: { marginTop: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  ruleRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' },
  ruleIcon: { fontSize: '13px', fontWeight: '700', width: '14px', textAlign: 'center' },
  ruleText: { fontSize: '12.5px' },
  refHint: { fontSize: '12px', marginTop: '5px', color: '#64748b' },
  channelWrap: { display: 'flex', gap: '8px' },
  channelBtn: { flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  channelBtnActive: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  button: { width: '100%', marginTop: '22px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  footerText: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '18px' },
  supportText: { textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '10px' },
  link: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' },
}

export default Signup