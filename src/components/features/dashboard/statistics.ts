import type {
  DashboardDateRange,
  DashboardRoleFilter,
  MongDay,
  PaymentTotals,
  RetentionBucket,
} from "@/apis/dashboards/types";

export const formatNumber = (value: number | null | undefined, unit = "") =>
  value == null
    ? "—"
    : `${new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 1 }).format(value)}${unit}`;
export const kstToday = (now = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
export function dateRange(
  days: number,
  endDateKST = kstToday(),
): DashboardDateRange {
  const start = new Date(`${endDateKST}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { startDateKST: start.toISOString().slice(0, 10), endDateKST };
}
export const dayCount = (range: DashboardDateRange) =>
  (Date.parse(range.endDateKST) - Date.parse(range.startDateKST)) / 86400000 +
  1;
export function validateRange(range: DashboardDateRange, today = kstToday()) {
  const validDate = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  if (!validDate(range.startDateKST) || !validDate(range.endDateKST))
    return "유효한 시작일과 마감일을 입력해주세요.";
  if (range.endDateKST > today) return "미래 날짜는 조회할 수 없습니다.";
  if (dayCount(range) < 1 || dayCount(range) > 90)
    return "시작일과 마감일을 포함해 최대 90일까지 조회할 수 있습니다.";
  return null;
}
export const sumKnown = (values: (number | null)[]) =>
  values.some((value) => value === null)
    ? null
    : (values as number[]).reduce((sum, value) => sum + value, 0);
export const roleCount = (
  counts: Record<string, number | null>,
  role: DashboardRoleFilter,
) => (role === "all" ? sumKnown(Object.values(counts)) : counts[role]);
export const roleItems = <T extends { role: string }>(
  items: Record<string, T>,
  role: DashboardRoleFilter,
) =>
  Object.values(items).filter((item) => role === "all" || item.role === role);
export const ascending = <T extends { dateKST: string }>(days: T[]) =>
  [...days].sort((a, b) => a.dateKST.localeCompare(b.dateKST));
export function chargeHistoryRange(
  range: DashboardDateRange,
): DashboardDateRange {
  const previousDay = dateRange(2, range.startDateKST).startDateKST;
  return dateRange(29, previousDay);
}
export function chargeSeries(
  days: MongDay[],
  role: DashboardRoleFilter,
  range: DashboardDateRange,
) {
  const series = ascending(days).map((day) => ({
    dateKST: day.dateKST,
    charged:
      role === "all"
        ? day.chargedTotals.totalChargedMongAmount
        : roleItems(day.chargedItems, role).reduce(
            (sum, item) => sum + item.totalChargedMongAmount,
            0,
          ),
  }));
  return series
    .map((day, index) => {
      const average = (window: number) =>
        index + 1 < window
          ? null
          : series
              .slice(index - window + 1, index + 1)
              .reduce((sum, item) => sum + item.charged, 0) / window;
      return { ...day, ma10: average(10), ma30: average(30) };
    })
    .filter(
      (day) =>
        day.dateKST >= range.startDateKST && day.dateKST <= range.endDateKST,
    );
}
export type RankingRow = {
  id?: string;
  label: string;
  detail?: string;
  value: number;
  count?: number;
};
export function groupValues<T>(
  items: T[],
  label: (item: T) => string,
  value: (item: T) => number,
  count?: (item: T) => number,
): RankingRow[] {
  const groups = new Map<string, RankingRow>();
  items.forEach((item) => {
    const key = label(item);
    const row = groups.get(key) ?? {
      id: key,
      label: key,
      value: 0,
      ...(count && { count: 0 }),
    };
    row.value += value(item);
    if (count) row.count = (row.count ?? 0) + count(item);
    groups.set(key, row);
  });
  return [...groups.values()];
}
export const reasonRows = (counts: Record<string, number>[]) =>
  groupValues(
    counts.flatMap(Object.entries),
    (item) => item[0],
    (item) => item[1],
  );
const durationLabel = (seconds: number) =>
  seconds < 3600
    ? `${seconds / 60}분`
    : seconds < 86400 * 3
      ? `${seconds / 3600}시간`
      : `${seconds / 86400}일`;
export const retentionLabel = (bucket: RetentionBucket) =>
  bucket.upperSeconds === null
    ? `${durationLabel(bucket.lowerSeconds)} 이상`
    : `${durationLabel(bucket.lowerSeconds)}~${durationLabel(bucket.upperSeconds)} 미만`;

export function revenueSummary(totals: PaymentTotals[]) {
  const revenue = sumKnown(totals.map((row) => row.totalPaymentAmountKRW));
  const known = totals.reduce(
    (sum, row) => sum + row.knownTotalPaymentAmountKRW,
    0,
  );
  const unknown = totals.reduce(
    (sum, row) => sum + row.unknownTotalPaymentCount,
    0,
  );
  return { revenue, known, unknown, displayRevenue: revenue ?? known };
}

export function paymentSummary(days: MongDay[], role: DashboardRoleFilter) {
  const totals = days.flatMap((day) =>
    role === "all" ? [day.chargedTotals] : roleItems(day.chargedItems, role),
  );
  const charged = totals.reduce(
    (sum, row) => sum + row.totalChargedMongAmount,
    0,
  );
  const money = revenueSummary(totals);
  const unitPrice =
    money.revenue !== null && charged > 0 ? money.revenue / charged : null;
  return {
    charged,
    ...money,
    unitPrice,
    unitPriceLabel:
      money.unknown > 0
        ? "미확인 포함으로 계산 불가"
        : formatNumber(unitPrice, "원"),
  };
}
