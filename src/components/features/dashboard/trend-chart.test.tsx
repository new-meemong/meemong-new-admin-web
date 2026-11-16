import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
const { line, boundary, legend, tooltip } = vi.hoisted(() => ({
  line: vi.fn<(props: Record<string, unknown>) => null>(() => null),
  boundary: vi.fn<(props: Record<string, unknown>) => null>(() => null),
  legend: vi.fn<(props: Record<string, unknown>) => null>(() => null),
  tooltip: vi.fn<(props: Record<string, unknown>) => null>(() => null),
}));
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
  LineChart: ({ children }: { children: ReactNode }) => children,
  Line: line,
  ReferenceLine: boundary,
  Legend: legend,
  Tooltip: tooltip,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  BarChart: () => null,
  Bar: () => null,
}));
import { TrendChart } from "./dashboard-widgets";
beforeEach(() => vi.clearAllMocks());
describe("TrendChart calendar-month rendering", () => {
  it("splits at the month boundary without losing either endpoint or duplicating legends", () => {
    const data = [
      { dateKST: "2026-10-31", all: 900 },
      { dateKST: "2026-11-01", all: 100 },
    ];
    renderToStaticMarkup(
      <TrendChart
        data={data}
        lines={[{ key: "all", label: "전체", color: "#1d1d1f" }]}
        splitByMonth
        unit="명"
      />,
    );
    const props = line.mock.calls.map((call) => call[0]) as unknown as {
      dataKey: (row: (typeof data)[number]) => number | null;
      connectNulls: boolean;
      dot: boolean;
    }[];
    expect(props).toHaveLength(2);
    expect(props.map((p) => data.map(p.dataKey))).toEqual([
      [900, null],
      [null, 100],
    ]);
    expect(props.every((p) => p.connectNulls === false && p.dot)).toBe(true);
    expect(boundary).toHaveBeenCalledWith(
      expect.objectContaining({
        x: "2026-11-01",
        label: expect.objectContaining({ value: "11월 집계 시작" }),
      }),
      undefined,
    );
    const legendProps = legend.mock.calls[0][0] as unknown as {
      content: () => ReactNode;
    };
    expect(renderToStaticMarkup(legendProps.content())).toContain("전체");
    const tooltipProps = tooltip.mock.calls[0][0] as unknown as {
      formatter: (value: number) => string;
    };
    expect(tooltipProps.formatter(900)).toBe("900명");
  });
  it("keeps the existing continuous line contract by default", () => {
    renderToStaticMarkup(
      <TrendChart
        data={[{ dateKST: "2026-11-01", count: 1 }]}
        lines={[{ key: "count", label: "건수", color: "red" }]}
      />,
    );
    expect(line).toHaveBeenCalledWith(
      expect.objectContaining({ dataKey: "count", connectNulls: false }),
      undefined,
    );
    expect(boundary).not.toHaveBeenCalled();
  });
});
