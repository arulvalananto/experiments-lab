# Architecture

```Architectural Overview
                          Client
                            │
                            ▼
                  ┌─────────────────────--┐
                  │  Gateway (Fastify)    │
                  │  - JWT verify         │
                  │  - Rate limit         │
                  │  - Logging            │
                  │  - Forwarding         │
                  └──────────┬──────────--┘
                             │
                  Internal Docker Network
                             │
                  ┌─────────-┴────────-------┐
                  │                          │
                  ▼                          ▼
              Auth Service             Tool Service
                (Node.js)                (Node.js)
                  │                          │
                  └─────── PostgreSQL ───────┘
                        (separate schemas)
                            + Redis
```
