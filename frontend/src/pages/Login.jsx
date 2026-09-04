import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { login, googleLogin } from '../services/api'
import { useAuth } from '../context/AuthContext'

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

const Login = () => {
  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ── NEW: lockout feature states ──
  const [attemptsLeft, setAttemptsLeft] = useState(null)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  // ── NEW: countdown timer ──
  useEffect(() => {
    if (!lockedUntil) return

    const tick = () => {
      const secs = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setRemainingSeconds(secs)
      if (secs <= 0) {
        setLockedUntil(null)
        setError('')
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAttemptsLeft(null)

    if (lockedUntil && remainingSeconds > 0) return

    setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail

      if (detail && typeof detail === 'object') {
        if (detail.locked) {
          setLockedUntil(Date.now() + detail.retry_after * 1000)
          setError(detail.message || 'Too many failed attempts.')
        } else if (detail.attempts_left !== undefined) {
          setAttemptsLeft(detail.attempts_left)
          setError(detail.message || 'Invalid email or password.')
        } else {
          setError(detail.message || 'Login failed.')
        }
      } else if (detail === 'Please verify your account first') {
        navigate('/verify-otp', { state: { email: form.email } })
      } else {
        setError(detail || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    try {
      const res = await googleLogin({ id_token: credentialResponse.credential })
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError('Google login failed. Please try again.')
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>Log in to AdNexus</h2>
        <p style={styles.subtitle}>Manage all your ad campaigns in one place</p>

        {error && <div style={styles.error}>{error}</div>}

        {attemptsLeft !== null && !lockedUntil && (
          <div style={styles.warning}>
            ⚠️ {attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''} left
          </div>
        )}

        {lockedUntil && remainingSeconds > 0 && (
          <div style={styles.warning}>
            ⏱️ Try again in {formatTime(remainingSeconds)}
          </div>
        )}

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed.')}
          />
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <form onSubmit={handleSubmit}>
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
              style={{ ...styles.input, paddingRight: '40px' }}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
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

          <button
            style={styles.button}
            type="submit"
            disabled={loading || (lockedUntil && remainingSeconds > 0)}
          >
            {lockedUntil && remainingSeconds > 0
              ? `Locked (${formatTime(remainingSeconds)})`
              : loading ? 'Logging in...' : 'Log In'}
          </button>

          <p style={styles.forgotText}>
            <Link to="/forgot-password" state={{ email: form.email }} style={styles.link}>Forgot password?</Link>
          </p>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>

        <p style={styles.supportText}>
          For any help contact us at{' '}
          <a href="mailto:support@adnexus.co.in" style={styles.link}>support@adnexus.co.in</a>
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
  warning: { background: '#fffbeb', color: '#b45309', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '10px' },
  footerText: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '18px' },
  supportText: { textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '10px' },
  forgotText: { textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '12px' },
  link: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' },
  divider: { display: 'flex', alignItems: 'center', textAlign: 'center', margin: '4px 0 14px' },
  dividerText: { flex: 1, fontSize: '12px', color: '#94a3b8', position: 'relative' },
}

export default Login