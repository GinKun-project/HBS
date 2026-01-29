# HOTEL BOOKING SYSTEM - COMPREHENSIVE DOCUMENTATION

## TABLE OF CONTENTS
1. [Abstract](#abstract)
2. [Introduction & System Design](#introduction--system-design)
3. [System Architecture](#system-architecture)
4. [Software Details](#software-details)
5. [Security by Design Principles](#security-by-design-principles)
6. [The Checklist - Web App Features](#the-checklist---web-app-features)
7. [Making the System Secure](#making-the-system-secure)
8. [Conclusion](#conclusion)
9. [References](#references)
10. [Appendix](#appendix)

---

## ABSTRACT

The Hotel Booking System is a full-stack web application designed with security as a foundational principle rather than an afterthought. This system implements industry-standard security practices across authentication, authorization, data protection, and audit logging. The platform facilitates secure hotel reservations while protecting sensitive user information through encryption, multi-factor authentication (MFA), and role-based access control (RBAC). This documentation details the architectural decisions, security implementations, and operational guidelines that ensure a robust and secure booking platform.

---

## INTRODUCTION & SYSTEM DESIGN

### Overview
The Hotel Booking System is a modern web application that enables users to:
- Browse available hotels and rooms
- Create accounts with strong password requirements
- Book hotel rooms with secure payment processing
- Manage user profiles and booking history
- Access administrative features (admin role)

The system prioritizes **security by design**, implementing multiple layers of protection to safeguard user data and maintain system integrity.

### Design Philosophy
Security is not bolted on as an afterthought but is embedded throughout the system:
- **Defense in Depth**: Multiple security layers protect against various attack vectors
- **Least Privilege**: Users and services have minimal necessary permissions
- **Fail Secure**: Errors default to secure states
- **Encryption by Default**: Sensitive data is encrypted at rest and in transit
- **Audit Everything**: All critical actions are logged and traceable

---

## SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER (React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Login | Signup | MFA | Dashboard | Hotels | Booking │  │
│  │         Profile | Admin | Rate Limiting              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
              HTTPS + CSRF Protection + Input Validation
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  API SERVER TIER (Node.js/Express)          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Authentication | Authorization | Rate Limiting       │  │
│  │ Validation | RBAC | Audit Logging | Error Handling   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
         Database Queries + Password Hashing + Encryption
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│               DATABASE TIER (MongoDB)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Users | Hotels | Rooms | Bookings | Payments         │  │
│  │ Audit Logs | Encrypted Fields                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Layers

#### 1. Frontend Layer (React + Vite)
- **Framework**: React with React Router for navigation
- **HTTP Client**: Axios with custom interceptors
- **Features**: 
  - Form validation before submission
  - Input sanitization
  - Rate limiting on client-side
  - Protected routes based on authentication status
  - Role-based route protection
  - Toast notifications for user feedback

#### 2. API Server Layer (Node.js + Express)
- **Framework**: Express.js for HTTP routing
- **Features**:
  - JWT-based authentication
  - Multi-factor authentication (OTP-based)
  - Role-based access control
  - CSRF protection
  - Rate limiting per endpoint
  - Input validation and sanitization
  - Audit logging
  - Error handling middleware

#### 3. Database Layer (MongoDB)
- **Structure**: Document-based storage with encryption for sensitive fields
- **Collections**: Users, Hotels, Rooms, Bookings, Payments, AuditLogs
- **Security**: 
  - Indexed for performance
  - Data validation at schema level
  - Encrypted fields for PII

---

## SOFTWARE DETAILS

### Technology Stack

#### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB 5+
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Validation**: joi, express-validator
- **Security**: helmet, bcrypt, crypto
- **Logging**: Custom logger module
- **Rate Limiting**: express-rate-limit

#### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 7+
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: CSS3 with custom utility classes
- **Password Strength**: Custom meter component

### Directory Structure

```
hotel-booking-system/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── api/
│   │   │   ├── index.js            # API endpoint definitions
│   │   │   └── http.js             # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleRoute.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── PasswordStrengthMeter.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── MFA.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Hotels.jsx
│   │   │   ├── HotelDetails.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Admin.jsx
│   │   ├── utils/
│   │   │   ├── rateLimiter.js
│   │   │   └── useRateLimit.js
│   │   ├── styles/
│   │   └── App.jsx
│   └── index.html
│
├── server/                          # Backend Node.js application
│   ├── src/
│   │   ├── app.js                  # Express app setup
│   │   ├── server.js               # Server entry point
│   │   ├── config/
│   │   │   ├── db.js               # Database connection
│   │   │   └── env.js              # Environment configuration
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication
│   │   │   ├── csrf.js             # CSRF protection
│   │   │   ├── errorHandler.js     # Error handling
│   │   │   ├── rateLimit.js        # Rate limiting
│   │   │   ├── rbac.js             # Role-based access control
│   │   │   └── validate.js         # Input validation
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Hotel.js
│   │   │   ├── Room.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── hotel.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── admin.routes.js
│   │   ├── utils/
│   │   │   ├── crypto.js           # Encryption/decryption
│   │   │   ├── logger.js           # Audit logging
│   │   │   ├── passwordPolicy.js   # Password validation
│   │   │   └── overlapCheck.js     # Booking overlap detection
│   │   └── scripts/
│   │       └── seed.js             # Database seeding
│   └── package.json
│
├── DOCUMENTATION.md                 # This file
├── README.md                        # Quick start guide
└── RATE_LIMIT_SOLUTION.md          # Rate limiting specifications
```

---

## SECURITY BY DESIGN PRINCIPLES

### 1. Authentication & Authorization
- **Multi-Factor Authentication**: OTP-based MFA for all user accounts
- **JWT Tokens**: Secure token-based session management
- **Role-Based Access Control**: Different permission levels (user, admin)
- **Account Lockout**: Automatic lockout after failed login attempts
- **Password Policy**: Strong password requirements enforced

### 2. Data Protection
- **Encryption at Rest**: Sensitive fields (phone numbers) encrypted in database
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Password Hashing**: bcrypt with salt rounds for password storage
- **Sensitive Data Handling**: No passwords/sensitive data in logs

### 3. Input Validation & Sanitization
- **Server-Side Validation**: All inputs validated against schemas
- **Client-Side Validation**: Early feedback for user experience
- **Sanitization**: Input cleaned to prevent XSS and injection attacks
- **Type Checking**: Strict type validation using joi

### 4. Access Control
- **Protected Routes**: Frontend routes require authentication
- **API Authorization**: Backend routes check user roles
- **Resource Ownership**: Users can only access their own data
- **Admin Only**: Certain routes restricted to admin role

### 5. Session Management
- **Access Token Expiry**: 15-minute access token lifespan
- **Refresh Token Expiry**: 7-day refresh token lifespan
- **HttpOnly Cookies**: Tokens stored securely (no JavaScript access)
- **Secure Flags**: Cookies sent only over HTTPS
- **SameSite Policy**: Strict CSRF protection

### 6. Audit & Logging
- **Comprehensive Logging**: All critical actions logged
- **Immutable Logs**: Audit logs stored separately
- **User Tracking**: IP address, user agent captured
- **Action Details**: Specific reasons for failures recorded

### 7. Defense Against Common Attacks
- **CSRF Protection**: Double-submit cookie pattern
- **XSS Prevention**: Input sanitization, CSP headers
- **SQL Injection**: Parameterized queries via MongoDB
- **Brute Force**: Rate limiting and account lockout
- **Session Hijacking**: HttpOnly, Secure, SameSite cookie flags

---

## THE CHECKLIST - WEB APP FEATURES

### Web Application Features

#### ✓ User Authentication
- [x] Signup with email/password
- [x] Login with OTP verification
- [x] Password strength requirements
- [x] Account lockout on failed attempts
- [x] Password history tracking
- [x] Password expiration enforcement

#### ✓ Multi-Factor Authentication (MFA)
- [x] OTP generation and delivery
- [x] OTP validation (6-digit format)
- [x] OTP expiration (10 minutes)
- [x] Retry limits with lockout
- [x] Separate MFA endpoint

#### ✓ User Management
- [x] User profiles with personal details
- [x] Phone number encryption
- [x] Profile update functionality
- [x] Password change with history
- [x] Account deletion

#### ✓ Hotel & Room Management
- [x] Browse hotels with filters
- [x] View detailed hotel information
- [x] Browse rooms per hotel
- [x] Room availability checking
- [x] Room pricing and amenities

#### ✓ Booking System
- [x] Create bookings with date range
- [x] Check-in/check-out validation
- [x] Overlap detection (no double bookings)
- [x] Booking confirmation
- [x] Booking cancellation
- [x] Booking history

#### ✓ Payment Processing
- [x] Booking payment integration
- [x] Payment status tracking
- [x] Transaction history
- [x] Payment details logging

#### ✓ Administrative Features
- [x] Admin dashboard
- [x] Hotel management (CRUD)
- [x] Room management (CRUD)
- [x] Booking overview
- [x] User statistics
- [x] Audit log viewing

#### ✓ Security Features
- [x] HTTPS/TLS encryption
- [x] CSRF protection
- [x] Input sanitization
- [x] Rate limiting
- [x] Session management
- [x] Audit logging
- [x] Role-based access control
- [x] Account lockout mechanism
- [x] Password hashing (bcrypt)
- [x] Encrypted user information

### Feature Implementation Details

#### PASSWORD
**Requirements:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common patterns (123456, password, etc.)

**Storage:**
- Hashed with bcrypt (12 salt rounds)
- Never stored in plaintext
- Password history maintained (up to 5 previous)
- Cannot reuse previous passwords

#### AUDIT TRAIL
**Logged Events:**
- User signup/registration
- Login attempts (success/failure)
- MFA verification attempts
- Password changes
- Profile updates
- Booking creation/cancellation
- Admin actions

**Captured Information:**
- User ID (when applicable)
- IP address
- User agent
- Timestamp
- Action type
- Success/failure status
- Failure reason (if applicable)
- Additional metadata

#### USER ACCESS LEVEL
**Two-tier role system:**

1. **User Role**
   - Browse hotels and rooms
   - Create bookings
   - View own bookings
   - Manage own profile
   - Change own password

2. **Admin Role**
   - All user permissions
   - Create/update/delete hotels
   - Create/update/delete rooms
   - View all bookings
   - View audit logs
   - Access admin dashboard
   - View system statistics

#### SESSION MANAGEMENT
**Token Strategy:**
- **Access Token**: 15-minute expiration
  - Issued after successful MFA
  - Contains user ID, email, role
  - Stored in HttpOnly cookie
  - Used for API authorization

- **Refresh Token**: 7-day expiration
  - Issued after successful MFA
  - Single token per user (rotation)
  - Stored in HttpOnly cookie
  - Used to obtain new access tokens

**Cookie Settings:**
- HttpOnly: True (no JavaScript access)
- Secure: True (HTTPS only)
- SameSite: Strict (CSRF protection)
- Domain: Same-origin only

#### ENCRYPTED USER INFORMATION
**Fields Encrypted at Rest:**
- Phone numbers (customer contact info)

**Encryption Method:**
- Algorithm: AES-256-GCM
- Key Management: Environment variable
- IV/Nonce: Generated per encryption
- Authenticated encryption: GCM mode

**Encryption Process:**
```
User Input → Validation → Encryption → Database Storage
Database Retrieval → Decryption → User Output
```

#### EXTRA MEASURES
- **Helmet.js**: Security HTTP headers
- **CORS**: Configured for specific origins
- **Request Size Limits**: 10MB max payload
- **Error Messages**: Generic to prevent information leakage
- **Timing Attacks**: bcrypt inherently resistant
- **Lockout Duration**: 15 minutes after 5 failed attempts

---

## MAKING THE SYSTEM SECURE

### PASSWORD SECURITY IMPLEMENTATION

#### 1. Password Requirements Enforcement
```javascript
// Server-side validation
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 12) 
    errors.push('Password must be at least 12 characters');
  if (!/[A-Z]/.test(password)) 
    errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) 
    errors.push('Password must contain lowercase letter');
  if (!/\d/.test(password)) 
    errors.push('Password must contain number');
  if (!/[!@#$%^&*]/.test(password)) 
    errors.push('Password must contain special character');
    
  return { isValid: errors.length === 0, errors };
};
```

#### 2. Password Hashing
```javascript
// Pre-save middleware
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = Date.now();
});
```

#### 3. Password Comparison
```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

#### 4. Password History
```javascript
// Prevent reusing previous passwords
const isNewPassword = !user.passwordHistory.some(oldHash => 
  bcrypt.compareSync(newPassword, oldHash)
);
```

#### 5. Password Expiration
```javascript
// Check password age
const MAX_PASSWORD_AGE = 90; // days
const isPasswordExpired = (lastChangeDate) => {
  const daysSinceChange = (Date.now() - lastChangeDate) / (1000 * 60 * 60 * 24);
  return daysSinceChange > MAX_PASSWORD_AGE;
};
```

### AUDIT TRAIL IMPLEMENTATION

#### 1. Audit Log Model
```javascript
const auditLogSchema = new mongoose.Schema({
  action: String,          // LOGIN_SUCCESS, SIGNUP_FAILED, etc.
  userId: ObjectId,        // User performing action (optional)
  ipAddress: String,       // Client IP
  userAgent: String,       // Browser/client info
  metadata: Object,        // Additional context
  status: String,          // 'success' or 'failure'
  createdAt: { type: Date, default: Date.now }
});

// Index for fast queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
```

#### 2. Logging Function
```javascript
const logAudit = async (auditData) => {
  try {
    await AuditLog.create({
      action: auditData.action,
      userId: auditData.userId || null,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      metadata: auditData.metadata,
      status: auditData.status,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't break application flow if logging fails
  }
};
```

#### 3. Helper Functions
```javascript
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.socket.remoteAddress;
};

const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};
```

#### 4. Audit Events
```javascript
// Signup attempt
await logAudit({
  action: 'SIGNUP_FAILED',
  ipAddress: getIpAddress(req),
  userAgent: getUserAgent(req),
  metadata: { email, reason: 'Email already exists' },
  status: 'failure'
});

// Login attempt
await logAudit({
  action: 'LOGIN_FAILED',
  userId: user._id,
  ipAddress: getIpAddress(req),
  userAgent: getUserAgent(req),
  metadata: { email, reason: 'Invalid password' },
  status: 'failure'
});

// MFA verification
await logAudit({
  action: 'MFA_VERIFICATION_SUCCESS',
  userId: user._id,
  ipAddress: getIpAddress(req),
  userAgent: getUserAgent(req),
  metadata: { email },
  status: 'success'
});
```

### USER AUTHENTICATION IMPLEMENTATION

#### 1. Signup Flow
```
User Input (email, password, name)
    ↓
Client-side validation
    ↓
Server receives /auth/signup POST
    ↓
Validate against schema (joi)
    ↓
Check password strength
    ↓
Check email uniqueness
    ↓
Encrypt phone number (if provided)
    ↓
Create user with plain password
    ↓
Pre-save middleware hashes password
    ↓
Store password history
    ↓
Generate 6-digit OTP
    ↓
Hash OTP with bcrypt
    ↓
Store OTP hash with 10-minute expiry
    ↓
Display OTP to console (dev only)
    ↓
Return MFA required response
    ↓
Client redirects to /mfa page
```

#### 2. Login Flow
```
User Input (email, password)
    ↓
Client-side validation
    ↓
Server receives /auth/login POST
    ↓
Validate against schema
    ↓
Fetch user by email
    ↓
Check if account locked (5+ failed attempts)
    ↓
Compare password with bcrypt
    ↓
If invalid, increment login attempts
    ↓
If account unlocks, reset counter
    ↓
Generate OTP for MFA
    ↓
Return MFA required response
    ↓
Client redirects to /mfa page
```

#### 3. MFA Verification
```
User Input (OTP)
    ↓
Server receives /auth/verify-mfa POST
    ↓
Fetch user by email
    ↓
Check OTP expiration
    ↓
Compare OTP with hash
    ↓
If invalid, increment login attempts
    ↓
If valid, clear OTP hash
    ↓
Generate JWT access token (15 min)
    ↓
Generate JWT refresh token (7 day)
    ↓
Set HttpOnly cookies
    ↓
Reset login attempts counter
    ↓
Log success audit event
    ↓
Return user data
    ↓
Client redirects to /dashboard
```

#### 4. Token Refresh
```
Client requests /auth/refresh with refreshToken cookie
    ↓
Verify refresh token signature
    ↓
Fetch user from database
    ↓
Check if token matches stored token
    ↓
If mismatch (token theft), reject
    ↓
Generate new access token
    ↓
Generate new refresh token (rotation)
    ↓
Update stored refresh token
    ↓
Set new cookies
    ↓
Return success
```

#### 5. Protected Routes
```javascript
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    
    const user = await User.findById(decoded.userId)
      .select('-password -passwordHistory -refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.isLocked) {
      return res.status(403).json({
        message: 'Account is locked due to failed login attempts',
        lockUntil: user.lockUntil
      });
    }
    
    if (isPasswordExpired(user.lastPasswordChange)) {
      user.passwordExpired = true;
      await user.save();
      return res.status(403).json({
        message: 'Password has expired. Please change your password.',
        passwordExpired: true
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT errors...
  }
};
```

### SESSION MANAGEMENT IMPLEMENTATION

#### 1. Token Structure
```javascript
// Access Token Payload
{
  userId: ObjectId,
  email: string,
  role: 'user' | 'admin',
  iat: number,  // issued at
  exp: number   // expires at (15 minutes)
}

// Refresh Token Payload
{
  userId: ObjectId,
  iat: number,
  exp: number   // expires at (7 days)
}
```

#### 2. Cookie Configuration
```javascript
// Access Token Cookie
res.cookie('accessToken', accessToken, {
  httpOnly: true,           // No JavaScript access
  secure: config.nodeEnv === 'production',  // HTTPS only
  sameSite: 'strict',       // CSRF protection
  maxAge: 15 * 60 * 1000,   // 15 minutes
  path: '/',
  domain: undefined         // Same-origin only
});

// Refresh Token Cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/',
  domain: undefined
});
```

#### 3. Client-Side Axios Interceptor
```javascript
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt token refresh
        await http.post('/auth/refresh');
        // Retry original request with new token
        return http(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        if (!isAlreadyOnLoginPage()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### 4. Token Rotation
```javascript
// On each refresh, old refresh token is invalidated
user.refreshToken = newRefreshToken;  // Replace old token
await user.save();

// If attacker tries to use old token later, it won't match
```

#### 5. Logout Implementation
```javascript
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token in database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    
    // Clear cookies on client
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    // Log the action
    await logAudit({
      action: 'LOGOUT',
      userId: req.user._id,
      status: 'success'
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    // Handle error...
  }
});
```

### ENCRYPTED INFORMATION IMPLEMENTATION

#### 1. Encryption Utility
```javascript
const crypto = require('crypto');
const config = require('../config/env');

const algorithm = 'aes-256-gcm';
const key = Buffer.from(config.encryption.key, 'hex');

const encrypt = (text) => {
  if (!text) return null;
  
  const iv = crypto.randomBytes(12);  // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: IV + authTag + encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  
  const [iv, authTag, encrypted] = encryptedData.split(':');
  
  const decipher = crypto.createDecipheriv(
    algorithm, 
    key, 
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

#### 2. Usage in User Model
```javascript
// Before save: encrypt phone number
userSchema.pre('save', async function() {
  if (this.isModified('phoneNumber') && this.phoneNumber) {
    const { encrypt } = require('../utils/crypto');
    this.phoneNumber = encrypt(this.phoneNumber);
  }
});

// In routes: decrypt when returning
let phoneNumber = null;
if (req.user.phoneNumber) {
  const { decrypt } = require('../utils/crypto');
  phoneNumber = decrypt(req.user.phoneNumber);
}
```

#### 3. Database Storage
```javascript
// Stored in database:
phoneNumber: "a1b2c3d4e5:f6g7h8i9j0:encrypted_hex_string"

// Retrieved and decrypted:
phoneNumber: "+1-555-0123"
```

### EXTRA SECURITY FEATURES IMPLEMENTATION

#### 1. FRONTEND AND BACKEND IN HTTPS

**Server Configuration:**
```javascript
// In production, ensure:
- SSL/TLS certificates from valid CA
- HSTS header set (1 year, includeSubDomains)
- Secure cookies (secure: true)
- Redirect HTTP to HTTPS
```

**Helmet.js Security Headers:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,      // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
}));
```

**CORS Configuration:**
```javascript
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:5173',
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Requested-With']
}));
```

#### 2. INPUT SANITIZATION

**Joi Schema Validation:**
```javascript
const loginSchema = joi.object({
  email: joi
    .string()
    .email()
    .lowercase()
    .trim()
    .required(),
  password: joi
    .string()
    .min(12)
    .required()
});

const signupSchema = joi.object({
  email: joi
    .string()
    .email()
    .lowercase()
    .trim()
    .required(),
  password: joi
    .string()
    .min(12)
    .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .required(),
  fullName: joi
    .string()
    .trim()
    .max(100)
    .required(),
  phoneNumber: joi
    .string()
    .pattern(/^[\d\-\+\s()]+$/)
    .optional()
});
```

**Middleware Validation:**
```javascript
const { validate, schemas } = require('../middleware/validate');

router.post('/login', 
  validate(schemas.login),  // Validate before processing
  async (req, res) => {
    // req.body is guaranteed valid here
  }
);
```

**Input Sanitization Middleware:**
```javascript
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '')  // Remove scripts
        .replace(/[<>]/g, '');  // Remove tags
    }
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = sanitize(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

app.use(sanitizeInput);
```

#### 3. RECAPTCHA (Optional Enhancement)

**Frontend Integration:**
```jsx
import ReCAPTCHA from "react-google-recaptcha";

function LoginForm() {
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  
  const handleRecaptcha = (token) => {
    setRecaptchaToken(token);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      alert('Please complete reCAPTCHA');
      return;
    }
    
    try {
      await authAPI.login({
        email: formData.email,
        password: formData.password,
        recaptchaToken
      });
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <ReCAPTCHA
        sitekey="YOUR_RECAPTCHA_SITE_KEY"
        onChange={handleRecaptcha}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Backend Verification:**
```javascript
const axios = require('axios');

router.post('/login', async (req, res) => {
  const { email, password, recaptchaToken } = req.body;
  
  // Verify reCAPTCHA
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: config.recaptcha.secretKey,
          response: recaptchaToken
        }
      }
    );
    
    if (!response.data.success || response.data.score < 0.5) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'reCAPTCHA error' });
  }
  
  // Continue with login...
});
```

#### 4. TOAST NOTIFICATIONS

**Client-Side Implementation:**
```jsx
import { useToast } from '../components/Toast';

function BookingForm() {
  const { showSuccess, showError, showWarning } = useToast();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await bookingAPI.createBooking(bookingData);
      showSuccess('Booking created successfully!');
      // Redirect...
    } catch (error) {
      showError(error.response?.data?.message || 'Booking failed');
    }
  };
  
  return (
    // Form JSX
  );
}
```

**Toast Component:**
```jsx
import React, { useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = React.createContext();

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);
  
  const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
  const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  
  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

**CSS Styling:**
```css
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 4px;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  background-color: #4caf50;
  color: white;
}

.toast-error {
  background-color: #f44336;
  color: white;
}

.toast-warning {
  background-color: #ff9800;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## CONCLUSION

The Hotel Booking System demonstrates that comprehensive security implementation is not only possible but essential in modern web applications. By integrating security principles at every layer—from authentication and authorization to data encryption and audit logging—the system provides robust protection against common threats while maintaining an excellent user experience.

### Key Achievements

1. **Multi-layered Protection**: Security implemented at frontend, API, and database levels
2. **User Data Protection**: Encryption of sensitive information and secure password storage
3. **Access Control**: Role-based permissions and resource ownership validation
4. **Audit Trail**: Complete logging of all critical actions for accountability
5. **Compliance Ready**: Patterns following OWASP Top 10 and security best practices
6. **User Experience**: Security features transparent to end users

### Security Posture Summary

| Category | Implementation | Status |
|----------|----------------|--------|
| Authentication | MFA + JWT | ✓ Complete |
| Authorization | RBAC | ✓ Complete |
| Encryption | AES-256-GCM at rest, TLS in transit | ✓ Complete |
| Password Policy | 12+ chars with complexity | ✓ Complete |
| Input Validation | Server-side schema validation | ✓ Complete |
| CSRF Protection | Double-submit cookie | ✓ Complete |
| Session Management | HttpOnly, Secure, SameSite cookies | ✓ Complete |
| Audit Logging | Immutable audit trails | ✓ Complete |
| Rate Limiting | Endpoint-based limits | ✓ Implemented |
| Account Lockout | After 5 failed attempts | ✓ Complete |

### Recommendations for Production

1. **SSL/TLS Certificates**: Use certificates from trusted CA (Let's Encrypt free option available)
2. **Environment Variables**: Secure storage of encryption keys and secrets
3. **Database Backups**: Regular encrypted backups with offline storage
4. **Monitoring**: Log aggregation and real-time alerting for security events
5. **Incident Response**: Document and practice incident response procedures
6. **Security Updates**: Regular patching of dependencies
7. **Penetration Testing**: Annual security audits by qualified professionals
8. **User Education**: Train users on security best practices and phishing awareness

---

## REFERENCES

### Security Standards & Frameworks
1. OWASP Top 10 - 2021 (https://owasp.org/Top10/)
2. OWASP Authentication Cheat Sheet
3. NIST Cybersecurity Framework
4. CWE/SANS Top 25 Most Dangerous Software Weaknesses

### Libraries & Technologies
1. **bcrypt** - Password hashing (https://github.com/kelektiv/node.bcrypt.js)
2. **jsonwebtoken** - JWT implementation (https://github.com/auth0/node-jsonwebtoken)
3. **Helmet.js** - Security headers (https://helmetjs.github.io/)
4. **joi** - Schema validation (https://joi.dev/)
5. **express-rate-limit** - Rate limiting (https://github.com/nfriedly/express-rate-limit)
6. **crypto** - Node.js built-in encryption module

### Best Practice Guides
1. RFC 7519 - JSON Web Token (JWT) Specification
2. RFC 6265 - HTTP State Management Mechanism (Cookies)
3. RFC 7231 - HTTP/1.1 Semantics and Content
4. OWASP Session Management Cheat Sheet
5. OWASP Password Storage Cheat Sheet
6. OWASP Authorization Cheat Sheet

---

## APPENDIX

### A. Environment Configuration Template

**`.env` file structure:**
```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/hotel-booking-system

# JWT Secrets (generate with: openssl rand -hex 32)
JWT_ACCESS_SECRET=your_secret_key_here_32_chars_min
JWT_REFRESH_SECRET=your_secret_key_here_32_chars_min
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Encryption Key (256-bit = 32 bytes = 64 hex chars)
ENCRYPTION_KEY=your_encryption_key_64_hex_chars

# Security
CORS_ORIGIN=http://localhost:5173
SECURE_COOKIES=false  # Set to true in production with HTTPS

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Session
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
PASSWORD_EXPIRY_DAYS=90

# Email (if implementing email OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# reCAPTCHA (optional)
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

### B. Database Seed Script

**`server/src/scripts/seed.js`:**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const config = require('../config/env');

async function seedDatabase() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      Room.deleteMany({})
    ]);
    
    // Create admin user
    const adminUser = new User({
      email: 'admin@hotel.com',
      password: 'Admin@123456',
      fullName: 'Admin User',
      role: 'admin',
      mfaEnabled: false
    });
    await adminUser.save();
    console.log('Admin user created: admin@hotel.com / Admin@123456');
    
    // Create regular user
    const regularUser = new User({
      email: 'user@example.com',
      password: 'User@1234567',
      fullName: 'John Doe',
      role: 'user',
      mfaEnabled: false
    });
    await regularUser.save();
    console.log('User created: user@example.com / User@1234567');
    
    // Create hotels
    const hotels = await Hotel.create([
      {
        name: 'Grand Plaza Hotel',
        description: 'Luxury 5-star hotel in the city center',
        location: 'Downtown',
        pricePerNight: 250
      },
      {
        name: 'Seaside Resort',
        description: 'Beachfront resort with ocean views',
        location: 'Beach Area',
        pricePerNight: 200
      }
    ]);
    
    // Create rooms
    for (const hotel of hotels) {
      await Room.create([
        {
          hotelId: hotel._id,
          roomNumber: '101',
          type: 'Single',
          capacity: 1,
          pricePerNight: 120,
          amenities: ['WiFi', 'AC', 'TV']
        },
        {
          hotelId: hotel._id,
          roomNumber: '202',
          type: 'Double',
          capacity: 2,
          pricePerNight: 180,
          amenities: ['WiFi', 'AC', 'TV', 'Jacuzzi']
        }
      ]);
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
```

### C. API Endpoint Reference

#### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/verify-mfa` - Verify OTP
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

#### User Endpoints
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password

#### Hotel Endpoints
- `GET /api/hotels` - List all hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/:id/rooms` - Get hotel rooms

#### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/cancel` - Cancel booking

#### Admin Endpoints
- `POST /api/admin/hotels` - Create hotel
- `PUT /api/admin/hotels/:id` - Update hotel
- `DELETE /api/admin/hotels/:id` - Delete hotel
- `GET /api/admin/bookings` - View all bookings
- `GET /api/admin/stats` - Get statistics

### D. Common Security Checklist for Deployment

- [ ] All sensitive keys stored in environment variables
- [ ] HTTPS/TLS enabled with valid certificates
- [ ] CORS properly configured for production domain
- [ ] Rate limiting configured and active
- [ ] Input validation enabled on all endpoints
- [ ] CSRF protection tokens implemented
- [ ] Database backups automated and tested
- [ ] Logging and monitoring configured
- [ ] Security headers (CSP, HSTS, X-Frame-Options) set
- [ ] Dependencies updated to latest secure versions
- [ ] SQL injection prevention verified (using parameterized queries)
- [ ] XSS prevention tested
- [ ] Sensitive data excluded from logs
- [ ] Error messages don't leak information
- [ ] Encryption keys rotated periodically
- [ ] Access control tested for all user roles
- [ ] Session timeout configured
- [ ] Audit logs retained per compliance requirements

### E. Troubleshooting Guide

**Problem: "Rate limit hit on auth endpoint"**
- Solution: Remove rate limiters from auth routes (temporary development)
- Or wait for rate limit window to expire
- Check: `server/src/middleware/rateLimit.js` configuration

**Problem: "Invalid credentials" on correct password**
- Solution: Check if user was created before fix (password double-hashing)
- Re-seed database: `npm run seed` in server directory
- Or manually delete user and recreate account

**Problem: App stuck loading forever**
- Solution: Check if server is running: `npm run dev` in server directory
- Verify MongoDB connection
- Check browser console for error messages
- Clear browser cache and cookies

**Problem: "Account is locked"**
- Solution: Wait for lockout duration (15 minutes default)
- Or manually update user record in MongoDB:
  ```javascript
  db.users.updateOne({ email: "user@example.com" }, { $unset: { lockUntil: 1 }, $set: { loginAttempts: 0 } })
  ```

**Problem: OTP always invalid**
- Solution: Check server console for generated OTP
- Ensure OTP entered correctly (6 digits)
- Check OTP expiration (10 minutes)
- OTP expires after 1 failed attempt

### F. Performance Optimization Notes

1. **Database Indexing**: Add indexes for frequently queried fields
   ```javascript
   userSchema.index({ email: 1 });
   bookingSchema.index({ userId: 1, createdAt: -1 });
   auditLogSchema.index({ action: 1, createdAt: -1 });
   ```

2. **Caching**: Implement Redis for session/token caching
3. **Rate Limiting**: Configure based on actual traffic patterns
4. **Database Queries**: Use projection to exclude unnecessary fields
5. **API Response**: Implement pagination for large result sets

---

## Document Metadata

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: Security Team  
**Classification**: Public (Sanitized for non-sensitive content)

---

**END OF DOCUMENTATION**

For questions or clarifications, please refer to the inline code comments or contact the development team.
