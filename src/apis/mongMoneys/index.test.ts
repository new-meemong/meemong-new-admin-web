import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetcher } from "@/apis/core";
import { mongMoneyAPI } from "@/apis/mongMoneys";
import { IMongMoneyGroup } from "@/models/mongMoneys";

vi.mock("@/apis/core", () => ({
  fetcher: vi.fn(),
}));

const mockedFetcher = vi.mocked(fetcher);

function createMongMoneyGroup(id: number): IMongMoneyGroup {
  return {
    id,
    cursorId: id,
    userId: 711500001,
    createdAt: "2026-08-25T00:00:00.000Z",
    amount: 50,
    depositTotalSum: 50,
    withdrawTotalSum: 0,
    currentTotalAmount: 50,
    type: "deposit",
    title: "이벤트 지급",
    referTargetType: "RewardHistories",
    referTargetId: 20,
    mongMoneyItems: [],
  };
}

describe("mongMoneyAPI.getAllGroups", () => {
  beforeEach(() => {
    mockedFetcher.mockReset();
  });

  it("loads every cursor page without a transaction type filter", async () => {
    mockedFetcher
      .mockResolvedValueOnce({
        dataList: [createMongMoneyGroup(3)],
        dataCount: 1,
        __nextCursor: "cursor-2",
      })
      .mockResolvedValueOnce({
        dataList: [createMongMoneyGroup(2)],
        dataCount: 1,
        __nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        dataList: [createMongMoneyGroup(1)],
        dataCount: 1,
        __nextCursor: null,
      });

    const result = await mongMoneyAPI.getAllGroups({ userId: 711500001 });

    expect(result.dataList.map(({ id }) => id)).toEqual([3, 2, 1]);
    expect(result.dataCount).toBe(3);
    expect(result.__nextCursor).toBeNull();
    expect(mockedFetcher).toHaveBeenCalledTimes(3);
    expect(mockedFetcher).toHaveBeenNthCalledWith(
      1,
      "/api/v1/admins/mong-moneys/groups",
      {
        query: { userId: 711500001, __limit: 20 },
      },
    );
    expect(mockedFetcher).toHaveBeenNthCalledWith(
      2,
      "/api/v1/admins/mong-moneys/groups",
      {
        query: {
          userId: 711500001,
          __limit: 20,
          __nextCursor: "cursor-2",
        },
      },
    );
  });

  it("stops with an error if the server repeats a cursor", async () => {
    mockedFetcher
      .mockResolvedValueOnce({
        dataList: [createMongMoneyGroup(2)],
        dataCount: 1,
        __nextCursor: "repeated-cursor",
      })
      .mockResolvedValueOnce({
        dataList: [createMongMoneyGroup(1)],
        dataCount: 1,
        __nextCursor: "repeated-cursor",
      });

    await expect(
      mongMoneyAPI.getAllGroups({ userId: 711500001 }),
    ).rejects.toThrow("동일한 커서가 반복되었습니다");
    expect(mockedFetcher).toHaveBeenCalledTimes(2);
  });
});
