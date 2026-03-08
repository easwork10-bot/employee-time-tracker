import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// Hook for real-time updates using Supabase Realtime
export const useRealtimeUpdates = (tableName, eventHandlers = {}) => {
  const subscriptionRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    console.log(`🔧 Setting up real-time subscription for ${tableName}...`)
    
    // Subscribe to database changes directly
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName 
        },
        (payload) => {
          console.log(`🔄 Real-time update received for ${tableName}:`, payload)
          
          if (!mountedRef.current) return
          
          const { eventType, new: newRecord, old: oldRecord } = payload
          
          // Call appropriate event handler
          if (eventHandlers[eventType]) {
            try {
              eventHandlers[eventType](payload)
            } catch (error) {
              console.error(`Error in ${eventType} handler for ${tableName}:`, error)
            }
          }
          
          // Call generic change handler
          if (eventHandlers.onChange) {
            try {
              eventHandlers.onChange(payload)
            } catch (error) {
              console.error(`Error in onChange handler for ${tableName}:`, error)
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`📡 Subscription status for ${tableName}:`, status)
        if (err) {
          console.error(`❌ Subscription error for ${tableName}:`, err)
        }
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to ${tableName} changes`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Subscription error for ${tableName}`)
        } else if (status === 'TIMED_OUT') {
          console.error(`⏰ Subscription timeout for ${tableName}`)
        } else if (status === 'CLOSED') {
          console.log(`🔌 Subscription closed for ${tableName}`)
        }
      })

    subscriptionRef.current = subscription

    // Cleanup on unmount
    return () => {
      console.log(`🧹 Cleaning up subscription for ${tableName}`)
      mountedRef.current = false
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [tableName, eventHandlers])

  // Manual cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
      subscriptionRef.current = null
    }
  }, [])

  return { cleanup }
}

// Hook for real-time employee status updates
export const useEmployeeStatusUpdates = (employeeId, onStatusChange) => {
  const eventHandlers = {
    INSERT: (payload) => {
      // Employee clocked in
      if (payload.new?.employee_id === employeeId) {
        console.log('👤 Employee clocked in:', payload.new)
        onStatusChange({
          type: 'CLOCKED_IN',
          shift: payload.new
        })
      }
    },
    UPDATE: (payload) => {
      // Employee clocked out
      if (payload.new?.employee_id === employeeId && payload.new?.clock_out_at && !payload.old?.clock_out_at) {
        console.log('👤 Employee clocked out:', payload.new)
        onStatusChange({
          type: 'CLOCKED_OUT',
          shift: payload.new
        })
      }
    }
  }

  return useRealtimeUpdates('shifts', eventHandlers)
}

// Hook for real-time admin dashboard updates
export const useAdminDashboardUpdates = (onUpdate) => {
  const eventHandlers = {
    INSERT: (payload) => {
      // New shift created (employee clocked in)
      console.log('📊 Admin: Employee clocked in', payload.new)
      console.log('📊 INSERT payload structure:', {
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
        table: payload.table
      })
      onUpdate({
        type: 'EMPLOYEE_CLOCKED_IN',
        shift: payload.new
      })
    },
    UPDATE: (payload) => {
      // Shift updated (employee clocked out or shift modified)
      console.log('📊 Admin: Shift UPDATE event', payload)
      console.log('📊 UPDATE payload structure:', {
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
        table: payload.table,
        hasClockOut: !!payload.new?.clock_out_at,
        hadClockOut: !!payload.old?.clock_out_at
      })
      
      if (payload.new?.clock_out_at && !payload.old?.clock_out_at) {
        // Employee clocked out
        console.log('📊 Admin: Employee clocked out', payload.new)
        onUpdate({
          type: 'EMPLOYEE_CLOCKED_OUT',
          shift: payload.new
        })
      } else {
        // Shift modified (other updates)
        console.log('📊 Admin: Shift modified', payload.new)
        onUpdate({
          type: 'SHIFT_UPDATED',
          shift: payload.new
        })
      }
    },
    DELETE: (payload) => {
      // Shift deleted
      console.log('📊 Admin: Shift deleted', payload.old)
      onUpdate({
        type: 'SHIFT_DELETED',
        shift: payload.old
      })
    }
  }

  return useRealtimeUpdates('shifts', eventHandlers)
}

// Hook for real-time employee list updates
export const useEmployeeListUpdates = (onUpdate) => {
  const eventHandlers = {
    INSERT: (payload) => {
      console.log('👥 Employee added:', payload.new)
      onUpdate({
        type: 'EMPLOYEE_ADDED',
        employee: payload.new
      })
    },
    UPDATE: (payload) => {
      console.log('👥 Employee updated:', payload.new)
      onUpdate({
        type: 'EMPLOYEE_UPDATED',
        employee: payload.new,
        oldEmployee: payload.old
      })
    },
    DELETE: (payload) => {
      console.log('👥 Employee deleted:', payload.old)
      onUpdate({
        type: 'EMPLOYEE_DELETED',
        employee: payload.old
      })
    }
  }

  return useRealtimeUpdates('employees', eventHandlers)
}
