import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  DeleteJobPostingResponse,
  GetJobPostingByIdResponse,
  GetJobPostingsByUserIdResponse,
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

export const useGetJobPostingByIdQuery = (
  jobPostingId: number,
  config?: Omit<
    UseQueryOptions<GetJobPostingByIdResponse, Error>,
    "queryFn" | "queryKey"
  >,
) =>
  useQuery({
    queryKey: ["GET_JOB_POSTING_BY_ID", jobPostingId],
    queryFn: () => jobPostingAPI.getById(jobPostingId),
    ...config,
  });

export const useGetJobPostingsByUserIdQuery = (
  userId: number,
  config?: Omit<
    UseQueryOptions<GetJobPostingsByUserIdResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetJobPostingsByUserIdResponse, Error> =>
  useQuery({
    queryKey: ["GET_JOB_POSTINGS_BY_USER_ID", userId],
    queryFn: () => jobPostingAPI.getAllByUserId(userId),
    ...config,
  });

export const useDeleteJobPostingMutation = (
  config?: Omit<
    UseMutationOptions<DeleteJobPostingResponse, Error, number>,
    "mutationFn"
  >,
): UseMutationResult<DeleteJobPostingResponse, Error, number> =>
  useMutation({
    mutationFn: (jobPostingId?: number) => jobPostingAPI.delete(jobPostingId),
    ...config,
  });
