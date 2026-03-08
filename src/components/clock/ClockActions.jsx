import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const ClockActions = ({ selectedEmployeeId, onClockUpdate }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleClockIn = async () => {
    if (!selectedEmployeeId) {
      setMessage('Please select an employee first')
      return
    }

    setIsLoading(true)
    setMessage('')
    
    try {
      // Check if employee already has an open shift
      const { data: existingShifts, error: checkError } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .is('clock_out_at', null)

      if (checkError) throw checkError

      if (existingShifts && existingShifts.length > 0) {
        setMessage('Employee is already clocked in')
        return
      }

      // Clock in the employee
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          employee_id: selectedEmployeeId,
          clock_in_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      setMessage('Successfully clocked in!')
      onClockUpdate()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      setMessage('Error clocking in: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!selectedEmployeeId) {
      setMessage('Please select an employee first')
      return
    }

    setIsLoading(true)
    setMessage('')
    
    try {
      // Find the latest open shift for this employee
      const { data: openShifts, error: findError } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .is('clock_out_at', null)
        .order('clock_in_at', { ascending: false })
        .limit(1)

      if (findError) throw findError

      if (!openShifts || openShifts.length === 0) {
        setMessage('No active shift found for this employee')
        return
      }

      // Clock out the employee
      const { data, error } = await supabase
        .from('shifts')
        .update({
          clock_out_at: new Date().toISOString()
        })
        .eq('id', openShifts[0].id)
        .select()

      if (error) throw error

      setMessage('Successfully clocked out!')
      onClockUpdate()
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000)
      
    } catch (error) {
      setMessage('Error clocking out: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex space-x-4">
        <button
          onClick={handleClockIn}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Clock In'}
        </button>
        
        <button
          onClick={handleClockOut}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Clock Out'}
        </button>
      </div>
      
      {message && (
        <div className={`absolute top-full left-0 right-0 mt-2 p-2 rounded text-sm ${
          message.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default ClockActions
