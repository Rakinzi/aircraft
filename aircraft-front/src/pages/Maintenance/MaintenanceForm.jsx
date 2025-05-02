import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Trash2, 
  AlertTriangle, 
  ChevronLeft,
  Calendar,
  Clock,
  Wrench,
  FileText,
  Tag,
  User,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

const MaintenanceForm = () => {
  // Sample engine options for demonstration
  const engineOptions = [
    { id: 1, label: "Engine ENG-2024-001 (Aircraft: AC-747-123)" },
    { id: 2, label: "Engine ENG-2023-042 (Aircraft: AC-A320-456)" },
    { id: 3, label: "Engine ENG-2023-015 (Aircraft: AC-737-789)" },
    { id: 4, label: "Engine ENG-2022-108 (Aircraft: AC-A380-001)" }
  ];
  
  const maintenanceTypes = [
    { value: "scheduled", label: "Scheduled" },
    { value: "unscheduled", label: "Unscheduled" },
    { value: "overhaul", label: "Overhaul" },
    { value: "inspection", label: "Inspection" },
    { value: "repair", label: "Repair" }
  ];
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    engine_id: '',
    maintenance_type: 'scheduled',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    parts_replaced: '',
    notes: ''
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // If this were a real app, you'd fetch data for editing here
  useEffect(() => {
    // Simulate loading maintenance record for editing
    if (isEditing) {
      // This would be an API call in a real app
      // const fetchMaintenanceRecord = async () => {
      //   const response = await maintenanceAPI.getById(maintenanceId);
      //   setFormData(response.data);
      // };
      
      // For demo purposes, we'll just set mock data
      setTimeout(() => {
        setFormData({
          engine_id: '3',
          maintenance_type: 'scheduled',
          description: '500-cycle inspection and maintenance',
          start_date: '2025-04-28',
          end_date: '',
          parts_replaced: 'Oil filter, Air filter, Fuel nozzles',
          notes: 'Engine showing signs of wear on fan blades. Consider replacement during next maintenance.'
        });
      }, 500);
    }
  }, [isEditing]);
  
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
    
    if (!formData.engine_id) {
      newErrors.engine_id = 'Please select an engine';
    }
    
    if (!formData.maintenance_type) {
      newErrors.maintenance_type = 'Please select maintenance type';
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'End date cannot be before start date';
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
      // This would be an API call in a real app
      // if (isEditing) {
      //   await maintenanceAPI.update(maintenanceId, formData);
      // } else {
      //   await maintenanceAPI.create(formData);
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      // In a real app, you would navigate or show a success message
      setTimeout(() => {
        setSuccess(false);
        // navigate('/dashboard/maintenance');
      }, 2000);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save maintenance record' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditing) return;
    
    setSubmitting(true);
    
    try {
      // This would be an API call in a real app
      // await maintenanceAPI.delete(maintenanceId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would navigate
      // navigate('/dashboard/maintenance');
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to delete maintenance record' });
    } finally {
      setSubmitting(false);
      setShowConfirmDelete(false);
    }
  };
  
  const handleCancel = () => {
    // In a real app, this would navigate back
    // navigate('/dashboard/maintenance');
    console.log('Cancelled');
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation */}
      <div className="animate-fadeIn">
        <button
          onClick={handleCancel}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to maintenance list
        </button>
      </div>
      
      <div className="flex justify-between items-center animate-fadeInUp">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Wrench className="mr-2 text-blue-500" size={28} />
          {isEditing ? 'Edit Maintenance Record' : 'New Maintenance Record'}
        </h1>
        
        {isEditing && (
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
                  ? 'Maintenance record updated successfully!' 
                  : 'Maintenance record created successfully!'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engine Selection */}
          <div className="relative">
            <label htmlFor="engine_id" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Tag size={16} className="mr-2 text-blue-500" />
              Engine <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="engine_id"
              name="engine_id"
              value={formData.engine_id}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.engine_id ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
            >
              <option value="">Select an engine</option>
              {engineOptions.map(engine => (
                <option key={engine.id} value={engine.id}>
                  {engine.label}
                </option>
              ))}
            </select>
            {errors.engine_id && (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.engine_id}</p>
            )}
          </div>
          
          {/* Maintenance Type */}
          <div className="relative">
            <label htmlFor="maintenance_type" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Wrench size={16} className="mr-2 text-blue-500" />
              Maintenance Type <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="maintenance_type"
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.maintenance_type ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
            >
              {maintenanceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.maintenance_type && (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.maintenance_type}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="md:col-span-2 relative">
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FileText size={16} className="mr-2 text-blue-500" />
              Description <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
              placeholder="Brief description of maintenance activity"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.description}</p>
            )}
          </div>
          
          {/* Start Date */}
          <div className="relative">
            <label htmlFor="start_date" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar size={16} className="mr-2 text-blue-500" />
              Start Date <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full py-2 px-3 border ${errors.start_date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.start_date}</p>
            )}
          </div>
          
          {/* End Date */}
          <div className="relative">
            <label htmlFor="end_date" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Clock size={16} className="mr-2 text-blue-500" />
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full py-2 px-3 border ${errors.end_date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400`}
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.end_date ? (
              <p className="mt-1 text-sm text-red-600 animate-slideIn">{errors.end_date}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Leave empty if maintenance is still in progress
              </p>
            )}
          </div>
          
          {/* Parts Replaced */}
          <div className="relative">
            <label htmlFor="parts_replaced" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Wrench size={16} className="mr-2 text-blue-500" />
              Parts Replaced
            </label>
            <input
              type="text"
              id="parts_replaced"
              name="parts_replaced"
              value={formData.parts_replaced}
              onChange={handleChange}
              placeholder="Comma-separated list of parts replaced"
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              E.g., Oil filter, Air filter, Fuel nozzles
            </p>
          </div>
          
          {/* Performed By */}
          <div className="relative">
            <label htmlFor="performed_by" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="mr-2 text-blue-500" />
              Performed By
            </label>
            <input
              type="text"
              id="performed_by"
              name="performed_by"
              value="Current User" // In a real app, this would be populated from auth context
              disabled
              className="w-full py-2 px-3 border border-gray-200 bg-gray-50 rounded-md shadow-sm focus:outline-none sm:text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Automatically assigned to current user
            </p>
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2 relative">
            <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <FileText size={16} className="mr-2 text-blue-500" />
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all hover:border-blue-400"
              placeholder="Additional notes or observations"
            />
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
                engine_id: '',
                maintenance_type: 'scheduled',
                description: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                parts_replaced: '',
                notes: ''
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
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isEditing ? 'Update Record' : 'Save Record'}
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
                    Delete Maintenance Record
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this maintenance record? This action cannot be undone.
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

export default MaintenanceForm;