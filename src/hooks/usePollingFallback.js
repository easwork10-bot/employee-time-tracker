import { useEffect, useRef } from 'react'

// Polling fallback hook for when real-time updates fail
export const usePollingFallback = (callback, interval = 5000, dependencies = []) => {
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    
    // Start polling
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      intervalRef.current = setInterval(() => {
        if (mountedRef.current && callback) {
          try {
            callback()
          } catch (error) {
            console.error('Polling callback error:', error)
          }
        }
      }, interval)
    }

    startPolling()

    // Cleanup on unmount
    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, callback, ...dependencies])

  // Manual cleanup function
  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return { cleanup }
}
