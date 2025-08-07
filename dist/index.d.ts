#!/usr/bin/env node
export interface NandaConfig {
    domain: string;
    numAgents: number;
    registryUrl: string;
    agentId?: number;
}
export declare class NandaSdk {
    private agentId;
    private domain;
    private numAgents;
    private registryUrl;
    constructor(config: NandaConfig);
    private generateAgentId;
    getPublicIp(): Promise<string>;
    createAnsibleInventory(): Promise<string>;
    executeCommand(cmd: string): Promise<{
        stdout: string;
        stderr: string;
    }>;
    setupServer(anthropicKey: string, smitheryKey: string, verbose?: boolean): Promise<boolean>;
    setup(anthropicKey: string, smitheryKey: string, verbose?: boolean): Promise<boolean>;
}