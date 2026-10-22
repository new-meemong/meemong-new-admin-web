import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { DashboardDateRange } from "@/apis/dashboards/types";

export function calendarRangeDraft(
  draft: DashboardDateRange,
  selection: DateRange | undefined,
  triggerDate: Date,
): DashboardDateRange {
  const clickedDate = format(triggerDate, "yyyy-MM-dd");
  // A completed range starts a fresh two-click selection.
  if (draft.startDateKST && draft.endDateKST) {
    return { startDateKST: clickedDate, endDateKST: "" };
  }
  // DayPicker clears an open range when its start is clicked again.
  // Treat that second click as a one-day selection instead.
  if (draft.startDateKST === clickedDate && !draft.endDateKST) {
    return { startDateKST: clickedDate, endDateKST: clickedDate };
  }
  return {
    startDateKST: selection?.from ? format(selection.from, "yyyy-MM-dd") : "",
    endDateKST: selection?.to ? format(selection.to, "yyyy-MM-dd") : "",
  };
}
