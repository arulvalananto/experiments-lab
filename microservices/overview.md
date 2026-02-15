# 🧠 Microservices Cheat Sheet (Final Version)

> A practical revision guide for real-world Microservices architecture.

---

# 🏗 What Are Microservices?

Instead of building:

    One Big Application

We build:

    Multiple Small Independent Services

Each service:

- Owns its **own database**
- Can be **deployed independently**
- Has **no shared schema**
- Communicates over network
- Can fail independently

Example (Online Shop):

- 🧾 Order Service  
- 💳 Payment Service  
- 📦 Inventory Service  
- 📧 Notification Service  

---

# 🔄 Communication Styles

## 1️⃣ Synchronous (Sync)

Call and wait.

    Order → call Payment → wait → continue

Technologies:

- HTTP (REST)
- gRPC

Pros:

- Simple
- Immediate response

Cons:

- Tight coupling
- Cascading failures possible

Use when:

- You need instant result
- Low latency required

---

## 2️⃣ Asynchronous (Async)

Publish and continue.

    Order → publish OrderCreated
    Payment → reacts later

Technologies:

- RabbitMQ
- Kafka

Pros:

- Loose coupling
- Better scalability
- Failure isolation

Cons:

- Eventual consistency
- Harder debugging

---

# ⚖️ Data Consistency

## Strong Consistency

All services agree immediately.

(Works in monolith with single DB)

## Eventual Consistency

Services may temporarily disagree,
but will eventually sync.

Microservices mostly use:

> Eventual Consistency

Saga pattern helps manage this.

---

# 🎭 Saga Pattern (Distributed Transactions)

Used when multiple services must succeed together.

Example:

1. Create Order
2. Reserve Inventory
3. Charge Payment

If payment fails:
→ Release inventory

That’s a Saga.

---

# 🎬 Saga Types

## 🟢 Choreography

No central controller.

    OrderCreated → Inventory reacts
    InventoryReserved → Payment reacts

Pros:

- Fully event-driven
- Loosely coupled

Cons:

- Hard to track flow
- Debugging complexity

---

## 🟣 Orchestration

One central coordinator controls flow.

    OrderSaga:
        → call Inventory
        → call Payment
        → compensate if failure

Pros:

- Clear control
- Easier debugging

Cons:

- Orchestrator is important dependency

---

# 🧾 Outbox Pattern

Problem:
DB save succeeds but event publishing fails.

Solution:

1. Save business data
2. Save event in `outbox` table
3. Background worker publishes event

Guarantee:
> No state change without event.

Outbox = Technical reliability  
Saga = Business consistency  

They solve different problems.

---

# 🔁 Idempotency

Messages may be delivered twice.

Services must handle duplicates safely.

Rule:

> If already processed → ignore.

Never assume exactly-once delivery.

---

# 🌐 API Gateway

Clients should NOT call services directly.

    Client → API Gateway → Services

Responsibilities:

- Authentication
- Authorization
- Rate limiting
- Request routing
- Aggregation

Benefits:

- Centralized security
- Simpler clients
- Hides internal services

---

# 🔐 Authentication & Authorization

## 🏠 Monolith

- User logs in
- Middleware validates session/token
- All modules trust same memory/context

Simple because:
> Everything runs in same process.

---

# 🌍 Microservices Authentication

There are TWO types:

---

## 1️⃣ User Authentication (External)

Flow:

    Client → API Gateway → Services

Steps:

1. User logs in
2. Auth server issues JWT
3. Client sends JWT to API Gateway
4. Gateway validates JWT
5. Gateway forwards request to services

Important Question:

Should services validate token again?

### Option A (Basic Trust Model)

- Only API Gateway can access services
- Services trust Gateway
- Internal network is protected

Common in simple setups.

---

### Option B (Zero Trust Model – Recommended)

- Gateway validates JWT
- Gateway forwards JWT to services
- Each service validates JWT independently

Benefits:

- No blind trust
- Stronger security
- Better for distributed teams

Production systems often use this.

---

## 2️⃣ Service-to-Service Authentication (Internal)

When Service A calls Service B:

This is NOT user authentication.

This is machine authentication.

Common methods:

- Mutual TLS (mTLS)
- Internal service tokens
- API keys
- Identity providers (OAuth client credentials)

Example:

    Order Service → Payment Service

Order proves:
> "I am really Order Service"

This prevents:

- Fake internal calls
- Compromised services

---

# 🧠 Authentication Mental Model

User Authentication = "Who is the user?"

Service Authentication = "Who is this service?"

They are different problems.

Both are required in production systems.

---

# 📡 gRPC vs HTTP

| HTTP | gRPC |
|------|------|
| JSON | Protobuf |
| Simple | Faster |
| Public APIs | Internal high-performance APIs |

Rule:

- External → HTTP
- Internal → gRPC (optional)

---

# 📨 RabbitMQ vs Kafka

| RabbitMQ | Kafka |
|----------|--------|
| Message broker | Event streaming platform |
| Queue-based | Log-based |
| Flexible routing | High throughput |

Both are production-ready.

---

# 🛡 Resilience Patterns

Microservices must assume failure.

Common patterns:

- Retry (with backoff)
- Timeout
- Circuit breaker
- Dead Letter Queue (DLQ)
- Bulkhead isolation

Never assume network is reliable.

---

# 📊 Observability

Without observability, debugging is impossible.

You need:

- Logs
- Metrics
- Health checks
- Distributed tracing (OpenTelemetry)

If you can't trace a request across services,
you don't control your system.

---

# 🏆 Microservices Core Rules

1. Each service owns its own data.
2. No shared database.
3. Prefer async where possible.
4. Design for failure.
5. Make consumers idempotent.
6. Secure internal communication.
7. Monitor everything.
8. Do not over-split too early.

---

# 🧠 Final Mental Model

Monolith:

    One brain
    One database
    Strong consistency
    Simple security

Microservices:

    Many brains
    Network communication
    Eventual consistency
    Distributed failure
    Explicit security boundaries

---

# 🔥 Most Important Lesson

Microservices are not about tools.

They are about:

> Managing distributed failure, security, and consistency.

If you understand that,
you understand microservices.

---

End of Cheat Sheet 🚀
