import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSummarizeNotesPrompt(server: McpServer) {
  server.prompt(
    "summarize-notes",
    "Summarize personal notes on a topic into key insights and action items.",
    {
      topic: z.string().describe("The topic or project to summarize notes about"),
      output_format: z
        .enum(["bullet", "narrative", "table"])
        .default("bullet")
        .optional()
        .describe("Output format: bullet points (default), narrative prose, or markdown table"),
    },
    ({ topic, output_format = "bullet" }) => {
      const formatInstruction = {
        bullet: "Use concise bullet points grouped by theme.",
        narrative: "Write as a short narrative paragraph (3-5 sentences).",
        table: "Format as a markdown table with columns: Theme | Key Point | Action Item.",
      }[output_format];

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `Summarize all notes related to the topic: "${topic}".`,
                "",
                `Format: ${formatInstruction}`,
                "",
                "Include:",
                "- Key decisions made",
                "- Open questions or blockers",
                "- Action items (if any)",
                "- Important context or constraints",
                "",
                "Be concise. Omit filler and repeated information.",
              ].join("\n"),
            },
          },
        ],
      };
    }
  );
}
