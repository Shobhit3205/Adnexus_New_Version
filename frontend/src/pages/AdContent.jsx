import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdContents, createAdContent } from '../services/api'

const platforms = [
  { id: 1, name: 'Google Ads', color: '#1A73E8', icon: 'G',  desc: 'Search & Display' },
  { id: 2, name: 'LinkedIn',   color: '#0A66C2', icon: 'in', desc: 'B2B Professional'  },
  { id: 3, name: 'Facebook',   color: '#1877F2', icon: 'f',  desc: 'Social Media'      },
  { id: 4, name: 'Instagram',  color: '#E1306C', icon: '📷', desc: 'Visual Content'    },
]

const ctaOptions = ['Apply Now', 'Learn More', 'Contact Us', 'Get Started', 'Book a Call', 'Download Now']

// ── Platform character limits (must match backend PLATFORM_RULES) ──
const PLATFORM_LIMITS = {
  'Google Ads': { headline: 30,  description: 90  },
  'LinkedIn':   { headline: 70,  description: 150 },
  'Facebook':   { headline: 40,  description: 125 },
  'Instagram':  { headline: 40,  description: 125 },
}

// ══════════════════════════════════════════════════════════════
// INDUSTRY MAP — 12 industries with subcategories
// ══════════════════════════════════════════════════════════════
const INDUSTRY_MAP = {
  'Financial Services':            { icon: '🏦', subcategories: ['Business Loan','Working Capital Loan','Machinery Loan','Invoice Finance','Trade Finance','Personal Loan','Home Loan','Gold Loan','Vehicle Loan','Education Loan'] },
  'Real Estate & Construction':    { icon: '🏗️', subcategories: ['Residential Property','Commercial Property','Villa / Plots','Affordable Housing','Luxury Housing','Co-working Space'] },
  'Manufacturing':                 { icon: '🏭', subcategories: ['Raw Material Supply','Industrial Goods','Custom Furniture','Jewellery','Packaging Material','Chemical Supply'] },
  'Trading & Distribution':        { icon: '🛒', subcategories: ['Wholesale Trading','Import / Export','FMCG Distribution','Retail Distribution','E-commerce'] },
  'IT & Technology':               { icon: '💻', subcategories: ['SaaS Product','IT Infrastructure','Digital Agency','Product Development','Cybersecurity','Cloud Services'] },
  'Healthcare & Pharma':           { icon: '🏥', subcategories: ['Hospital / Clinic','Dental Care','Eye Care','Ayurveda / Wellness','Diagnostics / Lab','Pharmaceutical'] },
  'Education & Edtech':            { icon: '🎓', subcategories: ['School / College','Coaching Center','Study Abroad','Skill Development','Online Courses','Vocational Training'] },
  'Retail':                        { icon: '🏪', subcategories: ['Fashion / Clothing','Electronics','Home Decor','Grocery / FMCG','Luxury Goods','Sports / Fitness'] },
  'Food & Beverage':               { icon: '🍽️', subcategories: ['Restaurant / Cafe','Food Processing','Cloud Kitchen','Catering Services','Food Franchise'] },
  'Logistics & Transport':         { icon: '🚚', subcategories: ['Courier Services','Fleet Management','Warehouse Services','Cold Chain','Last Mile Delivery'] },
  'Agriculture & Agro-Processing': { icon: '🌾', subcategories: ['Farm Equipment','Agro Processing','Organic Products','Seeds / Fertilizers','Irrigation Services'] },
  'Hospitality & Tourism':         { icon: '🏨', subcategories: ['Hotel / Resort','Travel Agency','Event Management','Wedding Planning','Adventure Tourism'] },
}

// ══════════════════════════════════════════════════════════════
// PREBUILT TEMPLATES — expanded across all 12 industries
// Each template has: id, industry, subcategory, badge, name,
// imageUrl, overlay, preview{headline,sub,cta}, description, content{...}
// content shape is IDENTICAL to what applyTemplate() expects
// ══════════════════════════════════════════════════════════════
const PREBUILT_TEMPLATES = [
  // ── Financial Services ──
  { id:'t1', industry:'Financial Services', subcategory:'Business Loan', badge:'POPULAR',
    name:'MSME Business Loan', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/business-loan.png',
    overlay:'linear-gradient(180deg,rgba(4,44,83,0.15) 0%,rgba(4,44,83,0.92) 100%)',
    preview:{ headline:'Business Loan upto ₹5Cr', sub:'Fast disbursal · Flexible EMI', cta:'Apply Now' },
    description:'Fast-track funding for growing businesses, up to ₹5 crore.',
    content:{ headline:'Business Loan upto ₹5Cr', description:"India's trusted MSME lender. Flexible repayment, minimal docs. Apply in 5 minutes.", cta_button:'Apply Now', target_audience:'MSME Owners, SME Directors, Business Heads', target_age_min:28, target_age_max:58 } },

  { id:'t1b', industry:'Financial Services', subcategory:'Business Loan', badge:null,
    name:'MSME Business Loan 2', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/business-loan%20%282%29.png',
    overlay:'linear-gradient(180deg,rgba(4,44,83,0.15) 0%,rgba(4,44,83,0.92) 100%)',
    preview:{ headline:'Business Loan upto ₹5Cr', sub:'Fast disbursal · Flexible EMI', cta:'Apply Now' },
    description:'Fast-track funding for growing businesses, up to ₹5 crore.',
    content:{ headline:'Business Loan upto ₹5Cr', description:"India's trusted MSME lender. Flexible repayment, minimal docs. Apply in 5 minutes.", cta_button:'Apply Now', target_audience:'MSME Owners, SME Directors, Business Heads', target_age_min:28, target_age_max:58 } },

  { id:'t2', industry:'Financial Services', subcategory:'Working Capital Loan', badge:'HOT',
    name:'Working Capital Loan', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/working-capital.png',
    overlay:'linear-gradient(180deg,rgba(8,20,50,0.15) 0%,rgba(8,20,50,0.92) 100%)',
    preview:{ headline:'Working Capital Loan', sub:'Upto ₹50L · Instant Approval', cta:'Apply Now' },
    description:'Get funds up to ₹50 Lakhs for your business needs.',
    content:{ headline:'Working Capital Loan', description:'Get working capital loan upto ₹50 lakhs. Apply now and get approval in 24 hours!', cta_button:'Apply Now', target_audience:'Business Owners, CFOs, Finance Managers', target_age_min:28, target_age_max:55 } },

  { id:'t3', industry:'Financial Services', subcategory:'Machinery Loan', badge:null,
    name:'Machinery Finance', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/machinery-loan.png',
    overlay:'linear-gradient(180deg,rgba(15,15,15,0.15) 0%,rgba(15,15,15,0.92) 100%)',
    preview:{ headline:'Upgrade Your Machinery', sub:'Easy EMI · Funds in 48hrs', cta:'Get Started' },
    description:'Finance new or used machinery. Funds in 48 hours.',
    content:{ headline:'Upgrade Machinery Now', description:'Finance new or used machinery. Flexible repayment. Funds in 48 hours.', cta_button:'Get Started', target_audience:'Manufacturers, Plant Owners, SME Businesses', target_age_min:30, target_age_max:58 } },

  { id:'t4', industry:'Financial Services', subcategory:'Invoice Finance', badge:'NEW',
    name:'Invoice Discounting', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(8,40,100,0.15) 0%,rgba(8,40,100,0.92) 100%)',
    preview:{ headline:'Turn Invoices Into Cash', sub:'Same-day funds · Zero charges', cta:'Apply Now' },
    description:'Unlock cash tied in invoices and grow your business.',
    content:{ headline:'Turn Invoices Into Cash', description:"Don't wait 60-90 days. Discount invoices, get funds same day. Zero hidden charges.", cta_button:'Apply Now', target_audience:'B2B Business Owners, Export Companies, Traders', target_age_min:28, target_age_max:55 } },

  { id:'t5', industry:'Financial Services', subcategory:'Trade Finance', badge:'TRENDING',
    name:'Trade Finance Solutions', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/trade-finance.png',
    overlay:'linear-gradient(180deg,rgba(15,15,40,0.15) 0%,rgba(15,15,40,0.92) 100%)',
    preview:{ headline:'Trade Finance Made Easy', sub:'LC · Bank Guarantee · Funding', cta:'Learn More' },
    description:'Seamless trade finance for importers & exporters.',
    content:{ headline:'Trade Finance Made Easy', description:'Letters of credit, bank guarantees & export funding. Trusted by 1000+ traders.', cta_button:'Learn More', target_audience:'Importers, Exporters, Trading Companies', target_age_min:30, target_age_max:60 } },

  { id:'t6', industry:'Financial Services', subcategory:'Personal Loan', badge:'HOT',
    name:'Quick Personal Loan', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/personal-loan.png',
    overlay:'linear-gradient(180deg,rgba(10,30,80,0.15) 0%,rgba(10,30,80,0.92) 100%)',
    preview:{ headline:'Loan in 30 Minutes', sub:'Instant KYC · Zero Paperwork', cta:'Apply Now' },
    description:'Instant approval in 24 hours. Minimal documentation.',
    content:{ headline:'Loan in 30 Minutes', description:'Apply online in minutes. Instant KYC. Zero paperwork hassle.', cta_button:'Apply Now', target_audience:'Salaried Professionals, Self-Employed, SME Owners', target_age_min:24, target_age_max:50 } },

  { id:'t6b', industry:'Financial Services', subcategory:'Personal Loan', badge:null,
    name:'Quick Personal Loan 2', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/personal-loan%20%282%29.png',
    overlay:'linear-gradient(180deg,rgba(10,30,80,0.15) 0%,rgba(10,30,80,0.92) 100%)',
    preview:{ headline:'Loan in 30 Minutes', sub:'Instant KYC · Zero Paperwork', cta:'Apply Now' },
    description:'Instant approval in 24 hours. Minimal documentation.',
    content:{ headline:'Loan in 30 Minutes', description:'Apply online in minutes. Instant KYC. Zero paperwork hassle.', cta_button:'Apply Now', target_audience:'Salaried Professionals, Self-Employed, SME Owners', target_age_min:24, target_age_max:50 } },

  { id:'t6c', industry:'Financial Services', subcategory:'Personal Loan', badge:null,
    name:'Quick Personal Loan 3', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/personal-loan%20%283%29.png',
    overlay:'linear-gradient(180deg,rgba(10,30,80,0.15) 0%,rgba(10,30,80,0.92) 100%)',
    preview:{ headline:'Loan in 30 Minutes', sub:'Instant KYC · Zero Paperwork', cta:'Apply Now' },
    description:'Instant approval in 24 hours. Minimal documentation.',
    content:{ headline:'Loan in 30 Minutes', description:'Apply online in minutes. Instant KYC. Zero paperwork hassle.', cta_button:'Apply Now', target_audience:'Salaried Professionals, Self-Employed, SME Owners', target_age_min:24, target_age_max:50 } },

  { id:'t7', industry:'Financial Services', subcategory:'Home Loan', badge:'NEW',
    name:'Home Loan, Simplified', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/home-loan.png',
    overlay:'linear-gradient(180deg,rgba(23,52,4,0.15) 0%,rgba(23,52,4,0.92) 100%)',
    preview:{ headline:'Home Loan, Simplified', sub:'8.4% Interest · Upto 90% Funding', cta:'Check Eligibility' },
    description:'Affordable home loans with quick approvals.',
    content:{ headline:'Home Loan, Simplified', description:'Upto 90% property value financed. Interest from 8.4%. Quick digital approval.', cta_button:'Check Eligibility', target_audience:'Home Buyers, NRIs, Young Professionals', target_age_min:26, target_age_max:55 } },

  { id:'t7b', industry:'Financial Services', subcategory:'Home Loan', badge:null,
    name:'Home Loan, Simplified 2', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/home-loan%20%282%29.png',
    overlay:'linear-gradient(180deg,rgba(23,52,4,0.15) 0%,rgba(23,52,4,0.92) 100%)',
    preview:{ headline:'Home Loan, Simplified', sub:'8.4% Interest · Upto 90% Funding', cta:'Check Eligibility' },
    description:'Affordable home loans with quick approvals.',
    content:{ headline:'Home Loan, Simplified', description:'Upto 90% property value financed. Interest from 8.4%. Quick digital approval.', cta_button:'Check Eligibility', target_audience:'Home Buyers, NRIs, Young Professionals', target_age_min:26, target_age_max:55 } },

  { id:'t7c', industry:'Financial Services', subcategory:'Home Loan', badge:null,
    name:'Home Loan, Simplified 3', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/home-loan%20%283%29.png',
    overlay:'linear-gradient(180deg,rgba(23,52,4,0.15) 0%,rgba(23,52,4,0.92) 100%)',
    preview:{ headline:'Home Loan, Simplified', sub:'8.4% Interest · Upto 90% Funding', cta:'Check Eligibility' },
    description:'Affordable home loans with quick approvals.',
    content:{ headline:'Home Loan, Simplified', description:'Upto 90% property value financed. Interest from 8.4%. Quick digital approval.', cta_button:'Check Eligibility', target_audience:'Home Buyers, NRIs, Young Professionals', target_age_min:26, target_age_max:55 } },

  { id:'t8', industry:'Financial Services', subcategory:'Gold Loan', badge:'POPULAR',
    name:'Instant Gold Loan', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/gold-loan.png',
    overlay:'linear-gradient(180deg,rgba(65,36,2,0.15) 0%,rgba(65,36,2,0.92) 100%)',
    preview:{ headline:'Instant Gold Loan', sub:'Highest Value · Funds in 30 mins', cta:'Apply Now' },
    description:'Get cash instantly against your gold. Safe & secure.',
    content:{ headline:'Instant Gold Loan', description:'Highest valuation guaranteed. Funds disbursed in 30 minutes. 100% safe storage.', cta_button:'Apply Now', target_audience:'Self-Employed, Small Business Owners, Households', target_age_min:25, target_age_max:60 } },

  { id:'t8b', industry:'Financial Services', subcategory:'Gold Loan', badge:null,
    name:'Instant Gold Loan 2', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/gold-loan%20%282%29.png',
    overlay:'linear-gradient(180deg,rgba(65,36,2,0.15) 0%,rgba(65,36,2,0.92) 100%)',
    preview:{ headline:'Instant Gold Loan', sub:'Highest Value · Funds in 30 mins', cta:'Apply Now' },
    description:'Get cash instantly against your gold. Safe & secure.',
    content:{ headline:'Instant Gold Loan', description:'Highest valuation guaranteed. Funds disbursed in 30 minutes. 100% safe storage.', cta_button:'Apply Now', target_audience:'Self-Employed, Small Business Owners, Households', target_age_min:25, target_age_max:60 } },

  { id:'t9', industry:'Financial Services', subcategory:'Vehicle Loan', badge:null,
    name:'Commercial Vehicle Loan', imageUrl:'https://res.cloudinary.com/uizsfleb/image/upload/adnexus/templates/financial-services/vechile-loan.png',
    overlay:'linear-gradient(180deg,rgba(4,44,83,0.15) 0%,rgba(4,44,83,0.92) 100%)',
    preview:{ headline:'Drive Your Business Forward', sub:'Upto 100% Financing · Low EMI', cta:'Get Started' },
    description:'Finance new & used commercial vehicles easily.',
    content:{ headline:'Drive Your Business Forward', description:'Upto 100% on-road financing for commercial vehicles. Quick approval, low EMIs.', cta_button:'Get Started', target_audience:'Fleet Owners, Transporters, Logistics Businesses', target_age_min:25, target_age_max:58 } },

  { id:'t10', industry:'Financial Services', subcategory:'Education Loan', badge:'TRENDING',
    name:'Education Loan', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(38,33,92,0.15) 0%,rgba(38,33,92,0.92) 100%)',
    preview:{ headline:'Fund Your Future', sub:'Study Anywhere · No Collateral upto ₹20L', cta:'Apply Now' },
    description:'Education loans for India & abroad studies.',
    content:{ headline:'Fund Your Future', description:'No collateral upto ₹20L. Covers tuition, travel & living costs. Flexible moratorium.', cta_button:'Apply Now', target_audience:'Students, Parents, Working Professionals', target_age_min:18, target_age_max:45 } },

  // ── IT & Technology ──
  { id:'it1', industry:'IT & Technology', subcategory:'SaaS Product', badge:'NEW',
    name:'SaaS Automation', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(60,10,130,.15) 0%,rgba(20,5,60,.88) 100%)',
    preview:{ headline:'Automate Your Biz', sub:'Free 14-Day Trial', cta:'Get Started' },
    description:'Join 5,000+ companies. No setup fees. Cancel anytime.',
    content:{ headline:'Automate Your Biz', description:"Join 5,000+ companies. No setup fees. Cancel anytime.", cta_button:'Get Started', target_audience:'CTOs, Operations Heads, Business Owners', target_age_min:25, target_age_max:50 } },

  { id:'it2', industry:'IT & Technology', subcategory:'Cybersecurity', badge:null,
    name:'Secure Your Business', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(5,10,30,.15) 0%,rgba(5,10,30,.88) 100%)',
    preview:{ headline:'Zero Trust Security', sub:'Enterprise Grade · Always On', cta:'Get Demo' },
    description:'Protect your business with enterprise-grade security.',
    content:{ headline:'Zero Trust Security', description:'Enterprise cybersecurity for modern businesses. 24/7 monitoring. ISO 27001 certified.', cta_button:'Get Demo', target_audience:'CTOs, IT Managers, Security Teams', target_age_min:28, target_age_max:52 } },

  { id:'it3', industry:'IT & Technology', subcategory:'Digital Agency', badge:'HOT',
    name:'Digital Growth', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(10,20,80,.15) 0%,rgba(10,20,80,.88) 100%)',
    preview:{ headline:'Grow Your Digital Brand', sub:'SEO · Ads · Social Media', cta:"Let's Talk" },
    description:'Full-service digital agency. Measurable results.',
    content:{ headline:'Grow Your Digital Brand', description:'Full-stack digital marketing. SEO, PPC, Social Media. ROI-driven campaigns.', cta_button:"Let's Talk", target_audience:'Marketing Heads, Founders, CMOs', target_age_min:26, target_age_max:50 } },

  // ── Real Estate & Construction ──
  { id:'re1', industry:'Real Estate & Construction', subcategory:'Residential Property', badge:'TOP',
    name:'Dream Home', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(8,25,55,.15) 0%,rgba(8,25,55,.85) 100%)',
    preview:{ headline:'Your Dream Home Awaits', sub:'Ready to Move · Prime Location', cta:'Enquire Now' },
    description:"Find your perfect home in the city's best locations.",
    content:{ headline:'Your Dream Home Awaits', description:'Premium residential apartments in prime locations. Ready to move. RERA approved.', cta_button:'Enquire Now', target_audience:'Home Buyers, NRIs, Young Professionals', target_age_min:28, target_age_max:55 } },

  { id:'re2', industry:'Real Estate & Construction', subcategory:'Commercial Property', badge:null,
    name:'Office Spaces', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(10,30,60,.15) 0%,rgba(10,30,60,.85) 100%)',
    preview:{ headline:'Premium Office Space', sub:'Fully Furnished · Plug & Play', cta:'Book Tour' },
    description:'Modern workspaces for modern teams. Move in today.',
    content:{ headline:'Premium Office Space', description:'Fully furnished Grade-A offices. Plug & play. Flexible lease terms. Central location.', cta_button:'Book Tour', target_audience:'Founders, CXOs, Real Estate Heads', target_age_min:30, target_age_max:55 } },

  // ── Healthcare & Pharma ──
  { id:'hc1', industry:'Healthcare & Pharma', subcategory:'Hospital / Clinic', badge:null,
    name:'Healthcare Clinic', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(0,60,80,.15) 0%,rgba(0,60,80,.85) 100%)',
    preview:{ headline:'Expert Care, Near You', sub:'Book Appointment · 24/7 Open', cta:'Book Now' },
    description:'Quality healthcare services. Experienced specialists.',
    content:{ headline:'Expert Care, Near You', description:'World-class healthcare. Experienced specialists. Book appointment in 60 seconds.', cta_button:'Book Now', target_audience:'Patients, Families, Corporate Health Buyers', target_age_min:25, target_age_max:65 } },

  { id:'hc2', industry:'Healthcare & Pharma', subcategory:'Pharmaceutical', badge:'NEW',
    name:'Pharma Distribution', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(0,40,60,.15) 0%,rgba(0,40,60,.85) 100%)',
    preview:{ headline:'Pharma Supply Network', sub:'Pan India · Cold Chain Assured', cta:'Partner Now' },
    description:'Reliable pharmaceutical distribution across India.',
    content:{ headline:'Pharma Supply Network', description:'Pan India pharmaceutical distribution. Cold chain assured. 10,000+ SKUs.', cta_button:'Partner Now', target_audience:'Pharmacies, Hospitals, Distributors', target_age_min:28, target_age_max:58 } },

  // ── Education & Edtech ──
  { id:'ed1', industry:'Education & Edtech', subcategory:'Online Courses', badge:'TRENDING',
    name:'Online Learning', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(20,10,60,.15) 0%,rgba(20,10,60,.85) 100%)',
    preview:{ headline:'Learn. Grow. Succeed.', sub:'500+ Courses · Expert Mentors', cta:'Enroll Now' },
    description:'World-class learning from top instructors.',
    content:{ headline:'Learn. Grow. Succeed.', description:'500+ industry-led courses. Learn at your own pace. Certificate on completion.', cta_button:'Enroll Now', target_audience:'Students, Working Professionals, Job Seekers', target_age_min:18, target_age_max:45 } },

  { id:'ed2', industry:'Education & Edtech', subcategory:'Coaching Center', badge:null,
    name:'JEE / NEET Coaching', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(10,20,60,.15) 0%,rgba(10,20,60,.85) 100%)',
    preview:{ headline:'Crack JEE / NEET 2026', sub:'Expert Faculty · Proven Results', cta:'Join Now' },
    description:'Top coaching with proven results for competitive exams.',
    content:{ headline:'Crack JEE / NEET 2026', description:"India's top coaching institute. Expert faculty. 95% success rate. Scholarship available.", cta_button:'Join Now', target_audience:'Students (Class 11-12), Parents', target_age_min:16, target_age_max:22 } },

  // ── Retail ──
  { id:'rt1', industry:'Retail', subcategory:'Fashion / Clothing', badge:'HOT',
    name:'Fashion Sale', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(60,5,30,.15) 0%,rgba(60,5,30,.85) 100%)',
    preview:{ headline:'Upto 70% Off This Season', sub:'Limited Time · Free Shipping', cta:'Shop Now' },
    description:'Biggest sale of the season. Shop top brands.',
    content:{ headline:'Upto 70% Off This Season', description:'Biggest sale of the year. Top brands. Free shipping above ₹499. Easy returns.', cta_button:'Shop Now', target_audience:'Fashion Shoppers, Millennials, Gen Z', target_age_min:18, target_age_max:40 } },

  { id:'rt2', industry:'Retail', subcategory:'Electronics', badge:null,
    name:'Electronics Deals', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(5,10,40,.15) 0%,rgba(5,10,40,.85) 100%)',
    preview:{ headline:'Best Electronics Deals', sub:'EMI Available · Lowest Price', cta:'Buy Now' },
    description:'Latest gadgets at unbeatable prices.',
    content:{ headline:'Best Electronics Deals', description:'Latest laptops, phones & gadgets. Lowest prices guaranteed. 0% EMI available.', cta_button:'Buy Now', target_audience:'Tech Enthusiasts, Students, Professionals', target_age_min:18, target_age_max:45 } },

  // ── Food & Beverage ──
  { id:'fb1', industry:'Food & Beverage', subcategory:'Restaurant / Cafe', badge:null,
    name:'Restaurant Promo', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(60,15,0,.15) 0%,rgba(60,15,0,.85) 100%)',
    preview:{ headline:'Taste the Difference', sub:'Order Online · 30 Min Delivery', cta:'Order Now' },
    description:'Fresh ingredients, memorable flavors. Order today.',
    content:{ headline:'Taste the Difference', description:'Fresh ingredients. Chef-crafted recipes. 30-minute delivery. Order now!', cta_button:'Order Now', target_audience:'Food Lovers, Families, Office Goers', target_age_min:18, target_age_max:50 } },

  { id:'fb2', industry:'Food & Beverage', subcategory:'Food Franchise', badge:'NEW',
    name:'Franchise Opportunity', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(80,20,0,.15) 0%,rgba(80,20,0,.85) 100%)',
    preview:{ headline:'Own a Food Franchise', sub:'Low Investment · High Returns', cta:'Apply Now' },
    description:'Franchise opportunity. Low investment, proven model.',
    content:{ headline:'Own a Food Franchise', description:'Proven franchise model. Low investment from ₹5L. Full training & support provided.', cta_button:'Apply Now', target_audience:'Entrepreneurs, Investors, Business Owners', target_age_min:25, target_age_max:55 } },

  // ── Logistics & Transport ──
  { id:'lg1', industry:'Logistics & Transport', subcategory:'Courier Services', badge:'NEW',
    name:'Express Delivery', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(5,20,50,.15) 0%,rgba(5,20,50,.85) 100%)',
    preview:{ headline:'Deliver in 24 Hours', sub:'Pan India · Real-time Tracking', cta:'Ship Now' },
    description:'Reliable courier services across India.',
    content:{ headline:'Deliver in 24 Hours', description:'Pan India delivery in 24 hours. Real-time tracking. Lowest rates. API integration.', cta_button:'Ship Now', target_audience:'E-commerce Sellers, D2C Brands, SMEs', target_age_min:24, target_age_max:50 } },

  // ── Manufacturing ──
  { id:'mf1', industry:'Manufacturing', subcategory:'Industrial Goods', badge:null,
    name:'Industrial Supply', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(10,10,10,.15) 0%,rgba(10,10,10,.85) 100%)',
    preview:{ headline:'Built to Perform', sub:'ISO Certified · Bulk Orders', cta:'Get Quote' },
    description:'High-quality industrial goods. Bulk pricing available.',
    content:{ headline:'Built to Perform', description:'ISO 9001 certified manufacturer. Bulk orders welcome. Pan India supply. Custom specs.', cta_button:'Get Quote', target_audience:'Plant Managers, Procurement Heads, SMEs', target_age_min:28, target_age_max:58 } },

  // ── Hospitality & Tourism ──
  { id:'ht1', industry:'Hospitality & Tourism', subcategory:'Hotel / Resort', badge:'POPULAR',
    name:'Luxury Resort', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(5,30,30,.15) 0%,rgba(5,30,30,.85) 100%)',
    preview:{ headline:'Escape & Rejuvenate', sub:'5-Star Comfort · Best Rates', cta:'Book Now' },
    description:'Luxury stays with world-class amenities.',
    content:{ headline:'Escape & Rejuvenate', description:'5-star resort experience. Spa, pool & fine dining. Book direct for best rates.', cta_button:'Book Now', target_audience:'Leisure Travelers, Corporate Guests, HNIs', target_age_min:25, target_age_max:60 } },

  // ── Agriculture ──
  { id:'ag1', industry:'Agriculture & Agro-Processing', subcategory:'Farm Equipment', badge:null,
    name:'Agri Equipment', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(5,30,5,.15) 0%,rgba(5,30,5,.85) 100%)',
    preview:{ headline:'Smart Farming Solutions', sub:'Latest Equipment · EMI Options', cta:'Explore' },
    description:'Modern farm equipment for better yields.',
    content:{ headline:'Smart Farming Solutions', description:'Latest tractors & farm equipment. 0% EMI for 12 months. Service support included.', cta_button:'Explore', target_audience:'Farmers, Agri Entrepreneurs, FPOs', target_age_min:25, target_age_max:60 } },

  // ── Trading & Distribution ──
  { id:'td1', industry:'Trading & Distribution', subcategory:'E-commerce', badge:'HOT',
    name:'E-commerce Growth', imageUrl:null,
    overlay:'linear-gradient(180deg,rgba(10,40,80,.15) 0%,rgba(10,40,80,.85) 100%)',
    preview:{ headline:'Sell More Online', sub:'Marketplace Ready · Low Fees', cta:'Start Selling' },
    description:'Launch your online store and reach millions.',
    content:{ headline:'Sell More Online', description:'List on 10+ marketplaces. Low commission. Logistics support included. Start in 24 hours.', cta_button:'Start Selling', target_audience:'Sellers, Traders, SME Owners', target_age_min:22, target_age_max:50 } },
]
const BADGE_COLORS = {
  POPULAR: '#7C3AED', HOT: '#DC2626', TRENDING: '#0891B2', NEW: '#059669', TOP: '#7B1FA2',
}

const ALL_INDUSTRIES = ['All Templates', ...Object.keys(INDUSTRY_MAP)]

// ══════════════════════════════════════════════════════════════
// CHANGED: hiQualityUrl — added c_limit (prevents upscaling past
// original resolution, the main cause of blur) and e_sharpen
// (crisper edges/text, closer to a Canva-style render).
// w_700 -> w_800 for extra headroom on the larger card size below.
// ══════════════════════════════════════════════════════════════
const hiQualityUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  if (url.includes('q_auto')) return url
  return url.replace('/upload/', '/upload/f_auto,q_auto:best,dpr_2,c_limit,w_800,e_sharpen:60/')
}

const API_BASE = 'http://127.0.0.1:8000/api'

// ══════════════════════════════════════════════════════════════
// RESPONSIVE STYLES — injected once via <style> in both render paths
// ══════════════════════════════════════════════════════════════
const responsiveCSS = `
  * { box-sizing: border-box; }

  @media (max-width: 900px) {
    .split-layout { grid-template-columns: 1fr !important; }
    .template-browser { flex-direction: column !important; height: auto !important; }
    .template-browser .template-main { max-height: 60vh !important; }
    .template-browser .detail-panel { width: 100% !important; min-width: 100% !important; border-left: none !important; border-top: 1px solid #EAECF0 !important; max-height: 380px !important; }
    .standalone-wrap { padding: 18px !important; }
    .standalone-header { flex-wrap: wrap !important; gap: 12px !important; }
  }

  @media (max-width: 640px) {
    .template-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 10px !important; }
    .mode-tabs { grid-template-columns: 1fr !important; }
    .standalone-wrap { padding: 14px !important; }
    .platform-tabs-row { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
    .platform-tabs-row button { flex: 0 0 auto !important; min-width: 100px !important; padding-left: 12px !important; padding-right: 12px !important; }
    .ctx-row { flex-direction: column !important; align-items: flex-start !important; }
    .template-topbar-row { flex-wrap: wrap !important; gap: 10px !important; }
  }
`

// ══════════════════════════════════════════════════════════════
// CREATIVE HEALTH SCORE PANEL — unchanged from original
// ══════════════════════════════════════════════════════════════
const HealthScorePanel = ({ healthData, leadFormUrl }) => {
  if (!healthData) return null
  const score      = healthData.overall_score || 0
  const plats      = healthData.platforms     || {}
  const scoreColor = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  const scoreBg    = score >= 80 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2'
  const scoreBorder= score >= 80 ? '#bbf7d0' : score >= 50 ? '#fde68a' : '#fecaca'
  return (
    <div style={{ background: scoreBg, border: `1.5px solid ${scoreBorder}`, borderRadius: '12px', padding: '16px 18px', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🎯</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e' }}>Creative Health</span>
        </div>
        <div style={{ background: scoreColor, color: '#fff', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>Score: {score}/100</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        {Object.entries(plats).map(([name, data]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: data.compatible ? '#16a34a' : '#dc2626', fontWeight: '700' }}>{data.compatible ? '✓' : '✗'}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{name}</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: data.compatible ? '#16a34a' : '#dc2626' }}>{data.compatible ? 'Compatible' : 'Needs Fix'}</span>
          </div>
        ))}
      </div>
      {Object.entries(plats).some(([, d]) => d.issues?.length > 0) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', marginBottom: '6px' }}>⚠️ Issues to fix:</div>
          {Object.entries(plats).map(([name, data]) => data.issues?.map((issue, i) => (
            <div key={`${name}-${i}`} style={{ fontSize: '11px', color: '#92400e', marginBottom: '3px' }}>• {name}: {issue}</div>
          )))}
        </div>
      )}
      {leadFormUrl && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', marginBottom: '4px' }}>🔗 Lead Form URL</div>
          <div style={{ fontSize: '11px', color: '#1d4ed8', fontFamily: 'monospace', wordBreak: 'break-all' }}>{leadFormUrl}</div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LIVE PREVIEW PANEL — unchanged from original
// ══════════════════════════════════════════════════════════════
const LivePreviewPanel = ({ platform, content, previewImage }) => {
  if (!platform) return null
  const hasContent = content?.headline || content?.description || previewImage
  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', position: 'sticky', top: '20px' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Preview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: platform.color, background: platform.color + '12', padding: '3px 10px', borderRadius: '20px', border: `1px solid ${platform.color}30` }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: platform.color }} />
          {platform.name}
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        {!hasContent ? (
          <div style={{ border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>Select a template or generate with AI to see a preview</div>
          </div>
        ) : (
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            {previewImage ? (
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                <img src={previewImage} alt="Ad creative" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)' }} />
                {content?.headline && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 14px 12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', lineHeight: '1.3' }}>{content.headline}</div>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: platform.color, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '5px' }}>{platform.name}</div>
              </div>
            ) : content?.headline && (
              <div style={{ padding: '14px', background: platform.color + '10', borderBottom: '1px solid ' + platform.color + '20' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{content.headline}</div>
              </div>
            )}
            <div style={{ padding: '12px 14px', background: '#fff' }}>
              {content?.description && <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{content.description}</p>}
              {content?.cta_button && <button style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', background: platform.color, color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'default', fontFamily: 'inherit' }}>{content.cta_button}</button>}
            </div>
          </div>
        )}
        {content?.headline && (
          <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f8faff', borderRadius: '8px', border: '1px solid #e8eaf0' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Character limits for {platform.name}</div>
            {(() => {
              const limits = PLATFORM_LIMITS[platform.name] || {}
              const hlLen  = (content.headline    || '').length
              const dLen   = (content.description || '').length
              const hlOver = limits.headline    && hlLen > limits.headline
              const dOver  = limits.description && dLen  > limits.description
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: hlOver ? '#dc2626' : '#6b7280' }}>Headline</span>
                    <span style={{ fontWeight: '600', color: hlOver ? '#dc2626' : '#16a34a' }}>{hlLen}/{limits.headline || '—'} {hlOver ? '⚠️ Too long' : '✓'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: dOver ? '#dc2626' : '#6b7280' }}>Description</span>
                    <span style={{ fontWeight: '600', color: dOver ? '#dc2626' : '#16a34a' }}>{dLen}/{limits.description || '—'} {dOver ? '⚠️ Too long' : '✓'}</span>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasContent ? '#10B981' : '#D1D5DB' }} />
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{platform.name}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: hasContent ? '#059669' : '#9CA3AF' }}>{hasContent ? '✓ Ready' : 'Pending'}</span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CANVA-STYLE TEMPLATE BROWSER
// Replaces old templateScreen. Receives applyTemplate + onDone
//
// CHANGED: grid card min-width 200px -> 260px, and thumbnail
// height 155px -> 210px, so baked-in text inside template
// images (e.g. "FAST BUSINESS LOAN") stays legible instead of
// being squeezed into an illegibly small box.
// ══════════════════════════════════════════════════════════════
const TemplateBrowser = ({ onApply, onUpload, onSwitchToAI, selectedTemplateId, fileInputRef, defaultIndustry, defaultSubcategory }) => {
  const validIndustry = defaultIndustry && INDUSTRY_MAP[defaultIndustry] ? defaultIndustry : 'All Templates'
  const [activeIndustry, setActiveIndustry] = useState(validIndustry)
  const [activeSub,      setActiveSub]      = useState(defaultSubcategory || null)
  const [search,         setSearch]         = useState('')
  const [searchFocused,  setSearchFocused]  = useState(false)
  const [hoveredId,      setHoveredId]      = useState(null)
  const [detailId,       setDetailId]       = useState(null)

  const subcategories = activeIndustry !== 'All Templates'
    ? INDUSTRY_MAP[activeIndustry]?.subcategories || []
    : []

  const filtered = useMemo(() => {
    let list = PREBUILT_TEMPLATES
    if (activeIndustry !== 'All Templates') list = list.filter(t => t.industry === activeIndustry)
    if (activeSub) list = list.filter(t => t.subcategory === activeSub)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.preview.headline.toLowerCase().includes(q) ||
        t.industry.toLowerCase().includes(q) ||
        t.subcategory.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeIndustry, activeSub, search])

  const detailTemplate = PREBUILT_TEMPLATES.find(t => t.id === detailId)

  return (
    <div className="template-browser" style={{ display: 'flex', height: '520px', borderRadius: '12px', border: '1.5px solid #E5E7EB', overflow: 'hidden', background: '#F8F9FB' }}>

      {/* ── MAIN AREA ── */}
      <div className="template-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #EAECF0', padding: '10px 14px', flexShrink: 0 }}>
          <div className="template-topbar-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: subcategories.length ? '8px' : '0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                {activeIndustry === 'All Templates' ? 'All Templates' : activeIndustry}
              </div>
              <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>{filtered.length} template{filtered.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => fileInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                ↑ Upload
              </button>
              <button onClick={onSwitchToAI}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '7px', border: 'none', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
                ✨ AI
              </button>
            </div>
          </div>
          {/* Subcategory pills */}
          {subcategories.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
              <button onClick={() => setActiveSub(null)}
                style={{ padding: '4px 11px', borderRadius: '20px', border: '1.5px solid', borderColor: !activeSub ? '#1A73E8' : '#E5E7EB', background: !activeSub ? '#EFF6FF' : '#fff', color: !activeSub ? '#1A73E8' : '#6B7280', fontSize: '11px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>All</button>
              {subcategories.map(sub => {
                const isA = activeSub === sub
                const has = PREBUILT_TEMPLATES.some(t => t.industry === activeIndustry && t.subcategory === sub)
                return (
                  <button key={sub} onClick={() => setActiveSub(isA ? null : sub)}
                    style={{ padding: '4px 11px', borderRadius: '20px', border: '1.5px solid', borderColor: isA ? '#1A73E8' : '#E5E7EB', background: isA ? '#EFF6FF' : '#fff', color: isA ? '#1A73E8' : has ? '#374151' : '#C4C8D0', fontSize: '11px', fontWeight: isA ? '600' : '400', cursor: has ? 'pointer' : 'default', whiteSpace: 'nowrap', fontFamily: 'inherit', opacity: has ? 1 : 0.5 }}>
                    {sub}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Template grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '8px', color: '#9CA3AF' }}>
              <div style={{ fontSize: '32px' }}>🔍</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>No templates found</div>
              <div style={{ fontSize: '12px' }}>Try a different category or <span style={{ color: '#1A73E8', cursor: 'pointer', textDecoration: 'underline' }} onClick={onSwitchToAI}>generate with AI</span></div>
            </div>
          ) : (
            <div className="template-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {filtered.map(template => {
                const isSelected = selectedTemplateId === template.id
                const isHovered  = hoveredId === template.id
                const badge      = template.badge ? BADGE_COLORS[template.badge] : null
                return (
                  <div
                    key={template.id}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setDetailId(template.id === detailId ? null : template.id)}
                    style={{ borderRadius: '12px', overflow: 'hidden', border: isSelected ? '2.5px solid #1A73E8' : '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', boxShadow: isSelected ? '0 0 0 3px rgba(26,115,232,0.13)' : isHovered ? '0 8px 22px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.05)', transform: isHovered && !isSelected ? 'translateY(-3px)' : 'none', transition: 'transform 0.18s, box-shadow 0.18s', position: 'relative' }}
                  >
                    <div style={{ position: 'relative', height: '210px', overflow: 'hidden', background: '#F3F4F6' }}>
                      {template.imageUrl ? (
                        <img
                          src={hiQualityUrl(template.imageUrl)}
                          alt={template.name}
                          loading="eager"
                          decoding="async"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.35s', transform: isHovered ? 'scale(1.06)' : 'scale(1)' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: template.overlay ? template.overlay.replace(/rgba\(([^)]+),[\s]*0?\.\d+\)/g, (m, rgb) => `rgba(${rgb},1)`) : 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '28px', opacity: 0.85 }}>🗂️</span>
                        </div>
                      )}
                      {badge && !isSelected && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: badge, color: '#fff', fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.06em', zIndex: 2 }}>{template.badge}</div>
                      )}
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '22px', height: '22px', background: '#1A73E8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: '12px', color: '#fff', fontWeight: '700' }}>✓</div>
                      )}
                      {/* Canva-style hover overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '7px', opacity: isHovered ? 1 : 0, transition: 'opacity 0.16s', zIndex: 3 }}>
                        <button
                          onClick={e => { e.stopPropagation(); onApply(template) }}
                          style={{ padding: '8px 0', width: '80%', borderRadius: '7px', border: 'none', background: '#1A73E8', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                        >Use this template</button>
                        <button
                          onClick={e => { e.stopPropagation(); setDetailId(template.id === detailId ? null : template.id) }}
                          style={{ padding: '6px 0', width: '80%', borderRadius: '7px', border: '1.5px solid rgba(255,255,255,.7)', background: 'transparent', color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                        >Preview</button>
                      </div>
                    </div>
                    <div style={{ padding: '11px 12px 12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.name}</div>
                      <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: '600', color: badge || '#6B7280', background: badge ? badge + '15' : '#F3F4F6', border: `1px solid ${badge ? badge + '30' : '#E5E7EB'}`, padding: '2px 8px', borderRadius: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{template.subcategory}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL PANEL — slides in when a card is clicked ── */}
      {detailTemplate && (
        <div className="detail-panel" style={{ width: '260px', minWidth: '260px', background: '#fff', borderLeft: '1px solid #EAECF0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>Template details</span>
            <button onClick={() => setDetailId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '17px', padding: 0, lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', position: 'relative', height: '160px', background: '#F3F4F6' }}>
              {detailTemplate.imageUrl ? (
                <img src={hiQualityUrl(detailTemplate.imageUrl)} alt={detailTemplate.name} loading="eager" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1A73E8,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '30px', opacity: 0.85 }}>🗂️</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: detailTemplate.overlay }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>{detailTemplate.preview.headline}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.85)', marginTop: '2px' }}>{detailTemplate.preview.sub}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{detailTemplate.name}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.55', marginBottom: '12px' }}>{detailTemplate.description}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', color: '#1A73E8', background: '#EFF6FF', padding: '3px 9px', borderRadius: '20px', fontWeight: '500' }}>{detailTemplate.industry}</span>
              <span style={{ fontSize: '10px', color: '#374151', background: '#F3F4F6', padding: '3px 9px', borderRadius: '20px', fontWeight: '500' }}>{detailTemplate.subcategory}</span>
              {detailTemplate.badge && (
                <span style={{ fontSize: '10px', color: '#fff', background: BADGE_COLORS[detailTemplate.badge], padding: '3px 9px', borderRadius: '20px', fontWeight: '600' }}>{detailTemplate.badge}</span>
              )}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>Works on all platforms</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {[{n:'Google',c:'#1A73E8'},{n:'LinkedIn',c:'#0A66C2'},{n:'Facebook',c:'#1877F2'},{n:'Instagram',c:'#E1306C'}].map(p => (
                  <div key={p.n} style={{ fontSize: '10px', color: p.c, background: p.c + '12', border: `1.5px solid ${p.c}30`, padding: '3px 9px', borderRadius: '20px', fontWeight: '600' }}>{p.n}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <button
                onClick={() => { onApply(detailTemplate); setDetailId(null) }}
                style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#1A73E8', color: '#fff', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              >Use this template</button>
              <button
                onClick={onSwitchToAI}
                style={{ padding: '9px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '12.5px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
              >Customise with AI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN AdContent COMPONENT — same interface as original
// Only templateScreen is replaced with <TemplateBrowser>
// Everything else (applyTemplate, handleAiGenerate, formSection,
// LivePreviewPanel, HealthScorePanel) is IDENTICAL
// ══════════════════════════════════════════════════════════════
const AdContent = ({
  embedded = false,
  selectedPlatforms: embeddedPlatforms = [],
  adContents: embeddedContents = {},
  onAdContentsChange,
  onNext,
  onBack,
  campaignId: embeddedCampaignId,
  campaignData = {},
}) => {
  const params     = useParams()
  const navigate   = useNavigate()
  const campaignId = embedded ? embeddedCampaignId : params.campaignId

  const platformList = embedded
    ? platforms.filter(p => embeddedPlatforms.includes(p.id))
    : platforms

  const [mode,             setMode]             = useState('template')
  const [activePlatform,   setActivePlatform]   = useState(embedded ? (embeddedPlatforms[0] || 1) : 1)
  const [loading,          setLoading]          = useState(false)
  const [aiLoading,        setAiLoading]        = useState(false)
  const [success,          setSuccess]          = useState('')
  const [error,            setError]            = useState('')
  const [savedContents,    setSavedContents]    = useState([])
  const [localContents,    setLocalContents]    = useState(embeddedContents)
  const [aiPrompt,         setAiPrompt]         = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [activeTab,        setActiveTab]        = useState('template')
  const [healthData,       setHealthData]       = useState(null)
  const [leadFormUrl,      setLeadFormUrl]      = useState('')
  const [platformImages,   setPlatformImages]   = useState({})

  const globalFileRef = useRef(null)

  useEffect(() => { if (!embedded && campaignId) fetchAdContents() }, [campaignId])
  useEffect(() => { setLocalContents(embeddedContents) }, [embeddedContents])
  useEffect(() => {
    if (campaignData?.business_niche) {
      setAiPrompt(`${campaignData.business_niche}${campaignData.goal ? ` — Goal: ${campaignData.goal}` : ''}`)
    }
  }, [campaignData])

  const fetchAdContents = async () => {
    try {
      const res = await getAdContents(campaignId)
      setSavedContents(res.data.ad_contents || [])
    } catch (err) { console.error('Fetch failed') }
  }

  const handleContentChange = (platformId, field, value) => {
    const updated = { ...localContents, [platformId]: { ...localContents[platformId], [field]: value } }
    setLocalContents(updated)
    if (embedded && onAdContentsChange) onAdContentsChange(updated)
    setHealthData(null)
  }

  // applyTemplate is UNCHANGED — same signature, same logic
  const applyTemplate = (template) => {
    setSelectedTemplate(template.id)
    const newImages = {}
    platformList.forEach(p => { newImages[p.id] = template.imageUrl })
    setPlatformImages(newImages)
    const updated = { ...localContents }
    platformList.forEach(p => {
      updated[p.id] = { ...template.content, image_url: template.imageUrl }
    })
    setLocalContents(updated)
    if (embedded && onAdContentsChange) onAdContentsChange(updated)
    setHealthData(null)
    // Auto-advance to form after selecting
    setMode('form')
    setActiveTab('template')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const imgData = ev.target.result
      const newImages = {}
      platformList.forEach(p => { newImages[p.id] = imgData })
      setPlatformImages(newImages)
      const updated = { ...localContents }
      platformList.forEach(p => {
        updated[p.id] = {
          ...updated[p.id],
          image_url:   imgData,
          headline:    updated[p.id]?.headline    || 'Your Custom Ad',
          description: updated[p.id]?.description || 'Custom ad design uploaded.',
          cta_button:  updated[p.id]?.cta_button  || 'Apply Now',
        }
      })
      setLocalContents(updated)
      if (embedded && onAdContentsChange) onAdContentsChange(updated)
      setSelectedTemplate('upload_global')
      setMode('form')
      setHealthData(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) { setError('Please enter a prompt first!'); return }
    setAiLoading(true); setError(''); setHealthData(null)
    setPlatformImages({})
    const platformNames = platformList.map(p => p.name)
    try {
      const response = await fetch(`${API_BASE}/campaigns/ai-generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name:  campaignData?.name   || 'B2B Campaign',
          business_niche: aiPrompt,
          goal:           campaignData?.goal   || 'Lead Gen',
          budget:         campaignData?.budget ? String(campaignData.budget) : '',
          platforms:      platformNames,
        }),
      })
      if (!response.ok) { const e = await response.json(); throw new Error(e.detail || 'Server error') }
      const data = await response.json()
      const aiImageUrl = data.image_url || null
      const newImages = {}
      platformList.forEach(p => { if (aiImageUrl) newImages[p.id] = aiImageUrl })
      setPlatformImages(newImages)
      const updated = { ...localContents }
      platformList.forEach(p => {
        const ai = data.platforms?.[p.name]
        if (ai) {
          updated[p.id] = {
            headline: ai.headline || '', description: ai.description || '',
            cta_button: ai.cta_button || 'Apply Now', target_audience: ai.target_audience || '',
            target_age_min: ai.target_age_min || 28, target_age_max: ai.target_age_max || 55,
            image_url: aiImageUrl || '',
          }
        }
      })
      setLocalContents(updated)
      if (embedded && onAdContentsChange) onAdContentsChange(updated)
      setSelectedTemplate(null); setMode('form')
    } catch (err) {
      setError('AI generation failed. Please try again!')
    } finally { setAiLoading(false) }
  }

  const handleStandaloneSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('')
    const content = localContents[activePlatform] || {}
    try {
      const res = await createAdContent(campaignId, {
        ...content, platform_id: activePlatform,
        target_age_min: parseInt(content.target_age_min) || 25,
        target_age_max: parseInt(content.target_age_max) || 55,
      })
      if (res.data?.creative_health) setHealthData(res.data.creative_health)
      if (res.data?.lead_form_url)   setLeadFormUrl(res.data.lead_form_url)
      setSuccess(`${platforms.find(p => p.id === activePlatform).name} ad content saved!`)
      fetchAdContents()
    } catch (err) {
      setError('Ad content could not be saved!')
    } finally { setLoading(false) }
  }

  const currentPlatform     = platforms.find(p => p.id === activePlatform) || platformList[0]
  const content             = localContents[activePlatform] || {}
  const currentPreviewImage = platformImages[activePlatform] || content.image_url || null
  const selectedTemplateObj = PREBUILT_TEMPLATES.find(t => t.id === selectedTemplate)

  // ── Mode Tabs — Templates vs AI Generate, visually differentiated ──
  const ModeTabs = () => (
    <div className="mode-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
      {/* Templates tab */}
      <div onClick={() => { setActiveTab('template'); setMode('template') }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '10px', cursor: 'pointer',
          border: activeTab === 'template' ? '1.5px solid #1A73E8' : '1.5px solid #E5E7EB',
          background: activeTab === 'template' ? '#EFF6FF' : '#fff',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <span style={{ fontSize: '20px', width: '36px', height: '36px', borderRadius: '8px', background: activeTab === 'template' ? '#DBEAFE' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⊞</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: activeTab === 'template' ? '#1A73E8' : '#374151' }}>Templates</div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>Prebuilt ad designs</div>
        </div>
      </div>

      {/* AI Generate tab — gradient accent to signal "premium/smart" */}
      <div onClick={() => { setActiveTab('ai'); setMode('ai') }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '10px', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
          border: activeTab === 'ai' ? '1.5px solid transparent' : '1.5px solid #E5E7EB',
          background: activeTab === 'ai'
            ? 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg,#1A73E8,#7C3AED) border-box'
            : '#fff',
          boxShadow: activeTab === 'ai' ? '0 4px 14px rgba(124,58,237,0.16)' : 'none',
          transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{
          fontSize: '18px', width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: activeTab === 'ai' ? 'linear-gradient(135deg,#1A73E8,#7C3AED)' : '#F3F4F6',
          color: activeTab === 'ai' ? '#fff' : '#374151',
        }}>✦</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: activeTab === 'ai' ? '#7C3AED' : '#374151' }}>AI Generate</span>
            <span style={{ fontSize: '8px', fontWeight: '700', color: '#7C3AED', background: '#F3E8FF', padding: '1px 6px', borderRadius: '8px', letterSpacing: '0.04em' }}>SMART</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>Create with AI</div>
        </div>
      </div>
    </div>
  )

  // ── AI Screen — unchanged ──
  const aiScreen = (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px 22px' }}>
      {(campaignData?.name || campaignData?.goal || campaignData?.budget) && (
        <div className="ctx-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Campaign context:</span>
          {campaignData.name   && <span style={s.ctxChip}>📋 {campaignData.name}</span>}
          {campaignData.goal   && <span style={s.ctxChip}>🎯 {campaignData.goal}</span>}
          {campaignData.budget && <span style={s.ctxChip}>💰 ₹{parseInt(campaignData.budget).toLocaleString()}/day</span>}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>Generating for:</span>
        {platformList.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: p.color + '15', border: `1.5px solid ${p.color}40` }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color }} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: p.color }}>{p.name}</span>
          </div>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', marginBottom: '6px' }}>✓ AI will respect platform character limits:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(PLATFORM_LIMITS).map(([name, limits]) => (
            <span key={name} style={{ fontSize: '10px', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>{name}: {limits.headline}h / {limits.description}d chars</span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={s.label}>Describe your product / offer</label>
        <textarea
          style={{ width: '100%', padding: '11px 13px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#FAFAFA', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.6' }}
          rows={5}
          placeholder="e.g. Working capital loan upto ₹50 lakhs for businesses with ₹10Cr+ turnover. Instant approval in 24 hours, minimal documentation."
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
        />
        <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginTop: '5px' }}>More detail = better results. Mention your USP, target customer, and key benefits.</span>
      </div>
      {error && <div style={s.errorBox}>{error}</div>}
      <button style={aiLoading ? s.btnDisabled : s.aiGenerateBtn} disabled={aiLoading} onClick={handleAiGenerate}>
        {aiLoading
          ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><span style={s.aiSpinner} />Generating for {platformList.length} platform{platformList.length > 1 ? 's' : ''}...</span>
          : `✨ Generate Ads for ${platformList.length} Platform${platformList.length > 1 ? 's' : ''}`}
      </button>
      {!aiLoading && (
        <div style={s.btnRow}>
          <button style={s.backStepBtn} onClick={embedded ? onBack : () => navigate(-1)}>← Back</button>
          {embedded && <button style={s.nextStepBtn} onClick={onNext}>Skip & Continue →</button>}
        </div>
      )}
    </div>
  )

  // ── Form Section — unchanged ──
  const formSection = (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: '600', color: '#1A73E8' }}>
          <span style={{ fontSize: '14px' }}>{selectedTemplate ? (selectedTemplate.startsWith('upload_') ? '🖼️' : '🗂️') : '✨'}</span>
          {selectedTemplate ? selectedTemplate.startsWith('upload_') ? 'Custom Upload — review & edit' : 'Template Applied — review & edit' : 'AI Generated — review & edit'}
        </div>
        <button
          style={{ background: 'none', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '11px', cursor: 'pointer', padding: '5px 11px', borderRadius: '6px', fontFamily: 'inherit', fontWeight: '500' }}
          onClick={() => { setMode('template'); setActiveTab('template'); setPlatformImages({}) }}
        >↩ Change</button>
      </div>
      <div className="platform-tabs-row" style={{ display: 'flex', borderBottom: '1px solid #F3F4F6' }}>
        {platformList.map(p => {
          const isSaved  = embedded ? !!(localContents[p.id]?.headline) : savedContents.find(c => c.platform_id === p.id)
          const pContent = localContents[p.id] || {}
          const limits   = PLATFORM_LIMITS[p.name] || {}
          const hasIssue = (pContent.headline?.length > limits.headline) || (pContent.description?.length > limits.description)
          return (
            <button key={p.id} onClick={() => setActivePlatform(p.id)}
              style={{ flex: 1, padding: '11px 8px', border: 'none', background: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', borderBottom: activePlatform === p.id ? `2.5px solid ${p.color}` : '2.5px solid transparent', color: activePlatform === p.id ? p.color : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontFamily: 'inherit' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color }} />
              {p.name}
              {hasIssue && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', padding: '1px 5px', borderRadius: '10px', fontWeight: '600' }}>⚠️</span>}
              {isSaved && !hasIssue && <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: '10px', padding: '1px 5px', borderRadius: '10px', fontWeight: '600' }}>✓</span>}
            </button>
          )
        })}
      </div>
      <form onSubmit={embedded ? e => e.preventDefault() : handleStandaloneSubmit} style={{ padding: '18px 20px' }}>
        {success && <div style={s.successBox}>{success}</div>}
        {error   && <div style={s.errorBox}>{error}</div>}
        <HealthScorePanel healthData={healthData} leadFormUrl={leadFormUrl} />
        <div style={{ marginBottom: '14px', marginTop: healthData ? '16px' : '0' }}>
          <label style={s.label}>Headline</label>
          <div style={{ position: 'relative' }}>
            <input style={{ ...s.input, borderColor: (content.headline || '').length > (PLATFORM_LIMITS[currentPlatform?.name]?.headline || 999) ? '#DC2626' : '#E5E7EB' }}
              type="text" placeholder="Working Capital Loan — Instant Approval"
              value={content.headline || ''} onChange={e => handleContentChange(activePlatform, 'headline', e.target.value)} maxLength={200} />
            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: (content.headline || '').length > (PLATFORM_LIMITS[currentPlatform?.name]?.headline || 999) ? '#DC2626' : '#9CA3AF' }}>
              {(content.headline || '').length}/{PLATFORM_LIMITS[currentPlatform?.name]?.headline || '—'}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={s.label}>Description</label>
          <div style={{ position: 'relative' }}>
            <textarea style={{ ...s.textarea, paddingBottom: '22px', borderColor: (content.description || '').length > (PLATFORM_LIMITS[currentPlatform?.name]?.description || 999) ? '#DC2626' : '#E5E7EB' }}
              placeholder="Describe your offer..." rows={3}
              value={content.description || ''} onChange={e => handleContentChange(activePlatform, 'description', e.target.value)} maxLength={500} />
            <span style={{ position: 'absolute', right: '10px', bottom: '8px', fontSize: '10px', color: (content.description || '').length > (PLATFORM_LIMITS[currentPlatform?.name]?.description || 999) ? '#DC2626' : '#9CA3AF' }}>
              {(content.description || '').length}/{PLATFORM_LIMITS[currentPlatform?.name]?.description || '—'}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={s.label}>CTA Button</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {ctaOptions.map(cta => (
              <button key={cta} type="button" onClick={() => handleContentChange(activePlatform, 'cta_button', cta)}
                style={{ padding: '6px 13px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', border: content.cta_button === cta ? 'none' : '1px solid #E5E7EB', background: content.cta_button === cta ? currentPlatform.color : '#F9FAFB', color: content.cta_button === cta ? '#fff' : '#6B7280' }}>
                {cta}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={s.label}>Target Audience</label>
          <input style={s.input} type="text" placeholder="Business Owners, CEOs, CFOs"
            value={content.target_audience || ''} onChange={e => handleContentChange(activePlatform, 'target_audience', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={s.label}>Target Age Range</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input style={{ ...s.input, flex: 1 }} type="number" placeholder="25" value={content.target_age_min || 25} onChange={e => handleContentChange(activePlatform, 'target_age_min', e.target.value)} min={18} max={65} />
            <span style={{ color: '#9CA3AF', fontSize: '12px', flexShrink: 0 }}>to</span>
            <input style={{ ...s.input, flex: 1 }} type="number" placeholder="55" value={content.target_age_max || 55} onChange={e => handleContentChange(activePlatform, 'target_age_max', e.target.value)} min={18} max={65} />
          </div>
        </div>
        {!embedded && (
          <button type="submit" style={loading ? s.btnDisabled : { ...s.nextStepBtn, background: currentPlatform.color }} disabled={loading}>
            {loading ? 'Saving...' : `Save ${currentPlatform.name} Ad Content`}
          </button>
        )}
      </form>
    </div>
  )

  const splitLayout = (
    <div className="split-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
      <div>{formSection}</div>
      <LivePreviewPanel platform={currentPlatform} content={content} previewImage={currentPreviewImage} />
    </div>
  )

  // ── Embedded Layout ──
  if (embedded) {
    return (
      <div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }` + responsiveCSS}</style>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '18px' }}>Create ad content for each selected platform</p>
        <ModeTabs />

        {/* ▼ NEW: Canva-style browser replaces old templateScreen */}
        {mode === 'template' && (
          <>
       <TemplateBrowser
  onApply={applyTemplate}
  onUpload={() => globalFileRef.current?.click()}
  onSwitchToAI={() => { setActiveTab('ai'); setMode('ai') }}
  selectedTemplateId={selectedTemplate}
  fileInputRef={globalFileRef}
  defaultIndustry={campaignData?.industry || 'All Templates'}
  defaultSubcategory={campaignData?.sub_category || null}
/>
            <input ref={globalFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <div style={s.btnRow}>
              <button style={s.backStepBtn} onClick={onBack}>← Back</button>
            </div>
          </>
        )}

        {mode === 'ai'   && aiScreen}
        {mode === 'form' && (
          <>
            {splitLayout}
            <div style={s.btnRow}>
              <button style={s.backStepBtn} onClick={() => { setMode('template'); setActiveTab('template') }}>← Back</button>
              <button style={s.nextStepBtn} onClick={onNext}>Next: Review & Launch →</button>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Standalone Layout ──
  return (
    <div className="standalone-wrap" style={{ padding: '24px 32px', background: '#F9FAFB', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }` + responsiveCSS}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <button style={{ background: 'none', border: 'none', color: '#1A73E8', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', padding: 0, fontFamily: 'inherit' }} onClick={() => navigate('/')}>← Back to Dashboard</button>
        <div className="standalone-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 2px 0' }}>Ad Content</h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Step 5 of 6</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '120px', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '83%', height: '100%', background: '#1A73E8', borderRadius: '3px' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A73E8' }}>83%</span>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 18px' }}>Create ad content for each selected platform</p>
        <ModeTabs />

        {mode === 'template' && (
          <>
          <TemplateBrowser
  onApply={applyTemplate}
  onUpload={() => globalFileRef.current?.click()}
  onSwitchToAI={() => { setActiveTab('ai'); setMode('ai') }}
  selectedTemplateId={selectedTemplate}
  fileInputRef={globalFileRef}
  defaultIndustry={campaignData?.industry || 'All Templates'}
  defaultSubcategory={campaignData?.sub_category || null}
/>

            <input ref={globalFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <div style={s.btnRow}>
              <button style={s.backStepBtn} onClick={() => navigate(-1)}>← Back</button>
            </div>
          </>
        )}
        {mode === 'ai'   && aiScreen}
        {mode === 'form' && (
          <>
            {splitLayout}
            <div style={s.btnRow}>
              <button style={s.backStepBtn} onClick={() => { setMode('template'); setActiveTab('template') }}>← Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  label:         { display: 'block', fontSize: '11px', fontWeight: '600', color: '#6B7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:         { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#FAFAFA', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' },
  textarea:      { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#FAFAFA', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.15s' },
  successBox:    { background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #6EE7B7' },
  errorBox:      { background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #FECACA' },
  ctxChip:       { fontSize: '11px', fontWeight: '500', color: '#374151', background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '3px 10px', borderRadius: '20px' },
  aiGenerateBtn: { width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1A73E8, #0A66C2)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  aiSpinner:     { width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },
  btnRow:        { display: 'flex', gap: '10px', marginTop: '20px' },
  backStepBtn:   { padding: '12px 20px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  nextStepBtn:   { flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#1A73E8', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnDisabled:   { width: '100%', padding: '13px', borderRadius: '10px', border: 'none', background: '#D1D5DB', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'not-allowed', fontFamily: 'inherit' },
}

export default AdContent