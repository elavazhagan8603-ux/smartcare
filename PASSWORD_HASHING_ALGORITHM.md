# PASSWORD HASHING ALGORITHM
### Patient Healthcare & Medical Record Portal Using SHA-256 with Salt
**Application Link:** [https://elavazhagan8603-ux.github.io/smartcare/](https://elavazhagan8603-ux.github.io/smartcare/)  
**GitHub Repository:** [https://github.com/elavazhagan8603-ux/smartcare](https://github.com/elavazhagan8603-ux/smartcare)

---

## 1. Introduction
This healthcare web application (**SmartCare**) demonstrates secure patient authentication and sensitive clinical record management using cryptographic password hashing with a unique random salt and the SHA-256 hash function. The browser's native **Web Crypto API** (`window.crypto.subtle`) performs the client-side cryptographic hashing. Instead of storing the patient's original plaintext password, the system stores only the cryptographically generated salt and the resulting hash in a relational cloud database (**Supabase PostgreSQL**) and local relational store. As a result, plaintext passwords are never stored or transmitted in unhashed form.

---

## 2. Algorithm Used
- **Algorithm:** SHA-256 (Secure Hash Algorithm, 256-bit) applied to `salt + password`.
- **Salt Length:** 16 bytes (128 bits), generated cryptographically using `crypto.getRandomValues()`.
- **Hash Output Length:** 256 bits (32 bytes), represented and stored as a **64-character hexadecimal string**.
- **One-Way Cryptographic Property:** SHA-256 is an irreversible one-way cryptographic hash function. While computing the digest from `salt + password` is instantaneous, reversing the 64-character hash back to the original password is computationally infeasible without brute force.
- **Production Context:** Plain SHA-256 is fast; therefore, enterprise healthcare backends typically incorporate key stretching like PBKDF2, bcrypt, or Argon2id. Salted SHA-256 is implemented here to clearly demonstrate standard cryptographic hashing primitives, protection against rainbow tables, and secure patient authentication.

---

## 3. What Is a Salt?
A salt is a cryptographically secure pseudo-random sequence of bytes added to the user's password prior to hashing. The salt is not a secret key and is stored openly alongside the resulting hash in the database. 

Because every patient receives a distinct, randomly generated salt upon registration:
1. **Prevents Rainbow Table Attacks:** Attackers cannot use precomputed tables of common password hashes.
2. **Defeats Duplicate Hashes:** If two patients choose the identical password (e.g., `"password123"`), their resulting hashes are completely different because their random salts are unique.
3. **Thwarts Mass Dictionary Attacks:** An attacker must crack each account individually rather than cracking identical hashes in bulk.

---

## 4. Registration Algorithm
1. Read the patient's legal name, email, contact details, medical background, and password.
2. Validate that mandatory fields are completed and the password has at least 6 characters.
3. Query the database to verify that the patient's email does not already exist.
4. Generate a cryptographically secure 16-byte (128-bit) random salt using `crypto.getRandomValues()`.
5. Concatenate the salt and the plaintext password (`salt + password`) and convert the combined string into bytes using `TextEncoder()`.
6. Compute the cryptographic digest using `crypto.subtle.digest("SHA-256", data)`.
7. Convert the 16-byte salt (32 hex characters) and the 32-byte digest (64 hex characters) into hexadecimal strings.
8. Persist the patient profile, `email`, `password_salt`, and `password_hash` in the database. The original password is discarded and never stored.

---

## 5. Login Verification Algorithm
1. Read the patient's email and password entered into the login form.
2. Look up the user record by email in the database; if no record exists, reject the login attempt.
3. Retrieve the stored `password_salt` and `password_hash` associated with the patient account.
4. Concatenate the retrieved `password_salt` with the candidate password entered by the user (`record.salt + entered_password`).
5. Hash the combined string using `SHA-256` via `crypto.subtle.digest()`.
6. Compare the newly computed candidate hash against the stored `password_hash`:
   - If both 64-character strings match identically, authenticate the patient, establish the session, and display their health dashboard.
   - If they do not match, reject access and display an invalid credentials warning.

---

## 6. Simplified Pseudocode

```text
REGISTRATION(email, password, patient_profile):
    IF LENGTH(password) < 6:
        RETURN "Password too short"
    IF USER_EXISTS(email):
        RETURN "Account already registered"
    
    salt = SECURE_RANDOM_BYTES(16)                     // 128-bit random salt
    hash = SHA256(salt + password)                      // 256-bit cryptographic hash
    SAVE_USER(email, salt, hash, patient_profile)      // Never save plaintext password
    RETURN "Registration Successful"

LOGIN(email, entered_password):
    record = LOAD_USER(email)
    IF record IS NULL:
        RETURN "User not found"
    
    candidate_hash = SHA256(record.salt + entered_password)
    IF candidate_hash == record.hash:
        SET_ACTIVE_SESSION(record.patient_id)
        RETURN "Login successful"
    ELSE:
        RETURN "Invalid email or password"
```

---

## 7. Important JavaScript Web Crypto & Storage Functions
- **`crypto.getRandomValues()`** — Generates cryptographically secure pseudo-random bytes for the unique per-user salt.
- **`crypto.subtle.digest("SHA-256", data)`** — Computes the standard 256-bit cryptographic SHA-256 digest of the combined salt and password bytes.
- **`TextEncoder()`** — Encodes the string input into standard UTF-8 binary bytes required by the Web Crypto API.
- **Supabase Cloud PostgreSQL Client SDK (`@supabase/supabase-js`)** — Securely manages cloud database queries, storing `password_salt` (VARCHAR 32) and `password_hash` (CHAR 64).
- **`localStorage` / `sessionStorage`** — Manages temporary active session tokens and local offline cache.

---

## 8. Integrated Patient Application Workflow
The salted SHA-256 hashing engine powers the complete **SmartCare** healthcare portal:
1. **Secure Patient Authentication:** Protects patient health credentials with unique per-account cryptographic salts.
2. **Doctor Discovery & Booking:** Authenticated patients browse verified specialists across Cardiology, Neurology, Pediatrics, and Dermatology, filter by medical symptoms, and book appointments.
3. **Digital Prescriptions (Rx):** Patients access digital prescriptions issued by attending doctors, with medication dosage, frequency, course duration, and printable prescription slips.
4. **Clinical History & Vitals:** Patients inspect historical consultation notes, diagnoses, and vital signs (blood pressure, heart rate, body temperature).
5. **Database & Security Inspector:** A built-in inspector allows auditors to verify that passwords in the `users` table are stored purely as irreversible 64-character hashes alongside their random salts.

---

## 9. Security Notes and Limitations
- **Educational & Demonstration Context:** This application illustrates client-side cryptographic hashing. In production enterprise architectures, password hashing and authentication should be verified on a trusted backend API server over TLS/HTTPS.
- **Algorithm Speed Considerations:** While SHA-256 is mathematically secure and irreversible, it is computationally fast. Production medical systems frequently adopt specialized password-hashing functions with configurable computational work factors (e.g., Argon2id, bcrypt, or PBKDF2 with 600,000+ iterations) to mitigate high-speed GPU brute-force attacks.
- **Salt Exposure:** Salts do not require encryption or secret storage; however, protecting the database through proper access control and Row Level Security (RLS) remains essential.
- **Session Protection:** Production healthcare platforms require HTTP-only secure cookies, rate limiting, and automated multi-factor authentication (MFA).

---

## 10. Conclusion
The **SmartCare** system utilizes SHA-256 with a unique 16-byte random salt per patient. During patient registration, the random salt is generated and prepended to the password before hashing; only the salt and the resulting 64-character hexadecimal digest are saved in the database. During login, the entered password is joined with the stored salt, re-hashed, and compared against the stored hash. This demonstrates the fundamental principles of salted cryptographic password storage, safeguarding patient accounts against rainbow tables and database breach leaks.

---

**Submitted By:**  
**Name:** [Your Name]  
**Roll No / Register No:** [Your Roll No]  
**GitHub Profile:** [https://github.com/elavazhagan8603-ux](https://github.com/elavazhagan8603-ux)  
