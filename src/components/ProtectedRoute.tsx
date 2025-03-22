
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  const authPages = ['/MagicLink', '/ResetPassword', '/reset-password', '/ConfirmEmail', '/auth-error', '/auth', '/auth/callback'];
  const currentPath = window.location.pathname;

  useEffect(() => {
    if (!loading && !authPages.includes(currentPath)) {
      if (!user) {
        navigate('/auth')
      } else if (!profile || !profile.onboarding_completed) {
        navigate('/onboarding')
      }
    }
  }, [user, profile, loading, navigate, currentPath])

  if (loading) return null

  return user ? children : null
}
