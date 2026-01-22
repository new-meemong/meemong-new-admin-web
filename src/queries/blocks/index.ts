import {
  GetUserBlockHistoriesRequest,
  GetUserBlockHistoriesResponse,
  GetUserBlockStatusRequest,
  GetUserBlockStatusResponse,
  PostUserBlockRequest,
  PostUserBlockResponse,
  PostUserUnblockRequest,
  PostUserUnblockResponse,
  blocksAPI,
} from "@/apis/blocks";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const usePostUserBlockMutation = (
  config?: Omit<
    UseMutationOptions<PostUserBlockResponse, Error, PostUserBlockRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostUserBlockResponse, Error, PostUserBlockRequest> =>
  useMutation({
    mutationFn: (request: PostUserBlockRequest) => blocksAPI.create(request),
    ...config,
  });

export const usePostUserUnblockMutation = (
  config?: Omit<
    UseMutationOptions<PostUserUnblockResponse, Error, PostUserUnblockRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostUserUnblockResponse, Error, PostUserUnblockRequest> =>
  useMutation({
    mutationFn: (request: PostUserUnblockRequest) =>
      blocksAPI.unblock(request),
    ...config,
  });

export const useGetUserBlockStatusQuery = (
  params: GetUserBlockStatusRequest,
  config?: Omit<
    UseQueryOptions<GetUserBlockStatusResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<GetUserBlockStatusResponse, Error> =>
  useQuery<GetUserBlockStatusResponse, Error>({
    queryKey: ["GET_USER_BLOCK_STATUS", params.userId],
    queryFn: () => blocksAPI.getStatus(params),
    enabled: Boolean(params.userId),
    ...config,
  });

export const useGetUserBlockHistoriesQuery = (
  params: GetUserBlockHistoriesRequest,
  config?: Omit<
    UseQueryOptions<GetUserBlockHistoriesResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<GetUserBlockHistoriesResponse, Error> =>
  useQuery<GetUserBlockHistoriesResponse, Error>({
    queryKey: ["GET_USER_BLOCK_HISTORIES", params],
    queryFn: () => blocksAPI.getHistories(params),
    enabled: Boolean(params.userId),
    ...config,
  });
