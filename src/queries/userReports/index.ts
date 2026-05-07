import {
  GetUserReportsRequest,
  GetUserReportsResponse,
  PatchUserReportStatusRequest,
  PatchUserReportStatusResponse,
  userReportsAPI,
} from "@/apis/userReports";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { IUserReport } from "@/models/userReports";

export const useGetUserReportsQuery = (
  params: GetUserReportsRequest,
  config?: Omit<
    UseQueryOptions<GetUserReportsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetUserReportsResponse, Error> =>
  useQuery({
    queryKey: ["GET_USER_REPORTS", params],
    queryFn: () => userReportsAPI.getAll(params),
    ...config,
  });

export const useGetUserReportDetailQuery = (
  id?: number,
  config?: Omit<UseQueryOptions<IUserReport, Error>, "queryFn" | "queryKey">,
): UseQueryResult<IUserReport, Error> =>
  useQuery<IUserReport, Error>({
    queryKey: ["GET_USER_REPORT_DETAIL", id],
    queryFn: () => userReportsAPI.getById(id!),
    enabled: Boolean(id),
    ...config,
  });

export const usePatchUserReportStatusMutation = (
  config?: Omit<
    UseMutationOptions<
      PatchUserReportStatusResponse,
      Error,
      PatchUserReportStatusRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PatchUserReportStatusResponse,
  Error,
  PatchUserReportStatusRequest
> =>
  useMutation({
    mutationFn: (request) => userReportsAPI.updateStatus(request),
    ...config,
  });
