import React, { useState, useEffect } from 'react'
import { timeTrackingService } from '../../services/timeTrackingService'
import { useAdminDashboardUpdates } from '../../hooks/useRealtimeUpdates'
import { usePollingFallback } from '../../hooks/usePollingFallback'

const StatsCards = ({ filters = {} }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    currentlyClockedIn: 0,
    totalShiftsToday: 0,
    totalWorkingTime: '0h 0m'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  const fetchStats = async () => {
    console.log('📊 Fetching stats...');
    setLoading(true)
    setError(null)
    
    try {
      const result = await timeTrackingService.getDashboardStats(filters)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      setStats(result.data)
      setRealtimeConnected(true)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error.message)
      setRealtimeConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [filters])

  // Real-time updates for admin dashboard
  useAdminDashboardUpdates((update) => {
    console.log('📊 StatsCards real-time update:', update)
    setRealtimeConnected(true)
    
    // Refresh stats when changes occur
    fetchStats()
  })

  // Polling fallback - refresh every 10 seconds as backup
  usePollingFallback(() => {
    if (!realtimeConnected) {
      console.log('📊 Polling fallback: Refreshing stats')
      fetchStats()
    }
  }, 10000, [filters, realtimeConnected])

  // Connection status indicator
  const showConnectionStatus = () => {
    if (realtimeConnected) {
      return (
        <div className="flex items-center space-x-2 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-2 text-xs text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span>Polling</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-red-700">Error loading stats: {error}</div>
            <button 
              onClick={fetchStats}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
          {showConnectionStatus()}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Currently Clocked In',
      value: stats.currentlyClockedIn,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Total Shifts Today',
      value: stats.totalShiftsToday,
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Total Working Time',
      value: stats.totalWorkingTime,
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'orange'
    }
  ]

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 bg-${card.color}-100 rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsCards
