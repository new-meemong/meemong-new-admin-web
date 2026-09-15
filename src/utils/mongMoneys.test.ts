import { describe, expect, it } from "vitest";

import { IMongMoneyGroup } from "@/models/mongMoneys";
import {
  formatMongAmount,
  formatMongMoneyAdminDescription,
  getCurrentMongMoneyAmount,
} from "@/utils/mongMoneys";

function createMongMoneyGroup(
  overrides: Partial<IMongMoneyGroup> = {},
): IMongMoneyGroup {
  return {
    id: 1,
    cursorId: 1,
    userId: 10,
    createdAt: "2026-08-25T00:00:00.000Z",
    amount: 50,
    paymentAmountKRW: null,
    depositTotalSum: 50,
    withdrawTotalSum: 0,
    currentTotalAmount: 50,
    type: "deposit",
    title: "이벤트 지급",
    referTargetType: "RewardHistories",
    referTargetId: 20,
    mongMoneyItems: [
      {
        id: 1,
        mongType: "event",
        depositSum: 50,
        withdrawSum: 0,
        currentAmount: 50,
        amount: 50,
      },
    ],
    ...overrides,
  };
}

describe("mong money history formatting", () => {
  it("formats mong amounts with a unit", () => {
    expect(formatMongAmount(3200)).toBe("3,200몽");
    expect(formatMongAmount(0)).toBe("0몽");
  });

  it("formats an admin deposit memo and falls back for empty values", () => {
    expect(
      formatMongMoneyAdminDescription("  [처리자: 김관리] 지급 누락  "),
    ).toBe("[처리자: 김관리] 지급 누락");
    expect(formatMongMoneyAdminDescription("   ")).toBe("-");
    expect(formatMongMoneyAdminDescription(null)).toBe("-");
    expect(formatMongMoneyAdminDescription()).toBe("-");
  });

  it("gets the current amount from the group with the latest cursor", () => {
    const groups = [
      createMongMoneyGroup({ cursorId: 10, currentTotalAmount: 100 }),
      createMongMoneyGroup({ cursorId: 30, currentTotalAmount: 300 }),
      createMongMoneyGroup({ cursorId: 20, currentTotalAmount: 200 }),
    ];

    expect(getCurrentMongMoneyAmount(groups)).toBe(300);
    expect(getCurrentMongMoneyAmount([])).toBe(0);
  });
});
