import {
  parseLayout,
  type LayoutError,
  type LayoutNode,
} from "@hybridappdev/primitives";
import { rowsForBook } from "./questions";

export type DraftState = {
  key: string;
  tree: LayoutNode;
  errors: string[];
};

export function formatError(error: LayoutError): string {
  return `${error.path}: ${error.message}`;
}

export function settle(current: DraftState, candidate: unknown): DraftState {
  const parsed = parseLayout(candidate);
  if (Array.isArray(parsed)) {
    return { ...current, errors: parsed.map(formatError) };
  }
  return { ...current, tree: parsed, errors: [] };
}

export function reorder(tree: LayoutNode, index: number, direction: -1 | 1): LayoutNode {
  if (tree.type !== "stack") return tree;
  const next = index + direction;
  if (next < 0 || next >= tree.children.length) return tree;
  const children = tree.children.slice();
  const current = children[index];
  const neighbor = children[next];
  if (current === undefined || neighbor === undefined) return tree;
  children[index] = neighbor;
  children[next] = current;
  return { ...tree, children };
}

export function withBook(tree: LayoutNode, book: string): LayoutNode {
  if (tree.type !== "stack") return tree;
  const rows = rowsForBook(book);
  if (rows === null) return tree;
  return {
    ...tree,
    children: tree.children.map((child) => {
      if (child.type === "filter" && child.id === "book") {
        return child.options.includes(book) ? { ...child, value: book } : child;
      }
      if (child.type === "table") return { ...child, rows };
      return child;
    }),
  };
}

export function blockName(node: LayoutNode): string {
  switch (node.type) {
    case "filter":
      return node.label;
    case "chart":
      return node.title;
    case "table":
      return "Table";
    case "stream":
      return "Stream";
    case "button":
      return node.label;
    case "empty":
      return node.title;
    case "stack":
      return "Stack";
    default: {
      const unreachable: never = node;
      return unreachable;
    }
  }
}
