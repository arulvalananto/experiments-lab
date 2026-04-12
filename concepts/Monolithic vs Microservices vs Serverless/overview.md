# Monolithic vs Microservices vs Serverless

A monolith is usually one codebase, one database, and one deployment. For a small team, that’s often the simplest way to build and ship quickly. The problem arises when the codebase grows. A tiny fix in the cart code requires redeploying the whole app, and one bad release can take down everything with it.

Microservices try to solve that by breaking the system into separate services. Product, Cart, and Order run on their own, scale separately, and often manage their own data. That means you can ship changes to Cart without affecting the rest of the system.

But now you are dealing with multiple moving parts. You generally need service discovery, distributed tracing, and request routing between services.

Serverless is a different model. Instead of managing servers, you write functions that run when something triggers them, and the cloud provider handles the scaling. In many cases, you only pay when those functions actually run.

However, in serverless, cold starts can add latency, debugging across lots of stateless functions can get messy, and the more you build around one cloud’s runtime, the harder it gets to switch later.

Most production systems don't use just one approach. There's usually a monolith at the core, and over time teams spin up a few services where they need independent scaling or faster deploys. Serverless tends to show up later for things like notifications or background jobs.
