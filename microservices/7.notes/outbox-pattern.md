# Outbox Pattern

The problem it solves (real failure)

Classic bug:

```code
1. Save order to DB  ✅
2. Publish OrderCreated event ❌ (broker down)
```

Result:
 • Order exists
 • No event
 • Downstream services never react
 • Silent data corruption 😬

⸻

## The Outbox idea (simple)

Write the event to the same DB transaction as your business data.
Publish it later, reliably.

## Mental model

```diagram
Order Service DB
 ├─ orders
 └─ outbox_events   ← this is the key
```

## Minimal Outbox Schema

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  event_type TEXT,
  payload JSONB,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

## Writing data + event (same transaction)

```js
async function createOrder(db, order) {
  await db.transaction(async (trx) => {
    await trx('orders').insert(order);

    await trx('outbox_events').insert({
      id: crypto.randomUUID(),
      event_type: 'OrderCreated',
      payload: JSON.stringify(order),
    });
  });
}
```

✔ Either both happen
✔ Or neither happen

## Outbox Publisher (background worker)

```js
async function publishOutboxEvents() {
  const events = await db('outbox_events')
    .where({ published: false })
    .limit(10);

  for (const event of events) {
    await publish(event.event_type, event.payload);

    await db('outbox_events')
      .where({ id: event.id })
      .update({ published: true });
  }
}
```

Run this every few seconds.

⸻

## Pros

- no dual-write problem
- works with Kafka / RabbitMQ
- extremely boring (that’s good)

📌 Outbox is almost mandatory for serious async systems.
