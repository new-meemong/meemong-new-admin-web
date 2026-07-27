import { describe, expect, it } from "vitest";
import {
  createBannerClickDateRange,
  getInclusiveKstDayCount,
  getPreviousBannerClickDateRange,
  listKstDateKeys,
  toKstDateKey,
} from "@/utils/bannerClickDate";

describe("banner click KST date ranges", () => {
  it("uses midnight KST as the day boundary", () => {
    expect(toKstDateKey(new Date("2026-06-30T14:59:59.999Z"))).toBe(
      "2026-06-30",
    );
    expect(toKstDateKey(new Date("2026-06-30T15:00:00.000Z"))).toBe(
      "2026-07-01",
    );
  });

  it("creates an inclusive 7-day KST preset", () => {
    const range = createBannerClickDateRange("7d", {
      now: new Date("2026-07-27T03:00:00.000Z"),
    });

    expect(range.from?.toISOString()).toBe("2026-07-20T15:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-07-27T15:00:00.000Z");
    expect(listKstDateKeys(range)).toHaveLength(7);
  });

  it("creates the immediately preceding range with the same duration", () => {
    const range = createBannerClickDateRange("custom", {
      customFrom: "2026-07-01",
      customTo: "2026-07-10",
    });
    const previous = getPreviousBannerClickDateRange(range);

    expect(previous?.fromDateKey).toBe("2026-06-21");
    expect(previous?.toDateKey).toBe("2026-07-01");
  });

  it("rejects incomplete or reversed custom ranges", () => {
    expect(() =>
      createBannerClickDateRange("custom", {
        customFrom: "",
        customTo: "2026-07-10",
      }),
    ).toThrow("조회 시작일과 종료일을 모두 입력해주세요.");
    expect(() =>
      createBannerClickDateRange("custom", {
        customFrom: "2026-07-11",
        customTo: "2026-07-10",
      }),
    ).toThrow("조회 시작일은 종료일보다 늦을 수 없습니다.");
  });

  it("expands an all-time range from the earliest click date", () => {
    const range = createBannerClickDateRange("all", {
      now: new Date("2026-07-27T03:00:00.000Z"),
    });

    expect(listKstDateKeys(range, "2026-07-25")).toEqual([
      "2026-07-25",
      "2026-07-26",
      "2026-07-27",
    ]);
  });

  it("counts a banner's first-to-last click dates inclusively in KST", () => {
    expect(
      getInclusiveKstDayCount(
        new Date("2026-06-30T14:00:00.000Z"),
        new Date("2026-07-01T16:00:00.000Z"),
      ),
    ).toBe(3);
  });
});
