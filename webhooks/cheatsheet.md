# Webhook Cheatsheet

## 1️⃣ What is a Webhook?

A webhook is an HTTP callback triggered by an external event.

Instead of polling:

GET /payment-status?id=123   ❌

Provider pushes event to your endpoint:

POST /webhook/payment       ✅

---

## 2️⃣ Typical Webhook Flow (Payment Example)

1. User initiates payment
2. You create payment via provider API (Stripe/Razorpay/etc)
3. User completes payment
4. Provider sends webhook event to your server
5. You:
   - Verify signature
   - Check idempotency
   - Process event
   - Return 2xx immediately

---

## 3️⃣ MUST-FOLLOW Production Rules

✅ Always verify signature  
✅ Always use HTTPS  
✅ Always handle idempotency  
✅ Always return 2xx fast  
✅ Move heavy logic to background worker  
✅ Log event IDs  

---

## 4️⃣ Express Setup (IMPORTANT)

⚠️ Signature verification requires raw body

```js
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);
```

DO NOT use:

```js
express.json()
```

before verifying signature.

---

## 5️⃣ Signature Verification (HMAC SHA256)

```js
const crypto = require("crypto");

function verifySignature(req, secret) {
  const signature = req.headers["x-signature"];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (signature !== expected) {
    throw new Error("Invalid signature");
  }
}
```

---

## 6️⃣ Basic Webhook Handler Template

```js
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    verifySignature(req, process.env.WEBHOOK_SECRET);

    const event = JSON.parse(req.body.toString());

    // 1. Idempotency check
    const exists = await db.findEvent(event.id);
    if (exists) return res.sendStatus(200);

    // 2. Save event ID
    await db.saveEvent(event.id);

    // 3. Push to queue (recommended)
    await queue.add("webhook-event", event);

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(400);
  }
});
```

---

## 7️⃣ Idempotency (CRITICAL)

Why?

Providers retry if:

- You return 500
- Timeout
- Network failure

Solution:

Store unique event ID.

```js
if (eventAlreadyProcessed(event.id)) {
  return 200;
}
```

Database table example:

| id (event_id) | type | processed_at |

Make `event_id` UNIQUE.

---

## 8️⃣ Production Architecture Pattern

Webhook Endpoint → Validate → Push to Queue → Return 200

Worker:

Queue → Process → Update DB → Send Email → Done

NEVER do heavy work inside webhook request.

---

## 9️⃣ Security Techniques

## ✅ Signature Verification (Best Practice)

HMAC + secret

## ✅ HTTPS (Mandatory)

## ✅ Timestamp Validation

Reject if timestamp older than 5 minutes

## ✅ IP Whitelisting (Optional)

## ✅ Secret in Header (Basic Protection)

---

## 🔟 Status Codes

Return 2xx → Provider stops retrying  
Return 4xx/5xx → Provider retries  

ALWAYS return 200 after successful validation + queue push.

---

## 1️⃣1️⃣ Common Mistakes

❌ Not verifying signature  
❌ Using express.json() before validation  
❌ Not handling retries  
❌ Doing heavy DB/email logic inside handler  
❌ Not logging event IDs  
❌ Not setting timeout limits  

---

## 1️⃣2️⃣ Retry Handling Strategy

Design idempotent logic:

Bad:

INSERT transaction blindly

Good:

UPSERT transaction WHERE event_id = ?

---

## 1️⃣3️⃣ Advanced Production Design

## Dead Letter Queue (DLQ)

If event fails after X retries → move to DLQ

## Observability

Log:

- event.id
- event.type
- processing_time
- status

## Versioning

/webhook/v1/payment
/webhook/v2/payment

---

## 1️⃣4️⃣ AWS Serverless Pattern

Stripe → API Gateway → Lambda → SQS → Worker Lambda → DB

Benefits:

- Scalable
- Decoupled
- Retry-safe
- Production-ready

---

## 🎯 Mental Model

Webhooks = External Event Producer

Treat them like:

- Untrusted input
- Retriable events
- Eventually consistent
- Distributed system component

---

## 🧠 Golden Rule

Validate → Deduplicate → Queue → Respond Fast

---
