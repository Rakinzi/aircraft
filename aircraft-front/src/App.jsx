import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Auth pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

// Dashboard pages
import Dashboard from './pages/Dashboard/Dashboard'
import EnginesList from './pages/Engines/EnginesList'
import EngineDetail from './pages/Engines/EngineDetail'
import MaintenanceList from './pages/Maintenance/MaintenanceList'
import MaintenanceForm from './pages/Maintenance/MaintenanceForm'
import AlertsList from './pages/Alerts/AlertsList'

// Layout components
import AuthLayout from './components/Layouts/AuthLayout'
import DashboardLayout from './components/Layouts/DashboardLayout'
import PrivateRoute from './components/PrivateRoute'
import EngineForm from './pages/Engines/EngineForm'

// Context
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="engines" element={<EnginesList />} />
              <Route path="engines/:engineId" element={<EngineDetail />} />
              <Route path="maintenance" element={<MaintenanceList />} />
              <Route path="maintenance/new" element={<MaintenanceForm />} />
              <Route path="maintenance/:maintenanceId/edit" element={<MaintenanceForm />} />
              <Route path="alerts" element={<AlertsList />} />
              <Route path="engines/new" element={<EngineForm />} />
              <Route path="engines/:engineId/edit" element={<EngineForm />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App