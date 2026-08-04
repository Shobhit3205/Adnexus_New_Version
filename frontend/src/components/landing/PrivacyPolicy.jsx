import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PrivacyPolicy = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        {
          subtitle: '1.1 Information you provide directly',
          text: 'When you register for AdNexus or use our services, we collect information you provide including your name, email address, phone number, company name, GST number, billing address, and payment information. We also collect information you enter when creating ad campaigns such as campaign names, target audience details, budget amounts, and ad content.'
        },
        {
          subtitle: '1.2 Information collected automatically',
          text: 'When you use our platform, we automatically collect certain information including your IP address, browser type and version, operating system, pages visited, time spent on pages, links clicked, and referring URLs. We use cookies and similar tracking technologies to collect this information.'
        },
        {
          subtitle: '1.3 Information from third-party platforms',
          text: 'When you connect your Google Ads, Meta (Facebook and Instagram), or LinkedIn accounts to AdNexus, we receive data from these platforms including campaign performance metrics, audience data, and billing information as permitted by their respective APIs and your authorization.'
        },
      ]
    },
    {
      title: '2. How We Use Your Information',
      content: [
        {
          subtitle: '2.1 To provide and improve our services',
          text: 'We use your information to create and manage your account, process your campaigns across connected ad platforms, generate AI-powered ad content, provide analytics and reporting, process payments, and improve our platform features and user experience.'
        },
        {
          subtitle: '2.2 To communicate with you',
          text: 'We may use your contact information to send you service-related notifications, campaign performance reports, billing information, product updates, and marketing communications. You can opt out of marketing communications at any time by clicking the unsubscribe link in any email or contacting us directly.'
        },
        {
          subtitle: '2.3 For legal and compliance purposes',
          text: 'We may use your information to comply with applicable laws and regulations, respond to legal requests, enforce our Terms of Service, protect the rights and safety of AdNexus and our users, and prevent fraud and abuse.'
        },
      ]
    },
    {
      title: '3. How We Share Your Information',
      content: [
        {
          subtitle: '3.1 With ad platforms',
          text: 'To run your campaigns, we share necessary campaign data with Google Ads, Meta Ads, and LinkedIn Ads on your behalf. This sharing is governed by your agreements with those platforms and is required to deliver the services you have requested.'
        },
        {
          subtitle: '3.2 With service providers',
          text: 'We work with trusted third-party service providers who assist us in operating our platform, including cloud hosting providers, payment processors, analytics providers, and customer support tools. These providers are contractually obligated to protect your information and may only use it for the specific services they provide to us.'
        },
        {
          subtitle: '3.3 We do not sell your data',
          text: 'AdNexus does not sell, rent, or trade your personal information or campaign data to any third party for their own marketing or advertising purposes. Your data is used solely to provide and improve the AdNexus services you have subscribed to.'
        },
      ]
    },
    {
      title: '4. Data Security',
      content: [
        {
          subtitle: '4.1 Security measures',
          text: 'We implement industry-standard security measures to protect your information including encryption of data in transit using TLS/SSL, encryption of sensitive data at rest, access controls and authentication requirements, regular security audits, and secure data centres.'
        },
        {
          subtitle: '4.2 Your responsibility',
          text: 'You are responsible for maintaining the confidentiality of your account credentials. Please use a strong password and do not share your login details with anyone. Notify us immediately at support@adnexus.co.in if you suspect any unauthorized access to your account.'
        },
      ]
    },
    {
      title: '5. Data Retention',
      content: [
        {
          subtitle: '5.1 Retention period',
          text: 'We retain your personal information for as long as your account is active or as needed to provide you services. We also retain certain information as required by law or for legitimate business purposes such as resolving disputes and enforcing agreements.'
        },
        {
          subtitle: '5.2 Account deletion',
          text: 'If you wish to delete your account and associated data, please contact us at support@adnexus.co.in. We will process your request within 30 days, subject to any legal obligations that require us to retain certain information.'
        },
      ]
    },
    {
      title: '6. Cookies',
      content: [
        {
          subtitle: '6.1 What cookies we use',
          text: 'We use essential cookies required for the platform to function, analytical cookies to understand how users interact with our platform, and preference cookies to remember your settings. We do not use advertising cookies on our own website.'
        },
        {
          subtitle: '6.2 Managing cookies',
          text: 'You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the AdNexus platform. For more information on managing cookies, refer to your browser\'s help documentation.'
        },
      ]
    },
    {
      title: '7. Your Rights',
      content: [
        {
          subtitle: '7.1 Access and correction',
          text: 'You have the right to access the personal information we hold about you and to request corrections if any information is inaccurate or incomplete. You can update most of your information directly through your account settings or by contacting us.'
        },
        {
          subtitle: '7.2 Data portability',
          text: 'You have the right to request a copy of your personal data in a structured, machine-readable format. To make such a request, please contact us at support@adnexus.co.in.'
        },
        {
          subtitle: '7.3 Withdrawal of consent',
          text: 'Where we rely on your consent to process your information, you have the right to withdraw that consent at any time. Withdrawal of consent will not affect the lawfulness of processing carried out before the withdrawal.'
        },
      ]
    },
    {
      title: '8. Children\'s Privacy',
      content: [
        {
          subtitle: '',
          text: 'AdNexus is a business-to-business platform intended for use by adults operating businesses. Our services are not directed at children under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete that information promptly.'
        },
      ]
    },
    {
      title: '9. Changes to This Policy',
      content: [
        {
          subtitle: '',
          text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and sending an email to the address associated with your account. Your continued use of AdNexus after the effective date of any changes constitutes your acceptance of the updated policy.'
        },
      ]
    },
    {
      title: '10. Contact Us',
      content: [
        {
          subtitle: '',
          text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal information, please contact us at support@adnexus.co.in. We will respond to your inquiry within 5 business days.'
        },
      ]
    },
  ]

  return (
    <div style={s.page}>
      {/* ── Responsive CSS ── */}
      <style>{responsiveCSS}</style>

      {/* ── Navbar ── */}
      <nav style={s.nav}>
        <div style={s.navInner} className="nav-inner">
          <a href="/" style={s.logo}>
            <div style={s.logoMark}>A</div>
            <span style={s.logoText}>AdNexus</span>
          </a>
          <div style={s.navLinks} className="nav-links">
            <a href="/#features" style={s.navLink}>Features</a>
            <a href="/#how"      style={s.navLink}>How it works</a>
            <a href="/#pricing"  style={s.navLink}>Pricing</a>
            <a href="/about"     style={s.navLink}>About</a>
          </div>
          <div style={s.navRight} className="nav-right">
            <button style={s.btnGhost} onClick={() => navigate('/login')}>Login</button>
            <button style={s.btnBlue} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
          <button
            style={s.hamburger}
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
          </button>
        </div>
        {menuOpen && (
          <div style={s.mobileMenu} className="mobile-menu">
            <a href="/#features" style={s.mobileMenuLink}>Features</a>
            <a href="/#how"      style={s.mobileMenuLink}>How it works</a>
            <a href="/#pricing"  style={s.mobileMenuLink}>Pricing</a>
            <a href="/about"     style={s.mobileMenuLink}>About</a>
            <div style={s.mobileMenuDivider} />
            <button style={{ ...s.btnGhost, width: '100%' }} onClick={() => navigate('/login')}>Login</button>
            <button style={{ ...s.btnBlue, width: '100%' }} onClick={() => navigate('/signup')}>Get Started Free</button>
          </div>
        )}
      </nav>

      {/* ── Header ── */}
      <div style={s.header} className="header">
        <div style={s.headerInner}>
          <div style={s.breadcrumb}>
            <a href="/" style={s.breadcrumbLink}>Home</a>
            <span style={s.breadcrumbSep}>›</span>
            <span style={s.breadcrumbCurrent}>Privacy Policy</span>
          </div>
          <h1 style={s.headerTitle} className="header-title">Privacy Policy</h1>
          <p style={s.headerSub}>
            This Privacy Policy explains how AdNexus collects, uses, and protects
            your personal information when you use our platform.
          </p>
          <div style={s.headerMeta}>
            <span style={s.metaBadge}>📅 Last updated: June 10, 2026</span>
            <span style={s.metaBadge}>🏢 AdNexus — adnexus.co.in</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={s.contentWrap} className="content-wrap">
        <div style={s.contentInner}>

          {/* Intro box */}
          <div style={s.introBox} className="intro-box">
            <div style={s.introIcon}>🔒</div>
            <div>
              <div style={s.introTitle}>Your privacy matters to us</div>
              <div style={s.introText}>
                AdNexus is committed to protecting your personal information. We do not sell your data,
                we do not share it with advertisers, and we use it only to provide and improve the
                services you have signed up for. This policy explains exactly what we collect and why.
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section, i) => (
            <div key={i} style={s.section} className="policy-section">
              <h2 style={s.sectionTitle}>{section.title}</h2>
              {section.content.map((item, j) => (
                <div key={j} style={s.subsection}>
                  {item.subtitle && <h3 style={s.subsectionTitle}>{item.subtitle}</h3>}
                  <p style={s.subsectionText}>{item.text}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Contact box */}
          <div style={s.contactBox}>
            <div style={s.contactTitle}>📧 Questions about this policy?</div>
            <div style={s.contactText}>
              Contact us at <a href="mailto:adnexus@adnexus.co.in" style={s.contactLink}>adnexus@adnexus.co.in</a>.
              We respond within 5 business days.
            </div>
          </div>

          {/* Related links */}
          <div style={s.relatedLinks}>
            <a href="/terms" style={s.relatedLink}>Terms of Service →</a>
            <a href="/about" style={s.relatedLink}>About AdNexus →</a>
            <a href="/"      style={s.relatedLink}>Back to Home →</a>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerTop} className="footer-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={s.logoMark}>A</div>
              <span style={{ ...s.logoText, color: '#fff' }}>AdNexus</span>
            </div>
            <p style={s.footerDesc}>India's smartest ad management platform.</p>
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              📧 support@adnexus.co.in
            </div>
          </div>
          <div style={s.footerLinks} className="footer-links">
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Product</div>
              <a href="/#features" style={s.footerLink}>Features</a>
              <a href="/#pricing"  style={s.footerLink}>Pricing</a>
              <a href="/#how"      style={s.footerLink}>How it works</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Company</div>
              <a href="/about"    style={s.footerLink}>About Us</a>
              <a href="/#contact" style={s.footerLink}>Contact</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Legal</div>
              <a href="/privacy-policy" style={{ ...s.footerLink, color: '#fff', fontWeight: '600' }}>Privacy Policy</a>
              <a href="/terms"          style={s.footerLink}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom} className="footer-bottom">
          <span style={s.footerCopy}>© 2026 AdNexus. All rights reserved.</span>
          <span style={s.footerCopy}>adnexus@adnexus.co.in</span>
        </div>
      </footer>

    </div>
  )
}

const responsiveCSS = `
  * { box-sizing: border-box; }
  .hamburger-btn { display: none; }

  @media (max-width: 968px) {
    .nav-links, .nav-right { display: none !important; }
    .hamburger-btn { display: flex !important; }
    .footer-top { grid-template-columns: 1fr !important; gap: 40px !important; }
  }

  @media (max-width: 640px) {
    .nav-inner { padding: 0 16px !important; }
    .header { padding: 40px 20px !important; }
    .header-title { font-size: 28px !important; }
    .content-wrap { padding: 36px 16px !important; }
    .intro-box { flex-direction: column !important; padding: 18px !important; }
    .policy-section { padding: 20px !important; }
    .footer-links { grid-template-columns: 1fr !important; gap: 24px !important; }
    .footer-bottom { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
  }
`

const s = {
  page: { fontFamily: "'Inter', -apple-system, sans-serif", background: '#fff', color: '#1a1a2e', overflowX: 'hidden' },

  // Nav
  nav:      { background: '#fff', borderBottom: '0.5px solid #e8eaf0', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' },
  logo:     { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', gap: '28px', marginLeft: '32px' },
  navLink:  { fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' },
  navRight: { marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' },
  btnGhost: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #e0e4ef', background: '#fff', fontSize: '13px', color: '#1a1a2e', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' },
  btnBlue:  { padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1A73E8', fontSize: '13px', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' },

  // Hamburger
  hamburger:     { marginLeft: 'auto', width: '36px', height: '36px', border: '1px solid #e0e4ef', borderRadius: '8px', background: '#fff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' },
  hamburgerLine: { width: '18px', height: '2px', background: '#1a1a2e', borderRadius: '2px' },
  mobileMenu:    { display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 16px 20px', borderTop: '0.5px solid #e8eaf0', background: '#fff' },
  mobileMenuLink:{ fontSize: '15px', color: '#374151', textDecoration: 'none', fontWeight: '500', padding: '10px 4px' },
  mobileMenuDivider: { height: '1px', background: '#e8eaf0', margin: '8px 0' },

  // Header
  header:      { background: 'linear-gradient(135deg, #0f1535 0%, #1a3a8f 100%)', padding: '60px 32px' },
  headerInner: { maxWidth: '800px', margin: '0 auto' },
  breadcrumb:  { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' },
  breadcrumbLink:    { fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  breadcrumbSep:     { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
  breadcrumbCurrent: { fontSize: '13px', color: '#fff', fontWeight: '500' },
  headerTitle: { fontSize: '40px', fontWeight: '800', color: '#fff', marginBottom: '14px', letterSpacing: '-0.5px' },
  headerSub:   { fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', marginBottom: '24px', maxWidth: '600px' },
  headerMeta:  { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  metaBadge:   { fontSize: '12px', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)' },

  // Content
  contentWrap:  { padding: '60px 32px', background: '#f8faff' },
  contentInner: { maxWidth: '800px', margin: '0 auto' },

  // Intro box
  introBox:   { display: 'flex', gap: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '20px 24px', marginBottom: '40px', alignItems: 'flex-start' },
  introIcon:  { fontSize: '28px', flexShrink: 0 },
  introTitle: { fontSize: '15px', fontWeight: '700', color: '#1e40af', marginBottom: '6px' },
  introText:  { fontSize: '14px', color: '#374151', lineHeight: '1.7' },

  // Sections
  section:      { background: '#fff', borderRadius: '14px', border: '0.5px solid #e0e4ef', padding: '28px 32px', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '20px', paddingBottom: '12px', borderBottom: '0.5px solid #e8eaf0' },
  subsection:      { marginBottom: '18px' },
  subsectionTitle: { fontSize: '14px', fontWeight: '600', color: '#1A73E8', marginBottom: '8px' },
  subsectionText:  { fontSize: '14px', color: '#4b5563', lineHeight: '1.8' },

  // Contact box
  contactBox:   { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '24px', marginTop: '32px', marginBottom: '24px' },
  contactTitle: { fontSize: '15px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' },
  contactText:  { fontSize: '14px', color: '#374151', lineHeight: '1.7' },
  contactLink:  { color: '#1A73E8', fontWeight: '600' },

  // Related links
  relatedLinks: { display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '8px' },
  relatedLink:  { fontSize: '14px', color: '#1A73E8', fontWeight: '600', textDecoration: 'none' },

  // Footer
  footer:       { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop:    { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerDesc:   { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', maxWidth: '320px' },
  footerLinks:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  footerCol:    { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle:{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink:   { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom: { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy:   { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
}

export default PrivacyPolicy