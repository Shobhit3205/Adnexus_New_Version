import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const features = [
    {
      title: 'One-click campaign launch',
      desc: 'Create and launch campaigns across all 4 platforms in minutes with our guided 7-step wizard.',
      iconBg: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      border: '#3b82f6',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
        </svg>
      ),
    },
    {
      title: 'AI-powered ad content',
      desc: 'Our AI generates compelling headlines, descriptions and creatives tailored to your industry and audience.',
      iconBg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
      border: '#8b5cf6',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="7" width="16" height="12" rx="3"></rect>
          <path d="M12 7V4"></path>
          <circle cx="12" cy="3" r="1"></circle>
          <circle cx="9" cy="13" r="1.3" fill="#fff"></circle>
          <circle cx="15" cy="13" r="1.3" fill="#fff"></circle>
          <path d="M8 17h8"></path>
        </svg>
      ),
    },
    {
      title: 'Smart lead capture',
      desc: 'Auto-detect the right form type based on your industry. Collect high-quality leads directly in your dashboard.',
      iconBg: 'linear-gradient(135deg, #fb923c, #f97316)',
      border: '#f97316',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <circle cx="12" cy="12" r="5"></circle>
          <circle cx="12" cy="12" r="1" fill="#fff"></circle>
          <line x1="16.5" y1="7.5" x2="21" y2="3"></line>
          <polyline points="17.5 3 21 3 21 6.5"></polyline>
        </svg>
      ),
    },
    {
      title: 'Unified analytics',
      desc: 'Track impressions, clicks, leads and CPL across all platforms in one unified performance dashboard.',
      iconBg: 'linear-gradient(135deg, #4ade80, #22c55e)',
      border: '#22c55e',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="20" x2="6" y2="12"></line>
          <line x1="12" y1="20" x2="12" y2="7"></line>
          <line x1="18" y1="20" x2="18" y2="14"></line>
        </svg>
      ),
    },
    {
      title: 'Geo targeting',
      desc: 'Target specific cities and radius zones across India with our built-in location intelligence.',
      iconBg: 'linear-gradient(135deg, #fb7185, #f43f5e)',
      border: '#f43f5e',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
    },
    {
      title: 'White-label forms',
      desc: 'Lead capture forms branded with your company logo, colors and tagline for maximum trust.',
      iconBg: 'linear-gradient(135deg, #60a5fa, #38bdf8)',
      border: '#38bdf8',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"></path>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
      ),
    },
  ]

  const steps = [
    { n: 1, title: 'Create campaign', desc: 'Fill in your goal, industry, budget and target locations using our easy step-by-step wizard.' },
    { n: 2, title: 'AI generates ads', desc: 'Our AI creates compelling ad copy and creatives optimized for each platform automatically.' },
    { n: 3, title: 'Launch everywhere', desc: 'Your campaign goes live on Google, Meta, LinkedIn and Instagram with one click.' },
    { n: 4, title: 'Collect leads', desc: 'Interested people fill your branded form. Leads appear instantly in your dashboard.' },
  ]

  const plans = [
    { name: 'Starter', amount: 'Free', period: 'Forever free', popular: false, features: ['1 Campaign', '2 Platforms', '50 Leads/month', 'Basic Analytics', 'Email Support'] },
    { name: 'Growth', amount: '₹2,999', period: 'per month', popular: true, features: ['10 Campaigns', 'All 4 Platforms', 'Unlimited Leads', 'AI Ad Content', 'Advanced Analytics', 'Priority Support'] },
    { name: 'Enterprise', amount: 'Custom', period: 'contact us', popular: false, features: ['Unlimited Campaigns', 'All Platforms', 'Unlimited Leads', 'White-label', 'API Access', 'Dedicated Manager'] },
  ]

  const heroStats = [
    {
      num: '4+',
      label: 'Ad Platforms',
      desc: 'Run ads across multiple platforms seamlessly.',
      bg: '#eef4ff',
      iconBg: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      accent: '#2563eb',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
        </svg>
      ),
    },
    {
      num: '10x',
      label: 'Faster Campaign Launch',
      desc: 'Launch campaigns up to 10x faster with automation.',
      bg: '#eafcf3',
      iconBg: 'linear-gradient(135deg, #34d399, #10b981)',
      accent: '#059669',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M4 15a8 8 0 1 1 16 0"></path>
          <line x1="12" y1="15" x2="16" y2="10"></line>
          <circle cx="12" cy="15" r="1.2" fill="#fff" stroke="none"></circle>
        </svg>
      ),
    },
    {
      num: 'AI',
      label: 'Powered Ad Content',
      desc: 'AI generates high-converting ad content for you.',
      bg: '#f5eefe',
      iconBg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
      accent: '#7c3aed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M12 3a4 4 0 0 0-4 4c0 1.2.5 2 1 2.6-1.2.4-2 1.5-2 2.9 0 1 .5 1.9 1.2 2.4C7.5 15.4 7 16.4 7 17.5 7 19.4 8.6 21 10.5 21h3c1.9 0 3.5-1.6 3.5-3.5 0-1.1-.5-2.1-1.2-2.6.7-.5 1.2-1.4 1.2-2.4 0-1.4-.8-2.5-2-2.9.5-.6 1-1.4 1-2.6a4 4 0 0 0-4-4z"></path>
          <line x1="12" y1="7" x2="12" y2="17"></line>
        </svg>
      ),
    },
    {
      num: '₹80-85',
      label: 'Cost Per Lead',
      desc: 'Highly optimized campaigns at just ₹80-85 per lead.',
      bg: '#fff4ea',
      iconBg: 'linear-gradient(135deg, #fb923c, #f97316)',
      accent: '#ea580c',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <polyline points="3 17 9 11 13 15 21 7"></polyline>
          <polyline points="15 7 21 7 21 13"></polyline>
        </svg>
      ),
    },
  ]

  const platforms = [
    {
      name: 'Google Ads',
      href: 'https://ads.google.com',
      badgeBg: '#eef4ff',
      borderColor: '#4285F4',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/business/ads',
      badgeBg: '#eef4ff',
      borderColor: '#1877F2',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.93H7.9V12H10V9.8C10 7.77 11.63 6 13.66 6H16v2.87h-1.5c-.83 0-1.5.67-1.5 1.5V12h3l-.5 2.87h-2.5V21.8c4.56-.93 8-4.96 8-9.8z"/>
        </svg>
      ),
    },
{
  name: 'Instagram',
  href: 'https://business.instagram.com/advertising',
  badgeBg: '#fdf1f8',
  borderColor: '#dc2743',
  icon: (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-grad-platform-unique" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="25%" stopColor="#fa7e1e" />
          <stop offset="50%" stopColor="#d62976" />
          <stop offset="75%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-grad-platform-unique)"></rect>
      <rect x="6.7" y="6.7" width="10.6" height="10.6" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.6"></rect>
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.5"></circle>
      <circle cx="17.3" cy="6.7" r="1" fill="#fff"></circle>
    </svg>
  ),
},
    {
      name: 'LinkedIn',
      href: 'https://business.linkedin.com/marketing-solutions/ads',
      badgeBg: '#eef4ff',
      borderColor: '#0A66C2',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={s.page}>
      {/* Responsive rules — inline style objects can't do media queries,
          so breakpoint behaviour lives here and uses !important to win
          over the inline styles on the elements below. */}
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; }
        body { margin: 0; }

        .an-nav-links { display: flex; align-items: center; gap: 24px; }
        .an-nav-right { display: flex; align-items: center; gap: 10px; }
        .an-burger { display: none !important; }
        .an-mobile-panel { display: none; }

        .an-features-grid,
        .an-steps-grid,
        .an-testimonials-grid,
        .an-pricing-grid {
          display: grid;
        }

        .an-step-connector { display: block; }

        .an-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .an-platform-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        /* ── Nav link hover — blue highlight with rounded rectangle ── */
        .an-nav-link-item {
          padding: 8px 14px;
          border-radius: 8px;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .an-nav-link-item:hover {
          background: #eaf1fe;
          color: #1A73E8 !important;
        }

        /* ── Login button — rounded border, light blue on hover ── */
        .an-btn-ghost-hover {
  border-radius: 10px !important;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.an-btn-ghost-hover:hover {
  background: #eaf1fe !important;
  border-color: #1A73E8 !important;
  color: #1A73E8 !important;
}

        /* ── Get Started Free button — nicer border + hover ── */
        .an-btn-blue-hover {
          border: 1.5px solid #0f5fd1 !important;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .an-btn-blue-hover:hover {
          background: #155fc9;
          box-shadow: 0 4px 12px rgba(26,115,232,0.35);
        }

        @media (max-width: 1200px) {
          .an-hero-title { font-size: 48px !important; }
          .an-hero-sub { max-width: 100% !important; }
          .an-section { padding: 72px 24px !important; }
          .an-footer-top { gap: 40px !important; }
        }

        @media (max-width: 1024px) {
          .an-features-grid,
          .an-pricing-grid,
          .an-testimonials-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .an-steps-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            row-gap: 32px !important;
          }
          .an-step-connector { display: none !important; }
          .an-hero-title { font-size: 42px !important; }
          .an-footer-top { gap: 32px !important; }
          .an-footer-links { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 20px 14px !important; }
        }

        @media (max-width: 860px) {
          .an-nav-links { display: none !important; }
          .an-nav-right .an-desktop-only { display: none !important; }
          .an-burger {
            display: flex !important;
            margin-left: auto;
          }
          .an-mobile-panel.open {
            display: flex !important;
          }
          .an-mobile-panel {
            position: relative;
            flex-direction: column;
            gap: 8px;
          }
          .an-hero { padding: 40px 20px 24px !important; min-height: auto !important; }
          .an-hero-title { font-size: 34px !important; }
          .an-hero-sub { font-size: 16px !important; }
          .an-hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .an-hero-btns button { width: 100% !important; }

          .an-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .an-platform-cards { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }

          .an-section { padding: 56px 20px !important; }
          .an-section-title { font-size: 30px !important; }

          .an-features-grid,
          .an-steps-grid,
          .an-testimonials-grid,
          .an-pricing-grid {
            grid-template-columns: 1fr !important;
          }

          .an-footer { padding: 48px 20px 24px !important; }
          .an-footer-top {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .an-footer-links { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 24px 12px !important; }
          .an-footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        }

        @media (max-width: 640px) {
          .an-hero-title { font-size: 30px !important; }
          .an-hero-sub { font-size: 15px !important; }
          .an-section-title { font-size: 26px !important; }
          .an-sectionSub { font-size: 15px !important; }
          .an-footer-links { grid-template-columns: 1fr !important; }
          .an-cta-title { font-size: 28px !important; }
          .an-cta { padding: 56px 20px !important; }
          .an-footer-top { gap: 24px !important; }
        }

        @media (max-width: 480px) {
          .an-hero-title { font-size: 26px !important; }
          .an-section-title { font-size: 24px !important; }
          .an-footer-links { gap: 10px !important; }
          .an-footer-bottom { width: 100% !important; }
        }

        .an-hero-video-section { height: 100vh; height: 100dvh; }
        @media (max-width: 860px) {
          .an-hero-video-section { height: 70vh; height: 70dvh; min-height: 420px; }
        }

        @keyframes an-scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>

      {/* ── Navbar (full link set restored: Features, How it works, Contact, About, Services) ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <img src={logo} alt="AdNexus" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
            <span style={s.logoText}>AdNexus</span>
          </div>
          <div className="an-nav-links" style={s.navLinks}>
            <a href="#features" className="an-nav-link-item" style={s.navLink}>Features</a>
            <Link to="/how-it-works" className="an-nav-link-item" style={s.navLink}>How it works</Link>
            <Link to="/contact" className="an-nav-link-item" style={s.navLink}>Contact</Link>
            <Link to="/about" className="an-nav-link-item" style={s.navLink}>About</Link>
            <Link to="/services" className="an-nav-link-item" style={s.navLink}>Services</Link>
          </div>
          <div className="an-nav-right" style={s.navRight}>
            <button className="an-desktop-only an-btn-ghost-hover" style={s.btnGhost} onClick={() => navigate('/login')}>Login</button>
            <button className="an-desktop-only an-btn-blue-hover" style={s.btnBlue} onClick={() => navigate('/signup')}>Get Started Free</button>
            <button
              className="an-burger"
              style={s.burgerBtn}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span style={s.burgerLine} />
              <span style={s.burgerLine} />
              <span style={s.burgerLine} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        <div className={`an-mobile-panel${menuOpen ? ' open' : ''}`} style={s.mobilePanel}>
          <a href="#features" className="an-nav-link-item" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Features</a>
          <Link to="/how-it-works" className="an-nav-link-item" style={s.mobileLink} onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link to="/contact" className="an-nav-link-item" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/about" className="an-nav-link-item" style={s.mobileLink} onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/services" className="an-nav-link-item" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Services</Link>
          <div style={s.mobileBtnRow}>
            <button style={{ ...s.btnGhost, flex: 1 }} onClick={() => navigate('/login')}>Login</button>
            <button style={{ ...s.btnBlue, flex: 1 }} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── Hero video intro (video only, full viewport) ── */}
      <section className="an-hero-video-section" style={s.heroVideoSection}>
        <video
          style={s.heroVideo}
          src="/videos/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/hero-poster.jpg"
        />
        <div style={s.heroVideoOverlay} />
        <div style={s.heroBadgeWrap}>
          <div style={s.heroBadge}>
            🚀 India's #1 Ad Management Platform
          </div>
        </div>
        <div style={s.scrollHint}>
          <span style={s.scrollHintText}>Scroll</span>
          <div style={s.scrollHintArrow}>↓</div>
        </div>
      </section>

      {/* ── Hero content (heading, CTAs) ── */}
      <section className="an-hero" style={s.hero}>
        <h1 className="an-hero-title" style={s.heroTitle}>
          India's Smartest<br />
          <span style={{ color: '#1A73E8' }}>Ad Management</span> Platform
        </h1>
        <p className="an-hero-sub" style={s.heroSub}>
          Launch, manage and optimize B2B ad campaigns across Google, Meta, LinkedIn
          and Instagram — all from one powerful dashboard.
        </p>
        <div className="an-hero-btns" style={s.heroBtns}>
          <button style={s.btnHeroPrimary} onClick={() => navigate('/signup')}>🚀 Start Free Trial</button>
          <button style={s.btnHeroGhost} onClick={() => navigate('/signup')}>▶ Watch Demo</button>
        </div>
      </section>

      {/* ── Stats (boxed icon cards) ── */}
      <div style={s.statsWrap}>
        <div className="an-stats-grid" style={s.statsGrid}>
          {heroStats.map((stat, i) => (
            <div key={i} style={{ ...s.statCard, background: stat.bg }}>
              <div style={{ ...s.statCardIcon, background: stat.iconBg }}>{stat.icon}</div>
              <div style={s.statCardNum}>{stat.num}</div>
              <div style={{ ...s.statCardLabel, color: stat.accent }}>{stat.label}</div>
              <div style={s.statCardDesc}>{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Platforms (boxed logo cards, each clickable) ── */}
      <div style={s.platforms}>
        <div style={s.platformsLabel}>Runs ads on all major platforms</div>
        <div className="an-platform-cards" style={s.platformCardsGrid}>
          {platforms.map((p, i) => (
            <a
              key={i}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...s.platformCard, borderBottomColor: p.borderColor }}
            >
              <div style={{ ...s.platformCardIcon, background: p.badgeBg }}>{p.icon}</div>
              <div style={s.platformCardName}>{p.name}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="an-section" style={s.section}>
        <div style={s.sectionLabel}>Features</div>
        <h2 className="an-section-title" style={s.sectionTitle}>Everything you need to run great ads</h2>
        <p className="an-sectionSub" style={s.sectionSub}>From campaign creation to lead capture — AdNexus handles it all automatically.</p>
        <div className="an-features-grid" style={s.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={{ ...s.featureCard, borderBottomColor: f.border }}>
              <div style={{ ...s.featureIconBox, background: f.iconBg }}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works (teaser → links to full page) ── */}
      <section id="how" className="an-section" style={{ ...s.section, background: '#f8faff', textAlign: 'center' }}>
        <div style={s.sectionLabel}>How it works</div>
        <h2 className="an-section-title" style={s.sectionTitle}>Launch your first campaign in 4 steps</h2>
        <p className="an-sectionSub" style={s.sectionSub}>No technical knowledge required. Just follow the steps and your ads go live.</p>

        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1A73E8', color: '#fff', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(26,115,232,0.25)' }}>
              {step.n}
            </div>
          ))}
        </div>

        <button style={s.btnHeroPrimary} onClick={() => navigate('/how-it-works')}>
          See Full Process →
        </button>
      </section>

      {/* ── Pricing ──
      <section id="pricing" className="an-section" style={s.section}>
        <div style={s.sectionLabel}>Pricing</div>
        <h2 className="an-section-title" style={s.sectionTitle}>Simple, transparent pricing</h2>
        <p style={s.sectionSub}>Start free, scale as you grow. No hidden fees.</p>
        <div className="an-pricing-grid" style={s.pricingGrid}>
          {plans.map((plan, i) => (
            <div key={i} style={{ ...s.priceCard, ...(plan.popular ? s.priceCardPopular : {}) }}>
              {plan.popular && <div style={s.popularBadge}>Most Popular</div>}
              <div style={s.priceName}>{plan.name}</div>
              <div style={s.priceAmount}>{plan.amount}</div>
              <div style={s.pricePeriod}>{plan.period}</div>
              <ul style={s.priceFeatures}>
                {plan.features.map((f, j) => (
                  <li key={j} style={s.priceFeatureItem}>
                    <span style={{ color: '#1A73E8' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button style={{ ...s.priceBtn, ...(plan.popular ? s.priceBtnPopular : {}) }}>
                {plan.popular ? 'Get Started' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── Testimonials ── */}
      <section className="an-section" style={{ ...s.section, background: '#f8faff' }}>
        <div style={s.sectionLabel}>Testimonials</div>
        <h2 className="an-section-title" style={s.sectionTitle}>Trusted by businesses across India</h2>
        <div className="an-testimonials-grid" style={s.testimonialsGrid}>
          {[
            { name: 'Rahul Sharma', role: 'Founder, FinServ India', text: 'AdNexus cut our campaign setup time from days to minutes. Our CPL dropped by 60% in the first month.' },
            { name: 'Priya Mehta', role: 'Marketing Head, PropTech Co', text: 'The AI-generated ads are incredibly good. We saw 3x more qualified leads compared to our previous agency.' },
            { name: 'Amit Gupta', role: 'CEO, EduTech Startup', text: 'Finally a platform built for Indian businesses. The geo-targeting and lead forms work perfectly for our market.' },
          ].map((t, i) => (
            <div key={i} style={s.testimonialCard}>
              <svg width="30" height="24" viewBox="0 0 30 24" style={s.testimonialQuoteIcon}>
                <path fill="#1A73E8" d="M0 24V14.4Q0 8.4 3 4.2Q6 0 12 0L12 4.8Q9 4.8 7.2 7.2Q5.4 9.6 5.4 14.4L12 14.4L12 24ZM18 24V14.4Q18 8.4 21 4.2Q24 0 30 0L30 4.8Q27 4.8 25.2 7.2Q23.4 9.6 23.4 14.4L30 14.4L30 24Z"/>
              </svg>
              <div style={s.testimonialText}>"{t.text}"</div>
              <div style={s.testimonialStars}>★★★★★</div>
              <div style={s.testimonialAuthor}>
                <div style={s.testimonialAvatar}>{t.name[0]}</div>
                <div>
                  <div style={s.testimonialName}>{t.name}</div>
                  <div style={s.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <h2 className="an-cta-title" style={s.ctaTitle}>Ready to launch smarter ads?</h2>
        <p style={s.ctaSub}>Join hundreds of businesses already using AdNexus to grow faster.</p>
        <button style={s.btnCta} onClick={() => navigate('/signup')}>Start Free Trial Today →</button>
      </section>
    </div>
  )
}

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', overflowX: 'hidden' },

  // Nav
  nav: { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  navLinks: { gap: '28px', marginLeft: '32px' },
  navLink: { fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' },
  navRight: { marginLeft: 'auto', gap: '10px', alignItems: 'center' },
  btnGhost: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },
  btnBlue: { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1A73E8', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },
  burgerBtn: { display: 'inline-flex', width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' },
  burgerLine: { width: '18px', height: '2px', background: '#1a1a2e', borderRadius: '2px' },
  mobilePanel: { flexDirection: 'column', gap: '4px', padding: '12px 20px 18px', borderTop: '0.5px solid #e8eaf0', background: '#fff' },
  mobileLink: { fontSize: '15px', color: '#1a1a2e', textDecoration: 'none', fontWeight: '500', padding: '10px 4px', borderBottom: '0.5px solid #f0f2f7' },
  mobileBtnRow: { display: 'flex', gap: '10px', marginTop: '10px' },

  // Hero video intro — full-viewport video, plays alone, no heading text on it
  heroVideoSection: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    zIndex: 0,
    display: 'block',
  },
  heroVideoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(10,15,40,0.25) 0%, rgba(10,15,40,0.15) 60%, rgba(10,15,40,0.55) 100%)',
    zIndex: 1,
  },
  heroBadgeWrap: {
    position: 'absolute',
    top: '32px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 2,
  },
  scrollHint: {
    position: 'relative',
    zIndex: 2,
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: '#fff',
  },
  scrollHintText: { fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 },
  scrollHintArrow: { fontSize: '20px', animation: 'an-scroll-bounce 1.6s ease-in-out infinite' },

  // Hero content — appears below the video on scroll, plain light section
  hero: {
    padding: '80px 32px 60px',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' },
  heroTitle: { fontSize: '52px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' },
  heroSub: { fontSize: '18px', color: '#6b7280', lineHeight: '1.7', maxWidth: '580px', margin: '0 auto 36px' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' },

  // Stats — boxed icon cards (reference style)
  statsWrap: { padding: '0 32px 48px', maxWidth: '1200px', margin: '0 auto' },
  statsGrid: {},
  statCard: {
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '16px',
    padding: '24px 22px',
    textAlign: 'left',
    boxShadow: '0 2px 10px rgba(15, 21, 53, 0.05)',
  },
  statCardIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  statCardNum: { fontSize: '26px', fontWeight: '900', color: '#1a1a2e', marginBottom: '4px' },
  statCardLabel: { fontSize: '13px', fontWeight: '600', marginBottom: '8px' },
  statCardDesc: { fontSize: '13px', color: '#6b7280', lineHeight: '1.5' },

  btnHeroPrimary: { padding: '14px 32px', borderRadius: '10px', border: 'none', background: '#1A73E8', fontSize: '16px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit', minWidth: '180px' },
  btnHeroGhost: { padding: '14px 32px', borderRadius: '10px', border: '1.5px solid #e0e4ef', background: '#fff', fontSize: '16px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit', minWidth: '180px' },

  // Platforms — boxed logo cards (reference style)
  platforms: { padding: '32px 20px 48px', background: '#f8faff', textAlign: 'center' },
  platformsLabel: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' },
  platformCardsGrid: { maxWidth: '900px', margin: '0 auto' },
  platformCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '14px',
    padding: '20px 22px',
    background: '#fff',
    border: '1px solid #edf0f7',
    borderBottom: '3px solid',
    borderRadius: '14px',
    textDecoration: 'none',
    color: '#1a1a2e',
    boxShadow: '0 2px 10px rgba(15, 21, 53, 0.05)',
  },
  platformCardIcon: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  platformCardName: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },

  // Section
  section: { padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' },
  sectionLabel: { fontSize: '12px', fontWeight: '600', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', textAlign: 'center' },
  sectionTitle: { fontSize: '36px', fontWeight: '800', color: '#1a1a2e', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.5px' },
  sectionSub: { fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '52px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7' },

  // Features — boxed gradient icon + bottom accent border (reference style)
  featuresGrid: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  featureCard: {
    padding: '28px',
    border: '1px solid #edf0f7',
    borderBottom: '4px solid',
    borderRadius: '14px',
    background: '#fff',
    boxShadow: '0 2px 12px rgba(15, 21, 53, 0.06)',
  },
  featureIconBox: { width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', boxShadow: '0 6px 14px rgba(0,0,0,0.12)' },
  featureTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  featureDesc: { fontSize: '14px', color: '#6b7280', lineHeight: '1.65' },

  // Steps
  stepsGrid: { gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', position: 'relative' },
  stepCard: { textAlign: 'center', padding: '28px 20px', position: 'relative' },
  stepConnector: { position: 'absolute', top: '44px', right: '-10px', width: '20px', height: '2px', background: '#1A73E8', zIndex: 1 },
  stepNum: { width: '48px', height: '48px', borderRadius: '50%', background: '#1A73E8', color: '#fff', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  stepTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  stepDesc: { fontSize: '13px', color: '#6b7280', lineHeight: '1.65' },

  // Pricing
  pricingGrid: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  priceCard: { padding: '32px 28px', border: '0.5px solid #e0e4ef', borderRadius: '16px', background: '#fff' },
  priceCardPopular: { border: '2px solid #1A73E8', background: '#f0f7ff' },
  popularBadge: { background: '#1A73E8', color: '#fff', fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px', display: 'inline-block', marginBottom: '14px' },
  priceName: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  priceAmount: { fontSize: '36px', fontWeight: '800', color: '#1a1a2e', marginTop: '12px', marginBottom: '4px' },
  pricePeriod: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
  priceFeatures: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' },
  priceFeatureItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' },
  priceBtn: { width: '100%', padding: '12px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid #1A73E8', background: '#fff', color: '#1A73E8', fontFamily: 'inherit' },
  priceBtnPopular: { background: '#1A73E8', color: '#fff', border: 'none' },

  // Testimonials — quote icon + star rating + round avatar (reference style)
  testimonialsGrid: { gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  testimonialCard: {
    position: 'relative',
    padding: '32px 28px 28px',
    border: '1px solid #edf0f7',
    borderRadius: '14px',
    background: '#fff',
    boxShadow: '0 2px 12px rgba(15, 21, 53, 0.06)',
  },
  testimonialQuoteIcon: { display: 'block', marginBottom: '16px', opacity: 0.85 },
  testimonialText: { fontSize: '14px', color: '#374151', lineHeight: '1.7', marginBottom: '18px', fontStyle: 'italic' },
  testimonialStars: { color: '#f5a623', fontSize: '14px', letterSpacing: '2px', marginBottom: '18px' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
  testimonialAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1A73E8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  testimonialName: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e' },
  testimonialRole: { fontSize: '12px', color: '#6b7280' },

  // CTA
  cta: { padding: '80px 32px', background: '#1A73E8', textAlign: 'center' },
  ctaTitle: { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px' },
  ctaSub: { fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px' },
  btnCta: { padding: '16px 36px', borderRadius: '12px', border: 'none', background: '#fff', fontSize: '16px', color: '#1A73E8', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' },
}

export default LandingPage