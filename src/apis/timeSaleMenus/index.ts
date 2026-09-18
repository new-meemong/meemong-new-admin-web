import {
  PaginatedResponse,
  ServerPaginatedResponse,
  normalizePaginatedResponse,
} from "@/apis/types";
import {
  ITimeSaleMenu,
  TimeSaleMenuSearchType,
  TimeSaleMenuOrderBy,
  TimeSaleMenuTreatmentType,
} from "@/models/timeSaleMenus";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/time-sale-menus";

export type GetTimeSaleMenusRequest = {
  orderBy?: TimeSaleMenuOrderBy;
  createdAtStartKST?: string;
  createdAtEndKST?: string;
  treatmentTypes?: TimeSaleMenuTreatmentType[];
  searchType?: TimeSaleMenuSearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};

export type GetTimeSaleMenusResponse = PaginatedResponse<ITimeSaleMenu>;

export type GetTimeSaleMenuByIdResponse = {
  data: ITimeSaleMenu;
};

export type PutTimeSaleMenuRequest = {
  timeSaleMenuId: number;
  name?: string;
  description?: string;
  naverReservationNotice?: string;
  naverReservationUrl?: string | null;
};

export type PutTimeSaleMenuResponse = {
  data: ITimeSaleMenu;
};

export const timeSaleMenuAPI = {
  getAll: async ({
    orderBy,
    createdAtStartKST,
    createdAtEndKST,
    treatmentTypes,
    searchType,
    searchKeyword,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetTimeSaleMenusRequest): Promise<GetTimeSaleMenusResponse> => {
    const trimmedSearchKeyword = searchKeyword?.trim();
    const response = await fetcher<ServerPaginatedResponse<ITimeSaleMenu>>(
      BASE_URL,
      {
        query: {
          orderBy,
          createdAtStartKST: createdAtStartKST || undefined,
          createdAtEndKST: createdAtEndKST || undefined,
          "treatmentTypes[]": treatmentTypes,
          ...(trimmedSearchKeyword &&
            searchType && {
              searchType,
              searchKeyword: trimmedSearchKeyword,
            }),
          page,
          size,
        },
      },
    );

    return normalizePaginatedResponse(response);
  },

  getById: async (timeSaleMenuId: number): Promise<ITimeSaleMenu> => {
    const response = await fetcher<GetTimeSaleMenuByIdResponse>(
      `${BASE_URL}/${timeSaleMenuId}`,
    );

    return response.data;
  },

  update: async ({
    timeSaleMenuId,
    ...body
  }: PutTimeSaleMenuRequest): Promise<ITimeSaleMenu> => {
    const response = await fetcher<PutTimeSaleMenuResponse>(
      `${BASE_URL}/${timeSaleMenuId}`,
      {
        method: "PUT",
        json: body,
      },
    );

    return response.data;
  },

  delete: async (timeSaleMenuId: number): Promise<void> =>
    fetcher<void>(`${BASE_URL}/${timeSaleMenuId}`, {
      method: "DELETE",
    }),
};
