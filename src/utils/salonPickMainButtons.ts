import dayjs from "dayjs";
import {
  ISalonPickMainButton,
  ISalonPickMainButtonDailyClickCount,
} from "@/models/salonPickMainButtons";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeSalonPickMainButtonDailyClickCounts(
  counts: unknown,
): ISalonPickMainButtonDailyClickCount[] {
  const source = Array.isArray(counts)
    ? counts
    : isRecord(counts) && Array.isArray(counts.dataList)
      ? counts.dataList
      : isRecord(counts) && Array.isArray(counts.content)
        ? counts.content
        : isRecord(counts) && ("date" in counts || "dailyClickCount" in counts)
          ? [counts]
          : [];

  return source
    .filter(isRecord)
    .map((count) => ({
      id: Number(count.id ?? 0),
      date: String(count.date ?? ""),
      dailyClickCount: Number(count.dailyClickCount ?? 0),
      createdAt: String(count.createdAt ?? ""),
      updatedAt: String(count.updatedAt ?? ""),
      salonPickMainButtonId: Number(count.salonPickMainButtonId ?? 0),
    }))
    .filter((count) => count.date);
}

export function getSalonPickMainButtonTotalClickCount(
  mainButton?: Pick<ISalonPickMainButton, "clickCount"> & {
    dailyClickCounts?: unknown;
  },
): number {
  if (typeof mainButton?.clickCount === "number") return mainButton.clickCount;

  return normalizeSalonPickMainButtonDailyClickCounts(
    mainButton?.dailyClickCounts,
  ).reduce((total, count) => total + count.dailyClickCount, 0);
}

export function getSalonPickMainButtonPreviousDayClickCount(
  mainButton?: Pick<ISalonPickMainButton, "yesterdayDailyClickCount"> & {
    dailyClickCounts?: unknown;
  },
): number {
  if (mainButton?.yesterdayDailyClickCount === null) return 0;
  if (typeof mainButton?.yesterdayDailyClickCount?.dailyClickCount === "number")
    return mainButton.yesterdayDailyClickCount.dailyClickCount;

  const previousDay = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  return (
    normalizeSalonPickMainButtonDailyClickCounts(
      mainButton?.dailyClickCounts,
    ).find((count) => dayjs(count.date).format("YYYY-MM-DD") === previousDay)
      ?.dailyClickCount ?? 0
  );
}

export function sortSalonPickMainButtonDailyClickCountsByDateDesc(
  counts: unknown,
): ISalonPickMainButtonDailyClickCount[] {
  return normalizeSalonPickMainButtonDailyClickCounts(counts).sort((a, b) =>
    dayjs(b.date).diff(dayjs(a.date)),
  );
}
