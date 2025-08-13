# Project NANDA Typescript SDK

The **NANDA Typescript SDK Node** package is a TypeScript-first SDK and CLI for the NANDA Base Agent. It provides a simple, type-safe API to spin up, manage, and communicate with your agents, plus an Ansible-driven server provisioning workflow. Use it to embed AI assistants in web apps, serverless functions, Node.js microservices, or custom CLI tools—all with zero boilerplate and full end-to-end automation.

## Setup Prerequisites

Before running the SDK, make sure you have the following:

### 1. AWS Account with a Running EC2 Linux Instance

Create an AWS account: https://aws.amazon.com
Launch an EC2 instance (any Linux distro, e.g., Amazon Linux, Ubuntu, Debian)
Allow the following ports in the security group:
22 (SSH), 80 (HTTP), 443 (HTTPS), 3000, 5001, 6000-6200, 8080, 6900
Save your .pem key file during instance creation — you'll need it to SSH.

### 2. Domain or Subdomain with A Record

Register a domain (or use a subdomain) via Namecheap, GoDaddy, etc.
In your domain registrar's DNS settings, create an A Record pointing to your EC2 instance's public IPv4 address.
For root domains, use @ as the host.
For subdomains, use something like agent.yourdomain.com.

### 3. Anthropic API Key

Sign up and request your API key from: https://www.anthropic.com

Once all the above is ready, proceed with installing and running the SDK below.

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

## Spin up an agent

```bash
# Setup with a random agent ID
nanda-sdk --anthropic-key <your_anthropic_api_key> --domain <myapp.example.com>

# Setup with a specific agent ID
nanda-sdk --anthropic-key <your_anthropic_api_key> --domain <myapp.example.com> --agent-id 123456

# Setup with multiple agents
nanda-sdk --anthropic-key <your_anthropic_api_key> --domain <myapp.example.com> --num-agents 3

# Setup with your own smithery key (allows access to Smithery MCP servers)
nanda-sdk --anthropic-key <your_anthropic_api_key> --domain <myapp.example.com> --smithery-key <your_smithery_api_key>

# Setup with your own registry
nanda-sdk --anthropic-key <your_anthropic_api_key> --domain <myapp.example.com> --registry-url <https://your-domain.com>
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

## Video Demonstration

https://drive.google.com/file/d/15lwFO3csHuURV52pbdOMulHEVkkkg-vZ/view?usp=drive_link

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
