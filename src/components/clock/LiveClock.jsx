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

  return (
    <div className="text-center">
      {/* Date - smaller, muted, above time */}
      <div className="text-blue-100 text-sm font-light mb-2">
        {timeTrackingService.timeUtils.formatDate(currentTime.toISOString())}
      </div>
      
      {/* Time - main focus, large but elegant */}
      <div className="text-4xl font-light text-white tracking-wide">
        {timeTrackingService.timeUtils.formatTime(currentTime.toISOString())}
      </div>
    </div>
  )
}

export default LiveClock
