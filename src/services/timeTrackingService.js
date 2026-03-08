import { supabase } from '../lib/supabaseClient'
import { TABLES, ERROR_MESSAGES, SUCCESS_MESSAGES, APP_CONFIG } from '../lib/constants'

// Service layer for all time tracking operations
// Provides backend-first validation and consistent error handling

// Request deduplication map to prevent duplicate operations
const pendingRequests = new Map()

// Utility function to prevent duplicate requests
const deduplicateRequest = (key, requestFn) => {
  if (!APP_CONFIG.DEDUPLICATION.ENABLED) {
    return requestFn()
  }
  
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }
  
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key)
  })
  
  pendingRequests.set(key, promise)
  return promise
}

// Time formatting utilities with Swedish timezone handling
const DISPLAY_TIMEZONE = 'Europe/Stockholm'
const DISPLAY_LOCALE = 'sv-SE'

const timeUtils = {
  // Get user's timezone (but we use Stockholm for consistency)
  getTimezone: () => DISPLAY_TIMEZONE,

  // Format time to 24-hour Swedish format (HH:mm:ss)
  formatTime: (dateString) => {
    if (!dateString) return '--:--:--'
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: DISPLAY_TIMEZONE
    }).format(new Date(dateString))
  },

  // Format time without seconds for display
  formatTimeWithoutSeconds: (dateString) => {
    if (!dateString) return '--:--'
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: DISPLAY_TIMEZONE
    }).format(new Date(dateString))
  },

  // Format date to Swedish format
  formatDate: (dateString) => {
    if (!dateString) return '--'
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      timeZone: DISPLAY_TIMEZONE
    }).format(new Date(dateString))
  },

  // Format date and time in Swedish style (Mar 8, 14:25)
  formatDateTime: (dateString) => {
    if (!dateString) return '--'
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: DISPLAY_TIMEZONE
    }).format(new Date(dateString))
  },

  // Calculate duration in hours and minutes
  calculateDuration: (clockIn, clockOut) => {
    if (!clockIn) return { hours: 0, minutes: 0, totalMinutes: 0 }
    
    const inTime = new Date(clockIn)
    const outTime = clockOut ? new Date(clockOut) : new Date()
    
    // Ensure clock_out is after clock_in
    if (outTime <= inTime) {
      return { hours: 0, minutes: 0, totalMinutes: 0 }
    }
    
    const diffMs = outTime - inTime
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { hours, minutes, totalMinutes }
  },

  // Format duration as string
  formatDuration: (hours, minutes) => {
    return `${hours}h ${minutes}m`
  }
}

export const timeTrackingService = {
  // Get current employee status (clocked in/out)
  async getEmployeeStatus(employeeId) {
    if (!employeeId) {
      throw new Error('Employee ID is required')
    }

    try {
      const { data: openShifts, error } = await supabase
        .from(TABLES.SHIFTS)
        .select('*')
        .eq('employee_id', employeeId)
        .is('clock_out_at', null)
        .order('clock_in_at', { ascending: false })
        .limit(1)

      if (error) throw error

      const currentShift = openShifts?.[0] || null
      const isClockedIn = !!currentShift

      // Calculate current duration if clocked in
      let currentDuration = null
      if (isClockedIn && currentShift) {
        const duration = timeUtils.calculateDuration(currentShift.clock_in_at)
        currentDuration = timeUtils.formatDuration(duration.hours, duration.minutes)
      }

      return {
        isClockedIn,
        currentShift,
        currentDuration,
        error: null
      }
    } catch (error) {
      console.error('Error fetching employee status:', error)
      return {
        isClockedIn: false,
        currentShift: null,
        currentDuration: null,
        error: error.message
      }
    }
  },

  // Clock in employee with bulletproof validation
  async clockInEmployee(employeeId) {
    if (!employeeId) {
      throw new Error('Employee ID is required')
    }

    return deduplicateRequest(`clockin-${employeeId}`, async () => {
      try {
        // First check if employee is already clocked in (backend validation)
        const status = await this.getEmployeeStatus(employeeId)
        
        if (status.error) {
          throw new Error(status.error)
        }

        if (status.isClockedIn) {
          return {
            success: false,
            error: 'Employee is already clocked in',
            data: null,
            updatedStatus: status
          }
        }

        // Create new shift with current timestamp
        const clockInTime = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('shifts')
          .insert({
            employee_id: employeeId,
            clock_in_at: clockInTime
          })
          .select()
          .single()

        if (error) {
          // Handle potential constraint violations
          if (error.code === '23505') { // Unique constraint violation
            return {
              success: false,
              error: 'Employee is already clocked in',
              data: null,
              updatedStatus: status
            }
          }
          throw error
        }

        // Get updated status after successful clock in
        const updatedStatus = await this.getEmployeeStatus(employeeId)

        return {
          success: true,
          error: null,
          data: { ...data, clock_in_at: clockInTime },
          updatedStatus
        }
      } catch (error) {
        console.error('Error clocking in employee:', error)
        return {
          success: false,
          error: error.message,
          data: null,
          updatedStatus: null
        }
      }
    })
  },

  // Clock out employee with bulletproof validation
  async clockOutEmployee(employeeId) {
    if (!employeeId) {
      throw new Error('Employee ID is required')
    }

    return deduplicateRequest(`clockout-${employeeId}`, async () => {
      try {
        // First check if employee is clocked in
        const status = await this.getEmployeeStatus(employeeId)
        
        if (status.error) {
          throw new Error(status.error)
        }

        if (!status.isClockedIn || !status.currentShift) {
          return {
            success: false,
            error: 'No active shift found for this employee',
            data: null,
            updatedStatus: status
          }
        }

        const clockOutTime = new Date().toISOString()
        
        // Validate that clock_out is after clock_in
        if (new Date(clockOutTime) <= new Date(status.currentShift.clock_in_at)) {
          return {
            success: false,
            error: 'Clock out time must be after clock in time',
            data: null,
            updatedStatus: status
          }
        }

        // Update the shift with clock out time
        const { data, error } = await supabase
          .from('shifts')
          .update({
            clock_out_at: clockOutTime
          })
          .eq('id', status.currentShift.id)
          .is('clock_out_at', null) // Use is() instead of eq() for null values
          .select()
          .single()

        if (error) {
          if (error.code === 'PGRST116') { // No rows returned
            return {
              success: false,
              error: 'Shift was already clocked out',
              data: null,
              updatedStatus: status
            }
          }
          throw error
        }

        // Get updated status after successful clock out
        const updatedStatus = await this.getEmployeeStatus(employeeId)

        return {
          success: true,
          error: null,
          data: { ...data, clock_out_at: clockOutTime },
          updatedStatus
        }
      } catch (error) {
        console.error('Error clocking out employee:', error)
        return {
          success: false,
          error: error.message,
          data: null,
          updatedStatus: null
        }
      }
    })
  },

  // Get employee details
  async getEmployeeDetails(employeeId) {
    if (!employeeId) {
      throw new Error('Employee ID is required')
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single()

      if (error) throw error

      return {
        success: true,
        error: null,
        data
      }
    } catch (error) {
      console.error('Error fetching employee details:', error)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  },

  // Get all active employees
  async getActiveEmployees() {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMPLOYEES)
        .select('*')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error

      return {
        success: true,
        error: null,
        data: data || []
      }
    } catch (error) {
      console.error('Error fetching active employees:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // Get total working time with improved calculations
  async getTotalWorkingTime(filters = {}) {
    try {
      // Build query with same filters as RecordsTable
      let query = supabase
        .from('shifts')
        .select('clock_in_at, clock_out_at')
        .not('clock_out_at', 'is', null) // Only completed shifts

      // Apply filters
      if (filters.employee) {
        query = query.eq('employee_id', filters.employee)
      }

      if (filters.dateFrom) {
        const startDate = new Date(filters.dateFrom)
        startDate.setHours(0, 0, 0, 0)
        query = query.gte('clock_in_at', startDate.toISOString())
      }

      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setHours(23, 59, 59, 999)
        query = query.lte('clock_in_at', endDate.toISOString())
      }

      if (filters.status === 'active') {
        // For working time, we exclude active shifts
        return {
          success: true,
          error: null,
          data: '0h 0m'
        }
      } else if (filters.status === 'completed') {
        // Already filtered above
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate total working time with validation
      let totalMilliseconds = 0
      let validShifts = 0

      data.forEach(shift => {
        if (shift.clock_in_at && shift.clock_out_at) {
          const clockIn = new Date(shift.clock_in_at)
          const clockOut = new Date(shift.clock_out_at)
          
          // Only count valid shifts where clock_out > clock_in
          if (clockOut > clockIn) {
            totalMilliseconds += clockOut - clockIn
            validShifts++
          }
        }
      })

      // Format as "Xh Ym"
      const totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60))
      const totalMinutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60))

      return {
        success: true,
        error: null,
        data: timeUtils.formatDuration(totalHours, totalMinutes),
        metadata: {
          validShifts,
          totalShifts: data.length
        }
      }
    } catch (error) {
      console.error('Error calculating total working time:', error)
      return {
        success: false,
        error: error.message,
        data: '0h 0m'
      }
    }
  },

  // Get statistics for admin dashboard
  async getDashboardStats(filters = {}) {
    try {
      // Get total active employees
      const { data: activeEmployees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('is_active', true)

      if (empError) throw empError

      // Get currently clocked in employees
      const { data: activeShifts, error: shiftError } = await supabase
        .from('shifts')
        .select('employee_id')
        .is('clock_out_at', null)

      if (shiftError) throw shiftError

      // Get total shifts today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: todayShifts, error: todayError } = await supabase
        .from('shifts')
        .select('id')
        .gte('clock_in_at', today.toISOString())
        .lt('clock_in_at', tomorrow.toISOString())

      if (todayError) throw todayError

      // Get total working time
      const workingTimeResult = await this.getTotalWorkingTime(filters)

      return {
        success: true,
        error: null,
        data: {
          totalEmployees: activeEmployees?.length || 0,
          currentlyClockedIn: activeShifts?.length || 0,
          totalShiftsToday: todayShifts?.length || 0,
          totalWorkingTime: workingTimeResult.data
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        success: false,
        error: error.message,
        data: {
          totalEmployees: 0,
          currentlyClockedIn: 0,
          totalShiftsToday: 0,
          totalWorkingTime: '0h 0m'
        }
      }
    }
  },

  // Get shifts with improved filtering and joins
  async getShifts(filters = {}) {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          employees!shifts_employee_id_fkey (
            full_name,
            employee_code
          )
        `)
        .order('clock_in_at', { ascending: false })

      // Apply filters
      if (filters?.employee) {
        query = query.eq('employee_id', filters.employee)
      }

      if (filters?.dateFrom) {
        const startDate = new Date(filters.dateFrom)
        startDate.setHours(0, 0, 0, 0)
        query = query.gte('clock_in_at', startDate.toISOString())
      }

      if (filters?.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setHours(23, 59, 59, 999)
        query = query.lte('clock_in_at', endDate.toISOString())
      }

      if (filters?.status === 'active') {
        query = query.is('clock_out_at', null)
      } else if (filters?.status === 'completed') {
        query = query.not('clock_out_at', 'is', null)
      }

      const { data, error } = await query

      if (error) throw error

      // Process data with calculated durations - only for completed shifts
      const processedData = (data || []).map(shift => {
        if (shift.clock_out_at) {
          // Completed shift - calculate actual duration
          const duration = timeUtils.calculateDuration(shift.clock_in_at, shift.clock_out_at)
          return {
            ...shift,
            duration: timeUtils.formatDuration(duration.hours, duration.minutes),
            durationMinutes: duration.totalMinutes
          }
        } else {
          // Active shift - no duration yet
          return {
            ...shift,
            duration: null,
            durationMinutes: 0
          }
        }
      })

      return {
        success: true,
        error: null,
        data: processedData
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  },

  // Export time utilities for components
  timeUtils
}
