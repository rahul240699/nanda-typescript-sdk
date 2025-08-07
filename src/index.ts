#!/usr/bin/env node

import axios from 'axios';
import { randomInt } from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import yaml from 'js-yaml';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const exec = promisify(execCallback);

export interface NandaConfig {
  domain: string;
  numAgents: number;
  registryUrl: string;
  agentId?: number;
}

export class NandaSdk {
  private agentId: number;
  private domain: string;
  private numAgents: number;
  private registryUrl: string;

  constructor(config: NandaConfig) {
    this.domain = config.domain;
    this.numAgents = config.numAgents;
    this.registryUrl = config.registryUrl;
    this.agentId = config.agentId ?? this.generateAgentId();

    console.info(`Using agent ID: ${this.agentId}`);
    console.info(`Using domain: ${this.domain}`);
    console.info(`Number of agents: ${this.numAgents}`);
    console.info(`Registry URL: ${this.registryUrl}`);
  }

  private generateAgentId(): number {
    return randomInt(100000, 1000000);
  }

  async getPublicIp(): Promise<string> {
    const services = [
      'https://api.ipify.org',
      'https://ifconfig.me/ip',
      'https://icanhazip.com'
    ];
    for (const url of services) {
      try {
        const res = await axios.get<string>(url, { timeout: 5000 });
        if (res.status === 200) {
          const ip = res.data.trim();
          console.info(`Detected public IP: ${ip}`);
          return ip;
        }
      } catch (err) {
        console.warn(`Failed to fetch IP from ${url}: ${err}`);
        continue;
      }
    }
    throw new Error('Unable to detect public IP from any service');
  }

  async createAnsibleInventory(): Promise<string> {
    const ip = await this.getPublicIp();
    const content = `[servers]
server ansible_host=${ip}

[all:vars]
ansible_user=root
ansible_connection=local
ansible_python_interpreter=/usr/bin/python3
domain_name=${this.domain}
agent_id_prefix=${this.agentId}
github_repo=https://github.com/aidecentralized/nanda-agent.git
registry_url=${this.registryUrl}
`;
    const filePath = path.join(os.tmpdir(), 'ioa_inventory.ini');
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
  }

  async executeCommand(cmd: string): Promise<{ stdout: string; stderr: string }> {
    try {
      const { stdout, stderr } = await exec(cmd);
      return { stdout, stderr };
    } catch (err: any) {
      return { stdout: err.stdout ?? '', stderr: err.stderr ?? err.message };
    }
  }

  async setupServer(
    anthropicKey: string,
    smitheryKey: string,
    verbose = false
  ): Promise<boolean> {
    let inventoryPath = '';
    const groupVarsDir = path.join(os.tmpdir(), 'group_vars');
    try {
      inventoryPath = await this.createAnsibleInventory();
      console.info(`Inventory created at ${inventoryPath}`);

      await fs.mkdir(groupVarsDir, { recursive: true });
      const vars = {
        anthropic_api_key: anthropicKey,
        smithery_api_key: smitheryKey,
        domain_name: this.domain,
        agent_id_prefix: this.agentId,
        github_repo: 'https://github.com/aidecentralized/nanda-agent.git',
        num_agents: this.numAgents,
        registry_url: this.registryUrl
      };
      const yamlPath = path.join(groupVarsDir, 'all.yml');
      await fs.writeFile(yamlPath, yaml.dump(vars), 'utf8');

      const playbook = path.join(__dirname, '..', 'ansible', 'playbook.yml');
      const verboseFlag = verbose ? '-vvv' : '';
      const cmd = `ansible-playbook -i ${inventoryPath} ${playbook} ${verboseFlag}`;
      console.info(`Running: ${cmd}`);
      const { stdout, stderr } = await this.executeCommand(cmd);

      if (stdout) console.info(stdout);
      if (stderr) {
        console.error(stderr);
        return false;
      }
      if (stdout.includes('failed=1')) {
        console.error('Playbook failed');
        return false;
      }
      console.info('Server setup succeeded');
      return true;
    } catch (err) {
      console.error(`Setup error: ${err}`);
      return false;
    } finally {
      try { if (inventoryPath) await fs.unlink(inventoryPath); } catch {}
      try { await fs.rmdir(groupVarsDir, { recursive: true }); } catch {}
    }
  }

  async setup(
    anthropicKey: string,
    smitheryKey: string,
    verbose = false
  ): Promise<boolean> {
    return this.setupServer(anthropicKey, smitheryKey, verbose);
  }
}

// CLI
(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option('anthropic-key', { type: 'string', demandOption: true })
    .option('domain', { type: 'string', demandOption: true })
    .option('smithery-key', { type: 'string' })
    .option('agent-id', { type: 'number' })
    .option('num-agents', { type: 'number', default: 1 })
    .option('registry-url', { type: 'string', default: 'https://chat.nanda-registry.com:6900' })
    .option('verbose', { type: 'boolean', default: false })
    .parse();

  const smitheryKey = argv['smithery-key'] ?? 'b4e92d35-0034-43f0-beff-042466777ada';
  const sdk = new NandaSdk({
    domain: argv.domain,
    numAgents: argv['num-agents'],
    registryUrl: argv['registry-url'],
    agentId: argv['agent-id']
  });

  const success = await sdk.setup(argv['anthropic-key'], smitheryKey, argv.verbose);
  process.exit(success ? 0 : 1);
})();
