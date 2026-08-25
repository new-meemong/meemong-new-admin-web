import { IMongMoney, IMongMoneyGroup } from "@/models/mongMoneys";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/mong-moneys";
const MONG_MONEY_GROUP_PAGE_LIMIT = 20;

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

type GetMongMoneyGroupsPageRequest = {
  userId: number;
  __nextCursor?: string;
  __limit?: number;
};

export type GetAllMongMoneyGroupsRequest = {
  userId: number;
};

export type GetMongMoneyGroupsResponse = {
  dataList: IMongMoneyGroup[];
  __nextCursor: string | null;
  dataCount: number;
};

const getMongMoneyGroupsPage = ({
  userId,
  __nextCursor,
  __limit = MONG_MONEY_GROUP_PAGE_LIMIT,
}: GetMongMoneyGroupsPageRequest) =>
  fetcher<GetMongMoneyGroupsResponse>(`${BASE_URL}/groups`, {
    query: {
      userId,
      __limit,
      ...(__nextCursor && { __nextCursor }),
    },
  });

async function getAllMongMoneyGroups({
  userId,
}: GetAllMongMoneyGroupsRequest): Promise<GetMongMoneyGroupsResponse> {
  const dataList: IMongMoneyGroup[] = [];
  const seenCursors = new Set<string>();
  let nextCursor: string | undefined;

  do {
    const response = await getMongMoneyGroupsPage({
      userId,
      __nextCursor: nextCursor,
    });

    dataList.push(...response.dataList);

    if (!response.__nextCursor) break;

    if (seenCursors.has(response.__nextCursor)) {
      throw new Error("몽 이용 내역 조회 중 동일한 커서가 반복되었습니다.");
    }

    seenCursors.add(response.__nextCursor);
    nextCursor = response.__nextCursor;
  } while (nextCursor);

  return {
    dataList,
    dataCount: dataList.length,
    __nextCursor: null,
  };
}

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
  getAllGroups: getAllMongMoneyGroups,
};
