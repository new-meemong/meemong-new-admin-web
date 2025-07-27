import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import {
  DeleteAnnouncementResponse,
  announcementAPI,
  GetAnnouncementsResponse,
  GetAnnouncementsRequest,
  GetAnnouncementByUserIdResponse,
} from "@/apis/announcements";

export const useGetAnnouncementsQuery = (
  params: GetAnnouncementsRequest,
  config?: Omit<
    UseQueryOptions<GetAnnouncementsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetAnnouncementsResponse, Error> =>
  useQuery({
    queryKey: ["GET_ANNOUNCEMENTS"],
    queryFn: () => announcementAPI.getAll(params),
    ...config,
  });

export const useGetAnnouncementsByUserIdQuery = (
  userId?: number,
  config?: Omit<
    UseQueryOptions<GetAnnouncementByUserIdResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetAnnouncementByUserIdResponse, Error> =>
  useQuery({
    queryKey: ["GET_ANNOUNCEMENTS_BY_USER_ID", userId],
    queryFn: () => announcementAPI.getAllByUserId(userId),
    enabled: Boolean(userId),
    ...config,
  });

export const useDeleteAnnouncementMutation = (
  config?: Omit<
    UseMutationOptions<DeleteAnnouncementResponse, Error, number>,
    "mutationFn"
  >,
): UseMutationResult<DeleteAnnouncementResponse, Error, number> =>
  useMutation({
    mutationFn: (announcementId?: number) =>
      announcementAPI.delete(announcementId),
    ...config,
  });
