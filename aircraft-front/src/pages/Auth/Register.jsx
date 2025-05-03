import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  LockKeyhole,
  AlertTriangle,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
  Loader,
  ChevronLeft
} from 'lucide-react';

const EnhancedRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'technician'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // For password strength indicator
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  });
  
  // Animation effects
  useEffect(() => {
    // Trigger animations after component mounts
    document.title = 'AeroEngine - Register';
    setTimeout(() => setBackgroundLoaded(true), 300);
    setTimeout(() => setFormVisible(true), 800);
  }, []);
  
  // Check password strength
  useEffect(() => {
    const password = formData.password;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordChecks(checks);
    
    // Calculate strength (0-4)
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [formData.password]);
  
  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return { text: 'Very Weak', color: 'red-500' };
      case 1: return { text: 'Weak', color: 'red-400' };
      case 2: return { text: 'Fair', color: 'yellow-500' };
      case 3: return { text: 'Good', color: 'green-400' };
      case 4:
      case 5: return { text: 'Strong', color: 'green-500' };
      default: return { text: 'Very Weak', color: 'red-500' };
    }
  };
  
  const getPasswordStrengthBarWidth = () => {
    return `${Math.max(5, (passwordStrength / 5) * 100)}%`;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    // Simple validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill out all required fields');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...registerData } = formData;
      
      await register(registerData);
      
      // Show success state briefly before redirecting
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Registration successful! You can now login.' } 
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create an account. Please try again.');
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
        <div className={`absolute left-1/4 top-1/3 w-80 h-80 rounded-full border-8 border-purple-300 opacity-0 transition-all duration-1000 ${backgroundLoaded ? 'opacity-10 transform translate-y-10' : ''}`}></div>
        <div className={`absolute right-1/3 bottom-1/4 w-56 h-56 rounded-full border-8 border-indigo-300 opacity-0 transition-all duration-1000 delay-500 ${backgroundLoaded ? 'opacity-10 transform -translate-y-10' : ''}`}></div>
      </div>
      
      {/* Aircraft silhouette */}
      <div className={`absolute transition-all duration-1000 delay-300 ${backgroundLoaded ? 'opacity-10' : 'opacity-0'}`} style={{left: '8%', top: '15%'}}>
        <svg width="280" height="280" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12C22 12 21.3082 12.4282 20.5414 12.7965C19.7746 13.1647 19.3333 12.9167 19.3333 12.9167L15.0556 10.75L15.5 5.33333L14.1111 4.58333L12.5 9.5L8.33333 8.16667L7.77778 5.91667L6.38889 5.5L5.55556 8.16667L3.33333 8.91667L3 10.1944L5.55556 10.5833L12.2222 13.3056L3.33333 17.4167L2 19.4167L3.88889 20.1667L14.1111 15.6667L17.6667 14.25C17.6667 14.25 19.3889 13.5 20.6667 13.5C21.7569 13.5 22 12 22 12Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Engine icon */}
      <div className={`absolute transition-all duration-1000 delay-500 ${backgroundLoaded ? 'opacity-10' : 'opacity-0'}`} style={{right: '10%', bottom: '20%'}}>
        <svg width="220" height="220" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10H21M3 14H21M5 18H19C20.1046 18 21 17.1046 21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18ZM12 6V18V6Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Glass card */}
      <div 
        className={`relative z-10 w-full max-w-xl transform transition-all duration-700 ease-out ${
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
            <div className="flex items-center mb-6">
              <Link 
                to="/login" 
                className="flex items-center text-indigo-300 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="ml-1 text-sm">Back to login</span>
              </Link>
            </div>
          
            <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="text-indigo-200 mb-6">Join the AeroEngine maintenance platform</p>
            
            {error && (
              <div className="mb-6 relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-red-400 opacity-20"></div>
                <div className="px-4 py-3 relative flex">
                  <AlertTriangle className="text-red-400 mr-2 flex-shrink-0" size={20} />
                  <p className="text-white text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Username */}
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-medium text-indigo-200">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-indigo-300" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-200 shadow-inner transition-all"
                      placeholder="Choose a username"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-indigo-200">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-indigo-300" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-200 shadow-inner transition-all"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-indigo-200">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole size={18} className="text-indigo-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-200 shadow-inner transition-all"
                    placeholder="Create a strong password"
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
                
                {/* Password strength indicator */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs text-indigo-200">Password strength:</div>
                    <div className={`text-xs font-medium text-${getPasswordStrengthText().color}`}>
                      {getPasswordStrengthText().text}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white bg-opacity-10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-${getPasswordStrengthText().color}`}
                      style={{ width: getPasswordStrengthBarWidth() }}
                    ></div>
                  </div>
                  
                  {/* Password requirements */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className={`text-xs flex items-center ${passwordChecks.length ? 'text-green-400' : 'text-indigo-300'}`}>
                      {passwordChecks.length ? (
                        <Check size={14} className="mr-1" />
                      ) : (
                        <span className="w-3.5 h-3.5 inline-block border border-current rounded-full mr-1"></span>
                      )}
                      At least 8 characters
                    </div>
                    <div className={`text-xs flex items-center ${passwordChecks.lowercase ? 'text-green-400' : 'text-indigo-300'}`}>
                      {passwordChecks.lowercase ? (
                        <Check size={14} className="mr-1" />
                      ) : (
                        <span className="w-3.5 h-3.5 inline-block border border-current rounded-full mr-1"></span>
                      )}
                      Lowercase letter
                    </div>
                    <div className={`text-xs flex items-center ${passwordChecks.uppercase ? 'text-green-400' : 'text-indigo-300'}`}>
                      {passwordChecks.uppercase ? (
                        <Check size={14} className="mr-1" />
                      ) : (
                        <span className="w-3.5 h-3.5 inline-block border border-current rounded-full mr-1"></span>
                      )}
                      Uppercase letter
                    </div>
                    <div className={`text-xs flex items-center ${passwordChecks.number ? 'text-green-400' : 'text-indigo-300'}`}>
                      {passwordChecks.number ? (
                        <Check size={14} className="mr-1" />
                      ) : (
                        <span className="w-3.5 h-3.5 inline-block border border-current rounded-full mr-1"></span>
                      )}
                      Number
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-200">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole size={18} className="text-indigo-300" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-indigo-200 shadow-inner transition-all"
                    placeholder="Confirm your password"
                    disabled={loading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      className="h-full px-3 text-indigo-300 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="mt-1">
                  {formData.password && formData.confirmPassword && (
                    formData.password === formData.confirmPassword ? (
                      <p className="text-xs flex items-center text-green-400">
                        <Check size={14} className="mr-1" />
                        Passwords match
                      </p>
                    ) : (
                      <p className="text-xs flex items-center text-red-400">
                        <AlertTriangle size={14} className="mr-1" />
                        Passwords do not match
                      </p>
                    )
                  )}
                </div>
              </div>
              
              {/* Role selection */}
              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-indigo-200">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full py-3 px-3 bg-indigo-900 bg-opacity-70 border border-indigo-300 border-opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white shadow-inner transition-all"
                  disabled={loading}
                >
                  <option value="technician" className="bg-indigo-900 text-white">Technician</option>
                  <option value="engineer" className="bg-indigo-900 text-white">Engineer</option>
                  <option value="admin" className="bg-indigo-900 text-white">Administrator</option>
                </select>
              </div>
              
              {/* Terms and Privacy */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-indigo-200">
                    I agree to the <a href="#" className="text-indigo-300 hover:text-white">Terms of Service</a> and <a href="#" className="text-indigo-300 hover:text-white">Privacy Policy</a>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2" size={18} />
                    Create Account
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-indigo-200">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-300 hover:text-white transition-colors">
                  Sign in instead
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

export default EnhancedRegister;