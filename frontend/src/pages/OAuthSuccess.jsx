import React, { useEffect } from 'react'

const OAuthSuccess = () => {
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const platform = params.get('platform') || 'google'

    if (window.opener) {
      window.opener.postMessage({ type: 'oauth-connected', platform }, '*')
      window.close()
    }
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'sans-serif' }}>
      <p>Connected! You can close this window.</p>
    </div>
  )
}

export default OAuthSuccess