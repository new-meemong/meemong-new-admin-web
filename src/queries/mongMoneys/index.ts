import {
  MongMoneyHistoryType,
  MONG_MONEY_GROUP_PAGE_LIMIT,
  GetMongMoneysRequest,
  GetMongMoneysResponse,
  PostMongMoneyDepositRequest,
  PostMongMoneyDepositResponse,
  PostMongMoneyWithdrawRequest,
  PostMongMoneyWithdrawResponse,
  mongMoneyAPI,
} from "@/apis/mongMoneys";
import {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useInfiniteQuery,
  infiniteQueryOptions,
} from "@tanstack/react-query";

export const MONG_MONEY_GROUPS_QUERY_KEY = "GET_MONG_MONEY_GROUPS";
export const MONG_MONEYS_QUERY_KEY = "GET_MONG_MONEYS";

export const useGetMongMoneysQuery = (
  params: GetMongMoneysRequest,
  config?: Omit<
    UseQueryOptions<GetMongMoneysResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<GetMongMoneysResponse, Error> =>
  useQuery({
    queryKey: [MONG_MONEYS_QUERY_KEY, params],
    queryFn: () => mongMoneyAPI.getAll(params),
    ...config,
  });

export const mongMoneyHistoryQueryOptions = (params: {
  userId: number;
  type: MongMoneyHistoryType;
}) =>
  infiniteQueryOptions({
    queryKey: [
      MONG_MONEY_GROUPS_QUERY_KEY,
      params.userId,
      "history",
      params.type,
    ],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      mongMoneyAPI.getGroupsPage({
        ...params,
        __limit: MONG_MONEY_GROUP_PAGE_LIMIT,
        __nextCursor: pageParam,
      }),
    getNextPageParam: (lastPage, _pages, _lastParam, pageParams) => {
      const cursor = lastPage.__nextCursor;
      return lastPage.dataList.length && cursor && !pageParams.includes(cursor)
        ? cursor
        : undefined;
    },
    staleTime: 60_000,
  });

export const useMongMoneyHistoryQuery = (params: {
  userId: number;
  type: MongMoneyHistoryType;
}) => useInfiniteQuery(mongMoneyHistoryQueryOptions(params));

export const useMongMoneyBalanceQuery = (userId: number) =>
  useQuery({
    queryKey: [MONG_MONEY_GROUPS_QUERY_KEY, userId, "balance"],
    queryFn: () => mongMoneyAPI.getGroupsPage({ userId, __limit: 1 }),
  });

// 지급 후 커서가 바뀌므로 전체 페이지를 초기화하고 보상 탭 첫 페이지를 캐시에 선반영합니다.
export const refreshUserMongMoneyAfterDeposit = async (
  queryClient: QueryClient,
  userId: number,
) => {
  // resetQueries는 전환 전 활성 탭도 재조회하므로 초기화와 조회를 분리합니다.
  queryClient
    .getQueryCache()
    .findAll({
      queryKey: [MONG_MONEY_GROUPS_QUERY_KEY, userId],
    })
    .forEach((query) => query.reset());
  await Promise.all([
    queryClient
      .fetchInfiniteQuery(
        mongMoneyHistoryQueryOptions({ userId, type: "reward" }),
      )
      .catch(() => {
        // 지급은 성공했으므로 조회 실패는 내역 화면의 재시도로 처리합니다.
      }),
    queryClient.refetchQueries({
      queryKey: [MONG_MONEY_GROUPS_QUERY_KEY, userId, "balance"],
      type: "active",
    }),
    queryClient.invalidateQueries({ queryKey: [MONG_MONEYS_QUERY_KEY] }),
  ]);
};

export const usePostMongMoneyDepositMutation = (
  config?: Omit<
    UseMutationOptions<
      PostMongMoneyDepositResponse,
      Error,
      PostMongMoneyDepositRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PostMongMoneyDepositResponse,
  Error,
  PostMongMoneyDepositRequest
> =>
  useMutation({
    mutationFn: (request: PostMongMoneyDepositRequest) =>
      mongMoneyAPI.deposit(request),
    ...config,
  });

export const usePostMongMoneyWithdrawMutation = (
  config?: Omit<
    UseMutationOptions<
      PostMongMoneyWithdrawResponse,
      Error,
      PostMongMoneyWithdrawRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PostMongMoneyWithdrawResponse,
  Error,
  PostMongMoneyWithdrawRequest
> =>
  useMutation({
    mutationFn: (request: PostMongMoneyWithdrawRequest) =>
      mongMoneyAPI.withdraw(request),
    ...config,
  });
