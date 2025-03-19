
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/')
      } else if (!profile) {
        navigate('/onboarding')
      }
    }
  }, [user, profile, loading, navigate])

  if (loading) return null

  return user ? children : null
}
