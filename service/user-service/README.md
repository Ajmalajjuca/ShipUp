# User Service API Documentation

This document provides comprehensive information about the User Service API endpoints, their request/response formats, and usage guidelines.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [User Profile](#user-profile)
  - [File Upload](#file-upload)

## Overview

The User Service provides APIs for managing user accounts, profiles, and related operations.

## Base URL

```
http://localhost:3002/api
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  // Additional data specific to the endpoint
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## API Endpoints

### User Management

#### Create User

Create a new user profile.

- **URL:** `/users`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**

```json
{
  "userId": "USR-abc123",
  "fullName": "John Doe",
  "phone": "+919876543210",
  "email": "user@example.com"
}
```

- **Success Response:**

```json
{
  "success": true,
  "user": {
    "userId": "USR-abc123",
    "fullName": "John Doe",
    "phone": "+919876543210",
    "email": "user@example.com",
    "addresses": [],
    "onlineStatus": false,
    "isVerified": false,
    "referralId": "REF-XYZ12",
    "status": true
  }
}
```

#### Get User

Get user profile by ID.

- **URL:** `/users/:userId`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "user": {
    "userId": "USR-abc123",
    "fullName": "John Doe",
    "phone": "+919876543210",
    "email": "user@example.com",
    "addresses": ["123 Main St, City, Country"],
    "onlineStatus": true,
    "isVerified": true,
    "referralId": "REF-XYZ12",
    "profileImage": "https://example.com/profile.jpg",
    "status": true
  }
}
```

#### Get User by Email

Get user profile by email.

- **URL:** `/users/by-email/:email`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "user": {
    "userId": "USR-abc123",
    "fullName": "John Doe",
    "phone": "+919876543210",
    "email": "user@example.com",
    "addresses": ["123 Main St, City, Country"],
    "onlineStatus": true,
    "isVerified": true,
    "referralId": "REF-XYZ12",
    "profileImage": "https://example.com/profile.jpg",
    "status": true
  }
}
```

#### Update User

Update user profile details.

- **URL:** `/users/:userId`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "fullName": "John Smith",
  "phone": "+919876543211"
}
```

- **Success Response:**

```json
{
  "success": true,
  "user": {
    "userId": "USR-abc123",
    "fullName": "John Smith",
    "phone": "+919876543211",
    "email": "user@example.com",
    "addresses": ["123 Main St, City, Country"],
    "onlineStatus": true,
    "isVerified": true,
    "referralId": "REF-XYZ12",
    "profileImage": "https://example.com/profile.jpg",
    "status": true
  }
}
```

#### Delete User

Delete a user.

- **URL:** `/users/:userId`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "message": "User deleted"
}
```

#### Get All Users

Get all users in the system.

- **URL:** `/users`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**

```json
{
  "success": true,
  "users": [
    {
      "userId": "USR-abc123",
      "fullName": "John Doe",
      "phone": "+919876543210",
      "email": "user@example.com",
      "addresses": ["123 Main St, City, Country"],
      "onlineStatus": true,
      "isVerified": true,
      "referralId": "REF-XYZ12",
      "profileImage": "https://example.com/profile.jpg",
      "status": true
    },
    // ... more users
  ]
}
```

#### Update User Status

Update user status (active/inactive).

- **URL:** `/users/:userId/status`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Request Body:**

```json
{
  "status": false
}
```

- **Success Response:**

```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "userId": "USR-abc123",
    "status": false,
    // ... other user properties
  }
}
```

### User Profile

#### Update Profile

Update user profile with possible profile image.

- **URL:** `/update-profile`
- **Method:** `PUT`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Request Body:**

```
userId: USR-abc123
fullName: John Smith (optional)
phone: +919876543211 (optional)
currentPassword: CurrentPassword123! (optional)
newPassword: NewPassword123! (optional)
profileImage: (file) (optional)
profileImagePath: https://example.com/profile.jpg (optional, if using URL instead of file)
```

- **Success Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "userId": "USR-abc123",
    "fullName": "John Smith",
    "phone": "+919876543211",
    "email": "user@example.com",
    "profileImage": "https://example.com/new-profile.jpg",
    // ... other user properties
  }
}
```

### File Upload

#### S3 Upload

Upload a file to S3.

- **URL:** `/s3/upload`
- **Method:** `POST`
- **Auth Required:** Yes (token or temporary token)
- **Content-Type:** `multipart/form-data`
- **Query Parameters:**
  - `type`: `profile` or `file` (determines which field to use)
- **Request Body:**

```
profileImage: (file) or file: (file)
```

- **Success Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileUrl": "https://example.com/uploaded-file.jpg",
  "fileType": "profile"
}
```

## Status Codes

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: The user does not have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

## Error Messages

- `Missing required fields`: One or more required fields are missing
- `Invalid phone number format`: Phone number format is invalid
- `User not found`: The requested user does not exist
- `Internal server error`: An unexpected error occurred on the server
- `Invalid token`: The provided authentication token is invalid
- `No file uploaded`: File upload was expected but no file was provided 