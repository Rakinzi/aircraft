import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Calendar,
  Clock,
  Gauge,
  AlertTriangle,
  Wrench,
  ChevronLeft,
  Settings,
  Plus,
  Clipboard
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const EngineDetail = () => {
  const { engineId } = useParams()
  const [engine, setEngine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchEngineDetail = async () => {
      try {
        const response = await axios.get(`/api/engines/${engineId}`)
        setEngine(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load engine details. Please try again later.')
        setLoading(false)
      }
    }

    fetchEngineDetail()
  }, [engineId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading engine details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  if (!engine) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found!</strong>
        <span className="block sm:inline"> The requested engine could not be found.</span>
      </div>
    )
  }

  // Format cycle data for charts
  const cycleData = engine.cycles?.map(cycle => ({
    cycle: cycle.cycle,
    s2: cycle.sensor_data?.s2 || 0,
    s3: cycle.sensor_data?.s3 || 0,
    s4: cycle.sensor_data?.s4 || 0
  })) || []

  // Format failure probability data
  const failureProbData = engine.cycles?.map(cycle => ({
    cycle: cycle.cycle,
    probability: cycle.failure_probability || 0
  })) || []

  // Format cycle data for sensor readings chart
  const sensorData = (engine.cycles || []).slice(-30) // Show last 30 cycles for better visualization
  
  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate('/dashboard/engines')}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to engines list
        </button>
      </div>

      {/* Engine header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Engine {engine.serial_number}</h1>
            <div className="mt-1 text-sm text-gray-500">
              <span>{engine.model || 'No model specified'}</span>
              {engine.aircraft_id && (
                <>
                  <span className="mx-1">•</span>
                  <span>Aircraft: {engine.aircraft_id}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {(currentUser.role === 'admin' || currentUser.role === 'engineer') && (
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => navigate(`/dashboard/engines/${engineId}/edit`)}
              >
                <Settings size={15} className="mr-1.5" />
                Engine Settings
              </button>
            )}
            <Link
              to={`/dashboard/maintenance/new?engineId=${engineId}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus size={15} className="mr-1.5" />
              Add Maintenance
            </Link>
          </div>
        </div>
        
        {/* Engine status info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Gauge size={20} className="text-primary-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                engine.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : engine.status === 'maintenance'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {engine.status.charAt(0).toUpperCase() + engine.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock size={20} className="text-primary-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Total Cycles</span>
            </div>
            <div className="mt-2 text-xl font-semibold text-gray-900">
              {engine.total_cycles || 0}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Calendar size={20} className="text-primary-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Installation Date</span>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              {engine.installation_date 
                ? new Date(engine.installation_date).toLocaleDateString() 
                : 'Not specified'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Prediction & RUL section */}
      {engine.cycles && engine.cycles.length > 0 && engine.cycles[engine.cycles.length - 1].failure_probability && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800">Failure Prediction</h2>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${
              engine.cycles[engine.cycles.length - 1].failure_probability > 0.7
                ? 'bg-red-50'
                : engine.cycles[engine.cycles.length - 1].failure_probability > 0.5
                ? 'bg-yellow-50'
                : 'bg-green-50'
            }`}>
              <div className="flex items-center">
                <AlertTriangle size={20} className={`mr-2 ${
                  engine.cycles[engine.cycles.length - 1].failure_probability > 0.7
                    ? 'text-red-500'
                    : engine.cycles[engine.cycles.length - 1].failure_probability > 0.5
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">Failure Probability</span>
              </div>
              <div className="mt-2">
                <span className={`text-2xl font-bold ${
                  engine.cycles[engine.cycles.length - 1].failure_probability > 0.7
                    ? 'text-red-600'
                    : engine.cycles[engine.cycles.length - 1].failure_probability > 0.5
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {Math.round(engine.cycles[engine.cycles.length - 1].failure_probability * 100)}%
                </span>
              </div>
              {engine.cycles[engine.cycles.length - 1].failure_probability > 0.7 && (
                <p className="mt-2 text-sm text-red-600">
                  Maintenance is highly recommended
                </p>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Gauge size={20} className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Remaining Useful Life</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-blue-600">
                  {engine.cycles[engine.cycles.length - 1].rul 
                    ? Math.round(engine.cycles[engine.cycles.length - 1].rul) 
                    : 'N/A'
                  }
                </span>
                <span className="ml-1 text-sm text-gray-600">cycles</span>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Clipboard size={20} className="text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Last Cycle</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-purple-600">
                  {engine.cycles[engine.cycles.length - 1].cycle}
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(engine.cycles[engine.cycles.length - 1].timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Failure probability chart */}
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Failure Probability Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={failureProbData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cycle" />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                  <Tooltip formatter={(value) => [`${Math.round(value * 100)}%`, 'Probability']} />
                  <Area 
                    type="monotone" 
                    dataKey="probability" 
                    stroke="#ef5350" 
                    fill="#ffcdd2" 
                    activeDot={{ r: 8 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Sensor Data Charts */}
      {sensorData.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800">Sensor Readings</h2>
          
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cycle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={(data) => data.sensor_data?.s2} 
                  name="Sensor 2" 
                  stroke="#2196f3" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={(data) => data.sensor_data?.s3} 
                  name="Sensor 3" 
                  stroke="#4caf50" 
                />
                <Line 
                  type="monotone" 
                  dataKey={(data) => data.sensor_data?.s4} 
                  name="Sensor 4" 
                  stroke="#ff9800" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Maintenance History */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Maintenance History</h2>
          <Link
            to={`/dashboard/maintenance/new?engineId=${engineId}`}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <Plus size={16} className="mr-1" />
            Add maintenance record
          </Link>
        </div>
        
        {engine.maintenance_history && engine.maintenance_history.length > 0 ? (
          <div className="mt-4 flow-root">
            <ul className="-mb-8">
              {engine.maintenance_history.map((record, recordIdx) => (
                <li key={record.id}>
                  <div className="relative pb-8">
                    {recordIdx !== engine.maintenance_history.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          record.end_date ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          <Wrench size={16} className="text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {record.maintenance_type}
                            </span>
                            {record.description && ` - ${record.description}`}
                          </p>
                          {record.parts_replaced && (
                            <p className="mt-1 text-xs text-gray-500">
                              Parts replaced: {Array.isArray(record.parts_replaced) 
                                ? record.parts_replaced.join(', ') 
                                : typeof record.parts_replaced === 'object'
                                ? Object.keys(record.parts_replaced).join(', ')
                                : record.parts_replaced}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={record.start_date}>
                            {new Date(record.start_date).toLocaleDateString()}
                          </time>
                          {record.end_date && (
                            <p className="mt-1 text-xs text-green-600">
                              Completed: {new Date(record.end_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No maintenance records found for this engine.</p>
        )}
      </div>
    </div>
  )
}

export default EngineDetail