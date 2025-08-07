# Project NANDA Typescript SDK

## Pre-requisites

```bash
# SSH into the servers
# Ubuntu/Debian:
sudo apt update && sudo apt install -y nodejs npm
# RHEL/CentOS/Fedora (Amazon Linux):
sudo yum install -y nodejs npm git

# Install the NANDA SDK globally
git clone https://github.com/rahul240699/nanda-typescript-sdk.git

cd nanda-typescript-sdk

npm install

npm run build

sudo npm link         # registers the `bin` from package.json globally

# Verify CLI is registered
nanda-sdk --help
```

## Quickstart

**Install**

```bash
npm install @rahul240699/nanda-typescript-sdk
```

**CLI usage**

```bash
nanda-sdk \
  --anthropic-key <YOUR_ANTHROPIC_API_KEY> \
  --domain <myapp.example.com> \
  --num-agents 1 \
  --verbose
```

## Ansible playbook

The `ansible/playbook.yml` provisions servers: Python, git, nginx, certbot, clones agent, sets up venv & systemd service.

## Templates

Systemd unit in `ansible/templates/internet_of_agents.service.j2` manages the agent service.
