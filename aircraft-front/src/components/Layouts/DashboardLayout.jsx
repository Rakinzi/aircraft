import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Home, 
  Gauge, 
  Wrench, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  User,
  ChevronDown,
  BarChart2,
  Settings,
  HelpCircle,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Outlet } from 'react-router-dom';
import { alertsAPI } from '../../services/api';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await alertsAPI.getAll({ resolved: false });
        setNotifications(response.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/dashboard/engines', label: 'Engines', icon: <Gauge size={20} /> },
    { path: '/dashboard/maintenance', label: 'Maintenance', icon: <Wrench size={20} /> },
    { path: '/dashboard/alerts', label: 'Alerts', icon: <Bell size={20} />, badge: notifications.length },
  ];
  
  const secondaryNavItems = [
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
    { path: '/dashboard/help', label: 'Help & Support', icon: <HelpCircle size={20} /> },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <button
        onClick={() => navigate(item.path)}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-300 hover:bg-blue-700 hover:text-white'
        }`}
      >
        <div className="flex items-center">
          <span className={`${isActive ? 'text-white' : 'text-gray-400'} mr-3`}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
        {item.badge > 0 && (
          <span className="ml-auto px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-blue-800 to-blue-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:shadow-xl`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3v4M3 5h4M6 21v-4m-4 2h4M21 3l-2 2-2-2M21 7l-2-2-2 2M21 11l-2 2-2-2M21 15l-2-2-2 2M7 7l10 10M17 7L7 17" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">AeroEngine</h1>
          </div>
          <button 
            className="rounded p-1 text-white hover:bg-blue-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center p-3 mb-6 bg-blue-700 bg-opacity-40 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-white">{currentUser?.username || 'User'}</div>
              <div className="text-xs text-blue-300">{currentUser?.role || 'Role'}</div>
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
          
          <div className="border-t border-blue-700 pt-4 mt-4">
            <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Support
            </p>
            <div className="space-y-2">
              {secondaryNavItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-blue-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center">
              <button
                className="rounded p-1 mr-3 hover:bg-gray-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-800">Aircraft Engine Monitoring</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  <Search size={20} className="text-gray-600" />
                </button>
                
                {searchOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-2 z-10">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search..."
                        autoFocus
                      />
                      <div className="absolute left-2 top-2.5 text-gray-400">
                        <Search size={16} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
                  onClick={() => navigate('/dashboard/alerts')}
                >
                  <Bell size={20} className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
              </div>
              
              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-full focus:outline-none p-1 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-10">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.username || 'User'}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email || 'Email'}</p>
                    </div>
                    <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Profile</Link>
                    <Link to="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Settings</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Breadcrumb & page title */}
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                        {location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1) || 'Dashboard'}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t py-3 px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} AeroEngine Maintenance System
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link to="/dashboard/privacy" className="text-sm text-gray-500 hover:text-blue-600">Privacy Policy</Link>
              <Link to="/dashboard/terms" className="text-sm text-gray-500 hover:text-blue-600">Terms of Service</Link>
              <Link to="/dashboard/help" className="text-sm text-gray-500 hover:text-blue-600">Contact Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;