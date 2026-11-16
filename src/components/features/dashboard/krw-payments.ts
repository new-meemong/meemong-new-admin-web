import type {
  DashboardDateRange,
  KrwPaymentTotals,
  PaymentCategory,
  PaymentStatisticsDay,
  PaymentStatisticsItem,
} from "@/apis/dashboards/types";
import { dateRange, dayCount, formatNumber } from "./statistics";

export const PAYMENT_CATEGORY_LABELS: Record<PaymentCategory, string> = {
  MONG_CHARGE: "몽 충전",
  MEEMONG_PASS: "미몽패스 (고객)",
  THUNDER: "빠른매칭",
  V3_HAIR_CONSULTATION: "헤어컨설팅",
};
/** 표시 순서는 고정하되, 과거 빠른매칭 결제·환불은 해당 기간에 기록이 있을 때만 노출합니다. */
export function visibleSinglePaymentCategories(
  days: PaymentStatisticsDay[],
): PaymentCategory[] {
  const categories: PaymentCategory[] = [
    "MEEMONG_PASS",
    "V3_HAIR_CONSULTATION",
  ];
  if (
    days.some((day) =>
      day.itemList.some(
        (item) =>
          item.paymentCategory === "THUNDER" &&
          (item.purchaseCount > 0 ||
            item.knownTotalPaymentAmountKRW > 0 ||
            item.unknownTotalPaymentCount > 0 ||
            item.knownRefundedCount > 0 ||
            item.knownRefundedPaymentAmountKRW > 0 ||
            item.unknownRefundStatusCount > 0 ||
            item.unknownRefundedPaymentCount > 0),
      ),
    )
  )
    categories.push("THUNDER");
  return categories;
}
/** 표시 정책과 무관하게 모든 단건 원화 결제를 합산합니다. */
export const singlePaymentItems = (days: PaymentStatisticsDay[]) =>
  days.flatMap((day) =>
    day.itemList.filter((item) => item.paymentCategory !== "MONG_CHARGE"),
  );

export const revenueCategoryLabel = (category: PaymentCategory) =>
  category === "V3_HAIR_CONSULTATION"
    ? "헤어컨설팅 심층답변"
    : PAYMENT_CATEGORY_LABELS[category];

type KrwAmountFields = Pick<
  KrwPaymentTotals,
  | "purchaseCount"
  | "knownTotalPaymentAmountKRW"
  | "unknownTotalPaymentCount"
  | "knownRefundedPaymentAmountKRW"
  | "unknownRefundedPaymentCount"
> &
  Partial<
    Pick<
      KrwPaymentTotals,
      "knownRefundedCount" | "unknownRefundStatusCount" | "refundedCount"
    >
  >;

export type KrwSummary = {
  purchaseCount: number;
  knownAmount: number;
  unknownAmountCount: number;
  /** complete: 모든 금액 확인, partial: 일부만 확인, unavailable: 결제는 있으나 금액 전부 확인 불가 */
  amountState: "complete" | "partial" | "unavailable";
  knownRefundedAmount: number;
  knownRefundedCount: number;
  unknownRefundStatusCount: number;
  unknownRefundedPaymentCount: number;
  /** 결제액·환불 상태·환불액이 모두 확인된 경우에만 계산합니다. */
  netAmount: number | null;
};

export function krwSummary(rows: KrwAmountFields[]): KrwSummary {
  const sum = (pick: (row: KrwAmountFields) => number) =>
    rows.reduce((total, row) => total + pick(row), 0);
  const purchaseCount = sum((row) => row.purchaseCount);
  const knownAmount = sum((row) => row.knownTotalPaymentAmountKRW);
  const unknownAmountCount = sum((row) => row.unknownTotalPaymentCount);
  const knownRefundedAmount = sum((row) => row.knownRefundedPaymentAmountKRW);
  const unknownRefundStatusCount = sum(
    (row) => row.unknownRefundStatusCount ?? 0,
  );
  const unknownRefundedPaymentCount = sum(
    (row) => row.unknownRefundedPaymentCount,
  );
  return {
    purchaseCount,
    knownAmount,
    unknownAmountCount,
    amountState:
      unknownAmountCount === 0
        ? "complete"
        : unknownAmountCount >= purchaseCount
          ? "unavailable"
          : "partial",
    knownRefundedAmount,
    knownRefundedCount: sum(
      (row) => row.knownRefundedCount ?? row.refundedCount ?? 0,
    ),
    unknownRefundStatusCount,
    unknownRefundedPaymentCount,
    netAmount:
      unknownAmountCount ||
      unknownRefundStatusCount ||
      unknownRefundedPaymentCount
        ? null
        : knownAmount - knownRefundedAmount,
  };
}

/** 금액을 하나도 확인할 수 없으면 0원 대신 확인 불가로 표시합니다. */
export const krwAmountText = (summary: KrwSummary) =>
  summary.amountState === "unavailable"
    ? "확인 불가"
    : formatNumber(summary.knownAmount, "원");
export const krwNetText = (summary: KrwSummary) =>
  summary.netAmount === null
    ? "확인 불가"
    : formatNumber(summary.netAmount, "원");
/** 표 셀용: 0은 대시로, 일부 확인 불가는 건수를 덧붙입니다. */
export function krwCellText(summary: KrwSummary) {
  if (summary.purchaseCount === 0) return "—";
  if (summary.amountState === "unavailable") return "확인 불가";
  const amount = formatNumber(summary.knownAmount, "원");
  return summary.unknownAmountCount
    ? `${amount} (확인 불가 ${formatNumber(summary.unknownAmountCount, "건")})`
    : amount;
}
export function krwRefundCellText(summary: KrwSummary) {
  if (summary.unknownRefundStatusCount)
    return `상태 확인 불가 ${formatNumber(summary.unknownRefundStatusCount, "건")}`;
  if (!summary.knownRefundedCount) return "—";
  return `−${formatNumber(summary.knownRefundedAmount, "원")} (${formatNumber(summary.knownRefundedCount, "건")})`;
}

export const categoryItems = (
  days: PaymentStatisticsDay[],
  categories: PaymentCategory[],
) =>
  days.flatMap((day) =>
    day.itemList.filter((item) => categories.includes(item.paymentCategory)),
  );

const PASS_DURATION_LABELS: Record<string, string> = {
  month: "1개월",
  "3month": "3개월",
  year: "1년",
};
/** 스토어 상품 ID로 운영자가 읽을 수 있는 상품명을 만듭니다. 알 수 없는 ID는 그대로 표시합니다. */
export function productLabel(item: Pick<PaymentStatisticsItem, "productId">) {
  const id = item.productId;
  if (!id) return "상품 미확인";
  const mong = id.match(/\.mong_(\d+)(_onboarding)?$/);
  if (mong) return `${mong[1]}몽${mong[2] ? " (온보딩)" : ""}`;
  const pass = id.match(/\.ad_block_model_(\w+)$/);
  if (pass && PASS_DURATION_LABELS[pass[1]])
    return `미몽패스 ${PASS_DURATION_LABELS[pass[1]]}`;
  const answers = id.match(/hair_consultation_answers(\d+)$/);
  if (answers)
    return answers[1] === "1"
      ? "심층상담 답변 1건 열기"
      : `심층상담 답변 ${answers[1]}건 모두 열기`;
  return id;
}
export const platformLabel = (platform: string) =>
  platform === "ios" ? "iOS" : platform === "android" ? "Android" : platform;

export type ProductRow = {
  key: string;
  category: PaymentCategory;
  platform: string;
  productId: string | null;
  summary: KrwSummary;
};
/** 선택 기간의 일별 항목을 결제 유형·플랫폼·상품 ID별로 합칩니다. 상품 ID가 없는 결제도 별도 행으로 유지합니다. */
export function productRows(days: PaymentStatisticsDay[]): ProductRow[] {
  const groups = new Map<string, PaymentStatisticsItem[]>();
  days.forEach((day) =>
    day.itemList.forEach((item) => {
      const key = `${item.paymentCategory}|${item.platform}|${item.productId ?? ""}`;
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }),
  );
  return [...groups.entries()]
    .map(([key, items]) => ({
      key,
      category: items[0].paymentCategory,
      platform: items[0].platform,
      productId: items[0].productId,
      summary: krwSummary(items),
    }))
    .sort(
      (a, b) =>
        b.summary.knownAmount - a.summary.knownAmount ||
        b.summary.purchaseCount - a.summary.purchaseCount ||
        a.key.localeCompare(b.key),
    );
}

/** 같은 길이의 직전 기간입니다. 비교 지표에 사용합니다. */
export function previousRange(range: DashboardDateRange): DashboardDateRange {
  const previousEnd = dateRange(2, range.startDateKST).startDateKST;
  return dateRange(dayCount(range), previousEnd);
}
export const percent = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "—";
export const signed = (value: number, unit: string) =>
  `${value > 0 ? "+" : value < 0 ? "−" : "±"}${formatNumber(Math.abs(value), unit)}`;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export const dayLabel = (dateKST: string) =>
  `${dateKST.slice(5).replace("-", ".")} (${WEEKDAYS[new Date(`${dateKST}T00:00:00Z`).getUTCDay()]})`;

/** 날짜 문자열은 이미 KST 날짜이므로 실행 기기의 시간대와 무관하게 요일을 구합니다. */
export function dayColorClass(dateKST: string) {
  const weekday = new Date(`${dateKST}T00:00:00Z`).getUTCDay();
  return weekday === 0
    ? "dashboard-day-sunday"
    : weekday === 6
      ? "dashboard-day-saturday"
      : undefined;
}
