import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  bannerAPI,
  GetBannersRequest,
  GetBannersResponse,
  PostBannerImageUploadRequest,
  PostBannerImageUploadResponse,
  PostBannerRequest,
  PostBannerResponse,
  PutBannerRequest,
  PutBannerResponse,
} from "@/apis/banners";
import { IBannerForm } from "@/models/banner";
import { normalizeParams } from "@/utils/query";

export const useGetBannersQuery = (
  params: GetBannersRequest,
  config?: Omit<
    UseQueryOptions<GetBannersResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetBannersResponse, Error> =>
  useQuery<GetBannersResponse, Error>({
    queryKey: ["GET_BANNERS", normalizeParams(params)],
    queryFn: () => bannerAPI.getAll(params),
    ...config,
  });

export const useGetBannerDetailQuery = (
  id: number,
  config?: Omit<UseQueryOptions<IBannerForm, Error>, "queryFn" | "queryKey">,
): UseQueryResult<IBannerForm, Error> =>
  useQuery<IBannerForm, Error>({
    queryKey: ["GET_BANNER_DETAIL", id],
    queryFn: () => bannerAPI.getById(id),
    enabled: Boolean(id),
    ...config,
  });

export const usePostBannerMutation = (
  config?: Omit<
    UseMutationOptions<PostBannerResponse, Error, PostBannerRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostBannerResponse, Error, PostBannerRequest> =>
  useMutation({
    mutationFn: (request: PostBannerRequest) => bannerAPI.post(request),
    ...config,
  });

export const usePutBannerMutation = (
  config?: Omit<
    UseMutationOptions<PutBannerResponse, Error, PutBannerRequest>,
    "mutationFn"
  >,
): UseMutationResult<PutBannerResponse, Error, PutBannerRequest> =>
  useMutation({
    mutationFn: (request: PutBannerRequest) => bannerAPI.update(request),
    ...config,
  });

export const usePostBannerImageUploadMutation = (
  config?: Omit<
    UseMutationOptions<
      PostBannerImageUploadResponse,
      Error,
      PostBannerImageUploadRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PostBannerImageUploadResponse,
  Error,
  PostBannerImageUploadRequest
> =>
  useMutation({
    mutationFn: (request: PostBannerImageUploadRequest) =>
      bannerAPI.uploadImage(request),
    ...config,
  });
