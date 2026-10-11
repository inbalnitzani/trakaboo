import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BarChart, niceStep } from "./bar-chart";
import { ComparisonBars } from "./comparison-bars";
import { DonutChart } from "./donut-chart";
import { ShareBar } from "./share-bar";

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

describe("BarChart", () => {
  const bars = [10, 40, 20].map((value, i) => ({ id: String(i), value, tooltip: value }));

  it("outlines the highlighted bar and draws the reference line", () => {
    const { container } = render(
      <BarChart bars={bars} xTicks={[]} highlightIndex={1} referenceValue={25} ariaLabel="Daily" />,
    );
    const rects = container.querySelectorAll("rect[fill]:not([fill='transparent'])");
    expect(rects).toHaveLength(3);
    expect(rects[1]).toHaveAttribute("stroke", "var(--foreground)");
    expect(rects[0]).not.toHaveAttribute("stroke");
    expect(screen.getByTestId("reference-line")).toBeInTheDocument();
  });

  it("skips the reference line when there is none", () => {
    render(<BarChart bars={bars} xTicks={[]} ariaLabel="Daily" />);
    expect(screen.queryByTestId("reference-line")).not.toBeInTheDocument();
  });
});

describe("ShareBar", () => {
  it("sizes segments by share and drops empty ones", () => {
    const { container } = render(
      <ShareBar
        ariaLabel="By category"
        segments={[
          { id: "a", value: 75, color: "red" },
          { id: "b", value: 25, color: "blue" },
          { id: "c", value: 0, color: "green" },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: "By category" })).toBeInTheDocument();
    const segments = container.querySelectorAll("[data-segment]");
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveStyle({ flexGrow: "0.75" });
    expect(segments[1]).toHaveStyle({ flexGrow: "0.25" });
  });
});
