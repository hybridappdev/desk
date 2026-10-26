import { renderLayout, type StackNode } from "@hybridappdev/primitives";
import { useState } from "react";
import { useNavigate } from "react-router";
import { blockName, reorder, settle, withBook, type DraftState } from "./draft";
import { interpret, normalizeQuestion } from "./questions";
import { storePublished } from "./storage";

export function DeskPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [draft, setDraft] = useState<DraftState>(() =>
    settle({ key: "", tree: interpret(""), errors: [] }, interpret("")),
  );

  function onQuestion(value: string) {
    const key = normalizeQuestion(value);
    setQuestion(value);
    setDraft((current) => (key === current.key ? current : { ...settle(current, interpret(value)), key }));
  }

  function onMove(index: number, direction: -1 | 1) {
    setDraft((current) => settle(current, reorder(current.tree, index, direction)));
  }

  function onBook(book: string) {
    setDraft((current) => settle(current, withBook(current.tree, book)));
  }

  function publish() {
    storePublished(draft.tree);
    navigate("/published");
  }

  return (
    <main className="screen">
      <form
        className="question"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor="question">Question</label>
        <input
          id="question"
          name="question"
          value={question}
          autoComplete="off"
          onChange={(event) => {
            onQuestion(event.target.value);
          }}
        />
      </form>
      <Errors errors={draft.errors} />
      {draft.tree.type === "stack" ? <Reorder tree={draft.tree} onMove={onMove} /> : null}
      <div
        key={draft.key}
        className="draft"
        onChange={(event) => {
          const target = event.target;
          if (target instanceof HTMLSelectElement && target.id === "book") onBook(target.value);
        }}
        onClick={(event) => {
          if (isPublishButton(event.target)) publish();
        }}
      >
        {renderLayout(draft.tree)}
      </div>
    </main>
  );
}

function Errors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="errors" role="alert">
      {errors.map((error, index) => (
        <p key={`${index}-${error}`}>{error}</p>
      ))}
    </div>
  );
}

function Reorder({
  tree,
  onMove,
}: {
  tree: StackNode;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <ul className="reorder" aria-label="Reorder">
      {tree.children.map((child, index) => {
        const name = blockName(child);
        return (
          <li key={`${name}-${index}`}>
            <button type="button" disabled={index === 0} onClick={() => onMove(index, -1)}>
              Move {name} up
            </button>
            <button
              type="button"
              disabled={index === tree.children.length - 1}
              onClick={() => onMove(index, 1)}
            >
              Move {name} down
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function isPublishButton(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const button = target.closest("button");
  if (!button) return false;
  return (button.textContent ?? "").trim() === "Publish";
}
