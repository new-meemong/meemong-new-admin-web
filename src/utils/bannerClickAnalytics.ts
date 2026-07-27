import {
  BANNER_CLICK_PLACEMENT_LABELS,
  type BannerClickPlacementId,
} from "@/constants/bannerClick";
import type {
  BannerClickAggregate,
  BannerClickBannerAggregate,
  BannerClickFilters,
  NormalizedBannerClick,
  NormalizedBannerClickUserType,
} from "@/models/bannerClick";
import { toKstDateKey } from "@/utils/bannerClickDate";

const VALID_PLACEMENTS = new Set<string>(
  Object.keys(BANNER_CLICK_PLACEMENT_LABELS),
);

function normalizeUserType(value: unknown): NormalizedBannerClickUserType {
  if (value === "모델" || value === "디자이너") return value;
  return "unknown";
}

export function deriveLegacyPlacementId(
  userType: NormalizedBannerClickUserType,
  bannerType: string,
): BannerClickPlacementId {
  if (bannerType === "바텀시트") return "app_start_bottom_sheet";
  if (bannerType === "번개매칭") return "thunder_matching_top";
  if (bannerType === "채팅배너") return "chat_list_top";
  if (userType === "모델" && bannerType === "지도로보기") {
    return "model_map_top";
  }
  if (userType === "모델" && bannerType === "일반") {
    return "model_home_carousel";
  }
  if (userType === "디자이너" && bannerType === "일반") {
    return "designer_general_unknown";
  }
  return "unknown";
}

export function deriveCurrentBannerPlacementId(
  userType: string,
  bannerType: string,
): BannerClickPlacementId {
  if (userType === "디자이너" && bannerType === "일반") {
    return "designer_home_carousel";
  }
  return deriveLegacyPlacementId(normalizeUserType(userType), bannerType);
}

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const result = value.toDate();
    return result instanceof Date ? result : undefined;
  }
  return undefined;
}

export function normalizeBannerClickDocument(
  documentId: string,
  data: Record<string, unknown>,
): NormalizedBannerClick | undefined {
  const clickedAt = toDate(data.clickedAt);
  const bannerId = data.bannerId;
  if (
    !clickedAt ||
    (typeof bannerId !== "string" && typeof bannerId !== "number")
  ) {
    return undefined;
  }

  const schemaVersion =
    typeof data.schemaVersion === "number" ? data.schemaVersion : 1;
  const bannerType =
    typeof data.bannerType === "string" ? data.bannerType : "unknown";
  let userType = normalizeUserType(data.userType);
  if (schemaVersion < 2 && bannerType === "바텀시트") userType = "unknown";

  const rawPlacementId = data.placementId;
  const placementId =
    schemaVersion >= 2
      ? typeof rawPlacementId === "string" &&
        VALID_PLACEMENTS.has(rawPlacementId)
        ? (rawPlacementId as BannerClickPlacementId)
        : "unknown"
      : deriveLegacyPlacementId(userType, bannerType);

  return {
    documentId,
    schemaVersion,
    bannerId: String(bannerId),
    userType,
    bannerType,
    placementId,
    clickedAt,
    appVersion:
      typeof data.appVersion === "string" ? data.appVersion : undefined,
    buildMode: typeof data.buildMode === "string" ? data.buildMode : undefined,
  };
}

export function filterBannerClicks(
  clicks: NormalizedBannerClick[],
  filters: BannerClickFilters,
) {
  return clicks.filter((click) => {
    if (filters.userType && click.userType !== filters.userType) return false;
    if (filters.bannerType && click.bannerType !== filters.bannerType)
      return false;
    if (filters.placementId && click.placementId !== filters.placementId) {
      return false;
    }
    return true;
  });
}

export function resolveBannerClickFilters(
  filters: BannerClickFilters,
): BannerClickFilters {
  if (filters.bannerType === "바텀시트") {
    return { ...filters, userType: undefined };
  }
  return filters;
}

export function aggregateBannerClicks(
  clicks: NormalizedBannerClick[],
): BannerClickAggregate {
  const byDay: Record<string, number> = {};
  const byPlacement = Object.fromEntries(
    Object.keys(BANNER_CLICK_PLACEMENT_LABELS).map((key) => [key, 0]),
  ) as Record<BannerClickPlacementId, number>;
  const bannerMap = new Map<
    string,
    Omit<BannerClickBannerAggregate, "placementIds"> & {
      placementIds: Set<BannerClickPlacementId>;
    }
  >();

  clicks.forEach((click) => {
    const dateKey = toKstDateKey(click.clickedAt);
    byDay[dateKey] = (byDay[dateKey] ?? 0) + 1;
    byPlacement[click.placementId] += 1;

    const existing = bannerMap.get(click.bannerId);
    if (existing) {
      existing.clicks += 1;
      existing.placementIds.add(click.placementId);
      existing.dailyClicks[dateKey] = (existing.dailyClicks[dateKey] ?? 0) + 1;
      if (click.clickedAt > existing.lastClickedAt) {
        existing.lastClickedAt = click.clickedAt;
      }
      if (click.clickedAt < existing.firstClickedAt) {
        existing.firstClickedAt = click.clickedAt;
      }
      return;
    }

    bannerMap.set(click.bannerId, {
      bannerId: click.bannerId,
      clicks: 1,
      userType: click.userType,
      bannerType: click.bannerType,
      placementIds: new Set([click.placementId]),
      dailyClicks: { [dateKey]: 1 },
      firstClickedAt: click.clickedAt,
      lastClickedAt: click.clickedAt,
    });
  });

  return {
    totalClicks: clicks.length,
    clickedBannerCount: bannerMap.size,
    byDay,
    byPlacement,
    byBanner: [...bannerMap.values()]
      .map((value) => ({
        ...value,
        placementIds: [...value.placementIds],
      }))
      .sort((a, b) => b.clicks - a.clicks),
  };
}

export function getClickChangeRate(current: number, previous: number) {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}
