import { describe, expect, it } from "vitest";
import type { IBanner } from "@/models/banner";
import { getBannerStatusesById } from "@/utils/banner";

const NOW = new Date("2026-07-27T00:00:00.000Z").getTime();

function createBanner(overrides: Partial<IBanner>): IBanner {
  return {
    id: 1,
    userType: "모델",
    bannerType: "일반",
    displayType: "image",
    imageUrl: "https://example.com/banner.png",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

describe("getBannerStatusesById", () => {
  it("marks every available general carousel banner active", () => {
    const statuses = getBannerStatusesById(
      [
        createBanner({ id: 1, createdAt: "2026-07-01T00:00:00.000Z" }),
        createBanner({ id: 2, createdAt: "2026-07-20T00:00:00.000Z" }),
      ],
      NOW,
    );

    expect(statuses.get(1)).toBe("활성화");
    expect(statuses.get(2)).toBe("활성화");
  });

  it("marks only the newest available non-carousel banner active", () => {
    const statuses = getBannerStatusesById(
      [
        createBanner({
          id: 1,
          bannerType: "채팅배너",
          createdAt: "2026-07-01T00:00:00.000Z",
        }),
        createBanner({
          id: 2,
          bannerType: "채팅배너",
          createdAt: "2026-07-20T00:00:00.000Z",
        }),
      ],
      NOW,
    );

    expect(statuses.get(1)).toBe("비활성화");
    expect(statuses.get(2)).toBe("활성화");
  });

  it("does not mark ended or explicitly inactive banners active", () => {
    const statuses = getBannerStatusesById(
      [
        createBanner({ id: 1, endAt: "2026-07-26T00:00:00.000Z" }),
        createBanner({ id: 2, isActive: false }),
      ],
      NOW,
    );

    expect(statuses.get(1)).toBe("종료됨");
    expect(statuses.get(2)).toBe("비활성화");
  });
});
