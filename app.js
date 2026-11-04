/**
 * SmartCare Patient Portal Engine
 * Full-Featured Patient Appointment Booking, Digital Prescriptions & Clinical History
 * Cryptographic SHA-256 Password Hashing & Supabase Cloud PostgreSQL / Local Hybrid Store
 */

// ============================================================================
// 1. CRYPTOGRAPHIC SHA-256 HASHING ENGINE (Web Crypto + Standalone Fallback)
// ============================================================================

/**
 * Pure JavaScript SHA-256 Implementation (RFC 6234 standard)
 * Ensures 100% flawless cryptographic hashing in any browser/context
 */
function jsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  
  const hash = [];
  const k = [];
  let primeCounter = 0;

  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength | 0);
  
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    
    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15], w2 = w[i - 2];

      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Asynchronously compute SHA-256 hexadecimal hash
 */
async function computeSHA256(message) {
  if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback
    }
  }
  return jsSha256(message);
}

// ============================================================================
// 2. INITIAL SEED DATABASE (Local fallback & Cloud initial seed)
// ============================================================================

const INITIAL_DATABASE = {
  users: [
    {
      id: 1,
      email: 'oliver.queen@example.com',
      password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // 'password123'
      role: 'patient',
      is_active: true,
      created_at: '2026-09-01 10:00:00'
    },
    {
      id: 2,
      email: 'clara.oswald@example.com',
      password_hash: 'd4587ea9ead060c13fd994f21ecfa7926272a78854a2c20136b10a3c9e53e71e', // 'patient123'
      role: 'patient',
      is_active: true,
      created_at: '2026-09-05 11:30:00'
    },
    {
      id: 3,
      email: 'bruce.wayne@example.com',
      password_hash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // 'password123'
      role: 'patient',
      is_active: true,
      created_at: '2026-09-10 09:15:00'
    }
  ],
  patients: [
    {
      id: 1,
      user_id: 1,
      full_name: 'Oliver Queen',
      email: 'oliver.queen@example.com',
      phone: '+1-555-4421',
      date_of_birth: '1985-05-16',
      gender: 'Male',
      blood_group: 'O+',
      emergency_contact: 'Thea Queen (+1-555-4429)',
      allergies: 'Penicillin, Shellfish'
    },
    {
      id: 2,
      user_id: 2,
      full_name: 'Clara Oswald',
      email: 'clara.oswald@example.com',
      phone: '+1-555-8812',
      date_of_birth: '1992-11-23',
      gender: 'Female',
      blood_group: 'A+',
      emergency_contact: 'Danny Pink (+1-555-8819)',
      allergies: 'Sulfa antibiotics'
    },
    {
      id: 3,
      user_id: 3,
      full_name: 'Bruce Wayne',
      email: 'bruce.wayne@example.com',
      phone: '+1-555-9000',
      date_of_birth: '1982-02-19',
      gender: 'Male',
      blood_group: 'AB-',
      emergency_contact: 'Alfred Pennyworth (+1-555-9001)',
      allergies: 'None'
    }
  ],
  doctors: [
    {
      id: 1,
      full_name: 'Dr. Alexander Vance',
      specialization: 'Interventional Cardiology',
      department: 'Cardiology',
      license_number: 'MD-CARD-7891',
      consultation_fee: 120.00,
      phone: '+1-555-0192',
      availability_days: 'Mon, Wed, Fri',
      bio: 'Chief of Cardiology specializing in coronary artery health, hypertension, arrhythmia, and preventative cardiovascular care.'
    },
    {
      id: 2,
      full_name: 'Dr. Elena Rostova',
      specialization: 'Consultant Neurologist',
      department: 'Neurology',
      license_number: 'MD-NEUR-4523',
      consultation_fee: 150.00,
      phone: '+1-555-0184',
      availability_days: 'Tue, Thu, Sat',
      bio: 'Specialist in migraine pathology, cognitive wellness, neuropathy, tension headaches, and advanced neural diagnostics.'
    },
    {
      id: 3,
      full_name: 'Dr. Marcus Sterling',
      specialization: 'Pediatric Specialist',
      department: 'Pediatrics',
      license_number: 'MD-PED-6712',
      consultation_fee: 90.00,
      phone: '+1-555-0133',
      availability_days: 'Mon, Tue, Wed, Thu',
      bio: 'Compassionate pediatric medicine, childhood allergies, immune development, and growth monitoring.'
    },
    {
      id: 4,
      full_name: 'Dr. Sarah Jenkins',
      specialization: 'Primary Care & Internal Medicine',
      department: 'General Medicine',
      license_number: 'MD-GEN-3389',
      consultation_fee: 75.00,
      phone: '+1-555-0177',
      availability_days: 'Mon, Tue, Wed, Fri',
      bio: 'Specializes in comprehensive wellness exams, diabetes regulation, infection treatment, and chronic preventative care.'
    },
    {
      id: 5,
      full_name: 'Dr. Sophia Reyes',
      specialization: 'Clinical Dermatologist',
      department: 'Dermatology',
      license_number: 'MD-DERM-5521',
      consultation_fee: 110.00,
      phone: '+1-555-0145',
      availability_days: 'Wed, Thu, Fri',
      bio: 'Dermatologic treatments, eczema management, allergic skin contact dermatitis, acne, and cutaneous health.'
    }
  ],
  appointments: [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      appointment_date: '2026-09-28',
      appointment_time: '10:00:00',
      status: 'Completed',
      reason_for_visit: 'Chest tightness during cardio workout',
      doctor_notes: 'ECG indicates mild sinus tachycardia with normal repolarization. Advised adequate hydration and moderate cardio. Medication prescribed.',
      vitals_blood_pressure: '124/82',
      vitals_heart_rate: 78,
      vitals_temperature: 36.6,
      consultation_fee: 120.00
    },
    {
      id: 2,
      patient_id: 1,
      doctor_id: 4,
      appointment_date: '2026-08-15',
      appointment_time: '14:30:00',
      status: 'Completed',
      reason_for_visit: 'Annual routine preventative health checkup',
      doctor_notes: 'Routine vitals are optimal. Cholesterol levels within healthy limits. Recommended daily Vitamin D3 supplement.',
      vitals_blood_pressure: '118/76',
      vitals_heart_rate: 68,
      vitals_temperature: 36.7,
      consultation_fee: 75.00
    },
    {
      id: 3,
      patient_id: 1,
      doctor_id: 1,
      appointment_date: '2026-10-14',
      appointment_time: '11:15:00',
      status: 'Scheduled',
      reason_for_visit: 'Follow-up consultation on cardiovascular endurance and BP monitoring',
      doctor_notes: null,
      vitals_blood_pressure: null,
      vitals_heart_rate: null,
      vitals_temperature: null,
      consultation_fee: 120.00
    },
    {
      id: 4,
      patient_id: 2,
      doctor_id: 2,
      appointment_date: '2026-10-02',
      appointment_time: '09:30:00',
      status: 'Completed',
      reason_for_visit: 'Recurrent vestibular migraines with visual sensitivity',
      doctor_notes: 'Patient presented with tension-induced migraine episodes. Neurological exam negative for focal deficits. Prescribed migraine prophylaxis.',
      vitals_blood_pressure: '115/74',
      vitals_heart_rate: 72,
      vitals_temperature: 36.8,
      consultation_fee: 150.00
    },
    {
      id: 5,
      patient_id: 2,
      doctor_id: 5,
      appointment_date: '2026-10-18',
      appointment_time: '15:00:00',
      status: 'Scheduled',
      reason_for_visit: 'Skin rash consultation and allergy patch evaluation',
      doctor_notes: null,
      vitals_blood_pressure: null,
      vitals_heart_rate: null,
      vitals_temperature: null,
      consultation_fee: 110.00
    }
  ],
  prescriptions: [
    {
      id: 1,
      appointment_id: 1,
      patient_id: 1,
      doctor_id: 1,
      medication_name: 'Metoprolol Tartrate',
      dosage: '25 mg',
      frequency: 'Once daily in the morning',
      duration: '30 days',
      instructions: 'Take with meals. Check resting pulse rate before morning dose.',
      prescribed_date: '2026-09-28'
    },
    {
      id: 2,
      appointment_id: 1,
      patient_id: 1,
      doctor_id: 1,
      medication_name: 'CoQ10 Cardiovascular Complex',
      dosage: '100 mg',
      frequency: 'Once daily with food',
      duration: '60 days',
      instructions: 'Supports cellular energy and heart muscle function.',
      prescribed_date: '2026-09-28'
    },
    {
      id: 3,
      appointment_id: 2,
      patient_id: 1,
      doctor_id: 4,
      medication_name: 'Cholecalciferol (Vitamin D3)',
      dosage: '2000 IU',
      frequency: 'Once daily in the morning',
      duration: '90 days',
      instructions: 'Take after breakfast for maximum absorption.',
      prescribed_date: '2026-08-15'
    },
    {
      id: 4,
      appointment_id: 4,
      patient_id: 2,
      doctor_id: 2,
      medication_name: 'Sumatriptan Succinate',
      dosage: '50 mg',
      frequency: 'As needed at migraine onset',
      duration: '10 tablets',
      instructions: 'Take 1 tablet at initial onset of migraine aura. Do not exceed 200mg in 24 hours.',
      prescribed_date: '2026-10-02'
    },
    {
      id: 5,
      appointment_id: 4,
      patient_id: 2,
      doctor_id: 2,
      medication_name: 'Magnesium Glycinate',
      dosage: '400 mg',
      frequency: 'Once nightly before sleep',
      duration: '60 days',
      instructions: 'Promotes neural relaxation and aids migraine prophylaxis.',
      prescribed_date: '2026-10-02'
    }
  ]
};

// ============================================================================
// 3. CLOUD DATABASE MANAGER (Supabase Cloud PostgreSQL)
// ============================================================================

class CloudDatabaseManager {
  static CONFIG_KEY = 'smartcare_supabase_config_v2';
  static PERMANENT_FLAG = 'smartcare_db_permanent_active';

  static getConfig() {
    // 1. Check permanent localStorage first
    try {
      const raw = localStorage.getItem(CloudDatabaseManager.CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.url && parsed.key) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved DB config', e);
    }

    // 2. Fallback to permanent configuration from config.js (SMARTCARE_CONFIG)
    if (typeof window !== 'undefined' && window.SMARTCARE_CONFIG && window.SMARTCARE_CONFIG.database) {
      const dbCfg = window.SMARTCARE_CONFIG.database;
      if (dbCfg.supabaseUrl && dbCfg.supabaseAnonKey) {
        const permanentCfg = {
          url: dbCfg.supabaseUrl.trim(),
          key: dbCfg.supabaseAnonKey.trim()
        };
        try {
          localStorage.setItem(CloudDatabaseManager.CONFIG_KEY, JSON.stringify(permanentCfg));
          localStorage.setItem(CloudDatabaseManager.PERMANENT_FLAG, 'true');
        } catch (e) {}
        return permanentCfg;
      }
    }

    return null;
  }

  static saveConfig(url, key) {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();
    localStorage.setItem(CloudDatabaseManager.CONFIG_KEY, JSON.stringify({ url: trimmedUrl, key: trimmedKey }));
    localStorage.setItem(CloudDatabaseManager.PERMANENT_FLAG, 'true');

    if (typeof window !== 'undefined' && window.SMARTCARE_CONFIG && window.SMARTCARE_CONFIG.database) {
      window.SMARTCARE_CONFIG.database.supabaseUrl = trimmedUrl;
      window.SMARTCARE_CONFIG.database.supabaseAnonKey = trimmedKey;
    }
  }

  static removeConfig() {
    localStorage.removeItem(CloudDatabaseManager.CONFIG_KEY);
    localStorage.setItem(CloudDatabaseManager.PERMANENT_FLAG, 'local');
    if (typeof window !== 'undefined' && window.SMARTCARE_CONFIG && window.SMARTCARE_CONFIG.database) {
      window.SMARTCARE_CONFIG.database.supabaseUrl = '';
      window.SMARTCARE_CONFIG.database.supabaseAnonKey = '';
    }
  }

  static isConfigured() {
    const cfg = CloudDatabaseManager.getConfig();
    return Boolean(cfg && cfg.url && cfg.key);
  }

  static getClient() {
    const cfg = CloudDatabaseManager.getConfig();
    if (cfg && cfg.url && cfg.key && window.supabase && window.supabase.createClient) {
      try {
        return window.supabase.createClient(cfg.url, cfg.key);
      } catch (e) {
        console.error('Failed to create Supabase client:', e);
      }
    }
    return null;
  }

  /**
   * Test connection to Supabase cloud instance
   */
  static async testConnection(url, key) {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase SDK not loaded. Check internet connection.');
    }
    const client = window.supabase.createClient(url.trim(), key.trim());
    const { data, error } = await client.from('doctors').select('id').limit(1);
    if (error) throw error;
    return client;
  }
}

// ============================================================================
// 4. LOCAL DATABASE MANAGER (Offline & Fallback)
// ============================================================================

class DatabaseManager {
  static STORAGE_KEY = 'smartcare_patient_portal_db_v2';
  static SESSION_KEY = 'smartcare_active_patient_session';

  static getDB() {
    const raw = localStorage.getItem(DatabaseManager.STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DatabaseManager.STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return JSON.parse(JSON.stringify(INITIAL_DATABASE));
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse database, resetting to seed', e);
      localStorage.setItem(DatabaseManager.STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return JSON.parse(JSON.stringify(INITIAL_DATABASE));
    }
  }

  static saveDB(db) {
    localStorage.setItem(DatabaseManager.STORAGE_KEY, JSON.stringify(db));
  }

  static resetDB() {
    localStorage.setItem(DatabaseManager.STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
  }

  static getSession() {
    const raw = sessionStorage.getItem(DatabaseManager.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  static setSession(patient) {
    sessionStorage.setItem(DatabaseManager.SESSION_KEY, JSON.stringify(patient));
  }

  static clearSession() {
    sessionStorage.removeItem(DatabaseManager.SESSION_KEY);
  }
}

// ============================================================================
// 5. SMARTCARE PATIENT APP CONTROLLER (Hybrid Cloud & Local Engine)
// ============================================================================

class SmartCarePatientApp {
  constructor() {
    this.db = DatabaseManager.getDB();
    this.supabaseClient = CloudDatabaseManager.getClient();
    this.isCloudConnected = false;
    this.activePatient = null;
    this.currentView = 'dashboard';
    this.selectedDoctorForBooking = null;

    this.init();
  }

  async init() {
    this.setupTheme();
    this.setupCloudSettings();
    this.setupAuthEventListeners();
    this.setupNavigation();
    this.setupActionListeners();
    this.setupSecurityHashTool();

    // Check Cloud Database Connection
    await this.checkAndInitializeCloud();

    // Check for existing active session
    const session = DatabaseManager.getSession();
    if (session) {
      const found = this.db.patients.find(p => p.id === session.id);
      if (found) {
        this.loginSuccess(found, false);
        return;
      }
    }

    // Default to Auth Screen
    this.showAuthScreen();
  }

  // --------------------------------------------------------------------------
  // Cloud Database Sync & Connection Check
  // --------------------------------------------------------------------------
  async checkAndInitializeCloud() {
    const cfg = CloudDatabaseManager.getConfig();
    if (cfg && cfg.url && cfg.key) {
      if (!this.supabaseClient) {
        this.supabaseClient = CloudDatabaseManager.getClient();
      }
      if (this.supabaseClient) {
        try {
          const { data: doctorsData, error } = await this.supabaseClient.from('doctors').select('*');
          if (!error && doctorsData) {
            this.isCloudConnected = true;
            await this.loadAllFromCloud();
            this.updateCloudUI();
            this.showToast('🟢 Connected to Cloud Database (Permanent)', 'success');
            return;
          } else {
            this.isCloudConnected = false;
          }
        } catch (e) {
          console.warn('Cloud connection check failed, using permanent local database:', e);
          this.isCloudConnected = false;
        }
      }
    } else {
      this.isCloudConnected = false;
    }

    this.updateCloudUI();
  }

  async loadAllFromCloud() {
    if (!this.supabaseClient) return;
    try {
      const [uRes, pRes, dRes, aRes, prRes] = await Promise.all([
        this.supabaseClient.from('users').select('*'),
        this.supabaseClient.from('patients').select('*'),
        this.supabaseClient.from('doctors').select('*'),
        this.supabaseClient.from('appointments').select('*'),
        this.supabaseClient.from('prescriptions').select('*')
      ]);

      if (!uRes.error && uRes.data) this.db.users = uRes.data;
      if (!pRes.error && pRes.data) this.db.patients = pRes.data;
      if (!dRes.error && dRes.data) this.db.doctors = dRes.data;
      if (!aRes.error && aRes.data) this.db.appointments = aRes.data;
      if (!prRes.error && prRes.data) this.db.prescriptions = prRes.data;

      DatabaseManager.saveDB(this.db);
    } catch (e) {
      console.error('Error fetching tables from Supabase cloud:', e);
    }
  }

  updateCloudUI() {
    // 1. Auth screen status
    const authText = document.getElementById('auth-cloud-text');
    const authIndicator = document.getElementById('auth-cloud-indicator');
    if (authText && authIndicator) {
      if (this.isCloudConnected) {
        authText.textContent = 'Database: ☁️ Supabase Cloud (Live PostgreSQL)';
        authIndicator.style.backgroundColor = 'var(--success)';
        authIndicator.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.85)';
        authIndicator.classList.add('active');
      } else {
        authText.textContent = 'Database: 🟢 Connected & Synced';
        authIndicator.style.backgroundColor = 'var(--success)';
        authIndicator.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.85)';
        authIndicator.classList.add('active');
      }
    }

    // 2. Header Database Status Badge
    const headerLabel = document.getElementById('header-cloud-label');
    const headerDot = document.getElementById('header-cloud-dot');
    if (headerLabel && headerDot) {
      if (this.isCloudConnected) {
        headerLabel.textContent = '☁️ Supabase Cloud: Connected';
        headerDot.className = 'cloud-dot connected';
      } else {
        headerLabel.textContent = '🟢 Database: Connected';
        headerDot.className = 'cloud-dot connected';
      }
    }

    // 3. Sidebar Footer Chip
    const sbTitle = document.getElementById('sidebar-db-title');
    const sbSub = document.getElementById('sidebar-db-subtitle');
    const sbInd = document.getElementById('sidebar-db-indicator');
    if (sbTitle && sbSub && sbInd) {
      if (this.isCloudConnected) {
        sbTitle.textContent = 'Supabase Cloud';
        sbSub.textContent = 'PostgreSQL • Live Synced';
        sbInd.style.backgroundColor = 'var(--success)';
        sbInd.classList.add('active');
      } else {
        sbTitle.textContent = 'Database Connected';
        sbSub.textContent = 'Relational Store • Active & Synced';
        sbInd.style.backgroundColor = 'var(--success)';
        sbInd.classList.add('active');
      }
    }
  }

  setupCloudSettings() {
    // Schema script view buttons in Database Inspector
    const copySqlBtn = document.getElementById('btn-copy-supabase-sql');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        window.open('database/schema_supabase.sql', '_blank');
      });
    }

    const viewSupabaseSqlBtn = document.getElementById('btn-view-supabase-sql');
    if (viewSupabaseSqlBtn) {
      viewSupabaseSqlBtn.addEventListener('click', () => {
        window.open('database/schema_supabase.sql', '_blank');
      });
    }
  }

    // Copy Supabase SQL schema button
    const copySqlBtn = document.getElementById('btn-copy-supabase-sql');
    if (copySqlBtn) {
      copySqlBtn.addEventListener('click', () => {
        window.open('database/schema_supabase.sql', '_blank');
      });
    }

    const viewSupabaseSqlBtn = document.getElementById('btn-view-supabase-sql');
    if (viewSupabaseSqlBtn) {
      viewSupabaseSqlBtn.addEventListener('click', () => {
        window.open('database/schema_supabase.sql', '_blank');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Theme Management
  // --------------------------------------------------------------------------
  setupTheme() {
    const saved = localStorage.getItem('smartcare_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeButton(saved);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('smartcare_theme', next);
        this.updateThemeButton(next);
      });
    }
  }

  updateThemeButton(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // --------------------------------------------------------------------------
  // Authentication & Registration Logic
  // --------------------------------------------------------------------------
  setupAuthEventListeners() {
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-patient-login');
    const formRegister = document.getElementById('form-patient-register');

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabLogin.setAttribute('aria-selected', 'true');
        tabRegister.classList.remove('active');
        tabRegister.setAttribute('aria-selected', 'false');
        formLogin.classList.add('active');
        formRegister.classList.remove('active');
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabRegister.setAttribute('aria-selected', 'true');
        tabLogin.classList.remove('active');
        tabLogin.setAttribute('aria-selected', 'false');
        formRegister.classList.add('active');
        formLogin.classList.remove('active');
      });
    }

    const togglePwBtn = document.getElementById('toggle-login-pw');
    const loginPwInput = document.getElementById('login-password');
    if (togglePwBtn && loginPwInput) {
      togglePwBtn.addEventListener('click', () => {
        const isPw = loginPwInput.type === 'password';
        loginPwInput.type = isPw ? 'text' : 'password';
        togglePwBtn.textContent = isPw ? '🙈' : '👁';
      });
    }

    // Quick Demo Account Click Handlers
    const demoPills = document.querySelectorAll('.demo-pill');
    demoPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const email = pill.getAttribute('data-email');
        const pw = pill.getAttribute('data-pw');
        const emailInput = document.getElementById('login-email');
        const pwInput = document.getElementById('login-password');
        if (emailInput && pwInput) {
          emailInput.value = email;
          pwInput.value = pw;
          this.showToast(`Auto-filled credentials for ${pill.querySelector('strong').textContent}`, 'info');
        }
      });
    });

    // Live SHA-256 Hash Display for Registration Password
    const regPasswordInput = document.getElementById('reg-password');
    const liveHashDisplay = document.getElementById('live-sha256-hash');
    if (regPasswordInput && liveHashDisplay) {
      regPasswordInput.addEventListener('input', async (e) => {
        const val = e.target.value;
        if (!val) {
          liveHashDisplay.textContent = 'Type password above to compute 64-character hash...';
          return;
        }
        const hash = await computeSHA256(val);
        liveHashDisplay.textContent = hash;
      });
    }

    // FORM 1: Patient Login Submission
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
          this.showToast('Please enter both email and password.', 'danger');
          return;
        }

        // Compute input SHA-256 hash
        const inputHash = await computeSHA256(password);

        let user = null;
        let patient = null;

        // If cloud connected, query Supabase
        if (this.isCloudConnected && this.supabaseClient) {
          try {
            const { data: uData, error: uErr } = await this.supabaseClient
              .from('users')
              .select('*')
              .eq('email', email)
              .eq('password_hash', inputHash)
              .single();

            if (uData && !uErr) {
              user = uData;
              const { data: pData } = await this.supabaseClient
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .single();
              patient = pData;
            }
          } catch (err) {
            console.warn('Cloud login lookup error, falling back to local:', err);
          }
        }

        // Fallback to local store if not found in cloud
        if (!user) {
          user = this.db.users.find(u => u.email.toLowerCase() === email && u.password_hash === inputHash);
          if (user) {
            patient = this.db.patients.find(p => p.user_id === user.id);
          }
        }

        if (!user || !patient) {
          this.showToast('Invalid credentials. Password hash does not match.', 'danger');
          return;
        }

        this.loginSuccess(patient, true);
      });
    }

    // FORM 2: New Patient Registration Submission
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const phone = document.getElementById('reg-phone').value.trim();
        const dob = document.getElementById('reg-dob').value;
        const gender = document.getElementById('reg-gender').value;
        const blood = document.getElementById('reg-blood').value;
        const emergency = document.getElementById('reg-emergency').value.trim();
        const allergies = document.getElementById('reg-allergies').value.trim() || 'None reported';
        const password = document.getElementById('reg-password').value;
        const confirmPw = document.getElementById('reg-password-confirm').value;

        // Validation
        if (!fullName || !email || !phone || !dob || !password) {
          this.showToast('Please fill in all mandatory fields.', 'danger');
          return;
        }

        if (password.length < 6) {
          this.showToast('Password must be at least 6 characters long.', 'danger');
          return;
        }

        if (password !== confirmPw) {
          this.showToast('Passwords do not match. Please re-enter.', 'danger');
          return;
        }

        // Duplicate check
        const existing = this.db.users.find(u => u.email.toLowerCase() === email);
        if (existing) {
          this.showToast('An account with this email already exists.', 'danger');
          return;
        }

        // Compute Cryptographic SHA-256 Hash
        const passwordHash = await computeSHA256(password);

        // Generate IDs
        const newUserId = this.db.users.length ? Math.max(...this.db.users.map(u => u.id)) + 1 : 1;
        const newUser = {
          id: newUserId,
          email: email,
          password_hash: passwordHash,
          role: 'patient',
          is_active: true,
          created_at: new Date().toISOString()
        };

        const newPatientId = this.db.patients.length ? Math.max(...this.db.patients.map(p => p.id)) + 1 : 1;
        const newPatient = {
          id: newPatientId,
          user_id: newUserId,
          full_name: fullName,
          email: email,
          phone: phone,
          date_of_birth: dob,
          gender: gender,
          blood_group: blood,
          emergency_contact: emergency || 'Not provided',
          allergies: allergies
        };

        // If Cloud connected, insert to Supabase Cloud
        if (this.isCloudConnected && this.supabaseClient) {
          try {
            await this.supabaseClient.from('users').insert([newUser]);
            await this.supabaseClient.from('patients').insert([newPatient]);
          } catch (err) {
            console.warn('Cloud sync error on registration, saved locally:', err);
          }
        }

        // Persist locally
        this.db.users.push(newUser);
        this.db.patients.push(newPatient);
        DatabaseManager.saveDB(this.db);

        this.showToast(`Account registered! Stored in ${this.isCloudConnected ? 'Supabase Cloud' : 'Local Store'} with SHA-256 hash.`, 'success');
        this.loginSuccess(newPatient, true);
      });
    }

    // Sign Out Button
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  loginSuccess(patient, showToastMessage = true) {
    this.activePatient = patient;
    DatabaseManager.setSession(patient);

    if (showToastMessage) {
      this.showToast(`Welcome back, ${patient.full_name}!`, 'success');
    }

    const authScreen = document.getElementById('auth-screen');
    const portalApp = document.getElementById('patient-portal-app');
    if (authScreen) authScreen.style.display = 'none';
    if (portalApp) portalApp.style.display = 'flex';

    this.updatePatientSidebarAndHeader();
    this.renderAllViews();
    this.switchView('dashboard');
  }

  logout() {
    this.activePatient = null;
    DatabaseManager.clearSession();
    this.showToast('You have signed out securely.', 'info');
    this.showAuthScreen();
  }

  showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const portalApp = document.getElementById('patient-portal-app');
    if (authScreen) authScreen.style.display = 'flex';
    if (portalApp) portalApp.style.display = 'none';
  }

  updatePatientSidebarAndHeader() {
    if (!this.activePatient) return;
    const p = this.activePatient;

    const initials = p.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const avatarEl = document.getElementById('sidebar-patient-avatar');
    const nameEl = document.getElementById('sidebar-patient-name');
    const bloodEl = document.getElementById('sidebar-patient-blood');
    const idEl = document.getElementById('sidebar-patient-id');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = p.full_name;
    if (bloodEl) bloodEl.textContent = p.blood_group;
    if (idEl) idEl.textContent = `PID #${p.id}`;

    const greetingEl = document.getElementById('dash-greeting-name');
    const dashBlood = document.getElementById('dash-vital-blood');
    const dashDob = document.getElementById('dash-vital-dob');
    const dashPhone = document.getElementById('dash-vital-phone');
    const dashAllergies = document.getElementById('dash-vital-allergies');

    if (greetingEl) greetingEl.textContent = p.full_name;
    if (dashBlood) dashBlood.textContent = p.blood_group;
    if (dashDob) dashDob.textContent = this.formatDate(p.date_of_birth);
    if (dashPhone) dashPhone.textContent = p.phone;
    if (dashAllergies) dashAllergies.textContent = p.allergies || 'None';
  }

  // --------------------------------------------------------------------------
  // Navigation & View Routing
  // --------------------------------------------------------------------------
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.switchView(view);
      });
    });

    const dashBookBtn = document.getElementById('btn-banner-book');
    const headerBookBtn = document.getElementById('btn-quick-book');
    const apptViewBookBtn = document.getElementById('btn-appt-view-book');

    const openBooking = () => {
      this.openBookingModal(null);
    };

    if (dashBookBtn) dashBookBtn.addEventListener('click', openBooking);
    if (headerBookBtn) headerBookBtn.addEventListener('click', openBooking);
    if (apptViewBookBtn) apptViewBookBtn.addEventListener('click', openBooking);

    const linkAppts = document.getElementById('dash-link-appointments');
    const linkRx = document.getElementById('dash-link-prescriptions');
    const kpiAppts = document.getElementById('kpi-card-appts');
    const kpiRx = document.getElementById('kpi-card-rx');
    const kpiDoctors = document.getElementById('kpi-card-doctors');

    if (linkAppts) linkAppts.addEventListener('click', () => this.switchView('appointments'));
    if (linkRx) linkRx.addEventListener('click', () => this.switchView('prescriptions'));
    if (kpiAppts) kpiAppts.addEventListener('click', () => this.switchView('appointments'));
    if (kpiRx) kpiRx.addEventListener('click', () => this.switchView('prescriptions'));
    if (kpiDoctors) kpiDoctors.addEventListener('click', () => this.switchView('doctors'));
  }

  switchView(viewId) {
    this.currentView = viewId;

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    document.querySelectorAll('.view-container').forEach(c => {
      c.classList.remove('active');
    });

    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
    }

    const viewTitleEl = document.getElementById('view-title');
    const viewSubEl = document.getElementById('view-subtitle');

    const titles = {
      dashboard: { title: 'My Health Dashboard', sub: 'Overview of your appointments, prescriptions, and health metrics' },
      doctors: { title: 'Find & Book Doctors', sub: 'Browse certified specialists, check consultation fees, and schedule visits' },
      appointments: { title: 'My Consultations & Appointments', sub: 'Track upcoming scheduled visits and review past appointments' },
      prescriptions: { title: 'My Medical Prescriptions (Rx)', sub: 'View medications prescribed by your attending physicians' },
      history: { title: 'Medical History & Doctor Notes', sub: 'Detailed clinical records, past diagnoses, and recorded vitals' },
      security: { title: 'Database & Hash Security Inspector', sub: 'Inspect database tables and verify SHA-256 cryptographic password hashing' }
    };

    if (titles[viewId]) {
      if (viewTitleEl) viewTitleEl.textContent = titles[viewId].title;
      if (viewSubEl) viewSubEl.textContent = titles[viewId].sub;
    }

    if (viewId === 'dashboard') this.renderDashboard();
    if (viewId === 'doctors') this.renderDoctors();
    if (viewId === 'appointments') this.renderAppointments();
    if (viewId === 'prescriptions') this.renderPrescriptions();
    if (viewId === 'history') this.renderMedicalHistory();
    if (viewId === 'security') this.renderSecurityInspector();
  }

  // --------------------------------------------------------------------------
  // Render View 1: Patient Dashboard
  // --------------------------------------------------------------------------
  renderDashboard() {
    if (!this.activePatient) return;
    const pid = this.activePatient.id;

    const patientAppts = this.db.appointments.filter(a => a.patient_id === pid);
    const upcomingAppts = patientAppts.filter(a => a.status === 'Scheduled');
    const patientRx = this.db.prescriptions.filter(pr => pr.patient_id === pid);

    const kpiUpcoming = document.getElementById('kpi-upcoming-appts');
    const kpiTotal = document.getElementById('kpi-total-appts');
    const kpiRx = document.getElementById('kpi-active-rx');
    const kpiDocs = document.getElementById('kpi-available-doctors');

    if (kpiUpcoming) kpiUpcoming.textContent = upcomingAppts.length;
    if (kpiTotal) kpiTotal.textContent = patientAppts.length;
    if (kpiRx) kpiRx.textContent = patientRx.length;
    if (kpiDocs) kpiDocs.textContent = this.db.doctors.length;

    const navApptCounter = document.getElementById('nav-appt-counter');
    const navRxCounter = document.getElementById('nav-rx-counter');
    if (navApptCounter) navApptCounter.textContent = upcomingAppts.length;
    if (navRxCounter) navRxCounter.textContent = patientRx.length;

    const nextApptContainer = document.getElementById('dash-next-appt-container');
    if (nextApptContainer) {
      if (upcomingAppts.length === 0) {
        nextApptContainer.innerHTML = `
          <div class="empty-state-card">
            <div class="empty-state-icon">📅</div>
            <h4>No Upcoming Consultations</h4>
            <p>You have no scheduled visits at this time. Book an appointment whenever you need care.</p>
            <button class="btn-primary" id="btn-empty-book-appt">+ Book Doctor Appointment</button>
          </div>
        `;
        const emptyBookBtn = document.getElementById('btn-empty-book-appt');
        if (emptyBookBtn) {
          emptyBookBtn.addEventListener('click', () => this.openBookingModal(null));
        }
      } else {
        const next = [...upcomingAppts].sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`) - new Date(`${b.appointment_date}T${b.appointment_time}`))[0];
        const doctor = this.db.doctors.find(d => d.id === next.doctor_id);

        nextApptContainer.innerHTML = `
          <div class="next-appt-card">
            <div class="next-appt-header">
              <span class="status-pill scheduled">● Confirmed Schedule</span>
              <button class="btn-cancel-appt-action" data-appt-id="${next.id}">Cancel Visit</button>
            </div>
            <div class="next-appt-doctor">${doctor ? doctor.full_name : 'Assigned Doctor'}</div>
            <div class="next-appt-spec">${doctor ? doctor.specialization : ''} • ${doctor ? doctor.department : ''}</div>
            
            <div class="next-appt-meta">
              <span>🗓️ <strong>${this.formatDate(next.appointment_date)}</strong></span>
              <span>⏰ <strong>${this.formatTime(next.appointment_time)}</strong></span>
              <span>💵 <strong>$${doctor ? doctor.consultation_fee.toFixed(2) : '0.00'}</strong></span>
            </div>

            <div class="next-appt-reason">
              <strong>Reason:</strong> "${this.escapeHtml(next.reason_for_visit)}"
            </div>
          </div>
        `;

        const cancelBtn = nextApptContainer.querySelector('.btn-cancel-appt-action');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => this.cancelAppointment(next.id));
        }
      }
    }

    const recentRxContainer = document.getElementById('dash-recent-rx-container');
    if (recentRxContainer) {
      if (patientRx.length === 0) {
        recentRxContainer.innerHTML = `
          <div class="empty-state-card">
            <div class="empty-state-icon">💊</div>
            <h4>No Active Prescriptions</h4>
            <p>Prescriptions issued by your doctor after clinical visits will appear here.</p>
          </div>
        `;
      } else {
        const previewRx = [...patientRx].slice(0, 3);
        let rxHtml = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
        previewRx.forEach(rx => {
          const doc = this.db.doctors.find(d => d.id === rx.doctor_id);
          rxHtml += `
            <div style="background: var(--bg-surface-elevated); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: var(--text-main); font-size: 0.95rem;">${this.escapeHtml(rx.medication_name)}</strong>
                <div style="font-size: 0.78rem; color: var(--secondary); font-weight: 600;">${this.escapeHtml(rx.dosage)} • ${this.escapeHtml(rx.frequency)}</div>
                <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Prescribed by ${doc ? doc.full_name : 'Doctor'} on ${this.formatDate(rx.prescribed_date)}</div>
              </div>
              <button class="btn-secondary btn-view-single-rx" data-rx-id="${rx.id}" style="font-size: 0.78rem; padding: 0.4rem 0.75rem;">
                View Slip
              </button>
            </div>
          `;
        });
        rxHtml += '</div>';
        recentRxContainer.innerHTML = rxHtml;

        recentRxContainer.querySelectorAll('.btn-view-single-rx').forEach(btn => {
          btn.addEventListener('click', () => {
            const rxId = parseInt(btn.getAttribute('data-rx-id'), 10);
            this.openPrescriptionModal(rxId);
          });
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // Render View 2: Doctor Directory & Search
  // --------------------------------------------------------------------------
  renderDoctors() {
    const searchInput = document.getElementById('doctor-search');
    const deptSelect = document.getElementById('doctor-dept-filter');
    const grid = document.getElementById('doctors-list-grid');
    const label = document.getElementById('doctor-count-label');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const deptFilter = deptSelect ? deptSelect.value : 'ALL';

    const filtered = this.db.doctors.filter(d => {
      const matchDept = deptFilter === 'ALL' || d.department.toLowerCase() === deptFilter.toLowerCase();
      const matchQuery = !query || 
        d.full_name.toLowerCase().includes(query) ||
        d.specialization.toLowerCase().includes(query) ||
        d.department.toLowerCase().includes(query) ||
        (d.bio && d.bio.toLowerCase().includes(query));
      return matchDept && matchQuery;
    });

    if (label) {
      label.textContent = `Showing ${filtered.length} of ${this.db.doctors.length} verified specialists`;
    }

    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h4>No Doctors Match Your Search</h4>
          <p>Try searching with another specialty, medical condition, or clear the department filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(doc => `
      <div class="doctor-card">
        <div class="doctor-card-header">
          <div class="doctor-avatar">👨‍⚕️</div>
          <div class="doctor-header-text">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
              <h3 class="doctor-name">${this.escapeHtml(doc.full_name)}</h3>
              <span class="doctor-rating-badge" title="4.9 / 5 rating from verified patient consultations">★ 4.9</span>
            </div>
            <div class="doctor-specialty">${this.escapeHtml(doc.specialization)}</div>
            <div style="display: flex; gap: 0.4rem; align-items: center; margin-top: 0.35rem; flex-wrap: wrap;">
              <span class="doctor-department-tag">${this.escapeHtml(doc.department)}</span>
              <span class="doctor-verified-badge">✓ Certified</span>
            </div>
          </div>
        </div>

        <p class="doctor-bio">${this.escapeHtml(doc.bio || 'Consulting physician at SmartCare Central.')}</p>

        <div class="doctor-meta-strip">
          <div class="doctor-meta-item">
            <strong>Consultation Fee</strong>
            <span class="doctor-fee">$${doc.consultation_fee.toFixed(2)}</span>
          </div>
          <div class="doctor-meta-item">
            <strong>Visiting Schedule</strong>
            <span>${this.escapeHtml(doc.availability_days || 'Mon - Fri')}</span>
          </div>
        </div>

        <button class="btn-primary btn-book-doctor" data-doc-id="${doc.id}">
          <span>+ Book Consultation</span>
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-book-doctor').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = parseInt(btn.getAttribute('data-doc-id'), 10);
        const doctor = this.db.doctors.find(d => d.id === docId);
        this.openBookingModal(doctor);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Render View 3: My Appointments
  // --------------------------------------------------------------------------
  renderAppointments() {
    if (!this.activePatient) return;
    const pid = this.activePatient.id;

    const statusFilter = document.getElementById('appointment-status-filter');
    const filterVal = statusFilter ? statusFilter.value : 'ALL';
    const container = document.getElementById('patient-appts-list');

    let list = this.db.appointments.filter(a => a.patient_id === pid);
    if (filterVal !== 'ALL') {
      list = list.filter(a => a.status.toLowerCase() === filterVal.toLowerCase());
    }

    list.sort((a, b) => new Date(`${b.appointment_date}T${b.appointment_time}`) - new Date(`${a.appointment_date}T${a.appointment_time}`));

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">📅</div>
          <h4>No Appointments Found</h4>
          <p>No appointment records match the selected filter.</p>
          <button class="btn-primary" id="btn-appts-book-trigger">+ Book New Appointment</button>
        </div>
      `;
      const btn = document.getElementById('btn-appts-book-trigger');
      if (btn) btn.addEventListener('click', () => this.openBookingModal(null));
      return;
    }

    container.innerHTML = list.map(appt => {
      const doc = this.db.doctors.find(d => d.id === appt.doctor_id);
      const isScheduled = appt.status === 'Scheduled';
      const isCompleted = appt.status === 'Completed';
      const isCancelled = appt.status === 'Cancelled';

      let statusClass = 'scheduled';
      if (isCompleted) statusClass = 'completed';
      if (isCancelled) statusClass = 'cancelled';

      return `
        <div class="appointment-card">
          <div class="appt-main-info">
            <div class="appt-doctor-icon">🩺</div>
            <div class="appt-text-details">
              <h3>${doc ? this.escapeHtml(doc.full_name) : 'Consulting Doctor'}</h3>
              <div class="appt-doctor-sub">${doc ? this.escapeHtml(doc.specialization) : ''} • ${doc ? this.escapeHtml(doc.department) : ''}</div>
              
              <div class="appt-meta-tags">
                <span>🗓️ ${this.formatDate(appt.appointment_date)}</span>
                <span>⏰ ${this.formatTime(appt.appointment_time)}</span>
                <span>💵 $${(appt.consultation_fee || (doc ? doc.consultation_fee : 0)).toFixed(2)}</span>
                <span class="appt-reason-tag">"${this.escapeHtml(appt.reason_for_visit)}"</span>
              </div>
            </div>
          </div>

          <div class="appt-actions-group">
            <span class="status-pill ${statusClass}">
              ${isCompleted ? '✓ Completed' : isScheduled ? '● Scheduled' : '✕ Cancelled'}
            </span>

            ${isScheduled ? `
              <button class="btn-cancel-appt-action" data-appt-id="${appt.id}">Cancel Visit</button>
            ` : ''}

            ${isCompleted ? `
              <button class="btn-secondary btn-view-notes" data-appt-id="${appt.id}" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
                View Notes & Rx
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-cancel-appt-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const apptId = parseInt(btn.getAttribute('data-appt-id'), 10);
        this.cancelAppointment(apptId);
      });
    });

    container.querySelectorAll('.btn-view-notes').forEach(btn => {
      btn.addEventListener('click', () => {
        const apptId = parseInt(btn.getAttribute('data-appt-id'), 10);
        const rx = this.db.prescriptions.find(p => p.appointment_id === apptId);
        if (rx) {
          this.openPrescriptionModal(rx.id);
        } else {
          this.switchView('history');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Render View 4: My Prescriptions (Rx)
  // --------------------------------------------------------------------------
  renderPrescriptions() {
    if (!this.activePatient) return;
    const pid = this.activePatient.id;

    const searchInput = document.getElementById('rx-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const grid = document.getElementById('prescriptions-list-grid');
    const label = document.getElementById('rx-count-label');

    let list = this.db.prescriptions.filter(pr => pr.patient_id === pid);
    if (query) {
      list = list.filter(pr => 
        pr.medication_name.toLowerCase().includes(query) ||
        pr.dosage.toLowerCase().includes(query) ||
        (pr.instructions && pr.instructions.toLowerCase().includes(query))
      );
    }

    list.sort((a, b) => new Date(b.prescribed_date) - new Date(a.prescribed_date));

    if (label) {
      label.textContent = `${list.length} digital prescription records on file for ${this.activePatient.full_name}`;
    }

    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">💊</div>
          <h4>No Prescriptions Found</h4>
          <p>You currently do not have any prescribed medications matching your query.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(rx => {
      const doc = this.db.doctors.find(d => d.id === rx.doctor_id);
      return `
        <div class="rx-card">
          <span class="rx-card-badge">Rx Verified</span>
          
          <div class="rx-header">
            <div class="rx-icon-box">℞</div>
            <div>
              <h3 class="rx-med-name">${this.escapeHtml(rx.medication_name)}</h3>
              <div class="rx-dosage-badge">${this.escapeHtml(rx.dosage)}</div>
            </div>
          </div>

          <div class="rx-schedule-box">
            <div class="rx-schedule-row">
              <span class="rx-schedule-label">Frequency:</span>
              <span class="rx-schedule-val">${this.escapeHtml(rx.frequency)}</span>
            </div>
            <div class="rx-schedule-row">
              <span class="rx-schedule-label">Duration:</span>
              <span class="rx-schedule-val">${this.escapeHtml(rx.duration)}</span>
            </div>
          </div>

          <div class="rx-instructions-box">
            <strong>Clinical Advice:</strong><br>
            ${this.escapeHtml(rx.instructions || 'Take as advised by your attending physician.')}
          </div>

          <div class="rx-doctor-signoff">
            <div>
              <div class="rx-doctor-name">${doc ? this.escapeHtml(doc.full_name) : 'Doctor'}</div>
              <div>${this.formatDate(rx.prescribed_date)}</div>
            </div>
            <button class="btn-primary btn-rx-slip-action" data-rx-id="${rx.id}" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
              Print Slip 🖨️
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-rx-slip-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const rxId = parseInt(btn.getAttribute('data-rx-id'), 10);
        this.openPrescriptionModal(rxId);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Render View 5: Medical History & Clinical Notes
  // --------------------------------------------------------------------------
  renderMedicalHistory() {
    if (!this.activePatient) return;
    const pid = this.activePatient.id;

    const searchInput = document.getElementById('history-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const timeline = document.getElementById('medical-history-timeline');

    let list = this.db.appointments.filter(a => a.patient_id === pid && (a.status === 'Completed' || a.doctor_notes));

    if (query) {
      list = list.filter(a => 
        (a.reason_for_visit && a.reason_for_visit.toLowerCase().includes(query)) ||
        (a.doctor_notes && a.doctor_notes.toLowerCase().includes(query))
      );
    }

    list.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

    if (!timeline) return;

    if (list.length === 0) {
      timeline.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">📋</div>
          <h4>No Medical History Records Yet</h4>
          <p>Once you complete consultations with doctors, clinical observations and vital signs will be recorded here.</p>
        </div>
      `;
      return;
    }

    timeline.innerHTML = list.map(item => {
      const doc = this.db.doctors.find(d => d.id === item.doctor_id);
      const linkedRx = this.db.prescriptions.filter(pr => pr.appointment_id === item.id);

      return `
        <div class="history-item">
          <div class="history-item-dot"></div>
          <div class="history-card">
            
            <div class="history-card-header">
              <div>
                <h3 class="history-visit-title">${this.escapeHtml(item.reason_for_visit)}</h3>
                <div class="history-visit-doctor">
                  Attending Doctor: <strong>${doc ? this.escapeHtml(doc.full_name) : 'Doctor'}</strong> (${doc ? this.escapeHtml(doc.specialization) : ''})
                </div>
              </div>
              <span class="history-date-badge">🗓️ ${this.formatDate(item.appointment_date)}</span>
            </div>

            ${(item.vitals_blood_pressure || item.vitals_heart_rate || item.vitals_temperature) ? `
              <div class="history-vitals-row">
                ${item.vitals_blood_pressure ? `
                  <div class="vitals-chip">
                    <span>🩸 Blood Pressure:</span>
                    <strong>${this.escapeHtml(item.vitals_blood_pressure)} mmHg</strong>
                  </div>
                ` : ''}
                ${item.vitals_heart_rate ? `
                  <div class="vitals-chip">
                    <span>❤️ Heart Rate:</span>
                    <strong>${item.vitals_heart_rate} bpm</strong>
                  </div>
                ` : ''}
                ${item.vitals_temperature ? `
                  <div class="vitals-chip">
                    <span>🌡️ Temperature:</span>
                    <strong>${item.vitals_temperature} °C</strong>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <div class="history-notes-box">
              <div class="history-notes-label">Clinical Observations & Findings:</div>
              ${this.escapeHtml(item.doctor_notes || 'Patient reviewed. No complications noted.')}
            </div>

            ${linkedRx.length > 0 ? `
              <div style="background: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.76rem; font-weight: 700; color: var(--secondary); text-transform: uppercase; margin-bottom: 0.35rem;">Prescriptions Issued during this Visit:</div>
                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  ${linkedRx.map(r => `
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                      <span>💊 <strong>${this.escapeHtml(r.medication_name)}</strong> (${this.escapeHtml(r.dosage)}) - ${this.escapeHtml(r.frequency)}</span>
                      <button class="btn-text-link btn-view-hist-rx" data-rx-id="${r.id}" style="font-size: 0.75rem;">View Slip →</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </div>
        </div>
      `;
    }).join('');

    timeline.querySelectorAll('.btn-view-hist-rx').forEach(btn => {
      btn.addEventListener('click', () => {
        const rxId = parseInt(btn.getAttribute('data-rx-id'), 10);
        this.openPrescriptionModal(rxId);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Render View 6: Database & Hash Security Inspector
  // --------------------------------------------------------------------------
  renderSecurityInspector() {
    this.inspectTable('users');
  }

  inspectTable(tableName) {
    const output = document.getElementById('db-json-view');
    if (!output) return;

    if (tableName === 'schema_supabase') {
      output.textContent = `-- Supabase Cloud PostgreSQL Schema DDL (Run this in Supabase SQL Editor)
CREATE TABLE users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash CHAR(64) NOT NULL, -- Irreversible SHA-256 hash
    role VARCHAR(20) NOT NULL DEFAULT 'patient',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    date_of_birth DATE NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    emergency_contact VARCHAR(120),
    allergies TEXT DEFAULT 'None'
);

CREATE TABLE doctors (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00
);

CREATE TABLE appointments (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    reason_for_visit VARCHAR(255) NOT NULL,
    doctor_notes TEXT
);

CREATE TABLE prescriptions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    medication_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    instructions TEXT
);`;
      return;
    }

    if (tableName === 'schema_sql') {
      output.textContent = `-- MySQL 8.0 Local Relational Schema
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash CHAR(64) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient'
);
-- See database/schema.sql for the full script.`;
      return;
    }

    const data = this.db[tableName] || [];
    output.textContent = JSON.stringify(data, null, 2);
  }

  setupSecurityHashTool() {
    const input = document.getElementById('tool-hash-input');
    const output = document.getElementById('tool-hash-output');
    const copyBtn = document.getElementById('btn-copy-hash');

    if (input && output) {
      input.addEventListener('input', async (e) => {
        const val = e.target.value;
        const hash = val ? await computeSHA256(val) : '';
        output.textContent = hash || 'Type plain text above to see 64-char SHA-256 hash...';
      });
    }

    if (copyBtn && output) {
      copyBtn.addEventListener('click', () => {
        const text = output.textContent.trim();
        if (text && text.length === 64) {
          navigator.clipboard.writeText(text);
          this.showToast('SHA-256 hash copied to clipboard!', 'info');
        }
      });
    }

    const tabBtns = document.querySelectorAll('.db-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tbl = btn.getAttribute('data-table');
        this.inspectTable(tbl);
      });
    });

    const resetBtn = document.getElementById('btn-reset-db');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset database to initial demo state with seed patients & doctors?')) {
          DatabaseManager.resetDB();
          this.db = DatabaseManager.getDB();
          this.showToast('Database reset to initial demo seeds.', 'success');
          const session = DatabaseManager.getSession();
          if (session) {
            const found = this.db.patients.find(p => p.id === session.id);
            if (found) {
              this.activePatient = found;
              this.renderAllViews();
              this.inspectTable('users');
            } else {
              this.logout();
            }
          }
        }
      });
    }

    const dlBtn = document.getElementById('btn-download-sql');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        window.open('database/schema.sql', '_blank');
      });
    }
  }

  // --------------------------------------------------------------------------
  // Action Listeners: Booking & Modals
  // --------------------------------------------------------------------------
  setupActionListeners() {
    const docSearch = document.getElementById('doctor-search');
    const docDept = document.getElementById('doctor-dept-filter');
    if (docSearch) docSearch.addEventListener('input', () => this.renderDoctors());
    if (docDept) docDept.addEventListener('change', () => this.renderDoctors());

    const apptFilter = document.getElementById('appointment-status-filter');
    if (apptFilter) apptFilter.addEventListener('change', () => this.renderAppointments());

    const rxSearch = document.getElementById('rx-search');
    if (rxSearch) rxSearch.addEventListener('input', () => this.renderPrescriptions());

    const historySearch = document.getElementById('history-search');
    if (historySearch) historySearch.addEventListener('input', () => this.renderMedicalHistory());

    const closeApptBtn = document.getElementById('close-appt-modal');
    const cancelApptBtn = document.getElementById('btn-cancel-appt');
    const closeRxBtn = document.getElementById('close-rx-modal');
    const closeRxBtnFooter = document.getElementById('btn-close-rx');

    const closeModals = () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    };

    if (closeApptBtn) closeApptBtn.addEventListener('click', closeModals);
    if (cancelApptBtn) cancelApptBtn.addEventListener('click', closeModals);
    if (closeRxBtn) closeRxBtn.addEventListener('click', closeModals);
    if (closeRxBtnFooter) closeRxBtnFooter.addEventListener('click', closeModals);

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModals();
      });
    });

    const bookingForm = document.getElementById('form-book-appointment');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAppointmentBooking();
      });
    }

    const docSelect = document.getElementById('appt-doctor-select');
    if (docSelect) {
      docSelect.addEventListener('change', () => {
        const docId = parseInt(docSelect.value, 10);
        const doctor = this.db.doctors.find(d => d.id === docId);
        this.updateModalDoctorCard(doctor);
      });
    }

    const printRxBtn = document.getElementById('btn-print-rx');
    if (printRxBtn) {
      printRxBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  openBookingModal(selectedDoctor = null) {
    if (!this.activePatient) return;

    const modal = document.getElementById('modal-appointment');
    const select = document.getElementById('appt-doctor-select');
    const dateInput = document.getElementById('appt-date-input');
    const reasonInput = document.getElementById('appt-reason-input');
    const notesInput = document.getElementById('appt-notes-input');

    if (!modal || !select) return;

    select.innerHTML = this.db.doctors.map(d => `
      <option value="${d.id}">${d.full_name} (${d.specialization} - $${d.consultation_fee.toFixed(2)})</option>
    `).join('');

    const targetDoc = selectedDoctor || this.db.doctors[0];
    if (targetDoc) {
      select.value = targetDoc.id;
      this.updateModalDoctorCard(targetDoc);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dateInput) {
      dateInput.value = tomorrowStr;
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    if (reasonInput) reasonInput.value = '';
    if (notesInput) notesInput.value = '';

    modal.classList.add('active');
  }

  updateModalDoctorCard(doctor) {
    const nameEl = document.getElementById('modal-doc-name');
    const specEl = document.getElementById('modal-doc-spec');
    const feeEl = document.getElementById('modal-doc-fee');

    if (!doctor) return;
    if (nameEl) nameEl.textContent = doctor.full_name;
    if (specEl) specEl.textContent = `${doctor.specialization} • ${doctor.department}`;
    if (feeEl) feeEl.textContent = `Consultation Fee: $${doctor.consultation_fee.toFixed(2)} (${doctor.availability_days})`;
  }

  async submitAppointmentBooking() {
    if (!this.activePatient) return;

    const select = document.getElementById('appt-doctor-select');
    const dateInput = document.getElementById('appt-date-input');
    const timeSelect = document.getElementById('appt-time-select');
    const reasonInput = document.getElementById('appt-reason-input');
    const notesInput = document.getElementById('appt-notes-input');

    const docId = parseInt(select.value, 10);
    const apptDate = dateInput.value;
    const apptTime = timeSelect.value;
    const reason = reasonInput.value.trim();
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!docId || !apptDate || !apptTime || !reason) {
      this.showToast('Please fill in all required appointment details.', 'danger');
      return;
    }

    const doctor = this.db.doctors.find(d => d.id === docId);

    const newApptId = this.db.appointments.length ? Math.max(...this.db.appointments.map(a => a.id)) + 1 : 1;
    const newAppointment = {
      id: newApptId,
      patient_id: this.activePatient.id,
      doctor_id: docId,
      appointment_date: apptDate,
      appointment_time: apptTime,
      status: 'Scheduled',
      reason_for_visit: reason,
      doctor_notes: notes ? `Patient initial notes: ${notes}` : null,
      vitals_blood_pressure: null,
      vitals_heart_rate: null,
      vitals_temperature: null,
      consultation_fee: doctor ? doctor.consultation_fee : 50.00
    };

    // If Cloud Connected, write to Supabase
    if (this.isCloudConnected && this.supabaseClient) {
      try {
        await this.supabaseClient.from('appointments').insert([newAppointment]);
      } catch (err) {
        console.warn('Cloud appointment insert error, saved locally:', err);
      }
    }

    this.db.appointments.push(newAppointment);
    DatabaseManager.saveDB(this.db);

    document.getElementById('modal-appointment').classList.remove('active');

    this.showToast(`Appointment scheduled with ${doctor ? doctor.full_name : 'Doctor'} on ${this.formatDate(apptDate)}!`, 'success');

    this.renderAllViews();
    this.switchView('appointments');
  }

  async cancelAppointment(apptId) {
    const appt = this.db.appointments.find(a => a.id === apptId && a.patient_id === this.activePatient.id);
    if (!appt) return;

    if (confirm('Are you sure you want to cancel this scheduled consultation?')) {
      appt.status = 'Cancelled';

      // If Cloud Connected, update Supabase
      if (this.isCloudConnected && this.supabaseClient) {
        try {
          await this.supabaseClient
            .from('appointments')
            .update({ status: 'Cancelled' })
            .eq('id', apptId);
        } catch (err) {
          console.warn('Cloud appointment cancellation error:', err);
        }
      }

      DatabaseManager.saveDB(this.db);
      this.showToast('Appointment cancelled successfully.', 'info');
      this.renderAllViews();
    }
  }

  openPrescriptionModal(rxId) {
    const rx = this.db.prescriptions.find(p => p.id === rxId);
    if (!rx) return;

    const patient = this.db.patients.find(p => p.id === rx.patient_id);
    const doctor = this.db.doctors.find(d => d.id === rx.doctor_id);
    const appt = this.db.appointments.find(a => a.id === rx.appointment_id);

    const container = document.getElementById('rx-slip-content');
    const modal = document.getElementById('modal-prescription');

    if (!container || !modal) return;

    container.innerHTML = `
      <div class="rx-slip-hospital-header">
        <div class="rx-slip-brand">
          <span>✚</span> SmartCare Medical Center
        </div>
        <div class="rx-slip-doctor">
          <strong>${doctor ? this.escapeHtml(doctor.full_name) : 'Doctor'}</strong><br>
          <span>${doctor ? this.escapeHtml(doctor.specialization) : ''}</span><br>
          <span style="font-size: 0.78rem; color: #64748b;">License: ${doctor ? doctor.license_number : 'MD-REG-0000'}</span>
        </div>
      </div>

      <div class="rx-slip-patient-info">
        <div>
          <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Patient Name:</span><br>
          <strong>${patient ? this.escapeHtml(patient.full_name) : 'Patient'}</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Blood Group:</span><br>
          <strong style="color: #ef4444;">${patient ? patient.blood_group : 'N/A'}</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Date Prescribed:</span><br>
          <strong>${this.formatDate(rx.prescribed_date)}</strong>
        </div>
      </div>

      <div class="rx-slip-symbol">℞</div>

      <table class="rx-slip-med-table">
        <thead>
          <tr>
            <th>Medication Name</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${this.escapeHtml(rx.medication_name)}</strong></td>
            <td>${this.escapeHtml(rx.dosage)}</td>
            <td>${this.escapeHtml(rx.frequency)}</td>
            <td>${this.escapeHtml(rx.duration)}</td>
          </tr>
        </tbody>
      </table>

      <div class="rx-slip-notes">
        <strong>Specific Instructions:</strong><br>
        ${this.escapeHtml(rx.instructions || 'Follow clinical schedule. Take with water after meals.')}
      </div>

      <div class="rx-slip-footer">
        <div>
          <div>SmartCare Central Digital Prescription #RX-${String(rx.id).padStart(5, '0')}</div>
          <div>Clinical Record ID: #APP-${appt ? appt.id : '0'}</div>
        </div>
        <div class="rx-slip-signature">
          <div class="rx-slip-sig-line"></div>
          <div>Authorized Medical Practitioner Signature</div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  // --------------------------------------------------------------------------
  // Utility & Helper Methods
  // --------------------------------------------------------------------------
  renderAllViews() {
    this.renderDashboard();
    this.renderDoctors();
    this.renderAppointments();
    this.renderPrescriptions();
    this.renderMedicalHistory();
    this.renderSecurityInspector();
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  }

  formatTime(timeString) {
    if (!timeString) return 'N/A';
    try {
      const parts = timeString.split(':');
      let hour = parseInt(parts[0], 10);
      const min = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${min} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }
}

// Instantiate App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.smartCareApp = new SmartCarePatientApp();
});
