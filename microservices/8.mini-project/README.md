# Microservices Mini-Project

A comprehensive **event-driven microservices architecture** demonstrating reliable asynchronous communication using the **Outbox Pattern** for guaranteed message delivery.

## 🏗️ Current Architecture

```diagram
┌─────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐                                           │
│  │   Order Service      │                                           │
│  │  (Express.js)        │                                           │
│  ├──────────────────────┤          ┌──────────────────┐             │
│  │ • Create Orders      │          │   PostgreSQL     │             │
│  │ • Order Retrieval    │◄────────▶│   Database       │             │
│  │ • Outbox Integration │          │                  │             │
│  └──────────┬───────────┘          │ ┌──────────────┐ │             │
│             │                      │ │ orders table │ │             │
│             │                      │ │ outbox table │ │             │
│             │                      │ └──────────────┘ │             │
│             │                      └──────────────────┘             │
│             │                                                       │
│             │         ┌────────────────────-┐                       │
│             └────────▶│  Outbox Worker      │                       │
│                       │ (Polls DB every 5s) │                       │
│                       └────────────┬────────┘                       │
│                                    │                                │
│                                    ▼                                │
│                    ┌──────────────────────────┐                     │
│                    │  RabbitMQ                │                     |
│                    │  Message Broker          │                     │
│                    ├──────────────────────────┤                     │
│                    │ Exchange: order_events   │                     │
│                    │ (fanout)                 │                     │
│                    └────┬─────────────────┬───┘                     │
│                         │                 │                         │
│            ┌────────────┘                 └─────────────┐           │
│            │                                            │           │
│            ▼                                            ▼           │
│  ┌──────────────────────┐                  ┌──────────────────┐     │
│  │ Payment Service      │                  │Notification      │     │
│  │ (Node.js Consumer)   │                  │Service           │     │
│  ├──────────────────────┤                  │(Node.js Consumer)│     │
│  │ • Process Payments   │                  │                  │     │
│  │ • Validate Amounts   │                  │ • Send Emails    │     │
│  │ • Update Status      │                  │ • Send SMS       │     │
│  │ • Log Transactions   │                  │ • Log Alerts     │     │
│  └──────────────────────┘                  └──────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📋 Project Overview

This mini-project implements a distributed order processing system with three microservices that communicate asynchronously through RabbitMQ:

- **Order Service** (Port 3000): Manages order creation with PostgreSQL and implements the outbox pattern
- **Payment Service**: Consumes order events and processes payments
- **Notification Service**: Consumes order events and sends customer notifications

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **API Framework** | Express.js |
| **Database** | PostgreSQL 15 |
| **Message Broker** | RabbitMQ 3 |
| **Language** | Node.js |
| **Containerization** | Docker & Docker Compose |
| **Pattern** | Outbox Pattern for reliable messaging |

## 📂 Project Structure

```folder
microservices-mini-project/
│
├── docker-compose.yml          # Container orchestration (PostgreSQL, RabbitMQ, Services)
├── README.md                   # Project documentation
│
├── order-service/              # Order management and outbox implementation
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── db.js              # PostgreSQL operations & DB initialization
│   │   ├── routes.js          # API endpoints for orders
│   │   └── outboxWorker.js    # Outbox pattern worker (publishes events)
│   ├── package.json
│   ├── Dockerfile
│   └── .gitignore
│
├── payment-service/            # Payment processing via RabbitMQ events
│   ├── src/
│   │   └── index.js           # RabbitMQ consumer & payment processor
│   ├── package.json
│   ├── Dockerfile
│   └── .gitignore
│
└── notification-service/       # Customer notifications via RabbitMQ events
    ├── src/
    │   └── index.js           # RabbitMQ consumer & notification sender
    ├── package.json
    ├── Dockerfile
    └── .gitignore
```

## 🔑 Key Concepts

### Outbox Pattern

The **Outbox Pattern** ensures reliable, exactly-once event delivery by:

1. **Atomic Writes**: Order and event are written to PostgreSQL in a single transaction
2. **Guaranteed Delivery**: If process crashes, events are replayed from database
3. **No Duplicate Messages**: Events are marked as processed to prevent resending
4. **Separation of Concerns**: Database persistence is decoupled from message publishing

#### Event Flow Diagram

```
┌────────────────────────────────┐
│  Create Order (HTTP Request)   │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│         ATOMIC TRANSACTION                 │
├────────────────────────────────────────────┤
│ 1. INSERT INTO orders (...)                │
│ 2. INSERT INTO outbox (...)                │
│                                             │
│  ✓ Both succeed → Commit                   │
│  ✗ Either fails → Rollback                 │
└────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│  Outbox Worker (Polls every 5 seconds)    │
├────────────────────────────────────────────┤
│ 1. SELECT * FROM outbox WHERE processed=0 │
│ 2. Publish to RabbitMQ exchange            │
│ 3. UPDATE outbox SET processed=true        │
│                                             │
│  → If crash between 2 & 3, event replayed │
│  → If processing fails, retry next cycle   │
└────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│    RabbitMQ Message Broker     │
│   (fanout exchange)            │
└────────────────────────────────┘
     │
     ├─────────────────────┐
     │                     │
     ▼                     ▼
┌──────────────┐   ┌──────────────────┐
│ Payment      │   │ Notification     │
│ Service      │   │ Service          │
│ (Queue)      │   │ (Queue)          │
└──────────────┘   └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
- **Node.js 18+** and npm (for local development)

### Running with Docker Compose

1. **Start all services**:

   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database
   - RabbitMQ message broker
   - Order Service (Port 3000)
   - Payment Service
   - Notification Service

2. **Verify services are healthy**:

   ```bash
   # Check Order Service
   curl http://localhost:3000/health
   ```

### Creating Orders

1. **Create a single order**:

   ```bash
   curl -X POST http://localhost:3000/orders \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user-123",
       "amount": 99.99
     }'
   ```

   **Response**:

   ```json
   {
     "id": "550e8400-e29b-41d4-a716-446655440000",
     "userId": "user-123",
     "amount": 99.99,
     "status": "PENDING",
     "createdAt": "2026-02-12T10:30:00Z"
   }
   ```

2. **Create multiple orders** (for testing):

   ```bash
   for i in {1..5}; do
     curl -X POST http://localhost:3000/orders \
       -H "Content-Type: application/json" \
       -d "{\"userId\": \"user-$i\", \"amount\": $((i * 20))}" && echo ""
   done
   ```

### Retrieving Orders

```bash
curl http://localhost:3000/orders/<orderId>
```

**Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "amount": 99.99,
  "status": "PENDING",
  "createdAt": "2026-02-12T10:30:00Z"
}
```

## 📊 Service Details

### Order Service (Port 3000)

**Framework**: Express.js
**Database**: PostgreSQL

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders/:id` | Retrieve order by ID |
| `GET` | `/health` | Health check endpoint |

#### Database Schema

**orders table**:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255),
  amount NUMERIC,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**outbox table**:

```sql
CREATE TABLE outbox (
  id UUID PRIMARY KEY,
  event_type VARCHAR(255),
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Example Order Creation Flow

```bash
# Create an order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "amount": 50.00}'

# Expected response:
# {
#   "id": "abc-123",
#   "userId": "user-123",
#   "amount": 50.00,
#   "status": "PENDING",
#   "createdAt": "2026-02-12T..."
# }

# Check order status
curl http://localhost:3000/orders/abc-123
```

### Payment Service

**Type**: RabbitMQ Consumer
**Queue**: `payment_queue`
**Exchange**: `order_events` (fanout)

**Functionality**:

- Listens for `ORDER_CREATED` events
- Processes payments with validation
- Simulates random payment failures (for testing)
- Logs transaction details

**Event Processing**:

```
RabbitMQ Event (ORDER_CREATED)
  ├─ orderId: UUID
  ├─ userId: string
  └─ amount: number
        │
        ▼
   Payment Validation
   (Check balance, fraud detection, etc.)
        │
        ├─ Success → Log transaction
        │
        └─ Failure → Retry or notify
```

### Notification Service

**Type**: RabbitMQ Consumer
**Queue**: `notification_queue`
**Exchange**: `order_events` (fanout)

**Functionality**:

- Listens for `ORDER_CREATED` events
- Sends order confirmation emails/SMS
- Logs customer notifications
- Handles delivery failures gracefully

**Event Processing**:

```
RabbitMQ Event (ORDER_CREATED)
  ├─ orderId: UUID
  ├─ userId: string
  └─ amount: number
        │
        ▼
   Send Notification
   (Email, SMS, Push)
        │
        └─ Log notification status
```

## 🔄 Event-Driven Communication Flow

### Step-by-Step: Creating an Order

```
1. CLIENT sends HTTP POST /orders
        │
        ▼
2. ORDER SERVICE receives request
        │
        ├─ Generate UUID for order ID
        ├─ Validate input (userId, amount)
        └─ Open database transaction
                │
                ▼
3. DATABASE writes order record
   INSERT INTO orders (id, user_id, amount, status, created_at)
        │
        ▼
4. DATABASE writes outbox event
   INSERT INTO outbox (id, event_type, payload, processed, created_at)
                │
                ▼
5. TRANSACTION commits (both or nothing)
   ✓ Success → Return 201 Created with order ID
   ✗ Failure → Rollback both inserts
        │
        ▼
6. OUTBOX WORKER runs every 5 seconds
   SELECT * FROM outbox WHERE processed = false
        │
        ├─ Unprocessed events found
        │
        ▼
7. WORKER publishes to RabbitMQ
   Message → order_events exchange (fanout)
        │
        ├─ Topic: ORDER_CREATED
        ├─ Payload: {orderId, userId, amount, timestamp}
        │
        ▼
8. WORKER marks event as published
   UPDATE outbox SET processed = true
        │
        ▼
9. RABBITMQ distributes message
        │
        ├─────────────────┬──────────────────┐
        │                 │                  │
        ▼                 ▼                  ▼
   Payment Queue    Notification Queue  (Other Services)
        │                 │
        ▼                 ▼
   PAYMENT SERVICE  NOTIFICATION SERVICE
   Processes Payment  Sends Confirmation
```

## 📡 Message Formats

### ORDER_CREATED Event

```json
{
  "eventType": "ORDER_CREATED",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "amount": 99.99,
  "status": "PENDING",
  "createdAt": "2026-02-12T10:30:00Z"
}
```

## 🐳 Docker Compose Configuration

### Services Overview

| Service | Image | Port | Dependencies |
|---------|-------|------|--------------|
| **PostgreSQL** | `postgres:15` | 5432 | None |
| **RabbitMQ** | `rabbitmq:3-management` | 5672, 15672 | None |
| **Order Service** | Custom (Node.js) | 3000 | PostgreSQL, RabbitMQ |
| **Payment Service** | Custom (Node.js) | internal | RabbitMQ |
| **Notification Service** | Custom (Node.js) | internal | RabbitMQ |

### Environment Variables

```yaml
Order Service:
  - DATABASE_URL: postgres://postgres:postgres@postgres:5432/orders
  - RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672

Payment Service:
  - RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672

Notification Service:
  - RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672
```

## 🛠️ Local Development

### Setup Without Docker

1. **Install Dependencies**:

   ```bash
   cd order-service && npm install
   cd ../payment-service && npm install
   cd ../notification-service && npm install
   ```

2. **Start PostgreSQL** (using Docker):

   ```bash
   docker run -d \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=orders \
     -p 5432:5432 \
     postgres:15
   ```

3. **Start RabbitMQ** (using Docker):

   ```bash
   docker run -d \
     -p 5672:5672 \
     -p 15672:15672 \
     rabbitmq:3-management
   ```

4. **Run Each Service** (in separate terminals):

   ```bash
   # Terminal 1: Order Service
   cd order-service
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/orders \
   RABBITMQ_URL=amqp://guest:guest@localhost:5672 \
   npm run dev

   # Terminal 2: Payment Service
   cd payment-service
   RABBITMQ_URL=amqp://guest:guest@localhost:5672 \
   npm run dev

   # Terminal 3: Notification Service
   cd notification-service
   RABBITMQ_URL=amqp://guest:guest@localhost:5672 \
   npm run dev
   ```

## 🔍 Monitoring & Debugging

### View Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f order-service
docker-compose logs -f payment-service
docker-compose logs -f notification-service

# Follow logs in real-time
docker-compose logs -f --tail=20
```

### Access RabbitMQ Management UI

```
http://localhost:15672
Username: guest
Password: guest
```

From the RabbitMQ UI, you can:

- View exchanges and queues
- Monitor message flow
- View consumer connections
- Check queue depth

### Inspect PostgreSQL Database

```bash
# Connect to database
docker exec -it order_postgres psql -U postgres -d orders

# View orders
SELECT * FROM orders;

# View unprocessed outbox events
SELECT id, event_type, processed FROM outbox WHERE processed = false;

# View all events
SELECT * FROM outbox ORDER BY created_at DESC;
```

### Monitor Message Flow

```bash
# Using RabbitMQ CLI
docker exec -it rabbitmq rabbitmqctl list_queues

# Or use RabbitMQ Management UI (http://localhost:15672)
```

## ✅ Testing Workflow

### Test Scenario 1: Create Single Order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "amount": 100.00
  }'
```

**Expected Behavior**:

1. Order Service creates order in PostgreSQL
2. Outbox entry created for event
3. Within 5 seconds, outbox worker publishes to RabbitMQ
4. Payment Service processes the payment
5. Notification Service sends notification

### Test Scenario 2: Multiple Orders (Stress Test)

```bash
#!/bin/bash
for i in {1..10}; do
  echo "Creating order $i..."
  curl -X POST http://localhost:3000/orders \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"user-$i\", \"amount\": $((100 + i*10))}"
  echo ""
  sleep 1
done
```

**Verify**:

1. Check PostgreSQL: `SELECT COUNT(*) FROM orders;`
2. Check RabbitMQ: Queue depth should be 0 (messages consumed)
3. Check outbox: `SELECT COUNT(*) FROM outbox WHERE processed = true;`

### Test Scenario 3: Service Restart Resilience

```bash
# While services are running, create an order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": "resilience-test", "amount": 500}'

# Immediately restart payment service
docker-compose restart payment-service

# Verify: Event should be reprocessed by payment service
# Messages should still be delivered exactly once
```

## 🏆 Advantages of This Architecture

| Feature | Benefit |
|---------|---------|
| **Asynchronous Communication** | Services don't block waiting for responses |
| **Loose Coupling** | Services are independent and can scale separately |
| **Reliable Delivery** | Outbox pattern prevents message loss |
| **Fault Tolerance** | Automatic retry if services crash |
| **Auditability** | All events recorded in outbox table |
| **Exactly-Once Semantics** | No duplicate messages with proper implementation |
| **Easy to Monitor** | Centralized message broker (RabbitMQ) |
| **Scalable** | Add new consumers without changing existing code |

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Order Service**:
   - Run multiple instances behind load balancer
   - Use connection pooling for PostgreSQL
   - Coordinate outbox workers (prevent duplicate publishes)

2. **Payment/Notification Services**:
   - Run multiple instances
   - RabbitMQ distributes messages across instances
   - Each instance gets different messages from queue

### Vertical Scaling

- Increase container resource limits (CPU, memory)
- Increase PostgreSQL connection pool size
- Increase RabbitMQ prefetch count

## 🛑 Stopping Services

```bash
# Stop all services (keep volumes)
docker-compose down

# Stop and remove everything (including data!)
docker-compose down -v
```

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| [order-service/src/db.js](order-service/src/db.js) | Database initialization and queries |
| [order-service/src/outboxWorker.js](order-service/src/outboxWorker.js) | Outbox pattern implementation |
| [order-service/src/routes.js](order-service/src/routes.js) | API endpoints |
| [docker-compose.yml](docker-compose.yml) | Service orchestration |

## 🧠 Learning Outcomes

After working with this project, you'll understand:

✅ **Event-Driven Architecture**

- Asynchronous communication patterns
- Pub-sub messaging with RabbitMQ

✅ **Outbox Pattern**

- Ensuring reliable message delivery
- Handling database and message broker coordination
- Preventing message loss and duplicates

✅ **Microservices Communication**

- Loose coupling between services
- Eventual consistency
- Message-based contracts

✅ **Docker & Containerization**

- Multi-container applications
- Service networking
- Volume management
- Docker Compose orchestration

✅ **PostgreSQL & Database Design**

- Transactions for data consistency
- JSONB for flexible schemas
- UUID primary keys in distributed systems

✅ **Message Brokers**

- RabbitMQ exchanges and queues
- Fanout exchanges for publish-subscribe
- Consumer groups and acknowledgments

---

**Created**: February 12, 2026
**Version**: 2.0.0
**Technology Stack**: Node.js, PostgreSQL, RabbitMQ, Docker
