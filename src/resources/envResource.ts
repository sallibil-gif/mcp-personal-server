import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Variables that should never be exposed
const BLOCKED_VARS = new Set([
  "AWS_SECRET_ACCESS_KEY",
  "AWS_SESSION_TOKEN",
  "GITHUB_TOKEN",
  "GITLAB_TOKEN",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "DATABASE_URL",
  "SECRET",
  "PASSWORD",
  "PASSWD",
  "TOKEN",
  "KEY",
  "PRIVATE",
]);

function isSafe(varName: string): boolean {
  const upper = varName.toUpperCase();
  return !Array.from(BLOCKED_VARS).some((blocked) => upper.includes(blocked));
}

/**
 * Exposes non-sensitive environment variables as a static resource.
 * URI: env://current
 */
export function registerEnvResource(server: McpServer) {
  server.resource(
    "environment",
    "env://current",
    {
      description:
        "Read current non-sensitive environment variables (secrets are filtered out).",
      mimeType: "application/json",
    },
    async (uri) => {
      const safeEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (isSafe(key) && value !== undefined) {
          safeEnv[key] = value;
        }
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(safeEnv, null, 2),
          },
        ],
      };
    }
  );
}
