"use client";
import type { DashboardDateRange, TimeSaleDay } from "@/apis/dashboards/types";
import { useDashboardTimeSales } from "@/queries/dashboards";
import { ascending, formatNumber, groupValues, reasonRows } from "./statistics";
import {
  Funnel,
  FUNNEL_COLORS,
  Metric,
  Panel,
  QueryState,
  Ranking,
  TrendChart,
} from "./dashboard-widgets";

export const saleSummary = (days: TimeSaleDay[]) =>
  days.reduce(
    (sum, day) => ({
      views: sum.views + day.totals.totalViewCount,
      clicks: sum.clicks + day.totals.totalLinkClickCount,
      reserved:
        sum.reserved +
        day.model.reservedCount +
        day.model.reservedOtherTimeCount,
      requests: sum.requests + day.designer.totalReservationCount,
      accepted: sum.accepted + day.designer.acceptCount,
      rejected: sum.rejected + day.designer.rejectCount,
    }),
    { views: 0, clicks: 0, reserved: 0, requests: 0, accepted: 0, rejected: 0 },
  );
export const customerFunnel = (summary: ReturnType<typeof saleSummary>) => [
  { label: "노출", value: summary.views, color: FUNNEL_COLORS.blue },
  { label: "링크 클릭", value: summary.clicks, color: FUNNEL_COLORS.sky },
  { label: "예약 완료", value: summary.reserved, color: FUNNEL_COLORS.orange },
];
export default function ReviewSaleDashboard({
  range,
}: {
  range: DashboardDateRange;
}) {
  const query = useDashboardTimeSales(range);
  const days = ascending(query.data?.dataList ?? []);
  const latest = days.at(-1);
  const summary = saleSummary(days);
  return (
    <QueryState query={query}>
      <div className="dashboard-sections">
        <div className="dashboard-metrics three">
          <Metric
            label="활성 디자이너"
            value={formatNumber(latest?.totals.activeDesignerCount, "명")}
            detail="현재 활성 메뉴 · 예약 시간 칩 기준"
          />
          <Metric
            label="활성 메뉴"
            value={formatNumber(latest?.totals.totalActiveMenuCount, "개")}
            detail="종료일까지 생성 · 현재 활성 상태"
            color="#34b878"
          />
          <Metric
            label="노출"
            value={formatNumber(summary.views, "회")}
            detail="선택 기간 합계"
          />
        </div>
        <div className="dashboard-grid">
          <Panel
            title="고객 반응 퍼널"
            description={`노출 대비 예약 전환율 ${summary.views ? ((summary.reserved / summary.views) * 100).toFixed(1) + "%" : "—"}`}
          >
            <Funnel rows={customerFunnel(summary)} />
          </Panel>
          <Panel
            title="디자이너 반응 퍼널"
            description={`예약 응답 대비 수락률 ${summary.requests ? ((summary.accepted / summary.requests) * 100).toFixed(1) + "%" : "—"}`}
          >
            <Funnel
              rows={[
                {
                  label: "예약 응답",
                  value: summary.requests,
                  color: FUNNEL_COLORS.blue,
                },
                {
                  label: "수락",
                  value: summary.accepted,
                  color: FUNNEL_COLORS.green,
                },
                {
                  label: "거절",
                  value: summary.rejected,
                  color: FUNNEL_COLORS.orange,
                },
              ]}
              rateBasis="first"
            />
          </Panel>
        </div>
        <Panel
          title="성과 추이"
          description="노출(좌축) · 링크 클릭 · 예약 완료(우축)"
        >
          <TrendChart
            data={days.map((day) => ({
              dateKST: day.dateKST,
              views: day.totals.totalViewCount,
              clicks: day.totals.totalLinkClickCount,
              reserved:
                day.model.reservedCount + day.model.reservedOtherTimeCount,
            }))}
            lines={[
              { key: "views", label: "노출", color: "#86868b" },
              {
                key: "clicks",
                label: "링크 클릭",
                color: "#007aff",
                right: true,
              },
              {
                key: "reserved",
                label: "예약 완료",
                color: "#34b878",
                right: true,
              },
            ]}
          />
        </Panel>
        <div className="dashboard-grid">
          <Panel title="고객 거절 사유" description="예약하지 않은 이유">
            <Ranking
              rows={reasonRows(days.map((day) => day.model.rejectCounts))}
            />
          </Panel>
          <Panel
            title="디자이너 거절 사유"
            description="예약 요청을 거절한 이유"
          >
            <Ranking
              rows={reasonRows(days.map((day) => day.designer.rejectCounts))}
              color="#ff453a"
            />
          </Panel>
        </div>
        <Panel
          title="고객 거절 · 직접 입력 사유"
          description="‘기타 직접 입력’으로 남긴 사유"
        >
          <Ranking
            rows={groupValues(
              days.flatMap((day) => day.model.rejectEtcTextList),
              (text) => text,
              () => 1,
            )}
          />
        </Panel>
        <p className="dashboard-note">
          예약 완료는 고객의 예약 완료·다른 시간 예약 완료 응답 합계입니다.
          수락·거절·취소는 서로 다른 발생 시점으로 집계됩니다. 예약 취소{" "}
          {formatNumber(
            days.reduce(
              (sum, day) => sum + day.totals.reservationCancelCount,
              0,
            ),
            "건",
          )}
          .
        </p>
      </div>
    </QueryState>
  );
}
