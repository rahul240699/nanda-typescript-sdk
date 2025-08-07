export interface NandaConfig {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
}
export declare class NandaAgent {
    private config;
    private client;
    constructor(config: NandaConfig);
    /**
     * Simple health-check / ping
     */
    ping(): Promise<boolean>;
    /**
     * Send a prompt to a named agent
     */
    send(agentId: string, prompt: string): Promise<string>;
}
