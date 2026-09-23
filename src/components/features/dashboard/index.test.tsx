import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { dashboardQueryOptions } from "@/queries/dashboards";
import DashboardPage from "@/app/(dashboards)/dashboard/page";
import HomeDashboard from "./home-dashboard";
import PaymentDashboard, { ChargeTrend } from "./payment-dashboard";
import ActivityDashboard from "./activity-dashboard";
import ReviewSaleDashboard from "./review-sale-dashboard";
import { chargeHistoryRange, dateRange, dayCount } from "./statistics";
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
  it.each([0, 9900])(
    "shows known revenue %i and small unknown counts on home, payments, and passes",
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
      for (const node of [
        <HomeDashboard key="home" range={range} role="all" />,
        <PaymentDashboard key="payment" range={range} role="all" />,
      ]) {
        const html = render(node);
        expect(html).toMatch(
          new RegExp(`매출</div><strong>${amount}</strong><p>미확인 16건</p>`),
        );
      }
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
    expect(html).toContain("19,800원");
    expect(html).toContain("12,000명");
    expect(html).toContain("499건");
    expect(html).toContain("실제 가입일 기준");
    expect(html).toContain("충전 추이");
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
    expect(html).toContain("0원");
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
  it("renders both review-sale roles and customer free-text responses", () => {
    const html = render(<ReviewSaleDashboard range={range} />);
    expect(html).toContain("128명");
    expect(html).toContain("542개");
    expect(html).toContain("가격이 부담돼요");
    expect(html).toContain("18건");
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
