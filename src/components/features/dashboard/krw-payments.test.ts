import { describe, expect, it } from "vitest";
import type { PaymentStatisticsItem } from "@/apis/dashboards/types";
import {
  dayLabel,
  dayColorClass,
  visibleSinglePaymentCategories,
  singlePaymentItems,
  krwAmountText,
  krwCellText,
  krwRefundCellText,
  krwRefundAmountText,
  krwSummary,
  previousRange,
  productLabel,
  productRows,
} from "./krw-payments";

const item = (
  overrides: Partial<PaymentStatisticsItem>,
): PaymentStatisticsItem => ({
  paymentCategory: "MONG_CHARGE",
  platform: "ios",
  productId: "com.meemong.mong_100",
  purchaseCount: 1,
  knownRefundedCount: 0,
  unknownRefundStatusCount: 0,
  knownTotalPaymentAmountKRW: 9900,
  unknownTotalPaymentCount: 0,
  knownRefundedPaymentAmountKRW: 0,
  unknownRefundedPaymentCount: 0,
  refundedCount: 0,
  totalPaymentAmountKRW: 9900,
  refundedPaymentAmountKRW: 0,
  netPaymentAmountKRW: 9900,
  ...overrides,
});

describe("KRW payment summaries", () => {
  it("separates complete, partial, and fully unknown amounts", () => {
    const complete = krwSummary([
      item({}),
      item({ knownRefundedCount: 1, knownRefundedPaymentAmountKRW: 9900 }),
    ]);
    expect(complete).toMatchObject({
      amountState: "complete",
      knownAmount: 19800,
      netAmount: 9900,
    });
    expect(krwRefundCellText(complete)).toBe("−9,900원 (1건)");
    const partial = krwSummary([
      item({}),
      item({ knownTotalPaymentAmountKRW: 0, unknownTotalPaymentCount: 1 }),
    ]);
    expect(partial.amountState).toBe("partial");
    expect(partial.netAmount).toBeNull();
    expect(krwCellText(partial)).toBe("9,900원 (확인 불가 1건)");
    const unknown = krwSummary([
      item({ knownTotalPaymentAmountKRW: 0, unknownTotalPaymentCount: 1 }),
    ]);
    expect(krwAmountText(unknown)).toBe("확인 불가");
    expect(krwCellText(krwSummary([]))).toBe("—");
  });
  it("does not compute net revenue while a refund status is unknown", () => {
    const summary = krwSummary([item({ unknownRefundStatusCount: 1 })]);
    expect(summary.netAmount).toBeNull();
    expect(krwRefundCellText(summary)).toBe("상태 확인 불가 1건");
  });
  it.each([
    [2, 4500, "4,500원 (확인 불가 1건)", "−4,500원 (2건 · 확인 불가 1건)"],
    [1, 0, "확인 불가 (1건)", "확인 불가 (1건)"],
    [2, 0, "0원 (확인 불가 1건)", "−0원 (2건 · 확인 불가 1건)"],
  ])(
    "distinguishes missing refund amounts from known zero refunds",
    (count, amount, expected, expectedCell) => {
      const summary = krwSummary([
        item({
          knownRefundedCount: count as number,
          knownRefundedPaymentAmountKRW: amount as number,
          unknownRefundedPaymentCount: 1,
        }),
      ]);
      expect(krwRefundAmountText(summary)).toBe(expected);
      expect(krwRefundCellText(summary)).toBe(expectedCell);
      expect(
        krwRefundCellText({ ...summary, unknownRefundStatusCount: 1 }),
      ).toBe(`${expectedCell} · 상태 확인 불가 1건`);
      expect(summary.netAmount).toBeNull();
    },
  );
  it("accepts v3 store payments without refund-status fields", () => {
    expect(
      krwSummary([
        {
          purchaseCount: 2,
          refundedCount: 1,
          knownTotalPaymentAmountKRW: 5800,
          unknownTotalPaymentCount: 0,
          knownRefundedPaymentAmountKRW: 2900,
          unknownRefundedPaymentCount: 0,
        },
      ]),
    ).toMatchObject({ knownRefundedCount: 1, netAmount: 2900 });
  });
});

describe("product rows", () => {
  it("labels store products and keeps missing product IDs as a separate row", () => {
    expect(productLabel({ productId: "com.meemong.mong_100_onboarding" })).toBe(
      "100몽 (온보딩)",
    );
    expect(
      productLabel({ productId: "com.meemong.ad_block_model_3month" }),
    ).toBe("미몽패스 3개월");
    expect(
      productLabel({
        productId: "com.meemong.view_deep_v3_hair_consultation_answers3",
      }),
    ).toBe("심층상담 답변 3건 모두 열기");
    expect(productLabel({ productId: null })).toBe("상품 미확인");
    expect(productLabel({ productId: null, category: "THUNDER" })).toBe(
      "빠른매칭 (상품 ID 미제공)",
    );
    for (const [id, label] of [
      ["designer_month", "디자이너 광고 제거 1개월"],
      ["designer_week", "디자이너 광고 제거 1주"],
      ["model_week", "고객 광고 제거 1주"],
    ])
      expect(productLabel({ productId: `com.meemong.ad_block_${id}` })).toBe(
        label,
      );
    expect(productLabel({ productId: "x.unknown" })).toBe("x.unknown");
    const days = [
      {
        dateKST: "2026-11-01",
        itemList: [
          item({}),
          item({
            productId: null,
            paymentCategory: "V3_HAIR_CONSULTATION",
            knownTotalPaymentAmountKRW: 12000,
          }),
        ],
      },
      {
        dateKST: "2026-11-02",
        itemList: [item({}), item({ platform: "android" })],
      },
    ].map((day) => ({ ...day, totals: item({}) }));
    const rows = productRows(days);
    expect(
      rows.map((row) => [
        row.productId,
        row.platform,
        row.summary.purchaseCount,
      ]),
    ).toEqual([
      ["com.meemong.mong_100", "ios", 2],
      [null, "ios", 1],
      ["com.meemong.mong_100", "android", 1],
    ]);
  });
  it("compares against the same-length period just before the selection", () => {
    expect(
      previousRange({ startDateKST: "2026-11-07", endDateKST: "2026-11-13" }),
    ).toEqual({
      startDateKST: "2026-10-31",
      endDateKST: "2026-11-06",
    });
    expect(dayLabel("2026-11-13")).toBe("11.13 (금)");
  });
});

describe("payment category visibility and calendar colors", () => {
  it("hides empty historical categories but preserves unknown and refunded payments", () => {
    const day = (row: PaymentStatisticsItem) => [
      { dateKST: "2026-11-15", totals: row, itemList: [row] },
    ];
    const empty = item({
      paymentCategory: "THUNDER",
      purchaseCount: 0,
      knownTotalPaymentAmountKRW: 0,
    });
    expect(visibleSinglePaymentCategories(day(empty))).toEqual([
      "MEEMONG_PASS",
      "V3_HAIR_CONSULTATION",
    ]);
    for (const row of [
      item({ paymentCategory: "THUNDER" }),
      { ...empty, purchaseCount: 1, unknownTotalPaymentCount: 1 },
      { ...empty, knownRefundedCount: 1, knownRefundedPaymentAmountKRW: 9900 },
    ]) {
      expect(visibleSinglePaymentCategories(day(row))).toContain("THUNDER");
      expect(singlePaymentItems(day(row))).toEqual([row]);
    }
    expect(dayColorClass("2026-11-15")).toBe("dashboard-day-sunday");
    expect(dayColorClass("2026-11-14")).toBe("dashboard-day-saturday");
    expect(dayColorClass("2026-11-13")).toBeUndefined();
  });
});
