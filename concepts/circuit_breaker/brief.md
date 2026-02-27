# 🔌 Circuit Breaker — Quick Cheat Sheet

## One-Liner Definition

Circuit breaker is a resilience pattern that stops calling a failing dependency to prevent cascading failures and allows the system to recover gracefully.

## 🚦 The 3 States

### 🟢 1. CLOSED (Normal)

- Requests go through normally.
- Failures are counted.
- If failures exceed threshold → OPEN.

### 🔴 2. OPEN (Stop Calling)

- Too many failures.
- Stop calling immediately.
- Return: `Service temporarily unavailable`
- After some time → HALF-OPEN.

### 🟡 3. HALF-OPEN (Testing)

- Allow 1 test request.
- If success → CLOSED.
- If failure → OPEN again.

---

## 💡 Simple Microservice Example

```text
Order Service → Payment Service
```

If Payment keeps failing:

### ❌ Without Circuit Breaker

- Order waits
- Threads pile up
- System slows down
- Possible crash

### ✅ With Circuit Breaker

- After 5 failures → STOP calling
- Immediately return:
  503 Service Unavailable
- System stays healthy

---

## 🔁 Retry vs 🔌 Circuit Breaker

### Retry

"Maybe it failed once. Try again."

- Good for temporary network glitches.
- Can increase pressure on failing service.

### Circuit Breaker

"Okay this is broken. Stop trying."

- Protects system.
- Fails fast.
- Reduces pressure.

### Best Practice

Retry a few times →  
If still failing → Circuit Breaker opens.

---

## 🧩 When To Use It

Use it when calling:

- Another microservice
- External API
- Payment provider
- Remote database
- Any network dependency

Do NOT use for:

- Internal function calls
- Local logic

---

## 🧾 10-Second Memory Trigger

If a dependency fails repeatedly:

1. Stop calling  
2. Fail fast  
3. Try again later  

That’s Circuit Breaker.

## Manual Override

In emergencies, you can manually open or close the circuit to control traffic flow.

You can do this via:

- Admin API (e.g., `/admin/circuit-breaker/open`, `/admin/circuit-breaker/close`)
- Feature flag system
  - Redis Toggle
  - Environment flag
  - Config server
  - LaunchDarkly

## Popular Libraries

- Node.js: `opossum`
- Python: `pybreaker`
