import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AuthLayout = () => {
  const { currentUser } = useAuth()
  
  // Redirect to dashboard if user is already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-700 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">Aircraft Maintenance</h1>
            <p className="text-gray-600 mt-2">Predictive Engine Maintenance System</p>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout   