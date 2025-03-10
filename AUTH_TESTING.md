
# Authentication Testing Guide

## Prerequisites

1. Make sure both the frontend and backend are running:
   ```
   npm run dev:all
   ```

2. Verify the MongoDB connection is working (check server logs)

## Testing Registration

1. Go to the signup page
2. Fill in a new user with details:
   - Username: test_user
   - Email: test@example.com
   - Password: password123
   - Native Language: English

3. Expected results:
   - Success: User created, redirected to dashboard/onboarding
   - Error if email exists: "User already exists with this email"

## Testing Login

1. Go to the login page
2. Use credentials created above:
   - Email: test@example.com
   - Password: password123

3. Expected results:
   - Success: Logged in, redirected to dashboard
   - Error if wrong email: "Invalid email or password"
   - Error if wrong password: "Invalid email or password"

## Testing Protected Routes

1. Without logging in, try to access:
   - /dashboard
   - /profile
   
2. Expected results:
   - Should be redirected to login page

3. After logging in, these routes should be accessible

## Testing Logout

1. Click logout button when logged in
2. Expected results:
   - Redirected to home/login
   - Protected routes no longer accessible

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
