import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { IUserBlockDetail } from "@/models/user";
import { userBlockAPI } from "@/apis/user/[userId]/block";

export const useGetUserBlockDetailQuery = (
  userId: number,
  config?: UseQueryOptions<IUserBlockDetail, Error>,
): UseQueryResult<IUserBlockDetail, Error> =>
  useQuery<IUserBlockDetail, Error>({
    queryKey: ["GET_USER_BLOCK_DETAIL", userId],
    queryFn: () => userBlockAPI.getById(userId),
    ...config,
  });
