import {
  DeleteThunderAnnouncementResponse,
  GetThunderAnnouncementsRequest,
  GetThunderAnnouncementsResponse,
  PutThunderAnnouncementPremiumRequest,
  PutThunderAnnouncementPremiumResponse,
  PutThunderAnnouncementRequest,
  PutThunderAnnouncementResponse,
  thunderAnnouncementAPI
} from "@/apis/thunderAnnouncements";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import { IThunderAnnouncementForm } from "@/models/thunderAnnouncements";

export const useGetThunderAnnouncementsQuery = (
  params: GetThunderAnnouncementsRequest,
  config?: Omit<
    UseQueryOptions<GetThunderAnnouncementsResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetThunderAnnouncementsResponse, Error> =>
  useQuery({
    queryKey: ["GET_THUNDER_ANNOUNCEMENTS"],
    queryFn: () => thunderAnnouncementAPI.getAll(params),
    ...config
  });

export const useGetThunderAnnouncementByIdQuery = (
  thunderAnnouncementId?: number,
  config?: Omit<
    UseQueryOptions<IThunderAnnouncementForm, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<IThunderAnnouncementForm, Error> =>
  useQuery({
    queryKey: ["GET_THUNDER_ANNOUNCEMENT_BY_ID", thunderAnnouncementId],
    queryFn: () => thunderAnnouncementAPI.getById(thunderAnnouncementId),
    enabled: Boolean(thunderAnnouncementId),
    ...config
  });

export const usePutThunderAnnouncementPremiumMutation = (
  config?: Omit<
    UseMutationOptions<
      PutThunderAnnouncementPremiumResponse,
      Error,
      PutThunderAnnouncementPremiumRequest
    >,
    "mutationFn"
  >
): UseMutationResult<
  PutThunderAnnouncementPremiumResponse,
  Error,
  PutThunderAnnouncementPremiumRequest
> =>
  useMutation({
    mutationFn: (request: PutThunderAnnouncementPremiumRequest) =>
      thunderAnnouncementAPI.updatePremium(request),
    ...config
  });

export const usePutThunderAnnouncementMutation = (
  config?: Omit<
    UseMutationOptions<
      PutThunderAnnouncementResponse,
      Error,
      PutThunderAnnouncementRequest
    >,
    "mutationFn"
  >
): UseMutationResult<
  PutThunderAnnouncementResponse,
  Error,
  PutThunderAnnouncementRequest
> =>
  useMutation({
    mutationFn: (request: PutThunderAnnouncementRequest) =>
      thunderAnnouncementAPI.update(request),
    ...config
  });

export const useDeleteThunderAnnouncementMutation = (
  config?: Omit<
    UseMutationOptions<DeleteThunderAnnouncementResponse, Error, number>,
    "mutationFn"
  >
): UseMutationResult<DeleteThunderAnnouncementResponse, Error, number> =>
  useMutation({
    mutationFn: (thunderAnnouncementId?: number) =>
      thunderAnnouncementAPI.delete(thunderAnnouncementId),
    ...config
  });
