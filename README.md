# mcp-personal-server

A **personal MCP (Model Context Protocol) server** written in TypeScript that exposes local file tools, safe shell commands, file resources, and reusable prompt templates to any MCP-compatible AI client — Cursor, Claude Desktop, and others.

> **What is MCP?**  
> The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that lets AI assistants connect to external tools and data sources in a structured, secure way. This server lets your AI assistant read your local files, run safe shell commands, and use your custom prompt templates — without leaving your machine.

---

## Features

| Primitive | Name | What it does |
|-----------|------|--------------|
| **Tool** | `read_file` | Read any local file (text or base64) |
| **Tool** | `list_directory` | List files and folders in a directory |
| **Tool** | `run_shell` | Run read-only shell commands (git, ls, cat, etc.) from an allowlist |
| **Tool** | `search_files` | Recursively search files by regex pattern |
| **Resource** | `localfile://` | Expose local files as MCP resources by URI |
| **Resource** | `env://current` | Expose non-sensitive environment variables |
| **Prompt** | `code-review` | Generate a structured code review template |
| **Prompt** | `summarize-notes` | Summarize personal notes on a topic |

---

## Requirements

- Node.js 18+
- npm 9+

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/mcp-personal-server.git
cd mcp-personal-server
npm install
```

### 2. Build

```bash
npm run build
# Compiled output goes to dist/
```

### 3. Test it with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
# Opens http://localhost:5173 — browse and call your tools interactively
```

### 4. Register with Cursor

Edit `~/.cursor/mcp.json` (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "mcp-personal-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-personal-server/dist/index.js"],
      "env": {
        "MY_API_KEY": "optional-secret"
      }
    }
  }
}
```

Replace `/absolute/path/to/` with the real path on your machine. Then restart Cursor.

### 5. Register with Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mcp-personal-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-personal-server/dist/index.js"]
    }
  }
}
```

---

## Development

```bash
# Run in watch mode (no build step needed)
npm run dev

# Run tests
npm test

# Type-check without emitting
npm run lint
```

---

## Project Structure

```
mcp-personal-server/
├── src/
│   ├── index.ts               # Entry point — wires everything together
│   ├── tools/
│   │   ├── readFile.ts        # read_file tool
│   │   ├── listDirectory.ts   # list_directory tool
│   │   ├── runShell.ts        # run_shell tool (allowlisted commands)
│   │   └── searchFiles.ts     # search_files tool
│   ├── resources/
│   │   ├── fileResource.ts    # localfile:// URI resource
│   │   └── envResource.ts     # env://current resource
│   ├── prompts/
│   │   ├── codeReview.ts      # code-review prompt template
│   │   └── summarizeNotes.ts  # summarize-notes prompt template
│   └── __tests__/
│       └── readFile.test.ts   # Unit tests
├── .env.example               # Environment variable template
├── cursor-mcp-config.example.json  # Cursor registration example
├── tsconfig.json
└── package.json
```

---

## Adding Your Own Tools

1. Create `src/tools/myTool.ts`:

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyTool(server: McpServer) {
  server.tool(
    "my_tool",                          // tool name (snake_case)
    "Description the AI will see",      // description
    {
      my_param: z.string().describe("What this param does"),
    },
    async ({ my_param }) => {
      // your logic here
      return {
        content: [{ type: "text" as const, text: `Result: ${my_param}` }],
      };
    }
  );
}
```

2. Import and register it in `src/index.ts`:

```typescript
import { registerMyTool } from "./tools/myTool.js";
registerMyTool(server);
```

3. Rebuild: `npm run build`

---

## Security Notes

- The `run_shell` tool uses an **allowlist** of safe, read-only commands. It rejects anything not on the list. Customize `ALLOWED_COMMANDS` in `src/tools/runShell.ts` carefully.
- The `env://current` resource **filters out** env vars that look like secrets (tokens, keys, passwords). Adjust `BLOCKED_VARS` in `src/resources/envResource.ts` to suit your setup.
- Never commit `.env` files. Use `.env.example` as a template.
- Pass secrets via `env` in the MCP config, not hardcoded in source.

---

## Transport Modes

This server uses **stdio** (default) — the client spawns it as a subprocess. This is the simplest and most secure mode for personal use.

To add HTTP+SSE support for remote access, install `express` and use `SSEServerTransport` from the SDK alongside the existing stdio transport.

---

## References

- [Model Context Protocol — Official Docs](https://modelcontextprotocol.io/docs)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Cursor MCP Setup Guide](https://docs.cursor.com/context/model-context-protocol)

---

## License

MIT
