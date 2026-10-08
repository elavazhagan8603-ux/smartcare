-- ============================================================================
-- SmartCare: Patient Healthcare Portal SQL Queries
-- Use these in MySQL Workbench, MySQL CLI, or your backend API
-- ============================================================================

USE smartcare_db;

-- ----------------------------------------------------------------------------
-- 1. Secure Patient Authentication with SHA-256 Password Hash Verification
-- Compares the user input hash against the stored 64-character encrypted hash
-- ----------------------------------------------------------------------------
-- Example: Verifying login for 'oliver.queen@example.com' with password 'password123'
SELECT 
    u.id AS user_id,
    u.email,
    u.role,
    u.password_hash,
    p.id AS patient_id,
    p.full_name AS patient_name,
    p.blood_group,
    p.phone
FROM users u
JOIN patients p ON u.id = p.user_id
WHERE u.email = 'oliver.queen@example.com'
  AND u.password_hash = SHA2('password123', 256)
  AND u.is_active = TRUE;

-- ----------------------------------------------------------------------------
-- 2. Patient Action: Book a New Doctor Appointment (Insert Visiting Details)
-- ----------------------------------------------------------------------------
INSERT INTO appointments (
    patient_id, 
    doctor_id, 
    appointment_date, 
    appointment_time, 
    status, 
    reason_for_visit, 
    consultation_fee
) VALUES (
    1,                                   -- patient_id (e.g. Oliver Queen)
    2,                                   -- doctor_id (Dr. Elena Rostova)
    '2026-10-25',                        -- desired date
    '10:30:00',                          -- desired time
    'Scheduled',                         -- initial status
    'Persistent tension headache after screen time',
    150.00                               -- doctor fee
);

-- ----------------------------------------------------------------------------
-- 3. Doctor Visiting Details: Retrieve Complete Visit History for a Specific Patient
-- Displays scheduled & completed visits, doctor notes, vitals, and fees
-- ----------------------------------------------------------------------------
SELECT 
    a.id AS appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    d.full_name AS doctor_name,
    d.specialization,
    d.department,
    a.reason_for_visit,
    a.doctor_notes,
    a.vitals_blood_pressure,
    a.vitals_heart_rate,
    a.vitals_temperature,
    a.consultation_fee
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
WHERE a.patient_id = 1
ORDER BY a.appointment_date DESC, a.appointment_time DESC;

-- ----------------------------------------------------------------------------
-- 4. Prescriptions: Retrieve All Prescriptions Issued to a Specific Patient
-- ----------------------------------------------------------------------------
SELECT 
    pr.id AS prescription_id,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    pr.instructions,
    pr.prescribed_date,
    d.full_name AS prescribed_by_doctor,
    d.specialization AS doctor_specialization,
    a.id AS visit_id,
    a.appointment_date AS visit_date
FROM prescriptions pr
JOIN doctors d ON pr.doctor_id = d.id
JOIN appointments a ON pr.appointment_id = a.id
WHERE pr.patient_id = 1
ORDER BY pr.prescribed_date DESC;

-- ----------------------------------------------------------------------------
-- 5. Doctor Action: Log Visit Notes, Vitals & Generate Prescription
-- (Demonstrating how visiting details & prescriptions are stored together)
-- ----------------------------------------------------------------------------
-- Step A: Doctor completes visit and records observation & vitals
UPDATE appointments 
SET 
    status = 'Completed',
    doctor_notes = 'Blood pressure is normalized. Continued improvement noted.',
    vitals_blood_pressure = '120/80',
    vitals_heart_rate = 72,
    vitals_temperature = 36.6
WHERE id = 3;

-- Step B: Doctor prescribes new medication stored in prescriptions table
INSERT INTO prescriptions (
    appointment_id,
    patient_id,
    doctor_id,
    medication_name,
    dosage,
    frequency,
    duration,
    instructions,
    prescribed_date
) VALUES (
    3,
    1,
    1,
    'Amlodipine Besylate',
    '5 mg',
    'Once daily in the morning',
    '30 days',
    'Take with water with or without food. Monitor pulse.',
    CURDATE()
);

-- ============================================================================
-- 6. Supabase Cloud PostgreSQL Queries (Run in Supabase SQL Editor)
-- ============================================================================

-- Query A: Inspect live users and verify SHA-256 password hash in Supabase
SELECT id, email, password_hash, role, created_at 
FROM users 
ORDER BY id ASC;

-- Query B: Verify patient login credentials with SHA-256
-- (In PostgreSQL, sha256 can be computed using digest(password, 'sha256') or matched with hex string)
SELECT u.id AS user_id, u.email, p.full_name, p.blood_group 
FROM users u
JOIN patients p ON u.id = p.user_id
WHERE u.email = 'oliver.queen@example.com'
  AND u.password_hash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

-- Query C: Retrieve all doctor visits and clinical records for a patient
SELECT 
    a.id AS appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    d.full_name AS doctor_name,
    d.specialization,
    a.reason_for_visit,
    a.doctor_notes,
    a.vitals_blood_pressure,
    a.vitals_heart_rate,
    a.vitals_temperature
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
WHERE a.patient_id = 1
ORDER BY a.appointment_date DESC;

-- Query D: Retrieve patient digital prescriptions with attending doctor details
SELECT 
    pr.id AS prescription_id,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    pr.instructions,
    pr.prescribed_date,
    d.full_name AS doctor_name,
    d.specialization
FROM prescriptions pr
JOIN doctors d ON pr.doctor_id = d.id
WHERE pr.patient_id = 1
ORDER BY pr.prescribed_date DESC;

