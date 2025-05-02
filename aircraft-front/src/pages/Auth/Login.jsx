import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Check if we have a message from redirect (e.g. after registration)
  const message = location.state?.message || '';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password) {
      return setError('Please enter both username and password');
    }
    
    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full w-96 h-96 bg-blue-600 opacity-10 animate-pulse" 
             style={{top: '10%', left: '15%', filter: 'blur(100px)'}} />
        <div className="absolute rounded-full w-72 h-72 bg-blue-400 opacity-10 animate-pulse" 
             style={{bottom: '10%', right: '15%', filter: 'blur(80px)', animationDelay: '1s'}} />
      </div>
      
      <div className="w-full max-w-md z-10 animate-fadeIn">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white border-opacity-20">
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
              <div className="inline-block animate-scaleIn">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-600 bg-opacity-20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                Aircraft Engine Monitor
              </h1>
              <p className="text-blue-100 mt-2 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                Predictive Maintenance System
              </p>
            </div>
            
            {message && (
              <div className="mb-6 p-3 bg-green-500 bg-opacity-20 border border-green-300 border-opacity-30 text-green-100 rounded-lg animate-slideIn">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 text-red-100 rounded-lg animate-slideIn">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <div className="mb-6">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-blue-100">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-blue-300 border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-200 placeholder-opacity-50 transition-all transform group-hover:scale-105 group-hover:border-opacity-30"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-blue-100">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-10 border border-blue-300 border-opacity-20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-200 placeholder-opacity-50 transition-all transform group-hover:scale-105 group-hover:border-opacity-30"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-8 text-center animate-fadeInUp" style={{animationDelay: '0.5s'}}>
              <p className="text-sm text-blue-100">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-300 hover:text-blue-200 font-medium hover:underline transition-all">
                  Register here
                </Link>
              </p>
            </div>
          </div>
          
          {/* Visual bottom bar for aesthetic */}
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;