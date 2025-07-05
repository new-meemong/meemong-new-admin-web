import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  GetResumesRequest,
  GetResumesResponse,
  resumeAPI,
} from "@/apis/resumes";

export const useGetResumeListQuery = (
  params: GetResumesRequest,
  config?: Omit<
    UseQueryOptions<GetResumesResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetResumesResponse, Error> =>
  useQuery({
    queryKey: ["GET_RESUMES"],
    queryFn: () => resumeAPI.getAll(params),
    ...config,
  });
