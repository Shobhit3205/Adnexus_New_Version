import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

// Landing page
import LandingPage from './components/landing/LandingPage.jsx'
import AboutUs from './components/landing/AboutUs.jsx'
import PrivacyPolicy from './components/landing/PrivacyPolicy.jsx'
import Terms from './components/landing/Terms.jsx'
import HowItWorks from './components/landing/HowItWorks.jsx'
import ContactUs from './components/landing/ContactUs.jsx'
import Services from './pages/Services.jsx'

// Individual service detail pages
import ServiceAdvertising from './pages/ServiceAdvertising.jsx'
import ITSoftware from './pages/ITSoftware.jsx'
import ManpowerHR from './pages/ManpowerHR.jsx'
import FinancialAdvisory from './pages/FinancialAdvisory.jsx'
import RealEstateConsulting from './pages/RealEstateConsulting.jsx'

// Auth pages
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import VerifyOtp from './pages/VerifyOtp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

// Dashboard pages
import Dashboard from './pages/Dashboard.jsx'
import CreateCampaign from './pages/CreateCampaign.jsx'
import Leads from './pages/Leads.jsx'
import ReferEarn from './pages/ReferEarn.jsx'
import PublicLeadForm from './pages/PublicLeadForm.jsx'
import ThankYou from './pages/ThankYou.jsx'

import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard.jsx'

import OAuthSuccess from './pages/OAuthSuccess.jsx'
import ChatWidget from './pages/ChatWidget.jsx'

// Footer — ab common layout mein hai, isliye har route pe dikhega
import Footer from './components/Footer.jsx'

const CampaignDetail = lazy(() => import('./pages/CampaignDetail.jsx'))
const AdContent = lazy(() => import('./pages/AdContent.jsx'))

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public: Landing Page ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/advertising-media" element={<ServiceAdvertising />} />
            <Route path="/services/it-software" element={<ITSoftware />} />
            <Route path="/services/manpower-hr" element={<ManpowerHR />} />
            <Route path="/services/financial-advisory" element={<FinancialAdvisory />} />
            <Route path="/services/real-estate" element={<RealEstateConsulting />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* ── Public: Auth Pages ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ── Public: Lead Form (customers fill this from ads) ── */}
            <Route path="/lead/:campaignId" element={<PublicLeadForm />} />
            <Route path="/thank-you" element={<ThankYou />} />

            {/* ── Protected: Dashboard ── */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/refer" element={
              <ProtectedRoute><ReferEarn /></ProtectedRoute>
            } />
            <Route path="/dashboard/create-campaign" element={
              <ProtectedRoute><CreateCampaign /></ProtectedRoute>
            } />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/dashboard/leads" element={
              <ProtectedRoute><Leads /></ProtectedRoute>
            } />
            <Route path="/dashboard/Settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />

            <Route path="/dashboard/campaign/:campaignId" element={
              <ProtectedRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <CampaignDetail />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/campaign/:campaignId/ad-content" element={
              <ProtectedRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <AdContent />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* ── Protected: Admin Panel ── */}
            <Route path="/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />

          </Routes>

          <Footer />
          <ChatWidget />

        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App