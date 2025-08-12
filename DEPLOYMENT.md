# Deployment Guide for Render

## Environment Variables Required

Make sure to set these environment variables in your Render dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=10000
```

**Important:** The MONGODB_URI must be a valid MongoDB connection string. For MongoDB Atlas, it should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Build Commands

**Build Command:** `npm install`
**Start Command:** `npm start`

## Troubleshooting

### 1. Express Version Issue
The application uses Express 4.18.2 for stability. If you encounter router issues, ensure the package.json has:
```json
"express": "^4.18.2"
```

### 2. Middleware Import Issue
The auth middleware exports an object with `authenticate` and `authorize` functions. Routes should import like:
```javascript
const { authenticate } = require('../middleware/auth');
```

### 3. Database Connection
Ensure your MongoDB URI is correctly set in environment variables.

### 4. File Uploads
The application creates an `uploads` directory for file storage. Ensure the server has write permissions.

## Testing the Deployment

1. Check if the server starts without errors
2. Test the health endpoint: `GET /`
3. Test authentication: `POST /api/users/login`
4. Test training routes: `GET /api/training/events`

## Common Issues

- **"argument handler is required"**: Usually caused by incorrect middleware import
- **"db.on is not a function"**: Fixed by exporting the correct database connection object
- **MongoDB connection failed**: Check MONGODB_URI environment variable
- **JWT errors**: Ensure JWT_SECRET is set
- **File upload errors**: Check server permissions for uploads directory

## Testing Database Connection

You can test the database connection locally by running:
```bash
node test-db.js
```

This will verify that your MONGODB_URI is correctly configured.
