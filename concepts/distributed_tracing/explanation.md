# Distributed Tracing

- Services generate telemetry data (traces, logs, metrics) as they handle requests.
- The OpenTelemetry Collector receives this data from all services in a unified format.
- The collector splits the data into three streams: traces, logs, and metrics.
- Each stream is sent to a Receive & Process unit that prepares it for storage and analysis.
- Processed data is stored in a Log Database for querying and long-term access.
- Data from the database is visualized through a Visualization dashboard for monitoring and debugging.
