import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  AlertTriangle, 
  Filter, 
  Search,
  CheckCircle,
  BellOff,
  Eye,
  Clock
} from 'lucide-react'
import { alertsAPI } from '../../services/api'

const AlertsList = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('active') // active, resolved, all
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        
        // Determine which resolved parameter to use based on filter
        const resolved = filter === 'resolved' ? true : filter === 'active' ? false : null
        
        // If filter is 'all', we need to fetch both active and resolved alerts
        if (filter === 'all') {
          const [activeRes, resolvedRes] = await Promise.all([
            alertsAPI.getAll({ resolved: false }),
            alertsAPI.getAll({ resolved: true })
          ])
          
          setAlerts([...activeRes.data, ...resolvedRes.data])
        } else {
          const response = await alertsAPI.getAll({ resolved })
          setAlerts(response.data)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Failed to load alerts:', err)
        setError('Failed to load alerts. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchAlerts()
  }, [filter])
  
  const filteredAlerts = alerts.filter(alert => {
    // Apply search filter
    return (
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.engine_serial?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })
  
  const handleMarkAsRead = async (alertId, isRead) => {
    try {
      await alertsAPI.update(alertId, { is_read: isRead })
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_read: isRead } : alert
      ))
    } catch (err) {
      console.error('Failed to update alert status:', err)
      setError('Failed to update alert status. Please try again.')
    }
  }
  
  const handleResolveAlert = async (alertId) => {
    try {
      await alertsAPI.update(alertId, { resolved: true })
      
      // If we're viewing active alerts, remove this alert from the list
      if (filter === 'active') {
        setAlerts(alerts.filter(alert => alert.id !== alertId))
      } else {
        // Update the status in our local state
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ))
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err)
      setError('Failed to resolve alert. Please try again.')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
      
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search alerts..."
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
                  filter === 'active' 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium rounded-l-md focus:z-10 focus:outline-none`}
                onClick={() => setFilter('active')}
              >
                <AlertTriangle size={16} className="mr-1.5" />
                Active
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 border ${
                  filter === 'resolved' 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium focus:z-10 focus:outline-none`}
                onClick={() => setFilter('resolved')}
              >
                <CheckCircle size={16} className="mr-1.5" />
                Resolved
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 border ${
                  filter === 'all' 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium rounded-r-md focus:z-10 focus:outline-none`}
                onClick={() => setFilter('all')}
              >
                All
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
      
      {/* Alerts list */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`bg-white shadow rounded-lg p-4 ${
                !alert.is_read && !alert.resolved ? 'border-l-4 border-yellow-500' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div className="flex-grow">
                  <div className="flex items-start">
                    <AlertTriangle size={20} className={`mr-2 flex-shrink-0 ${
                      alert.resolved ? 'text-gray-400' : 'text-yellow-500'
                    }`} />
                    <div>
                      <h3 className={`text-sm font-medium ${
                        alert.resolved ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1).replace(/_/g, ' ')}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Engine {alert.engine_serial || alert.engine_id}
                      </p>
                    </div>
                  </div>
                  <p className={`mt-2 text-sm ${
                    alert.resolved ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {alert.message}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {new Date(alert.created_at).toLocaleString()}
                    
                    {alert.resolved && (
                      <span className="ml-2 text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-shrink-0 space-x-2">
                  <Link
                    to={`/dashboard/engines/${alert.engine_id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={14} className="mr-1" />
                    View Engine
                  </Link>
                  
                  {!alert.resolved && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(alert.id, !alert.is_read)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <BellOff size={14} className="mr-1" />
                        {alert.is_read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleResolveAlert(alert.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs rounded-md bg-primary-100 text-primary-800 hover:bg-primary-200"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <BellOff size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No alerts found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'active' 
                ? 'There are no active alerts. All systems are operating normally.' 
                : filter === 'resolved'
                ? 'There are no resolved alerts in the system.'
                : 'There are no alerts matching your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsList