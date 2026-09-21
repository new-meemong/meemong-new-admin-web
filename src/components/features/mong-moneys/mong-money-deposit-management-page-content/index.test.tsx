import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetcher } from "@/apis/core";
import { MONG_MONEY_GROUP_MAX_LIMIT } from "@/apis/mongMoneys";
import { mongMoneyManualDepositsQueryOptions } from "@/queries/mongMoneys";
import { IMongMoneyGroup } from "@/models/mongMoneys";
import MongMoneyDepositManagementPageContent from "./index";

vi.mock("@/apis/core", () => ({ fetcher: vi.fn() }));
vi.mock("@/components/features/user/user-right-drawer", () => ({
  default: () => null,
}));

beforeEach(() => vi.mocked(fetcher).mockReset());

describe("mong deposit management requests", () => {
  it("renders 20 distinct user IDs without querying user details", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const group: IMongMoneyGroup = {
      id: 1,
      cursorId: 1,
      userId: 10,
      createdAt: "2026-08-31T06:45:31.000Z",
      amount: 20,
      paymentAmountKRW: 0,
      depositTotalSum: 20,
      withdrawTotalSum: 0,
      currentTotalAmount: 20,
      type: "deposit",
      title: "관리자 몽 지급",
      referTargetType: "manualDeposit",
      referTargetId: null,
      mongMoneyItems: [],
    };
    client.setQueryData(
      mongMoneyManualDepositsQueryOptions({
        __limit: MONG_MONEY_GROUP_MAX_LIMIT,
      }).queryKey,
      {
        dataList: Array.from(
          { length: MONG_MONEY_GROUP_MAX_LIMIT },
          (_, index) => ({
            ...group,
            id: index + 1,
            userId: 1000 + index,
          }),
        ),
        dataCount: MONG_MONEY_GROUP_MAX_LIMIT,
        __nextCursor: null,
      },
    );
    const render = () =>
      renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <MongMoneyDepositManagementPageContent />
        </QueryClientProvider>,
      );
    try {
      const html = render();
      expect(html).toContain("유저 아이디");
      expect(html).not.toContain("가입유형");
      for (let index = 0; index < MONG_MONEY_GROUP_MAX_LIMIT; index++) {
        expect(html).toContain(`>${1000 + index}</button>`);
      }
      const userQueries = client
        .getQueryCache()
        .findAll({ queryKey: ["GET_USER_DETAIL"] });
      expect(userQueries).toHaveLength(0);
      expect(fetcher).not.toHaveBeenCalled();
    } finally {
      client.clear();
    }
  });

  it("requests manual deposits within the server's 20-item limit", async () => {
    expect(MONG_MONEY_GROUP_MAX_LIMIT).toBe(20);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.mocked(fetcher).mockResolvedValue({
      dataList: [],
      dataCount: 0,
      __nextCursor: null,
    });
    try {
      renderToStaticMarkup(
        <QueryClientProvider client={client}>
          <MongMoneyDepositManagementPageContent />
        </QueryClientProvider>,
      );
      const queries = client.getQueryCache().getAll();
      expect(queries).toHaveLength(1);
      await queries[0].fetch();
      expect(fetcher).toHaveBeenCalledExactlyOnceWith(
        "/api/v1/admins/mong-moneys/groups",
        {
          query: {
            referTargetType: "manualDeposit",
            __limit: MONG_MONEY_GROUP_MAX_LIMIT,
          },
        },
      );
    } finally {
      client.clear();
    }
  });
});
