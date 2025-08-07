#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NandaSdk = void 0;

const axios_1 = require("axios");
const crypto_1 = require("crypto");
const fs_1 = require("fs/promises");
const os_1 = require("os");
const path_1 = require("path");
const js_yaml_1 = require("js-yaml");
const child_process_1 = require("child_process");
const util_1 = require("util");
const yargs_1 = require("yargs");
const helpers_1 = require("yargs/helpers");

const exec = util_1.promisify(child_process_1.exec);

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
        return crypto_1.randomInt(100000, 1000000);
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
    // … rest of methods (createAnsibleInventory, executeCommand, setupServer, setup)
}
exports.NandaSdk = NandaSdk;

(async () => {
    const argv = await yargs_1.default(helpers_1.hideBin(process.argv))
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