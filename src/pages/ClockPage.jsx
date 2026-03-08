import React, { useState } from 'react'
import LiveClock from '../components/clock/LiveClock'
import EmployeeSelector from '../components/clock/EmployeeSelector'
import StatusCard from '../components/clock/StatusCard'
import ClockActions from '../components/clock/ClockActions'

const ClockPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleClockUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Employee Time Tracker
        </h1>
        
        <LiveClock />
        
        <div className="space-y-6">
          <EmployeeSelector 
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeSelect={setSelectedEmployeeId}
          />
          <ClockActions 
            selectedEmployeeId={selectedEmployeeId}
            onClockUpdate={handleClockUpdate}
          />
          <StatusCard 
            selectedEmployeeId={selectedEmployeeId}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  )
}

export default ClockPage
