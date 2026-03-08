import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const RecordsTable = ({ filters }) => {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchShifts()
  }, [filters])

  const fetchShifts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          employees (
            full_name,
            employee_code
          )
        `)
        .order('clock_in_at', { ascending: false })

      // Apply filters
      if (filters?.employee) {
        query = query.eq('employee_id', filters.employee)
      }

      if (filters?.dateFrom) {
        query = query.gte('clock_in_at', new Date(filters.dateFrom).toISOString())
      }

      if (filters?.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setHours(23, 59, 59, 999)
        query = query.lte('clock_in_at', endDate.toISOString())
      }

      if (filters?.status === 'active') {
        query = query.is('clock_out_at', null)
      } else if (filters?.status === 'completed') {
        query = query.not('clock_out_at', 'is', null)
      }

      const { data, error } = await query

      if (error) throw error
      setShifts(data || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn) return 'N/A'
    
    const inTime = new Date(clockIn)
    const outTime = clockOut ? new Date(clockOut) : new Date()
    
    const hours = Math.floor((outTime - inTime) / (1000 * 60 * 60))
    const minutes = Math.floor(((outTime - inTime) % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">Error loading records: {error}</div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Records</h3>
      
      {shifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No records found matching the current filters.
        </div>
      ) : (
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
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {shift.employees?.full_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {shift.employees?.employee_code || ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(shift.clock_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shift.clock_out_at ? formatDateTime(shift.clock_out_at) : 'Active'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateHours(shift.clock_in_at, shift.clock_out_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      shift.clock_out_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shift.clock_out_at ? 'Completed' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RecordsTable
