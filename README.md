# Project NANDA Typescript SDK

## Quickstart

**Install**

```bash
npm install @rahul240699/nanda-typescript-sdk
```

**CLI usage**

```bash
nanda-sdk \
  --anthropic-key $ANTHROPIC_API_KEY \
  --domain example.com \
  --num-agents 2 \
  --verbose
```

**SDK import**

```ts
import { NandaSdk } from "@projnanda/nanda-typescript-sdk";
```

## Ansible playbook

The `ansible/playbook.yml` provisions servers: Python, git, nginx, certbot, clones agent, sets up venv & systemd service.

## Templates

Systemd unit in `ansible/templates/internet_of_agents.service.j2` manages the agent service.
