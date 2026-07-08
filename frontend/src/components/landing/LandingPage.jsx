import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const features = [
    { icon: '🚀', title: 'One-click campaign launch', desc: 'Create and launch campaigns across all 4 platforms in minutes with our guided 7-step wizard.' },
    { icon: '🤖', title: 'AI-powered ad content', desc: 'Our AI generates compelling headlines, descriptions and creatives tailored to your industry and audience.' },
    { icon: '🎯', title: 'Smart lead capture', desc: 'Auto-detect the right form type based on your industry. Collect high-quality leads directly in your dashboard.' },
    { icon: '📊', title: 'Unified analytics', desc: 'Track impressions, clicks, leads and CPL across all platforms in one unified performance dashboard.' },
    { icon: '📍', title: 'Geo targeting', desc: 'Target specific cities and radius zones across India with our built-in location intelligence.' },
    { icon: '🛡️', title: 'White-label forms', desc: 'Lead capture forms branded with your company logo, colors and tagline for maximum trust.' },
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

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>A</div>
            <span style={s.logoText}>AdNexus</span>
          </div>
          <div style={s.navLinks}>
             <a href="#features" style={s.navLink}>Features</a>
            <a href="#how" style={s.navLink}>How it works</a>
        {/* <a href="#pricing" style={s.navLink}>Pricing</a> */}
       <a href="#contact" style={s.navLink}>Contact</a>
    <a href="/about" style={s.navLink}>About</a>
          </div>
          <div style={s.navRight}>
           <button style={s.btnGhost} onClick={() => navigate('/login')}>Login</button>
           <button style={s.btnBlue} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroBadge}>
          🚀 India's #1 Ad Management Platform
        </div>
        <h1 style={s.heroTitle}>
          India's Smartest<br />
          <span style={{ color: '#1A73E8' }}>Ad Management</span> Platform
        </h1>
        <p style={s.heroSub}>
          Launch, manage and optimize B2B ad campaigns across Google, Meta, LinkedIn
          and Instagram — all from one powerful dashboard.
        </p>
        <div style={s.heroBtns}>
          <button style={s.btnHeroPrimary}>🚀 Start Free Trial</button>
          <button style={s.btnHeroGhost}>▶ Watch Demo</button>
        </div>
        <div style={s.heroStats}>
          {[
            { num: '4+', label: 'Ad Platforms' },
            { num: '10x', label: 'Faster Campaign Launch' },
            { num: 'AI', label: 'Powered Ad Content' },
            { num: '₹1-2', label: 'Cost Per Lead' },
          ].map((stat, i) => (
            <div key={i} style={s.statItem}>
              <div style={s.statNum}>{stat.num}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platforms ── */}
      <div style={s.platforms}>
        <div style={s.platformsLabel}>Runs ads on all major platforms</div>
        <div style={s.platformLogos}>
          {[
            { name: 'Google Ads', color: '#1A73E8' },
            { name: 'Facebook', color: '#1877F2' },
            { name: 'Instagram', color: '#E1306C' },
            { name: 'LinkedIn', color: '#0A66C2' },
          ].map((p, i) => (
            <div key={i} style={s.platformPill}>
              <div style={{ ...s.platDot, background: p.color }} />
              {p.name}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" style={s.section}>
        <div style={s.sectionLabel}>Features</div>
        <h2 style={s.sectionTitle}>Everything you need to run great ads</h2>
        <p style={s.sectionSub}>From campaign creation to lead capture — AdNexus handles it all automatically.</p>
        <div style={s.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ ...s.section, background: '#f8faff' }}>
        <div style={s.sectionLabel}>How it works</div>
        <h2 style={s.sectionTitle}>Launch your first campaign in 4 steps</h2>
        <p style={s.sectionSub}>No technical knowledge required. Just follow the steps and your ads go live.</p>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepCard}>
              {i < steps.length - 1 && <div style={s.stepConnector} />}
              <div style={s.stepNum}>{step.n}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <div style={s.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──
      <section id="pricing" style={s.section}>
        <div style={s.sectionLabel}>Pricing</div>
        <h2 style={s.sectionTitle}>Simple, transparent pricing</h2>
        <p style={s.sectionSub}>Start free, scale as you grow. No hidden fees.</p>
        <div style={s.pricingGrid}>
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
      <section style={{ ...s.section, background: '#f8faff' }}>
        <div style={s.sectionLabel}>Testimonials</div>
        <h2 style={s.sectionTitle}>Trusted by businesses across India</h2>
        <div style={s.testimonialsGrid}>
          {[
            { name: 'Rahul Sharma', role: 'Founder, FinServ India', text: 'AdNexus cut our campaign setup time from days to minutes. Our CPL dropped by 60% in the first month.' },
            { name: 'Priya Mehta', role: 'Marketing Head, PropTech Co', text: 'The AI-generated ads are incredibly good. We saw 3x more qualified leads compared to our previous agency.' },
            { name: 'Amit Gupta', role: 'CEO, EduTech Startup', text: 'Finally a platform built for Indian businesses. The geo-targeting and lead forms work perfectly for our market.' },
          ].map((t, i) => (
            <div key={i} style={s.testimonialCard}>
              <div style={s.testimonialText}>"{t.text}"</div>
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
        <h2 style={s.ctaTitle}>Ready to launch smarter ads?</h2>
        <p style={s.ctaSub}>Join hundreds of businesses already using AdNexus to grow faster.</p>
        <button style={s.btnCta}>Start Free Trial Today →</button>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" style={s.footer}>
        <div style={s.footerTop}>
          <div style={s.footerBrand}>
            <div style={s.logo}>
              <div style={{ ...s.logoMark, width: '32px', height: '32px', fontSize: '16px' }}>A</div>
              <span style={{ ...s.logoText, color: '#fff' }}>AdNexus</span>
            </div>
            <p style={s.footerDesc}>India's smartest ad management platform. Launch campaigns across all major platforms from one dashboard.</p>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Product</div>
              <a href="#features" style={s.footerLink}>Features</a>
              <a href="#pricing" style={s.footerLink}>Pricing</a>
              <a href="#how" style={s.footerLink}>How it works</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Company</div>
              <a href="/about" style={s.footerLink}>About us</a>
              <a href="#" style={s.footerLink}>Blog</a>
              <a href="#" style={s.footerLink}>Careers</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Legal</div>
              <a href="/privacy-policy" style={s.footerLink}>Privacy Policy</a>
              <a href="/terms" style={s.footerLink}>Terms of Service</a>
              <a href="#contact" style={s.footerLink}>Contact Us</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <span style={s.footerCopy}>© 2026 AdNexus. All rights reserved.</span>
          <span style={s.footerCopy}>adnexus.co.in</span>
        </div>
      </footer>

    </div>
  )
}

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', overflowX: 'hidden' },

  // Nav
  nav: { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', gap: '28px', marginLeft: '32px' },
  navLink: { fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' },
  navRight: { marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' },
  btnGhost: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },
  btnBlue: { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1A73E8', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },

  // Hero
  hero: { padding: '80px 32px 60px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1e40af', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', marginBottom: '24px', border: '1px solid #bfdbfe' },
  heroTitle: { fontSize: '52px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' },
  heroSub: { fontSize: '18px', color: '#6b7280', lineHeight: '1.7', maxWidth: '580px', margin: '0 auto 36px' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '56px' },
  btnHeroPrimary: { padding: '14px 32px', borderRadius: '10px', border: 'none', background: '#1A73E8', fontSize: '16px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },
  btnHeroGhost: { padding: '14px 32px', borderRadius: '10px', border: '1.5px solid #e0e4ef', background: '#fff', fontSize: '16px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },
  heroStats: { display: 'flex', gap: '48px', justifyContent: 'center', padding: '28px 0', borderTop: '0.5px solid #e8eaf0', borderBottom: '0.5px solid #e8eaf0' },
  statItem: { textAlign: 'center' },
  statNum: { fontSize: '32px', fontWeight: '800', color: '#1A73E8' },
  statLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },

  // Platforms
  platforms: { padding: '32px', background: '#f8faff', textAlign: 'center' },
  platformsLabel: { fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' },
  platformLogos: { display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  platformPill: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#fff', border: '0.5px solid #e0e4ef', borderRadius: '30px', fontSize: '14px', fontWeight: '500', color: '#1a1a2e' },
  platDot: { width: '10px', height: '10px', borderRadius: '50%' },

  // Section
  section: { padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' },
  sectionLabel: { fontSize: '12px', fontWeight: '600', color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', textAlign: 'center' },
  sectionTitle: { fontSize: '36px', fontWeight: '800', color: '#1a1a2e', textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.5px' },
  sectionSub: { fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '52px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7' },

  // Features
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  featureCard: { padding: '28px', border: '0.5px solid #e0e4ef', borderRadius: '14px', background: '#fff' },
  featureIcon: { fontSize: '32px', marginBottom: '16px' },
  featureTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  featureDesc: { fontSize: '14px', color: '#6b7280', lineHeight: '1.65' },

  // Steps
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', position: 'relative' },
  stepCard: { textAlign: 'center', padding: '28px 20px', position: 'relative' },
  stepConnector: { position: 'absolute', top: '44px', right: '-10px', width: '20px', height: '2px', background: '#1A73E8', zIndex: 1 },
  stepNum: { width: '48px', height: '48px', borderRadius: '50%', background: '#1A73E8', color: '#fff', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  stepTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  stepDesc: { fontSize: '13px', color: '#6b7280', lineHeight: '1.65' },

  // Pricing
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
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

  // Testimonials
  testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  testimonialCard: { padding: '28px', border: '0.5px solid #e0e4ef', borderRadius: '14px', background: '#fff' },
  testimonialText: { fontSize: '14px', color: '#374151', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: '12px' },
  testimonialAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1A73E8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  testimonialName: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e' },
  testimonialRole: { fontSize: '12px', color: '#6b7280' },

  // CTA
  cta: { padding: '80px 32px', background: '#1A73E8', textAlign: 'center' },
  ctaTitle: { fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px' },
  ctaSub: { fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '36px' },
  btnCta: { padding: '16px 36px', borderRadius: '12px', border: 'none', background: '#fff', fontSize: '16px', color: '#1A73E8', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' },

  // Footer
  footer: { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerBrand: {},
  footerDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginTop: '16px', maxWidth: '320px' },
  footerLinks: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle: { fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom: { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy: { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
}

export default LandingPage