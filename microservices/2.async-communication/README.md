# Async Communication (Order & Notification Microservices)

This folder demonstrates **asynchronous communication** between microservices using Node.js, Express, and Redis-backed queues (BullMQ).

## Overview

- **order-service**: Accepts new orders via HTTP and publishes notification jobs to a queue.
- **notification-service**: Runs a worker that listens for new jobs and processes notifications (e.g., sending emails or messages).
- **Redis**: Used as a message broker for the queue.

## How It Works

1. **Order Placement**
   - The `order-service` exposes a POST `/orders` endpoint.
   - When a new order is placed, it creates an order object and adds a job to the `notifications` queue (using BullMQ), containing order and user info.
   - The HTTP response is sent immediately—order processing and notification are decoupled.

2. **Notification Processing**
   - The `notification-service` runs a worker that listens to the `notifications` queue.
   - When a new job arrives, the worker processes it (e.g., simulates sending a notification to the user).
   - This allows notification handling to be retried, delayed, or scaled independently.

## Benefits of Async Communication

- **Decoupling**: Services operate independently; failures in notification do not block order placement.
- **Scalability**: Workers can be scaled horizontally to handle more jobs.
- **Reliability**: Jobs can be retried or delayed if processing fails.

## Running the Example

1. **Start Redis** (required for BullMQ):
   - Ensure Redis is running locally on port 6379 (default).
2. **Install dependencies** in both services:

   ```sh
   cd order-service && npm install
   cd ../notification-service && npm install
   ```

3. **Start services** (in separate terminals):

   ```sh
   # Terminal 1
   cd order-service && npm start
   # Terminal 2
   cd notification-service && npm start
   ```

4. **Test placing an order:**

   ```sh
   curl -X POST http://localhost:3000/orders \
     -H 'Content-Type: application/json' \
     -d '{"item": "Book", "userId": 123}'
   ```

   - The order-service responds immediately.
   - The notification-service logs the processing of the notification job.

## File Structure

```file
2.async-communication/
  order-service/
    index.js           # Express API, publishes jobs to queue
    package.json
  notification-service/
    worker.js          # BullMQ worker, processes jobs
    package.json
```

## Notes

- This pattern is ideal for tasks that can be processed out-of-band (e.g., emails, SMS, background jobs).
- For production, consider error handling, job retries, and monitoring.
