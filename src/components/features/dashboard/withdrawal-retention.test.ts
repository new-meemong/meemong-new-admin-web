import { describe, expect, it } from "vitest";
import { withdrawalRetention } from "./withdrawal-retention";
const range = { startDateKST: "2026-09-01", endDateKST: "2026-09-01" };
describe("withdrawal retention average", () => {
  it("filters roles and KST date boundaries and averages elapsed time rather than buckets", () => {
    const records = [
      {
        id: 1,
        role: 1,
        joinedAt: "2026-08-30T15:00:00Z",
        withdrawAt: "2026-08-31T15:00:00Z",
      },
      {
        id: 2,
        role: 2,
        joinedAt: "2026-08-28T15:00:00Z",
        withdrawAt: "2026-08-31T15:00:00Z",
      },
      {
        id: 3,
        role: 1,
        joinedAt: "2026-08-01T00:00:00Z",
        withdrawAt: "2026-09-01T15:00:00Z",
      },
    ];
    expect(withdrawalRetention(records, range, "all")).toEqual({
      averageDays: 2,
      count: 2,
      excluded: 0,
    });
    expect(withdrawalRetention(records, range, "model").averageDays).toBe(1);
    expect(withdrawalRetention(records, range, "designer").averageDays).toBe(3);
  });
  it("excludes missing, invalid and negative dates while preserving zero duration", () => {
    const record = {
      id: 1,
      role: 1,
      joinedAt: "2026-09-01T00:00:00Z",
      withdrawAt: "2026-09-01T00:00:00Z",
    };
    expect(
      withdrawalRetention(
        [
          record,
          { ...record, joinedAt: null },
          { ...record, joinedAt: "invalid" },
          { ...record, joinedAt: "2026-09-02T00:00:00Z" },
        ],
        range,
        "all",
      ),
    ).toEqual({ averageDays: 0, count: 1, excluded: 3 });
    expect(withdrawalRetention([], range, "all").averageDays).toBeNull();
  });
});
