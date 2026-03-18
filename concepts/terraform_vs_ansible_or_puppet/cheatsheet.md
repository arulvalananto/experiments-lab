# 🚀 Terraform vs Ansible Cheat Sheet

## 🏗️ Terraform (Infrastructure as Code)

- Purpose: Create & manage infrastructure
- Layer: Cloud / Infra level
- Examples:
  - Create EC2 / VMs
  - Setup VPC, subnets
  - Create load balancers, DBs
- Nature: Declarative
- Agent: None
- Runs: On demand
- Output: Servers/resources

👉 Think: "Build the infrastructure"

---

## ⚙️ Ansible (Configuration Management)

- Purpose: Configure servers
- Layer: Inside the server (OS level)
- Examples:
  - Install Docker, Node.js
  - Setup Nginx
  - Manage users & SSH keys
  - Deploy applications
- Nature: Mostly declarative (YAML)
- Agent: Agentless (SSH)
- Runs: Push (manual/CI)

👉 Think: "Set up the server"

---

## 🔁 How they work together

1. Terraform → creates servers
2. Ansible → configures those servers

---

## 🧠 Quick Memory Trick

- Terraform = 🏗️ Build
- Ansible = ⚙️ Configure

---

## 🔥 One-liner

Terraform provisions infrastructure.
Ansible configures and manages it.

---

## ⚡ Bonus (Puppet vs Ansible)

- Puppet = Agent-based, continuous enforcement
- Ansible = Agentless, simple & fast
