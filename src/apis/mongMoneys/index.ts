import { IMongMoney, IMongMoneyGroup } from "@/models/mongMoneys";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/mong-moneys";
export const MONG_MONEY_GROUP_PAGE_LIMIT = 10;

export type MongMoneyManualRequest = {
  userId: number;
  amount: number;
  title: string;
  adminDescription: string;
};

export type PostMongMoneyDepositRequest = MongMoneyManualRequest;
export type PostMongMoneyWithdrawRequest = MongMoneyManualRequest;

export type PostMongMoneyDepositResponse = {
  data: IMongMoney;
};

export type PostMongMoneyWithdrawResponse = {
  data: IMongMoney;
};

export type GetMongMoneysRequest = {
  __limit?: number;
  __cursorOrder?: "idDesc";
  __nextCursor?: string;
};

export type GetMongMoneysResponse = {
  dataCount: number;
  dataList: IMongMoney[];
  __nextCursor: string | null;
};

export type MongMoneyHistoryType = "purchase" | "reward" | "withdraw";

export type GetMongMoneyGroupsPageRequest = {
  type?: MongMoneyHistoryType;
  userId: number;
  __nextCursor?: string;
  __limit?: number;
};

export type GetMongMoneyGroupsResponse = {
  dataList: IMongMoneyGroup[];
  __nextCursor: string | null;
  dataCount: number;
};

const getMongMoneyGroupsPage = ({
  userId,
  type,
  __nextCursor,
  __limit = MONG_MONEY_GROUP_PAGE_LIMIT,
}: GetMongMoneyGroupsPageRequest) =>
  fetcher<GetMongMoneyGroupsResponse>(`${BASE_URL}/groups`, {
    query: {
      userId,
      ...(type && { type }),
      __limit,
      ...(__nextCursor && { __nextCursor }),
    },
  });

export const mongMoneyAPI = {
  deposit: (
    request: PostMongMoneyDepositRequest,
  ): Promise<PostMongMoneyDepositResponse> =>
    fetcher<PostMongMoneyDepositResponse>(`${BASE_URL}/deposit`, {
      method: "POST",
      body: JSON.stringify(request),
    }),
  withdraw: (
    request: PostMongMoneyWithdrawRequest,
  ): Promise<PostMongMoneyWithdrawResponse> =>
    fetcher<PostMongMoneyWithdrawResponse>(`${BASE_URL}/withdraw`, {
      method: "POST",
      body: JSON.stringify(request),
    }),
  getAll: ({
    __limit = 20,
    __cursorOrder = "idDesc",
    __nextCursor,
  }: GetMongMoneysRequest): Promise<GetMongMoneysResponse> =>
    fetcher<GetMongMoneysResponse>(BASE_URL, {
      query: {
        __limit,
        __cursorOrder,
        ...(__nextCursor && { __nextCursor }),
      },
    }),
  getGroupsPage: getMongMoneyGroupsPage,
};
