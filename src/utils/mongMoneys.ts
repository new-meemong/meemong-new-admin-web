import { IMongMoneyGroup } from "@/models/mongMoneys";

export type MongMoneyDepositTypeLabel = "결제" | "이벤트" | "-";

export function formatMongAmount(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}몽`;
}

export function getCurrentMongMoneyAmount(groups: IMongMoneyGroup[]): number {
  const latestGroup = groups.reduce<IMongMoneyGroup | undefined>(
    (latest, group) =>
      !latest || group.cursorId > latest.cursorId ? group : latest,
    undefined,
  );

  return latestGroup?.currentTotalAmount ?? 0;
}

export function getMongMoneyDepositTypeLabel(
  group: IMongMoneyGroup,
): MongMoneyDepositTypeLabel {
  if (group.mongMoneyItems.some((item) => item.mongType === "default")) {
    return "결제";
  }

  if (group.mongMoneyItems.some((item) => item.mongType === "event")) {
    return "이벤트";
  }

  return "-";
}

export function getKnownMongMoneyPaymentAmount(
  group: IMongMoneyGroup,
): number | null {
  // 그룹 API에는 결제 원화 금액이 없어 이벤트 지급만 0원으로 확정할 수 있다.
  return getMongMoneyDepositTypeLabel(group) === "이벤트" ? 0 : null;
}
