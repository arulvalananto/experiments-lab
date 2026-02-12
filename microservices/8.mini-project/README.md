# Microservices Mini-Project

A comprehensive microservices architecture demonstrating **event-driven asynchronous communication** using the **Outbox Pattern** for reliable message delivery.

## 📋 Project Overview

This project implements a distributed system with three microservices that communicate through Apache Kafka:

- **Order Service**: Manages order creation and uses the outbox pattern for reliable message publishing
- **Payment Service**: Consumes order events and processes payments
- **Notification Service**: Consumes order events and sends notifications to customers

### Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUTED SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Order Service   │         │   Kafka Broker   │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ • Create Orders  │────────▶│  order_created   │          │
│  │ • Outbox Table   │         │     Topic        │          │
│  │ • Outbox Worker  │         │                  │          │
│  │ • SQLite DB      │         └────┬─────────┬───┘          │
│  └──────────────────┘              │         │              │
│                                    ▼         ▼              │
│                           ┌──────────────┐ ┌─────────────┐  │
│                           │ Payment      │ │Notification │  │
│                           │ Service      │ │ Service     │  │
│                           │              │ │             │  │
│                           │ Processing   │ │ Sending     │  │
│                           │ Payments     │ │ Alerts      │  │
│                           └──────────────┘ └─────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Project Structure

```
microservices-mini-project/
│
├── docker-compose.yml          # Container orchestration
│
├── order-service/
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── db.js               # SQLite database operations
│   │   ├── routes.js           # API routes for order management
│   │   └── outboxWorker.js     # Outbox pattern implementation
│   ├── package.json
│   ├── Dockerfile
│   └── orders.db               # SQLite database (created at runtime)
│
├── payment-service/
│   ├── src/
│   │   └── index.js            # Kafka consumer & payment processor
│   ├── package.json
│   └── Dockerfile
│
└── notification-service/
    ├── src/
    │   └── index.js            # Kafka consumer & notifier
    ├── package.json
    └── Dockerfile
```

## 🔑 Key Concepts

### Outbox Pattern

The **Outbox Pattern** ensures reliable message delivery by:

1. **Dual Write**: When an order is created, both the order record and an outbox event are written to the database in a **single transaction**
2. **Worker Process**: A background worker polls the outbox table for unpublished events
3. **Publish & Mark**: Events are published to Kafka and marked as published to ensure **exactly-once** delivery semantics
4. **Resilience**: If the system crashes between publish and marking, the worker will republish the event on recovery

```
┌──────────────────────────────────────────────┐
│  CREATE ORDER TRANSACTION                    │
├──────────────────────────────────────────────┤
│                                              │
│  1. INSERT INTO orders (...)                │
│  2. INSERT INTO outbox (...)                │
│                                              │
│  ✓ Both succeed → Commit                    │
│  ✗ Either fails → Rollback (no side effects)│
│                                              │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  OUTBOX WORKER (Poll every 5 seconds)       │
├──────────────────────────────────────────────┤
│                                              │
│  1. SELECT * FROM outbox WHERE isPublished=0│
│  2. Publish to Kafka                        │
│  3. UPDATE outbox SET isPublished=1         │
│                                              │
└──────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Running with Docker Compose

1. **Start all services**:

   ```bash
   docker-compose up --build
   ```

2. **Verify services are running**:

   ```bash
   # Order Service
   curl http://localhost:3001/health
   
   # Payment Service
   curl http://localhost:3002/health
   
   # Notification Service
   curl http://localhost:3003/health
   ```

### Creating an Order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-12345",
    "amount": 99.99
  }'
```

**Response**:

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": "cust-12345",
  "amount": 99.99,
  "status": "PENDING",
  "message": "Order created successfully"
}
```

### Retrieving an Order

```bash
curl http://localhost:3001/api/orders/<orderId>
```

**Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "customerId": "cust-12345",
  "amount": 99.99,
  "status": "PENDING",
  "createdAt": "2024-02-12T10:30:00.000Z",
  "updatedAt": "2024-02-12T10:30:00.000Z"
}
```

## 📊 Service Details

### Order Service (Port 3001)

**Endpoints**:

- `POST /api/orders` - Create a new order
- `GET /api/orders/:orderId` - Retrieve order details
- `GET /health` - Health check

**Database Schema**:

**orders table**:

```
┌────────┬─────────────┬────────┬──────────┬───────────┬───────────┐
│   id   │ customerId  │ amount │  status  │ createdAt │ updatedAt │
├────────┼─────────────┼────────┼──────────┼───────────┼───────────┤
│ UUID   │ STRING      │ REAL   │ STRING   │ DATETIME  │ DATETIME  │
└────────┴─────────────┴────────┴──────────┴───────────┴───────────┘
```

**outbox table**:

```
┌────┬───────────┬─────────┬─────────┬──────────────┬───────────┬────────────┐
│ id │ eventType │ orderId │ payload │ isPublished  │ createdAt │ publishedAt│
├────┼───────────┼─────────┼─────────┼──────────────┼───────────┼────────────┤
│ PK │ STRING    │ STRING  │ TEXT    │ INTEGER (0/1)│ DATETIME  │ DATETIME   │
└────┴───────────┴─────────┴─────────┴──────────────┴───────────┴────────────┘
```

### Payment Service (Port 3002)

**Functionality**:

- Listens to `order_created` Kafka topic
- Simulates payment processing (90% success rate)
- Generates transaction IDs

**Event Processing**:

```
Receives: ORDER_CREATED
  ├─ orderId
  ├─ customerId
  └─ amount
        ▼
    Process Payment
    (90% success rate)
        ▼
    Log Transaction
```

### Notification Service (Port 3003)

**Functionality**:

- Listens to `order_created` Kafka topic
- Simulates sending notifications (email, SMS, push)
- Logs notification attempts

**Event Processing**:

```
Receives: ORDER_CREATED
  ├─ orderId
  ├─ customerId
  └─ amount
        ▼
    Send Notification
    (Email/SMS/Push)
        ▼
    Log Notification
```

## 🔄 Event Flow

### Step-by-Step Flow

1. **Client creates an order**:

   ```
   POST /api/orders → Order Service HTTP Endpoint
   ```

2. **Order Service processes the request**:
   - Generates unique order ID
   - Writes order to SQLite database
   - Writes event to outbox table
   - **Both operations in single transaction** (ACID guarantee)

3. **Outbox Worker polls the database**:
   - Every 5 seconds, fetch unpublished events
   - Publish events to Kafka topics
   - Mark events as published

4. **Kafka distributes events**:
   - `order_created` topic receives the event
   - Multiple subscribers can consume independently

5. **Payment Service consumes event**:
   - Receives ORDER_CREATED event
   - Processes payment
   - Logs transaction details

6. **Notification Service consumes event**:
   - Receives ORDER_CREATED event
   - Sends customer notification
   - Logs notification attempt

## 📝 Environment Variables

The following environment variables can be configured:

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `PORT` | All | 3001/3002/3003 | Service port number |
| `KAFKA_HOST` | All | kafka:9092 | Kafka broker address |

## 🔍 Monitoring & Debugging

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f order-service
docker-compose logs -f payment-service
docker-compose logs -f notification-service
```

### Check Kafka Topics

Access Kafka within the container:

```bash
docker exec -it <kafka-container-id> bash

# List topics
kafka-topics --bootstrap-server localhost:9092 --list

# Consume messages from topic
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic order_created --from-beginning
```

### Inspect SQLite Database

```bash
docker exec -it <order-service-container-id> sqlite3 orders.db

# View orders
sqlite> SELECT * FROM orders;

# View outbox
sqlite> SELECT * FROM outbox;

# Check unpublished events
sqlite> SELECT * FROM outbox WHERE isPublished = 0;
```

## 🔂 Local Development

### Setup

1. **Clone and navigate**:

   ```bash
   cd microservices-mini-project
   ```

2. **Install dependencies**:

   ```bash
   cd order-service && npm install
   cd ../payment-service && npm install
   cd ../notification-service && npm install
   ```

3. **Start Kafka locally** (requires standalone Kafka or Docker):

   ```bash
   docker run -d -p 2181:2181 -p 9092:9092 \
     -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
     -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 \
     confluentinc/cp-kafka:7.4.0
   ```

4. **Run each service in separate terminals**:

   ```bash
   # Terminal 1: Order Service
   cd order-service && npm run dev

   # Terminal 2: Payment Service
   cd payment-service && npm run dev

   # Terminal 3: Notification Service
   cd notification-service && npm run dev
   ```

## 🛠️ Testing

### Manual Test Scenario

1. **Create multiple orders**:

   ```bash
   for i in {1..5}; do
     curl -X POST http://localhost:3001/api/orders \
       -H "Content-Type: application/json" \
       -d "{\"customerId\": \"customer-$i\", \"amount\": $((i * 20))}"
     echo "\n"
   done
   ```

2. **Observe service logs**:
   - Order Service: Logs order creation and outbox insertion
   - Outbox Worker: Publishes events to Kafka every 5 seconds
   - Payment Service: Consumes and processes payments
   - Notification Service: Consumes and sends notifications

3. **Verify order status**:

   ```bash
   curl http://localhost:3001/api/orders/<orderId>
   ```

## 🏆 Key Benefits of This Architecture

| Benefit | Explanation |
|---------|-------------|
| **Decoupling** | Services communicate through events, not direct calls |
| **Scalability** | Add new services by subscribing to Kafka topics |
| **Reliability** | Outbox pattern ensures no message loss (exactly-once) |
| **Resilience** | System recovers from failures without manual intervention |
| **Flexibility** | Services can process events at their own pace |
| **Auditability** | All events are tracked in the outbox table |

## 🧠 Learning Outcomes

After building and running this project, you'll understand:

✅ **Event-Driven Architecture**

- How services communicate asynchronously
- Pub-sub patterns with Kafka

✅ **Outbox Pattern**

- Ensuring reliable message delivery
- Preventing duplicate events
- Handling service failures gracefully

✅ **Distributed Systems**

- Database transactions in distributed contexts
- Handling eventual consistency
- Monitoring multiple services

✅ **Docker & Containerization**

- Building Docker images
- Using Docker Compose for multi-service orchestration
- Service networking and dependencies

✅ **Microservices Best Practices**

- Service boundaries and responsibilities
- Loose coupling, high cohesion
- Independent scalability and deployment

## 📖 Additional Resources

- [Outbox Pattern Documentation](../7.notes/outbox-pattern.md)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Microservices Patterns](https://microservices.io/patterns/index.html)

## 🛑 Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove all volumes:

```bash
docker-compose down -v
```

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0
