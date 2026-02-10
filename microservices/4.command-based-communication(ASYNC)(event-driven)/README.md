# Command-Based Asynchronous Communication Architecture

This project demonstrates an **asynchronous, event-driven microservices** communication pattern using **RabbitMQ** as a message broker. It showcases how to build loosely-coupled services that communicate through message queues using the command pattern.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         Client                               │
│                    (HTTP POST Request)                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │
        ┌────────────▼──────────────────┐
        │   Order Service                │
        │   (Express Server)             │
        │   Port: 3000                   │
        │                                │
        │   POST /orders                 │
        │   (Publishes Command)          │
        └────────────┬────────────────────┘
                     │
                     │ Command (Async)
                     │ JSON Message
                     │
        ┌────────────▼──────────────────┐
        │      RabbitMQ Broker           │
        │   Queue: send_notification_    │
        │   command                      │
        │   (Durable)                    │
        └────────────┬────────────────────┘
                     │
                     │ Message Consumption
                     │
        ┌────────────▼──────────────────┐
        │ Notification Service           │
        │ (Consumer)                     │
        │                                │
        │ Process & Acknowledge Commands │
        └────────────────────────────────┘
```

## Data Flow

### 1. Order Creation Request

```
HTTP POST /orders
├── Body: { userId: <number> }
├── Response: { message: "Order created", order: { orderId, userId } }
└── (Returns immediately, before notification is processed)
```

### 2. Asynchronous Command Publishing

```
Order Service → RabbitMQ Queue (send_notification_command)
├── Payload: { orderId, userId }
├── Persistence: true (survives broker restart)
└── Fire-and-Forget: Service returns immediately
```

### 3. Detailed Flow Sequence

1. **Client sends HTTP request** to Order Service (`POST /orders`)
   - Includes `userId` in request body

2. **Order Service** (Express + Command Publisher):
   - Creates a new order object with unique `orderId` (timestamp-based)
   - **Immediately publishes** command to RabbitMQ queue
   - **Does NOT wait** for notification processing
   - Returns HTTP response with order details to client (non-blocking)

3. **RabbitMQ Broker**:
   - Receives command message
   - Stores in durable queue: `send_notification_command`
   - Ensures message persistence (survives crashes)
   - Awaits consumer to process

4. **Notification Service** (Consumer):
   - Continuously listens to the queue
   - Receives command with `orderId` and `userId`
   - Processes the notification (simulated 500ms delay)
   - **Acknowledges** message upon success
   - On failure: **Negatively acknowledges** with retry flag

## Key Components

### Service Files

| File | Purpose |
|------|---------|
| `order-service/server.js` | Express server handling order creation requests |
| `order-service/sendCommand.js` | Command publisher that sends messages to RabbitMQ |
| `notification-service/consumer.js` | Consumer that listens and processes commands from queue |

### Message Format

**Command Message** (published to queue):

```json
{
  "orderId": 1707557234567,
  "userId": 42
}
```

## Communication Characteristics

| Aspect | Detail |
|--------|--------|
| **Pattern** | Asynchronous (Non-blocking) |
| **Protocol** | AMQP (Advanced Message Queuing Protocol) |
| **Transport** | RabbitMQ Message Broker |
| **Data Format** | JSON strings |
| **Coupling** | Loosely Coupled (services don't know about each other) |
| **Latency** | Order Service returns immediately |
| **Reliability** | Durable messages + Acknowledgments + Retry logic |
| **Use Case** | When fire-and-forget is acceptable |

## RabbitMQ Features Used

- **Queue Durability**: Messages persist if broker restarts
- **Prefetch Limit**: `prefetch(1)` ensures one message is processed at a time
- **Acknowledgment (ACK)**: Consumer acknowledges successful processing
- **Negative Acknowledgment (NACK) with Retry**: Failed messages are requeued
- **Persistent Messages**: Messages marked with `persistent: true`

## Running the Services

### Prerequisites

Ensure RabbitMQ is running locally:

```bash
# Start RabbitMQ (using Docker)
docker run -d --name rabbitmq -p 5672:15672 rabbitmq:3-management
# Management UI: http://localhost:15672 (guest/guest)

# Or using Homebrew (macOS)
brew install rabbitmq
brew services start rabbitmq
```

### Start Notification Service (Consumer)

```bash
cd notification-service
npm install
npm start
# Output: [Notification Service] Waiting for commands...
```

### Start Order Service (in another terminal)

```bash
cd order-service
npm install
npm start
# Output: Order Service running on port 3000
```

### Test the Flow

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 42}'

# Response returns immediately:
# { "message": "Order created", "order": { "orderId": ..., "userId": 42 } }

# Meanwhile, Notification Service processes in background:
# [Notification Service] Sending notification for order 1707557234567
```

## Advantages of Async Command Pattern

- ✅ **Non-Blocking**: Order Service returns immediately
- ✅ **Loose Coupling**: Services don't need direct connection
- ✅ **Resilience**: If Notification Service is down, commands queue up
- ✅ **Better Scaling**: Can spin up multiple consumers
- ✅ **Reliability**: Durable messages, ACK/NACK, retry logic
- ✅ **Load Distribution**: Prefetch limits prevent overwhelming consumers

## Disadvantages

- ❌ **Eventual Consistency**: Client doesn't know if notification was sent
- ❌ **Complexity**: Requires message broker infrastructure
- ❌ **Debugging**: Harder to trace async flows
- ❌ **No Direct Response**: Can't return notification status to client
- ❌ **Message Processing Latency**: Depends on queue depth and consumer speed

## Comparison with Other Patterns

This project is part of a series demonstrating different microservices communication patterns:

- **1. Sync HTTP**: Simple REST API calls
- **2. Async Messaging (Event-based)**: Decoupled event notifications
- **3. Sync gRPC**: Type-safe, efficient bidirectional communication
- **4. Async Commands (Event-driven)**: Durable, reliable command processing (this one)

## Differences: Commands vs Events

| Aspect | Commands | Events |
|--------|----------|--------|
| **Intent** | Tell service to do something | Notify that something happened |
| **Direction** | Sender → Service | Service → Subscribers |
| **Cardinality** | One recipient | Many subscribers |
| **Example** | SendNotificationCommand | OrderCreatedEvent |

This implementation uses **commands** - the Order Service explicitly tells Notification Service what to do.
