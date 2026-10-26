import { bookDesk, parseLayout } from "@hybridappdev/primitives";
import { describe, expect, it } from "vitest";
import type { LayoutNode } from "@hybridappdev/primitives";
import { interpret, normalizeQuestion } from "./questions";

describe("interpret", () => {
  it("matches case and a trailing question mark", () => {
    expect(normalizeQuestion("  Unrealized P&L by book? ")).toBe("unrealized p&l by book");
    expect(interpret("UNREALIZED P&L BY BOOK?")).toEqual(interpret("Unrealized P&L by book"));
    expect(interpret("day change by book?")).toEqual(interpret("Day change by book"));
  });

  it("turns the two known questions into layouts and anything else into the empty node", () => {
    const unrealized = interpret("Unrealized P&L by book");
    const day = interpret("Day change by book");
    const empty = interpret("What is the book?");

    expect(parseLayout(unrealized)).toEqual(unrealized);
    expect(parseLayout(day)).toEqual(day);
    expect(childTypes(unrealized)).toEqual(["filter", "chart", "table", "stream", "button"]);
    expect(childTypes(day)).toEqual(childTypes(unrealized));
    expect(chartOf(unrealized).title).toBe("Unrealized P&L");
    expect(chartOf(unrealized).points).toEqual([12, 18, 14, 22, 19, 27]);
    expect(chartOf(unrealized).tone).toBe("neutral");
    expect(chartOf(day).points).not.toEqual(chartOf(unrealized).points);
    expect(streamOf(unrealized).text).toBe(
      "Unrealized P&L is up on equities. Credit is the drag.",
    );
    expect(streamOf(unrealized).source).toBe("model");
    expect(streamOf(unrealized).state).toBe("settled");
    expect(streamOf(day).text).not.toBe(streamOf(unrealized).text);
    expect(streamOf(day).text.toLowerCase()).toContain("day");
    expect(tableOf(unrealized).columns).toEqual(["Book", "Unrealized", "Day"]);
    expect(tableOf(unrealized).rows).toEqual(tableOf(bookDesk).rows);
    expect(empty).toEqual({
      type: "empty",
      title: "No draft",
      reason: "That question is not a layout this desk knows.",
    });
    expect(unrealized).not.toBe(bookDesk);
  });
});

function childTypes(tree: LayoutNode): string[] {
  return tree.type === "stack" ? tree.children.map((child) => child.type) : [tree.type];
}

function chartOf(tree: LayoutNode) {
  if (tree.type !== "stack") throw new Error("expected a stack");
  const chart = tree.children.find((child) => child.type === "chart");
  if (chart?.type !== "chart") throw new Error("expected a chart");
  return chart;
}

function streamOf(tree: LayoutNode) {
  if (tree.type !== "stack") throw new Error("expected a stack");
  const stream = tree.children.find((child) => child.type === "stream");
  if (stream?.type !== "stream") throw new Error("expected a stream");
  return stream;
}

function tableOf(tree: LayoutNode) {
  if (tree.type !== "stack") throw new Error("expected a stack");
  const table = tree.children.find((child) => child.type === "table");
  if (table?.type !== "table") throw new Error("expected a table");
  return table;
}
