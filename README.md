# Project NANDA Typescript SDK

The **NANDA Typescript SDK Node** package is a TypeScript-first SDK and CLI for the NANDA Base Agent. It provides a simple, type-safe API to spin up, manage, and communicate with your agents, plus an Ansible-driven server provisioning workflow. Use it to embed AI assistants in web apps, serverless functions, Node.js microservices, or custom CLI tools—all with zero boilerplate and full end-to-end automation.

## Pre-requisites

```bash
# SSH into the servers
# Ubuntu/Debian:
sudo apt update && sudo apt install -y nodejs npm git ansible
# RHEL/CentOS/Fedora (Amazon Linux):
sudo yum install -y nodejs npm git ansible

# Install the NANDA SDK globally
git clone https://github.com/rahul240699/nanda-typescript-sdk.git

cd nanda-typescript-sdk

npm install

npm run build

sudo npm link         # registers the `bin` from package.json globally

chmod +x ./dist/index.js

# Verify CLI is registered
nanda-sdk --help
```

## Verify Installation

After setup completes, verify your agent is running:

```bash
# Check service status
systemctl status internet_of_agents

# View logs
journalctl -u internet_of_agents -f

# list of servers
ps aux | grep run_ui_agent_https
```

Your agent will be:

-   Running as a systemd service
-   Accessible at your specified domain
-   Automatically starting on server reboot

```

## Ansible playbook

The `ansible/playbook.yml` provisions servers: Python, git, nginx, certbot, clones agent, sets up venv & systemd service.

## Templates

Systemd unit in `ansible/templates/internet_of_agents.service.j2` manages the agent service.
```
