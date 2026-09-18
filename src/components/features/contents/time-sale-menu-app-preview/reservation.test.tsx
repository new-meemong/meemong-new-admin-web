import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDefaultPreviewReservationDate,
  getPreviewDaySlots,
  getPreviewReservationDates,
} from "./reservation";
import TimeSaleMenuReservationTab from "./reservation-tab";

const slots = [
  { id: 1, dayOfWeek: "금", startTime: "0930", endTime: "1000" },
  { id: 2, dayOfWeek: "금", startTime: "12:00", endTime: "12:30" },
  { id: 3, dayOfWeek: "토", startTime: "0900", endTime: "0930" },
];
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-18T10:00:00+09:00"));
});
afterEach(() => vi.useRealTimers());

describe("app reservation preview", () => {
  it("shows seven dates from KST today across a month boundary", () => {
    const dates = getPreviewReservationDates(new Date("2026-09-30T15:01:00Z"));
    expect(dates).toHaveLength(7);
    expect(dates[0]).toMatchObject({
      key: "2026-10-01",
      month: 10,
      date: 1,
      dayOfWeek: "목",
      label: "오늘",
    });
    expect(dates[6].key).toBe("2026-10-07");
  });
  it("normalizes times, sorts them, and marks past slots", () => {
    expect(
      getPreviewDaySlots([...slots].reverse(), "금", "2026-09-18").map(
        (slot) => [slot.time, slot.isPast],
      ),
    ).toEqual([
      ["09:30", true],
      ["12:00", false],
    ]);
  });
  it("selects the first day with a future registered slot, as the app does", () => {
    expect(getDefaultPreviewReservationDate(slots)).toBe("2026-09-18");
    expect(
      getDefaultPreviewReservationDate(
        slots,
        new Date("2026-09-18T13:00:00+09:00"),
      ),
    ).toBe("2026-09-19");
  });
  it("renders the real reservation tab with AM/PM groups and selected state", () => {
    const html = renderToStaticMarkup(
      <TimeSaleMenuReservationTab
        slots={slots}
        selectedDate="2026-09-18"
        selectedSlotId={2}
        onDateChange={() => {}}
        onSlotChange={() => {}}
      />,
    );
    expect(html).toContain("9월 18일 오늘");
    expect(html).toContain("오전");
    expect(html).toContain("오후");
    expect(html).toContain('disabled="" aria-pressed="false"');
    expect(html).toMatch(/aria-pressed="true"[^>]*>12:00/);
    expect(html).not.toContain('type="submit"');
  });
  it("shows empty state for days without registered slots", () => {
    const html = renderToStaticMarkup(
      <TimeSaleMenuReservationTab
        slots={slots}
        selectedDate="2026-09-20"
        selectedSlotId={null}
        onDateChange={() => {}}
        onSlotChange={() => {}}
      />,
    );
    expect(html).toContain("예약 가능한 시간이 없습니다.");
    expect(html).not.toContain("12:00");
  });
});
