import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  GetJobPostingsRequest,
  GetJobPostingsResponse,
  jobPostingAPI,
} from "@/apis/jobPostings";

export const useGetJobPostingsQuery = (
  params: GetJobPostingsRequest,
  config?: Omit<
    UseQueryOptions<GetJobPostingsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetJobPostingsResponse, Error> =>
  useQuery({
    queryKey: ["GET_JOB_POSTINGS"],
    queryFn: () => jobPostingAPI.getAll(params),
    ...config,
  });
