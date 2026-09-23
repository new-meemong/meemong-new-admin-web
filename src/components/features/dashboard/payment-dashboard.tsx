"use client";
import { useState } from "react";
import GrowthPassEstimateTrend from "./growth-pass-estimate-trend";
import type {
  DashboardDateRange,
  DashboardRoleFilter,
  MongDay,
} from "@/apis/dashboards/types";
import {
  useDashboardMong,
  useDashboardPasses,
  useDashboardPresets,
} from "@/queries/dashboards";
import {
  ascending,
  chargeSeries,
  dayCount,
  formatNumber,
  groupValues,
  roleItems,
  paymentSummary,
  revenueSummary,
  chargeHistoryRange,
} from "./statistics";
import {
  DistributionChart,
  Metric,
  Panel,
  QueryState,
  Ranking,
  Segments,
  TrendChart,
} from "./dashboard-widgets";

export function ChargeTrend({
  days,
  role,
  range,
}: {
  range: DashboardDateRange;
  days: MongDay[];
  role: DashboardRoleFilter;
}) {
  const [period, setPeriod] = useState("all");
  // Keep the selected-period totals intact and each request within the 90-day API limit.
  const history = useDashboardMong(chargeHistoryRange(range));
  const series = chargeSeries(
    [...(history.data?.dataList ?? []), ...days],
    role,
    range,
  );
  const visible = period === "30" ? series.slice(-30) : series;
  return (
    <Panel
      title="충전 추이"
      description={`일별 충전몽 · 10일 / 30일 이동평균선 · ${visible[0]?.dateKST ?? ""} ~ ${visible.at(-1)?.dateKST ?? ""}`}
      action={
        <Segments
          label="충전 추이 기간"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "all", label: "전체" },
            { value: "30", label: "30일" },
          ]}
        />
      }
    >
      <QueryState query={history}>
        <TrendChart
          height={320}
          data={visible}
          lines={[
            { key: "charged", label: "일별 충전몽", color: "#86868b" },
            { key: "ma10", label: "10일 이동평균", color: "#007aff" },
            { key: "ma30", label: "30일 이동평균", color: "#34b878" },
          ]}
        />
      </QueryState>
    </Panel>
  );
}
export default function PaymentDashboard({
  range,
  role,
}: {
  range: DashboardDateRange;
  role: DashboardRoleFilter;
}) {
  const mong = useDashboardMong(range);
  const [rankingBasis, setRankingBasis] = useState("mong");
  const days = mong.data?.dataList ?? [];
  const summary = paymentSummary(days, role);
  const charges = days.flatMap((day) => roleItems(day.chargedItems, role));
  charges.sort(
    (a, b) =>
      (a.chargedMongBaseAmount ?? Infinity) -
      (b.chargedMongBaseAmount ?? Infinity),
  );
  const usages = days.flatMap((day) => roleItems(day.usedItems, role));
  const rewards = days.flatMap((day) => roleItems(day.rewardedItems, role));
  const products = groupValues(
    charges,
    (item) =>
      item.chargedMongBaseAmount === null
        ? "미분류"
        : `${item.chargedMongBaseAmount}몽`,
    (item) => item.purchaseCount,
  );
  const usageRows = groupValues(
    usages,
    (item) => item.subType,
    (item) =>
      rankingBasis === "mong" ? item.totalUsedMongAmount : item.purchaseCount,
    (item) => item.purchaseCount,
  ).map((row) => ({
    ...row,
    detail: row.label,
    label:
      usages.find((item) => item.subType === row.label)?.title || row.label,
  }));
  return (
    <div className="dashboard-sections">
      <QueryState query={mong}>
        <div className="dashboard-metrics three">
          <Metric
            label="총 충전몽"
            value={formatNumber(mong.data ? summary.charged : null, "몽")}
            detail={`1몽 = ${summary.unitPriceLabel}`}
            color="#34b878"
          />
          <Metric
            label="매출"
            value={formatNumber(
              mong.data ? summary.displayRevenue : null,
              "원",
            )}
            detail={
              summary.unknown
                ? `미확인 ${formatNumber(summary.unknown, "건")}`
                : "구매 당시 결제액 · 환불 차감 전"
            }
          />
          <Metric
            label="일 평균 충전"
            value={formatNumber(
              mong.data ? summary.charged / dayCount(range) : null,
              "몽",
            )}
          />
        </div>
      </QueryState>
      {role !== "model" && <GrowthPassEstimateTrend />}
      <QueryState query={mong}>
        <ChargeTrend days={days} role={role} range={range} />
        <div className="dashboard-grid">
          <Panel
            title="충전 상품 분포"
            description={`1몽 가중평균가: ${summary.unitPriceLabel} · 환불 포함 구매 건수`}
          >
            <DistributionChart rows={products} />
          </Panel>
          <Panel
            title="사용처 TOP"
            description="몽이 사용된 상품 · 서비스"
            action={
              <Segments
                label="사용처 정렬"
                value={rankingBasis}
                onChange={setRankingBasis}
                options={[
                  { value: "mong", label: "몽 기준" },
                  { value: "count", label: "수량 기준" },
                ]}
              />
            }
          >
            <Ranking
              rows={usageRows}
              limit={8}
              unit={rankingBasis === "mong" ? "몽" : "회"}
            />
          </Panel>
        </div>
        <Panel
          title="몽 보상"
          description="실제 지급 원장 기준 · 충전 보너스·환불·관리자 지급 제외"
        >
          <Ranking
            rows={groupValues(
              rewards,
              (item) => item.subType,
              (item) => item.totalRewardedMongAmount,
              (item) => item.rewardCount,
            ).map((row) => ({
              ...row,
              detail: row.label,
              label:
                rewards.find((item) => item.subType === row.label)?.title ||
                row.label,
            }))}
            unit="몽"
            color="#34b878"
          />
        </Panel>
      </QueryState>
      {role !== "designer" && <PassPayments range={range} />}
      <PresetPrices />
    </div>
  );
}
function PassPayments({ range }: { range: DashboardDateRange }) {
  const query = useDashboardPasses(range);
  const days = ascending(query.data?.dataList ?? []);
  const items = days.flatMap((day) => Object.values(day.items));
  const summary = revenueSummary(days.map((day) => day.totals));
  return (
    <Panel
      title="고객 미몽패스 결제"
      description="검증 성공한 고객 iOS·Android 결제 · 몽 결제 제외"
    >
      <QueryState query={query}>
        <div className="dashboard-metrics three">
          <Metric
            label="미몽패스 결제액"
            value={formatNumber(summary.displayRevenue, "원")}
            detail={
              summary.unknown
                ? `미확인 ${formatNumber(summary.unknown, "건")}`
                : "구매 당시 결제액 · 환불 차감 전"
            }
          />
          <Metric
            label="구매"
            value={formatNumber(
              items.reduce((sum, item) => sum + item.purchaseCount, 0),
              "건",
            )}
          />
          <Metric
            label="환불"
            value={formatNumber(
              items.reduce((sum, item) => sum + item.refundedCount, 0),
              "건",
            )}
            detail="조회 기간 구매 중 종료일까지 환불된 건"
            color="#ff453a"
          />
        </div>
        <DistributionChart
          rows={groupValues(
            items,
            (item) =>
              item.duration === 30
                ? "1개월"
                : item.duration === 90
                  ? "3개월"
                  : item.duration === 365
                    ? "1년"
                    : item.duration === null
                      ? "미분류"
                      : `${item.duration}일`,
            (item) => item.purchaseCount,
          )}
        />
        <TrendChart
          data={days.map((day) => ({
            dateKST: day.dateKST,
            purchases: day.totals.purchaseCount,
          }))}
          lines={[
            { key: "purchases", label: "미몽패스 구매", color: "#007aff" },
          ]}
        />
      </QueryState>
    </Panel>
  );
}
function PresetPrices() {
  const query = useDashboardPresets();
  const data = query.data?.data;
  return (
    <details className="dashboard-panel">
      <summary>현재 상품 구성 · 가격</summary>
      <p className="dashboard-note">
        현재 가격입니다. 과거 매출의 미확인 금액을 대체하지 않습니다.
      </p>
      <QueryState query={query}>
        {data && (
          <div className="dashboard-preset-grid">
            {[
              { name: "몽 충전", items: data.mongPresets },
              { name: "광고 제거 · 미몽패스", items: data.adBlockPresets },
              { name: "몽 소비", items: data.mongConsumePresets },
              { name: "성장패스", items: data.growthPassPresets },
            ].map((group) => (
              <div key={group.name}>
                <h3>{group.name}</h3>
                <ul className="dashboard-price-list">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.title}
                        {"platform" in item && (
                          <small> · {item.platform}</small>
                        )}
                        {"isFirstPurchase" in item && item.isFirstPurchase && (
                          <small> · 첫 구매</small>
                        )}
                      </span>
                      <strong>
                        {formatNumber(
                          item.price,
                          item.unit === "KRW" ? "원" : "몽",
                        )}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </details>
  );
}
