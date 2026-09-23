"use client";
import type {
  DashboardDateRange,
  DashboardRoleFilter,
} from "@/apis/dashboards/types";
import {
  useDashboardUsers,
  useDashboardWithdrawals,
  useDashboardWithdrawalRecords,
} from "@/queries/dashboards";
import {
  ascending,
  dateRange,
  dayCount,
  formatNumber,
  groupValues,
  reasonRows,
  retentionLabel,
  roleCount,
} from "./statistics";
import {
  DistributionChart,
  Metric,
  Panel,
  QueryState,
  Ranking,
  TrendChart,
} from "./dashboard-widgets";
import { withdrawalRetention } from "./withdrawal-retention";

export default function ActivityDashboard({
  range,
  role,
}: {
  range: DashboardDateRange;
  role: DashboardRoleFilter;
}) {
  const users = useDashboardUsers(dateRange(1));
  const withdrawals = useDashboardWithdrawals(range);
  const records = useDashboardWithdrawalRecords(range);
  const retention = withdrawalRetention(records.data ?? [], range, role);
  const today = users.data?.dataList[0];
  const dau = today ? roleCount(today.dauCounts, role) : null;
  const mau = today ? roleCount(today.mauCounts, role) : null;
  const days = ascending(withdrawals.data?.dataList ?? []);
  const withdrawn = days.reduce(
    (sum, day) => sum + (roleCount(day.countsByRole, role) ?? 0),
    0,
  );
  const unknown = days.reduce((sum, day) => sum + day.unknownRetentionCount, 0);
  const bucketItems = days
    .flatMap((day) => Object.values(day.retentionBuckets))
    .sort((a, b) => a.lowerSeconds - b.lowerSeconds);
  const label =
    role === "model" ? "고객" : role === "designer" ? "디자이너" : "전체";
  const activityDetail =
    today?.activityCoverage === "unavailable"
      ? "미수집"
      : today?.activityCoverage === "partial"
        ? "일부 기간 수집"
        : "일간 활성 사용자";
  const mauDetail =
    today?.mauCoverage === "unavailable"
      ? "미수집"
      : today?.mauCoverage === "partial"
        ? "일부 기간 수집 · 월 1일부터"
        : "해당 월 1일부터 오늘까지";
  return (
    <div className="dashboard-sections">
      <div className="dashboard-section-title">
        <h2>{label} 행동 지표</h2>
        <span>오늘(KST) 기준 · 잠정값</span>
      </div>
      <QueryState query={users}>
        <div className="dashboard-metrics four">
          <Metric
            label="DAU"
            value={formatNumber(dau, "명")}
            detail={activityDetail}
          />
          <Metric
            label="MAU"
            value={formatNumber(mau, "명")}
            detail={mauDetail}
          />
          <Metric
            label="고착도 (DAU/MAU)"
            value={formatNumber(
              dau !== null && mau ? (dau / mau) * 100 : null,
              "%",
            )}
            detail={
              today?.activityCoverage !== "complete" ||
              today?.mauCoverage !== "complete"
                ? "수집 범위 확인 필요"
                : "재방문 지표"
            }
            color="#34b878"
          />
          <Metric
            label="회원수"
            value={formatNumber(
              users.data
                ? roleCount(users.data.currentMemberCounts, role)
                : null,
              "명",
            )}
            detail="현재 미탈퇴 회원"
            color="#86868b"
          />
        </div>
      </QueryState>
      <div className="dashboard-section-title">
        <h2>{label} 탈퇴 분석</h2>
        <span>선택한 기간 기준</span>
      </div>
      <QueryState query={withdrawals}>
        <div className="dashboard-metrics three">
          <Metric
            label={`${label} 탈퇴`}
            value={formatNumber(withdrawn, "명")}
            detail="선택 기간 합계"
            color="#ff453a"
          />
          <QueryState query={records}>
            <Metric
              label="평균 유지 기간"
              value={formatNumber(retention.averageDays, "일")}
              detail={
                retention.count
                  ? `가입 → 탈퇴 · ${formatNumber(retention.count, "명")} 기준${retention.excluded ? ` · 날짜 미확인 ${retention.excluded}명 제외` : ""}`
                  : "계산 가능한 탈퇴 기록이 없습니다."
              }
              color="#86868b"
            />
          </QueryState>
          <Metric
            label="일 평균 탈퇴"
            value={formatNumber(withdrawn / dayCount(range), "명")}
            detail="탈퇴 없는 날 포함"
            color="#ff453a"
          />
        </div>
        <Panel
          title="유지 기간 분포"
          description={`전체 역할 기준 · 하한 포함, 상한 미포함 · 유지기간 미확인 ${formatNumber(unknown, "명")}`}
        >
          <DistributionChart
            rows={groupValues(
              bucketItems,
              retentionLabel,
              (item) => item.count,
            )}
            color="#ff6b63"
          />
        </Panel>
        <Panel title="탈퇴 추이" description={`${label} 일별 탈퇴 건수`}>
          <TrendChart
            data={days.map((day) => ({
              dateKST: day.dateKST,
              withdrawn: roleCount(day.countsByRole, role),
            }))}
            lines={[{ key: "withdrawn", label: "탈퇴", color: "#ff453a" }]}
          />
        </Panel>
        <div className="dashboard-grid">
          <Panel
            title="탈퇴 사유 TOP"
            description="전체 역할 기준 · 정형 사유별 응답 수 · 복수 응답"
          >
            <Ranking
              rows={reasonRows(days.map((day) => day.reasonCounts))}
              color="#ff453a"
            />
          </Panel>
          <Panel
            title="기타 · 직접 입력 사유"
            description={`${label} 자유 입력 응답`}
          >
            <Ranking
              rows={groupValues(
                days
                  .flatMap((day) => day.freeTextList)
                  .filter((item) => role === "all" || item.role === role),
                (item) => item.text,
                () => 1,
              )}
              unit="회"
              color="#86868b"
            />
          </Panel>
        </div>
        <p className="dashboard-note">
          유지 기간 분포와 정형 탈퇴 사유는 API가 역할별 구분을 제공하지 않아
          전체 역할 합계로 표시합니다. 평균 유지 기간은 선택 기간에 생성된 탈퇴
          상세 중 실제 탈퇴일도 해당 기간에 속하는 기록으로 계산합니다.
        </p>
      </QueryState>
    </div>
  );
}
