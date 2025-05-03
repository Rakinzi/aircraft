import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  AlertTriangle, 
  ChevronLeft,
  UploadCloud,
  RefreshCw,
  Database,
  Sliders,
  Activity,
  Plus,
  Check,
  Copy,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { enginesAPI } from '../../services/api';

const EngineCycleForm = () => {
  const { engineId } = useParams();
  const navigate = useNavigate();
  
  const [engines, setEngines] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState(engineId || '');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Initial data for new cycles
  const [formData, setFormData] = useState({
    cycle: 1,
    setting1: 0.0,
    setting2: 0.0,
    setting3: 100.0,
    s1: 518.67,
    s2: 642.0,
    s3: 1580.0,
    s4: 1400.0,
    s5: 14.62,
    s6: 21.61,
    s7: 554.0,
    s8: 2388.0,
    s9: 9050.0,
    s10: 1.3,
    s11: 47.5,
    s12: 522.0,
    s13: 2388.0,
    s14: 8130.0,
    s15: 8.4,
    s16: 0.03,
    s17: 392,
    s18: 2388,
    s19: 100.0,
    s20: 39.0,
    s21: 23.4
  });
  
  // Sample data for easy testing
  const sampleDataSets = [
    {
      name: "Normal Operation",
      data: {
        cycle: 1,
        setting1: 0.0023,
        setting2: 0.0003,
        setting3: 100.0,
        s1: 518.67,
        s2: 643.02,
        s3: 1585.29,
        s4: 1398.21,
        s5: 14.62,
        s6: 21.61,
        s7: 553.90,
        s8: 2388.04,
        s9: 9050.17,
        s10: 1.30,
        s11: 47.20,
        s12: 521.72,
        s13: 2388.03,
        s14: 8125.55,
        s15: 8.4052,
        s16: 0.03,
        s17: 392,
        s18: 2388,
        s19: 100.00,
        s20: 38.86,
        s21: 23.3735
      }
    },
    {
      name: "Mid-Life Operation",
      data: {
        cycle: 2,
        setting1: -0.0027,
        setting2: -0.0003,
        setting3: 100.0,
        s1: 518.67,
        s2: 641.71,
        s3: 1588.45,
        s4: 1395.42,
        s5: 14.62,
        s6: 21.61,
        s7: 554.85,
        s8: 2388.01,
        s9: 9054.42,
        s10: 1.30,
        s11: 47.50,
        s12: 522.16,
        s13: 2388.06,
        s14: 8139.62,
        s15: 8.3803,
        s16: 0.03,
        s17: 393,
        s18: 2388,
        s19: 100.00,
        s20: 39.02,
        s21: 23.3916
      }
    },
    {
      name: "Degraded Performance",
      data: {
        cycle: 3,
        setting1: 0.0042,
        setting2: 0.0000,
        setting3: 100.0,
        s1: 518.67,
        s2: 639.44, // Lower fan speed indicating wear
        s3: 1584.12,
        s4: 1411.42, // Higher EGT
        s5: 14.92,   // Higher oil pressure from restricted flow
        s6: 21.81,
        s7: 556.07,  // Higher values
        s8: 2388.03,
        s9: 9060.29, // Higher vibration
        s10: 1.32,
        s11: 47.28,
        s12: 520.38, // Lower efficiency
        s13: 2388.05,
        s14: 8142.90, // Higher vibration
        s15: 8.2917,  // Lower efficiency
        s16: 0.033,   // Higher emissions
        s17: 395,
        s18: 2388,
        s19: 100.00,
        s20: 39.50,
        s21: 23.6737
      }
    }
  ];
  
  // Sensor behavior patterns for realistic degradation simulation
  const sensorPatterns = {
    // Sensors that gradually increase as engines degrade
    increasing: ['s1', 's4', 's5', 's7', 's9', 's14', 's16', 's20', 's21'],
    // Sensors that gradually decrease as engines degrade
    decreasing: ['s2', 's3', 's12', 's15'],
    // Sensors with minimal change
    stable: ['s6', 's8', 's10', 's11', 's13', 's17', 's18', 's19']
  };
  
  // Degradation rates
  const degradationRates = {
    normal: {
      increasing: 0.0002, // 0.02% increase per cycle
      decreasing: 0.0002, // 0.02% decrease per cycle
      stable: 0.0001      // 0.01% random variation
    },
    accelerated: {
      increasing: 0.001,  // 0.1% increase per cycle
      decreasing: 0.001,  // 0.1% decrease per cycle
      stable: 0.0002      // 0.02% random variation
    },
    failure: {
      increasing: 0.005,  // 0.5% increase per cycle
      decreasing: 0.005,  // 0.5% decrease per cycle
      stable: 0.0005      // 0.05% random variation
    }
  };
  
  const [cycleCount, setCycleCount] = useState(0);
  const [batchMode, setBatchMode] = useState(false);
  const [batchCount, setBatchCount] = useState(10);
  const [batchStartCycle, setBatchStartCycle] = useState(1);
  const [degradationMode, setDegradationMode] = useState('normal');
  const [showInfo, setShowInfo] = useState(false);
  
  // Fetch engines list
  useEffect(() => {
    const fetchEngines = async () => {
      try {
        setLoading(true);
        const response = await enginesAPI.getAll();
        setEngines(response.data);
        
        // If engineId is provided in URL but not set in state, set it now
        if (engineId && !selectedEngine) {
          setSelectedEngine(engineId);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch engines:', err);
        setError('Failed to load engines. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEngines();
  }, [engineId, selectedEngine]);
  
  // Fetch current cycle count when engine is selected
  useEffect(() => {
    const fetchEngineDetails = async () => {
      if (!selectedEngine) return;
      
      try {
        setLoading(true);
        const response = await enginesAPI.getById(selectedEngine);
        // Set cycle count to total_cycles + 1 for the next cycle
        const nextCycle = (response.data.total_cycles || 0) + 1;
        setCycleCount(nextCycle);
        setFormData(prev => ({ ...prev, cycle: nextCycle }));
        
        // If we're in batch mode, update batch start cycle
        if (batchMode) {
          setBatchStartCycle(nextCycle);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch engine details:', err);
        setError('Failed to load engine details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEngineDetails();
  }, [selectedEngine]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert to proper numeric value if needed
    let parsedValue = value;
    if (name !== 'cycle' && name !== 'engine_id') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const handleEngineChange = (e) => {
    setSelectedEngine(e.target.value);
  };
  
  const handleLoadSample = (sample) => {
    // Update cycle if needed
    const updatedSample = {
      ...sample.data,
      cycle: batchMode ? batchStartCycle : cycleCount
    };
    setFormData(updatedSample);
  };
  
  const handleRandomize = () => {
    // Create slightly randomized data based on current form data
    const randomizedData = { ...formData };
    
    Object.keys(randomizedData).forEach(key => {
      // Skip cycle and engine_id
      if (key === 'cycle' || key === 'engine_id') return;
      
      const currentValue = randomizedData[key];
      
      // Add random variation (±3%)
      const randomFactor = 0.97 + (Math.random() * 0.06); // 0.97 to 1.03
      randomizedData[key] = Number((currentValue * randomFactor).toFixed(4));
    });
    
    setFormData(randomizedData);
  };
  
  // Generate realistic degradation patterns
  const generateRealisticDegradation = (baseCycleData, cycleIndex) => {
    const newCycleData = { ...baseCycleData };
    const rates = degradationRates[degradationMode];
    
    // Special handling for rapid degradation in the last 10-15% of cycles
    const accelerationPoint = Math.floor(batchCount * 0.85);
    const isAccelerating = cycleIndex > accelerationPoint;
    
    // Generate realistic degradation pattern
    Object.keys(newCycleData).forEach(key => {
      // Skip cycle field
      if (key === 'cycle') return;
      
      const currentValue = newCycleData[key];
      // Only process numeric values
      if (typeof currentValue !== 'number') return;
      
      let modificationFactor = 1.0;
      let randomNoise = 0;
      
      // Apply appropriate degradation patterns
      if (sensorPatterns.increasing.includes(key)) {
        // Increasing trend (like temperature, vibration)
        let rate = rates.increasing;
        if (isAccelerating) rate *= 2.5; // Accelerate degradation near the end
        
        modificationFactor = 1 + (rate * cycleIndex);
        // Add occasional "spike" with 5% probability
        if (Math.random() < 0.05) modificationFactor *= 1.02;
        
        // Add small random noise
        randomNoise = (Math.random() * 0.01) - 0.005;
      } 
      else if (sensorPatterns.decreasing.includes(key)) {
        // Decreasing trend (like efficiency, oil level)
        let rate = rates.decreasing;
        if (isAccelerating) rate *= 2.5; // Accelerate degradation near the end
        
        modificationFactor = 1 - (rate * cycleIndex);
        // Add occasional "dip" with 5% probability
        if (Math.random() < 0.05) modificationFactor *= 0.98;
        
        // Add small random noise
        randomNoise = (Math.random() * 0.01) - 0.005;
      }
      else if (sensorPatterns.stable.includes(key)) {
        // Stable values with just small random variations
        randomNoise = (Math.random() * rates.stable * 2) - rates.stable;
      }
      else {
        // Settings and other fields get very minimal randomness
        randomNoise = (Math.random() * 0.0005) - 0.00025;
      }
      
      // Apply changes
      newCycleData[key] = Number((currentValue * (modificationFactor + randomNoise)).toFixed(4));
    });
    
    return newCycleData;
  };
  
  const validateForm = () => {
    if (!selectedEngine) {
      setError('Please select an engine');
      return false;
    }
    
    // Additional validation could be added here
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      if (batchMode) {
        // Submit multiple cycles in batch mode
        const promises = [];
        
        // Use the current form data as the base for the first cycle
        let baseCycleData = { ...formData, cycle: batchStartCycle };
        
        for (let i = 0; i < batchCount; i++) {
          // Generate realistic degradation based on previous cycle
          const cycleData = i === 0 
            ? baseCycleData 
            : generateRealisticDegradation(baseCycleData, i);
          
          // Update cycle number
          cycleData.cycle = batchStartCycle + i;
          
          // If this is not the first cycle, update the base for next iteration
          if (i > 0) {
            baseCycleData = { ...cycleData };
          }
          
          promises.push(enginesAPI.addCycleData(selectedEngine, cycleData));
        }
        
        await Promise.all(promises);
        
        setSuccess(true);
        setTimeout(() => {
          // Refresh to show updated cycle count
          setSuccess(false);
          const newCycle = batchStartCycle + batchCount;
          setCycleCount(newCycle);
          setBatchStartCycle(newCycle);
          setFormData(prev => ({ ...prev, cycle: newCycle }));
        }, 3000);
      } else {
        // Submit single cycle
        await enginesAPI.addCycleData(selectedEngine, formData);
        
        setSuccess(true);
        setTimeout(() => {
          // Refresh to show updated cycle count
          setSuccess(false);
          const newCycle = formData.cycle + 1;
          setCycleCount(newCycle);
          setFormData(prev => ({ ...prev, cycle: newCycle }));
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to add cycle data:', err);
      setError(err.response?.data?.error || 'Failed to add cycle data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Generate an array of sensor fields for the form
  const renderSensorFields = () => {
    const sensorFields = [];
    
    for (let i = 1; i <= 21; i++) {
      const fieldName = `s${i}`;
      const isIncreasing = sensorPatterns.increasing.includes(fieldName);
      const isDecreasing = sensorPatterns.decreasing.includes(fieldName);
      
      sensorFields.push(
        <div key={fieldName} className="col-span-1">
          <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 flex items-center">
            Sensor {i} (s{i})
            {isIncreasing && <TrendingUp size={14} className="ml-1 text-red-500" title="This sensor value tends to increase as engines degrade" />}
            {isDecreasing && <TrendingDown size={14} className="ml-1 text-blue-500" title="This sensor value tends to decrease as engines degrade" />}
          </label>
          <input
            type="number"
            step="0.0001"
            id={fieldName}
            name={fieldName}
            value={formData[fieldName]}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              isIncreasing ? 'border-red-200' : 
              isDecreasing ? 'border-blue-200' : 
              'border-gray-300'
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
        </div>
      );
    }
    
    return sensorFields;
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
      
      <div className="flex justify-between items-center animate-fadeInUp">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Database className="mr-2 text-blue-500" size={28} />
          Add Engine Cycle Data
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md animate-fadeIn" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md animate-fadeIn" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">
                {batchMode 
                  ? `Successfully added ${batchCount} cycles (${batchStartCycle}-${batchStartCycle + batchCount - 1})` 
                  : `Successfully added cycle #${formData.cycle}`}
              </p>
              <p className="text-xs mt-1">
                {cycleCount >= 50 
                  ? "You have enough cycles for the model to make predictions. Check the engine details page." 
                  : `You need ${50 - cycleCount} more cycles for the model to make predictions.`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Engine selection and cycle information */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="engine_id" className="block text-sm font-medium text-gray-700">
                Select Engine <span className="text-red-500">*</span>
              </label>
              <select
                id="engine_id"
                name="engine_id"
                value={selectedEngine}
                onChange={handleEngineChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={loading || submitting}
              >
                <option value="">Select an engine</option>
                {engines.map(engine => (
                  <option key={engine.id} value={engine.id}>
                    Engine {engine.serial_number} {engine.aircraft_id ? `(Aircraft: ${engine.aircraft_id})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedEngine && (
              <>
                <div>
                  <label htmlFor="cycle" className="block text-sm font-medium text-gray-700">
                    Cycle Number
                  </label>
                  <input
                    type="number"
                    name="cycle"
                    id="cycle"
                    value={formData.cycle}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1"
                    disabled={batchMode}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Next cycle number is automatically set based on engine history
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Batch Mode
                    </label>
                    <button
                      type="button"
                      onClick={() => setBatchMode(!batchMode)}
                      className={`${
                        batchMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      <span
                        className={`${
                          batchMode ? 'translate-x-6' : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                      />
                    </button>
                  </div>
                  {batchMode && (
                    <>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="batchStartCycle" className="block text-xs font-medium text-gray-700">
                            Starting Cycle
                          </label>
                          <input
                            type="number"
                            id="batchStartCycle"
                            value={batchStartCycle}
                            onChange={(e) => setBatchStartCycle(parseInt(e.target.value) || 1)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                            min="1"
                          />
                        </div>
                        <div>
                          <label htmlFor="batchCount" className="block text-xs font-medium text-gray-700">
                            Number of Cycles
                          </label>
                          <input
                            type="number"
                            id="batchCount"
                            value={batchCount}
                            onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                            min="1"
                            max="50"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label htmlFor="degradationMode" className="block text-xs font-medium text-gray-700">
                          Degradation Pattern
                        </label>
                        <select
                          id="degradationMode"
                          value={degradationMode}
                          onChange={(e) => setDegradationMode(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                        >
                          <option value="normal">Normal Aging (Slow Degradation)</option>
                          <option value="accelerated">Accelerated Wear (Medium Degradation)</option>
                          <option value="failure">Approaching Failure (Rapid Degradation)</option>
                        </select>
                      </div>
                    </>
                  )}
                  <p className="mt-1 text-xs text-gray-500 flex items-center">
                    {batchMode 
                      ? 'Generate multiple cycles with realistic degradation patterns' 
                      : 'Toggle to quickly add multiple cycles with realistic patterns'}
                    <button 
                      type="button" 
                      className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={() => setShowInfo(!showInfo)}
                    >
                      <Info size={14} />
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
          
          {showInfo && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 text-sm">How Degradation Patterns Work</h4>
              <p className="mt-1 text-sm text-blue-700">
                The system generates realistic engine degradation over time:
              </p>
              <ul className="mt-2 text-xs text-blue-700 space-y-1">
                <li className="flex items-center">
                  <TrendingUp size={14} className="mr-1 text-red-500" />
                  <span>Red indicators show sensors that increase as engines wear (e.g., temperature, vibration)</span>
                </li>
                <li className="flex items-center">
                  <TrendingDown size={14} className="mr-1 text-blue-500" />
                  <span>Blue indicators show sensors that decrease as engines wear (e.g., efficiency, fan speed)</span>
                </li>
                <li>Degradation accelerates in later cycles, similar to real engine behavior</li>
                <li>Random variation is added to simulate real-world sensor noise</li>
                <li>Occasional "spikes" or "dips" are added to simulate temporary anomalies</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700">
                Choose "Approaching Failure" to generate data that will trigger the prediction model to detect problems.
              </p>
            </div>
          )}
        </div>
        
        {/* Helper buttons */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Randomize Values
          </button>
          
          {sampleDataSets.map((sample, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Copy size={14} className="mr-1.5" />
              Load {sample.name}
            </button>
          ))}
          
          <span className="text-sm text-gray-500 flex items-center">
            <Activity size={16} className="mr-1 text-blue-500" />
            {cycleCount >= 50 
              ? "You have enough cycles for prediction!" 
              : `${cycleCount}/50 cycles - need ${50 - cycleCount} more`}
          </span>
        </div>
        
        {/* Form content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Sliders size={20} className="mr-2 text-blue-500" />
              Engine Settings
            </h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="setting1" className="block text-sm font-medium text-gray-700">
                  Setting 1 (Altitude)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  id="setting1"
                  name="setting1"
                  value={formData.setting1}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="setting2" className="block text-sm font-medium text-gray-700">
                  Setting 2 (Mach Number)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  id="setting2"
                  name="setting2"
                  value={formData.setting2}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="setting3" className="block text-sm font-medium text-gray-700">
                  Setting 3 (Power Setting)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="setting3"
                  name="setting3"
                  value={formData.setting3}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity size={20} className="mr-2 text-blue-500" />
              Sensor Readings
            </h3>
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <TrendingUp size={14} className="mx-1 text-red-500" />
              Increases with wear
              <TrendingDown size={14} className="mx-1 ml-3 text-blue-500" />
              Decreases with wear
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {renderSensorFields()}
            </div>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/engines/${selectedEngine}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X size={16} className="mr-2" />
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || submitting || !selectedEngine}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {batchMode ? 'Adding Cycles...' : 'Adding Cycle...'}
              </>
            ) : (
              <>
                <UploadCloud size={16} className="mr-2" />
                {batchMode 
                  ? `Add ${batchCount} Cycles` 
                  : 'Add Cycle Data'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Cycle data info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How This System Fulfills Your Objectives</h3>
        <div className="prose max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-blue-800 font-medium">Objective 1: Anomaly Detection</h4>
              <p className="text-sm">
                The system identifies deviations from normal operating behavior by analyzing patterns in sensor data. Anomalies trigger alerts when they cross certain thresholds.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-blue-800 font-medium">Objective 2: Maintenance Prediction</h4>
              <p className="text-sm">
                The RNN model predicts when an engine is due for maintenance 30 cycles before failure, allowing for preventive maintenance scheduling.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-blue-800 font-medium">Objective 3: Remaining Useful Life</h4>
              <p className="text-sm">
                The LSTM algorithm estimates the remaining useful life (RUL) of engines based on their current condition and degradation patterns.
              </p>
            </div>
          </div>
          
          <p className="mt-4">
            The form you're using now helps test these capabilities by generating realistic sensor data that mimics actual engine behavior over time, with natural degradation patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EngineCycleForm;