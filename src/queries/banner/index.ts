import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  bannerAPI,
  GetBannersRequest,
  GetBannersResponse,
} from "@/apis/banner";

export const useGetBannersQuery = (
  params: GetBannersRequest,
  config?: UseQueryOptions<GetBannersResponse, Error>,
): UseQueryResult<GetBannersResponse, Error> =>
  useQuery<GetBannersResponse, Error>({
    queryKey: ["GET_USERS"],
    queryFn: () => bannerAPI.getAll(params),
    ...config,
  });

/*
export const useGetUserDetailQuery = (
  userId: number,
  config?: UseQueryOptions<IUserForm, Error>,
): UseQueryResult<IUserForm, Error> =>
  useQuery<IUserForm, Error>({
    queryKey: ["GET_USER_DETAIL", userId],
    queryFn: () => userAPI.getById({ userId }),
    ...config,
  });
*/
