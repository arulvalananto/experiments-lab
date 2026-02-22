# Stacksy API Gateway

A production-ready API Gateway built with Fastify and TypeScript, serving as the entry point for Stacksy microservices architecture.

## Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Rate Limiting** - Protect services from abuse
- ✅ **Request Logging** - Comprehensive logging with Pino
- ✅ **CORS & Security Headers** - Built-in security with Helmet
- ✅ **Service Proxy** - Efficient request forwarding to microservices
- ✅ **Health Checks** - Monitor gateway status
- ✅ **TypeScript** - Full type safety
- ✅ **Docker Ready** - Containerized deployment

## Architecture

The gateway acts as a reverse proxy, routing requests to appropriate microservices:

```file
Client → Gateway (Port 3000) → Microservices
                               ├─ Auth Service (Port 3001)
                               └─ Tool Service (Port 3002)
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Run in development mode with hot reload
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build image
docker build -t stacksy-gateway .

# Run container
docker run -p 3000:3000 --env-file .env stacksy-gateway
```

## Configuration

Configure the gateway via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `0.0.0.0` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | - |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_TIME_WINDOW` | Time window in ms | `60000` |
| `AUTH_SERVICE_URL` | Auth service endpoint | - |
| `TOOL_SERVICE_URL` | Tool service endpoint | - |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## API Routes

### Public Routes

- `GET /` - Gateway information
- `GET /health` - Health check endpoint

### Auth Service Routes

- `/api/auth/*` - Proxied to Auth Service (no authentication required)

### Tool Service Routes

- `/api/tools/*` - Proxied to Tool Service (authentication required)

## Project Structure

```
gateway/
├── src/
│   ├── config/          # Configuration management
│   ├── plugins/         # Fastify plugins
│   │   ├── jwt.ts       # JWT authentication
│   │   ├── rateLimit.ts # Rate limiting
│   │   └── security.ts  # CORS & Helmet
│   ├── routes/          # Route handlers
│   │   ├── health.ts    # Health check routes
│   │   └── index.ts     # Route registration
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   │   └── proxy.ts     # Proxy handler
│   ├── app.ts           # Application setup
│   └── index.ts         # Entry point
├── Dockerfile           # Docker configuration
├── .env.example         # Example environment variables
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Adding New Services

To proxy a new microservice:

1. Add service URL to `.env`:

   ```
   NEW_SERVICE_URL=http://new-service:3003
   ```

2. Update [src/config/index.ts](src/config/index.ts):

   ```typescript
   services: {
     newService: process.env.NEW_SERVICE_URL || 'http://localhost:3003',
   }
   ```

3. Add route in [src/routes/index.ts](src/routes/index.ts):

   ```typescript
   fastify.all(
     '/api/new-service/*',
     { preHandler: fastify.authenticate }, // Optional auth
     createProxyHandler({
       target: config.services.newService,
       pathRewrite: (path) => path.replace('/api/new-service', ''),
     })
   );
   ```

## Security Considerations

- **JWT Secret**: Always use a strong, unique secret in production
- **Rate Limiting**: Adjust limits based on your usage patterns
- **CORS**: Configure specific origins instead of `*` in production
- **HTTPS**: Use HTTPS in production with a reverse proxy (nginx, Traefik)

## License

ISC
