# SmartCare ✚
### Patient Healthcare Portal: Doctor Appointments, Encrypted Auth & Free Cloud Database (Supabase)

SmartCare is a patient-centered healthcare web application designed specifically for patients to book specialist doctor appointments, manage digital prescriptions, and review clinical medical histories.

It supports **both a 100% Free Cloud Database ([Supabase PostgreSQL](https://supabase.com))** and an offline local database with cryptographic **SHA-256 password hashing**.

---

## ☁️ Why Supabase is the Best & Free Cloud Database

| Feature | Supabase Cloud PostgreSQL |
| :--- | :--- |
| **Cost** | **100% Free forever tier** (500 MB database, unlimited API requests, no credit card required) |
| **Database Engine** | **PostgreSQL (Relational SQL)** — preserves all relational tables (`users`, `patients`, `doctors`, `appointments`, `prescriptions`) |
| **Browser Integration** | Connects **directly from client-side JavaScript (`app.js`)** via CDN without needing a separate backend server |
| **Visual Dashboard** | Full online **Table Editor & SQL Editor** to view, edit, and query records live in your browser |
| **Security** | Row Level Security (RLS) enabled + client-side SHA-256 cryptographic password hashing |

---

## 🚀 Quick Setup: Connect Your Free Supabase Cloud Database (In 2 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to **[https://supabase.com](https://supabase.com)** and click **Start your project** (Sign in with GitHub or Email).
2. Click **New Project**, name it (e.g. `smartcare-cloud`), choose a database password, and select a region close to you.
3. Click **Create new project** (takes ~30 seconds to spin up).

### Step 2: Run the Cloud SQL Schema Script
1. In your Supabase project dashboard, click the **SQL Editor** tab (icon on the left sidebar: `>_`).
2. Click **+ New Query**.
3. Open [`database/schema_supabase.sql`](file:///c:/Users/ASUS/.gemini/antigravity-ide/scratch/smartcare/database/schema_supabase.sql) from this project, copy all its contents, paste them into the query editor, and click **Run** (or `CTRL + Enter`).
4. All 5 relational tables (`users`, `patients`, `doctors`, `appointments`, `prescriptions`) will be created and populated with initial test data and security policies!

### Step 3: Get Your API Keys
1. In your Supabase dashboard, click the **Project Settings** (gear icon ⚙️) at the bottom left.
2. Click **API** under Configuration.
3. Copy your:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API Key** (the **`anon public`** key)

### Step 4: Connect Permanently Inside SmartCare
SmartCare supports **100% permanent database connection** — you never have to re-configure it every time you open the app! Choose either method:

- **Method A (Code Configuration in `config.js`):**
  Open [`config.js`](file:///c:/Users/ASUS/.gemini/antigravity-ide/scratch/smartcare/config.js) and paste your Supabase URL and anon key into `SMARTCARE_CONFIG.database`. SmartCare will permanently auto-connect to your cloud database whenever launched.

- **Method B (UI Settings Panel):**
  1. Open [`index.html`](file:///c:/Users/ASUS/.gemini/antigravity-ide/scratch/smartcare/index.html) in your browser.
  2. Click **⚙️ Database Settings** on the sign-in screen or the top header status badge.
  3. Paste your **Supabase URL** and **Anon API Key**, then click **Save Permanently & Connect**.
  4. Your credentials are permanently saved in persistent storage and auto-connected on boot!

---

## 🗂️ Project Directory Structure

```text
smartcare/
│
├── 📄 index.html                # Patient Portal Application (Auth, Dashboard, Booking, Rx, Modals)
├── ⚙️ config.js                # Permanent Database & System Configuration
├── 🎨 styles.css                # Modern Healthcare Design System & Clinical UI
├── ⚡ app.js                    # Cryptographic SHA-256 Engine, Cloud SDK & Permanent Controller
│
├── 📁 database/
│   ├── schema_supabase.sql     # ☁️ PostgreSQL Cloud DDL & Seed for Supabase (RLS enabled)
│   ├── schema.sql              # 💻 MySQL 8.0 local relational schema DDL
│   ├── seed.sql                # 💻 MySQL 8.0 seed records
│   └── queries.sql             # SQL queries for both MySQL and Supabase SQL Editor
│
└── 📖 README.md                 # System overview and setup guide
```

---

## 🌟 Key Application Features

1. **Patient Authentication & User Registration**
   - **Sign In**: Login verified against irreversible 64-character SHA-256 password hashes.
   - **New Patient Registration**: Captures patient name, email, phone, DOB, blood group, emergency contact, allergies.
   - **Live Encryption Preview**: Displays computed SHA-256 hash in real time as the user types.
   - **Quick Demo Accounts**: 1-click test login for preloaded patients (Oliver Queen, Clara Oswald, Bruce Wayne).

2. **Available Doctors & Intelligent Booking**
   - Browse certified medical specialists (Cardiology, Neurology, Pediatrics, General Medicine, Dermatology).
   - Search by doctor name, specialty, or condition requirement (e.g., "heart", "migraine", "skin", "child").
   - Filter by clinical department and schedule.
   - Schedule appointments with preferred date, time slot, reason for visit, and consultation fee tracking.

3. **My Appointments Management**
   - Track scheduled upcoming visits, completed consultations, and cancellations.
   - Cancel scheduled appointments with one click.
   - Direct access to doctor's clinical visit notes and prescribed medications for completed visits.

4. **Digital Prescriptions (Rx)**
   - View active and historical medication records issued by consulting doctors.
   - Complete dosage, frequency, course duration, and intake instructions.
   - Printable official medical prescription slip.

5. **Medical History & Clinical Observations**
   - Chronological timeline of clinical consultations.
   - Recorded vital signs (Blood Pressure mmHg, Heart Rate bpm, Body Temperature °C).
   - Attending doctor observations, diagnoses, and treatment plans.

6. **Database & Security Inspector**
   - Inspect live tables (`users` with SHA-256 hashes, `patients`, `doctors`, `appointments`, `prescriptions`).
   - Switch between viewing Supabase PostgreSQL schema and MySQL schema.
   - Live interactive SHA-256 generator tool to test hashing any string.
