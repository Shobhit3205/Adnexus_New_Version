import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const Footer = () => {
  return (
    <footer className="an-footer" style={s.footer}>
      <style>{`
        @media (max-width: 1024px) {
          .an-footer-top { gap: 32px !important; }
          .an-footer-links { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 20px 14px !important; }
        }
        @media (max-width: 860px) {
          .an-footer { padding: 48px 20px 24px !important; }
          .an-footer-top { grid-template-columns: 1fr !important; gap: 28px !important; }
          .an-footer-links { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 24px 12px !important; }
          .an-footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        }
        @media (max-width: 640px) {
          .an-footer-links { grid-template-columns: 1fr !important; }
          .an-footer-top { gap: 24px !important; }
        }
        @media (max-width: 480px) {
          .an-footer-links { gap: 10px !important; }
          .an-footer-bottom { width: 100% !important; }
        }
      `}</style>

      <div className="an-footer-top" style={s.footerTop}>
        <div style={s.footerBrand}>
          <div style={s.logo}>
            <img src={logo} alt="AdNexus" style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ ...s.logoText, color: '#fff' }}>AdNexus</span>
          </div>
          <p style={s.footerDesc}>India's smartest ad management platform. Launch campaigns across all major platforms from one dashboard.</p>

          <div style={s.footerSocial}>
            <a
              href="https://www.instagram.com/adnexusns"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{ ...s.socialIcon, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/17NbXGPcge/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              style={{ ...s.socialIcon, background: '#1877F2' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.93H7.9V12H10V9.8C10 7.77 11.63 6 13.66 6H16v2.87h-1.5c-.83 0-1.5.67-1.5 1.5V12h3l-.5 2.87h-2.5V21.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/neetu-sagar-575050423"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              style={{ ...s.socialIcon, background: '#0A66C2' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>
              </svg>
            </a>
          </div>

          <div style={s.footerAddress}>
            <div style={s.footerAddressName}>NS ADNEXUS PRIVATE LIMITED</div>
            <div style={s.footerAddressRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div style={s.footerAddressText}>Office No. 01, H-47, Sector 63, Noida, Uttar Pradesh</div>
            </div>
          </div>
        </div>

        <div className="an-footer-links" style={s.footerLinks}>
          <div style={s.footerCol}>
            <div style={s.footerColTitle}>Product</div>
            <Link to="/#features" style={s.footerLink}>Features</Link>
            <Link to="/#pricing" style={s.footerLink}>Pricing</Link>
            <Link to="/how-it-works" style={s.footerLink}>How it works</Link>
          </div>
          <div style={s.footerCol}>
            <div style={s.footerColTitle}>Company</div>
            <Link to="/about" style={s.footerLink}>About us</Link>
            <a href="#" style={s.footerLink}>Blog</a>
            <a href="#" style={s.footerLink}>Careers</a>
          </div>
          <div style={s.footerCol}>
            <div style={s.footerColTitle}>Legal</div>
            <Link to="/privacy-policy" style={s.footerLink}>Privacy Policy</Link>
            <Link to="/terms" style={s.footerLink}>Terms of Service</Link>
            <Link to="/contact" style={s.footerLink}>Contact Us</Link>
          </div>
          <div style={s.footerCol}>
            <div style={s.footerColTitle}>Resources</div>
            <Link to="/help-center" style={s.footerLink}>Help Center</Link>
            <Link to="/how-it-works" style={s.footerLink}>How It Works</Link>
            <a href="#" style={s.footerLink}>Blog</a>
            <Link to="/contact" style={s.footerLink}>Contact Support</Link>
          </div>
        </div>
      </div>

      <div className="an-footer-bottom" style={s.footerBottom}>
        <span style={s.footerCopy}>© 2026 AdNexus. All rights reserved.</span>
        <span style={s.footerCopy}>adnexus.co.in</span>
      </div>
    </footer>
  )
}

const s = {
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: { width: '36px', height: '36px', background: '#1A73E8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0 },
  logoText: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '-0.3px' },

  footer: { background: '#0f1535', padding: '60px 32px 28px' },
  footerTop: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', paddingBottom: '40px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  footerBrand: {},
  footerDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginTop: '16px', maxWidth: '320px' },
  footerSocial: { display: 'flex', gap: '10px', marginTop: '18px' },
  footerAddress: { marginTop: '20px' },
  footerAddressName: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' },
  footerAddressRow: { display: 'flex', gap: '8px' },
  footerAddressText: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', maxWidth: '260px' },
  socialIcon: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' },
  footerLinks: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle: { fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
  footerLink: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  footerBottom: { maxWidth: '1200px', margin: '24px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerCopy: { fontSize: '12px', color: 'rgba(255,255,255,0.3)' },
}

export default Footer