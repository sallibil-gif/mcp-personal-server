import { execSync } from "node:child_process";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Allowlist of safe, read-only commands. Extend as needed.
const ALLOWED_COMMANDS = [
  /^git\s+(status|log|diff|branch|show|remote)/,
  /^ls(\s|$)/,
  /^cat\s/,
  /^echo\s/,
  /^pwd$/,
  /^whoami$/,
  /^date$/,
  /^df\s/,
  /^du\s/,
  /^uname/,
  /^env$/,
  /^printenv/,
  /^node\s+--version/,
  /^npm\s+(list|outdated|audit)/,
];

function isAllowed(command: string): boolean {
  return ALLOWED_COMMANDS.some((re) => re.test(command.trim()));
}

export const RunShellInputSchema = {
  command: z
    .string()
    .describe(
      "Shell command to run. Only read-only commands from the allowlist are permitted."
    ),
  cwd: z
    .string()
    .optional()
    .describe("Working directory to run the command in (defaults to HOME)"),
  timeout_ms: z
    .number()
    .int()
    .min(100)
    .max(30_000)
    .default(10_000)
    .optional()
    .describe("Timeout in milliseconds (default 10 000, max 30 000)"),
};

export function registerRunShellTool(server: McpServer) {
  server.tool(
    "run_shell",
    "Run a read-only shell command from a safe allowlist (git, ls, cat, etc.).",
    RunShellInputSchema,
    async ({ command, cwd, timeout_ms = 10_000 }) => {
      if (!isAllowed(command)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Command not in allowlist: "${command}"\nAllowed patterns: git status/log/diff/branch, ls, cat, echo, pwd, whoami, date, df, du, uname, env, printenv, node --version, npm list/outdated/audit`,
            },
          ],
          isError: true,
        };
      }

      try {
        const output = execSync(command, {
          encoding: "utf8",
          cwd: cwd ?? process.env.HOME,
          timeout: timeout_ms,
          stdio: ["ignore", "pipe", "pipe"],
        });
        return {
          content: [{ type: "text" as const, text: output || "(no output)" }],
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Command failed: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
