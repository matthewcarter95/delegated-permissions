import React from 'react'
import { useAuth } from './hooks/useAuth'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { Success } from './pages/Success'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Simple routing based on URL path
  const path = window.location.pathname

  if (path === '/products') {
    return <Products />
  }

  if (path === '/success') {
    return <Success />
  }

  if (!user) {
    return <Auth />
  }

  return <Dashboard />
}

export default App