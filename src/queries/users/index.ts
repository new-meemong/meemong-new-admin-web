import {
  GetUserBlockListResponse,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserBlockRequest,
  UpdateUserBlockResponse,
  UpdateUserDescriptionRequest,
  UpdateUserDescriptionResponse,
  UpdateUserPayModelRequest,
  UpdateUserPayModelResponse,
  userAPI
} from "@/apis/user";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import { IUserForm } from "@/models/users";

export const useGetUsersQuery = (
  params: GetUsersRequest,
  config?: Omit<
    UseQueryOptions<GetUsersResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetUsersResponse, Error> =>
  useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => userAPI.getAll(params),
    ...config
  });

export const useGetUserDetailQuery = (
  userId?: number,
  config?: Omit<UseQueryOptions<IUserForm, Error>, "queryFn" | "queryKey">
): UseQueryResult<IUserForm, Error> =>
  useQuery<IUserForm, Error>({
    queryKey: ["GET_USER_DETAIL", userId],
    queryFn: () => userAPI.getById(userId),
    enabled: Boolean(userId),
    ...config
  });

export const useGetUserBlockListQuery = (
  userId: number,
  config?: UseQueryOptions<GetUserBlockListResponse, Error>
): UseQueryResult<GetUserBlockListResponse, Error> =>
  useQuery<GetUserBlockListResponse, Error>({
    queryKey: ["GET_USER_BLOCK_LIST", userId],
    queryFn: () => userAPI.getUserBlockList(userId),
    ...config
  });

export const useUpdateUserBlockMutation = (
  config?: Omit<
    UseMutationOptions<UpdateUserBlockResponse, Error, UpdateUserBlockRequest>,
    "mutationFn"
  >
): UseMutationResult<UpdateUserBlockResponse, Error, UpdateUserBlockRequest> =>
  useMutation({
    mutationFn: (request) => userAPI.updateBlock(request),
    ...config
  });

export const useUpdateUserDescriptionMutation = (
  config?: Omit<
    UseMutationOptions<
      UpdateUserDescriptionResponse,
      Error,
      UpdateUserDescriptionRequest
    >,
    "mutationFn"
  >
): UseMutationResult<
  UpdateUserDescriptionResponse,
  Error,
  UpdateUserDescriptionRequest
> =>
  useMutation({
    mutationFn: (request) => userAPI.updateDescription(request),
    ...config
  });

export const useUpdateUserPayModelMutation = (
  config?: Omit<
    UseMutationOptions<
      UpdateUserPayModelResponse,
      Error,
      UpdateUserPayModelRequest
    >,
    "mutationFn"
  >
): UseMutationResult<
  UpdateUserPayModelResponse,
  Error,
  UpdateUserPayModelRequest
> =>
  useMutation({
    mutationFn: (request) => userAPI.updatePayModel(request),
    ...config
  });
