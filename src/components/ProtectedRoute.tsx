
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  const authPages = ['/magic-login', '/reset-password', '/confirm-email', '/auth-error'];
  const currentPath = window.location.pathname;

  useEffect(() => {
    if (!loading && !authPages.includes(currentPath)) {
      if (!user) {
        navigate('/auth')
      } else if (!profile) {
        navigate('/onboarding')
      }
    }
  }, [user, profile, loading, navigate, currentPath])

  if (loading) return null

  return user ? children : null
}
