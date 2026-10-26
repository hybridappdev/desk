import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { App } from "./App";
import "@hybridappdev/primitives/tokens.css";
import "@hybridappdev/primitives/styles.css";
import "./index.css";

export function mount(element: HTMLElement): () => void {
  const root = createRoot(element);
  root.render(
    <StrictMode>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </StrictMode>,
  );
  return () => root.unmount();
}
