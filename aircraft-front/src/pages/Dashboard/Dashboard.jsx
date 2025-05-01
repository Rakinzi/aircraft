import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  AlertTriangle,
  Wrench,
  Gauge,
  CheckCircle
} from 'lucide-react'

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className={`bg-${color}-100 p-3 rounded-full mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}



// Alert Item Component
const AlertItem = ({ alert }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4 border-l-4 border-yellow-500">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">Engine {alert.engine_serial}</p>
          <p className="text-sm text-gray-600">{alert.message}</p>
        </div>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          {alert.alert_type}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(alert.created_at).toLocaleString()}
      </p>
    </div>
  )
}

// Critical Engine Item Component
const CriticalEngineItem = ({ engine }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4 border-l-4 border-red-500">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">Engine {engine.serial_number}</p>
          <p className="text-sm text-gray-600">Aircraft: {engine.aircraft_id}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-red-600">
            {Math.round(engine.failure_probability * 100)}%
          </p>
          <p className="text-xs text-gray-500">Failure Probability</p>
        </div>
      </div>
      <div className="mt-2">
        <Link 
          to={`/dashboard/engines/${engine.id}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

// Maintenance Item Component
const MaintenanceItem = ({ maintenance }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">Engine {maintenance.engine_serial}</p>
          <p className="text-sm text-gray-600">{maintenance.description}</p>
        </div>
        <span className={`text-xs ${
          maintenance.end_date ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        } px-2 py-1 rounded`}>
          {maintenance.end_date ? 'Completed' : 'In Progress'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(maintenance.start_date).toLocaleDateString()} {maintenance.performed_by ? `by ${maintenance.performed_by}` : ''}
      </p>
    </div>
  )
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {
      total_engines: 0,
      active_engines: 0,
      maintenance_engines: 0,
      attention_needed: 0
    },
    critical_engines: [],
    recent_alerts: [],
    recent_maintenance: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard')
        setDashboardData(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.')
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  // Sample data for engine cycles graph
  const cycleData = [
    { month: 'Jan', cycles: 65 },
    { month: 'Feb', cycles: 59 },
    { month: 'Mar', cycles: 80 },
    { month: 'Apr', cycles: 81 },
    { month: 'May', cycles: 56 },
    { month: 'Jun', cycles: 55 },
    { month: 'Jul', cycles: 40 }
  ]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Engines" 
          value={dashboardData.summary.total_engines} 
          icon={<Gauge size={24} className="text-blue-600" />} 
          color="blue" 
        />
        <StatCard 
          title="Active Engines" 
          value={dashboardData.summary.active_engines} 
          icon={<CheckCircle size={24} className="text-green-600" />} 
          color="green" 
        />
        <StatCard 
          title="In Maintenance" 
          value={dashboardData.summary.maintenance_engines} 
          icon={<Wrench size={24} className="text-yellow-600" />} 
          color="yellow" 
        />
        <StatCard 
          title="Attention Needed" 
          value={dashboardData.summary.attention_needed} 
          icon={<AlertTriangle size={24} className="text-red-600" />} 
          color="red" 
        />
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Engine Cycles</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cycles" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Maintenance Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cycles" stroke="#2e7d32" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Alerts and critical engines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {dashboardData.recent_alerts.length > 0 ? (
              dashboardData.recent_alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))
            ) : (
              <p className="text-gray-500 bg-white p-4 rounded-lg">No recent alerts</p>
            )}
          </div>
          {dashboardData.recent_alerts.length > 0 && (
            <div className="mt-4">
              <Link to="/dashboard/alerts" className="text-primary-600 hover:underline text-sm">
                View all alerts →
              </Link>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Engines Requiring Attention</h2>
          <div className="space-y-3">
            {dashboardData.critical_engines.length > 0 ? (
              dashboardData.critical_engines.map((engine) => (
                <CriticalEngineItem key={engine.id} engine={engine} />
              ))
            ) : (
              <p className="text-gray-500 bg-white p-4 rounded-lg">No engines requiring immediate attention</p>
            )}
          </div>
          <div className="mt-4">
            <Link to="/dashboard/engines" className="text-primary-600 hover:underline text-sm">
              View all engines →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent maintenance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Maintenance Activities</h2>
        <div className="space-y-3">
          {dashboardData.recent_maintenance.length > 0 ? (
            dashboardData.recent_maintenance.map((activity) => (
              <MaintenanceItem key={activity.id} maintenance={activity} />
            ))
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-lg">No recent maintenance activities</p>
          )}
        </div>
        <div className="mt-4">
          <Link to="/dashboard/maintenance" className="text-primary-600 hover:underline text-sm">
            View all maintenance →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard