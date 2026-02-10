# Stream-Based Communication (Event-Driven, Async)

This folder demonstrates an **event-driven microservices architecture** using stream-based asynchronous communication. The services interact via a message broker (e.g., Kafka, Redis Streams), enabling scalable, decoupled data flows.

## Architecture Overview

- **order-service**: Exposes an API for order creation. Publishes order events to a stream (producer.js).
- **notification-service**: Consumes order events from the stream (consumer.js) and sends notifications to users.
- **analytics-service**: Consumes order events from the stream (consumer.js) and processes analytics (e.g., aggregates, logs).
- **docker-compose.yaml**: Orchestrates the services and the message broker for local development.

## Data Flow

1. **Order Creation**
   - Client sends a request to `order-service` (server.js).
   - `order-service` publishes an event to the stream (producer.js).

2. **Event Consumption**
   - Both `notification-service` and `analytics-service` run consumers that listen to the stream.
   - Each service processes the event independently:
     - **notification-service**: Sends notifications (e.g., email, SMS).
     - **analytics-service**: Updates analytics, logs, or dashboards.

3. **Decoupling & Scalability**
   - Services are loosely coupled; new consumers can be added without changing the producer.
   - The stream ensures reliable delivery and supports horizontal scaling.

## File Structure

```
5.stream-based-communication(ASYNC)(event-driven)/
  docker-compose.yaml
  order-service/
    server.js         # API server
    producer.js       # Publishes events to stream
    package.json
  notification-service/
    consumer.js       # Consumes events, sends notifications
    package.json
  analytics-service/
    consumer.js       # Consumes events, processes analytics
    package.json
```

## Notes

- This pattern is ideal for real-time, scalable, and decoupled systems.
- The message broker (defined in docker-compose.yaml) is required for stream communication.
- Each consumer can process events at its own pace, enabling robust and flexible workflows.
