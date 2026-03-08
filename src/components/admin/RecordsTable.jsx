import React, { useState, useEffect } from 'react'
import { timeTrackingService } from '../../services/timeTrackingService'
import { useAdminDashboardUpdates } from '../../hooks/useRealtimeUpdates'

const RecordsTable = ({ filters, refreshKey, onAdjustment }) => {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Format date and time in 24-hour format (Mar 8, 14:25)
  const formatDateTime = (dateString) => {
    if (!dateString) return '--'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const fetchShifts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await timeTrackingService.getShifts(filters)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      setShifts(result.data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShifts()
  }, [filters, refreshKey])

  // Real-time updates for records table
  useAdminDashboardUpdates((update) => {
    console.log('📋 RecordsTable real-time update:', update)
    console.log('📋 Update type:', update.type)
    console.log('📋 Update shift data:', update.shift)
    
    // Handle different types of updates with specific logic
    switch (update.type) {
      case 'EMPLOYEE_CLOCKED_IN':
        console.log('📋 Handling EMPLOYEE_CLOCKED_IN')
        // For new shifts, refetch to get employee data
        fetchShifts()
        break
        
      case 'EMPLOYEE_CLOCKED_OUT':
        console.log('📋 Handling EMPLOYEE_CLOCKED_OUT')
        // For clock outs, refetch to get updated duration
        fetchShifts()
        break
        
      case 'SHIFT_UPDATED':
        console.log('📋 Handling SHIFT_UPDATED')
        // For any shift updates, refetch to ensure consistency
        fetchShifts()
        break
        
      case 'SHIFT_DELETED':
        console.log('📋 Handling SHIFT_DELETED')
        // For deleted shifts, refetch to remove from list
        fetchShifts()
        break
        
      default:
        console.log('📋 Unknown update type, refetching as fallback')
        fetchShifts()
    }
    
    // Notify parent component of adjustments
    if (onAdjustment) {
      onAdjustment()
    }
  })

  const getStatusBadge = (shift) => {
    if (!shift.clock_out_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Completed
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-700">Error loading records: {error}</div>
        <button 
          onClick={fetchShifts}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (shifts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="mt-2 text-sm text-gray-600">No records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shifts.map((shift) => (
              <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {shift.employees?.full_name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {shift.employees?.employee_code}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(shift.clock_in_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {shift.clock_out_at 
                    ? formatDateTime(shift.clock_out_at)
                    : '--'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {shift.clock_out_at 
                    ? (shift.duration || '--')
                    : <span className="text-gray-400 italic">In progress...</span>
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(shift)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecordsTable
