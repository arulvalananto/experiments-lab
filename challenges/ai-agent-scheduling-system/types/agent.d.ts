export interface Agent {
    id: number;
    name: string;
    task: string;
    system_prompt?: string;
    cron: string;
    email?: string;
    enabled: boolean;
    timeout?: number;
    max_retries?: number;
}

export interface Execution {
    id: number;
    agent_id: number;
    status: string;
    response: string;
    error: string;
    started_at: string;
    finished_at: string;
    retries: number;
    duration: number;
}
