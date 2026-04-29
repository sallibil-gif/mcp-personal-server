import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const ListDirectoryInputSchema = {
  dir_path: z
    .string()
    .describe("Absolute path to the directory to list"),
  show_hidden: z
    .boolean()
    .default(false)
    .optional()
    .describe("Whether to include hidden files (starting with .)"),
};

export function registerListDirectoryTool(server: McpServer) {
  server.tool(
    "list_directory",
    "List files and directories inside a given directory path.",
    ListDirectoryInputSchema,
    async ({ dir_path, show_hidden = false }) => {
      const resolved = path.resolve(dir_path);
      try {
        const entries = await fs.readdir(resolved, { withFileTypes: true });
        const filtered = show_hidden
          ? entries
          : entries.filter((e) => !e.name.startsWith("."));

        const lines = filtered.map((e) => {
          const tag = e.isDirectory() ? "[DIR] " : "[FILE]";
          return `${tag} ${e.name}`;
        });

        return {
          content: [
            {
              type: "text" as const,
              text: lines.length > 0 ? lines.join("\n") : "(empty directory)",
            },
          ],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error listing directory: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
