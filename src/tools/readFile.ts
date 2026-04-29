import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const ReadFileInputSchema = {
  file_path: z
    .string()
    .describe("Absolute path to the file to read"),
  encoding: z
    .enum(["utf8", "base64"])
    .default("utf8")
    .optional()
    .describe("File encoding — utf8 (default) or base64 for binary files"),
};

export function registerReadFileTool(server: McpServer) {
  server.tool(
    "read_file",
    "Read the contents of a local file. Returns the file content as text.",
    ReadFileInputSchema,
    async ({ file_path, encoding = "utf8" }) => {
      const resolved = path.resolve(file_path);
      try {
        const content = await fs.readFile(resolved, encoding as BufferEncoding);
        return {
          content: [{ type: "text" as const, text: content }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error reading file: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
