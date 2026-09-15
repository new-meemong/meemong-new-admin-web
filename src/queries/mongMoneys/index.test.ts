import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetcher } from "@/apis/core";
import { InfiniteQueryObserver, QueryClient } from "@tanstack/react-query";
import {
  mongMoneyHistoryQueryOptions,
  refreshUserMongMoneyAfterDeposit,
  MONG_MONEY_GROUPS_QUERY_KEY,
} from "@/queries/mongMoneys";
vi.mock("@/apis/core", () => ({ fetcher: vi.fn() }));
const mockedFetcher = vi.mocked(fetcher);
const page = (cursor: string | null, id = 1) => ({
  dataList: [{ id, paymentAmountKRW: 9900, currentTotalAmount: 100 }],
  dataCount: 1,
  __nextCursor: cursor,
});
beforeEach(() => mockedFetcher.mockReset());
describe("mong history query behavior", () => {
  it("loads on demand, preserves rows after failure and ends on an empty page", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const observer = new InfiniteQueryObserver(
      client,
      mongMoneyHistoryQueryOptions({ userId: 10, type: "reward" }),
    );
    mockedFetcher.mockResolvedValueOnce(page("next"));
    await observer.refetch();
    expect(mockedFetcher).toHaveBeenCalledTimes(1);
    mockedFetcher.mockRejectedValueOnce(new Error("network"));
    await observer.fetchNextPage();
    expect(observer.getCurrentResult().data?.pages[0].dataList[0].id).toBe(1);
    expect(observer.getCurrentResult().isFetchNextPageError).toBe(true);
    mockedFetcher.mockResolvedValueOnce({
      dataList: [],
      dataCount: 0,
      __nextCursor: null,
    });
    await observer.fetchNextPage();
    expect(mockedFetcher).toHaveBeenLastCalledWith(
      "/api/v1/admins/mong-moneys/groups",
      {
        query: {
          userId: 10,
          type: "reward",
          __limit: 10,
          __nextCursor: "next",
        },
      },
    );
    expect(observer.getCurrentResult().hasNextPage).toBe(false);
    client.clear();
  });

  it("isolates users and types and stops repeated cursors", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const options = mongMoneyHistoryQueryOptions({
      userId: 10,
      type: "purchase",
    });
    const observer = new InfiniteQueryObserver(client, options);
    mockedFetcher.mockResolvedValue(page("same"));
    await observer.refetch();
    await observer.fetchNextPage();
    expect(observer.getCurrentResult().hasNextPage).toBe(false);
    expect(
      client.getQueryData(
        mongMoneyHistoryQueryOptions({ userId: 10, type: "reward" }).queryKey,
      ),
    ).toBeUndefined();
    expect(
      client.getQueryData(
        mongMoneyHistoryQueryOptions({ userId: 11, type: "purchase" }).queryKey,
      ),
    ).toBeUndefined();
    client.clear();
  });
  it("resets expanded pages after deposit and refetches only the first active page", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const options = mongMoneyHistoryQueryOptions({
      userId: 10,
      type: "reward",
    });
    const observer = new InfiniteQueryObserver(client, options);
    mockedFetcher
      .mockResolvedValueOnce(page("older", 2))
      .mockResolvedValueOnce(page(null, 1));
    await observer.refetch();
    await observer.fetchNextPage();
    const unsubscribe = observer.subscribe(() => {});
    const otherOptions = mongMoneyHistoryQueryOptions({
      userId: 11,
      type: "reward",
    });
    client.setQueryData(
      otherOptions.queryKey,
      observer.getCurrentResult().data,
    );
    const purchaseOptions = mongMoneyHistoryQueryOptions({
      userId: 10,
      type: "purchase",
    });
    client.setQueryData(
      purchaseOptions.queryKey,
      observer.getCurrentResult().data,
    );
    const balanceKey = [MONG_MONEY_GROUPS_QUERY_KEY, 10, "balance"];
    client.setQueryData(balanceKey, { currentTotalAmount: 100 });
    mockedFetcher.mockClear();
    mockedFetcher.mockResolvedValueOnce(page("new-cursor", 3));
    await refreshUserMongMoneyAfterDeposit(client, 10);
    expect(mockedFetcher).toHaveBeenCalledExactlyOnceWith(
      "/api/v1/admins/mong-moneys/groups",
      {
        query: { userId: 10, type: "reward", __limit: 10 },
      },
    );
    expect(observer.getCurrentResult().data?.pages).toHaveLength(1);
    expect(observer.getCurrentResult().data?.pages[0].dataList[0].id).toBe(3);
    expect(client.getQueryData(purchaseOptions.queryKey)).toBeUndefined();
    expect(client.getQueryData(balanceKey)).toBeUndefined();
    expect(client.getQueryData(otherOptions.queryKey)).toEqual(
      expect.objectContaining({ pages: expect.any(Array) }),
    );
    unsubscribe();
    client.clear();
  });
  it.each(["purchase", "withdraw"] as const)(
    "does not refetch %s while switching to reward after deposit",
    async (type) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const observer = new InfiniteQueryObserver(
        client,
        mongMoneyHistoryQueryOptions({ userId: 10, type }),
      );
      mockedFetcher.mockResolvedValueOnce(page(null));
      await observer.refetch();
      const unsubscribe = observer.subscribe(() => {});
      mockedFetcher.mockClear();
      let resolveReward!: (value: ReturnType<typeof page>) => void;
      mockedFetcher.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveReward = resolve;
          }),
      );
      const refresh = refreshUserMongMoneyAfterDeposit(client, 10);
      // React의 렌더가 늦어져 이전 탭이 아직 활성 상태여도 보상만 요청해야 합니다.
      expect(mockedFetcher).toHaveBeenCalledExactlyOnceWith(
        "/api/v1/admins/mong-moneys/groups",
        { query: { userId: 10, type: "reward", __limit: 10 } },
      );
      observer.setOptions(
        mongMoneyHistoryQueryOptions({ userId: 10, type: "reward" }),
      );
      expect(mockedFetcher).toHaveBeenCalledTimes(1);
      resolveReward(page(null, 3));
      await refresh;
      expect(observer.getCurrentResult().data?.pages[0].dataList[0].id).toBe(3);
      unsubscribe();
      client.clear();
    },
  );
});
