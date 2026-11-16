import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { dashboardQueryOptions } from "@/queries/dashboards";
import DashboardPage from "@/app/(dashboards)/dashboard/page";
import HomeDashboard from "./home-dashboard";
import PaymentDashboard, { ChargeTrend } from "./payment-dashboard";
import ActivityDashboard from "./activity-dashboard";
import ReviewSaleDashboard from "./review-sale-dashboard";
import HairConsultationDashboard from "./hair-consultation-dashboard";
import { chargeHistoryRange, dateRange, dayCount } from "./statistics";
import { previousRange } from "./krw-payments";
import paymentsFixture from "@/apis/dashboards/__fixtures__/payment-statistics.json";
import hairFixture from "@/apis/dashboards/__fixtures__/v3-hair-consultation-statistics.json";
import hairSummaryFixture from "@/apis/dashboards/__fixtures__/v3-hair-consultation-statistics-summary.json";
import usersFixture from "@/apis/dashboards/__fixtures__/user-statistics.json";
import withdrawals from "@/apis/dashboards/__fixtures__/withdrawal-statistics.json";
import mongFixture from "@/apis/dashboards/__fixtures__/mong-statistics.json";
import passesFixture from "@/apis/dashboards/__fixtures__/meemong-pass-statistics.json";
import sales from "@/apis/dashboards/__fixtures__/time-sale-menu-statistics.json";
import presetsFixture from "@/apis/dashboards/__fixtures__/presets.json";
import type { ReactNode } from "react";
vi.mock("./dashboard.css", () => ({}));
import type {
  UserStatistics,
  DailyStatistics,
  MongDay,
  PassDay,
  DashboardPresets,
  PaymentStatistics,
  V3HairConsultationStatistics,
  V3HairConsultationSummary,
} from "@/apis/dashboards/types";
const { trendChart } = vi.hoisted(() => ({
  trendChart: vi.fn<(props: unknown) => null>(() => null),
}));
vi.mock("./dashboard-widgets", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./dashboard-widgets")>()),
  TrendChart: trendChart,
}));
const users = usersFixture as UserStatistics;
const mong = mongFixture as DailyStatistics<MongDay>;
const passes = passesFixture as DailyStatistics<PassDay>;
const presets = presetsFixture as DashboardPresets;
const payments = paymentsFixture as PaymentStatistics;
const hair = hairFixture as V3HairConsultationStatistics;
const hairSummary = hairSummaryFixture as V3HairConsultationSummary;
let client: QueryClient;
const range = { startDateKST: "2026-09-10", endDateKST: "2026-09-10" };
beforeEach(() => {
  trendChart.mockClear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-10T04:00:00Z"));
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  for (const dates of [range, dateRange(30)]) {
    client.setQueryData(dashboardQueryOptions.users(dates).queryKey, users);
    client.setQueryData(
      dashboardQueryOptions.withdrawals(dates).queryKey,
      withdrawals,
    );
    client.setQueryData(dashboardQueryOptions.mong(dates).queryKey, mong);
    client.setQueryData(
      dashboardQueryOptions.mong(chargeHistoryRange(dates)).queryKey,
      { ...mong, dataList: [] },
    );
    client.setQueryData(dashboardQueryOptions.passes(dates).queryKey, passes);
    client.setQueryData(dashboardQueryOptions.timeSales(dates).queryKey, sales);
    client.setQueryData(
      dashboardQueryOptions.payments(dates).queryKey,
      payments,
    );
    for (const hairDates of [dates, previousRange(dates)])
      client.setQueryData(
        dashboardQueryOptions.hairConsultations(hairDates).queryKey,
        hair,
      );
    client.setQueryData(
      dashboardQueryOptions.hairConsultationSummary(dates).queryKey,
      hairSummary,
    );
  }
  client.setQueryData(dashboardQueryOptions.presets().queryKey, presets);
  client.setQueryData(dashboardQueryOptions.withdrawalRecords(range).queryKey, [
    {
      id: 1,
      role: 1,
      joinedAt: "2026-08-31T03:00:00Z",
      withdrawAt: "2026-09-10T03:00:00Z",
    },
    {
      id: 2,
      role: 2,
      joinedAt: "2026-08-11T03:00:00Z",
      withdrawAt: "2026-09-10T03:00:00Z",
    },
  ]);
  client.setQueryData(dashboardQueryOptions.legacyMongDetails().queryKey, {
    meta: {
      startDateKST: "2026-09-01 00:00:00",
      endDateKST: "2026-09-11 00:00:00",
    },
    dataCount: 1,
    dataList: [
      {
        dateKST: "2026-09-01",
        chargeCount: 0,
        chargeTotalMong: 0,
        chargeCountByType: {},
        chargeMongByType: {},
        rewardCount: 0,
        rewardTotalMong: 0,
        rewardCountByType: {},
        rewardMongByType: {},
        usedCount: 8,
        usedTotalMong: 800,
        usedCountByType: { "[디자이너] 성장패스 30일": 8 },
        usedMongByType: { "[디자이너] 성장패스 30일": 800 },
      },
    ],
  });
});
afterEach(() => {
  client.clear();
  vi.useRealTimers();
});
const render = (node: ReactNode) =>
  renderToStaticMarkup(
    <QueryClientProvider client={client}>{node}</QueryClientProvider>,
  );
describe("dashboard page and query wiring", () => {
  it("shows only confirmed KRW revenue with an unknown-amount badge on home and payments", () => {
    for (const node of [
      <HomeDashboard key="home" range={range} role="all" />,
      <PaymentDashboard key="payment" range={range} role="all" />,
    ]) {
      const html = render(node);
      expect(html).toMatch(
        /매출<em class="dashboard-badge">확인 불가 1건<\/em><\/div><strong>27,200원<\/strong>/,
      );
      expect(html).toContain("확인된 결제액 · 1건은 금액 확인 불가");
    }
    const home = render(<HomeDashboard range={range} role="all" />);
    expect(home).toContain("매출 경로");
    expect(home).toContain("단건의 ");
    expect(home).toContain("헤어컨설팅");
    const payment = render(<PaymentDashboard range={range} role="all" />);
    expect(payment).toContain("데일리 통계");
    expect(payment).toContain("2,900원 (확인 불가 1건)");
    expect(payment).toContain("−4,500원 (1건)");
    expect(payment).toContain("매출의 72.8% · 2건");
    // 현재 제공하는 결제 유형만 고정 노출하며 빠른매칭 0원 항목은 숨깁니다.
    expect(payment).not.toContain("빠른매칭");
    expect(payment).toContain("<th>미몽패스 (고객)</th>");
    expect(home).toContain("헤어컨설팅 심층답변");
    expect(home).not.toContain("빠른매칭");
  });
  it("retains historical THUNDER revenue and exposes its row and detail only when present", () => {
    const historical = structuredClone(payments);
    const day = historical.dataList[0];
    day.itemList.push({
      ...day.itemList[0],
      paymentCategory: "THUNDER",
      productId: "legacy.thunder",
      purchaseCount: 1,
      knownTotalPaymentAmountKRW: 1200,
    });
    day.dateKST = "2026-11-15";
    day.totals.knownTotalPaymentAmountKRW += 1200;
    day.totals.purchaseCount += 1;
    client.setQueryData(
      dashboardQueryOptions.payments(range).queryKey,
      historical,
    );
    const home = render(<HomeDashboard range={range} role="all" />);
    const payment = render(<PaymentDashboard range={range} role="all" />);
    expect(home).toContain("빠른매칭");
    expect(home).toContain("28,400원");
    expect(home).toContain("8,600원");
    expect(payment).toContain("<th>빠른매칭</th>");
    expect(payment).toContain("빠른매칭 1건");
    expect(payment).toContain('class="dashboard-day-sunday">11.15 (일)');
  });
  it("renders an all-unknown KRW total as unavailable instead of 0원", () => {
    const unknown = {
      ...payments.dataList[0].totals,
      purchaseCount: 2,
      knownTotalPaymentAmountKRW: 0,
      unknownTotalPaymentCount: 2,
      knownRefundedPaymentAmountKRW: 0,
      knownRefundedCount: 0,
      totalPaymentAmountKRW: null,
    };
    client.setQueryData(dashboardQueryOptions.payments(range).queryKey, {
      ...payments,
      dataList: [{ ...payments.dataList[0], totals: unknown, itemList: [] }],
    });
    const html = render(<HomeDashboard range={range} role="all" />);
    expect(html).toMatch(/매출<\/div><strong>확인 불가<\/strong>/);
    expect(html).toContain("금액을 확인할 수 없는 결제 2건");
  });
  it.each([0, 9900])(
    "shows known pass revenue %i with small unknown counts",
    (known) => {
      const missing = {
        totalPaymentAmountKRW: null,
        knownTotalPaymentAmountKRW: known,
        unknownTotalPaymentCount: 16,
      };
      client.setQueryData(dashboardQueryOptions.mong(range).queryKey, {
        ...mong,
        dataList: [
          {
            ...mong.dataList[0],
            chargedTotals: { ...mong.dataList[0].chargedTotals, ...missing },
          },
        ],
      });
      client.setQueryData(dashboardQueryOptions.passes(range).queryKey, {
        ...passes,
        dataList: [
          {
            ...passes.dataList[0],
            totals: { ...passes.dataList[0].totals, ...missing },
          },
        ],
      });
      const amount = known === 0 ? "0원" : "9,900원";
      const html = render(<PaymentDashboard range={range} role="all" />);
      expect(html).toMatch(
        new RegExp(
          `미몽패스 결제액</div><strong>${amount}</strong><p>미확인 16건</p>`,
        ),
      );
      expect(html).toContain("1몽 = 미확인 포함으로 계산 불가");
      expect(html).toContain("1몽 가중평균가: 미확인 포함으로 계산 불가");
      expect(html).not.toContain("1몽 = —");
    },
  );
  it.each([1, 7, 30, 90])(
    "supplies complete moving averages for every visible day in a %i-day chart",
    (length) => {
      const selected = dateRange(length, range.endDateKST);
      const history = chargeHistoryRange(selected);
      expect(dayCount(history)).toBe(29);
      expect(history.endDateKST).toBe(
        dateRange(2, selected.startDateKST).startDateKST,
      );
      const makeDays = (dates: typeof range, amount: number) =>
        Array.from({ length: dayCount(dates) }, (_, i) => ({
          ...mong.dataList[0],
          dateKST: dateRange(i + 1, dates.endDateKST).startDateKST,
          chargedTotals: {
            ...mong.dataList[0].chargedTotals,
            totalChargedMongAmount: amount,
          },
        }));
      client.setQueryData(dashboardQueryOptions.mong(history).queryKey, {
        ...mong,
        dataList: makeDays(history, 100),
      });
      render(
        <ChargeTrend
          days={makeDays(selected, 200)}
          range={selected}
          role="all"
        />,
      );
      const props = trendChart.mock.calls.at(-1)?.[0] as unknown as {
        data: {
          dateKST: string;
          charged: number;
          ma10: number;
          ma30: number;
        }[];
      };
      expect(props.data).toHaveLength(length);
      expect(props.data[0]).toEqual({
        dateKST: selected.startDateKST,
        charged: 200,
        ma10: 110,
        ma30: 3100 / 30,
      });
      expect(props.data.at(-1)?.dateKST).toBe(selected.endDateKST);
      expect(
        props.data.every((day) => day.ma10 !== null && day.ma30 !== null),
      ).toBe(true);
    },
  );
  it("shows a retry when moving-average history fails instead of rendering incomplete lines", () => {
    client
      .getQueryCache()
      .find({
        queryKey: dashboardQueryOptions.mong(chargeHistoryRange(range))
          .queryKey,
      })
      ?.setState({ status: "error", error: new Error("이전 기간 조회 실패") });
    const html = render(
      <ChargeTrend days={mong.dataList} range={range} role="all" />,
    );
    expect(html).toContain("이전 기간 조회 실패");
    expect(html).toContain("다시 시도");
    expect(trendChart).not.toHaveBeenCalled();
  });
  it("renders growth-pass estimates from the separate legacy query only for designer/all roles", () => {
    const html = render(<PaymentDashboard range={range} role="designer" />);
    expect(html).toContain("성장패스 활성 추이 (추정)");
    expect(html).toContain("2026-09-10 활성 추정 8건");
    expect(html).toContain("실제 활성 인원과 다를 수 있습니다");
    expect(html).not.toContain(
      "현재 API에서 활성 인원과 활성 이력을 제공하지 않습니다",
    );
    expect(
      render(<PaymentDashboard range={range} role="model" />),
    ).not.toContain("성장패스 활성 추이 (추정)");
  });
  it("renders the routed home dashboard using server contract data", () => {
    const html = render(<DashboardPage />);
    expect(html).toContain("미몽 통합 대시보드");
    expect(html).toMatch(/<button[^>]*aria-label="기간 달력 열기"/);
    const periodOptions = html.match(
      /aria-label="조회 기간"[^>]*>(.*?)<\/div>/,
    )?.[1];
    expect(periodOptions).toBeDefined();
    expect(periodOptions).not.toContain("전체");
    expect(html).toMatch(/aria-label="회원 역할"[^>]*>.*?전체/);
    expect(html).toContain("19,800원");
    expect(html).toContain("12,000명");
    expect(html).toContain("499건");
    expect(html).toContain("실제 가입일 기준");
    expect(html).toContain("충전 추이");
    expect(html).toMatch(
      /aria-label="대시보드 화면"[^>]*>.*?리뷰특가.*?헤어컨설팅.*?활동/,
    );
  });
  it("filters home member metrics by the selected role and retains missing DAU", () => {
    client.setQueryData(dashboardQueryOptions.users(range).queryKey, {
      ...users,
      dataList: [
        {
          ...users.dataList[0],
          dauCounts: { model: null, designer: null, unknown: null },
          activityCoverage: "unavailable",
        },
      ],
    });
    const html = render(<HomeDashboard range={range} role="designer" />);
    expect(html).toContain("2,000명");
    expect(html).not.toContain("12,000명");
    expect(html).toContain("미수집");
    expect(html).toContain("전체 기준");
    expect(html).toContain("원화 결제 매출은 회원 구분 없이 집계됩니다");
  });
  it("renders charged quantities separately from KRW and pass duration groups", () => {
    const html = render(<PaymentDashboard range={range} role="model" />);
    expect(html).toContain("200몽");
    expect(html).toContain("19,800원");
    expect(html).toContain("고객 미몽패스 결제");
    expect(html).toContain("현재 상품 구성 · 가격");
    expect(html).toContain("미몽패스 1개월");
    expect(html).toContain("몽 사용 주문");
  });
  it("labels unfilterable withdrawal aggregates and partial MAU explicitly", () => {
    const html = render(<ActivityDashboard range={range} role="model" />);
    expect(html).toContain("일부 기간 수집 · 월 1일부터");
    expect(html).toContain("전체 역할 기준");
    expect(html).toContain("10일");
    expect(html).toContain("가입 → 탈퇴 · 1명 기준");
    expect(html).not.toContain("계산 불가");
    expect(html).toContain("헤어모델 활동을 하고 싶지 않음");
  });
  it("uses the selected period and role for trends while keeping cards on today", () => {
    const selectedRange = {
      startDateKST: "2026-09-01",
      endDateKST: "2026-09-02",
    };
    client.setQueryData(dashboardQueryOptions.users(selectedRange).queryKey, {
      ...users,
      dataList: [
        {
          ...users.dataList[0],
          dateKST: "2026-09-01",
          dauCounts: { model: 40, designer: 10, unknown: 0 },
        },
        {
          ...users.dataList[0],
          dateKST: "2026-09-02",
          dauCounts: { model: 60, designer: 20, unknown: 0 },
        },
      ],
    });
    for (const role of ["all", "model", "designer"] as const) {
      trendChart.mockClear();
      const html = render(
        <ActivityDashboard range={selectedRange} role={role} />,
      );
      expect(html).toContain("DAU 추이");
      expect(html).toContain("MAU 추이");
      expect(html).toContain(
        `DAU</div><strong>${role === "all" ? 120 : role === "model" ? 100 : 20}명`,
      );
      const [dau, mau] = trendChart.mock.calls.map(
        ([props]) =>
          props as {
            data: { dateKST: string; all: number }[];
            lines: { key: string }[];
            splitByMonth?: boolean;
          },
      );
      expect(dau.data.map((d) => d.dateKST)).toEqual([
        "2026-09-01",
        "2026-09-02",
      ]);
      expect(dau.data.map((d) => d.all)).toEqual([50, 80]);
      expect(dau.lines.map((line) => line.key)).toEqual(
        role === "all" ? ["all", "model", "designer"] : [role],
      );
      expect(mau.splitByMonth).toBe(true);
    }
  });
  it("renders both review-sale roles and customer free-text responses", () => {
    const html = render(<ReviewSaleDashboard range={range} />);
    expect(html).toContain("128명");
    expect(html).toContain("542개");
    expect(html).toContain("가격이 부담돼요");
    expect(html).toContain("18건");
  });
  it("renders hair consultation totals, cohort rates, and rating distribution", () => {
    const html = render(<HairConsultationDashboard range={range} />);
    expect(html).toMatch(/상담 생성<\/div><strong>10건<\/strong>/);
    expect(html).toContain("직전 1일 대비 ±0건");
    expect(html).toContain("심층 4 · 간편 6");
    expect(html).toMatch(/답변<\/div><strong>20건<\/strong>/);
    expect(html).toContain("2,900원");
    expect(html).toMatch(/몽 사용량<\/div><strong>250몽<\/strong>/);
    expect(html).toContain("심층상담 답변률");
    expect(html).toContain("간편상담 답변률");
    expect(html).toContain("심층상담 결제율");
    expect(html).toContain("75.0");
    expect(html).toContain("83.3");
    expect(html).toContain("50.0");
    expect(html).toContain("미답변");
    expect(html).toContain("미결제");
    expect(html).toContain("70.0%");
    expect(html).toContain("width:70%");
    expect(html).toContain('title="일별 답변률 데이터 미제공">—');
    expect(
      trendChart.mock.calls.map(
        ([props]) => (props as { lines: unknown[] }).lines,
      ),
    ).toEqual([
      [
        { key: "created", label: "생성", color: "#86868b" },
        { key: "answers", label: "답변", color: "#007aff" },
      ],
      [
        { key: "store", label: "단건결제", color: "#c2410c" },
        { key: "mong", label: "몽 결제", color: "#007aff" },
      ],
      [{ key: "mong", label: "몽 사용", color: "#003d82" }],
    ]);
    expect(html).toContain("종료일까지 평가된 답변 10건");
    expect(html).toContain("4.6");
    expect(html).toContain("09.10 (목)");
  });
  it("keeps missing cohort rates unavailable instead of using answer counts", () => {
    const empty = structuredClone(hairSummary);
    empty.data.deepStatistics.answerRate = null;
    empty.data.quickStatistics.answerRate = null;
    empty.data.deepStatistics.paymentRate = null;
    empty.data.deepStatistics.rating.averageRating = null;
    empty.data.deepStatistics.rating.ratedAnswerCount = 0;
    empty.data.deepStatistics.rating.ratingCountList = [];
    client.setQueryData(
      dashboardQueryOptions.hairConsultationSummary(range).queryKey,
      empty,
    );
    const html = render(<HairConsultationDashboard range={range} />);
    expect(html).not.toContain("NaN");
    expect(html).not.toContain("Infinity");
    expect(html).not.toContain("225.0%");
    expect(html).toContain('class="consultation-answer-rate">—');
    expect(html).toContain("0.0%");
  });
  it("marks previous-period comparison unavailable when that query fails", () => {
    client
      .getQueryCache()
      .find({
        queryKey: dashboardQueryOptions.hairConsultations(previousRange(range))
          .queryKey,
      })
      ?.setState({ status: "error", error: new Error("직전 기간 실패") });
    const html = render(<HairConsultationDashboard range={range} />);
    expect(html).toContain("직전 1일 대비 비교 불가");
    expect(html).toMatch(/상담 생성<\/div><strong>10건<\/strong>/);
  });
  it("renders an API error with a retry rather than zero metrics", () => {
    const query = client
      .getQueryCache()
      .find({ queryKey: dashboardQueryOptions.timeSales(range).queryKey });
    query?.setState({ status: "error", error: new Error("서버 조회 실패") });
    const html = render(<ReviewSaleDashboard range={range} />);
    expect(html).toContain("서버 조회 실패");
    expect(html).toContain("다시 시도");
    expect(html).not.toContain("0회");
  });
});
