# Ansible Quick Overview

## What is Ansible?

- Automation tool for:
  - Configuration management
  - Application deployment
  - Task automation
- Agentless (uses SSH)

## Key Components

### 1. Inventory (.ini)

- Defines target machines

Example:
[target]
server1 ansible_user=root ansible_password=root

### 2. Module

- Prebuilt tasks executed on hosts
- Examples: ping, apt, yum, copy

### 3. Playbook (YAML)

- Defines automation steps

Example:

```yaml
- name: Install nginx
  hosts: target
  become: yes
  tasks:
  - name: Install nginx
      apt:
        name: nginx
        state: present
```

### 4. Task

- A single action inside a playbook

## Basic Workflow

1. Create inventory file
2. Write playbook
3. Run command

## Commands

Test connection:
ansible all -i inventory.ini -m ping

Run playbook:
ansible-playbook -i inventory.ini playbook.yml

## With Docker

- Use containers as hosts
- Use container names as inventory hosts

Example:
[target]
target1

## Key Benefits

- Simple YAML syntax
- No agents required
- Works over SSH
- Idempotent (safe to run multiple times)

## When to Use

- Configure servers
- Deploy apps
- Automate repetitive tasks
