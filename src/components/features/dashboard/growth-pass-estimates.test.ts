import { describe, expect, it } from "vitest";
import { growthPassEstimates } from "./growth-pass-estimates";

const meta = {
  startDateKST: "2026-09-01 00:00:00",
  endDateKST: "2026-09-09 00:00:00",
};
describe("growth pass purchase-based active estimates", () => {
  it("expires on calendar days, fills missing days, and sums overlapping durations", () => {
    const { series } = growthPassEstimates({
      meta,
      dataList: [
        {
          dateKST: "2026-09-04",
          usedCountByType: { "[디자이너] 성장패스 3일": 2 },
        },
        {
          dateKST: "2026-09-01",
          usedCountByType: {
            "[디자이너] 성장패스 3일": 1,
            "[디자이너] 성장패스 7일": 3,
          },
        },
      ],
    });
    expect(series).toHaveLength(8);
    expect(series.map((day) => day.total)).toEqual([4, 4, 4, 5, 5, 5, 3, 0]);
    expect(series[3]).toMatchObject({
      dateKST: "2026-09-04",
      days3: 2,
      days7: 3,
    });
    expect(series.at(-1)?.dateKST).toBe("2026-09-08");
  });
  it("includes only designer pass purchases, supports newly introduced durations", () => {
    const { series, durations } = growthPassEstimates({
      meta,
      dataList: [
        {
          dateKST: "2026-09-01",
          usedCountByType: {
            "[모델] 성장패스 30일": 30,
            "[디자이너] 빠른매칭 프리미엄공고": 100,
            "[디자이너] 성장패스 0일": 10,
            "[디자이너] 성장패스 365일": 2,
          },
        },
      ],
    });
    expect(durations).toContain(365);
    expect(series.every((day) => day.total === 2)).toBe(true);
  });
  it("keeps purchases before the visible seven-day window in the rolling total", () => {
    const { series } = growthPassEstimates({
      meta,
      dataList: [
        {
          dateKST: "2026-09-01",
          usedCountByType: { "[디자이너] 성장패스 30일": 5 },
        },
      ],
    });
    expect(series.slice(-7).every((day) => day.total === 5)).toBe(true);
  });
  it("returns zero estimates for an empty but valid query period", () => {
    expect(
      growthPassEstimates({ meta, dataList: [] }).series.map(
        (day) => day.total,
      ),
    ).toEqual(Array(8).fill(0));
  });
});
