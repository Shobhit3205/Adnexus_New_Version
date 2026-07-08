import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyOtp, resendOtp } from '../services/api'
import { useAuth } from '../context/AuthContext'

const VerifyOtp = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser } = useAuth()

  // Signup page se email yahan aata hai
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await verifyOtp({ email, otp_code: otp })
      // Verify success — auto login karo aur dashboard bhejo
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setResending(true)
    try {
      await resendOtp({ email })
      setMessage('A new OTP has been sent to your email.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend OTP.')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <p>No email found. Please <Link to="/signup" style={styles.link}>sign up</Link> again.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Verify your email</h2>
        <p style={styles.subtitle}>We sent a 6-digit code to <strong>{email}</strong></p>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Enter OTP</label>
          <input
            style={{ ...styles.input, letterSpacing: '6px', fontSize: '18px', textAlign: 'center' }}
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
          />

          <button style={styles.button} type="submit" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p style={styles.footerText}>
          Didn't get the code?{' '}
          <span style={styles.link} onClick={!resending ? handleResend : undefined}>
            {resending ? 'Sending...' : 'Resend OTP'}
          </span>
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
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  button: { width: '100%', marginTop: '22px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  success: { background: '#f0fdf4', color: '#15803d', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  footerText: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '18px' },
  link: { color: '#2563eb', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' },
}

export default VerifyOtp