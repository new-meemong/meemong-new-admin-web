import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  GetSalonPickMainButtonDetailResponse,
  GetSalonPickMainButtonsRequest,
  GetSalonPickMainButtonsResponse,
  salonPickMainButtonsAPI,
} from "@/apis/salonPickMainButtons";
import { normalizeParams } from "@/utils/query";

export const salonPickMainButtonsQueryKeys = {
  lists: ["GET_SALON_PICK_MAIN_BUTTONS"] as const,
  list: (params: GetSalonPickMainButtonsRequest) =>
    ["GET_SALON_PICK_MAIN_BUTTONS", normalizeParams(params)] as const,
  details: ["GET_SALON_PICK_MAIN_BUTTON_DETAIL"] as const,
  detail: (id: number) => ["GET_SALON_PICK_MAIN_BUTTON_DETAIL", id] as const,
};

export const useGetSalonPickMainButtonsQuery = (
  params: GetSalonPickMainButtonsRequest,
  config?: Omit<
    UseQueryOptions<GetSalonPickMainButtonsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetSalonPickMainButtonsResponse, Error> =>
  useQuery<GetSalonPickMainButtonsResponse, Error>({
    queryKey: salonPickMainButtonsQueryKeys.list(params),
    queryFn: () => salonPickMainButtonsAPI.getAll(params),
    ...config,
  });

export const useGetSalonPickMainButtonDetailQuery = (
  id: number,
  config?: Omit<
    UseQueryOptions<GetSalonPickMainButtonDetailResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetSalonPickMainButtonDetailResponse, Error> =>
  useQuery<GetSalonPickMainButtonDetailResponse, Error>({
    queryKey: salonPickMainButtonsQueryKeys.detail(id),
    queryFn: () => salonPickMainButtonsAPI.getById(id),
    enabled: Boolean(id),
    ...config,
  });
