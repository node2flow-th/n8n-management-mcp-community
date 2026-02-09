#!/usr/bin/env node
/**
 * n8n Management MCP Server
 *
 * Community edition — connects directly to your n8n instance.
 *
 * Usage (stdio - for Claude Desktop / Cursor / VS Code):
 *   N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp
 *
 * Usage (HTTP - Streamable HTTP transport):
 *   N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp --http
 */

import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  StreamableHTTPServerTransport,
} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { N8nClient } from './n8n-client.js';
import { TOOLS } from './tools.js';

/**
 * Read config from environment variables
 */
function getConfig() {
  const apiUrl = process.env.N8N_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('Error: Missing required environment variables');
    console.error('');
    console.error('Required:');
    console.error('  N8N_URL      Your n8n instance URL (e.g., https://n8n.example.com)');
    console.error('  N8N_API_KEY  Your n8n API key');
    console.error('');
    console.error('Usage (stdio):');
    console.error('  N8N_URL=https://n8n.example.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp');
    console.error('');
    console.error('Usage (HTTP):');
    console.error('  N8N_URL=https://n8n.example.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp --http');
    process.exit(1);
  }

  return { apiUrl, apiKey };
}

/**
 * Handle MCP tool calls by routing to N8nClient methods
 */
async function handleToolCall(toolName: string, args: any, client: N8nClient): Promise<any> {
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

    // Variable operations
    case 'n8n_list_variables':
      return client.listVariables();
    case 'n8n_create_variable':
      return client.createVariable(args.key, args.value);
    case 'n8n_update_variable':
      return client.updateVariable(args.id, args.key, args.value);
    case 'n8n_delete_variable':
      return client.deleteVariable(args.id);

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
 */
function createServer(client: N8nClient): Server {
  const server = new Server(
    {
      name: 'n8n-management-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(name, args || {}, client);

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

/**
 * Start in stdio mode (for Claude Desktop, Cursor, VS Code)
 */
async function startStdio(client: N8nClient) {
  const server = createServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('n8n Management MCP Server running on stdio');
  console.error(`Connected to: ${client['config'].apiUrl}`);
  console.error(`Tools available: ${TOOLS.length}`);
  console.error('Ready for MCP client\n');
}

/**
 * Start in HTTP mode (Streamable HTTP transport)
 */
async function startHttp(client: N8nClient) {
  const port = parseInt(process.env.PORT || '3000', 10);
  const app = createMcpExpressApp();

  // Map of active transports by session ID
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  // POST /mcp — handle MCP requests
  app.post('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid: string) => {
            transports[sid] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        const server = createServer(client);
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // GET /mcp — SSE stream for existing sessions
  app.get('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  // DELETE /mcp — session termination
  app.delete('/mcp', async (req: any, res: any) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  // Health check
  app.get('/', (_req: any, res: any) => {
    res.json({
      name: 'n8n-management-mcp',
      version: '1.0.0',
      status: 'ok',
      tools: TOOLS.length,
      transport: 'streamable-http',
      endpoints: {
        mcp: '/mcp',
      },
    });
  });

  app.listen(port, () => {
    console.log(`n8n Management MCP Server (HTTP) listening on port ${port}`);
    console.log(`Connected to: ${client['config'].apiUrl}`);
    console.log(`Tools available: ${TOOLS.length}`);
    console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    for (const sessionId in transports) {
      try {
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch {
        // Ignore cleanup errors
      }
    }
    process.exit(0);
  });
}

/**
 * Main entry point
 */
async function main() {
  const config = getConfig();
  const client = new N8nClient(config);

  const useHttp = process.argv.includes('--http');

  if (useHttp) {
    await startHttp(client);
  } else {
    await startStdio(client);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
