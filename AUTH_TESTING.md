
# Authentication Testing Guide

This document provides instructions for testing the authentication system in the LinguaLink application.

## 1. Setting Up

First, make sure the server is running:

```bash
sh run-server.sh
```

And in another terminal, start the frontend:

```bash
sh run-frontend.sh
```

## 2. Testing Registration

### Via Postman:

**Endpoint:** `POST /api/auth/register`

**Headers:**
- Content-Type: application/json

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "nativeLanguage": "English"
}
```

**What to verify:**
- The response should include a JWT token
- User information should be returned without the password
- Check MongoDB to ensure the password is stored as a hash, not plaintext

**Duplicate email test:**
- Try registering with the same email again
- You should receive a 400 error with a message about the email already existing

### Via Frontend:

1. Navigate to the signup page
2. Fill out the registration form with a new email
3. Submit the form
4. Verify you are redirected to the onboarding page
5. Try registering again with the same email and verify you see an error message

## 3. Testing Login

### Via Postman:

**Endpoint:** `POST /api/auth/login`

**Headers:**
- Content-Type: application/json

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**What to verify:**
- The response should include a JWT token
- Wrong password should return a 401 error
- Non-existent email should return a 401 error

### Via Frontend:

1. Navigate to the login page
2. Enter the email and password you registered with
3. Verify you are redirected to dashboard (if onboarded) or onboarding page
4. Try logging in with incorrect credentials and verify you see an error

## 4. Testing Protected Routes

### Via Postman:

**Endpoint:** `GET /api/users/profile`

**Headers:**
- Authorization: Bearer YOUR_JWT_TOKEN

**What to verify:**
- With valid token: Returns user profile data
- Without token: Returns 401 error
- With invalid token: Returns 401 error

### Via Frontend:

1. Log in to the application
2. Navigate to the profile page
3. Verify your user data is displayed
4. Log out and try to access the profile page directly via URL
5. Verify you are redirected to the login page

## 5. Testing JWT Security

### Token Expiration:

1. Get a valid token by logging in
2. Wait for token expiration (30 days in this implementation)
3. Try to access a protected route with the expired token
4. Verify you get a 401 error

### Token Tampering:

1. Get a valid token by logging in
2. Modify a character in the token
3. Try to access a protected route with the tampered token
4. Verify you get a 401 error

## 6. Common Issues and Troubleshooting

- **"Not authorized, no token provided"**: Ensure the Authorization header is set correctly with "Bearer " prefix
- **"Not authorized, token failed"**: The token might be invalid, expired, or tampered with
- **"Invalid email or password"**: Double-check credentials, and remember that error messages are intentionally vague for security
- **MongoDB connection errors**: Check that your connection string in .env is correct

## 7. Security Best Practices

- Never store JWT tokens in localStorage for production applications (we're doing it here for simplicity)
- Consider implementing refresh tokens for better security
- Add rate limiting to prevent brute force attacks
- Implement HTTPS in production environments
