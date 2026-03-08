import React from 'react'

const ClockOutConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Confirm Clock Out</h3>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Are you sure you want to clock out? This will end your current shift.
          </p>
          
          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
            >
              Clock Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClockOutConfirmationModal
