import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Wrench, 
  Sliders, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react'
import { maintenanceAPI } from '../../services/api'

const MaintenanceList = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed
  
  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        setLoading(true)
        
        // Get query parameters based on filter
        const params = {}
        if (filter === 'active') {
          params.active = true
        } else if (filter === 'completed') {
          params.completed = true
        }
        
        const response = await maintenanceAPI.getAll(params)
        setMaintenanceRecords(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load maintenance records:', err)
        setError('Failed to load maintenance records. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchMaintenanceRecords()
  }, [filter])
  
  const filteredRecords = maintenanceRecords.filter(record => {
    // Apply search filter
    return (
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.engine_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })
  
  const getMaintenanceTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'unscheduled':
        return 'bg-orange-100 text-orange-800'
      case 'overhaul':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading maintenance records...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Records</h1>
        <Link
          to="/dashboard/maintenance/new"
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
        >
          <Plus size={16} className="mr-2" />
          Add Maintenance
        </Link>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search maintenance records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-shrink-0">
          <div className="relative inline-block text-left">
            <div className="flex">
              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 border ${
                  filter === 'all' 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium rounded-l-md focus:z-10 focus:outline-none`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 border ${
                  filter === 'active' 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium focus:z-10 focus:outline-none`}
                onClick={() => setFilter('active')}
              >
                <Clock size={16} className="mr-1.5" />
                In Progress
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 border ${
                  filter === 'completed' 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium rounded-r-md focus:z-10 focus:outline-none`}
                onClick={() => setFilter('completed')}
              >
                <CheckCircle size={16} className="mr-1.5" />
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* Maintenance List */}
      <div className="bg-white shadow overflow-hidden rounded-md">
        {filteredRecords.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <li key={record.id}>
                <Link 
                  to={`/dashboard/maintenance/${record.id}/edit`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 mr-2 text-xs font-medium rounded-full ${getMaintenanceTypeColor(record.maintenance_type)}`}>
                            {record.maintenance_type.charAt(0).toUpperCase() + record.maintenance_type.slice(1)}
                          </span>
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {record.description}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Wrench size={16} className="mr-1 flex-shrink-0 text-gray-400" />
                          <span>Engine: {record.engine_serial || record.engine_id}</span>
                          {record.cycle_count && (
                            <>
                              <span className="mx-1">•</span>
                              <span>Cycle count: {record.cycle_count}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(record.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-1">
                          {record.end_date ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <div>
                        {record.parts_replaced && (
                          <p className="truncate">
                            <span className="font-medium">Parts replaced:</span> {
                              typeof record.parts_replaced === 'string' 
                                ? record.parts_replaced 
                                : Array.isArray(record.parts_replaced) 
                                  ? record.parts_replaced.join(', ')
                                  : typeof record.parts_replaced === 'object'
                                    ? Object.keys(record.parts_replaced).join(', ')
                                    : ''
                            }
                          </p>
                        )}
                      </div>
                      {record.performed_by && (
                        <div className="text-right">
                          <span>Performed by: {record.performed_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Wrench size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No maintenance records found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'active' 
                ? 'There are no active maintenance records.' 
                : filter === 'completed'
                ? 'There are no completed maintenance records.'
                : 'There are no maintenance records matching your search criteria.'}
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard/maintenance/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus size={16} className="mr-2" />
                Add Maintenance Record
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MaintenanceList