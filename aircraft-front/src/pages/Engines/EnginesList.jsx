import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronRight, Plus, Search, Database } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { enginesAPI } from '../../services/api'

const EnginesList = () => {
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Engines - Aircraft Engine Monitoring'
    const fetchEngines = async () => {
      try {
        setLoading(true)
        const response = await enginesAPI.getAll()
        setEngines(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load engines:', err)
        setError('Failed to load engines. Please try again later.')
        setLoading(false)
      }
    }

    fetchEngines()
  }, [])

  const filteredEngines = engines.filter(engine =>
    engine.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engine.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engine.aircraft_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status, failure_probability) => {
    if (status === 'maintenance') return 'text-yellow-600 bg-yellow-100'
    if (status === 'retired') return 'text-gray-600 bg-gray-100'
    if (failure_probability && failure_probability > 0.7) return 'text-red-600 bg-red-100'
    return 'text-green-600 bg-green-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading engines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Engines</h1>
        {(currentUser.role === 'admin' || currentUser.role === 'engineer') && (
          <div className="mt-3 sm:mt-0 flex space-x-3">
            <Link
              to="/dashboard/engines/add-cycle"
              className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-md hover:bg-indigo-200 focus:outline-none"
            >
              <Database size={16} className="mr-2" />
              Add Cycle Data
            </Link>

            <Link
              to="/dashboard/engines/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none"
            >
              <Plus size={16} className="mr-2" />
              Add Engine
            </Link>
          </div>
        )}
      </div>

      {/* Search box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Search engines by serial, model or aircraft..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Engines list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredEngines.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredEngines.map(engine => (
              <li key={engine.id}>
                <Link to={`/dashboard/engines/${engine.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="truncate">
                        <div className="flex items-center text-sm font-medium text-primary-600 truncate">
                          Engine {engine.serial_number}
                          {engine.maintenance_due && (
                            <AlertTriangle size={16} className="ml-2 text-yellow-500" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{engine.model || 'N/A'}</span>
                          {engine.aircraft_id && (
                            <>
                              <span className="mx-1">•</span>
                              <span>Aircraft: {engine.aircraft_id}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(engine.status, engine.failure_probability)}`}>
                          {engine.status === 'active' ?
                            (engine.failure_probability > 0.7 ? 'Warning' : 'Active') :
                            engine.status.charAt(0).toUpperCase() + engine.status.slice(1)}
                        </span>
                        <ChevronRight size={16} className="ml-4 text-gray-400" />
                      </div>
                    </div>
                    {engine.latest_cycle && (
                      <div className="mt-2 flex justify-between text-sm text-gray-500">
                        <div>
                          <span>Total cycles: {engine.latest_cycle}</span>
                          {engine.rul && (
                            <>
                              <span className="mx-1">•</span>
                              <span>RUL: {Math.round(engine.rul)} cycles</span>
                            </>
                          )}
                        </div>
                        {engine.alerts > 0 && (
                          <div className="text-yellow-600">
                            {engine.alerts} active {engine.alerts === 1 ? 'alert' : 'alerts'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No engines found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnginesList