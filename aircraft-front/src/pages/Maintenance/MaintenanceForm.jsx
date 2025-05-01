import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Save, X, Trash2, AlertTriangle } from 'lucide-react'

const MaintenanceForm = () => {
  const { maintenanceId } = useParams()
  const isEditing = !!maintenanceId
  const location = useLocation()
  const navigate = useNavigate()
  
  // Extract engineId from query params if available
  const queryParams = new URLSearchParams(location.search)
  const engineIdFromQuery = queryParams.get('engineId')
  
  const [formData, setFormData] = useState({
    engine_id: engineIdFromQuery || '',
    maintenance_type: 'scheduled',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    parts_replaced: '',
    notes: ''
  })
  
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  
  useEffect(() => {
    // Fetch all engines for the dropdown
    const fetchEngines = async () => {
      try {
        const response = await axios.get('/api/engines')
        setEngines(response.data)
      } catch (err) {
        setError('Failed to load engines list. Please try again later.')
      }
    }
    
    // Fetch maintenance record if editing
    const fetchMaintenanceRecord = async () => {
      try {
        const response = await axios.get(`/api/maintenance/${maintenanceId}`)
        
        // Format dates for input fields
        const record = response.data
        
        setFormData({
          engine_id: record.engine_id.toString(),
          maintenance_type: record.maintenance_type,
          description: record.description,
          start_date: record.start_date ? new Date(record.start_date).toISOString().split('T')[0] : '',
          end_date: record.end_date ? new Date(record.end_date).toISOString().split('T')[0] : '',
          parts_replaced: Array.isArray(record.parts_replaced) 
            ? record.parts_replaced.join(', ') 
            : typeof record.parts_replaced === 'object'
            ? Object.keys(record.parts_replaced).join(', ')
            : record.parts_replaced || '',
          notes: record.notes || ''
        })
        
        setLoading(false)
      } catch (err) {
        setError('Failed to load maintenance record. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchEngines()
    
    if (isEditing) {
      fetchMaintenanceRecord()
    }
  }, [maintenanceId, isEditing])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.engine_id || !formData.maintenance_type || !formData.description || !formData.start_date) {
      setError('Please fill in all required fields')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const dataToSubmit = {
        ...formData,
        // Convert parts_replaced to array if provided
        parts_replaced: formData.parts_replaced 
          ? formData.parts_replaced.split(',').map(part => part.trim())
          : undefined
      }
      
      if (isEditing) {
        await axios.put(`/api/maintenance/${maintenanceId}`, dataToSubmit)
      } else {
        await axios.post('/api/maintenance', dataToSubmit)
      }
      
      navigate('/dashboard/maintenance')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save maintenance record. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    if (!isEditing) return
    
    setSubmitting(true)
    
    try {
      await axios.delete(`/api/maintenance/${maintenanceId}`)
      navigate('/dashboard/maintenance')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete maintenance record. Please try again.')
    } finally {
      setSubmitting(false)
      setShowConfirmDelete(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading maintenance record...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Maintenance Record' : 'New Maintenance Record'}
        </h1>
        
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <AlertTriangle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engine Selection */}
          <div>
            <label htmlFor="engine_id" className="block text-sm font-medium text-gray-700">
              Engine <span className="text-red-500">*</span>
            </label>
            <select
              id="engine_id"
              name="engine_id"
              value={formData.engine_id}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              required
            >
              <option value="">Select an engine</option>
              {engines.map(engine => (
                <option key={engine.id} value={engine.id}>
                  Engine {engine.serial_number} {engine.aircraft_id ? `(Aircraft: ${engine.aircraft_id})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Maintenance Type */}
          <div>
            <label htmlFor="maintenance_type" className="block text-sm font-medium text-gray-700">
              Maintenance Type <span className="text-red-500">*</span>
            </label>
            <select
              id="maintenance_type"
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
              required
            >
              <option value="scheduled">Scheduled</option>
              <option value="unscheduled">Unscheduled</option>
              <option value="overhaul">Overhaul</option>
              <option value="inspection">Inspection</option>
              <option value="repair">Repair</option>
            </select>
          </div>
          
          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          {/* Start Date */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          {/* End Date */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty if maintenance is still in progress
            </p>
          </div>
          
          {/* Parts Replaced */}
          <div className="md:col-span-2">
            <label htmlFor="parts_replaced" className="block text-sm font-medium text-gray-700">
              Parts Replaced
            </label>
            <input
              type="text"
              id="parts_replaced"
              name="parts_replaced"
              value={formData.parts_replaced}
              onChange={handleChange}
              placeholder="Comma-separated list of parts replaced"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/maintenance')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <X size={16} className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-70"
          >
            <Save size={16} className="mr-2" />
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      
      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <AlertTriangle size={24} className="text-red-600" />
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:col-start-2 sm:text-sm"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
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
  )
}

export default MaintenanceForm