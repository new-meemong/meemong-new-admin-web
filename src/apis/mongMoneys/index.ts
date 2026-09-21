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

export type MongMoneyHistoryType = "purchase" | "reward" | "withdraw";

export const MONG_MONEY_GROUP_MAX_LIMIT = 20;

export type GetMongMoneyGroupsPageRequest = {
  __category?: MongMoneyHistoryType;
  userId?: number;
  referTargetType?: "manualDeposit";
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
  __category,
  referTargetType,
  __nextCursor,
  __limit = MONG_MONEY_GROUP_PAGE_LIMIT,
}: GetMongMoneyGroupsPageRequest) =>
  fetcher<GetMongMoneyGroupsResponse>(`${BASE_URL}/groups`, {
    query: {
      ...(userId !== undefined && { userId }),
      ...(__category && { __category }),
      ...(referTargetType && { referTargetType }),
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
  getGroupsPage: getMongMoneyGroupsPage,
};
