"use client";
import type {
  DashboardDateRange,
  DashboardRoleFilter,
} from "@/apis/dashboards/types";
import {
  useDashboardMong,
  useDashboardTimeSales,
  useDashboardUsers,
  useDashboardWithdrawals,
} from "@/queries/dashboards";
import {
  ascending,
  formatNumber,
  paymentSummary,
  roleCount,
} from "./statistics";
import {
  Funnel,
  Metric,
  Panel,
  QueryState,
  TrendChart,
} from "./dashboard-widgets";
import { ChargeTrend } from "./payment-dashboard";
import { customerFunnel, saleSummary } from "./review-sale-dashboard";

export default function HomeDashboard({
  range,
  role,
}: {
  range: DashboardDateRange;
  role: DashboardRoleFilter;
}) {
  const mong = useDashboardMong(range);
  const users = useDashboardUsers(range);
  const sales = useDashboardTimeSales(range);
  const withdrawals = useDashboardWithdrawals(range);
  const money = paymentSummary(mong.data?.dataList ?? [], role);
  const latestUser = ascending(users.data?.dataList ?? []).at(-1);
  const sale = saleSummary(sales.data?.dataList ?? []);
  const userDays = users.data?.dataList ?? [];
  const withdrawalDays = ascending(withdrawals.data?.dataList ?? []);
  return (
    <div className="dashboard-sections">
      <div className="dashboard-metrics six">
        <QueryState query={mong}>
          <Metric
            label="매출"
            value={formatNumber(mong.data ? money.displayRevenue : null, "원")}
            detail={
              money.unknown
                ? `미확인 ${formatNumber(money.unknown, "건")}`
                : `1몽 = ${formatNumber(money.unitPrice, "원")}`
            }
            color="#34b878"
          />
        </QueryState>
        <QueryState query={users}>
          <Metric
            label="DAU"
            value={formatNumber(
              latestUser ? roleCount(latestUser.dauCounts, role) : null,
              "명",
            )}
            detail={
              latestUser?.activityCoverage === "unavailable"
                ? "미수집"
                : latestUser?.activityCoverage === "partial"
                  ? "일부 기간 수집"
                  : "조회 종료일 일간 활성 사용자"
            }
          />
        </QueryState>
        <QueryState query={sales}>
          <Metric
            label="리뷰특가 예약 완료"
            value={formatNumber(sales.data ? sale.reserved : null, "건")}
            detail={`고객 응답 기준 · 노출 ${formatNumber(sale.views, "회")}`}
          />
        </QueryState>
        <QueryState query={users}>
          <Metric
            label="총 회원"
            value={formatNumber(
              users.data
                ? roleCount(users.data.currentMemberCounts, role)
                : null,
              "명",
            )}
            detail="현재 미탈퇴 회원"
            color="#86868b"
          />
          <Metric
            label="가입"
            value={formatNumber(
              users.data
                ? userDays.reduce(
                    (sum, day) =>
                      sum + (roleCount(day.joinedCounts, role) ?? 0),
                    0,
                  )
                : null,
              "명",
            )}
            detail="실제 가입일 기준"
            color="#34b878"
          />
        </QueryState>
        <QueryState query={withdrawals}>
          <Metric
            label="탈퇴"
            value={formatNumber(
              withdrawals.data
                ? withdrawalDays.reduce(
                    (sum, day) =>
                      sum + (roleCount(day.countsByRole, role) ?? 0),
                    0,
                  )
                : null,
              "명",
            )}
            detail="선택 기간 합계"
            color="#ff453a"
          />
        </QueryState>
      </div>
      <QueryState query={mong}>
        <ChargeTrend
          days={mong.data?.dataList ?? []}
          role={role}
          range={range}
        />
      </QueryState>
      <div className="dashboard-grid">
        <Panel
          title="리뷰특가 성과"
          description="신규 론칭 서비스 · 고객 반응 퍼널 (전체)"
        >
          <QueryState query={sales}>
            <Funnel rows={customerFunnel(sale)} />
          </QueryState>
        </Panel>
        <Panel title="탈퇴 추이" description="선택 기간 일별 탈퇴 사용자 수">
          <QueryState query={withdrawals}>
            <TrendChart
              data={withdrawalDays.map((day) => ({
                dateKST: day.dateKST,
                withdrawn: roleCount(day.countsByRole, role),
              }))}
              lines={[{ key: "withdrawn", label: "탈퇴", color: "#ff453a" }]}
            />
          </QueryState>
        </Panel>
      </div>
      <p className="dashboard-note">
        매출은 몽 충전 결제액의 환불 차감 전 합계입니다. 미몽패스 결제는 결제
        탭에서 별도로 확인할 수 있습니다. 오늘의 통계는 잠정값입니다.
      </p>
    </div>
  );
}
