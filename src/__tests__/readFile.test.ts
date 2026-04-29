import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Inline the handler logic for unit testing (no server needed)
async function readFileHandler(file_path: string, encoding: "utf8" | "base64" = "utf8") {
  const resolved = path.resolve(file_path);
  try {
    const content = await fs.readFile(resolved, encoding as BufferEncoding);
    return { content: [{ type: "text" as const, text: content }], isError: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error reading file: ${message}` }],
      isError: true,
    };
  }
}

describe("read_file tool", () => {
  let tmpFile: string;

  beforeAll(async () => {
    tmpFile = path.join(os.tmpdir(), `mcp-test-${Date.now()}.txt`);
    await fs.writeFile(tmpFile, "hello from mcp test", "utf8");
  });

  afterAll(async () => {
    await fs.unlink(tmpFile).catch(() => {});
  });

  it("reads an existing file", async () => {
    const result = await readFileHandler(tmpFile);
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toBe("hello from mcp test");
  });

  it("returns isError for a missing file", async () => {
    const result = await readFileHandler("/nonexistent/path/file.txt");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Error reading file/);
  });
});
