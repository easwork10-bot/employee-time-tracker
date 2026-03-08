import React, { useState } from 'react'
import ClockOutConfirmationModal from './ClockOutConfirmationModal'

const ClockActionButton = ({ isClockedIn, isLoading, onClockIn, onClockOut }) => {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleClockIn = () => {
    if (onClockIn) {
      onClockIn()
    }
  }

  const handleClockOut = () => {
    setShowConfirmation(true)
  }

  const confirmClockOut = () => {
    setShowConfirmation(false)
    if (onClockOut) {
      onClockOut()
    }
  }

  const cancelClockOut = () => {
    setShowConfirmation(false)
  }

  if (isClockedIn) {
    return (
      <>
        <button
          onClick={handleClockOut}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Clock Out</span>
            </>
          )}
        </button>

        {showConfirmation && (
          <ClockOutConfirmationModal
            onConfirm={confirmClockOut}
            onCancel={cancelClockOut}
          />
        )}
      </>
    )
  }

  return (
    <button
      onClick={handleClockIn}
      disabled={isLoading}
      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Clock In</span>
        </>
      )}
    </button>
  )
}

export default ClockActionButton
