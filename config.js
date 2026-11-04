/**
 * SmartCare Permanent System & Database Configuration
 * ============================================================================
 * This file configures the permanent database connection for SmartCare.
 * Once configured here or via the settings panel, SmartCare connects
 * permanently every time you open the application — no re-configuration needed.
 * ============================================================================
 */

const SMARTCARE_CONFIG = {
  // Application & Portal Identity
  portal: {
    name: 'SmartCare Patient Portal',
    hospitalName: 'SmartCare Central Hospital & Medical Center',
    version: '2.5.0-Permanent'
  },

  // Permanent Database Configuration
  database: {
    /**
     * If you are using Supabase Cloud PostgreSQL, paste your permanent URL and Anon Key below.
     * SmartCare will automatically connect to this database every time the application is opened!
     * 
     * Leave blank if using the high-performance Permanent Relational Database Store
     * (which saves all data, appointments, and prescriptions permanently in your browser).
     */
    supabaseUrl: '',      // e.g., 'https://abcdefghijklm.supabase.co'
    supabaseAnonKey: '',  // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

    // Permanent auto-connect on application startup
    autoConnect: true,

    // Storage persistence mode: 'permanent' ensures all changes persist across reloads and browser restarts
    persistenceMode: 'permanent',

    // Local permanent store key identifier
    storageKey: 'smartcare_patient_portal_db_v2',
    configKey: 'smartcare_supabase_config_v2'
  }
};

// Expose configuration globally for the browser runtime
if (typeof window !== 'undefined') {
  window.SMARTCARE_CONFIG = SMARTCARE_CONFIG;
}

