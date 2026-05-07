import {
  GetChattingRoomReportsRequest,
  GetChattingRoomReportsResponse,
  PatchChattingRoomReportStatusRequest,
  PatchChattingRoomReportStatusResponse,
  chattingRoomReportsAPI,
} from "@/apis/chattingRoomReports";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { IChattingRoomReport } from "@/models/chattingRoomReports";

export const useGetChattingRoomReportsQuery = (
  params: GetChattingRoomReportsRequest,
  config?: Omit<
    UseQueryOptions<GetChattingRoomReportsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetChattingRoomReportsResponse, Error> =>
  useQuery({
    queryKey: ["GET_CHATTING_ROOM_REPORTS", params],
    queryFn: () => chattingRoomReportsAPI.getAll(params),
    ...config,
  });

export const useGetChattingRoomReportDetailQuery = (
  id?: number,
  config?: Omit<
    UseQueryOptions<IChattingRoomReport, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<IChattingRoomReport, Error> =>
  useQuery<IChattingRoomReport, Error>({
    queryKey: ["GET_CHATTING_ROOM_REPORT_DETAIL", id],
    queryFn: () => chattingRoomReportsAPI.getById(id!),
    enabled: Boolean(id),
    ...config,
  });

export const usePatchChattingRoomReportStatusMutation = (
  config?: Omit<
    UseMutationOptions<
      PatchChattingRoomReportStatusResponse,
      Error,
      PatchChattingRoomReportStatusRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PatchChattingRoomReportStatusResponse,
  Error,
  PatchChattingRoomReportStatusRequest
> =>
  useMutation({
    mutationFn: (request) => chattingRoomReportsAPI.updateStatus(request),
    ...config,
  });
