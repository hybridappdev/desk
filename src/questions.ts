import { bookDesk, type LayoutNode, type StackNode } from "@hybridappdev/primitives";

const unrealized = "unrealized p&l by book";
const dayChange = "day change by book";

const dayPoints = [4, 9, 6, 11, 7, 13];
const dayText = "The day move is up on equities. Credit is the drag.";

export function normalizeQuestion(question: string): string {
  return question.trim().replace(/\?+$/u, "").trim().toLowerCase();
}

export function interpret(question: string): LayoutNode {
  const key = normalizeQuestion(question);
  if (key === unrealized) return structuredClone(bookStack());
  if (key === dayChange) return dayLayout();
  return {
    type: "empty",
    title: "No draft",
    reason: "That question is not a layout this desk knows.",
  };
}

export function rowsForBook(book: string): string[][] | null {
  const match = fixtureRows().find((row) => row[0] === book);
  return match ? [match] : null;
}

function dayLayout(): StackNode {
  const tree = structuredClone(bookStack());
  return {
    ...tree,
    children: tree.children.map((child) => {
      if (child.type === "chart") {
        return { ...child, id: "day-change", title: "Day change", points: [...dayPoints] };
      }
      if (child.type === "stream") {
        return { ...child, id: "day-summary", text: dayText };
      }
      return child;
    }),
  };
}

function bookStack(): StackNode {
  if (bookDesk.type !== "stack") throw new Error("Book desk is a stack.");
  return bookDesk;
}

function fixtureRows(): string[][] {
  const table = bookStack().children.find((child) => child.type === "table");
  if (table?.type !== "table") return [];
  return table.rows.map((row) => [...row]);
}
