import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { IUser, IUserBlockDetail, IUserForm } from "@/models/user";
import { GetUsersRequest, userAPI } from "@/apis/user";
import { PaginatedResponse } from "@/apis/types";
import { userBlockAPI } from "@/apis/user/[userId]/block";

export const useGetUsersQuery = (
  params: GetUsersRequest,
  config?: UseQueryOptions<PaginatedResponse<IUser>, Error>,
): UseQueryResult<PaginatedResponse<IUser>, Error> =>
  useQuery<PaginatedResponse<IUser>, Error>({
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
    queryFn: () => userAPI.getById({ userId }),
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
