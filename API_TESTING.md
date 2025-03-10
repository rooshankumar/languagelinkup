
# LinguaLink API Testing Guide

This document provides instructions for testing the LinguaLink API endpoints using either Postman or the frontend application.

## Prerequisites

1. Ensure the server is running by executing:
   ```
   sh run-server.sh
   ```

2. Make sure your MongoDB connection string in `.env` is valid.

## API Base URL

- Local Development: `http://localhost:3000/api`
- Deployed Application: `https://mylanguageapp.replit.app/api`

## Authentication Endpoints

### Register a New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "nativeLanguage": "English"
}
```

**Expected Response:**
```json
{
  "_id": "user_id",
  "username": "testuser",
  "email": "test@example.com",
  "nativeLanguage": "English",
  "isOnboarded": false,
  "token": "jwt_token"
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "_id": "user_id",
  "username": "testuser",
  "email": "test@example.com",
  "nativeLanguage": "English",
  "isOnboarded": false,
  "token": "jwt_token"
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Expected Response:**
```json
{
  "_id": "user_id",
  "username": "testuser",
  "email": "test@example.com",
  "nativeLanguage": "English",
  "isOnboarded": false
}
```

## User Profile Endpoints

### Update User Profile

**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "firstName": "Test",
  "lastName": "User",
  "bio": "I am learning French",
  "learningLanguages": [
    {
      "language": "French",
      "level": "beginner"
    }
  ]
}
```

**Expected Response:**
```json
{
  "_id": "user_id",
  "username": "testuser",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "bio": "I am learning French",
  "nativeLanguage": "English",
  "learningLanguages": [
    {
      "language": "French",
      "level": "beginner"
    }
  ],
  "isOnboarded": true
}
```

### Get Language Exchange Matches

**Endpoint:** `GET /api/users/matches`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Expected Response:**
```json
[
  {
    "_id": "other_user_id",
    "username": "frenchuser",
    "firstName": "French",
    "lastName": "User",
    "profilePicture": "/placeholder.svg",
    "nativeLanguage": "French",
    "learningLanguages": [
      {
        "language": "English",
        "level": "intermediate"
      }
    ],
    "bio": "I am from France"
  }
]
```

## Chat Endpoints

### Get All Conversations

**Endpoint:** `GET /api/chat/conversations`

**Headers:**
```
Authorization: Bearer jwt_token
```

### Start a New Chat

**Endpoint:** `POST /api/chat/start`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "partnerId": "other_user_id",
  "language1": "English",
  "language2": "French"
}
```

### Get Messages for a Chat

**Endpoint:** `GET /api/chat/messages/:chatId`

**Headers:**
```
Authorization: Bearer jwt_token
```

### Send a Message

**Endpoint:** `POST /api/chat/messages/:chatId`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "content": "Bonjour! Comment ça va?",
  "originalLanguage": "French"
}
```

## Progress Tracking Endpoints

### Get Streak Data

**Endpoint:** `GET /api/progress/streak`

**Headers:**
```
Authorization: Bearer jwt_token
```

### Update Streak After Activity

**Endpoint:** `POST /api/progress/streak/update`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "language": "French",
  "activityType": "practice",
  "minutes": 15
}
```

## Blog Endpoints

### Get Blog Posts

**Endpoint:** `GET /api/blog/articles`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `language`: Filter by language (optional)
- `category`: Filter by category (optional)
- `tag`: Filter by tag (optional)
- `difficulty`: Filter by difficulty (optional)
- `search`: Search term (optional)

### Get Single Blog Post

**Endpoint:** `GET /api/blog/articles/:slug`

### Create a Blog Post

**Endpoint:** `POST /api/blog/articles`

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "title": "Tips for Learning French",
  "content": "Here are some tips for learning French...",
  "excerpt": "Essential tips for beginners learning French",
  "categories": ["French", "Language Learning"],
  "tags": ["tips", "french", "beginner"],
  "language": "English",
  "difficulty": "beginner",
  "published": true
}
```

## Testing with Frontend

1. Start the frontend:
   ```
   sh run-frontend.sh
   ```

2. Navigate to `http://localhost:3001` in your browser.

3. Use the frontend UI to test registration, login, chat, and other features.

## Troubleshooting

- If you encounter CORS errors, ensure your CORS configuration in the server is correct.
- Check your MongoDB connection if database-related errors occur.
- Verify that your JWT token is valid and not expired for authenticated requests.
- For WebSocket issues, make sure both the server and client are using compatible Socket.io versions.
