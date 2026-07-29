import {
  GetTimeSaleMenusRequest,
  GetTimeSaleMenusResponse,
  PutTimeSaleMenuRequest,
  timeSaleMenuAPI,
} from "@/apis/timeSaleMenus";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { ITimeSaleMenu } from "@/models/timeSaleMenus";

export const timeSaleMenusQueryKeys = {
  lists: ["GET_TIME_SALE_MENUS"] as const,
  list: (params: GetTimeSaleMenusRequest) =>
    ["GET_TIME_SALE_MENUS", params] as const,
  details: ["GET_TIME_SALE_MENU_BY_ID"] as const,
  detail: (timeSaleMenuId: number) =>
    ["GET_TIME_SALE_MENU_BY_ID", timeSaleMenuId] as const,
};

export const useGetTimeSaleMenusQuery = (
  params: GetTimeSaleMenusRequest,
  config?: Omit<
    UseQueryOptions<GetTimeSaleMenusResponse, Error>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<GetTimeSaleMenusResponse, Error> =>
  useQuery({
    queryKey: timeSaleMenusQueryKeys.list(params),
    queryFn: () => timeSaleMenuAPI.getAll(params),
    ...config,
  });

export const useGetTimeSaleMenuByIdQuery = (
  timeSaleMenuId: number,
  config?: Omit<UseQueryOptions<ITimeSaleMenu, Error>, "queryKey" | "queryFn">,
): UseQueryResult<ITimeSaleMenu, Error> =>
  useQuery({
    queryKey: timeSaleMenusQueryKeys.detail(timeSaleMenuId),
    queryFn: () => timeSaleMenuAPI.getById(timeSaleMenuId),
    enabled: Boolean(timeSaleMenuId),
    ...config,
  });

export const usePutTimeSaleMenuMutation = (
  config?: Omit<
    UseMutationOptions<ITimeSaleMenu, Error, PutTimeSaleMenuRequest>,
    "mutationFn"
  >,
): UseMutationResult<ITimeSaleMenu, Error, PutTimeSaleMenuRequest> =>
  useMutation({
    mutationFn: (request) => timeSaleMenuAPI.update(request),
    ...config,
  });

export const useDeleteTimeSaleMenuMutation = (
  config?: Omit<UseMutationOptions<void, Error, number>, "mutationFn">,
): UseMutationResult<void, Error, number> =>
  useMutation({
    mutationFn: (timeSaleMenuId) => timeSaleMenuAPI.delete(timeSaleMenuId),
    ...config,
  });
