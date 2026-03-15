# AI Agent Scheduling System

This project implements a cron-based AI agent scheduling system using Node.js, SQLite, Fastify, and Ollama (model configurable via environment variable).

## Features

- Define agents with tasks, schedules, and notification preferences
- Cron-based scheduling and execution
- LLM integration via Ollama
- Timeout and retry logic
- Email delivery of results
- Management API and monitoring via Fastify

## Environment Variables

- `OLLAMA_MODEL`: Ollama model to use (e.g., "llama2", "mistral")
- Email SMTP settings: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

## Setup

1. Install dependencies: `npm install`
2. Configure `.env` file with required variables
3. Start the service: `node index.js`

## Directory Structure

- `index.js` — service entry point
- `agent.js` — agent definition and runner
- `scheduler.js` — cron scheduling logic
- `email.js` — email delivery logic
- `db.js` — SQLite persistence
- `api.js` — Fastify management API
- `monitor.js` — Fastify status endpoint
- `.env` — environment variables

## Reference

See the plan in `/memories/session/plan.md` for implementation details.
