import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  authAPI,
  PostAdminLoginRequest,
} from "@/apis/auth";
import { IAuthUser, ILoginResponse } from "@/models/auth";

export const useGetAdminAuth = (
  userId?: number,
  config?: Omit<UseQueryOptions<IAuthUser, Error>, "queryFn" | "queryKey">,
): UseQueryResult<IAuthUser, Error> =>
  useQuery({
    queryKey: ["GET_ADMIN_AUTH_ME", userId],
    queryFn: () => authAPI.me(),
    ...config,
  });

export const usePostAdminLogin = (
  config?: Omit<
    UseMutationOptions<ILoginResponse, Error, PostAdminLoginRequest>,
    "mutationFn"
  >,
): UseMutationResult<ILoginResponse, Error, PostAdminLoginRequest> =>
  useMutation({
    mutationFn: (request: PostAdminLoginRequest) => authAPI.login(request),
    ...config,
  });
