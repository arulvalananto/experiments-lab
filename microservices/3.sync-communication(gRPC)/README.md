# gRPC Synchronous Microservices Architecture

This project demonstrates a synchronous microservices communication pattern using **gRPC** (Google Remote Procedure Call). It showcases how to build inter-service communication with strongly-typed protocol buffers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                    (HTTP POST Request)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │
        ┌────────────▼───────────────┐
        │   Order Service            │
        │   (Express Server)         │
        │   Port: 3000               │
        │                            │
        │   POST /orders             │
        └────────────┬───────────────┘
                     │
                     │ gRPC Call
                     │ (Synchronous)
                     │
        ┌────────────▼───────────────┐
        │ Notification Service       │
        │ (gRPC Server)              │
        │ Port: 50051                │
        │                            │
        │ SendNotification RPC       │
        └────────────────────────────┘
```

## Data Flow

### 1. Order Creation Request

```
HTTP POST /orders
├── Body: { userId: <number> }
└── Response: { message: "Order placed", order: { id, userId } }
```

### 2. Synchronous gRPC Call

```
Order Service → Notification Service (gRPC)
├── Request: NotificationRequest { orderId, userId }
└── Response: NotificationResponse { status: "sent" }
```

### 3. Detailed Flow Sequence

1. **Client sends HTTP request** to Order Service (`POST /orders`)
   - Includes `userId` in request body

2. **Order Service** (Express API):
   - Creates a new order object with unique `orderId` (timestamp-based)
   - **Blocks execution** to await gRPC response from Notification Service
   - Makes synchronous gRPC call: `sendNotification(orderId, userId)`

3. **Notification Service** (gRPC Server):
   - Receives `NotificationRequest` with `orderId` and `userId`
   - Logs notification details
   - Immediately returns `NotificationResponse` with status: "sent"

4. **Order Service** resumes:
   - Receives the response from Notification Service
   - Returns HTTP response with order details to client

## Key Components

### Service Files

| File | Purpose |
|------|---------|
| `order-service/server.js` | Express server handling order creation requests |
| `order-service/client.js` | gRPC client for connecting to Notification Service |
| `notification-service/server.js` | gRPC server for processing notifications |
| `protos/notification.proto` | Protocol buffer definitions for type-safe communication |

### Protocol Definition

The `.proto` file defines:

- **NotificationService**: gRPC service with one RPC method
- **SendNotification**: RPC procedure accepting request and returning response
- **NotificationRequest**: Message with `orderId` (int64) and `userId` (int64)
- **NotificationResponse**: Message with `status` (string)

## Communication Characteristics

| Aspect | Detail |
|--------|--------|
| **Pattern** | Synchronous (Blocking) |
| **Protocol** | gRPC with Protocol Buffers |
| **Data Format** | Binary (efficient) |
| **Type Safety** | Strongly typed via .proto definitions |
| **Latency** | Order Service waits for Notification Service response |
| **Use Case** | When immediate response is required |

## Running the Services

### Start Notification Service

```bash
cd notification-service
npm install
npm start
# Output: Notification gRPC server running on 50051
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
```

## Advantages of Synchronous gRPC

- ✅ **Strongly Typed**: Protocol buffers ensure type safety
- ✅ **Efficient**: Binary serialization reduces payload size
- ✅ **Fast**: Low latency communication
- ✅ **Guaranteed Delivery**: Caller knows request was processed
- ✅ **Simple Error Handling**: Direct error propagation

## Disadvantages

- ❌ **Blocking**: Order Service cannot proceed until Notification Service responds
- ❌ **Higher Coupling**: Services are tightly coupled through synchronous calls
- ❌ **Single Point of Failure**: If Notification Service is down, Order Service fails
- ❌ **Scaling Challenges**: Cannot easily scale under high load

## Comparison with Other Patterns

This project is part of a series demonstrating different microservices communication patterns:

- **1. Sync HTTP**: Simple REST API calls
- **2. Async Messaging**: Decoupled communication via message queues
- **3. Sync gRPC**: Type-safe, efficient bidirectional communication (this one)
