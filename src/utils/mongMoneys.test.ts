import { describe, expect, it } from "vitest";

import { IMongMoneyGroup } from "@/models/mongMoneys";
import {
  formatMongAmount,
  getCurrentMongMoneyAmount,
  getKnownMongMoneyPaymentAmount,
  getMongMoneyDepositTypeLabel,
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

  it("gets the current amount from the group with the latest cursor", () => {
    const groups = [
      createMongMoneyGroup({ cursorId: 10, currentTotalAmount: 100 }),
      createMongMoneyGroup({ cursorId: 30, currentTotalAmount: 300 }),
      createMongMoneyGroup({ cursorId: 20, currentTotalAmount: 200 }),
    ];

    expect(getCurrentMongMoneyAmount(groups)).toBe(300);
    expect(getCurrentMongMoneyAmount([])).toBe(0);
  });

  it("labels default mong deposits as payments", () => {
    const group = createMongMoneyGroup({
      mongMoneyItems: [
        {
          id: 1,
          mongType: "default",
          depositSum: 3200,
          withdrawSum: 0,
          currentAmount: 3200,
          amount: 3200,
        },
      ],
    });

    expect(getMongMoneyDepositTypeLabel(group)).toBe("결제");
    expect(getKnownMongMoneyPaymentAmount(group)).toBeNull();
  });

  it("labels event deposits and exposes their zero payment amount", () => {
    const group = createMongMoneyGroup();

    expect(getMongMoneyDepositTypeLabel(group)).toBe("이벤트");
    expect(getKnownMongMoneyPaymentAmount(group)).toBe(0);
  });

  it("prefers payment when a group contains default and event mong", () => {
    const eventItem = createMongMoneyGroup().mongMoneyItems[0];
    const group = createMongMoneyGroup({
      mongMoneyItems: [eventItem, { ...eventItem, id: 2, mongType: "default" }],
    });

    expect(getMongMoneyDepositTypeLabel(group)).toBe("결제");
  });
});
