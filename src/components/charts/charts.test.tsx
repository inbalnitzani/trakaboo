import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { niceStep } from "./bar-chart";
import { ComparisonBars } from "./comparison-bars";
import { DonutChart } from "./donut-chart";

const fmt = (v: number) => `₪${v}`;

describe("niceStep", () => {
  it.each([
    [0, 1],
    [90, 20],
    [480, 100],
    [600, 200],
    [2400, 500],
  ])("max %d → step %d", (max, step) => {
    expect(niceStep(max)).toBe(step);
  });
});

describe("DonutChart", () => {
  const segments = [
    { id: "a", label: "Food", value: 75, color: "red" },
    { id: "b", label: "Fun", value: 25, color: "blue", detail: "details here" },
  ];

  it("shows the total in the center and percentages in the legend", () => {
    render(<DonutChart segments={segments} formatValue={fmt} ariaLabel="By category" />);
    expect(screen.getByRole("img", { name: "By category" })).toHaveTextContent("₪100");
    expect(screen.getByRole("button", { name: /Food/ })).toHaveTextContent("75%");
  });

  it("keeps a segment selected when a mouse hovers then clicks it", () => {
    render(<DonutChart segments={segments} formatValue={fmt} ariaLabel="By category" />);
    const food = screen.getByRole("button", { name: /Food/ });
    fireEvent.mouseEnter(food);
    fireEvent.click(food);
    expect(food).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(food);
    expect(food).toHaveAttribute("aria-pressed", "false");
  });

  it("highlights a segment and reveals its detail on tap", () => {
    render(<DonutChart segments={segments} formatValue={fmt} ariaLabel="By category" />);
    fireEvent.click(screen.getByRole("button", { name: /Fun/ }));
    expect(screen.getByRole("button", { name: /Fun/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("details here")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveTextContent("₪25");
  });
});

describe("ComparisonBars", () => {
  it("renders a row per item with its change", () => {
    render(
      <ComparisonBars
        currentLabel="This month"
        previousLabel="Last month"
        rows={[
          { id: "a", label: "Food", current: 120, previous: 100, change: "▲ 20%", trend: "up" },
          { id: "b", label: "Fun", current: 0, previous: 50, change: "▼ 100%", trend: "down" },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("▲ 20%")).toHaveClass("text-trend-up");
    expect(screen.getByText("This month")).toBeInTheDocument();
  });
});
