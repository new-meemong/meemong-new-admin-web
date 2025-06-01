import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { IUser, IUserForm } from "@/models/user";
import { GetUsersRequest, userAPI } from "@/apis/user";
import { PaginatedResponse } from "@/apis/types";

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
