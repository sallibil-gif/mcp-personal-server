import fs from "node:fs/promises";
import path from "node:path";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Exposes local files as MCP resources using the URI scheme:
 *   localfile:///absolute/path/to/file
 *
 * Example: localfile:///home/me/notes/ideas.md
 */
export function registerFileResource(server: McpServer) {
  server.resource(
    "local-file",
    new ResourceTemplate("localfile://{filePath}", { list: undefined }),
    {
      description:
        "Read a local file by its absolute path using localfile:///path/to/file URIs.",
      mimeType: "text/plain",
    },
    async (uri, { filePath }) => {
      // filePath from the template is URL-encoded; decode it
      const decoded = decodeURIComponent(filePath as string);
      const resolved = path.resolve("/" + decoded.replace(/^\/+/, ""));

      try {
        const text = await fs.readFile(resolved, "utf8");
        const mimeType = resolved.endsWith(".json")
          ? "application/json"
          : resolved.endsWith(".md")
          ? "text/markdown"
          : "text/plain";

        return {
          contents: [{ uri: uri.href, mimeType, text }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Error reading file: ${message}`,
            },
          ],
        };
      }
    }
  );
}
