import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const hex = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/;

describe("source", () => {
  it("does not add a second palette or style the package", () => {
    const files = walk("src").filter((file) => /\.(ts|tsx|css)$/.test(file));
    const offenders = files.filter((file) => hex.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);

    const ui = files.filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"));
    for (const file of ui) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/\bstyle=/);
      expect(text, file).not.toMatch(/@hybridappdev\/primitives\/src/);
    }
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
