import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerCodeReviewPrompt(server: McpServer) {
  server.prompt(
    "code-review",
    "Generate a structured code review for a given piece of code.",
    {
      language: z.string().describe("Programming language (e.g. TypeScript, Python, Go)"),
      focus: z
        .string()
        .optional()
        .describe("Optional: specific area to focus on (e.g. security, performance, readability)"),
      context: z
        .string()
        .optional()
        .describe("Optional: brief description of what the code does"),
    },
    ({ language, focus, context }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Please perform a thorough code review for the following ${language} code.`,
              context ? `Context: ${context}` : "",
              focus ? `Pay special attention to: ${focus}.` : "",
              "",
              "Review checklist:",
              "1. **Correctness** — Does the logic achieve its intended goal? Are edge cases handled?",
              "2. **Security** — Any injection risks, insecure defaults, or exposed secrets?",
              "3. **Performance** — Any obvious bottlenecks, N+1 queries, or memory leaks?",
              "4. **Readability** — Is the code clear, well-named, and easy to follow?",
              "5. **Maintainability** — Is it easy to change? Are there hidden dependencies?",
              "6. **Tests** — Are there tests? Are edge cases covered?",
              "",
              "For each issue found, provide:",
              "- Severity (Critical / Major / Minor / Suggestion)",
              "- Location (line or function name if visible)",
              "- Explanation of the problem",
              "- Suggested fix or improvement",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        },
      ],
    })
  );
}
