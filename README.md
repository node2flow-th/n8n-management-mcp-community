# n8n Management MCP Server

[![npm version](https://img.shields.io/npm/v/@node2flow/n8n-management-mcp.svg)](https://www.npmjs.com/package/@node2flow/n8n-management-mcp)
[![npm version](https://img.shields.io/npm/v/n8n-management-mcp.svg)](https://www.npmjs.com/package/n8n-management-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[ภาษาไทย](README.th.md)

MCP (Model Context Protocol) server for connecting AI assistants to your n8n instance. Manage workflows, executions, credentials, tags, variables, and users through 31 tools.

Works with Claude Desktop, Cursor, VS Code, and any MCP client.

---

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@node2flow/n8n-management-mcp"],
      "env": {
        "N8N_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-n8n-api-key"
      }
    }
  }
}
```

### Cursor / VS Code

Add to MCP settings:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@node2flow/n8n-management-mcp"],
      "env": {
        "N8N_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-n8n-api-key"
      }
    }
  }
}
```

### HTTP Mode (Streamable HTTP)

For remote deployment or shared access:

```bash
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp --http
```

Server starts on port 3000 (configurable via `PORT` env var). MCP endpoint: `http://localhost:3000/mcp`

---

## Configuration

| Environment Variable | Required | Description |
|---|---|---|
| `N8N_URL` | Yes | URL of your n8n instance (e.g. `https://n8n.example.com`) |
| `N8N_API_KEY` | Yes | n8n API key ([how to create](https://docs.n8n.io/api/authentication/)) |
| `PORT` | No | Port for HTTP server (default: `3000`, only used with `--http`) |

---

## All Tools (31 tools)

### Workflow Management (10 tools)

| Tool | Description |
|---|---|
| `n8n_list_workflows` | List all workflows with status and tags |
| `n8n_get_workflow` | Get workflow details (nodes, connections) |
| `n8n_create_workflow` | Create a new workflow |
| `n8n_update_workflow` | Update workflow structure |
| `n8n_delete_workflow` | Permanently delete a workflow |
| `n8n_activate_workflow` | Activate workflow triggers |
| `n8n_deactivate_workflow` | Deactivate workflow triggers |
| `n8n_execute_workflow` | Execute a workflow with input data |
| `n8n_get_workflow_tags` | Get tags assigned to a workflow |
| `n8n_update_workflow_tags` | Update workflow tags |

### Execution History (4 tools)

| Tool | Description |
|---|---|
| `n8n_list_executions` | List execution history (filter by workflow) |
| `n8n_get_execution` | Get execution details with node outputs |
| `n8n_delete_execution` | Delete an execution record |
| `n8n_retry_execution` | Retry a failed execution |

### Credentials (4 tools)

| Tool | Description |
|---|---|
| `n8n_create_credential` | Store API credentials |
| `n8n_update_credential` | Update credential data |
| `n8n_delete_credential` | Delete a credential |
| `n8n_get_credential_schema` | Get required fields for a credential type |

### Tags (5 tools)

| Tool | Description |
|---|---|
| `n8n_list_tags` | List all tags |
| `n8n_get_tag` | Get tag details |
| `n8n_create_tag` | Create a new tag |
| `n8n_update_tag` | Rename a tag |
| `n8n_delete_tag` | Delete a tag |

### Variables (4 tools)

| Tool | Description |
|---|---|
| `n8n_list_variables` | List all environment variables |
| `n8n_create_variable` | Create a global variable |
| `n8n_update_variable` | Update a variable value |
| `n8n_delete_variable` | Delete a variable |

### User Management (4 tools)

| Tool | Description |
|---|---|
| `n8n_list_users` | List all users (owner only) |
| `n8n_get_user` | Get user details |
| `n8n_delete_user` | Delete a user |
| `n8n_update_user_role` | Change user role |

---

## Requirements

- **Node.js** 18+
- **n8n instance** with API enabled
- **n8n API key**

### How to Create an n8n API Key

1. Go to your n8n instance Settings
2. Select API > API Keys
3. Click Create API key
4. Copy the key and use it as `N8N_API_KEY`

---

## For Developers

```bash
git clone https://github.com/node2flow-th/n8n-management-mcp-community.git
cd n8n-management-mcp-community
npm install
npm run build

# Run in stdio mode
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm start

# Run in dev mode (hot reload)
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm run dev

# Run in HTTP mode
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm start -- --http
```

---

## License

MIT License - see [LICENSE](LICENSE)

Copyright (c) 2026 [Node2Flow](https://node2flow.net)

## Links

- [npm Package (@node2flow)](https://www.npmjs.com/package/@node2flow/n8n-management-mcp)
- [npm Package (unscoped)](https://www.npmjs.com/package/n8n-management-mcp)
- [n8n Documentation](https://docs.n8n.io/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Node2Flow](https://node2flow.net)
