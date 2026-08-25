import {
  GetAllMongMoneyGroupsRequest,
  GetMongMoneyGroupsResponse,
  GetMongMoneysRequest,
  GetMongMoneysResponse,
  PostMongMoneyDepositRequest,
  PostMongMoneyDepositResponse,
  PostMongMoneyWithdrawRequest,
  PostMongMoneyWithdrawResponse,
  mongMoneyAPI,
} from "@/apis/mongMoneys";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
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

export const useGetAllMongMoneyGroupsQuery = (
  params: GetAllMongMoneyGroupsRequest,
  config?: Omit<
    UseQueryOptions<GetMongMoneyGroupsResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<GetMongMoneyGroupsResponse, Error> =>
  useQuery({
    queryKey: [MONG_MONEY_GROUPS_QUERY_KEY, params],
    queryFn: () => mongMoneyAPI.getAllGroups(params),
    ...config,
  });

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
