import type {
  DashboardDateRange,
  DashboardRoleFilter,
  UserStatistics,
} from "@/apis/dashboards/types";
import { dayCount, formatNumber, kstToday, roleCount } from "./statistics";

export const activityRoleLines = [
  { key: "all", label: "전체", color: "#1d1d1f" },
  { key: "model", label: "고객", color: "#007aff" },
  { key: "designer", label: "디자이너", color: "#003d82" },
] as const;

/** 누락된 날짜와 미수집 값은 0으로 채우지 않고 선을 끊습니다. */
export function activityTrendData(
  statistics: UserStatistics | undefined,
  range: DashboardDateRange,
  metric: "dau" | "mau",
) {
  const days = new Map(statistics?.dataList.map((day) => [day.dateKST, day]));
  const startedAt = statistics?.meta.activityTrackingStartedAt;
  const trackingStart = startedAt ? kstToday(new Date(startedAt)) : null;
  return Array.from({ length: dayCount(range) }, (_, index) => {
    const dateKST = new Date(Date.parse(range.startDateKST) + index * 86400000)
      .toISOString()
      .slice(0, 10);
    const day = days.get(dateKST);
    const coverage =
      metric === "dau" ? day?.activityCoverage : day?.mauCoverage;
    const counts = metric === "dau" ? day?.dauCounts : day?.mauCounts;
    const available =
      counts &&
      coverage !== "unavailable" &&
      (!trackingStart || dateKST >= trackingStart);
    return {
      dateKST,
      all: available ? roleCount(counts, "all") : null,
      model: available ? counts.model : null,
      designer: available ? counts.designer : null,
      partial: coverage === "partial",
    };
  });
}

export function activityTrendDescription(
  data: ReturnType<typeof activityTrendData>,
  role: DashboardRoleFilter,
  metric: "dau" | "mau",
) {
  const known = data.filter((day) => day[role] != null);
  const coverageNote = data.some((day) => day.partial)
    ? " · 일부 기간 수집"
    : "";
  if (metric === "dau") {
    const average = known.length
      ? known.reduce((total, day) => total + day[role]!, 0) / known.length
      : null;
    const peak = known.reduce<(typeof known)[number] | undefined>(
      (max, day) => (!max || day[role]! > max[role]! ? day : max),
      undefined,
    );
    return `일별 활성 사용자 · ${known.length < data.length ? "수집일" : "기간"} 평균 ${formatNumber(average == null ? null : Math.round(average), "명")} · 최고 ${formatNumber(peak?.[role], "명")}${peak ? ` (${peak.dateKST.slice(5).replace("-", ".")})` : ""}${coverageNote}`;
  }
  const months = new Map<string, (typeof known)[number]>();
  known.forEach((day) => months.set(day.dateKST.slice(0, 7), day));
  return `월 누적 활성 사용자 · 매월 1일 초기화${[...months.values()]
    .map((day) => {
      const nextDay = new Date(Date.parse(day.dateKST) + 86400000)
        .toISOString()
        .slice(0, 10);
      const endOfMonth = nextDay.slice(0, 7) !== day.dateKST.slice(0, 7);
      return ` · ${Number(day.dateKST.slice(5, 7))}월${endOfMonth ? "" : ` ${Number(day.dateKST.slice(8))}일까지`} ${formatNumber(day[role], "명")}`;
    })
    .join("")}${coverageNote}`;
}
