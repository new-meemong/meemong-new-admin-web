import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { IUserBlockDetail, IUserForm } from "@/models/users";
import { GetUsersRequest, GetUsersResponse, userAPI } from "@/apis/user";
import { userBlockAPI } from "@/apis/user/[userId]/block";

export const useGetUsersQuery = (
  params: GetUsersRequest,
  config?: Omit<
    UseQueryOptions<GetUsersResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetUsersResponse, Error> =>
  useQuery({
    queryKey: ["GET_USERS"],
    queryFn: () => userAPI.getAll(params),
    ...config,
  });

export const useGetUserDetailQuery = (
  userId: number,
  config?: UseQueryOptions<IUserForm, Error>,
): UseQueryResult<IUserForm, Error> =>
  useQuery<IUserForm, Error>({
    queryKey: ["GET_USER_DETAIL", userId],
    queryFn: () => userAPI.getById(userId),
    enabled: Boolean(userId),
    ...config,
  });

export const useGetUserBlockDetailQuery = (
  userId: number,
  config?: UseQueryOptions<IUserBlockDetail, Error>,
): UseQueryResult<IUserBlockDetail, Error> =>
  useQuery<IUserBlockDetail, Error>({
    queryKey: ["GET_USER_BLOCK_DETAIL", userId],
    queryFn: () => userBlockAPI.getById(userId),
    ...config,
  });
