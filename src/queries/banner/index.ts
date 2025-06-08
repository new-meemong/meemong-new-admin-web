import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  bannerAPI,
  GetBannersRequest,
  GetBannersResponse,
} from "@/apis/banner";
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
  bannerId: number,
  config?: UseQueryOptions<IBannerForm, Error>,
): UseQueryResult<IBannerForm, Error> =>
  useQuery<IBannerForm, Error>({
    queryKey: ["GET_BANNER_DETAIL", bannerId],
    queryFn: () => bannerAPI.getById({ bannerId }),
    ...config,
  });
