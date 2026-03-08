import React, { useState, useEffect } from 'react'
import { timeTrackingService } from '../../services/timeTrackingService'

const EmployeeSelector = ({ selectedEmployeeId, onEmployeeSelect }) => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const result = await timeTrackingService.getActiveEmployees()
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      setEmployees(result.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Employee
        </label>
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700 text-sm">Error loading employees: {error}</div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Employee
      </label>
      <select
        value={selectedEmployeeId}
        onChange={(e) => onEmployeeSelect(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 shadow-sm"
      >
        <option value="">Choose an employee...</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.full_name} ({employee.employee_code})
          </option>
        ))}
      </select>
    </div>
  )
}

export default EmployeeSelector
