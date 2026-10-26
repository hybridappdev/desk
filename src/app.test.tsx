import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { App } from "./App";

function renderDesk() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
}

describe("desk", () => {
  it("renders an unrecognized question as the empty node", async () => {
    const user = userEvent.setup();
    renderDesk();

    expect(screen.getByText("No draft")).toBeTruthy();
    expect(screen.getByText("That question is not a layout this desk knows.")).toBeTruthy();

    await user.type(screen.getByRole("textbox", { name: "Question" }), "hello");
    expect(screen.getByText("No draft")).toBeTruthy();
    expect(screen.queryByRole("button", { name: exact("Publish") })).toBeNull();
  });

  it("publishes the reordered, filtered draft without the question or handles", async () => {
    const user = userEvent.setup();
    renderDesk();

    await user.type(screen.getByRole("textbox", { name: "Question" }), "Unrealized P&L by book?");
    expect(screen.getByRole("region", { name: "Unrealized P&L" })).toBeTruthy();
    expect(screen.getByText("Unrealized P&L is up on equities. Credit is the drag.")).toBeTruthy();
    expect(screen.getAllByRole("row")).toHaveLength(4);

    await user.selectOptions(screen.getByRole("combobox", { name: "Book" }), "Credit");
    expect(screen.getByRole("cell", { name: "Credit" })).toBeTruthy();
    expect(screen.queryByRole("cell", { name: "Equities" })).toBeNull();
    expect(screen.queryByRole("cell", { name: "Rates" })).toBeNull();

    await user.click(screen.getByRole("button", { name: exact("Move Unrealized P&L up") }));
    const chart = screen.getByRole("region", { name: "Unrealized P&L" });
    const book = screen.getByRole("combobox", { name: "Book" });
    expect(chart.compareDocumentPosition(book) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(screen.getByRole("button", { name: exact("Publish") }));

    expect(screen.queryByRole("textbox", { name: "Question" })).toBeNull();
    expect(screen.queryByRole("button", { name: /move/i })).toBeNull();
    const publishedChart = screen.getByRole("region", { name: "Unrealized P&L" });
    const publishedBook = screen.getByRole("combobox", { name: "Book" });
    expect(publishedChart.compareDocumentPosition(publishedBook) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Credit" })).toBeTruthy();
    expect(screen.getByText("Unrealized P&L is up on equities. Credit is the drag.")).toBeTruthy();
  });
});

function exact(name: string) {
  return (value: string) => value === name;
}
