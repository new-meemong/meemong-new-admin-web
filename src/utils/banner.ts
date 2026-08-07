import {
  BANNER_TYPE_OPTIONS,
  BANNER_USER_TYPE,
  BannerUserType,
  DEFAULT_BANNER_TYPE_BY_USER_TYPE
} from "@/constants/banner";

import type { IBanner } from "@/models/banner";

export type BannerStatus = "종료됨" | "비활성화" | "활성화";

const MULTI_ACTIVE_BANNER_TYPES = new Set(["일반", "채팅배너"]);

export const isValidUserType = (v: unknown): v is BannerUserType =>
  typeof v === "string" &&
  (v === BANNER_USER_TYPE.MODEL || v === BANNER_USER_TYPE.DESIGNER);

export const isValidBannerTypeForUserType = (
  userType: BannerUserType,
  t: unknown
): t is string =>
  typeof t === "string" &&
  BANNER_TYPE_OPTIONS[userType].some((o) => o.value === t);

export const getDefaultBannerTypeForUserType = (userType: BannerUserType) =>
  DEFAULT_BANNER_TYPE_BY_USER_TYPE[userType];

const getBannerCategoryKey = (banner: IBanner) =>
  `${banner.userType}_${banner.bannerType}`;

const isBannerEnded = (banner: IBanner, now: number) =>
  Boolean(banner.endAt && new Date(banner.endAt).getTime() <= now);

const isBannerAvailable = (banner: IBanner, now: number) => {
  if (
    banner.isActive === false ||
    banner.deletedAt ||
    isBannerEnded(banner, now)
  ) {
    return false;
  }

  return !banner.startAt || new Date(banner.startAt).getTime() <= now;
};

const supportsMultipleActiveBanners = (banner: IBanner) =>
  MULTI_ACTIVE_BANNER_TYPES.has(banner.bannerType);

export const getBannerStatusesById = (
  banners: readonly IBanner[],
  now = Date.now()
): ReadonlyMap<number, BannerStatus> => {
  const latestAvailableBannerByCategory = new Map<string, IBanner>();

  banners.forEach((banner) => {
    if (
      !isBannerAvailable(banner, now) ||
      supportsMultipleActiveBanners(banner)
    ) {
      return;
    }

    const category = getBannerCategoryKey(banner);
    const latestBanner = latestAvailableBannerByCategory.get(category);

    if (
      !latestBanner ||
      new Date(banner.createdAt).getTime() >
        new Date(latestBanner.createdAt).getTime()
    ) {
      latestAvailableBannerByCategory.set(category, banner);
    }
  });

  return new Map(
    banners.map((banner) => {
      if (isBannerEnded(banner, now)) {
        return [banner.id, "종료됨"] as const;
      }

      if (!isBannerAvailable(banner, now)) {
        return [banner.id, "비활성화"] as const;
      }

      if (supportsMultipleActiveBanners(banner)) {
        return [banner.id, "활성화"] as const;
      }

      const latestBanner = latestAvailableBannerByCategory.get(
        getBannerCategoryKey(banner)
      );
      const status: BannerStatus =
        latestBanner?.id === banner.id ? "활성화" : "비활성화";

      return [banner.id, status] as const;
    })
  );
};
