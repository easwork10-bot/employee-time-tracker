import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseKey)

// Enhanced mock client that properly handles method chaining
const mockSupabase = {
  from: (table) => {
    const queryBuilder = {
      _table: table,
      _select: '*',
      _filters: [],
      _orderBy: null,
      _limit: null,
      _single: false,
      
      select: (columns) => {
        queryBuilder._select = columns
        return queryBuilder
      },
      
      eq: (column, value) => {
        queryBuilder._filters.push({ type: 'eq', column, value })
        return queryBuilder
      },
      
      neq: (column, value) => {
        queryBuilder._filters.push({ type: 'neq', column, value })
        return queryBuilder
      },
      
      gte: (column, value) => {
        queryBuilder._filters.push({ type: 'gte', column, value })
        return queryBuilder
      },
      
      lte: (column, value) => {
        queryBuilder._filters.push({ type: 'lte', column, value })
        return queryBuilder
      },
      
      gt: (column, value) => {
        queryBuilder._filters.push({ type: 'gt', column, value })
        return queryBuilder
      },
      
      lt: (column, value) => {
        queryBuilder._filters.push({ type: 'lt', column, value })
        return queryBuilder
      },
      
      is: (column, value) => {
        queryBuilder._filters.push({ type: 'is', column, value })
        return queryBuilder
      },
      
      not: (column, value) => {
        queryBuilder._filters.push({ type: 'not', column, value })
        return queryBuilder
      },
      
      in: (column, values) => {
        queryBuilder._filters.push({ type: 'in', column, values })
        return queryBuilder
      },
      
      order: (column, options = {}) => {
        queryBuilder._orderBy = { column, ...options }
        return queryBuilder
      },
      
      limit: (count) => {
        queryBuilder._limit = count
        return queryBuilder
      },
      
      single: () => {
        queryBuilder._single = true
        return queryBuilder
      },
      
      then: (resolve) => {
        setTimeout(() => {
          const result = queryBuilder._single 
            ? mockSingleResponse(queryBuilder)
            : mockDataResponse(queryBuilder)
          resolve(result)
        }, 300)
        return { catch: () => {} }
      }
    }
    
    return queryBuilder
  },
  
  rpc: (fn, params) => ({
    then: (resolve) => {
      setTimeout(() => {
        resolve({ data: [], error: null })
      }, 300)
      return { catch: () => {} }
    }
  })
}

const mockDataResponse = (queryBuilder) => {
  const mockEmployees = [
    { id: 1, full_name: 'John Doe', employee_code: 'EMP001', is_active: true },
    { id: 2, full_name: 'Jane Smith', employee_code: 'EMP002', is_active: true },
    { id: 3, full_name: 'Mike Johnson', employee_code: 'EMP003', is_active: true },
  ]
  
  const mockShifts = [
    {
      id: 1,
      employee_id: 1,
      clock_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      clock_out_at: null,
      employees: mockEmployees[0]
    },
    {
      id: 2,
      employee_id: 2,
      clock_in_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      clock_out_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      employees: mockEmployees[1]
    },
    {
      id: 3,
      employee_id: 3,
      clock_in_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      clock_out_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      employees: mockEmployees[2]
    }
  ]
  
  let data = queryBuilder._table === 'employees' ? mockEmployees : mockShifts
  
  // Apply filters
  queryBuilder._filters.forEach(filter => {
    if (filter.type === 'eq' && filter.column === 'is_active' && filter.value === true) {
      data = data.filter(item => item.is_active)
    }
    if (filter.type === 'is' && filter.column === 'clock_out_at' && filter.value === null) {
      data = data.filter(item => !item.clock_out_at)
    }
    if (filter.type === 'not' && filter.column === 'clock_out_at' && filter.value === null) {
      data = data.filter(item => item.clock_out_at)
    }
  })
  
  // Apply limit
  if (queryBuilder._limit) {
    data = data.slice(0, queryBuilder._limit)
  }
  
  return { data, error: null }
}

const mockSingleResponse = (queryBuilder) => {
  const mockEmployee = {
    id: 1,
    full_name: 'John Doe',
    employee_code: 'EMP001',
    is_active: true
  }
  
  return { data: mockEmployee, error: null }
}

// Create real Supabase client if credentials are valid
let realSupabase = null
if (supabaseUrl && supabaseKey) {
  try {
    realSupabase = createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.warn('Failed to create Supabase client:', error)
  }
}

// Export real Supabase if available, otherwise use mock
export const supabase = realSupabase || mockSupabase
