import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const EmployeeSelector = ({ selectedEmployeeId, onEmployeeSelect }) => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value
    onEmployeeSelect(employeeId)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div>
      <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Employee
      </label>
      <select
        id="employee-select"
        value={selectedEmployeeId}
        onChange={handleEmployeeChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
