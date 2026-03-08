// Application constants

export const APP_CONFIG = {
  APP_NAME: 'Employee Time Tracker',
  VERSION: '1.0.0',
  
  // Real-time configuration
  REALTIME: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CONNECTION_TIMEOUT: 5000
  },
  
  // Polling fallback
  POLLING: {
    INTERVAL: 10000, // 10 seconds
    ENABLED: true
  },
  
  // Request deduplication
  DEDUPLICATION: {
    TIMEOUT: 3000, // 3 seconds
    ENABLED: true
  }
}

export const TABLES = {
  EMPLOYEES: 'employees',
  SHIFTS: 'shifts'
}

export const SHIFT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

export const FILTER_STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  CLOCK_IN_ERROR: 'Failed to clock in. Please try again.',
  CLOCK_OUT_ERROR: 'Failed to clock out. Please try again.',
  LOAD_DATA_ERROR: 'Failed to load data. Please refresh the page.',
  INVALID_EMPLOYEE: 'Please select a valid employee.',
  ALREADY_CLOCKED_IN: 'Employee is already clocked in.',
  NOT_CLOCKED_IN: 'Employee is not currently clocked in.'
}

export const SUCCESS_MESSAGES = {
  CLOCKED_IN: 'Successfully clocked in!',
  CLOCKED_OUT: 'Successfully clocked out!',
  SHIFT_UPDATED: 'Shift updated successfully!',
  SHIFT_DELETED: 'Shift deleted successfully!'
}
