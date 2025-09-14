import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  popupAPI,
  GetPopupRequest,
  GetPopupResponse,
  PostPopupImageUploadRequest,
  PostPopupImageUploadResponse,
  PostPopupRequest,
  PostPopupResponse,
  PutPopupRequest,
  PutPopupResponse,
} from "@/apis/popup";
import { IPopupForm } from "@/models/popup";
import { normalizeParams } from "@/utils/query";

export const useGetPopupQuery = (
  params: GetPopupRequest,
  config?: Omit<
    UseQueryOptions<GetPopupResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetPopupResponse, Error> =>
  useQuery<GetPopupResponse, Error>({
    queryKey: ["GET_POPUPS", normalizeParams(params)],
    queryFn: () => popupAPI.getAll(params),
    ...config,
  });

export const useGetPopupDetailQuery = (
  id: number,
  config?: Omit<UseQueryOptions<IPopupForm, Error>, "queryFn" | "queryKey">,
): UseQueryResult<IPopupForm, Error> =>
  useQuery<IPopupForm, Error>({
    queryKey: ["GET_POPUP_DETAIL", id],
    queryFn: () => popupAPI.getById(id),
    enabled: Boolean(id),
    ...config,
  });

export const usePostPopupMutation = (
  config?: Omit<
    UseMutationOptions<PostPopupResponse, Error, PostPopupRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostPopupResponse, Error, PostPopupRequest> =>
  useMutation({
    mutationFn: (request: PostPopupRequest) => popupAPI.post(request),
    ...config,
  });

export const usePutPopupMutation = (
  config?: Omit<
    UseMutationOptions<PutPopupResponse, Error, PutPopupRequest>,
    "mutationFn"
  >,
): UseMutationResult<PutPopupResponse, Error, PutPopupRequest> =>
  useMutation({
    mutationFn: (request: PutPopupRequest) => popupAPI.update(request),
    ...config,
  });

export const usePostPopupImageUploadMutation = (
  config?: Omit<
    UseMutationOptions<
      PostPopupImageUploadResponse,
      Error,
      PostPopupImageUploadRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PostPopupImageUploadResponse,
  Error,
  PostPopupImageUploadRequest
> =>
  useMutation({
    mutationFn: (request: PostPopupImageUploadRequest) =>
      popupAPI.uploadImage(request),
    ...config,
  });
