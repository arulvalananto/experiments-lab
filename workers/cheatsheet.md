# 🧠 Workers – Cheat Sheet

## 1️⃣ Web Worker

### Purpose

Run JavaScript in a background thread to avoid blocking the main UI thread.

### Key Points

- Executes in isolation
- No access to DOM
- Communicates via `postMessage`
- Good for CPU-heavy tasks

### When to Use

- Large computations
- Data transformation
- Image/video processing
- ML inference
- Encryption/decryption
- Parsing large datasets

---

## 2️⃣ Worker Communication Model

### Main Thread ↔ Worker

- Uses message passing
- Structured cloning for data transfer
- Async communication pattern

### Important Concept

Workers do NOT share memory by default.

---

## 3️⃣ Transferable Objects

### Purpose

Improve performance by transferring ownership instead of copying data.

### Common Transferables

- ArrayBuffer
- ImageBitmap
- OffscreenCanvas
- MessagePort

### Benefit

- Zero-copy transfer
- Reduced memory overhead
- Better performance for large data

---

## 4️⃣ Structured Clone Algorithm

### What It Does

Automatically clones data sent via `postMessage`.

### Supports

- Objects
- Arrays
- JSON-compatible data

### Limitation

- Can be slow for very large payloads
- Not memory-efficient for big binary data

---

## 5️⃣ SharedWorker

### Purpose

Allows multiple browser tabs/windows to share a single worker instance.

### Key Characteristics

- Shared across contexts
- Uses ports for communication
- Useful for cross-tab coordination

### Best For

- Shared state
- Centralized WebSocket connection
- Preventing duplicate background tasks

---

## 6️⃣ Worker Pool Pattern

### Purpose

Use multiple workers to execute tasks in parallel.

### Benefits

- Better CPU utilization
- Task queue management
- Scalability
- Controlled concurrency

### Common Design

- Fixed number of workers
- Task queue
- Assign task to available worker

---

## 7️⃣ OffscreenCanvas

### Purpose

Enable rendering inside a worker thread.

### Supports

- 2D rendering
- WebGL rendering

### Benefits

- Move rendering off main thread
- Improve UI responsiveness
- Ideal for video pipelines

---

## 8️⃣ ImageBitmap

### Purpose

Efficient image transfer between threads.

### Advantage

- Faster than transferring raw pixel data
- Works well with video frames
- Supports zero-copy transfer

---

## 9️⃣ Performance Best Practices

- Use Transferables for large data
- Batch messages instead of frequent small updates
- Avoid unnecessary data cloning
- Implement worker pools for parallel workloads
- Handle errors properly
- Reuse workers when possible

---

## 🔟 Error Handling

- Listen for worker error events
- Wrap worker logic in try/catch
- Send structured error messages back to main thread

---

## 1️⃣1️⃣ Architecture Patterns

### Single Worker

For isolated heavy tasks.

### Worker Pool

For parallel CPU-bound workloads.

### SharedWorker

For cross-tab synchronization.

### Worker + OffscreenCanvas

For background rendering pipelines.

### Worker + WebSocket

For background real-time communication.

---

## 1️⃣2️⃣ When NOT to Use Workers

- Simple UI logic
- Small computations
- Lightweight tasks
- When overhead exceeds benefit

---

## 🏁 Summary

Web Workers improve performance by:

- Moving heavy work off the main thread
- Enabling parallel execution
- Supporting zero-copy data transfer
- Allowing advanced rendering pipelines
- Supporting cross-tab sharing via SharedWorker
