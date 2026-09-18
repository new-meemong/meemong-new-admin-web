import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeSaleMenuAPI } from "@/apis/timeSaleMenus";
import { timeSaleMenusQueryKeys } from "@/queries/timeSaleMenus";

let requestedUrl: URL;
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requestedUrl = new URL(url);
      return new Response(
        JSON.stringify({
          data: {
            dataList: [
              {
                id: 1,
                viewCount: 8,
                reservationRequestCount: 3,
                reservationAcceptedCount: 1,
                reservationRate: 0.125,
              },
            ],
            totalCount: 21,
            page: 2,
            size: 10,
          },
        }),
        { headers: { "content-type": "application/json" } },
      );
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("review special menu analysis API", () => {
  it.each([
    "latest",
    "viewCountDesc",
    "reservationRequestCountDesc",
    "reservationAcceptedCountDesc",
    "reservationRateDesc",
  ] as const)(
    "serializes %s with combined filters and preserves metrics",
    async (orderBy) => {
      const result = await timeSaleMenuAPI.getAll({
        orderBy,
        createdAtStartKST: "2026-09-01",
        createdAtEndKST: "2026-09-18",
        treatmentTypes: ["펌", "염색"],
        searchType: "TITLE",
        searchKeyword: "  레이어드  ",
        page: 2,
        size: 10,
      });
      expect(requestedUrl.pathname).toBe("/api/v1/admins/time-sale-menus");
      expect(Object.fromEntries(requestedUrl.searchParams)).toMatchObject({
        orderBy,
        createdAtStartKST: "2026-09-01",
        createdAtEndKST: "2026-09-18",
        searchType: "TITLE",
        searchKeyword: "레이어드",
        page: "2",
        size: "10",
      });
      expect(requestedUrl.searchParams.getAll("treatmentTypes[]")).toEqual([
        "펌",
        "염색",
      ]);
      expect(requestedUrl.searchParams.has("treatmentTypes")).toBe(false);
      expect(result.totalCount).toBe(21);
      expect(result.content[0]).toMatchObject({
        reservationRequestCount: 3,
        reservationAcceptedCount: 1,
        reservationRate: 0.125,
      });
    },
  );
  it.each(["createdAtStartKST", "createdAtEndKST"] as const)(
    "supports a single category and open-ended %s",
    async (dateKey) => {
      await timeSaleMenuAPI.getAll({
        [dateKey]: "2026-09-18",
        treatmentTypes: ["펌"],
        searchType: "TITLE",
        searchKeyword: "  ",
      });
      expect(requestedUrl.searchParams.getAll("treatmentTypes[]")).toEqual([
        "펌",
      ]);
      expect(requestedUrl.searchParams.get(dateKey)).toBe("2026-09-18");
      expect(
        requestedUrl.searchParams.has(
          dateKey === "createdAtStartKST"
            ? "createdAtEndKST"
            : "createdAtStartKST",
        ),
      ).toBe(false);
      expect(requestedUrl.searchParams.has("searchKeyword")).toBe(false);
      expect(requestedUrl.searchParams.has("searchType")).toBe(false);
    },
  );
  it("omits cleared filters", async () => {
    await timeSaleMenuAPI.getAll({
      createdAtStartKST: "",
      createdAtEndKST: "",
      treatmentTypes: [],
    });
    expect([...requestedUrl.searchParams.keys()].sort()).toEqual([
      "page",
      "size",
    ]);
  });
  it("separates filtered query caches", () => {
    const base = timeSaleMenusQueryKeys.list({});
    for (const params of [
      { orderBy: "viewCountDesc" as const },
      { createdAtStartKST: "2026-09-01" },
      { createdAtEndKST: "2026-09-18" },
      { treatmentTypes: ["펌" as const] },
    ]) {
      expect(timeSaleMenusQueryKeys.list(params)).not.toEqual(base);
    }
  });
});
