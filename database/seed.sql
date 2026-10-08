-- ============================================================================
-- SmartCare: Relational Seed Data
-- Test patients with SHA-256 encrypted password hashes, visiting history, and prescriptions
-- Test Credentials:
--   1. oliver.queen@example.com / password123
--   2. clara.oswald@example.com / patient123
--   3. bruce.wayne@example.com   / password123
-- ============================================================================

USE smartcare_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE prescriptions;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Users (All passwords stored as 64-character SHA-256 hashes)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, is_active) VALUES
(1, 'oliver.queen@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'patient', TRUE),
(2, 'clara.oswald@example.com', 'd4587ea9ead060c13fd994f21ecfa7926272a78854a2c20136b10a3c9e53e71e', 'patient', TRUE),
(3, 'bruce.wayne@example.com',   'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'patient', TRUE);

-- ----------------------------------------------------------------------------
-- 2. Patients Profile
-- ----------------------------------------------------------------------------
INSERT INTO patients (id, user_id, full_name, email, phone, date_of_birth, gender, blood_group, emergency_contact, allergies) VALUES
(1, 1, 'Oliver Queen', 'oliver.queen@example.com', '+1-555-4421', '1985-05-16', 'Male', 'O+', 'Thea Queen (+1-555-4429)', 'Penicillin, Shellfish'),
(2, 2, 'Clara Oswald', 'clara.oswald@example.com', '+1-555-8812', '1992-11-23', 'Female', 'A+', 'Danny Pink (+1-555-8819)', 'Sulfa antibiotics'),
(3, 3, 'Bruce Wayne',   'bruce.wayne@example.com',   '+1-555-9000', '1982-02-19', 'Male', 'AB-', 'Alfred Pennyworth (+1-555-9001)', 'None');

-- ----------------------------------------------------------------------------
-- 3. Doctors Available for Consultations
-- ----------------------------------------------------------------------------
INSERT INTO doctors (id, full_name, specialization, department, license_number, consultation_fee, phone, availability_days, bio) VALUES
(1, 'Dr. Alexander Vance', 'Interventional Cardiology', 'Cardiology', 'MD-CARD-7891', 120.00, '+1-555-0192', 'Mon, Wed, Fri', 'Chief of Cardiology specializing in coronary artery health, hypertension, and preventive cardiology.'),
(2, 'Dr. Elena Rostova', 'Consultant Neurologist', 'Neurology', 'MD-NEUR-4523', 150.00, '+1-555-0184', 'Tue, Thu, Sat', 'Specialist in migraine pathology, cognitive wellness, neuropathy, and advanced neural diagnostics.'),
(3, 'Dr. Marcus Sterling', 'Pediatric Specialist', 'Pediatrics', 'MD-PED-6712', 90.00, '+1-555-0133', 'Mon, Tue, Wed, Thu', 'Compassionate pediatric medicine, childhood allergies, and developmental care.'),
(4, 'Dr. Sarah Jenkins', 'Primary Care & Internal Medicine', 'General Medicine', 'MD-GEN-3389', 75.00, '+1-555-0177', 'Mon, Tue, Wed, Fri', 'Specializes in comprehensive wellness exams, diabetes management, and chronic preventative care.'),
(5, 'Dr. Sophia Reyes', 'Clinical Dermatologist', 'Dermatology', 'MD-DERM-5521', 110.00, '+1-555-0145', 'Wed, Thu, Fri', 'Dermatologic surgery, eczema treatment, allergic contact dermatitis, and skin health.');

-- ----------------------------------------------------------------------------
-- 4. Doctor Visiting Details (Appointments)
-- ----------------------------------------------------------------------------
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason_for_visit, doctor_notes, vitals_blood_pressure, vitals_heart_rate, vitals_temperature, consultation_fee) VALUES
-- Past Completed Visits for Oliver Queen (Patient 1)
(1, 1, 1, '2026-09-28', '10:00:00', 'Completed', 'Chest tightness during high-intensity cardio exercises', 'ECG indicates mild sinus tachycardia with normal repolarization. Advised hydration and temporary moderation in intense cardio. Medication prescribed.', '124/82', 78, 36.6, 120.00),
(2, 1, 4, '2026-08-15', '14:30:00', 'Completed', 'Annual routine preventative health checkup', 'Routine vitals are optimal. Cholesterol levels within healthy limits. Recommended daily Vitamin D3 supplement.', '118/76', 68, 36.7, 75.00),
-- Scheduled Upcoming Visit for Oliver Queen (Patient 1)
(3, 1, 1, '2026-10-14', '11:15:00', 'Scheduled', 'Follow-up consultation on cardiovascular endurance and BP monitoring', NULL, NULL, NULL, NULL, 120.00),

-- Visits for Clara Oswald (Patient 2)
(4, 2, 2, '2026-10-02', '09:30:00', 'Completed', 'Recurrent vestibular migraines with visual sensitivity', 'Patient presented with tension-induced migraine episodes. Neurological exam negative for focal deficits. Prescribed prophylaxis.', '115/74', 72, 36.8, 150.00),
(5, 2, 5, '2026-10-18', '15:00:00', 'Scheduled', 'Skin rash consultation and allergy patch evaluation', NULL, NULL, NULL, NULL, 110.00);

-- ----------------------------------------------------------------------------
-- 5. Prescriptions Given by Doctors (Stored in Database)
-- ----------------------------------------------------------------------------
INSERT INTO prescriptions (id, appointment_id, patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, prescribed_date) VALUES
-- Prescriptions for Oliver Queen (linked to Visit 1)
(1, 1, 1, 1, 'Metoprolol Tartrate', '25 mg', 'Once daily in the morning', '30 days', 'Take with meals. Check resting pulse rate before morning dose.', '2026-09-28'),
(2, 1, 1, 1, 'CoQ10 Cardiovascular Complex', '100 mg', 'Once daily with food', '60 days', 'Supports cellular energy and heart muscle function.', '2026-09-28'),
-- Prescriptions for Oliver Queen (linked to Visit 2)
(3, 2, 1, 4, 'Cholecalciferol (Vitamin D3)', '2000 IU', 'Once daily in the morning', '90 days', 'Take after breakfast for maximum absorption.', '2026-08-15'),

-- Prescriptions for Clara Oswald (linked to Visit 4)
(4, 4, 2, 2, 'Sumatriptan Succinate', '50 mg', 'As needed at migraine onset', '10 tablets', 'Take 1 tablet at initial onset of migraine aura. Do not exceed 200mg in 24 hours.', '2026-10-02'),
(5, 4, 2, 2, 'Magnesium Glycinate', '400 mg', 'Once nightly before sleep', '60 days', 'Promotes neural relaxation and aids migraine prophylaxis.', '2026-10-02');
