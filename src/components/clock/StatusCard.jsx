import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const StatusCard = ({ selectedEmployeeId, refreshKey }) => {
  const [currentShift, setCurrentShift] = useState(null)
  const [lastShift, setLastShift] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeStatus()
    } else {
      setCurrentShift(null)
      setLastShift(null)
    }
  }, [selectedEmployeeId, refreshKey])

  const fetchEmployeeStatus = async () => {
    if (!selectedEmployeeId) return

    setLoading(true)
    
    try {
      // Find current open shift
      const { data: openShifts, error: openError } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .is('clock_out_at', null)
        .order('clock_in_at', { ascending: false })
        .limit(1)

      if (openError) throw openError

      if (openShifts && openShifts.length > 0) {
        setCurrentShift(openShifts[0])
        setLastShift(null)
      } else {
        // Find last completed shift
        const { data: completedShifts, error: completedError } = await supabase
          .from('shifts')
          .select('*')
          .eq('employee_id', selectedEmployeeId)
          .not('clock_out_at', 'is', null)
          .order('clock_in_at', { ascending: false })
          .limit(1)

        if (completedError) throw completedError

        setCurrentShift(null)
        setLastShift(completedShifts && completedShifts.length > 0 ? completedShifts[0] : null)
      }
    } catch (error) {
      console.error('Error fetching employee status:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateDuration = (clockIn, clockOut) => {
    if (!clockIn) return 'N/A'
    
    const inTime = new Date(clockIn)
    const outTime = clockOut ? new Date(clockOut) : new Date()
    
    const hours = Math.floor((outTime - inTime) / (1000 * 60 * 60))
    const minutes = Math.floor(((outTime - inTime) % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-700 mb-2">
          Status: {currentShift ? 'Clocked In' : 'Clocked Out'}
        </div>
        
        {currentShift ? (
          <div className="text-green-600">
            <div className="text-sm">Clocked in at: {formatTime(currentShift.clock_in_at)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(currentShift.clock_in_at)} • Duration: {calculateDuration(currentShift.clock_in_at)}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            <div className="text-sm">No active shift</div>
          </div>
        )}
        
        {lastShift && !currentShift && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">Last activity:</div>
            <div className="text-sm text-gray-700">
              {formatTime(lastShift.clock_in_at)} - {formatTime(lastShift.clock_out_at)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(lastShift.clock_in_at)} • Total: {calculateDuration(lastShift.clock_in_at, lastShift.clock_out_at)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusCard
