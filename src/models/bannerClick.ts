import type { BannerClickPlacementId } from "@/constants/bannerClick";

export type NormalizedBannerClickUserType = "모델" | "디자이너" | "unknown";

export interface BannerClickDateRange {
  from?: Date;
  to: Date;
  fromDateKey?: string;
  toDateKey: string;
}

export interface NormalizedBannerClick {
  documentId: string;
  schemaVersion: number;
  bannerId: string;
  userType: NormalizedBannerClickUserType;
  bannerType: string;
  placementId: BannerClickPlacementId;
  clickedAt: Date;
  appVersion?: string;
  buildMode?: string;
}

export interface BannerClicksResult {
  clicks: NormalizedBannerClick[];
  isTruncated: boolean;
  invalidDocumentCount: number;
}

export interface BannerClickFilters {
  userType?: string;
  bannerType?: string;
  placementId?: BannerClickPlacementId;
}

export interface BannerClickBannerAggregate {
  bannerId: string;
  clicks: number;
  userType: NormalizedBannerClickUserType;
  bannerType: string;
  placementIds: BannerClickPlacementId[];
  dailyClicks: Record<string, number>;
  firstClickedAt: Date;
  lastClickedAt: Date;
}

export interface BannerClickAggregate {
  totalClicks: number;
  clickedBannerCount: number;
  byDay: Record<string, number>;
  byPlacement: Record<BannerClickPlacementId, number>;
  byBanner: BannerClickBannerAggregate[];
}
