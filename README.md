# n8n Management MCP Server

An MCP (Model Context Protocol) server that connects AI assistants to your n8n instance. Manage workflows, executions, credentials, tags, variables, and users through 31 tools.

Works with Claude Desktop, Cursor, VS Code, and any MCP-compatible client.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

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

Add to your MCP settings:

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

For remote or shared deployments:

```bash
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp --http
```

The server starts on port 3000 (configurable via `PORT` env var). MCP endpoint: `http://localhost:3000/mcp`

## Configuration

| Environment Variable | Required | Description |
|---|---|---|
| `N8N_URL` | Yes | Your n8n instance URL (e.g., `https://n8n.example.com`) |
| `N8N_API_KEY` | Yes | n8n API key ([how to create](https://docs.n8n.io/api/authentication/)) |
| `PORT` | No | HTTP server port (default: `3000`, only used with `--http`) |

## Tools (31)

### Workflow Management (10 tools)

| Tool | Description |
|---|---|
| `n8n_list_workflows` | List all workflows with status and tags |
| `n8n_get_workflow` | Get full workflow definition (nodes, connections) |
| `n8n_create_workflow` | Create new workflow |
| `n8n_update_workflow` | Modify workflow structure |
| `n8n_delete_workflow` | Permanently delete workflow |
| `n8n_activate_workflow` | Enable workflow triggers |
| `n8n_deactivate_workflow` | Disable workflow triggers |
| `n8n_execute_workflow` | Manually run workflow with input data |
| `n8n_get_workflow_tags` | Get tags assigned to workflow |
| `n8n_update_workflow_tags` | Replace workflow tags |

### Execution History (4 tools)

| Tool | Description |
|---|---|
| `n8n_list_executions` | Get execution history (filter by workflow) |
| `n8n_get_execution` | Get detailed execution data with node outputs |
| `n8n_delete_execution` | Remove execution record |
| `n8n_retry_execution` | Retry failed execution |

### Credentials (4 tools)

| Tool | Description |
|---|---|
| `n8n_create_credential` | Store API credentials |
| `n8n_update_credential` | Update credential data |
| `n8n_delete_credential` | Remove credential |
| `n8n_get_credential_schema` | Get required fields for credential type |

### Tags (5 tools)

| Tool | Description |
|---|---|
| `n8n_list_tags` | List all tags |
| `n8n_get_tag` | Get tag details |
| `n8n_create_tag` | Create new tag |
| `n8n_update_tag` | Rename tag |
| `n8n_delete_tag` | Delete tag |

### Variables (4 tools)

| Tool | Description |
|---|---|
| `n8n_list_variables` | List environment variables |
| `n8n_create_variable` | Create global variable |
| `n8n_update_variable` | Update variable value |
| `n8n_delete_variable` | Delete variable |

### User Management (4 tools)

| Tool | Description |
|---|---|
| `n8n_list_users` | List all users (owner only) |
| `n8n_get_user` | Get user details |
| `n8n_delete_user` | Remove user |
| `n8n_update_user_role` | Change user role |

## Requirements

- **Node.js** 18+
- **n8n instance** with API enabled
- **n8n API key** with appropriate permissions

### Getting an n8n API Key

1. Go to your n8n instance Settings
2. Navigate to API > API Keys
3. Create a new API key
4. Copy the key and use it as `N8N_API_KEY`

## Development

```bash
git clone https://github.com/node2flow-th/n8n-management-mcp.git
cd n8n-management-mcp
npm install
npm run build

# Run in stdio mode
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm start

# Run in dev mode (with hot reload)
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm run dev
```

## License

MIT - see [LICENSE](LICENSE)

## Links

- [n8n Documentation](https://docs.n8n.io/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Node2Flow](https://node2flow.net)
