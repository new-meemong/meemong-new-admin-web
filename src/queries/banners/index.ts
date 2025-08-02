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
  PutBannerRequest,
  PutBannerResponse,
} from "@/apis/banners";
import { IBannerForm } from "@/models/banner";

export const useGetBannersQuery = (
  params: GetBannersRequest,
  config?: UseQueryOptions<GetBannersResponse, Error>,
): UseQueryResult<GetBannersResponse, Error> =>
  useQuery<GetBannersResponse, Error>({
    queryKey: ["GET_BANNERS"],
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
