import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetcher } from "@/apis/core";
import {
  InfiniteQueryObserver,
  QueryClient,
  QueryObserver,
} from "@tanstack/react-query";
import { MONG_MONEY_GROUP_MAX_LIMIT } from "@/apis/mongMoneys";
import {
  mongMoneyHistoryQueryOptions,
  refreshUserMongMoneyAfterDeposit,
  MONG_MONEY_GROUPS_QUERY_KEY,
  mongMoneyManualDepositsQueryOptions,
} from "@/queries/mongMoneys";
vi.mock("@/apis/core", () => ({ fetcher: vi.fn() }));
const mockedFetcher = vi.mocked(fetcher);
const page = (cursor: string | null, id = 1) => ({
  dataList: [{ id, paymentAmountKRW: 9900, currentTotalAmount: 100 }],
  dataCount: 1,
  __nextCursor: cursor,
});
beforeEach(() => mockedFetcher.mockReset());
describe("manual mong deposits query behavior", () => {
  it("keeps the previous page visible until the next cursor resolves", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const observer = new QueryObserver(
      client,
      mongMoneyManualDepositsQueryOptions({
        __limit: MONG_MONEY_GROUP_MAX_LIMIT,
      }),
    );
    mockedFetcher.mockResolvedValueOnce(page("older", 2));
    const unsubscribe = observer.subscribe(() => {});
    try {
      await observer.refetch();
      let resolveNext!: (value: ReturnType<typeof page>) => void;
      mockedFetcher.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNext = resolve;
          }),
      );
      observer.setOptions(
        mongMoneyManualDepositsQueryOptions({
          __limit: MONG_MONEY_GROUP_MAX_LIMIT,
          __nextCursor: "older",
        }),
      );
      expect(observer.getCurrentResult()).toMatchObject({
        isLoading: false,
        isFetching: true,
        isPlaceholderData: true,
        data: { dataList: [{ id: 2 }] },
      });
      resolveNext(page(null, 1));
      await observer.refetch({ cancelRefetch: false });
      expect(observer.getCurrentResult()).toMatchObject({
        isPlaceholderData: false,
        data: { dataList: [{ id: 1 }], __nextCursor: null },
      });
    } finally {
      unsubscribe();
      client.clear();
    }
  });

  it("requests server-filtered groups across users and preserves page cursors", async () => {
    const client = new QueryClient();
    mockedFetcher.mockResolvedValueOnce(page("older", 2));
    const firstOptions = mongMoneyManualDepositsQueryOptions({
      __limit: MONG_MONEY_GROUP_MAX_LIMIT,
    });
    const first = await client.fetchQuery(firstOptions);
    expect(mockedFetcher).toHaveBeenLastCalledWith(
      "/api/v1/admins/mong-moneys/groups",
      {
        query: {
          referTargetType: "manualDeposit",
          __limit: MONG_MONEY_GROUP_MAX_LIMIT,
        },
      },
    );
    mockedFetcher.mockResolvedValueOnce(page(null, 1));
    const next = await client.fetchQuery(
      mongMoneyManualDepositsQueryOptions({
        __limit: MONG_MONEY_GROUP_MAX_LIMIT,
        __nextCursor: first.__nextCursor!,
      }),
    );
    expect(mockedFetcher).toHaveBeenLastCalledWith(
      "/api/v1/admins/mong-moneys/groups",
      {
        query: {
          referTargetType: "manualDeposit",
          __limit: MONG_MONEY_GROUP_MAX_LIMIT,
          __nextCursor: "older",
        },
      },
    );
    expect(next.dataList[0].id).toBe(1);
    expect(client.getQueryData(firstOptions.queryKey)).toEqual(first);
    mockedFetcher.mockResolvedValueOnce(page(null, 3));
    await refreshUserMongMoneyAfterDeposit(client, 10);
    expect(client.getQueryState(firstOptions.queryKey)?.isInvalidated).toBe(
      true,
    );
    client.clear();
  });
});
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
          __category: "reward",
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
        query: { userId: 10, __category: "reward", __limit: 10 },
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
        { query: { userId: 10, __category: "reward", __limit: 10 } },
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
