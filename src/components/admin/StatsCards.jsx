import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    currentlyClockedIn: 0,
    totalShiftsToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    console.log('Fetching stats...');
    setLoading(true)
    setError(null)
    
    try {
      // Test basic connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('employees')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Supabase connection error:', testError)
        throw testError
      }

      console.log('Supabase connection successful');

      // Get total active employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('is_active', true)

      if (empError) throw empError

      // Get currently clocked in shifts
      const { data: activeShifts, error: activeError } = await supabase
        .from('shifts')
        .select('id')
        .is('clock_out_at', null)

      if (activeError) throw activeError

      // Get today's shifts
      const today = new Date().toISOString().split('T')[0]
      const { data: todayShifts, error: todayError } = await supabase
        .from('shifts')
        .select('id')
        .gte('clock_in_at', today)
        .lt('clock_in_at', new Date(Date.now() + 86400000).toISOString().split('T')[0])

      if (todayError) throw todayError

      const newStats = {
        totalEmployees: employees?.length || 0,
        currentlyClockedIn: activeShifts?.length || 0,
        totalShiftsToday: todayShifts?.length || 0
      }

      console.log('Stats fetched:', newStats)
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div className="text-red-700">Error loading stats: {error}</div>
        <button 
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-600 mb-2">Total Employees</div>
        <div className="text-3xl font-bold text-blue-600">{stats.totalEmployees}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-600 mb-2">Currently Clocked In</div>
        <div className="text-3xl font-bold text-green-600">{stats.currentlyClockedIn}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-600 mb-2">Total Shifts Today</div>
        <div className="text-3xl font-bold text-purple-600">{stats.totalShiftsToday}</div>
      </div>
    </div>
  )
}

export default StatsCards
