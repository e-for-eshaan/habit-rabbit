import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Section } from "@/types";

import { SectionCard } from "./SectionCard";

const section: Section = {
  id: "sec-1",
  title: "Test Habit",
  colorKey: 0,
  updates: [{ id: "u1", text: "Update one", createdAt: "2025-01-15T10:00:00Z" }],
};

const noop = () => {};

describe("SectionCard", () => {
  it("renders section title", () => {
    render(
      <SectionCard
        section={section}
        collapsed={false}
        onToggleCollapse={noop}
        onAddUpdate={noop}
        onEditUpdate={noop}
        onDeleteUpdate={noop}
      />
    );
    expect(screen.getByText("Test Habit")).toBeInTheDocument();
  });

  it("exposes update count in header control label", () => {
    render(
      <SectionCard
        section={section}
        collapsed={false}
        onToggleCollapse={noop}
        onAddUpdate={noop}
        onEditUpdate={noop}
        onDeleteUpdate={noop}
      />
    );
    const toggles = screen.getAllByTestId("section-toggle");
    expect(toggles[0]).toHaveAttribute("aria-label", "Test Habit, 1 update");
  });

  it("calls onToggleCollapse with section id when header is clicked", () => {
    const onToggleCollapse = vi.fn();
    render(
      <SectionCard
        section={section}
        collapsed={false}
        onToggleCollapse={onToggleCollapse}
        onAddUpdate={noop}
        onEditUpdate={noop}
        onDeleteUpdate={noop}
      />
    );
    const toggles = screen.getAllByTestId("section-toggle");
    fireEvent.click(toggles[toggles.length - 1]!);
    expect(onToggleCollapse).toHaveBeenCalledWith("sec-1");
  });
});
