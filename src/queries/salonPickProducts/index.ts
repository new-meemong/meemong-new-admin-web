import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  DeleteSalonPickProductResponse,
  GetSalonPickProductsRequest,
  GetSalonPickProductsResponse,
  PostSalonPickProductImageUploadRequest,
  PostSalonPickProductImageUploadResponse,
  PostSalonPickProductRequest,
  PostSalonPickProductResponse,
  PutSalonPickProductRequest,
  PutSalonPickProductResponse,
  salonPickProductsAPI,
} from "@/apis/salonPickProducts";
import { ISalonPickProduct } from "@/models/salonPickProducts";
import { normalizeParams } from "@/utils/query";

export const salonPickProductsQueryKeys = {
  lists: ["GET_SALON_PICK_PRODUCTS"] as const,
  list: (params: GetSalonPickProductsRequest) =>
    ["GET_SALON_PICK_PRODUCTS", normalizeParams(params)] as const,
  details: ["GET_SALON_PICK_PRODUCT_DETAIL"] as const,
  detail: (id: number) => ["GET_SALON_PICK_PRODUCT_DETAIL", id] as const,
};

export const useGetSalonPickProductsQuery = (
  params: GetSalonPickProductsRequest,
  config?: Omit<
    UseQueryOptions<GetSalonPickProductsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetSalonPickProductsResponse, Error> =>
  useQuery<GetSalonPickProductsResponse, Error>({
    queryKey: salonPickProductsQueryKeys.list(params),
    queryFn: () => salonPickProductsAPI.getAll(params),
    ...config,
  });

export const useGetSalonPickProductDetailQuery = (
  id: number,
  config?: Omit<
    UseQueryOptions<ISalonPickProduct, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<ISalonPickProduct, Error> =>
  useQuery<ISalonPickProduct, Error>({
    queryKey: salonPickProductsQueryKeys.detail(id),
    queryFn: () => salonPickProductsAPI.getById(id),
    enabled: Boolean(id),
    ...config,
  });

export const usePostSalonPickProductMutation = (
  config?: Omit<
    UseMutationOptions<
      PostSalonPickProductResponse,
      Error,
      PostSalonPickProductRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PostSalonPickProductResponse,
  Error,
  PostSalonPickProductRequest
> =>
  useMutation({
    mutationFn: (request: PostSalonPickProductRequest) =>
      salonPickProductsAPI.post(request),
    ...config,
  });

export const usePutSalonPickProductMutation = (
  config?: Omit<
    UseMutationOptions<
      PutSalonPickProductResponse,
      Error,
      PutSalonPickProductRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PutSalonPickProductResponse,
  Error,
  PutSalonPickProductRequest
> =>
  useMutation({
    mutationFn: (request: PutSalonPickProductRequest) =>
      salonPickProductsAPI.update(request),
    ...config,
  });

export const useDeleteSalonPickProductMutation = (
  config?: Omit<
    UseMutationOptions<DeleteSalonPickProductResponse, Error, number>,
    "mutationFn"
  >,
): UseMutationResult<DeleteSalonPickProductResponse, Error, number> =>
  useMutation({
    mutationFn: (salonPickProductId: number) =>
      salonPickProductsAPI.delete(salonPickProductId),
    ...config,
  });

export const usePostSalonPickProductImageUploadMutation = (
  config?: Omit<
    UseMutationOptions<
      PostSalonPickProductImageUploadResponse,
      Error,
      PostSalonPickProductImageUploadRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  PostSalonPickProductImageUploadResponse,
  Error,
  PostSalonPickProductImageUploadRequest
> =>
  useMutation({
    mutationFn: (request: PostSalonPickProductImageUploadRequest) =>
      salonPickProductsAPI.uploadImage(request),
    ...config,
  });
