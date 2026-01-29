# Hotel Room Booking System

A secure, full-stack hotel booking application with advanced security features including MFA, password policies, RBAC, and comprehensive audit logging.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure signup/login with JWT and HttpOnly cookies
- **Multi-Factor Authentication (MFA)**: Email OTP verification (simulated)
- **Hotel & Room Management**: Browse hotels, view room details, check availability
- **Booking System**: Date/time selection with overlap prevention
- **Payment Simulation**: Secure transaction processing with receipt generation
- **User Dashboard**: View and manage bookings
- **Admin Panel**: Hotel/room creation and management

### Security Features

#### 🔐 Authentication & Authorization
- **JWT with HttpOnly Cookies**: Secure token storage
- **Refresh Token Rotation**: Automatic token refresh
- **Multi-Factor Authentication**: OTP-based verification
- **Role-Based Access Control (RBAC)**: User and Admin roles
- **Account Lockout**: 5 failed attempts = 15-minute lockout

#### 🔑 Password Security
- **Strong Password Policy**: 
  - Minimum 12 characters
  - Requires uppercase, lowercase, number, and special character
  - Real-time strength meter
- **Password History**: Prevents reuse of last 3 passwords
- **Password Expiry**: 90-day expiration with forced change
- **Bcrypt Hashing**: 12 rounds of salting

#### 🛡️ Data Protection
- **AES-256-GCM Encryption**: Phone numbers encrypted at rest
- **Input Sanitization**: NoSQL injection prevention
- **XSS Protection**: Input validation and sanitization
- **CSRF Protection**: Token-based validation for state-changing requests

#### 🚨 Security Hardening
- **Helmet.js**: Security headers (CSP, HSTS, etc.)
- **Rate Limiting**: Per-endpoint protection
  - Auth endpoints: 5 requests/15min
  - API endpoints: 100 requests/15min
  - Booking: 10 requests/hour
- **CORS**: Configured for specific origins
- **Audit Logging**: Comprehensive security event tracking

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **MongoDB**: v5 or higher (running locally)
- **MongoDB Compass**: For database visualization

## 🛠️ Installation

### 1. Clone or Navigate to Project
```bash
cd hotel-booking-system
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

### 4. Configure Environment
The server already has a `.env` file configured for development. For production, update:
- JWT secrets
- Encryption key
- CSRF secret
- MongoDB URI

### 5. Seed Database
```bash
cd server
npm run seed
```

This creates:
- 2 hotels (Grand Plaza Hotel, Seaside Resort & Spa)
- 6 rooms (3 per hotel)
- 1 admin user
- 1 regular user

## 🚀 Running the Application

### Start MongoDB
Ensure MongoDB is running on `mongodb://localhost:27017`

### Start Backend Server
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:5000`

### Start Frontend Client
```bash
cd client
npm run dev
```
Client runs on: `http://localhost:5173`

## 🔑 Test Credentials

### Admin Account
- **Email**: `admin@hotel.com`
- **Password**: `Admin@123456`

### Regular User Account
- **Email**: `user@example.com`
- **Password**: `User@1234567`

### MFA OTP
After login, check the **server console** for the 6-digit OTP code.

## 📊 MongoDB Compass

Connect to view the database:
```
mongodb://localhost:27017/hotel-booking-system
```

### Collections
- `users` - User accounts (passwords hashed, phone numbers encrypted)
- `hotels` - Hotel information
- `rooms` - Room details
- `bookings` - Reservation records
- `payments` - Payment transactions
- `auditlogs` - Security event logs

## 🏗️ Project Structure

```
hotel-booking-system/
├── server/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, RBAC, validation, etc.
│   │   ├── utils/           # Crypto, password policy, logging
│   │   ├── scripts/         # Database seeding
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/             # HTTP client & API services
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # CSS styles
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔒 Security Implementation Details

### 1. Password Security
- **Strength Validation**: Real-time meter on frontend and backend validation
- **History Tracking**: Last 3 passwords stored (hashed) to prevent reuse
- **Expiry Enforcement**: 90-day expiration with forced password change
- **Secure Storage**: Bcrypt with 12 salt rounds

### 2. Multi-Factor Authentication
- **OTP Generation**: 6-digit random code
- **Hashed Storage**: OTP stored as bcrypt hash
- **Expiry**: 10-minute validity
- **Demo Mode**: OTP printed to server console (can be configured for email)

### 3. Account Lockout
- **Threshold**: 5 failed login attempts
- **Duration**: 15-minute lockout
- **Reset**: Automatic after lockout expires or successful login

### 4. Session Management
- **Access Token**: 15-minute expiry, HttpOnly cookie
- **Refresh Token**: 7-day expiry, stored in DB for rotation
- **Logout**: Invalidates refresh token

### 5. Data Encryption
- **Algorithm**: AES-256-GCM
- **Encrypted Fields**: Phone numbers
- **Key Management**: Environment variable (32-byte key)

### 6. Audit Logging
Logged events include:
- Signup success/failure
- Login success/failure
- MFA verification
- Password changes
- Profile updates
- Booking creation/cancellation
- Payment completion

Each log contains:
- Timestamp
- User ID
- IP address
- User agent
- Action type
- Metadata
- Status (success/failure)

### 7. CSRF Protection
- **Token Generation**: Unique per session
- **Validation**: Required for POST/PUT/DELETE requests
- **Cookie**: HttpOnly, Secure (production), SameSite=Strict

### 8. Input Validation
- **Joi Schemas**: Server-side validation for all inputs
- **Sanitization**: NoSQL injection prevention
- **XSS Protection**: Input escaping and Content Security Policy

## 🧪 Testing the Security Features

### Test Password Policy
1. Try to signup with weak password → Should fail
2. Use password with 12+ chars, mixed case, numbers, symbols → Should succeed
3. Try to change password to one of last 3 → Should fail

### Test Account Lockout
1. Login with wrong password 5 times
2. Account should lock for 15 minutes
3. Correct password won't work during lockout

### Test MFA
1. Signup or login
2. Check server console for OTP
3. Enter OTP to complete authentication

### Test Booking Overlap
1. Create a booking for specific dates
2. Try to book same room for overlapping dates → Should fail
3. Book for non-overlapping dates → Should succeed

### Test RBAC
1. Login as regular user
2. Try to access `/admin` → Should redirect
3. Login as admin → Should access admin panel

### Test Data Encryption
1. Add phone number in profile
2. Check MongoDB Compass
3. Phone number should be encrypted (not readable)

## 🔍 OWASP Security Checklist

### Implemented Protections

✅ **A01:2021 – Broken Access Control**
- Role-based access control (RBAC)
- Ownership validation for resources
- Protected routes with middleware

✅ **A02:2021 – Cryptographic Failures**
- Bcrypt for passwords (12 rounds)
- AES-256-GCM for sensitive data
- JWT with secure secrets
- HTTPS enforcement in production

✅ **A03:2021 – Injection**
- Input sanitization (NoSQL injection prevention)
- Joi validation schemas
- Parameterized queries (Mongoose)

✅ **A04:2021 – Insecure Design**
- MFA implementation
- Password expiry and history
- Account lockout mechanism
- Secure session management

✅ **A05:2021 – Security Misconfiguration**
- Helmet.js security headers
- CORS configuration
- Environment-based secrets
- Error handling without stack traces in production

✅ **A06:2021 – Vulnerable Components**
- Regular dependency updates
- No known vulnerable packages

✅ **A07:2021 – Authentication Failures**
- Strong password policy
- MFA enforcement
- Account lockout
- Secure session tokens

✅ **A08:2021 – Software and Data Integrity**
- Audit logging
- Server-side price calculation
- Input validation

✅ **A09:2021 – Logging Failures**
- Comprehensive audit logs
- Security event tracking
- Failed login attempts logged

✅ **A10:2021 – SSRF**
- Input validation
- No user-controlled URLs

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (sends OTP)
- `POST /api/auth/verify-mfa` - Verify OTP
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password

### Hotels
- `GET /api/hotels` - List hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/:id/rooms` - Get hotel rooms
- `GET /api/hotels/rooms/:roomId` - Get room details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get payment history
- `GET /api/payments/:id` - Get payment details

### Admin
- `POST /api/admin/hotels` - Create hotel
- `PUT /api/admin/hotels/:id` - Update hotel
- `DELETE /api/admin/hotels/:id` - Delete hotel
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/stats` - Get statistics

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### CSRF Token Error
- Clear browser cookies
- Restart both server and client

### OTP Not Working
- Check server console for OTP code
- Ensure OTP hasn't expired (10 min)

### Port Already in Use
- Change port in `.env` (server) or `vite.config.js` (client)

## 📝 Notes

- **Demo Mode**: MFA OTP is printed to console (not sent via email)
- **Payment**: Simulated (no real payment gateway)
- **HTTPS**: Enforced in production, HTTP in development
- **Encryption Key**: Change in production (32 characters)

## 🚀 Production Deployment

1. Update all secrets in `.env`
2. Set `NODE_ENV=production`
3. Use HTTPS
4. Configure real email service for MFA
5. Set up MongoDB Atlas or production database
6. Build frontend: `npm run build`
7. Serve static files from backend

## 📄 License

ISC

## 👨‍💻 Author

Built as a secure hotel booking system demonstration with enterprise-grade security features.
# HBS
