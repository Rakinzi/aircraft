import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LockKeyhole,
  User,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  LogIn,
  Loader
} from 'lucide-react';

const EnhancedLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState('idle'); // idle, loading, success, error
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Check if we have a message from redirect (e.g. after registration)
  const message = location.state?.message || '';
  
  // Animation states
  const [formVisible, setFormVisible] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  useEffect(() => {
    // Trigger animations after component mounts
    document.title = 'AeroEngine - Login';
    setTimeout(() => setBackgroundLoaded(true), 300);
    setTimeout(() => setFormVisible(true), 800);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password) {
      return setError('Please enter both username and password');
    }
    
    try {
      setError('');
      setLoading(true);
      setAuthState('loading');
      
      await login(username, password);
      
      // Show success state briefly before redirecting
      setAuthState('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setAuthState('error');
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900 z-0">
        {/* Animated mesh pattern */}
        <div className={`absolute inset-0 opacity-0 transition-opacity duration-1000 ${backgroundLoaded ? 'opacity-30' : ''}`}
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '50px 50px'
             }}></div>
             
        {/* Particle effect - floating dots */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white opacity-20"
              style={{
                width: `${Math.random() * 10 + 3}px`,
                height: `${Math.random() * 10 + 3}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 20 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `translateY(0px)`
              }}
            />
          ))}
        </div>
        
        {/* Floating rings */}
        <div className={`absolute left-1/4 top-1/4 w-64 h-64 rounded-full border-8 border-indigo-300 opacity-0 transition-all duration-1000 ${backgroundLoaded ? 'opacity-10 transform -translate-y-10' : ''}`}></div>
        <div className={`absolute right-1/4 bottom-1/4 w-96 h-96 rounded-full border-8 border-purple-300 opacity-0 transition-all duration-1000 delay-500 ${backgroundLoaded ? 'opacity-10 transform translate-y-10' : ''}`}></div>
      </div>
      
      {/* Aircraft silhouette */}
      <div className={`absolute transition-all duration-1000 delay-300 ${backgroundLoaded ? 'opacity-10' : 'opacity-0'}`} style={{right: '5%', top: '10%'}}>
        <svg width="300" height="300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12C22 12 21.3082 12.4282 20.5414 12.7965C19.7746 13.1647 19.3333 12.9167 19.3333 12.9167L15.0556 10.75L15.5 5.33333L14.1111 4.58333L12.5 9.5L8.33333 8.16667L7.77778 5.91667L6.38889 5.5L5.55556 8.16667L3.33333 8.91667L3 10.1944L5.55556 10.5833L12.2222 13.3056L3.33333 17.4167L2 19.4167L3.88889 20.1667L14.1111 15.6667L17.6667 14.25C17.6667 14.25 19.3889 13.5 20.6667 13.5C21.7569 13.5 22 12 22 12Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Engine icon */}
      <div className={`absolute transition-all duration-1000 delay-500 ${backgroundLoaded ? 'opacity-10' : 'opacity-0'}`} style={{left: '7%', bottom: '15%'}}>
        <svg width="250" height="250" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10H21M3 14H21M5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18ZM12 6V18V6Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Glass card */}
      <div 
        className={`relative z-10 w-full max-w-md transform transition-all duration-700 ease-out ${
          formVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Logo and header */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 relative mb-3">
            <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-pulse-slow"></div>
            <div className="absolute inset-2 bg-gradient-to-tr from-indigo-600 to-blue-400 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v4M3 5h4M6 21v-4m-4 2h4M21 3l-2 2-2-2M21 7l-2-2-2 2M21 11l-2 2-2-2M21 15l-2-2-2 2M7 7l10 10M17 7L7 17" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">AeroEngine</h1>
          <p className="text-indigo-200 mt-1">Predictive Maintenance System</p>
        </div>
      
        {/* Main card */}
        <div className="backdrop-blur-xl bg-white bg-opacity-10 rounded-2xl overflow-hidden border border-white border-opacity-20 shadow-2xl">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-indigo-200 mb-6">Please log in to continue</p>
            
            {message && (
              <div className="mb-6 relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-green-400 opacity-20"></div>
                <div className="px-4 py-3 relative flex">
                  <CheckCircle className="text-green-400 mr-2 flex-shrink-0" size={20} />
                  <p className="text-white text-sm">{message}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-red-400 opacity-20"></div>
                <div className="px-4 py-3 relative flex">
                  <AlertTriangle className="text-red-400 mr-2 flex-shrink-0" size={20} />
                  <p className="text-white text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-indigo-200">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-indigo-300" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-200 shadow-inner transition-all"
                    placeholder="Enter your username"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-indigo-200">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole size={18} className="text-indigo-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-200 shadow-inner transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      className="h-full px-3 text-indigo-300 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-indigo-200">
                    Remember me
                  </label>
                </div>
                
                <a href="#" className="text-sm font-medium text-indigo-300 hover:text-white transition-colors">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 ${
                  authState === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all hover:scale-105 active:scale-95 disabled:opacity-70`}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Signing in...
                  </>
                ) : authState === 'success' ? (
                  <>
                    <CheckCircle className="mr-2" size={18} />
                    Success!
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2" size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-indigo-200">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-medium text-indigo-300 hover:text-white transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
          
          {/* Bottom accent bar */}
          <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-400"></div>
        </div>
      </div>
      
      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-slow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default EnhancedLogin;