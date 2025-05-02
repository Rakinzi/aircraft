import { useState, useEffect } from 'react';
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
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';
import { 
  AlertTriangle,
  Wrench,
  Gauge,
  CheckCircle,
  Bell,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

// Stat Card Component with animation
const StatCard = ({ title, value, icon, color, animationDelay }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 flex items-center transform transition-all duration-500 hover:scale-105 border-l-4 border-${color}-500`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        animation: 'fadeInUp 0.5s ease-out forwards'
      }}
    >
      <div className={`bg-${color}-100 p-4 rounded-full mr-4 text-${color}-600`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

// Alert Item Component
const AlertItem = ({ alert, animationDelay }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg mb-4 p-4 border-l-4 border-yellow-500 transform transition-all duration-500 hover:translate-x-1"
      style={{ 
        animationDelay: `${animationDelay}s`,
        animation: 'slideInRight 0.5s ease-out forwards'
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <AlertTriangle className="mr-3 text-yellow-500 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium">Engine {alert.engine_serial}</p>
            <p className="text-sm text-gray-600">{alert.message}</p>
          </div>
        </div>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          {alert.alert_type}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2 ml-7">
        {new Date(alert.created_at).toLocaleString()}
      </p>
    </div>
  );
};

// Critical Engine Item Component
const CriticalEngineItem = ({ engine, animationDelay }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg mb-4 p-4 border-l-4 border-red-500 transform transition-all duration-500 hover:translate-x-1"
      style={{ 
        animationDelay: `${animationDelay}s`,
        animation: 'slideInRight 0.5s ease-out forwards'
      }}
    >
      <div className="flex justify-between">
        <div className="flex">
          <Gauge className="mr-3 text-red-500 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium">Engine {engine.serial_number}</p>
            <p className="text-sm text-gray-600">Aircraft: {engine.aircraft_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-red-600">
            {Math.round(engine.failure_probability * 100)}%
          </p>
          <p className="text-xs text-gray-500">Failure Probability</p>
        </div>
      </div>
      <div className="mt-2 ml-7">
        <button
          className="text-xs font-medium text-blue-600 hover:underline flex items-center"
        >
          <span>View Details</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Maintenance Item Component
const MaintenanceItem = ({ maintenance, animationDelay }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg mb-4 p-4 transform transition-all duration-500 hover:translate-x-1"
      style={{ 
        animationDelay: `${animationDelay}s`,
        animation: 'slideInRight 0.5s ease-out forwards'
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <Wrench className="mr-3 text-blue-500 mt-1 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium">Engine {maintenance.engine_serial}</p>
            <p className="text-sm text-gray-600">{maintenance.description}</p>
          </div>
        </div>
        <span className={`text-xs ${
          maintenance.end_date ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        } px-2 py-1 rounded`}>
          {maintenance.end_date ? 'Completed' : 'In Progress'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-2 ml-7">
        {new Date(maintenance.start_date).toLocaleDateString()} {maintenance.performed_by ? `by ${maintenance.performed_by}` : ''}
      </p>
    </div>
  );
};

// Sample dashboard data - in a real app, you'd fetch this from the API
const sampleDashboardData = {
  summary: {
    total_engines: 24,
    active_engines: 18,
    maintenance_engines: 4,
    attention_needed: 2
  },
  critical_engines: [
    {
      id: 1,
      serial_number: "ENG-2024-001",
      aircraft_id: "AC-747-123",
      failure_probability: 0.87,
      current_cycle: 346,
      rul: 12
    },
    {
      id: 2,
      serial_number: "ENG-2023-042",
      aircraft_id: "AC-A320-456",
      failure_probability: 0.81,
      current_cycle: 412,
      rul: 18
    }
  ],
  recent_alerts: [
    {
      id: 1,
      engine_id: 1,
      engine_serial: "ENG-2024-001",
      alert_type: "maintenance_due",
      message: "Engine has a 87% probability of failure within 30 cycles. Maintenance recommended.",
      created_at: "2025-04-29T14:23:45.000Z"
    },
    {
      id: 2,
      engine_id: 2,
      engine_serial: "ENG-2023-042",
      alert_type: "maintenance_due",
      message: "Engine has a 81% probability of failure within 30 cycles. Maintenance recommended.",
      created_at: "2025-04-30T09:12:33.000Z"
    }
  ],
  recent_maintenance: [
    {
      id: 1,
      engine_id: 3,
      engine_serial: "ENG-2023-015",
      maintenance_type: "scheduled",
      description: "Regular 500-cycle inspection and maintenance",
      start_date: "2025-04-28T08:00:00.000Z",
      end_date: "2025-04-28T16:30:00.000Z",
      performed_by: "John Smith"
    },
    {
      id: 2,
      engine_id: 4,
      engine_serial: "ENG-2022-108",
      maintenance_type: "unscheduled",
      description: "Sensor replacement due to anomaly detection",
      start_date: "2025-04-30T10:15:00.000Z",
      end_date: null,
      performed_by: "Emma Johnson"
    }
  ]
};

// Sample data for engine cycles graph
const cycleData = [
  { month: 'Jan', cycles: 65 },
  { month: 'Feb', cycles: 59 },
  { month: 'Mar', cycles: 80 },
  { month: 'Apr', cycles: 81 },
  { month: 'May', cycles: 56 }
];

// Sample data for maintenance trends
const maintenanceData = [
  { month: 'Jan', scheduled: 4, unscheduled: 1 },
  { month: 'Feb', scheduled: 3, unscheduled: 2 },
  { month: 'Mar', scheduled: 5, unscheduled: 0 },
  { month: 'Apr', scheduled: 2, unscheduled: 3 },
  { month: 'May', scheduled: 4, unscheduled: 1 }
];

// Enhanced Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Simulate API call to fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call:
        // const response = await axios.get('/api/dashboard');
        // setDashboardData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setDashboardData(sampleDashboardData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div 
        className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-xl p-6 text-white mb-6"
        style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
      >
        <h1 className="text-2xl font-bold">Welcome to the Aircraft Engine Monitoring Dashboard</h1>
        <p className="mt-2 text-blue-100">Get real-time insights and predictive maintenance recommendations</p>
        <div className="flex items-center mt-4">
          <Activity className="mr-2" size={18} />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Engines" 
          value={dashboardData.summary.total_engines} 
          icon={<Gauge size={24} />} 
          color="blue" 
          animationDelay={0.1}
        />
        <StatCard 
          title="Active Engines" 
          value={dashboardData.summary.active_engines} 
          icon={<CheckCircle size={24} />} 
          color="green" 
          animationDelay={0.2}
        />
        <StatCard 
          title="In Maintenance" 
          value={dashboardData.summary.maintenance_engines} 
          icon={<Wrench size={24} />} 
          color="yellow" 
          animationDelay={0.3}
        />
        <StatCard 
          title="Attention Needed" 
          value={dashboardData.summary.attention_needed} 
          icon={<AlertTriangle size={24} />} 
          color="red" 
          animationDelay={0.4}
        />
      </div>
      
      {/* Charts section */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{ 
          animationDelay: '0.5s',
          animation: 'fadeIn 0.5s ease-out forwards'
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-500" size={20} />
            Engine Cycles (Last 5 Months)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Bar dataKey="cycles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20} />
            Maintenance Trends
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={maintenanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="scheduled" stroke="#2e7d32" fill="#4caf50" fillOpacity={0.3} />
                <Area type="monotone" dataKey="unscheduled" stroke="#d32f2f" fill="#f44336" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Alerts and critical engines */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{ 
          animationDelay: '0.6s',
          animation: 'fadeIn 0.5s ease-out forwards'
        }}
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2 text-yellow-500" size={20} />
            Recent Alerts
          </h2>
          <div className="space-y-3">
            {dashboardData.recent_alerts.length > 0 ? (
              dashboardData.recent_alerts.map((alert, index) => (
                <AlertItem key={alert.id} alert={alert} animationDelay={0.7 + (index * 0.1)} />
              ))
            ) : (
              <p className="text-gray-500 bg-white p-4 rounded-lg shadow-md">No recent alerts</p>
            )}
          </div>
          {dashboardData.recent_alerts.length > 0 && (
            <div className="mt-4">
              <button className="text-primary-600 hover:underline text-sm flex items-center">
                <span>View all alerts</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" size={20} />
            Engines Requiring Attention
          </h2>
          <div className="space-y-3">
            {dashboardData.critical_engines.length > 0 ? (
              dashboardData.critical_engines.map((engine, index) => (
                <CriticalEngineItem key={engine.id} engine={engine} animationDelay={0.7 + (index * 0.1)} />
              ))
            ) : (
              <p className="text-gray-500 bg-white p-4 rounded-lg shadow-md">No engines requiring immediate attention</p>
            )}
          </div>
          <div className="mt-4">
            <button className="text-primary-600 hover:underline text-sm flex items-center">
              <span>View all engines</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent maintenance */}
      <div 
        style={{ 
          animationDelay: '0.8s',
          animation: 'fadeIn 0.5s ease-out forwards'
        }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Wrench className="mr-2 text-blue-500" size={20} />
          Recent Maintenance Activities
        </h2>
        <div className="space-y-3">
          {dashboardData.recent_maintenance.length > 0 ? (
            dashboardData.recent_maintenance.map((activity, index) => (
              <MaintenanceItem key={activity.id} maintenance={activity} animationDelay={0.9 + (index * 0.1)} />
            ))
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-lg shadow-md">No recent maintenance activities</p>
          )}
        </div>
        <div className="mt-4">
          <button className="text-primary-600 hover:underline text-sm flex items-center">
            <span>View all maintenance</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Spinner animation */
        .spinner {
          width: 40px;
          height: 40px;
          position: relative;
          margin: 0 auto;
        }
        
        .double-bounce1, .double-bounce2 {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #3b82f6;
          opacity: 0.6;
          position: absolute;
          top: 0;
          left: 0;
          animation: bounce 2s infinite ease-in-out;
        }
        
        .double-bounce2 {
          animation-delay: -1.0s;
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(0.0); }
          50% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;