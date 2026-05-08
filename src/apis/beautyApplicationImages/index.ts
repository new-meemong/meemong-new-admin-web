import {
  BeautyApplicationImageOrderBy,
  BeautyApplicationImageSearchType,
  BeautyApplicationImageSort,
  IBeautyApplicationImage
} from "@/models/beautyApplicationImages";
import {
  PaginatedResponse,
  ServerPaginatedResponse,
  normalizePaginatedResponse
} from "@/apis/types";

import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/beauty-application-images";

export type GetBeautyApplicationImagesRequest = {
  searchType?: BeautyApplicationImageSearchType;
  searchKeyword?: string;
  orderBy?: BeautyApplicationImageOrderBy;
  sort?: BeautyApplicationImageSort;
  page?: number;
  size?: number;
};

export type GetBeautyApplicationImagesResponse =
  PaginatedResponse<IBeautyApplicationImage>;

export type GetBeautyApplicationImageDetailResponse = {
  data: IBeautyApplicationImage;
};

export type DeleteBeautyApplicationImageResponse = {
  data: null;
};

export const beautyApplicationImageAPI = {
  getAll: async ({
    searchType,
    searchKeyword,
    orderBy = "updatedAt",
    sort = "DESC",
    page = 1,
    size = 10
  }: GetBeautyApplicationImagesRequest = {}) => {
    const response = await fetcher<
      ServerPaginatedResponse<IBeautyApplicationImage>
    >(BASE_URL, {
      query: {
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        orderBy,
        sort,
        page,
        size
      }
    });

    return normalizePaginatedResponse(response);
  },

  getById: async (id?: number) => {
    const response = await fetcher<GetBeautyApplicationImageDetailResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await fetcher<DeleteBeautyApplicationImageResponse>(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE"
      }
    );
    return response;
  }
};
