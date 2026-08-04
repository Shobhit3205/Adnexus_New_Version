import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

  console.log('DEBUG →', {
    userEmail: user?.email,
    adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
    isAuthenticated,
    loading
  })

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.email?.toLowerCase() !== import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute