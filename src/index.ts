import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tools
import { registerReadFileTool } from "./tools/readFile.js";
import { registerListDirectoryTool } from "./tools/listDirectory.js";
import { registerRunShellTool } from "./tools/runShell.js";
import { registerSearchFilesTool } from "./tools/searchFiles.js";

// Resources
import { registerFileResource } from "./resources/fileResource.js";
import { registerEnvResource } from "./resources/envResource.js";

// Prompts
import { registerCodeReviewPrompt } from "./prompts/codeReview.js";
import { registerSummarizeNotesPrompt } from "./prompts/summarizeNotes.js";

const server = new McpServer({
  name: "mcp-personal-server",
  version: "1.0.0",
});

// ── Tools ────────────────────────────────────────────────────────────────────
registerReadFileTool(server);
registerListDirectoryTool(server);
registerRunShellTool(server);
registerSearchFilesTool(server);

// ── Resources ─────────────────────────────────────────────────────────────────
registerFileResource(server);
registerEnvResource(server);

// ── Prompts ──────────────────────────────────────────────────────────────────
registerCodeReviewPrompt(server);
registerSummarizeNotesPrompt(server);

// ── Connect transport ────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);

// Use stderr so it doesn't pollute the stdio MCP stream
console.error(`[mcp-personal-server] running on stdio (pid ${process.pid})`);
