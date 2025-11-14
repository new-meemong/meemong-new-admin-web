import {
  DeleteAnnouncementResponse,
  GetAnnouncementByUserIdResponse,
  GetAnnouncementsRequest,
  GetAnnouncementsResponse,
  PutAnnouncementByIdRequest,
  PutAnnouncementByIdResponse,
  PutAnnouncementRequest,
  PutAnnouncementResponse,
  announcementAPI
} from "@/apis/announcements";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

export const useGetAnnouncementsQuery = (
  params: GetAnnouncementsRequest,
  config?: Omit<
    UseQueryOptions<GetAnnouncementsResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetAnnouncementsResponse, Error> =>
  useQuery({
    queryKey: ["GET_ANNOUNCEMENTS"],
    queryFn: () => announcementAPI.getAll(params),
    ...config
  });

export const useGetAnnouncementsByUserIdQuery = (
  userId?: number,
  config?: Omit<
    UseQueryOptions<GetAnnouncementByUserIdResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetAnnouncementByUserIdResponse, Error> =>
  useQuery({
    queryKey: ["GET_ANNOUNCEMENTS_BY_USER_ID", userId],
    queryFn: () => announcementAPI.getAllByUserId(userId),
    enabled: Boolean(userId),
    ...config
  });

export const usePutAnnouncementMutation = (
  config?: Omit<
    UseMutationOptions<PutAnnouncementResponse, Error, PutAnnouncementRequest>,
    "mutationFn"
  >
): UseMutationResult<PutAnnouncementResponse, Error, PutAnnouncementRequest> =>
  useMutation({
    mutationFn: (request: PutAnnouncementRequest) =>
      announcementAPI.update(request),
    ...config
  });

export const usePutAnnouncementByIdMutation = (
  config?: Omit<
    UseMutationOptions<
      PutAnnouncementByIdResponse,
      Error,
      PutAnnouncementByIdRequest
    >,
    "mutationFn"
  >
): UseMutationResult<
  PutAnnouncementByIdResponse,
  Error,
  PutAnnouncementByIdRequest
> =>
  useMutation({
    mutationFn: (request: PutAnnouncementByIdRequest) =>
      announcementAPI.updateById(request),
    ...config
  });

export const useDeleteAnnouncementMutation = (
  config?: Omit<
    UseMutationOptions<DeleteAnnouncementResponse, Error, number>,
    "mutationFn"
  >
): UseMutationResult<DeleteAnnouncementResponse, Error, number> =>
  useMutation({
    mutationFn: (announcementId?: number) =>
      announcementAPI.delete(announcementId),
    ...config
  });
