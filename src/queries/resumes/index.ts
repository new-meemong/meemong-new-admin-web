import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  DeleteResumeResponse,
  GetResumesByUserIdResponse,
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

export const useGetResumesByUserIdQuery = (
  userId: number,
  config?: Omit<
    UseQueryOptions<GetResumesByUserIdResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetResumesByUserIdResponse, Error> =>
  useQuery({
    queryKey: ["GET_RESUMES_BY_USER_ID", userId],
    queryFn: () => resumeAPI.getAllByUserId(userId),
    ...config,
  });

export const useDeleteResumeMutation = (
  config?: Omit<
    UseMutationOptions<DeleteResumeResponse, Error, number>,
    "mutationFn"
  >,
): UseMutationResult<DeleteResumeResponse, Error, number> =>
  useMutation({
    mutationFn: (jobPostingId?: number) => resumeAPI.delete(jobPostingId),
    ...config,
  });
