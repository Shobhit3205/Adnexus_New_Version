import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('adnexus_token') || null)
  const [loading, setLoading] = useState(true)

  // App load hote hi check karo — agar token hai to user data fetch karo
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('adnexus_token')
      if (savedToken) {
        try {
          const res = await getMe(savedToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
          setUser(res.data)
          setToken(savedToken)
        } catch (err) {
          // Token invalid ya expired hai
          localStorage.removeItem('adnexus_token')
          delete axios.defaults.headers.common['Authorization']
          setUser(null)
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  // Login/Signup/VerifyOtp/Google-login success hone par ye call hoga
  const loginUser = (accessToken, userData) => {
    localStorage.setItem('adnexus_token', accessToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setToken(accessToken)
    setUser(userData)
  }

  const logoutUser = () => {
    localStorage.removeItem('adnexus_token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    loginUser,
    logoutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook — kisi bhi component mein easily use karne ke liye
export const useAuth = () => useContext(AuthContext)