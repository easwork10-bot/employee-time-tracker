import React, { useState, useEffect } from 'react'
import { timeTrackingService } from '../../services/timeTrackingService'

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time in clean 24-hour format with seconds (HH:mm:ss)
  const formatCleanTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    })
  }

  // Format date in human-readable format
  const formatHumanDate = (dateString) => {
    const date = new Date(dateString)
    const options = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="text-center">
      {/* Date - smaller, muted, above time */}
      <div className="text-blue-100 text-sm font-light mb-2">
        {formatHumanDate(currentTime.toISOString())}
      </div>
      
      {/* Time - main focus, large but elegant */}
      <div className="text-4xl font-light text-white tracking-wide">
        {formatCleanTime(currentTime.toISOString())}
      </div>
    </div>
  )
}

export default LiveClock
