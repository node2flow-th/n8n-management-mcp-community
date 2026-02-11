/**
 * n8n API Client
 * Wrapper for n8n REST API v1 calls with error handling
 */

import { N8nConfig } from './types.js';

export class N8nClient {
  private config: N8nConfig;
  private apiBase: string;
  private timeout: number;

  constructor(config: N8nConfig) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl.replace(/\/+$/, ''),
    };
    this.apiBase = config.apiPath || '/api/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make authenticated request to n8n API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(this.timeout),
      headers: {
        'X-N8N-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`n8n API Error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // Workflow Methods
  async listWorkflows(params?: { active?: boolean; tags?: string }) {
    const query = new URLSearchParams();
    if (params?.active !== undefined) query.set('active', String(params.active));
    if (params?.tags) query.set('tags', params.tags);
    const qs = query.toString();
    return this.request(`${this.apiBase}/workflows${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async getWorkflow(id: string) {
    return this.request(`${this.apiBase}/workflows/${id}`, { method: 'GET' });
  }

  async createWorkflow(workflow: any) {
    return this.request(`${this.apiBase}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, workflow: any) {
    return this.request(`${this.apiBase}/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request(`${this.apiBase}/workflows/${id}`, { method: 'DELETE' });
  }

  async activateWorkflow(id: string) {
    return this.request(`${this.apiBase}/workflows/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateWorkflow(id: string) {
    return this.request(`${this.apiBase}/workflows/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async executeWorkflow(id: string, data?: any) {
    return this.request(`${this.apiBase}/workflows/${id}/run`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getWorkflowTags(id: string) {
    return this.request(`${this.apiBase}/workflows/${id}/tags`, { method: 'GET' });
  }

  async updateWorkflowTags(id: string, tags: string[]) {
    return this.request(`${this.apiBase}/workflows/${id}/tags`, {
      method: 'PUT',
      body: JSON.stringify(tags.map(t => ({ name: t }))),
    });
  }

  // Execution Methods
  async listExecutions(workflowId?: string) {
    const query = workflowId ? `?workflowId=${workflowId}` : '';
    return this.request(`${this.apiBase}/executions${query}`, { method: 'GET' });
  }

  async getExecution(id: string) {
    return this.request(`${this.apiBase}/executions/${id}`, { method: 'GET' });
  }

  async deleteExecution(id: string) {
    return this.request(`${this.apiBase}/executions/${id}`, { method: 'DELETE' });
  }

  async retryExecution(id: string) {
    return this.request(`${this.apiBase}/executions/${id}/retry`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Credential Methods
  async createCredential(credential: any) {
    return this.request(`${this.apiBase}/credentials`, {
      method: 'POST',
      body: JSON.stringify(credential),
    });
  }

  async updateCredential(id: string, credential: any) {
    return this.request(`${this.apiBase}/credentials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(credential),
    });
  }

  async deleteCredential(id: string) {
    return this.request(`${this.apiBase}/credentials/${id}`, { method: 'DELETE' });
  }

  async getCredentialSchema(credentialType: string) {
    return this.request(`${this.apiBase}/credentials/schema/${credentialType}`, {
      method: 'GET',
    });
  }

  // Tag Methods
  async listTags() {
    return this.request(`${this.apiBase}/tags`, { method: 'GET' });
  }

  async getTag(id: string) {
    return this.request(`${this.apiBase}/tags/${id}`, { method: 'GET' });
  }

  async createTag(name: string) {
    return this.request(`${this.apiBase}/tags`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateTag(id: string, name: string) {
    return this.request(`${this.apiBase}/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteTag(id: string) {
    return this.request(`${this.apiBase}/tags/${id}`, { method: 'DELETE' });
  }

  // Variable Methods
  async listVariables() {
    return this.request(`${this.apiBase}/variables`, { method: 'GET' });
  }

  async createVariable(key: string, value: string) {
    return this.request(`${this.apiBase}/variables`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async updateVariable(id: string, key: string, value: string) {
    return this.request(`${this.apiBase}/variables/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  async deleteVariable(id: string) {
    return this.request(`${this.apiBase}/variables/${id}`, { method: 'DELETE' });
  }

  // User Methods (requires owner permissions)
  async listUsers() {
    return this.request(`${this.apiBase}/users`, { method: 'GET' });
  }

  async getUser(identifier: string) {
    return this.request(`${this.apiBase}/users/${identifier}`, { method: 'GET' });
  }

  async deleteUser(id: string) {
    return this.request(`${this.apiBase}/users/${id}`, { method: 'DELETE' });
  }

  async updateUserRole(id: string, role: 'admin' | 'member') {
    return this.request(`${this.apiBase}/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}
