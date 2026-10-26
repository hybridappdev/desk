import { describe, expect, it } from "vitest";
import type { LayoutNode } from "@hybridappdev/primitives";
import { reorder, settle, withBook, type DraftState } from "./draft";
import { interpret } from "./questions";

describe("draft", () => {
  it("rewrites stack.children and parses again", () => {
    const tree = interpret("Unrealized P&L by book");
    const current = hold(tree);
    const next = settle(current, reorder(tree, 1, -1));

    expect(next.errors).toEqual([]);
    expect(next.tree.type).toBe("stack");
    if (next.tree.type !== "stack" || tree.type !== "stack") return;
    expect(next.tree.children[0]).toEqual(tree.children[1]);
    expect(next.tree.children[1]).toEqual(tree.children[0]);
  });

  it("keeps the last good draft when parse fails", () => {
    const tree = interpret("Day change by book");
    const current = hold(tree);
    const next = settle(current, { ...tree, className: "paint" });

    expect(next.tree).toBe(tree);
    expect(next.errors.length).toBeGreaterThan(0);
    expect(next.errors.join(" ")).toContain("className");
  });

  it("updates table rows from the fixture without a new treatment", () => {
    const tree = interpret("Unrealized P&L by book");
    const current = hold(tree);
    const next = settle(current, withBook(tree, "Credit"));

    expect(next.errors).toEqual([]);
    if (next.tree.type !== "stack" || tree.type !== "stack") throw new Error("expected a stack");
    const table = node(next.tree, "table");
    const chart = node(next.tree, "chart");
    const before = node(tree, "chart");
    const filter = node(next.tree, "filter");
    const button = node(next.tree, "button");
    if (table.type !== "table" || chart.type !== "chart" || before.type !== "chart") {
      throw new Error("expected chart and table");
    }
    if (filter.type !== "filter" || button.type !== "button") throw new Error("expected controls");

    expect(filter.value).toBe("Credit");
    expect(table.columns).toEqual(["Book", "Unrealized", "Day"]);
    expect(table.rows).toEqual([["Credit", "−0.8", "−0.1"]]);
    expect(chart.tone).toBe(before.tone);
    expect(chart.points).toEqual(before.points);
    expect(button.variant).toBe("primary");
    expect(next.tree.children.map((child) => child.type)).toEqual(
      tree.children.map((child) => child.type),
    );
  });
});

function hold(tree: LayoutNode): DraftState {
  return { key: "test", tree, errors: [] };
}

function node(tree: Extract<LayoutNode, { type: "stack" }>, type: LayoutNode["type"]) {
  const match = tree.children.find((child) => child.type === type);
  if (!match) throw new Error(`missing ${type}`);
  return match;
}
