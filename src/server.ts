/**
 * Shared MCP Server creation logic
 * Used by both Node.js entry (index.ts) and CF Worker entry (worker.ts)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { N8nClient } from './n8n-client.js';
import { TOOLS } from './tools.js';

/**
 * Handle MCP tool calls by routing to N8nClient methods
 */
export async function handleToolCall(toolName: string, args: any, client: N8nClient): Promise<any> {
  switch (toolName) {
    // Workflow operations
    case 'n8n_list_workflows':
      return client.listWorkflows();
    case 'n8n_get_workflow':
      return client.getWorkflow(args.id);
    case 'n8n_create_workflow':
      return client.createWorkflow(args);
    case 'n8n_update_workflow':
      return client.updateWorkflow(args.id, args);
    case 'n8n_delete_workflow':
      return client.deleteWorkflow(args.id);
    case 'n8n_activate_workflow':
      return client.activateWorkflow(args.id);
    case 'n8n_deactivate_workflow':
      return client.deactivateWorkflow(args.id);
    case 'n8n_execute_workflow':
      return client.executeWorkflow(args.id, args.data);
    case 'n8n_get_workflow_tags':
      return client.getWorkflowTags(args.id);
    case 'n8n_update_workflow_tags':
      return client.updateWorkflowTags(args.id, args.tags);

    // Execution operations
    case 'n8n_list_executions':
      return client.listExecutions(args.workflowId);
    case 'n8n_get_execution':
      return client.getExecution(args.id);
    case 'n8n_delete_execution':
      return client.deleteExecution(args.id);
    case 'n8n_retry_execution':
      return client.retryExecution(args.id);

    // Credential operations
    case 'n8n_create_credential':
      return client.createCredential(args);
    case 'n8n_update_credential':
      return client.updateCredential(args.id, args);
    case 'n8n_delete_credential':
      return client.deleteCredential(args.id);
    case 'n8n_get_credential_schema':
      return client.getCredentialSchema(args.credentialType);

    // Tag operations
    case 'n8n_list_tags':
      return client.listTags();
    case 'n8n_get_tag':
      return client.getTag(args.id);
    case 'n8n_create_tag':
      return client.createTag(args.name);
    case 'n8n_update_tag':
      return client.updateTag(args.id, args.name);
    case 'n8n_delete_tag':
      return client.deleteTag(args.id);

    // User operations
    case 'n8n_list_users':
      return client.listUsers();
    case 'n8n_get_user':
      return client.getUser(args.identifier);
    case 'n8n_delete_user':
      return client.deleteUser(args.id);
    case 'n8n_update_user_role':
      return client.updateUserRole(args.id, args.role);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Create a configured MCP Server instance
 * Config is optional — tools/list works without config, tool calls require it
 */
export function createServer(config?: { apiUrl: string; apiKey: string }): Server {
  const server = new Server(
    {
      name: 'n8n-management-mcp',
      version: '1.0.5',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  let client: N8nClient | null = null;

  function getClient(): N8nClient {
    if (!client) {
      if (!config) {
        throw new Error(
          'Missing required configuration: N8N_URL and N8N_API_KEY. ' +
          'Set them before using any tools.'
        );
      }
      client = new N8nClient(config);
    }
    return client;
  }

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(name, args || {}, getClient());

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
