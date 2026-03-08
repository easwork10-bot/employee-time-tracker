import React from 'react'
import { timeTrackingService } from '../../services/timeTrackingService'

const StatusCard = ({ employee, currentShift, isClockedIn, isLoading }) => {
  const { formatTime, formatDate, calculateDuration, formatDuration } = timeTrackingService.timeUtils

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Status</h3>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
          isClockedIn 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {isClockedIn ? (
            <>
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              CLOCKED IN
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              CLOCKED OUT
            </>
          )}
        </div>
      </div>

      {/* Status Content */}
      <div className="space-y-3">
        {isClockedIn && currentShift && (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Clocked in at</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(currentShift.clock_in_at)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Current duration</span>
              <span className="text-sm font-medium text-green-600">
                {currentShift?.currentDuration || formatDuration(
                  calculateDuration(currentShift.clock_in_at).hours,
                  calculateDuration(currentShift.clock_in_at).minutes
                )}
              </span>
            </div>
          </>
        )}

        {!isClockedIn && currentShift && currentShift.clock_out_at && (
          <>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Last clock in</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(currentShift.clock_in_at)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Last clock out</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(currentShift.clock_out_at)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Last shift duration</span>
              <span className="text-sm font-medium text-gray-900">
                {currentShift?.duration || formatDuration(
                  calculateDuration(currentShift.clock_in_at, currentShift.clock_out_at).hours,
                  calculateDuration(currentShift.clock_in_at, currentShift.clock_out_at).minutes
                )}
              </span>
            </div>
          </>
        )}

        {!isClockedIn && !currentShift && (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm">
              No previous shifts found
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusCard
