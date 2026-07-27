import { describe, expect, it } from "vitest";
import {
  aggregateBannerClicks,
  deriveCurrentBannerPlacementId,
  deriveLegacyPlacementId,
  filterBannerClicks,
  filterBannerClicksByBannerIds,
  getClickChangeRate,
  normalizeBannerClickDocument,
  resolveBannerClickFilters,
} from "@/utils/bannerClickAnalytics";
import type { NormalizedBannerClick } from "@/models/bannerClick";

const timestamp = (iso: string) => ({ toDate: () => new Date(iso) });

function createClick(
  overrides: Partial<NormalizedBannerClick>,
): NormalizedBannerClick {
  return {
    documentId: "click-1",
    schemaVersion: 2,
    bannerId: "11",
    userType: "모델",
    bannerType: "일반",
    placementId: "model_home_carousel",
    clickedAt: new Date("2026-07-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("banner click normalization", () => {
  it("does not guess the legacy designer general placement", () => {
    expect(deriveLegacyPlacementId("디자이너", "일반")).toBe(
      "designer_general_unknown",
    );
  });

  it("maps current designer general banners to the home carousel", () => {
    expect(deriveCurrentBannerPlacementId("디자이너", "일반")).toBe(
      "designer_home_carousel",
    );
  });

  it("treats legacy bottom-sheet user type as unknown", () => {
    const click = normalizeBannerClickDocument("click-1", {
      bannerId: 10,
      userType: "모델",
      bannerType: "바텀시트",
      clickedAt: timestamp("2026-07-01T00:00:00.000Z"),
    });

    expect(click).toMatchObject({
      schemaVersion: 1,
      bannerId: "10",
      userType: "unknown",
      placementId: "app_start_bottom_sheet",
    });
  });

  it("uses a valid V2 placement and folds clicks by KST day and banner", () => {
    const clicks = [
      normalizeBannerClickDocument("click-1", {
        schemaVersion: 2,
        bannerId: "11",
        userType: "모델",
        bannerType: "일반",
        placementId: "model_home_carousel",
        clickedAt: timestamp("2026-06-30T14:59:59.000Z"),
      }),
      normalizeBannerClickDocument("click-2", {
        schemaVersion: 2,
        bannerId: "11",
        userType: "모델",
        bannerType: "일반",
        placementId: "model_home_carousel",
        clickedAt: timestamp("2026-06-30T15:00:00.000Z"),
      }),
    ].filter((click) => click !== undefined);

    const aggregate = aggregateBannerClicks(clicks);

    expect(aggregate.totalClicks).toBe(2);
    expect(aggregate.byDay).toEqual({
      "2026-06-30": 1,
      "2026-07-01": 1,
    });
    expect(aggregate.byBanner[0]).toMatchObject({ bannerId: "11", clicks: 2 });
    expect(aggregate.byBanner[0].firstClickedAt.toISOString()).toBe(
      "2026-06-30T14:59:59.000Z",
    );
    expect(aggregate.byBanner[0].lastClickedAt.toISOString()).toBe(
      "2026-06-30T15:00:00.000Z",
    );
  });

  it("does not infer a missing V2 placement from display labels", () => {
    const click = normalizeBannerClickDocument("click-1", {
      schemaVersion: 2,
      bannerId: "11",
      userType: "모델",
      bannerType: "일반",
      clickedAt: timestamp("2026-07-01T00:00:00.000Z"),
    });

    expect(click?.placementId).toBe("unknown");
  });

  it("rejects documents without a server clickedAt or bannerId", () => {
    expect(
      normalizeBannerClickDocument("click-1", {
        bannerId: "11",
        clientClickedAt: timestamp("2026-07-01T00:00:00.000Z"),
      }),
    ).toBeUndefined();
  });

  it("removes the unreliable user filter for bottom-sheet history", () => {
    expect(
      resolveBannerClickFilters({
        userType: "모델",
        bannerType: "바텀시트",
        placementId: "app_start_bottom_sheet",
      }),
    ).toEqual({
      userType: undefined,
      bannerType: "바텀시트",
      placementId: "app_start_bottom_sheet",
    });
    expect(
      resolveBannerClickFilters({ userType: "모델", bannerType: "일반" }),
    ).toEqual({ userType: "모델", bannerType: "일반" });
  });

  it("filters by placement and calculates comparable change rates", () => {
    const clicks = [
      createClick({ documentId: "click-1" }),
      createClick({
        documentId: "click-2",
        placementId: "chat_list_top",
      }),
    ];

    expect(
      filterBannerClicks(clicks, {
        placementId: "model_home_carousel",
      }).map((click) => click.documentId),
    ).toEqual(["click-1"]);
    expect(getClickChangeRate(120, 100)).toBe(20);
    expect(getClickChangeRate(10, 0)).toBeUndefined();
  });

  it("filters clicks by the currently active banner IDs", () => {
    expect(
      filterBannerClicksByBannerIds(
        [
          createClick({ bannerId: "active" }),
          createClick({ bannerId: "inactive" }),
        ],
        new Set(["active"]),
      ).map((click) => click.bannerId),
    ).toEqual(["active"]);
  });
});
