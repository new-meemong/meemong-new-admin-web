import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { PaginatedResponse } from "@/apis/types";
import { contentsAPI, GetContentsRequest } from "@/apis/contents";
import { IContents } from "@/models/contents";

export const useGetContentsQuery = (
  params: GetContentsRequest,
  config?: UseQueryOptions<PaginatedResponse<IContents>, Error>,
): UseQueryResult<PaginatedResponse<IContents>, Error> =>
  useQuery<PaginatedResponse<IContents>, Error>({
    queryKey: ["GET_CONTENTS"],
    queryFn: () => contentsAPI.getAll(params),
    ...config,
  });
