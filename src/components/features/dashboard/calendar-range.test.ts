import { describe, expect, it } from "vitest";
import { parseISO } from "date-fns";
import { addToRange } from "react-day-picker";
import { calendarRangeDraft } from "./calendar-range";
import { dayCount, validateRange } from "./statistics";
import type { DashboardDateRange } from "@/apis/dashboards/types";

// Exercise the installed DayPicker's selection behavior before our callback.
function click(draft: DashboardDateRange, date: string) {
  const trigger = parseISO(date);
  const selection = addToRange(
    trigger,
    {
      from: draft.startDateKST ? parseISO(draft.startDateKST) : undefined,
      to: draft.endDateKST ? parseISO(draft.endDateKST) : undefined,
    },
    0,
    89,
  );
  return calendarRangeDraft(draft, selection, trigger);
}
const initial = { startDateKST: "2026-09-21", endDateKST: "2026-10-20" };
describe("dashboard calendar range selection", () => {
  it("moves the start forward and completes a fresh custom range", () => {
    const draft = click(initial, "2026-10-01");
    expect(draft).toEqual({ startDateKST: "2026-10-01", endDateKST: "" });
    expect(validateRange(draft, "2026-10-20")).not.toBeNull();
    const completed = click(draft, "2026-10-10");
    expect(completed).toEqual({
      startDateKST: "2026-10-01",
      endDateKST: "2026-10-10",
    });
    expect(validateRange(completed, "2026-10-20")).toBeNull();
  });
  it("selects a single day with two clicks", () => {
    expect(click(click(initial, "2026-10-01"), "2026-10-01")).toEqual({
      startDateKST: "2026-10-01",
      endDateKST: "2026-10-01",
    });
  });
  it("orders a range selected backwards", () => {
    expect(click(click(initial, "2026-10-10"), "2026-10-01")).toEqual({
      startDateKST: "2026-10-01",
      endDateKST: "2026-10-10",
    });
  });
  it("accepts 90 inclusive days and restarts at 91 days", () => {
    const draft = click(initial, "2026-07-01");
    const boundary = click(draft, "2026-09-28");
    expect(dayCount(boundary)).toBe(90);
    expect(validateRange(boundary, "2026-10-20")).toBeNull();
    expect(click(draft, "2026-09-29")).toEqual({
      startDateKST: "2026-09-29",
      endDateKST: "",
    });
  });
});
