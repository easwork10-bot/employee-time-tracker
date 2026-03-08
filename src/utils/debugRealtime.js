import { supabase } from '../lib/supabaseClient'

// Debug function to test real-time connection
export const debugRealtimeConnection = () => {
  console.log('🧪 Testing real-time connection to shifts table...')
  
  // Test subscription
  const testChannel = supabase
    .channel('debug_shifts')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'shifts' 
      },
      (payload) => {
        console.log('🧪 Debug: Real-time event received:', payload)
        console.log('🧪 Event details:', {
          eventType: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString()
        })
      }
    )
    .subscribe((status, err) => {
      console.log('🧪 Debug subscription status:', status)
      if (err) {
        console.error('🧪 Debug subscription error:', err)
      }
      if (status === 'SUBSCRIBED') {
        console.log('🧪 Debug: Successfully subscribed to shifts table!')
        console.log('🧪 Try clocking in/out to test real-time updates')
      }
    })

  // Auto-cleanup after 30 seconds
  setTimeout(() => {
    supabase.removeChannel(testChannel)
    console.log('🧪 Debug: Test completed')
  }, 30000)
}

// Call this function in browser console to test: debugRealtimeConnection()
