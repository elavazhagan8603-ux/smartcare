-- ============================================================================
-- SmartCare: Patient Healthcare Portal & Relational Database System
-- Schema Definition (MySQL 8.0 / Relational SQL)
-- Features:
--   1. Patient user authentication with SHA-256 hashed (encrypted) passwords
--   2. Doctor visiting & appointment management
--   3. Clinical visit notes & vitals recorded by doctors
--   4. Digital prescription tracking issued to patients
-- ============================================================================

CREATE DATABASE IF NOT EXISTS smartcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartcare_db;

-- ----------------------------------------------------------------------------
-- 1. Users Table (Authentication & Password Hashing)
-- Passwords are encrypted as 64-character SHA-256 hexadecimal hashes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash CHAR(64) NOT NULL COMMENT 'SHA-256 64-char hexadecimal cryptographic hash',
    role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. Patients Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    emergency_contact VARCHAR(120),
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. Doctors Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    phone VARCHAR(25) NOT NULL,
    availability_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_doctor_specialization (specialization)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. Appointments / Doctor Visiting Details Table
-- Stores appointment requests, visiting schedule, consultation fees & vitals
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    reason_for_visit VARCHAR(255) NOT NULL,
    doctor_notes TEXT COMMENT 'Clinical observations written by doctor during visit',
    vitals_blood_pressure VARCHAR(20) DEFAULT NULL COMMENT 'e.g. 120/80 mmHg',
    vitals_heart_rate INT DEFAULT NULL COMMENT 'e.g. 72 bpm',
    vitals_temperature DECIMAL(4, 1) DEFAULT NULL COMMENT 'e.g. 36.8 C',
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_doctor (doctor_id),
    INDEX idx_appointment_date (appointment_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. Prescriptions Table
-- Stores medication details issued to the patient by the doctor
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medication_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100) NOT NULL COMMENT 'e.g. 500 mg',
    frequency VARCHAR(100) NOT NULL COMMENT 'e.g. Twice daily after meals',
    duration VARCHAR(50) NOT NULL COMMENT 'e.g. 7 days',
    instructions TEXT COMMENT 'e.g. Drink plenty of fluids, avoid dairy within 2 hours',
    prescribed_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    INDEX idx_prescription_patient (patient_id),
    INDEX idx_prescription_appointment (appointment_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. Relational Views for Patient Portal
-- ----------------------------------------------------------------------------

-- View: Patient Doctor Visiting Dossier
CREATE OR REPLACE VIEW view_patient_visits AS
SELECT 
    a.id AS appointment_id,
    p.id AS patient_id,
    p.full_name AS patient_name,
    p.blood_group,
    d.id AS doctor_id,
    d.full_name AS doctor_name,
    d.specialization,
    d.department,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.reason_for_visit,
    a.doctor_notes,
    a.vitals_blood_pressure,
    a.vitals_heart_rate,
    a.vitals_temperature,
    a.consultation_fee
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id;

-- View: Complete Patient Prescription Records
CREATE OR REPLACE VIEW view_patient_prescriptions AS
SELECT 
    pr.id AS prescription_id,
    pr.patient_id,
    p.full_name AS patient_name,
    d.full_name AS doctor_name,
    d.specialization,
    pr.appointment_id,
    a.appointment_date AS visit_date,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    pr.instructions,
    pr.prescribed_date
FROM prescriptions pr
JOIN patients p ON pr.patient_id = p.id
JOIN doctors d ON pr.doctor_id = d.id
JOIN appointments a ON pr.appointment_id = a.id;
