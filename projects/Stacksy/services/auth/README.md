# Auth Service

Authentication service for Stacksy microservices architecture.

## Features

- User registration with email and password
- User login with JWT token generation
- Token verification endpoint
- Password hashing with bcrypt
- In-memory user store (replace with database in production)

## Endpoints

### POST /register

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201):**

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /login

Login with existing credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET /verify

Verify a JWT token.

**Headers:**

```text
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "valid": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET /health

Health check endpoint.

**Response (200):**

```json
{
  "status": "ok",
  "service": "auth"
}
```

## Setup

1. Install dependencies:

```bash
npm install
```

1. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

1. Run in development mode:

```bash
npm run dev
```

1. Build for production:

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time (default: 1h)
- `LOG_LEVEL` - Logging level (default: info)
- `PRETTY_LOGS` - Pretty print logs (default: true)

## Security Notes

- Passwords are hashed using bcryptjs with 10 salt rounds
- JWT tokens expire after 1 hour by default
- Change JWT_SECRET in production
- Replace in-memory database with persistent storage

## Pg Admin Connection

To connect to the PostgreSQL database using pgAdmin, follow these steps:

1. Open pgAdmin and click on "Add New Server".
2. In the "General" tab, enter a name for your server (e.g., "Stacksy Auth DB").
3. In the "Connection" tab, enter the following details:
   - Host name/address: `localhost` or `host.docker.internal` (if running in Docker)
   - Port: `5432` or the port you have configured for PostgreSQL
   - Maintenance database: `postgres`
   - Username: `postgres` (or your PostgreSQL username)
   - Password: `postgres` (or your PostgreSQL password)
4. Click "Save" to connect to the database. You should now see the server in pgAdmin and be able to manage your PostgreSQL database.

## Docker Setup

To run the Database in a Docker container, follow these steps:

```bash
docker run --name stacksy -e POSTGRES_PASSWORD=your-password -e POSTGRES_DB=stacksy_auth -p 5433:5432 -d postgres:latest
```
