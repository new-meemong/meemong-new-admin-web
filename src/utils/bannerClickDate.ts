import type { BannerClickDateRange } from "@/models/bannerClick";
import type { BannerClickPeriodPreset } from "@/constants/bannerClick";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function toKstDateKey(date: Date) {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function kstDateKeyToUtcStart(dateKey: string) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!matched) throw new Error("날짜 형식은 YYYY-MM-DD여야 합니다.");

  const [, year, month, day] = matched;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)) - KST_OFFSET_MS,
  );
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const utc = kstDateKeyToUtcStart(dateKey);
  return toKstDateKey(new Date(utc.getTime() + days * DAY_MS));
}

export function createBannerClickDateRange(
  preset: BannerClickPeriodPreset,
  options: { now?: Date; customFrom?: string; customTo?: string } = {},
): BannerClickDateRange {
  const todayKey = toKstDateKey(options.now ?? new Date());
  const toDateKey = addDaysToDateKey(todayKey, 1);

  if (preset === "all") {
    return { to: kstDateKeyToUtcStart(toDateKey), toDateKey };
  }

  if (preset === "custom") {
    if (!options.customFrom || !options.customTo) {
      throw new Error("조회 시작일과 종료일을 모두 입력해주세요.");
    }
    if (options.customFrom > options.customTo) {
      throw new Error("조회 시작일은 종료일보다 늦을 수 없습니다.");
    }
    const customToExclusive = addDaysToDateKey(options.customTo, 1);
    return {
      from: kstDateKeyToUtcStart(options.customFrom),
      to: kstDateKeyToUtcStart(customToExclusive),
      fromDateKey: options.customFrom,
      toDateKey: customToExclusive,
    };
  }

  const days = preset === "7d" ? 7 : 30;
  const fromDateKey = addDaysToDateKey(toDateKey, -days);
  return {
    from: kstDateKeyToUtcStart(fromDateKey),
    to: kstDateKeyToUtcStart(toDateKey),
    fromDateKey,
    toDateKey,
  };
}

export function getPreviousBannerClickDateRange(
  range: BannerClickDateRange,
): BannerClickDateRange | undefined {
  if (!range.from || !range.fromDateKey) return undefined;
  const duration = range.to.getTime() - range.from.getTime();
  const previousTo = new Date(range.from);
  const previousFrom = new Date(range.from.getTime() - duration);
  return {
    from: previousFrom,
    to: previousTo,
    fromDateKey: toKstDateKey(previousFrom),
    toDateKey: range.fromDateKey,
  };
}

export function getInclusiveKstDayCount(first: Date, last: Date) {
  const firstDateKey = toKstDateKey(first);
  const lastDateExclusiveKey = addDaysToDateKey(toKstDateKey(last), 1);
  return Math.max(
    1,
    Math.round(
      (kstDateKeyToUtcStart(lastDateExclusiveKey).getTime() -
        kstDateKeyToUtcStart(firstDateKey).getTime()) /
        DAY_MS,
    ),
  );
}

export function listKstDateKeys(
  range: BannerClickDateRange,
  fallbackFromDateKey?: string,
) {
  const fromDateKey = range.fromDateKey ?? fallbackFromDateKey;
  if (!fromDateKey) return [];
  const keys: string[] = [];
  let cursor = fromDateKey;
  while (cursor < range.toDateKey) {
    keys.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
  }
  return keys;
}
