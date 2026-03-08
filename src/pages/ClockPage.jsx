import React, { useState, useEffect } from 'react'
import LiveClock from '../components/clock/LiveClock'
import EmployeeSelector from '../components/clock/EmployeeSelector'
import StatusCard from '../components/clock/StatusCard'
import ClockActionButton from '../components/clock/ClockActionButton'
import { timeTrackingService } from '../services/timeTrackingService'
import { useEmployeeStatusUpdates } from '../hooks/useRealtimeUpdates'

const ClockPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [currentShift, setCurrentShift] = useState(null)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch employee details and current status
  const fetchEmployeeData = async (employeeId) => {
    if (!employeeId) {
      setSelectedEmployee(null)
      setCurrentShift(null)
      setIsClockedIn(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get employee details
      const employeeResult = await timeTrackingService.getEmployeeDetails(employeeId)
      if (!employeeResult.success) {
        throw new Error(employeeResult.error)
      }
      setSelectedEmployee(employeeResult.data)

      // Get current status
      const statusResult = await timeTrackingService.getEmployeeStatus(employeeId)
      if (statusResult.error) {
        throw new Error(statusResult.error)
      }
      
      setCurrentShift(statusResult.currentShift)
      setIsClockedIn(statusResult.isClockedIn)
    } catch (error) {
      console.error('Error fetching employee data:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId)
    fetchEmployeeData(employeeId)
  }

  // Handle clock in
  const handleClockIn = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await timeTrackingService.clockInEmployee(selectedEmployeeId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update status with server response (no need to refetch)
      setCurrentShift(result.updatedStatus.currentShift)
      setIsClockedIn(result.updatedStatus.isClockedIn)
    } catch (error) {
      console.error('Error clocking in:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle clock out
  const handleClockOut = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await timeTrackingService.clockOutEmployee(selectedEmployeeId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update status with server response (no need to refetch)
      setCurrentShift(result.updatedStatus.currentShift)
      setIsClockedIn(result.updatedStatus.isClockedIn)
    } catch (error) {
      console.error('Error clocking out:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time updates for current employee
  useEmployeeStatusUpdates(selectedEmployeeId, (update) => {
    if (update.type === 'CLOCKED_IN') {
      setCurrentShift(update.shift)
      setIsClockedIn(true)
      setError(null)
    } else if (update.type === 'CLOCKED_OUT') {
      setCurrentShift(null)
      setIsClockedIn(false)
      setError(null)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Employee Time Tracker</h1>
            <div className="text-blue-100 text-sm">
              <LiveClock />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-6">
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            {/* Employee Selection */}
            <EmployeeSelector
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeSelect={handleEmployeeSelect}
            />

            {/* Status Card - Only show when employee is selected */}
            {selectedEmployee && (
              <StatusCard
                employee={selectedEmployee}
                currentShift={currentShift}
                isClockedIn={isClockedIn}
                isLoading={isLoading}
              />
            )}

            {/* Action Button - Only show when employee is selected */}
            {selectedEmployee && (
              <ClockActionButton
                isClockedIn={isClockedIn}
                isLoading={isLoading}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
              />
            )}

            {/* Instructions - Show when no employee is selected */}
            {!selectedEmployee && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">
                  Please select your name to begin
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-xs">
          Employee Time Tracking System
        </div>
      </div>
    </div>
  )
}

export default ClockPage
