/**
 * Shared MCP Server creation logic
 * Used by both Node.js entry (index.ts) and CF Worker entry (worker.ts)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
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
      version: '1.0.7',
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
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

  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'manage-workflows',
          description: 'Guide for managing n8n workflows — list, create, activate, execute, and organize with tags',
        },
        {
          name: 'debug-execution',
          description: 'Step-by-step guide to diagnose and fix failed n8n workflow executions',
        },
      ],
    };
  });

  // Get prompt content
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;

    switch (name) {
      case 'manage-workflows':
        return {
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: [
                  'You are an n8n workflow management assistant. Help me manage my n8n automations.',
                  '',
                  'Available actions:',
                  '1. **List workflows** — Use n8n_list_workflows to see all automations',
                  '2. **Inspect workflow** — Use n8n_get_workflow to see nodes and connections',
                  '3. **Create workflow** — Use n8n_create_workflow with name, nodes, and connections',
                  '4. **Activate/Deactivate** — Use n8n_activate_workflow or n8n_deactivate_workflow',
                  '5. **Execute manually** — Use n8n_execute_workflow to test with custom data',
                  '6. **Organize with tags** — Use n8n_list_tags, n8n_create_tag, n8n_update_workflow_tags',
                  '',
                  'Start by listing my current workflows.',
                ].join('\n'),
              },
            },
          ],
        };

      case 'debug-execution':
        return {
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: [
                  'You are an n8n debugging assistant. Help me find and fix failed workflow executions.',
                  '',
                  'Debugging steps:',
                  '1. **Find failures** — Use n8n_list_executions to find executions with error status',
                  '2. **Get details** — Use n8n_get_execution to see the full error message and which node failed',
                  '3. **Inspect workflow** — Use n8n_get_workflow to understand the workflow structure',
                  '4. **Check credentials** — Use n8n_get_credential_schema to verify required fields',
                  '5. **Retry** — Use n8n_retry_execution to rerun after fixing the issue',
                  '6. **Clean up** — Use n8n_delete_execution to remove old test runs',
                  '',
                  'Start by listing recent executions to find any failures.',
                ].join('\n'),
              },
            },
          ],
        };

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'n8n://server-info',
          name: 'n8n Server Info',
          description: 'Connection status and available tools for this n8n MCP server',
          mimeType: 'application/json',
        },
      ],
    };
  });

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case 'n8n://server-info':
        return {
          contents: [
            {
              uri: 'n8n://server-info',
              mimeType: 'application/json',
              text: JSON.stringify({
                name: 'n8n-management-mcp',
                version: '1.0.7',
                connected: !!config,
                n8n_url: config?.apiUrl ?? null,
                tools_available: TOOLS.length,
                tool_categories: {
                  workflows: 10,
                  executions: 4,
                  credentials: 4,
                  tags: 5,
                  users: 4,
                },
              }, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  return server;
}
