import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ClockPage from './pages/ClockPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  console.log('App component rendering');
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<ClockPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        
        {/* Navigation Footer */}
        <div className="fixed bottom-4 right-4 flex space-x-2">
          <a
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Clock Page
          </a>
          <a
            href="/admin"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Admin Dashboard
          </a>
        </div>
      </div>
    </Router>
  )
}

export default App
