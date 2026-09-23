import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { dashboardQueryOptions } from "@/queries/dashboards";
import {
  chargeHistoryRange,
  dateRange,
  dayCount,
} from "@/components/features/dashboard/statistics";
import { dashboardAPI } from ".";
import users from "./__fixtures__/user-statistics.json";
import withdrawals from "./__fixtures__/withdrawal-statistics.json";
import mong from "./__fixtures__/mong-statistics.json";
import totals from "./__fixtures__/mong-statistics-totals.json";
import passes from "./__fixtures__/meemong-pass-statistics.json";
import sales from "./__fixtures__/time-sale-menu-statistics.json";
import presets from "./__fixtures__/presets.json";
const fixtures: Record<string, unknown> = {
  "user-statistics": users,
  "withdrawal-statistics": withdrawals,
  "mong-statistics": mong,
  "mong-statistics/totals": totals,
  "meemong-pass-statistics": passes,
  "time-sale-menu-statistics": sales,
  presets,
};
const range = { startDateKST: "2026-09-01", endDateKST: "2026-09-10" };
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            fixtures[
              new URL(url).pathname.replace("/api/v1/un-auth/dashboards/", "")
            ],
          ),
          { headers: { "content-type": "application/json" } },
        ),
    ),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("dashboard server contracts", () => {
  it("fetches a 90-day selection and its 29-day warmup as separate bounded requests", async () => {
    const selected = dateRange(90, "2026-09-23");
    const history = chargeHistoryRange(selected);
    const client = new QueryClient();
    try {
      await Promise.all(
        [selected, history].map((dates) =>
          client.fetchQuery(dashboardQueryOptions.mong(dates)),
        ),
      );
      const requests = vi
        .mocked(fetch)
        .mock.calls.map(([url]) =>
          Object.fromEntries(new URL(String(url)).searchParams),
        );
      expect(requests).toEqual([selected, history]);
      expect(dayCount(selected)).toBe(90);
      expect(dayCount(history)).toBe(29);
      expect(history.startDateKST).toBe("2026-05-28");
      expect(history.endDateKST).toBe("2026-06-25");
    } finally {
      client.clear();
    }
  });
  it("loads the reference chart's legacy mong details through the query boundary", async () => {
    const response = {
      meta: {
        startDateKST: "2026-09-01 00:00:00",
        endDateKST: "2026-09-09 00:00:00",
      },
      dataCount: 0,
      dataList: [],
    };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(response), {
        headers: { "content-type": "application/json" },
      }),
    );
    const client = new QueryClient();
    try {
      expect(
        await client.fetchQuery(dashboardQueryOptions.legacyMongDetails()),
      ).toEqual(response);
      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toBe(
        "https://api.example.test/api/v1/un-auth/mong-statistics/details",
      );
      expect(init?.signal).toBeInstanceOf(AbortSignal);
    } finally {
      client.clear();
    }
  });
  it.each([
    ["users", "user-statistics"],
    ["withdrawals", "withdrawal-statistics"],
    ["mong", "mong-statistics"],
    ["mongTotals", "mong-statistics/totals"],
    ["passes", "meemong-pass-statistics"],
    ["timeSales", "time-sale-menu-statistics"],
  ] as const)(
    "queries %s through the API boundary with KST dates",
    async (key, endpoint) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      try {
        // Each query's concrete generic differs, but all share the same query contract.
        const result = await client.fetchQuery(
          dashboardQueryOptions[key](range) as ReturnType<
            typeof dashboardQueryOptions.users
          >,
        );
        expect(result).toEqual(fixtures[endpoint]);
        const [url, init] = vi.mocked(fetch).mock.calls[0];
        const parsed = new URL(String(url));
        expect(parsed.pathname).toBe(`/api/v1/un-auth/dashboards/${endpoint}`);
        expect(Object.fromEntries(parsed.searchParams)).toEqual(range);
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        expect(new Headers(init?.headers).has("Authorization")).toBe(false);
      } finally {
        client.clear();
      }
    },
  );
  it("loads all current presets without date parameters", async () => {
    expect(await dashboardAPI.presets()).toEqual(presets);
    expect(new URL(String(vi.mocked(fetch).mock.calls[0][0])).search).toBe("");
  });
  it("preserves unknown monetary values and propagates failures", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ...mong,
          dataList: [
            {
              ...mong.dataList[0],
              chargedTotals: {
                ...mong.dataList[0].chargedTotals,
                totalPaymentAmountKRW: null,
              },
            },
          ],
        }),
        { headers: { "content-type": "application/json" } },
      ),
    );
    expect(
      (await dashboardAPI.mong(range)).dataList[0].chargedTotals
        .totalPaymentAmountKRW,
    ).toBeNull();
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "조회 범위는 1~90일이어야 합니다." }),
        { status: 400, headers: { "content-type": "application/json" } },
      ),
    );
    await expect(dashboardAPI.users(range)).rejects.toThrow(
      "조회 범위는 1~90일이어야 합니다.",
    );
  });
  it("isolates cached date ranges", () => {
    expect(dashboardQueryOptions.mong(range).queryKey).not.toEqual(
      dashboardQueryOptions.mong({ ...range, endDateKST: "2026-09-11" })
        .queryKey,
    );
  });
});
