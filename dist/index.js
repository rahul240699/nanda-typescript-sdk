#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NandaSdk = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const fs = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const exec = (0, util_1.promisify)(child_process_1.exec);
class NandaSdk {
    constructor(config) {
        this.domain = config.domain;
        this.numAgents = config.numAgents;
        this.registryUrl = config.registryUrl;
        this.agentId = config.agentId ?? this.generateAgentId();
        console.info(`Using agent ID: ${this.agentId}`);
        console.info(`Using domain: ${this.domain}`);
        console.info(`Number of agents: ${this.numAgents}`);
        console.info(`Registry URL: ${this.registryUrl}`);
    }
    generateAgentId() {
        return (0, crypto_1.randomInt)(100000, 1000000);
    }
    async getPublicIp() {
        const services = [
            'https://api.ipify.org',
            'https://ifconfig.me/ip',
            'https://icanhazip.com'
        ];
        for (const url of services) {
            try {
                const res = await axios_1.default.get(url, { timeout: 5000 });
                if (res.status === 200) {
                    const ip = res.data.trim();
                    console.info(`Detected public IP: ${ip}`);
                    return ip;
                }
            }
            catch (err) {
                console.warn(`Failed to fetch IP from ${url}: ${err}`);
                continue;
            }
        }
        throw new Error('Unable to detect public IP from any service');
    }
    async createAnsibleInventory() {
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
    async executeCommand(cmd) {
        try {
            const { stdout, stderr } = await exec(cmd);
            return { stdout, stderr };
        }
        catch (err) {
            return { stdout: err.stdout ?? '', stderr: err.stderr ?? err.message };
        }
    }
    async setupServer(anthropicKey, smitheryKey, verbose = false) {
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
            await fs.writeFile(yamlPath, js_yaml_1.default.dump(vars), 'utf8');
            const playbook = path.join(__dirname, '..', 'ansible', 'playbook.yml');
            const verboseFlag = verbose ? '-vvv' : '';
            const cmd = `ansible-playbook -i ${inventoryPath} ${playbook} ${verboseFlag}`;
            console.info(`Running: ${cmd}`);
            const { stdout, stderr } = await this.executeCommand(cmd);
            if (stdout)
                console.info(stdout);
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
        }
        catch (err) {
            console.error(`Setup error: ${err}`);
            return false;
        }
        finally {
            try {
                if (inventoryPath)
                    await fs.unlink(inventoryPath);
            }
            catch { }
            try {
                await fs.rmdir(groupVarsDir, { recursive: true });
            }
            catch { }
        }
    }
    async setup(anthropicKey, smitheryKey, verbose = false) {
        return this.setupServer(anthropicKey, smitheryKey, verbose);
    }
}
exports.NandaSdk = NandaSdk;
// CLI
(async () => {
    const argv = await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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