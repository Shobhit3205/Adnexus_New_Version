import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { verifyResetOtp, resetPassword } from '../services/api'

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email] = useState(location.state?.email || '')

  const [step, setStep] = useState('otp')   // 'otp' -> 'password' -> done
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // ── Step 1: verify the code only ──
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Missing email. Please restart the forgot password process.')
      return
    }

    setLoading(true)
    try {
      await verifyResetOtp({ email, otp_code: otp })
      setStep('password')   // code is correct -> reveal the new password step
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: set the new password ──
  const handleSetPassword = async (e) => {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      await resetPassword({ email, otp_code: otp, new_password: newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset password</h2>
        <p style={styles.subtitle}>
          {step === 'otp'
            ? (email ? `Enter the code sent to ${email}` : 'Enter the code sent to your email')
            : 'Choose a new password for your account'}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>Password reset! Redirecting to login...</div>}

        {step === 'otp' && (
          <form onSubmit={handleVerifyCode} autoComplete="off">
            <label style={styles.label}>Verification code</label>
            <input
              style={styles.input}
              type="text"
              inputMode="numeric"
              name="reset_otp_code"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleSetPassword} autoComplete="off">
            <label style={styles.label}>New password</label>
            <div style={styles.passwordWrap}>
              <input
                style={{ ...styles.input, paddingRight: '40px' }}
                type={showPassword ? 'text' : 'password'}
                name="reset_new_password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <span
                style={styles.eyeIcon}
                onClick={() => setShowPassword((p) => !p)}
                role="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </span>
            </div>

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p style={styles.footerText}>
          Didn't get a code? <Link to="/forgot-password" state={{ email }} style={styles.link}>Resend</Link>
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
  passwordWrap: { position: 'relative', width: '100%' },
  eyeIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', color: '#94a3b8' },
  button: { width: '100%', marginTop: '22px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  success: { background: '#f0fdf4', color: '#15803d', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  footerText: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '18px' },
  link: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' },
}

export default ResetPassword