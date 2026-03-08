import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ClockPage from './pages/ClockPage'
import AdminDashboard from './pages/AdminDashboard'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<ClockPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
