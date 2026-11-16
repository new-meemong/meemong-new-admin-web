import { describe, expect, it } from "vitest";
import fixture from "@/apis/dashboards/__fixtures__/user-statistics.json";
import type { UserStatistics } from "@/apis/dashboards/types";
import { activityTrendData, activityTrendDescription } from "./activity-trends";
const range = { startDateKST: "2026-09-09", endDateKST: "2026-09-12" };
describe("activity trends", () => {
  it("preserves missing dates, pre-tracking data and unavailable counts as gaps", () => {
    const statistics = structuredClone(fixture) as UserStatistics;
    statistics.meta.activityTrackingStartedAt = "2026-09-09T15:00:00Z";
    const day = statistics.dataList[0];
    statistics.dataList = [
      { ...day, dateKST: "2026-09-09" },
      day,
      { ...day, dateKST: "2026-09-12", activityCoverage: "unavailable" },
    ];
    expect(
      activityTrendData(statistics, range, "dau").map((d) => d.all),
    ).toEqual([null, 120, null, null]);
    expect(
      activityTrendDescription(
        activityTrendData(statistics, range, "dau"),
        "model",
        "dau",
      ),
    ).toBe("일별 활성 사용자 · 수집일 평균 100명 · 최고 100명 (09.10)");
  });
  it("keeps a genuine zero and computes monthly labels from the latest known date", () => {
    const statistics = structuredClone(fixture) as UserStatistics;
    const day = statistics.dataList[0];
    statistics.dataList = [
      { ...day, dateKST: "2026-10-31", mauCoverage: "complete" },
      {
        ...day,
        dateKST: "2026-11-01",
        mauCoverage: "complete",
        mauCounts: { model: 0, designer: 0, unknown: 0 },
      },
    ];
    const data = activityTrendData(
      statistics,
      { startDateKST: "2026-10-31", endDateKST: "2026-11-01" },
      "mau",
    );
    expect(data.map((d) => d.all)).toEqual([580, 0]);
    expect(activityTrendDescription(data, "all", "mau")).toBe(
      "월 누적 활성 사용자 · 매월 1일 초기화 · 10월 580명 · 11월 1일까지 0명",
    );
  });
});
