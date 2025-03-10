# Authentication Testing Guide

This document guides you through testing the authentication system to ensure everything is working correctly.

## Testing Registration and Login

### 1. Test User Registration

**Steps:**
1. Make a POST request to `/api/auth/register` with:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

**Expected Results:**
- Success: Status 201 with message "User registered successfully"
- If user exists: Status 400 with message "User already exists"

### 2. Test User Login

**Steps:**
1. Make a POST request to `/api/auth/login` with:
   ```json
   {
     "email": "test@example.com", 
     "password": "password123"
   }
   ```

**Expected Results:**
- Success: Status 200 with message "Login successful" and a JWT token
- Wrong credentials: Status 400 with message "Invalid email or password"

### 3. Test Protected Routes

**Steps:**
1. Make a GET request to `/api/users/profile` without a token
2. Make the same request with a token in:
   - HTTP-only cookie (set by login), or
   - Authorization header: `Bearer <token>`

**Expected Results:**
- Without token: Status 401 with message "Unauthorized - No token provided"
- With valid token: Status 200 with user profile data
- With invalid token: Status 401 with message "Unauthorized - Invalid token"

## Common Issues and Fixes

1. **JWT Secret Missing**
   - Ensure `.env` has `JWT_SECRET` defined

2. **Cookies Not Working**
   - Ensure `withCredentials: true` in frontend requests
   - Check CORS settings on server (credentials: true)

3. **Database Connection**
   - Verify MongoDB connection string is correct
   - Check if user model is properly defined

4. **Token Storage**
   - Frontend should store token in localStorage or cookies
   - Authorization headers should be formatted correctly

## Testing with Postman

1. Create a collection for your auth tests
2. Add registration and login requests
3. Set up environment variables to store the JWT token from login
4. Use the token in the Authorization header for subsequent requests

## Testing in Browser

1. Open browser console
2. Submit registration/login forms
3. Check localStorage for token
4. Access protected routes and verify authentication works