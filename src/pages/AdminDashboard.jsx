import React, { useState } from 'react'
import StatsCards from '../components/admin/StatsCards'
import FiltersBar from '../components/admin/FiltersBar'
import RecordsTable from '../components/admin/RecordsTable'
import PrintButton from '../components/admin/PrintButton'

const AdminDashboard = () => {
  const [filters, setFilters] = useState({})

  console.log('AdminDashboard component rendering');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <PrintButton />
        </div>
        
        <StatsCards />
        
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <FiltersBar onFiltersChange={setFilters} />
          <RecordsTable filters={filters} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
