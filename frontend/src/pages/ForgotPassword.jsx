import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { forgotPassword } from '../services/api'

// Masks an email like "shobhit@adnexus.co.in" -> "sh***it@adnexus.co.in"
// Keeps first 2 and last 2 characters of the local part visible.
function maskEmail(email) {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')

  if (local.length <= 4) {
    // Too short to show first 2 + last 2 separately — just mask the middle char(s)
    const first = local.slice(0, 1)
    const last = local.slice(-1)
    return `${first}${'*'.repeat(Math.max(local.length - 2, 1))}${last}@${domain}`
  }

  const firstTwo = local.slice(0, 2)
  const lastTwo = local.slice(-2)
  const middleLength = local.length - 4
  return `${firstTwo}${'*'.repeat(middleLength)}${lastTwo}@${domain}`
}

const ForgotPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword({ email })
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // No email available (e.g. user opened this page directly) — send them back
  if (!email) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.title}>Forgot password</h2>
          <p style={styles.subtitle}>
            Please go to the login page, enter your email, then tap "Forgot password?".
          </p>
          <Link to="/login" style={styles.button2}>Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot password</h2>
        <p style={styles.subtitle}>We'll send a reset code to your email</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <div style={styles.maskedBox}>{maskEmail(email)}</div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset code'}
          </button>
        </form>

        <p style={styles.footerText}>
          Remembered your password? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff', fontFamily: "'DM Sans', system-ui, sans-serif" },
  card: { background: '#fff', borderRadius: '16px', padding: '36px', width: '380px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px', marginTop: '14px' },
  maskedBox: {
    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '14px', boxSizing: 'border-box', background: '#f8faff', color: '#334155',
    letterSpacing: '0.3px',
  },
  button: { width: '100%', marginTop: '22px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  button2: { display: 'block', textAlign: 'center', width: '100%', marginTop: '18px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '14px', textDecoration: 'none', boxSizing: 'border-box' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  footerText: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '18px' },
  link: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' },
}

export default ForgotPassword