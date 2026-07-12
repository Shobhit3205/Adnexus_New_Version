import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
 
const Terms = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
 
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: [
        {
          subtitle: '',
          text: 'By accessing or using the AdNexus platform at adnexus.co.in, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including individuals, businesses, and organizations that access or use AdNexus services.'
        },
      ]
    },
    {
      title: '2. Description of Services',
      content: [
        {
          subtitle: '2.1 What AdNexus provides',
          text: 'AdNexus is a B2B digital advertising management platform that enables businesses to create, manage, and optimize ad campaigns across Google Ads, Meta (Facebook and Instagram), and LinkedIn from a single dashboard. Our services include campaign creation tools, AI-powered ad content generation, lead capture forms, performance analytics, and geo-targeting capabilities.'
        },
        {
          subtitle: '2.2 Service availability',
          text: 'We strive to maintain high availability of our platform but do not guarantee uninterrupted access. We may perform scheduled or emergency maintenance that temporarily affects availability. We will provide reasonable advance notice of scheduled maintenance where possible.'
        },
        {
          subtitle: '2.3 Service modifications',
          text: 'AdNexus reserves the right to modify, suspend, or discontinue any part of our services at any time with reasonable notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of services.'
        },
      ]
    },
    {
      title: '3. Account Registration',
      content: [
        {
          subtitle: '3.1 Account requirements',
          text: 'To use AdNexus, you must create an account and provide accurate, complete, and current information. You must be at least 18 years of age and have the legal authority to enter into these terms on behalf of yourself or the business you represent.'
        },
        {
          subtitle: '3.2 Account security',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately at support@adnexus.co.in if you suspect any unauthorized use of your account. AdNexus is not liable for any loss or damage arising from your failure to protect your account credentials.'
        },
        {
          subtitle: '3.3 One account per user',
          text: 'Each user may maintain only one active account. Creating multiple accounts to circumvent restrictions, access additional free trial benefits, or for any other purpose is prohibited and may result in termination of all associated accounts.'
        },
      ]
    },
    {
      title: '4. Acceptable Use',
      content: [
        {
          subtitle: '4.1 Permitted use',
          text: 'You may use AdNexus only for lawful business purposes in accordance with these terms and all applicable laws and regulations. You are responsible for ensuring your campaigns and ad content comply with the advertising policies of Google, Meta, LinkedIn, and any other connected platforms.'
        },
        {
          subtitle: '4.2 Prohibited activities',
          text: 'You must not use AdNexus to create or run campaigns that promote illegal products or services, contain misleading or deceptive content, violate intellectual property rights, target prohibited categories such as weapons or adult content, engage in spam or unsolicited communications, or violate the policies of any connected ad platform.'
        },
        {
          subtitle: '4.3 Content responsibility',
          text: 'You are solely responsible for all ad content, landing pages, and business information you provide through AdNexus. AdNexus is not responsible for the content of your ads or any consequences arising from your advertising campaigns including rejected ads, account suspensions, or legal claims.'
        },
      ]
    },
    {
      title: '5. Payments and Billing',
      content: [
        {
          subtitle: '5.1 Subscription fees',
          text: 'AdNexus charges subscription fees for access to paid plan features as described on our pricing page. All fees are stated in Indian Rupees (₹) and are exclusive of applicable taxes including GST. You authorize us to charge your payment method on a recurring basis for your selected subscription.'
        },
        {
          subtitle: '5.2 Ad spend',
          text: 'AdNexus subscription fees are separate from your advertising spend on connected platforms. Ad spend is charged directly by Google, Meta, LinkedIn, and other ad networks according to their own billing terms. You are responsible for managing your ad budgets and ensuring sufficient funds in your platform accounts.'
        },
        {
          subtitle: '5.3 Refund policy',
          text: 'Subscription fees are non-refundable except where required by applicable law. If you cancel your subscription, you will retain access to paid features until the end of your current billing period. We do not provide prorated refunds for partial months of service.'
        },
        {
          subtitle: '5.4 Late payments',
          text: 'If payment cannot be processed, we will notify you and attempt to charge your payment method again. If payment remains outstanding for more than 7 days, we may suspend your account until payment is received. Continued non-payment may result in account termination.'
        },
      ]
    },
    {
      title: '6. Intellectual Property',
      content: [
        {
          subtitle: '6.1 AdNexus property',
          text: 'The AdNexus platform, including its software, design, features, and documentation, is owned by AdNexus and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use our platform solely for the purposes described in these terms.'
        },
        {
          subtitle: '6.2 Your content',
          text: 'You retain ownership of all content you create or upload to AdNexus including campaign creatives, ad copy, and business information. By using our platform, you grant AdNexus a limited license to use, store, and process your content solely for the purpose of providing our services to you.'
        },
        {
          subtitle: '6.3 AI-generated content',
          text: 'Ad content generated by our AI tools is provided for your use in your advertising campaigns. AdNexus does not claim ownership of AI-generated content created through our platform. You are responsible for ensuring AI-generated content is appropriate and compliant with platform policies before use.'
        },
      ]
    },
    {
      title: '7. Third-Party Platforms',
      content: [
        {
          subtitle: '7.1 Connected platforms',
          text: 'AdNexus integrates with Google Ads, Meta Ads, LinkedIn Ads, and other third-party platforms. Your use of these integrations is subject to the terms of service and advertising policies of those respective platforms. AdNexus is not responsible for changes to third-party platform policies that affect your campaigns.'
        },
        {
          subtitle: '7.2 Platform approvals',
          text: 'AdNexus does not guarantee that your campaigns will be approved by connected ad platforms. Ad approvals are determined by Google, Meta, LinkedIn, and other platforms according to their own policies. We are not liable for rejected campaigns or account suspensions imposed by third-party platforms.'
        },
      ]
    },
    {
      title: '8. Limitation of Liability',
      content: [
        {
          subtitle: '8.1 No warranty',
          text: 'AdNexus is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that our platform will be error-free, uninterrupted, or that it will meet your specific requirements or produce particular advertising results.'
        },
        {
          subtitle: '8.2 Limitation of damages',
          text: 'To the maximum extent permitted by applicable law, AdNexus shall not be liable for any indirect, incidental, special, consequential, or punitive damages including loss of profits, loss of data, or loss of business arising from your use of our platform. Our total liability to you for any claims arising from these terms shall not exceed the amount you paid to AdNexus in the 3 months preceding the claim.'
        },
      ]
    },
    {
      title: '9. Termination',
      content: [
        {
          subtitle: '9.1 Termination by you',
          text: 'You may cancel your AdNexus account at any time through your account settings or by contacting us at support@adnexus.co.in. Cancellation takes effect at the end of your current billing period.'
        },
        {
          subtitle: '9.2 Termination by AdNexus',
          text: 'We reserve the right to suspend or terminate your account if you violate these terms, engage in fraudulent or illegal activity, fail to pay subscription fees, or for any other reason at our discretion with reasonable notice. In cases of serious violations, we may terminate your account immediately without notice.'
        },
        {
          subtitle: '9.3 Effect of termination',
          text: 'Upon termination, your right to access AdNexus services will end immediately. We may delete your account data after a reasonable retention period. Any provisions of these terms that by their nature should survive termination shall continue to apply.'
        },
      ]
    },
    {
      title: '10. Governing Law',
      content: [
        {
          subtitle: '',
          text: 'These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of AdNexus shall be subject to the exclusive jurisdiction of the courts of India. If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.'
        },
      ]
    },
    {
      title: '11. Changes to Terms',
      content: [
        {
          subtitle: '',
          text: 'We may update these Terms of Service from time to time. We will notify you of material changes by posting the updated terms on our website and sending an email notification to your registered address. Your continued use of AdNexus after the effective date of changes constitutes your acceptance of the updated terms. We recommend reviewing these terms periodically.'
        },
      ]
    },
    {
      title: '12. Contact Us',
      content: [
        {
          subtitle: '',
          text: 'If you have any questions about these Terms of Service, please contact us at support@adnexus.co.in. We will respond to your inquiry within 5 business days.'
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
            <span style={s.breadcrumbCurrent}>Terms of Service</span>
          </div>
          <h1 style={s.headerTitle} className="header-title">Terms of Service</h1>
          <p style={s.headerSub}>
            Please read these terms carefully before using AdNexus. They govern
            your access to and use of our platform and services.
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
            <div style={s.introIcon}>📋</div>
            <div>
              <div style={s.introTitle}>Agreement between you and AdNexus</div>
              <div style={s.introText}>
                These Terms of Service form a legally binding agreement between you and AdNexus
                governing your use of our platform. By creating an account or using our services,
                you confirm that you have read, understood, and agree to these terms.
              </div>
            </div>
          </div>
 
          {/* Quick summary */}
          <div style={s.summaryBox} className="summary-box">
            <div style={s.summaryTitle}>📌 Quick Summary</div>
            <div style={s.summaryGrid} className="summary-grid">
              {[
                { icon: '✅', text: 'Use AdNexus for lawful B2B advertising' },
                { icon: '✅', text: 'You own all content you create' },
                { icon: '✅', text: 'Cancel anytime, no lock-in' },
                { icon: '❌', text: 'No illegal or deceptive ad content' },
                { icon: '❌', text: 'No multiple accounts to bypass limits' },
                { icon: '❌', text: 'Ad spend fees go directly to platforms' },
              ].map((item, i) => (
                <div key={i} style={s.summaryItem}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', color: '#374151' }}>{item.text}</span>
                </div>
              ))}
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
            <div style={s.contactTitle}>📧 Questions about these terms?</div>
            <div style={s.contactText}>
              Contact us at <a href="mailto:adnexus@adnexus.co.in" style={s.contactLink}>adnexus@adnexus.co.in</a>.
              We respond within 5 business days.
            </div>
          </div>
 
          {/* Related links */}
          <div style={s.relatedLinks}>
            <a href="/privacy-policy" style={s.relatedLink}>Privacy Policy →</a>
            <a href="/about"          style={s.relatedLink}>About AdNexus →</a>
            <a href="/"               style={s.relatedLink}>Back to Home →</a>
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
              <a href="/about"     style={s.footerLink}>About Us</a>
              <a href="/#contact"  style={s.footerLink}>Contact</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Legal</div>
              <a href="/privacy-policy" style={s.footerLink}>Privacy Policy</a>
              <a href="/terms"          style={{ ...s.footerLink, color: '#fff', fontWeight: '600' }}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom} className="footer-bottom">
          <span style={s.footerCopy}>© 2026 AdNexus. All rights reserved.</span>
          <span style={s.footerCopy}>adnexus.co.in</span>
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
    .summary-box { padding: 16px !important; }
    .summary-grid { grid-template-columns: 1fr !important; }
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
  introBox:   { display: 'flex', gap: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px', alignItems: 'flex-start' },
  introIcon:  { fontSize: '28px', flexShrink: 0 },
  introTitle: { fontSize: '15px', fontWeight: '700', color: '#1e40af', marginBottom: '6px' },
  introText:  { fontSize: '14px', color: '#374151', lineHeight: '1.7' },
 
  // Summary box
  summaryBox:   { background: '#fff', border: '0.5px solid #e0e4ef', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px' },
  summaryTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '14px' },
  summaryGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  summaryItem:  { display: 'flex', alignItems: 'center', gap: '8px' },
 
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
  footer:        { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop:     { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerDesc:    { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', maxWidth: '320px' },
  footerLinks:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  footerCol:     { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle:{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink:    { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom:  { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy:    { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
}
 
export default Terms