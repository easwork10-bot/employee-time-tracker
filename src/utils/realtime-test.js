import { supabase } from '../lib/supabaseClient'

// Simple test to verify Supabase Realtime connection
export const testRealtimeConnection = () => {
  console.log('🧪 Testing Supabase Realtime connection...')
  
  // Test basic connection
  const testChannel = supabase
    .channel('realtime-test')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'shifts' 
      },
      (payload) => {
        console.log('✅ Real-time test event received:', payload)
      }
    )
    .subscribe((status, err) => {
      console.log('📡 Test subscription status:', status)
      if (err) {
        console.error('❌ Test subscription error:', err)
      }
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time connection successful!')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time connection failed')
      }
    })

  // Test for 5 seconds then cleanup
  setTimeout(() => {
    supabase.removeChannel(testChannel)
    console.log('🧪 Real-time test completed')
  }, 5000)
}

// Enable realtime for shifts table (run this once)
export const enableShiftsRealtime = async () => {
  try {
    console.log('🔧 Enabling realtime for shifts table...')
    
    // SQL to enable realtime (run this in Supabase SQL editor)
    const enableRealtimeSQL = `
      -- Drop existing realtime publication if it exists
      DROP PUBLICATION IF EXISTS supabase_realtime;
      
      -- Create realtime publication
      CREATE PUBLICATION supabase_realtime;
      
      -- Grant access to the publication
      ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
      
      -- Enable realtime for the table
      ALTER TABLE shifts REPLICA ID FULL;
      ALTER TABLE shifts REPLICA ALWAYS;
    `
    
    console.log('📝 Run this SQL in Supabase SQL Editor:')
    console.log(enableRealtimeSQL)
    
    return { success: true, message: 'Realtime setup instructions provided' }
  } catch (error) {
    console.error('❌ Error enabling realtime:', error)
    return { success: false, error: error.message }
  }
}
