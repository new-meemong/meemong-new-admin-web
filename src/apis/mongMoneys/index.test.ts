import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetcher } from "@/apis/core";
import { mongMoneyAPI } from "@/apis/mongMoneys";

vi.mock("@/apis/core", () => ({ fetcher: vi.fn() }));
const mockedFetcher = vi.mocked(fetcher);
const page = (cursor: string | null, id = 1) => ({
  dataList: [{ id, paymentAmountKRW: 9900, currentTotalAmount: 100 }],
  dataCount: 1,
  __nextCursor: cursor,
});

beforeEach(() => mockedFetcher.mockReset());
describe("mong history requests", () => {
  it.each(["purchase", "reward", "withdraw"] as const)(
    "requests only one %s page",
    async (type) => {
      mockedFetcher.mockResolvedValue(page("next"));
      const result = await mongMoneyAPI.getGroupsPage({ userId: 10, type });
      expect(mockedFetcher).toHaveBeenCalledExactlyOnceWith(
        "/api/v1/admins/mong-moneys/groups",
        {
          query: { userId: 10, type, __limit: 10 },
        },
      );
      expect(result.__nextCursor).toBe("next");
      expect(result.dataList[0].paymentAmountKRW).toBe(9900);
    },
  );

  it("requests the latest unfiltered group for balance", async () => {
    mockedFetcher.mockResolvedValue(page(null));
    await mongMoneyAPI.getGroupsPage({ userId: 10, __limit: 1 });
    expect(mockedFetcher).toHaveBeenCalledWith(
      "/api/v1/admins/mong-moneys/groups",
      { query: { userId: 10, __limit: 1 } },
    );
  });
});
