import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AuthLayout = () => {
  const { currentUser } = useAuth()
  
  // Redirect to dashboard if user is already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

export default AuthLayout