import { fetcher } from "@/apis/core";
import type { DashboardDateRange } from "./types";

export type WithdrawalRecord = {
  id: number;
  role: number | null;
  joinedAt: string | null;
  withdrawAt: string | null;
};
const DAY_MS = 86400000;
const PAGE_LIMIT = 1000;

/** 기존 API는 기록 생성일 기준이며, 종료 시각 미포함·최대 1,000건입니다. */
export async function getWithdrawalRecords(
  range: DashboardDateRange,
  signal?: AbortSignal,
): Promise<WithdrawalRecord[]> {
  const start = Date.parse(`${range.startDateKST}T00:00:00Z`);
  const end = Date.parse(`${range.endDateKST}T00:00:00Z`) + DAY_MS;
  const timestamp = (value: number) =>
    `${new Date(value).toISOString().slice(0, 10)} 00:00:00`;
  async function getPeriod(
    from: number,
    to: number,
  ): Promise<WithdrawalRecord[]> {
    const response = await fetcher<{ dataList: WithdrawalRecord[] }>(
      "/api/v1/un-auth/users/withdraw-statistics",
      {
        query: { startDateKST: timestamp(from), endDateKST: timestamp(to) },
        signal,
      },
    );
    if (response.dataList.length < PAGE_LIMIT) {
      return response.dataList.map(({ id, role, joinedAt, withdrawAt }) => ({
        id,
        role,
        joinedAt,
        withdrawAt,
      }));
    }
    const days = (to - from) / DAY_MS;
    if (days <= 1)
      throw new Error(
        "하루 탈퇴 상세가 1,000건 이상이라 전체 평균을 계산할 수 없습니다.",
      );
    const middle = from + Math.floor(days / 2) * DAY_MS;
    // 분할 조회는 순서대로 실행해 서버에 동시 요청이 몰리지 않게 합니다.
    return [
      ...(await getPeriod(from, middle)),
      ...(await getPeriod(middle, to)),
    ];
  }
  return getPeriod(start, end);
}
