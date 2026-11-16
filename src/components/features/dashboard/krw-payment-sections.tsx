"use client";
import { useState } from "react";
import type {
  DashboardDateRange,
  DashboardRoleFilter,
  PaymentCategory,
  PaymentStatisticsDay,
} from "@/apis/dashboards/types";
import { useDashboardPayments } from "@/queries/dashboards";
import {
  Metric,
  Panel,
  QueryState,
  Segments,
  StackedBarChart,
} from "./dashboard-widgets";
import { ascending, formatNumber, kstToday } from "./statistics";
import {
  PAYMENT_CATEGORY_LABELS,
  visibleSinglePaymentCategories,
  singlePaymentItems,
  revenueCategoryLabel,
  dayColorClass,
  categoryItems,
  dayLabel,
  krwAmountText,
  krwCellText,
  krwNetText,
  krwRefundCellText,
  krwRefundAmountText,
  krwSummary,
  percent,
  platformLabel,
  productLabel,
  productRows,
  type KrwSummary,
} from "./krw-payments";

const MONG_COLOR = "#007aff";
const SINGLE_COLOR = "#f97316";
const SINGLE_CATEGORY_COLORS: Record<PaymentCategory, string> = {
  MONG_CHARGE: MONG_COLOR,
  MEEMONG_PASS: "#fb923c",
  V3_HAIR_CONSULTATION: "#fdba74",
  THUNDER: "#c2410c",
};
const ROLE_NOTE = "원화 결제 매출은 회원 구분 없이 집계됩니다";

function revenueParts(days: PaymentStatisticsDay[]) {
  const total = krwSummary(days.map((day) => day.totals));
  const mong = krwSummary(categoryItems(days, ["MONG_CHARGE"]));
  const single = krwSummary(singlePaymentItems(days));
  const singles = visibleSinglePaymentCategories(days).map((category) => ({
    category,
    summary: krwSummary(categoryItems(days, [category])),
  }));
  return { total, mong, single, singles };
}
/** 금액·환불 확인 불가와 회원 필터 미지원을 카드 배지로 드러냅니다. */
function revenueBadges(total: KrwSummary, role: DashboardRoleFilter) {
  return [
    ...(total.amountState === "partial"
      ? [`확인 불가 ${formatNumber(total.unknownAmountCount, "건")}`]
      : []),
    ...(total.unknownRefundStatusCount
      ? [
          `환불 상태 확인 불가 ${formatNumber(total.unknownRefundStatusCount, "건")}`,
        ]
      : []),
    ...(role === "all" ? [] : ["전체 기준"]),
  ];
}
function revenueStateDetail(total: KrwSummary) {
  if (total.amountState === "unavailable")
    return `금액을 확인할 수 없는 결제 ${formatNumber(total.unknownAmountCount, "건")}`;
  if (total.amountState === "partial")
    return `확인된 결제액 · ${formatNumber(total.unknownAmountCount, "건")}은 금액 확인 불가`;
  return null;
}

export function HomeRevenueMetric({
  days,
  role,
}: {
  days: PaymentStatisticsDay[];
  role: DashboardRoleFilter;
}) {
  const { total, mong, single } = revenueParts(days);
  const refundDetail = total.unknownRefundStatusCount
    ? `환불 ${krwRefundAmountText(total)} · 환불 여부를 확인할 수 없는 ${formatNumber(total.unknownRefundStatusCount, "건")}은 미포함`
    : `순결제 ${krwNetText(total)} · 환불 ${krwRefundAmountText(total)}`;
  return (
    <Metric
      label="매출"
      value={krwAmountText(total)}
      color="#34b878"
      badges={revenueBadges(total, role)}
      split={[
        {
          label: "몽 충전",
          value: mong.knownAmount,
          text: krwAmountText(mong),
          color: MONG_COLOR,
        },
        {
          label: "단건결제",
          value: single.knownAmount,
          text: krwAmountText(single),
          color: SINGLE_COLOR,
        },
      ]}
      detail={[
        role !== "all" ? ROLE_NOTE : null,
        revenueStateDetail(total) ?? "원화 결제 합계",
        refundDetail,
      ]
        .filter(Boolean)
        .join(" · ")}
    />
  );
}

type Route = "all" | "mong" | "single";
export function RevenueRoutes({
  days,
  range,
}: {
  days: PaymentStatisticsDay[];
  range: DashboardDateRange;
}) {
  const [route, setRoute] = useState<Route>("all");
  const { total, mong, single, singles } = revenueParts(days);
  const max = Math.max(mong.knownAmount, single.knownAmount, 1);
  const rows = [
    ...(route !== "single"
      ? [
          {
            key: "mong",
            label: "몽 충전",
            summary: mong,
            detail: `${percent(mong.knownAmount, total.knownAmount)} · ${formatNumber(mong.purchaseCount, "건")}`,
            color: MONG_COLOR,
            sub: false,
          },
        ]
      : []),
    ...(route !== "mong"
      ? [
          {
            key: "single",
            label: "단건결제",
            summary: single,
            detail: `${percent(single.knownAmount, total.knownAmount)} · ${formatNumber(single.purchaseCount, "건")}`,
            color: SINGLE_COLOR,
            sub: false,
          },
          ...singles.map(({ category, summary }) => ({
            key: category,
            label: revenueCategoryLabel(category),
            summary,
            detail: `단건의 ${percent(summary.knownAmount, single.knownAmount)} · ${formatNumber(summary.purchaseCount, "건")}`,
            color: SINGLE_CATEGORY_COLORS[category],
            sub: true,
          })),
        ]
      : []),
  ];
  const bars =
    route === "all"
      ? [
          { key: "mong", label: "몽 충전", color: MONG_COLOR },
          { key: "single", label: "단건결제", color: SINGLE_COLOR },
        ]
      : route === "mong"
        ? [{ key: "mong", label: "몽 충전", color: MONG_COLOR }]
        : singles.map(({ category }) => ({
            key: category,
            label: revenueCategoryLabel(category),
            color: SINGLE_CATEGORY_COLORS[category],
          }));
  const chart = ascending(days).map((day) => ({
    dateKST: day.dateKST,
    mong: krwSummary(categoryItems([day], ["MONG_CHARGE"])).knownAmount,
    single: krwSummary(singlePaymentItems([day])).knownAmount,
    ...Object.fromEntries(
      singles.map(({ category }) => [
        category,
        krwSummary(categoryItems([day], [category])).knownAmount,
      ]),
    ),
  }));
  return (
    <Panel
      title="매출 경로"
      description={`몽 충전 · 단건결제 구분 · iOS·Android 합산 · ${range.startDateKST} ~ ${range.endDateKST}`}
      action={
        <Segments
          label="매출 경로 구분"
          value={route}
          onChange={setRoute}
          options={[
            { value: "all", label: "전체" },
            { value: "mong", label: "몽 충전" },
            { value: "single", label: "단건결제" },
          ]}
        />
      }
    >
      <div className="dashboard-route-grid">
        <ul className="dashboard-ranking">
          {rows.map((row) => (
            <li key={row.key} className={row.sub ? "sub" : undefined}>
              <div>
                <span>{row.label}</span>
                <strong>
                  {krwAmountText(row.summary)} <small>{row.detail}</small>
                </strong>
              </div>
              <div className="dashboard-bar-track">
                <span
                  style={{
                    width: `${(row.summary.knownAmount / max) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
        <StackedBarChart data={chart} bars={bars} unit="원" />
      </div>
    </Panel>
  );
}

export function KrwPaymentSection({
  range,
  role,
}: {
  range: DashboardDateRange;
  role: DashboardRoleFilter;
}) {
  const query = useDashboardPayments(range);
  const days = query.data?.dataList ?? [];
  const { total, mong, single, singles } = revenueParts(days);
  return (
    <>
      <div className="dashboard-section-heading">
        <h2>원화 결제</h2>
        <p>
          앱스토어·구글플레이 결제 · 몽 충전 + 단건결제(미몽패스·광고 제거 ·
          헤어컨설팅 심층답변
          {visibleSinglePaymentCategories(days).includes("THUNDER")
            ? " · 빠른매칭"
            : ""}
          ) · 테스트(Sandbox) 결제 제외
        </p>
      </div>
      <QueryState query={query}>
        <div className="dashboard-metrics three">
          <Metric
            label="매출"
            value={krwAmountText(total)}
            badges={revenueBadges(total, role)}
            detail={
              role !== "all"
                ? ROLE_NOTE
                : (revenueStateDetail(total) ??
                  `원화 결제 합계 · 환불 차감 전 · ${formatNumber(total.purchaseCount, "건")}`)
            }
          />
          <Metric
            label="몽 충전"
            value={krwAmountText(mong)}
            detail={`매출의 ${percent(mong.knownAmount, total.knownAmount)} · ${formatNumber(mong.purchaseCount, "건")}`}
          />
          <Metric
            label="단건결제"
            value={krwAmountText(single)}
            color={SINGLE_COLOR}
            detail={[
              `매출의 ${percent(single.knownAmount, total.knownAmount)}`,
              ...singles.map(
                ({ category, summary }) =>
                  `${PAYMENT_CATEGORY_LABELS[category]} ${formatNumber(summary.purchaseCount, "건")}`,
              ),
            ].join(" · ")}
          />
        </div>
        <KrwPaymentDetail days={days} range={range} />
      </QueryState>
    </>
  );
}

const TableAmount = ({ summary }: { summary: KrwSummary }) => (
  <>
    <td>{krwCellText(summary)}</td>
    <td
      className={
        summary.knownRefundedCount && !summary.unknownRefundStatusCount
          ? "negative"
          : undefined
      }
    >
      {krwRefundCellText(summary)}
    </td>
    <td>{summary.purchaseCount ? krwNetText(summary) : "—"}</td>
  </>
);

function KrwPaymentDetail({
  days,
  range,
}: {
  days: PaymentStatisticsDay[];
  range: DashboardDateRange;
}) {
  const [view, setView] = useState<"daily" | "product">("daily");
  const [category, setCategory] = useState<"all" | PaymentCategory>("all");
  const [platform, setPlatform] = useState("all");
  const today = kstToday();
  const columns: PaymentCategory[] = [
    "MONG_CHARGE",
    ...visibleSinglePaymentCategories(days),
  ];
  const effectiveCategory =
    category === "all" || columns.includes(category) ? category : "all";
  const total = krwSummary(days.map((day) => day.totals));
  const products = productRows(days).filter(
    (row) =>
      columns.includes(row.category) &&
      (effectiveCategory === "all" || row.category === effectiveCategory) &&
      (platform === "all" || row.platform === platform),
  );
  const productTotal = krwSummary(
    days.flatMap((day) =>
      day.itemList.filter(
        (item) =>
          columns.includes(item.paymentCategory) &&
          (effectiveCategory === "all" ||
            item.paymentCategory === effectiveCategory) &&
          (platform === "all" || item.platform === platform),
      ),
    ),
  );
  const toggle = (
    <Segments
      label="원화 결제 상세 보기"
      value={view}
      onChange={setView}
      options={[
        { value: "daily", label: "일자별" },
        { value: "product", label: "상품별" },
      ]}
    />
  );
  if (view === "daily")
    return (
      <Panel
        title="데일리 통계"
        description={`선택 기간 일자별 원화 결제 · 최신순${range.endDateKST >= today ? " · 오늘은 집계 중" : ""}`}
        action={toggle}
      >
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>날짜</th>
                {columns.map((column) => (
                  <th key={column}>{PAYMENT_CATEGORY_LABELS[column]}</th>
                ))}
                <th>매출 (원화 합계)</th>
                <th>환불</th>
                <th>순결제</th>
                <th>결제 건수</th>
              </tr>
            </thead>
            <tbody>
              {[...days]
                .sort((a, b) => b.dateKST.localeCompare(a.dateKST))
                .map((day) => {
                  const summary = krwSummary([day.totals]);
                  return (
                    <tr key={day.dateKST}>
                      <td className={dayColorClass(day.dateKST)}>
                        {dayLabel(day.dateKST)}
                        {day.dateKST === today && (
                          <em className="dashboard-badge neutral">집계 중</em>
                        )}
                      </td>
                      {columns.map((column) => (
                        <td key={column}>
                          {krwCellText(
                            krwSummary(categoryItems([day], [column])),
                          )}
                        </td>
                      ))}
                      <TableAmount summary={summary} />
                      <td>{formatNumber(summary.purchaseCount, "건")}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr>
                <td>합계</td>
                {columns.map((column) => (
                  <td key={column}>
                    {krwCellText(krwSummary(categoryItems(days, [column])))}
                  </td>
                ))}
                <TableAmount summary={total} />
                <td>{formatNumber(total.purchaseCount, "건")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    );
  return (
    <Panel
      title="상품별 결제 상세"
      description={`선택 기간 상품·플랫폼별 원화 결제 · 일자별과 같은 기간 · ${formatNumber(products.length, "개")}`}
      action={toggle}
    >
      <div className="dashboard-filter-row">
        <Segments
          label="결제 유형"
          value={effectiveCategory}
          onChange={setCategory}
          options={[
            { value: "all", label: "전체" },
            ...columns.map((column) => ({
              value: column,
              label: PAYMENT_CATEGORY_LABELS[column],
            })),
          ]}
        />
        <Segments
          label="플랫폼"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "all", label: "전체" },
            { value: "ios", label: "iOS" },
            { value: "android", label: "Android" },
          ]}
        />
      </div>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>상품</th>
              <th>플랫폼</th>
              <th>구매</th>
              <th>결제액</th>
              <th>환불</th>
              <th>순결제</th>
            </tr>
          </thead>
          <tbody>
            {products.map((row) => (
              <tr key={row.key}>
                <td>
                  {productLabel(row)}
                  <small>
                    {row.productId ?? PAYMENT_CATEGORY_LABELS[row.category]}
                  </small>
                </td>
                <td>{platformLabel(row.platform)}</td>
                <td>{formatNumber(row.summary.purchaseCount, "건")}</td>
                <TableAmount summary={row.summary} />
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan={6}>조회된 결제가 없습니다.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>합계</td>
              <td />
              <td>{formatNumber(productTotal.purchaseCount, "건")}</td>
              <TableAmount summary={productTotal} />
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  );
}
