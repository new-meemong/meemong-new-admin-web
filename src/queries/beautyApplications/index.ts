import {
  DeleteBeautyApplicationResponse,
  GetBeautyApplicationByIdResponse,
  GetBeautyApplicationsRequest,
  GetBeautyApplicationsResponse,
  PutBeautyApplicationRequest,
  PutBeautyApplicationResponse,
  beautyApplicationAPI
} from "@/apis/beautyApplications";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

export const useGetBeautyApplicationsQuery = (
  params: GetBeautyApplicationsRequest,
  config?: Omit<
    UseQueryOptions<GetBeautyApplicationsResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetBeautyApplicationsResponse, Error> =>
  useQuery({
    queryKey: ["GET_BEAUTY_APPLICATIONS"],
    queryFn: () => beautyApplicationAPI.getAll(params),
    ...config
  });

export const useGetBeautyApplicationByIdQuery = (
  id: number,
  config?: Omit<
    UseQueryOptions<GetBeautyApplicationByIdResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetBeautyApplicationByIdResponse, Error> =>
  useQuery({
    queryKey: ["GET_BEAUTY_APPLICATION_BY_ID", id],
    queryFn: () => beautyApplicationAPI.getById(id),
    enabled: Boolean(id),
    ...config
  });

export const usePutBeautyApplicationMutation = (
  config?: Omit<
    UseMutationOptions<
      PutBeautyApplicationResponse,
      Error,
      PutBeautyApplicationRequest
    >,
    "mutationFn"
  >
): UseMutationResult<
  PutBeautyApplicationResponse,
  Error,
  PutBeautyApplicationRequest
> =>
  useMutation({
    mutationFn: (request: PutBeautyApplicationRequest) =>
      beautyApplicationAPI.updateById(request),
    ...config
  });

export const useDeleteBeautyApplicationMutation = (
  config?: Omit<
    UseMutationOptions<DeleteBeautyApplicationResponse, Error, number>,
    "mutationFn"
  >
): UseMutationResult<DeleteBeautyApplicationResponse, Error, number> =>
  useMutation({
    mutationFn: (id: number) => beautyApplicationAPI.delete(id),
    ...config
  });
