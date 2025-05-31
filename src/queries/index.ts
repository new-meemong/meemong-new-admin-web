import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { IUser, IUserForm } from "@/models/user";
import { userAPI } from "@/apis/user";
import { PaginatedResponse } from "@/apis/types";

export const useGetUsersQuery = (
  config?: UseQueryOptions<PaginatedResponse<IUser>, Error>,
) =>
  useQuery<PaginatedResponse<IUser>, Error>({
    queryKey: ["GET_USERS"],
    queryFn: userAPI.getAll,
    ...config,
  });

export const useGetUserDetailQuery = (
  userId: number,
  config?: UseQueryOptions,
) =>
  useQuery<IUserForm>({
    queryKey: ["GET_USER_DETAIL", userId],
    queryFn: () => userAPI.getById(userId),
    enabled: !userId,
    ...config,
  });
