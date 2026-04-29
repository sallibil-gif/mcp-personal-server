import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const MAX_RESULTS = 100;

async function walk(
  dir: string,
  pattern: RegExp,
  results: string[],
  maxDepth: number,
  depth: number
): Promise<void> {
  if (depth > maxDepth || results.length >= MAX_RESULTS) return;

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (results.length >= MAX_RESULTS) break;
    if (entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, pattern, results, maxDepth, depth + 1);
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
}

export const SearchFilesInputSchema = {
  base_dir: z
    .string()
    .describe("Root directory to search within"),
  pattern: z
    .string()
    .describe("Regex pattern to match file names against (e.g. '\\.ts$', 'README')"),
  max_depth: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .optional()
    .describe("Maximum directory depth to recurse (default 5)"),
};

export function registerSearchFilesTool(server: McpServer) {
  server.tool(
    "search_files",
    "Recursively search for files matching a regex pattern inside a base directory.",
    SearchFilesInputSchema,
    async ({ base_dir, pattern, max_depth = 5 }) => {
      let re: RegExp;
      try {
        re = new RegExp(pattern, "i");
      } catch {
        return {
          content: [{ type: "text" as const, text: `Invalid regex pattern: ${pattern}` }],
          isError: true,
        };
      }

      const results: string[] = [];
      await walk(path.resolve(base_dir), re, results, max_depth, 0);

      if (results.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No files found matching the pattern." }],
        };
      }

      const text =
        results.length >= MAX_RESULTS
          ? `(Showing first ${MAX_RESULTS} results)\n` + results.join("\n")
          : results.join("\n");

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
