# Mini Project 2: Saga Pattern Implementation

## Architecture Overview

This project demonstrates the **Saga Pattern** using a **choreography-based** approach for managing distributed transactions across microservices. The system handles booking workflows where each service independently reacts to events without a central orchestrator.

### Components

1. **Booking Service** (Port 3000)
   - Entry point for booking requests
   - Stores bookings in PostgreSQL with status tracking
   - Publishes and listens to saga events
   - Manages booking state transitions (PENDING → CONFIRMED/CANCELLED)

2. **Payment Service**
   - Processes payment transactions
   - Simulates success/failure scenarios (70% success rate)
   - Publishes payment outcome events

3. **Notification Service**
   - Sends notifications for booking lifecycle events
   - Listens to all booking-related events

4. **Infrastructure**
   - **RabbitMQ**: Message broker for event-driven communication
   - **PostgreSQL**: Persistent storage for bookings
   - **Jaeger**: Distributed tracing and monitoring

## Data Flow

```
1. Client Request
   └─> POST /bookings { amount: 100 }
       └─> Booking Service creates booking (status: PENDING)
           └─> Publishes "booking.created" event

2. Payment Processing
   └─> Payment Service receives "booking.created"
       └─> Processes payment (70% success simulation)
           ├─> Success: Publishes "payment.completed"
           └─> Failure: Publishes "payment.failed"

3. Booking Confirmation
   └─> Booking Service receives payment result
       ├─> "payment.completed" → Updates status to CONFIRMED
       │   └─> Publishes "booking.confirmed"
       └─> "payment.failed" → Updates status to CANCELLED
           └─> Publishes "booking.cancelled"

4. Notifications
   └─> Notification Service receives all "booking.*" events
       └─> Sends appropriate notifications
```

## Event-Driven Communication

The system uses **RabbitMQ topic exchange** (`booking_exchange`) with the following routing patterns:

| Service | Subscribes To | Publishes |
|---------|---------------|-----------|
| Booking Service | `payment.*` | `booking.created`, `booking.confirmed`, `booking.cancelled` |
| Payment Service | `booking.created` | `payment.completed`, `payment.failed` |
| Notification Service | `booking.*` | - |

## Saga Pattern Benefits

- **Decoupled Services**: Each service operates independently
- **Eventual Consistency**: System reaches consistent state through event propagation
- **Compensating Transactions**: Failed payments trigger booking cancellation
- **Distributed Tracing**: Jaeger provides visibility across service boundaries

## Running the Project

```bash
# Start all services
docker-compose up --build

# Create a booking
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'

# View traces
http://localhost:16686  # Jaeger UI

# View RabbitMQ management
http://localhost:15672  # Default: guest/guest
```

## Key Design Decisions

1. **Choreography over Orchestration**: Services react to events rather than being commanded by a central coordinator
2. **Topic Exchange**: Flexible routing for multiple event subscribers
3. **Status Tracking**: Booking status clearly indicates transaction state
4. **Idempotency**: Events include bookingId for correlation and duplicate handling
5. **Observability**: OpenTelemetry integration for distributed tracing
