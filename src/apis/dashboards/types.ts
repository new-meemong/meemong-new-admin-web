export type DashboardRole = "model" | "designer" | "unknown";
export type DashboardRoleFilter = "all" | "model" | "designer";
export type RoleCounts = Record<DashboardRole, number>;
export type Coverage = "complete" | "partial" | "unavailable";
export type DashboardDateRange = { startDateKST: string; endDateKST: string };
export type DashboardMeta = DashboardDateRange & { timezone: string };
export type DailyStatistics<T, M = DashboardMeta> = {
  meta: M;
  dataCount: number;
  dataList: T[];
};
export type UserDay = {
  dateKST: string;
  joinedCounts: RoleCounts;
  withdrawnCounts: RoleCounts;
  dauCounts: Record<DashboardRole, number | null>;
  mauCounts: Record<DashboardRole, number | null>;
  activityCoverage: Coverage;
  mauCoverage: Coverage;
};
export type UserStatistics = DailyStatistics<
  UserDay,
  DashboardMeta & {
    activityTrackingStartedAt: string | null;
    mauDefinition: "calendarMonthToDate";
    todayIsProvisional: boolean;
  }
> & { currentMemberCounts: RoleCounts };
export type RetentionBucket = {
  lowerSeconds: number;
  upperSeconds: number | null;
  count: number;
};
export type WithdrawalDay = {
  dateKST: string;
  count: number;
  countsByRole: RoleCounts;
  retentionBuckets: Record<string, RetentionBucket>;
  unknownRetentionCount: number;
  reasonCounts: Record<string, number>;
  freeTextList: { text: string; role: DashboardRole }[];
};
export type WithdrawalStatistics = DailyStatistics<
  WithdrawalDay,
  DashboardMeta & { structuredReasons: string[] }
>;
export type PaymentTotals = {
  unit: "KRW";
  purchaseCount: number;
  refundedCount: number;
  totalPaymentAmountKRW: number | null;
  refundedPaymentAmountKRW: number | null;
  knownTotalPaymentAmountKRW: number;
  unknownTotalPaymentCount: number;
};
export type ChargeTotals = PaymentTotals & {
  totalChargedMongAmount: number;
  totalChargedMongBaseAmount: number | null;
  totalChargedMongBonusAmount: number | null;
};
export type ChargeItem = ChargeTotals & {
  role: DashboardRole;
  platform: string;
  productId: string | null;
  chargedMongBaseAmount: number | null;
  chargedMongAmount: number;
  chargedMongBonusAmount: number | null;
  paymentAmountKRW: number | null;
  mongPresetId: number | null;
};
export type UsageTotals = {
  unit: "MONG";
  purchaseCount: number;
  refundedCount: number;
  totalUsedMongAmount: number;
  refundedUsedMongAmount: number;
};
export type UsageItem = UsageTotals & {
  role: DashboardRole;
  subType: string;
  title: string | null;
  usedMongAmount: number;
};
export type RewardTotals = {
  unit: "MONG";
  rewardCount: number;
  totalRewardedMongAmount: number;
};
export type RewardItem = RewardTotals & {
  role: DashboardRole;
  subType: string;
  title: string | null;
  rewardedMongAmount: number;
};
export type MongTotalsDay = {
  dateKST: string;
  chargedTotals: ChargeTotals;
  usedTotals: UsageTotals;
  rewardedTotals: RewardTotals;
};
export type MongDay = MongTotalsDay & {
  chargedItems: Record<string, ChargeItem>;
  usedItems: Record<string, UsageItem>;
  rewardedItems: Record<string, RewardItem>;
};
export type PassItem = PaymentTotals & {
  role: "model";
  platform: string;
  productId: string | null;
  duration: number | null;
  paymentAmountKRW: number | null;
};
export type PassDay = {
  dateKST: string;
  items: Record<string, PassItem>;
  totals: PaymentTotals;
};
export type TimeSaleDay = {
  dateKST: string;
  totals: {
    activeDesignerCount: number;
    totalActiveMenuCount: number;
    totalViewCount: number;
    totalLinkClickCount: number;
    reservationCancelCount: number;
  };
  model: {
    totalResponseCount: number;
    reservedCount: number;
    reservedOtherTimeCount: number;
    rejectCount: number;
    rejectCounts: Record<string, number>;
    rejectEtcTextList: string[];
  };
  designer: {
    totalReservationCount: number;
    acceptCount: number;
    rejectCount: number;
    rejectCounts: Record<string, number>;
  };
};
type Preset = {
  id: number;
  title: string;
  price: number;
  unit: "KRW" | "MONG";
};
export type DashboardPresets = {
  data: {
    mongPresets: (Preset & {
      mongAmount: number;
      mongBonusAmount: number;
      mongBaseAmount: number;
      platform: string;
      productId: string;
      isFirstPurchase: boolean;
    })[];
    adBlockPresets: (Preset & {
      duration: number;
      platform: string;
      productId: string;
    })[];
    mongConsumePresets: (Preset & { type: string; subType: string })[];
    growthPassPresets: (Preset & { amountDays: number; platform: string })[];
  };
};

/** 기존 상세 통계는 날짜·시간 문자열과 종료 시각 미포함 범위를 반환합니다. */
export type LegacyMongDetailsResponse = {
  meta: { startDateKST: string; endDateKST: string };
  dataCount: number;
  dataList: {
    dateKST: string;
    chargeCount: number;
    chargeTotalMong: number;
    chargeCountByType: Record<string, number>;
    chargeMongByType: Record<string, number>;
    rewardCount: number;
    rewardTotalMong: number;
    rewardCountByType: Record<string, number>;
    rewardMongByType: Record<string, number>;
    usedCount: number;
    usedTotalMong: number;
    usedCountByType: Record<string, number>;
    usedMongByType: Record<string, number>;
  }[];
};
