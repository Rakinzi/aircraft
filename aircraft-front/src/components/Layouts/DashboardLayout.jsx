import { useState, useEffect } from 'react'
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Home, 
  Gauge, 
  Wrench, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  User
} from 'lucide-react'

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/dashboard/engines', label: 'Engines', icon: <Gauge size={20} /> },
    { path: '/dashboard/maintenance', label: 'Maintenance', icon: <Wrench size={20} /> },
    { path: '/dashboard/alerts', label: 'Alerts', icon: <Bell size={20} /> },
  ]

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path
    
    return (
      <NavLink
        to={item.path}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary-600 text-white' 
            : 'text-gray-200 hover:bg-primary-700'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-primary-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold text-white">AEM Dashboard</h1>
          <button 
            className="rounded p-1 text-white hover:bg-primary-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-4 flex items-center space-x-3 px-4 py-3 text-gray-200">
            <User size={20} />
            <div className="flex flex-col">
              <span className="font-medium">{currentUser.username}</span>
              <span className="text-xs capitalize">{currentUser.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center space-x-3 px-4 py-3 text-gray-200 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <button
            className="rounded p-1 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100">
              <Bell size={20} />
            </button>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout