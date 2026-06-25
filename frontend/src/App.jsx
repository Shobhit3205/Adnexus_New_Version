import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Dashboard from './pages/Dashboard.jsx'
import CreateCampaign from './pages/CreateCampaign.jsx'
import Leads from './pages/Leads.jsx'
import PublicLeadForm from './pages/PublicLeadForm.jsx'
import ThankYou from './pages/ThankYou.jsx'

const CampaignDetail = lazy(() => import('./pages/CampaignDetail.jsx'))
const AdContent = lazy(() => import('./pages/AdContent.jsx'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/lead/:campaignId" element={<PublicLeadForm />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* Lazy routes — apna Suspense wrap */}
        <Route path="/campaign/:campaignId/ad-content" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdContent />
          </Suspense>
        } />
        <Route path="/campaign/:campaignId" element={
          <Suspense fallback={<div>Loading...</div>}>
            <CampaignDetail />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App