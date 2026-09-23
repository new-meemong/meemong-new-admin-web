import { describe, expect, it } from "vitest";
import {
  chargeSeries,
  dateRange,
  dayCount,
  groupValues,
  kstToday,
  paymentSummary,
  retentionLabel,
  roleCount,
  roleItems,
  sumKnown,
  validateRange,
} from "./statistics";
import { saleSummary } from "./review-sale-dashboard";
import mong from "@/apis/dashboards/__fixtures__/mong-statistics.json";
import sales from "@/apis/dashboards/__fixtures__/time-sale-menu-statistics.json";
import type { MongDay } from "@/apis/dashboards/types";
const day = mong.dataList[0] as MongDay;
describe("dashboard date and aggregation semantics", () => {
  it("keeps different item codes stable when their display titles match", () => {
    const rows = groupValues(
      [
        { code: "CHAT", amount: 10 },
        { code: "CHAT_V2", amount: 20 },
        { code: "CHAT", amount: 5 },
      ],
      (item) => item.code,
      (item) => item.amount,
    ).map((row) => ({ ...row, label: "채팅" }));
    expect(rows.map((row) => row.id)).toEqual(["CHAT", "CHAT_V2"]);
    expect(rows.map((row) => row.value)).toEqual([15, 20]);
  });
  it("uses KST and inclusive calendar dates across month/year boundaries", () => {
    expect(kstToday(new Date("2026-12-31T15:00:00Z"))).toBe("2027-01-01");
    expect(dateRange(7, "2027-01-01")).toEqual({
      startDateKST: "2026-12-26",
      endDateKST: "2027-01-01",
    });
    expect(dayCount(dateRange(90, "2026-09-23"))).toBe(90);
    expect(validateRange(dateRange(90, "2026-09-23"), "2026-09-23")).toBeNull();
    expect(
      validateRange(dateRange(91, "2026-09-23"), "2026-09-23"),
    ).not.toBeNull();
    expect(
      validateRange({ startDateKST: "2026-02-30", endDateKST: "2026-03-01" }),
    ).not.toBeNull();
    expect(
      validateRange({ startDateKST: "2026-09-24", endDateKST: "2026-09-23" }),
    ).not.toBeNull();
    expect(
      validateRange(dateRange(1, "2026-09-24"), "2026-09-23"),
    ).not.toBeNull();
  });
  it("preserves unknown values while including unknown-role records in all", () => {
    expect(sumKnown([100, null])).toBeNull();
    expect(sumKnown([0, 0])).toBe(0);
    expect(
      roleCount({ model: null, designer: 10, unknown: 0 }, "all"),
    ).toBeNull();
    expect(roleCount({ model: 4, designer: 2, unknown: 1 }, "all")).toBe(7);
    expect(
      roleItems(
        {
          misleading_key: {
            role: "designer",
            subType: "CODE_WITH_UNDERSCORES",
          },
        },
        "model",
      ),
    ).toEqual([]);
  });
  it("uses stored totals, not the latest price multiplied by purchases", () => {
    const item = Object.values(day.chargedItems)[0];
    const changed = {
      ...day,
      chargedItems: {
        opaque: {
          ...item,
          paymentAmountKRW: 999999,
          totalPaymentAmountKRW: null,
          knownTotalPaymentAmountKRW: 9900,
          unknownTotalPaymentCount: 1,
        },
      },
    };
    expect(paymentSummary([changed], "model")).toMatchObject({
      revenue: null,
      known: 9900,
      unknown: 1,
      unitPrice: null,
      charged: 200,
    });
    expect(paymentSummary([changed], "designer").revenue).toBe(0);
  });
  it("orders chart dates and starts moving averages only after a full window", () => {
    const days = Array.from({ length: 30 }, (_, i) => ({
      ...day,
      dateKST: `2026-09-${String(i + 1).padStart(2, "0")}`,
    })).reverse();
    const series = chargeSeries(days, "all", {
      startDateKST: "2026-09-01",
      endDateKST: "2026-09-30",
    });
    expect(series[0].dateKST).toBe("2026-09-01");
    expect(series[8].ma10).toBeNull();
    expect(series[9].ma10).toBe(200);
    expect(series[28].ma30).toBeNull();
    expect(series[29].ma30).toBe(200);
  });
  it("includes other-time reservations and preserves the server's 25-hour bucket", () => {
    expect(saleSummary(sales.dataList).reserved).toBe(499);
    expect(
      retentionLabel({ lowerSeconds: 43200, upperSeconds: 90000, count: 0 }),
    ).toBe("12시간~25시간 미만");
    expect(
      retentionLabel({ lowerSeconds: 7776000, upperSeconds: null, count: 0 }),
    ).toBe("90일 이상");
  });
});
