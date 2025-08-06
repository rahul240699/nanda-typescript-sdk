"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NandaAgent = void 0;
const axios_1 = __importDefault(require("axios"));
class NandaAgent {
    constructor(config) {
        this.config = config;
        this.client = axios_1.default.create({
            baseURL: config.baseUrl || 'https://api.projnanda.org',
            timeout: config.timeoutMs || 10000,
            headers: { 'Authorization': `Bearer ${config.apiKey}` }
        });
    }
    /**
     * Simple health-check / ping
     */
    async ping() {
        const res = await this.client.get('/v1/health');
        return res.status === 200;
    }
    /**
     * Send a prompt to a named agent
     */
    async send(agentId, prompt) {
        const res = await this.client.post('/v1/agents/' + agentId + '/execute', { prompt });
        return res.data.output;
    }
}
exports.NandaAgent = NandaAgent;
