import {
  DeleteBeautyApplicationImageResponse,
  GetBeautyApplicationImagesRequest,
  GetBeautyApplicationImagesResponse,
  beautyApplicationImageAPI
} from "@/apis/beautyApplicationImages";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import { IBeautyApplicationImage } from "@/models/beautyApplicationImages";
import { normalizeParams } from "@/utils/query";

export const useGetBeautyApplicationImagesQuery = (
  params: GetBeautyApplicationImagesRequest,
  config?: Omit<
    UseQueryOptions<GetBeautyApplicationImagesResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetBeautyApplicationImagesResponse, Error> =>
  useQuery({
    queryKey: ["GET_BEAUTY_APPLICATION_IMAGES", normalizeParams(params)],
    queryFn: () => beautyApplicationImageAPI.getAll(params),
    ...config
  });

export const useGetBeautyApplicationImageDetailQuery = (
  imageId?: number,
  config?: Omit<
    UseQueryOptions<IBeautyApplicationImage, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<IBeautyApplicationImage, Error> =>
  useQuery({
    queryKey: ["GET_BEAUTY_APPLICATION_IMAGE_DETAIL", imageId],
    queryFn: () => beautyApplicationImageAPI.getById(imageId),
    enabled: Boolean(imageId),
    ...config
  });

export const useDeleteBeautyApplicationImageMutation = (
  config?: Omit<
    UseMutationOptions<DeleteBeautyApplicationImageResponse, Error, number>,
    "mutationFn"
  >
): UseMutationResult<DeleteBeautyApplicationImageResponse, Error, number> =>
  useMutation({
    mutationFn: (id) => beautyApplicationImageAPI.delete(id),
    ...config
  });
