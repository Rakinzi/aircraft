import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
} from 'recharts';
import {
  AlertTriangle,
  Wrench,
  Gauge,
  CheckCircle,
  Clock,
  Calendar,
  ChevronLeft,
  Settings,
  Plus,
  Clipboard,
  ArrowUpRight,
  Activity,
  Download,
  Zap
} from 'lucide-react';
import { enginesAPI } from '../../services/api';

// Radial progress bar component for visual RUL representation
const RadialProgressBar = ({ value, maxValue, size = 150, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value / maxValue;
  const strokeDashoffset = circumference * (1 - progress);

  // Calculate color based on value (red to green gradient)
  const getColor = (val) => {
    // Calculate hue (0 = red, 120 = green)
    const hue = val * 120;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(progress)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{Math.round(value)}</div>
        <div className="text-xs text-gray-500">cycles remaining</div>
      </div>
    </div>
  );
};

// Maintenance timeline component
const MaintenanceTimeline = ({ maintenanceHistory }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {maintenanceHistory.map((record, recordIdx) => (
          <li key={record.id} className="animate-fadeInRight" style={{ animationDelay: `${recordIdx * 0.1 + 0.5}s` }}>
            <div className="relative pb-8">
              {recordIdx !== maintenanceHistory.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${record.maintenance_type === 'scheduled' ? 'bg-blue-500' : 'bg-orange-500'
                    }`}>
                    <Wrench size={16} className="text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">
                      {record.maintenance_type.charAt(0).toUpperCase() + record.maintenance_type.slice(1)}
                      {record.description && ` - ${record.description}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Cycle count: {record.cycle_count}
                    </p>
                    {record.parts_replaced && (
                      <p className="mt-1 text-xs text-gray-600">
                        Parts replaced: {typeof record.parts_replaced === 'string'
                          ? record.parts_replaced
                          : Array.isArray(record.parts_replaced)
                            ? record.parts_replaced.join(', ')
                            : typeof record.parts_replaced === 'object'
                              ? Object.keys(record.parts_replaced).join(', ')
                              : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <p>{new Date(record.start_date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">
                      By: {record.performed_by}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Sensor readout component
const SensorReadout = ({ name, value, unit, trend, trendPeriod = "past week" }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:scale-105">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium">{name}</p>
          <p className="text-2xl font-bold">
            {value} <span className="text-sm text-gray-500">{unit}</span>
          </p>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-xs ${trend > 0
              ? 'text-red-500'
              : trend < 0
                ? 'text-green-500'
                : 'text-gray-400'
            }`}>
            {trend !== 0 && (
              <span className="mr-1">
                {trend > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
            )}
            <span>{Math.abs(trend)}% {trend > 0 ? 'increase' : trend < 0 ? 'decrease' : 'no change'}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">Trend over {trendPeriod}</p>
    </div>
  );
};

// Engine Detail View Component
const EngineDetail = () => {
  const { engineId } = useParams();
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePredictionTab, setActivePredictionTab] = useState('probability');
  const navigate = useNavigate();

  // Fetch engine details
  useEffect(() => {
    document.title = "Engine Details - Aircraft Engine Monitoring";
    const fetchEngineDetail = async () => {
      try {
        setLoading(true);
        const response = await enginesAPI.getById(engineId);
        setEngine(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load engine details:', err);
        setError('Failed to load engine details. Please try again later.');
        setLoading(false);
      }
    };

    if (engineId) {
      fetchEngineDetail();
    }
  }, [engineId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading engine details...</p>
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

  if (!engine) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md" role="alert">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Not Found</p>
            <p>The requested engine could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the latest cycle data
  const latestCycle = engine.cycles?.length > 0 ? engine.cycles[engine.cycles.length - 1] : null;

  // Format failure probability data for charts
  const failureProbData = engine.cycles?.map(cycle => ({
    cycle: cycle.cycle,
    probability: cycle.failure_probability || 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="animate-fadeIn">
        <button
          onClick={() => navigate('/dashboard/engines')}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to engines list
        </button>
      </div>

      {/* Engine header */}
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Gauge size={28} className="text-blue-600" />
            </div>
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
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Link
              to={`/dashboard/engines/${engineId}/edit`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Settings size={15} className="mr-1.5" />
              Engine Settings
            </Link>
            <Link
              to={`/dashboard/maintenance/new?engineId=${engineId}`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Plus size={15} className="mr-1.5" />
              Add Maintenance
            </Link>
          </div>
        </div>

        {/* Engine status info */}
        {latestCycle && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="p-4 bg-gray-50 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center">
                <Gauge size={20} className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${latestCycle.failure_probability > 0.7
                    ? 'bg-red-100 text-red-800'
                    : engine.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                  {latestCycle.failure_probability > 0.7
                    ? 'Warning'
                    : engine.status.charAt(0).toUpperCase() + engine.status.slice(1)}
                </span>
                {latestCycle.failure_probability > 0.7 && (
                  <p className="mt-2 text-xs text-red-600">
                    High failure probability detected
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center">
                <Clock size={20} className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Total Cycles</span>
              </div>
              <div className="mt-2 text-xl font-semibold text-gray-900">
                {engine.total_cycles || 0}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  Last cycle: {latestCycle.timestamp ? new Date(latestCycle.timestamp).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center">
                <Calendar size={20} className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Installation Date</span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {engine.installation_date
                  ? new Date(engine.installation_date).toLocaleDateString()
                  : 'Not specified'}
                <span className="block text-xs text-gray-500 mt-1">
                  {engine.installation_date
                    ? `${Math.round((new Date() - new Date(engine.installation_date)) / (1000 * 60 * 60 * 24 * 30))} months in service`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prediction & RUL section */}
      {latestCycle && (
        <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center mb-4">
            <Zap size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">Predictive Analytics</h2>
          </div>

          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`py-2 px-4 font-medium text-sm ${activePredictionTab === 'probability'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
                }`}
              onClick={() => setActivePredictionTab('probability')}
            >
              Failure Probability
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activePredictionTab === 'rul'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
                }`}
              onClick={() => setActivePredictionTab('rul')}
            >
              Remaining Useful Life
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activePredictionTab === 'sensors'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
                }`}
              onClick={() => setActivePredictionTab('sensors')}
            >
              Sensor Trends
            </button>
          </div>

          {activePredictionTab === 'probability' && failureProbData.length > 0 && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
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
                  <p className="text-sm text-gray-600 mt-2">
                    Failure probability trend over engine cycles shows
                    {latestCycle.failure_probability > 0.5
                      ? ' significant increase in recent cycles, indicating maintenance should be scheduled soon.'
                      : ' normal behavior with no immediate concerns.'}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-6xl font-bold ${latestCycle.failure_probability > 0.7
                      ? 'text-red-600'
                      : latestCycle.failure_probability > 0.5
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                    {Math.round(latestCycle.failure_probability * 100)}%
                  </div>
                  <div className="text-gray-600 text-sm mt-2">Current Failure Probability</div>
                  <div className="mt-4 bg-white p-4 rounded-lg shadow-sm w-full">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendation</h4>
                    {latestCycle.failure_probability > 0.7 ? (
                      <p className="text-sm text-red-600">
                        <AlertTriangle size={16} className="inline mr-1" />
                        Immediate maintenance recommended
                      </p>
                    ) : latestCycle.failure_probability > 0.5 ? (
                      <p className="text-sm text-yellow-600">
                        <AlertTriangle size={16} className="inline mr-1" />
                        Schedule maintenance within next 2 weeks
                      </p>
                    ) : (
                      <p className="text-sm text-green-600">
                        <CheckCircle size={16} className="inline mr-1" />
                        No maintenance required at this time
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePredictionTab === 'rul' && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center">
                  {latestCycle.rul !== undefined && (
                    <RadialProgressBar value={latestCycle.rul} maxValue={120} />
                  )}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Based on predictive model analysis, the engine has approximately
                      <span className="font-bold text-blue-600"> {Math.round(latestCycle.rul || 0)} cycles </span>
                      of useful life remaining before maintenance is required.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {engine.cycles?.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={engine.cycles}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="cycle" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="rul"
                            name="Remaining Useful Life"
                            stroke="#2196f3"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {latestCycle.rul < 30
                      ? 'The RUL trend shows accelerated degradation in recent cycles, indicating a potential component issue that should be addressed.'
                      : 'The RUL trend shows normal degradation patterns within expected parameters.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePredictionTab === 'sensors' && (
            <div className="animate-fadeIn">
              {latestCycle.sensor_data && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <SensorReadout
                    name="Fan Speed (s2)"
                    value={latestCycle.sensor_data.s2 || 'N/A'}
                    unit="RPM"
                  />
                  <SensorReadout
                    name="Core Speed (s3)"
                    value={latestCycle.sensor_data.s3 || 'N/A'}
                    unit="RPM"
                  />
                  <SensorReadout
                    name="EGT (s4)"
                    value={latestCycle.sensor_data.s4 || 'N/A'}
                    unit="°C"
                  />
                  <SensorReadout
                    name="Oil Pressure (s5)"
                    value={latestCycle.sensor_data.s5 || 'N/A'}
                    unit="PSI"
                  />
                </div>
              )}

              {engine.cycles?.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engine.cycles}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cycle" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={(data) => data.sensor_data?.s2}
                        name="Fan Speed (s2)"
                        stroke="#2196f3"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey={(data) => data.sensor_data?.s3}
                        name="Core Speed (s3)"
                        stroke="#4caf50"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey={(data) => data.sensor_data?.s4}
                        name="EGT (s4)"
                        stroke="#ff9800"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                {latestCycle.failure_probability > 0.5
                  ? 'Sensor trends show increasing values, which correlate with the rising failure probability. The pattern matching algorithms have identified this pattern as indicative of potential component wear.'
                  : 'Sensor trends show normal behavior within expected parameters.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Maintenance History */}
      <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Wrench size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">Maintenance History</h2>
          </div>
          <Link
            to={`/dashboard/maintenance/new?engineId=${engineId}`}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add maintenance record
          </Link>
        </div>

        {engine.maintenance_history && engine.maintenance_history.length > 0 ? (
          <MaintenanceTimeline maintenanceHistory={engine.maintenance_history} />
        ) : (
          <p className="text-sm text-gray-500">No maintenance records found for this engine.</p>
        )}
      </div>

      {/* Actions Panel */}
      <div className="bg-blue-50 rounded-lg shadow-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
          <Activity size={20} className="mr-2" />
          Actions & Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-lg p-4 shadow-md flex items-center hover:shadow-lg transition-shadow">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <Clipboard size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Generate Report</p>
              <p className="text-xs text-gray-500">Full diagnostic details</p>
            </div>
          </button>

          <button className="bg-white rounded-lg p-4 shadow-md flex items-center hover:shadow-lg transition-shadow">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <Download size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Export Data</p>
              <p className="text-xs text-gray-500">CSV, PDF or JSON</p>
            </div>
          </button>

          <Link
            to={`/dashboard/maintenance/new?engineId=${engineId}`}
            className="bg-white rounded-lg p-4 shadow-md flex items-center hover:shadow-lg transition-shadow"
          >
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <ArrowUpRight size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Schedule Maintenance</p>
              <p className="text-xs text-gray-500">Based on predictions</p>
            </div>
          </Link>

          <Link
            to={`/dashboard/engines/${engineId}/add-cycle`}
            className="bg-white rounded-lg p-4 shadow-md flex items-center hover:shadow-lg transition-shadow"
          >
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <Plus size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Add Cycle Data</p>
              <p className="text-xs text-gray-500">Test the prediction model</p>
            </div>
          </Link>
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
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.5s ease-out forwards;
        }
        
        /* Spinner animation */
        .spinner {
          margin: 100px auto 0;
          width: 70px;
          text-align: center;
        }

        .spinner > div {
          width: 18px;
          height: 18px;
          background-color: #3b82f6;
          border-radius: 100%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .spinner .bounce1 {
          animation-delay: -0.32s;
        }

        .spinner .bounce2 {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </div>
  );
};

export default EngineDetail;