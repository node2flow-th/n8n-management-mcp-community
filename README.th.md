# n8n Management MCP Server

[![npm version](https://img.shields.io/npm/v/@node2flow/n8n-management-mcp.svg)](https://www.npmjs.com/package/@node2flow/n8n-management-mcp)
[![npm version](https://img.shields.io/npm/v/n8n-management-mcp.svg)](https://www.npmjs.com/package/n8n-management-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.md)

MCP (Model Context Protocol) server สำหรับเชื่อมต่อ AI assistant กับ n8n instance ของคุณ จัดการ workflows, executions, credentials, tags, variables และ users ผ่าน 31 tools

ใช้ได้กับ Claude Desktop, Cursor, VS Code และ MCP client อื่นๆ

---

## เริ่มต้นใช้งาน

### Claude Desktop

เพิ่มใน `claude_desktop_config.json`:

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

เพิ่มใน MCP settings:

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

สำหรับ deploy แบบ remote หรือใช้ร่วมกันหลายคน:

```bash
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npx @node2flow/n8n-management-mcp --http
```

Server จะเริ่มที่ port 3000 (เปลี่ยนได้ผ่าน `PORT` env var) MCP endpoint: `http://localhost:3000/mcp`

---

## การตั้งค่า

| Environment Variable | จำเป็น | คำอธิบาย |
|---|---|---|
| `N8N_URL` | ใช่ | URL ของ n8n instance (เช่น `https://n8n.example.com`) |
| `N8N_API_KEY` | ใช่ | n8n API key ([วิธีสร้าง](https://docs.n8n.io/api/authentication/)) |
| `PORT` | ไม่ | Port สำหรับ HTTP server (ค่าเริ่มต้น: `3000`, ใช้กับ `--http` เท่านั้น) |

---

## Tools ทั้งหมด (31 tools)

### จัดการ Workflow (10 tools)

| Tool | คำอธิบาย |
|---|---|
| `n8n_list_workflows` | แสดง workflow ทั้งหมดพร้อมสถานะและ tags |
| `n8n_get_workflow` | ดูรายละเอียด workflow (nodes, connections) |
| `n8n_create_workflow` | สร้าง workflow ใหม่ |
| `n8n_update_workflow` | แก้ไขโครงสร้าง workflow |
| `n8n_delete_workflow` | ลบ workflow ถาวร |
| `n8n_activate_workflow` | เปิด triggers ของ workflow |
| `n8n_deactivate_workflow` | ปิด triggers ของ workflow |
| `n8n_execute_workflow` | รัน workflow ด้วยข้อมูล input |
| `n8n_get_workflow_tags` | ดู tags ที่กำหนดให้ workflow |
| `n8n_update_workflow_tags` | เปลี่ยน tags ของ workflow |

### ประวัติการรัน (4 tools)

| Tool | คำอธิบาย |
|---|---|
| `n8n_list_executions` | ดูประวัติการรัน (กรองตาม workflow ได้) |
| `n8n_get_execution` | ดูรายละเอียดการรัน พร้อม output ของแต่ละ node |
| `n8n_delete_execution` | ลบประวัติการรัน |
| `n8n_retry_execution` | รัน execution ที่ล้มเหลวอีกครั้ง |

### Credentials (4 tools)

| Tool | คำอธิบาย |
|---|---|
| `n8n_create_credential` | เก็บ API credentials |
| `n8n_update_credential` | อัพเดทข้อมูล credential |
| `n8n_delete_credential` | ลบ credential |
| `n8n_get_credential_schema` | ดู fields ที่จำเป็นสำหรับ credential แต่ละประเภท |

### Tags (5 tools)

| Tool | คำอธิบาย |
|---|---|
| `n8n_list_tags` | แสดง tags ทั้งหมด |
| `n8n_get_tag` | ดูรายละเอียด tag |
| `n8n_create_tag` | สร้าง tag ใหม่ |
| `n8n_update_tag` | เปลี่ยนชื่อ tag |
| `n8n_delete_tag` | ลบ tag |

### Variables (4 tools)

| Tool | คำอธิบาย |
|---|---|
| `n8n_list_variables` | แสดง environment variables ทั้งหมด |
| `n8n_create_variable` | สร้าง global variable |
| `n8n_update_variable` | แก้ไขค่า variable |
| `n8n_delete_variable` | ลบ variable |

### จัดการ Users (4 tools)

| Tool | คำอธิบาย |
|---|---|
| `n8n_list_users` | แสดงผู้ใช้ทั้งหมด (เฉพาะ owner) |
| `n8n_get_user` | ดูรายละเอียดผู้ใช้ |
| `n8n_delete_user` | ลบผู้ใช้ |
| `n8n_update_user_role` | เปลี่ยน role ผู้ใช้ |

---

## ความต้องการ

- **Node.js** 18 ขึ้นไป
- **n8n instance** ที่เปิด API
- **n8n API key**

### วิธีสร้าง n8n API Key

1. ไปที่ Settings ของ n8n instance
2. เลือก API > API Keys
3. กด Create API key
4. คัดลอก key มาใช้เป็น `N8N_API_KEY`

---

## สำหรับนักพัฒนา

```bash
git clone https://github.com/node2flow-th/n8n-management-mcp-community.git
cd n8n-management-mcp-community
npm install
npm run build

# รันแบบ stdio
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm start

# รันแบบ dev (hot reload)
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm run dev

# รันแบบ HTTP
N8N_URL=https://your-n8n.com N8N_API_KEY=your_key npm start -- --http
```

---

## License

MIT License - ดู [LICENSE](LICENSE)

Copyright (c) 2026 [Node2Flow](https://node2flow.net)

## Links

- [npm Package (@node2flow)](https://www.npmjs.com/package/@node2flow/n8n-management-mcp)
- [npm Package (unscoped)](https://www.npmjs.com/package/n8n-management-mcp)
- [n8n Documentation](https://docs.n8n.io/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Node2Flow](https://node2flow.net)
