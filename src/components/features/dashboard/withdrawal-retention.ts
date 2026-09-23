import type { WithdrawalRecord } from "@/apis/dashboards/withdrawal-records";
import type {
  DashboardDateRange,
  DashboardRoleFilter,
} from "@/apis/dashboards/types";

export function withdrawalRetention(
  records: WithdrawalRecord[],
  range: DashboardDateRange,
  role: DashboardRoleFilter,
) {
  const start = Date.parse(`${range.startDateKST}T00:00:00+09:00`);
  const end = Date.parse(`${range.endDateKST}T00:00:00+09:00`) + 86400000;
  let totalDays = 0;
  let count = 0;
  let excluded = 0;
  for (const record of records) {
    if (role !== "all" && record.role !== (role === "model" ? 1 : 2)) continue;
    const withdrawn = record.withdrawAt ? Date.parse(record.withdrawAt) : NaN;
    if (Number.isFinite(withdrawn) && (withdrawn < start || withdrawn >= end))
      continue;
    const joined = record.joinedAt ? Date.parse(record.joinedAt) : NaN;
    const elapsed = withdrawn - joined;
    if (!Number.isFinite(elapsed) || elapsed < 0) {
      excluded++;
      continue;
    }
    totalDays += elapsed / 86400000;
    count++;
  }
  return { averageDays: count ? totalDays / count : null, count, excluded };
}
