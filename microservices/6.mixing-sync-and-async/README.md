# Architecture

```diagram
            Client
               │
        (HTTP / gRPC)
               │
        Order Service
               │
     ┌─────────┴─────────┐
     │                   │
 (Event Stream)      (Local DB)
     │
 ┌───┼───────────┬───────────┐
 │   │           │           │
Notif  Analytics  Inventory   AI
```
