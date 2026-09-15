import { IMongMoneyGroup } from "@/models/mongMoneys";

export function formatMongAmount(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}몽`;
}

export function formatMongMoneyAdminDescription(
  adminDescription?: string | null,
): string {
  return adminDescription?.trim() || "-";
}

export function getCurrentMongMoneyAmount(groups: IMongMoneyGroup[]): number {
  const latestGroup = groups.reduce<IMongMoneyGroup | undefined>(
    (latest, group) =>
      !latest || group.cursorId > latest.cursorId ? group : latest,
    undefined,
  );

  return latestGroup?.currentTotalAmount ?? 0;
}
