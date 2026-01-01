import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  brandAPI,
  GetBrandsRequest,
  GetBrandsResponse,
  PostBrandRequest,
  PostBrandResponse,
  PatchBrandRequest,
  PatchBrandResponse,
  DeleteBrandRequest,
  PostBrandJoinRequest,
  PostBrandJoinResponse,
  PostBrandLeaveRequest,
  PostBrandLeaveResponse,
} from "@/apis/brands";
import { normalizeParams } from "@/utils/query";

export const useGetBrandsQuery = (
  params?: GetBrandsRequest,
  config?: Omit<
    UseQueryOptions<GetBrandsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetBrandsResponse, Error> =>
  useQuery<GetBrandsResponse, Error>({
    queryKey: ["GET_BRANDS", normalizeParams(params || {})],
    queryFn: () => brandAPI.getAll(params),
    ...config,
  });

export const usePostBrandMutation = (
  config?: Omit<
    UseMutationOptions<PostBrandResponse, Error, PostBrandRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostBrandResponse, Error, PostBrandRequest> =>
  useMutation({
    mutationFn: (request: PostBrandRequest) => brandAPI.create(request),
    ...config,
  });

export const usePatchBrandMutation = (
  config?: Omit<
    UseMutationOptions<PatchBrandResponse, Error, PatchBrandRequest>,
    "mutationFn"
  >,
): UseMutationResult<PatchBrandResponse, Error, PatchBrandRequest> =>
  useMutation({
    mutationFn: (request: PatchBrandRequest) => brandAPI.update(request),
    ...config,
  });

export const useDeleteBrandMutation = (
  config?: Omit<
    UseMutationOptions<null, Error, DeleteBrandRequest>,
    "mutationFn"
  >,
): UseMutationResult<null, Error, DeleteBrandRequest> =>
  useMutation({
    mutationFn: (request: DeleteBrandRequest) => brandAPI.delete(request),
    ...config,
  });

export const usePostBrandJoinMutation = (
  config?: Omit<
    UseMutationOptions<PostBrandJoinResponse, Error, PostBrandJoinRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostBrandJoinResponse, Error, PostBrandJoinRequest> =>
  useMutation({
    mutationFn: (request: PostBrandJoinRequest) => brandAPI.join(request),
    ...config,
  });

export const usePostBrandLeaveMutation = (
  config?: Omit<
    UseMutationOptions<PostBrandLeaveResponse, Error, PostBrandLeaveRequest>,
    "mutationFn"
  >,
): UseMutationResult<PostBrandLeaveResponse, Error, PostBrandLeaveRequest> =>
  useMutation({
    mutationFn: (request: PostBrandLeaveRequest) => brandAPI.leave(request),
    ...config,
  });


