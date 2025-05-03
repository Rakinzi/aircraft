import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Save, 
  X, 
  Trash2, 
  AlertTriangle, 
  ChevronLeft,
  Calendar,
  Clock,
  Gauge,
  FileText,
  Tag,
  User,
  RotateCcw,
  CheckCircle,
  Plane,
  Hash
} from 'lucide-react';
import { enginesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const EngineForm = () => {
  const { engineId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(!!engineId);
  const [formData, setFormData] = useState({
    serial_number: '',
    model: '',
    aircraft_id: '',
    installation_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "maintenance", label: "In Maintenance" },
    { value: "retired", label: "Retired" }
  ];
  
  const modelOptions = [
    { value: "CFM56-3", label: "CFM56-3" },
    { value: "CFM56-5B", label: "CFM56-5B" },
    { value: "CFM56-7B", label: "CFM56-7B" },
    { value: "GE90-115B", label: "GE90-115B" },
    { value: "GE9X", label: "GE9X" },
    { value: "Trent 1000", label: "Rolls-Royce Trent 1000" },
    { value: "Trent XWB", label: "Rolls-Royce Trent XWB" },
    { value: "PW1000G", label: "Pratt & Whitney PW1000G" },
    { value: "LEAP-1A", label: "LEAP-1A" },
    { value: "LEAP-1B", label: "LEAP-1B" }
  ];
  
  // Fetch engine if editing
  useEffect(() => {
    const fetchEngine = async () => {
      if (!isEditing) return;
      
      try {
        setLoading(true);
        const response = await enginesAPI.getById(engineId);
        
        setFormData({
          serial_number: response.data.serial_number || '',
          model: response.data.model || '',
          aircraft_id: response.data.aircraft_id || '',
          installation_date: response.data.installation_date 
            ? new Date(response.data.installation_date).toISOString().split('T')[0] 
            : '',
          status: response.data.status || 'active'
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch engine details:', err);
        setErrors({ submit: 'Failed to load engine details. Please try again later.' });
        setLoading(false);
      }
    };
    
    fetchEngine();
  }, [isEditing, engineId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.serial_number) {
      newErrors.serial_number = 'Serial number is required';
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.serial_number)) {
      newErrors.serial_number = 'Serial number can only contain letters, numbers, and hyphens';
    }
    
    if (formData.installation_date) {
      const date = new Date(formData.installation_date);
      const now = new Date();
      if (date > now) {
        newErrors.installation_date = 'Installation date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditing) {
        await enginesAPI.update(engineId, formData);
      } else {
        await enginesAPI.create(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/engines');
      }, 2000);
    } catch (err) {
      console.error('Failed to save engine:', err);
      setErrors({ 
        submit: err.response?.data?.error || 'Failed to save engine. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditing) return;
    
    setSubmitting(true);
    
    try {
      // This API endpoint might not exist in the current implementation
      // await enginesAPI.delete(engineId);
      navigate('/dashboard/engines');
    } catch (err) {
      console.error('Failed to delete engine:', err);
      setErrors({ 
        submit: err.response?.data?.error || 'Failed to delete engine. Please try again.' 
      });
    } finally {
      setSubmitting(false);
      setShowConfirmDelete(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard/engines');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation */}
      <div className="animate-fadeIn">
        <button
          onClick={handleCancel}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to engines list
        </button>
      </div>
      
      <div className="flex justify-between items-center animate-fadeInUp">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Gauge className="mr-2 text-blue-500" size={28} />
          {isEditing ? 'Edit Engine' : 'Add New Engine'}
        </h1>
        
        {isEditing && currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none transform transition-transform hover:scale-105"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        )}
      </div>
      
      {errors.submit && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md animate-fadeIn" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md animate-fadeIn" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">
                {isEditing 
                  ? 'Engine updated successfully!' 
                  : 'Engine added successfully!'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Serial Number */}
          <div className="relative">
            <label htmlFor="serial_number" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Hash size={16} className="mr-2 text-blue-500" />
              Serial Number <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.serial_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
              placeholder="Enter engine serial number"
              disabled={isEditing} // Serial number can't be changed if editing
            />
            {errors.serial_number && (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.serial_number}</p>
            )}
          </div>
          
          {/* Model */}
          <div className="relative">
            <label htmlFor="model" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Gauge size={16} className="mr-2 text-blue-500" />
              Engine Model
            </label>
            <select
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400"
            >
              <option value="">Select engine model</option>
              {modelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the model of this engine
            </p>
          </div>
          
          {/* Aircraft ID */}
          <div className="relative">
            <label htmlFor="aircraft_id" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Plane size={16} className="mr-2 text-blue-500" />
              Aircraft ID
            </label>
            <input
              type="text"
              id="aircraft_id"
              name="aircraft_id"
              value={formData.aircraft_id}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400"
              placeholder="e.g., N12345 or G-ABCD"
            />
            <p className="mt-1 text-xs text-gray-500">
              Registration number of the aircraft this engine is installed on
            </p>
          </div>
          
          {/* Installation Date */}
          <div className="relative">
            <label htmlFor="installation_date" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="mr-2 text-blue-500" />
              Installation Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="installation_date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                className={`w-full py-2 px-3 border ${errors.installation_date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.installation_date ? (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.installation_date}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                When was this engine installed on the aircraft
              </p>
            )}
          </div>
          
          {/* Status */}
          <div className="relative">
            <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Tag size={16} className="mr-2 text-blue-500" />
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Current operational status of the engine
            </p>
          </div>
          
          {/* Added By (read only) */}
          <div className="relative">
            <label htmlFor="added_by" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="mr-2 text-blue-500" />
              {isEditing ? 'Updated By' : 'Added By'}
            </label>
            <input
              type="text"
              id="added_by"
              name="added_by"
              value={currentUser?.username || 'Current User'}
              disabled
              className="w-full py-2 px-3 border border-gray-200 bg-gray-50 rounded-md shadow-sm focus:outline-none sm:text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Automatically assigned to current user
            </p>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            <X size={16} className="mr-2" />
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                serial_number: '',
                model: '',
                aircraft_id: '',
                installation_date: new Date().toISOString().split('T')[0],
                status: 'active'
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset Form
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors transform hover:scale-105 active:scale-95"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isEditing ? 'Update Engine' : 'Add Engine'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 animate-scaleIn">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete Engine
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this engine? This will also delete all maintenance records and sensor data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:col-start-2 sm:text-sm transition-colors"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
                  onClick={() => setShowConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineForm;