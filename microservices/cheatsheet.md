# 🏗 What Are Microservices?

Instead of building:

```
One Big Application
```

We build:

```
Multiple Small Independent Services
```

Each service:

- Owns its **own database**
- Can be **deployed independently**
- Can fail without crashing everything
- Has a clear business responsibility

Example (Online Pizza Shop 🍕):

- 🧾 Order Service  
- 💳 Payment Service  
- 🚚 Delivery Service  
- 📧 Notification Service  

Each team owns its own logic and data.

---

# 🔄 Communication Styles

## 1️⃣ Synchronous (Sync)

You call and wait for response.

```
Order → call Payment → wait → continue
```

### Technologies

- HTTP (REST)
- gRPC

### Use When

- You need immediate response
- Flow is simple
- Low latency required

### Risk

- Tight coupling
- If dependency fails → you fail

---

## 2️⃣ Asynchronous (Async)

You send a message and continue.

```
Order → publish OrderCreated
Payment → reacts later
```

### Technologies

- RabbitMQ
- Kafka

### Use When

- Loose coupling needed
- Better scalability
- Failure isolation
- Event-driven systems

### Benefit

- Services don’t wait for each other

---

# 🎭 Saga Pattern (Distributed Transactions)

When multiple services must succeed together.

Example:

Booking Flow:

1. Reserve seat
2. Charge card
3. Send confirmation

If payment fails:
→ Cancel seat

That’s a **Saga**.

---

# 🎬 Saga Types

## 🟢 Choreography (No Boss)

Services react to events.

```
OrderCreated → Payment reacts
PaymentCompleted → Shipping reacts
```

There is **no central controller**.

### Pros

- Loose coupling
- Natural event-driven design

### Cons

- Harder to track flow
- Can become messy

---

## 🟣 Orchestration (One Boss)

One service controls the flow.

```
OrderSagaService:
   → call Payment
   → if success call Shipping
   → if failure trigger compensation
```

There is a **central coordinator**.

### Pros

- Clear flow
- Easier debugging

### Cons

- Orchestrator becomes important dependency

---

# 🧾 Outbox Pattern

## Problem

What if database saves successfully,
but event publishing fails?

You get inconsistent systems.

## Solution

1. Save business data
2. Save event in `outbox` table
3. Background worker publishes event

Guarantee:
> No state change without event.

Outbox = **technical reliability**

Saga = **business consistency**

They solve different problems.

---

# 🔁 Idempotency

In distributed systems, messages may be delivered twice.

Your service must safely handle duplicates.

Rule:

> If already processed → ignore.

Never trust messaging systems to deliver exactly once.

---

# 📡 gRPC vs HTTP

| HTTP | gRPC |
|------|------|
| Simple | Faster |
| JSON | Protobuf |
| Public APIs | Internal service-to-service |
| Easy debugging | Strong contracts |

### Rule of Thumb

- Public APIs → HTTP
- Internal high-performance APIs → gRPC

---

# 📨 RabbitMQ vs Kafka

| RabbitMQ | Kafka |
|----------|--------|
| Message broker | Event streaming platform |
| Queue-based | Log-based |
| Good for commands | Good for event streams |
| Flexible routing | High throughput |

Both are production-ready.

Kafka is not “better”.
It’s just different.

---

# 🧠 Microservices Core Principles

1. Each service owns its own data.
2. No shared database.
3. Prefer async over sync where possible.
4. Design for failure.
5. Make consumers idempotent.
6. Monitor everything (tracing, logs, metrics).
7. Don’t over-split too early.

---

# 🏆 Mental Model

## Monolith

```
One brain.
One database.
```

## Microservices

```
Many brains.
They talk through messages.
They sometimes disagree.
You design for failure.
```

---

# 🔥 Most Important Lesson

Microservices are NOT about:

- Kafka
- RabbitMQ
- gRPC
- Fancy tools

They are about:

> Managing distributed failure and consistency.

If you understand that,
you understand microservices.

---

# 📌 Quick Revision Summary

- Sync = call and wait  
- Async = publish and react  
- Outbox = reliable event publishing  
- Saga = distributed transaction handling  
- Choreography = no central controller  
- Orchestration = central controller  
- Idempotency = handle duplicates safely  
- Microservices = independent deployable units  
