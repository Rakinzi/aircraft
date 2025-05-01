import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // Setup axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [token])

  // Check if user is logged in on page load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // You could have an endpoint to validate the token and return user data
          // For now we'll just use the stored user data
          const userData = JSON.parse(localStorage.getItem('user'))
          if (userData) {
            setCurrentUser(userData)
          }
        } catch (error) {
          console.error('Failed to restore authentication', error)
          logout()
        }
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (username, password) => {
    // Replace with your actual API endpoint
    const response = await axios.post('/api/login', {
      username,
      password
    })
    
    const { access_token, user } = response.data
    setToken(access_token)
    setCurrentUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  const register = async (userData) => {
    // Replace with your actual API endpoint
    const response = await axios.post('/api/register', userData)
    return response.data
  }

  const logout = () => {
    setCurrentUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}