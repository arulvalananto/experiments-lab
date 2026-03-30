# API Gateway vs Load Balancer: A Comparison

## Load Balancer

A load balancer has one job: distribute traffic. Clients send HTTP(s) requests from web, mobile, or IoT apps, and the load balancer spreads those requests across multiple server instances so no single server takes all the load.

It handles:

Traffic distribution

Health checks to detect downed servers

Failover when something breaks

L4/L7 balancing depending on whether you're routing by IP or by actual HTTP content.

## API Gateway

An API gateway does a lot more than that. It also receives HTTP(s) requests from the same types of clients, but instead of just forwarding traffic, it controls what gets through and how.

Rate limiting to prevent abuse.

API aggregation so your client doesn't need to call five different services.

Observability for logging and monitoring.

Authentication and authorization before a request even touches your backend.

Request and response transformation to reshape payloads between client and service formats.

In most production setups, the load balancer and api gateway sit together. The API gateway handles the smart stuff up front, rate limits, auth, routing to the right microservice. Then the load balancer behind it distributes traffic across instances of that service.

They're not competing tools. They work best when used together.
