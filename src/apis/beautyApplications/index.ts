import {
  BeautyApplicationCategoryType,
  BeautyApplicationPriceType,
  IBeautyApplication,
  IBeautyApplicationDetail,
  RecruitGenderType,
  ReviewType,
  ShootingType,
  WorkType
} from "@/models/beautyApplications";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/beauty-applications";

export type GetBeautyApplicationsRequest = {
  category?: string;
  priceType?: string;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetBeautyApplicationsResponse =
  PaginatedResponse<IBeautyApplication>;

export type GetBeautyApplicationByIdResponse = {
  data: IBeautyApplicationDetail;
};

export type PutBeautyApplicationRequest = {
  beautyApplicationId: number;
  title?: string;
  reviewTypes?: ReviewType[];
  exceptMinutes?: number | null;
  images?: { id?: number; imageURL: string }[];
  categories?: BeautyApplicationCategoryType[];
  recruitGender?: RecruitGenderType;
  shootingType?: ShootingType;
  workType?: WorkType | null;
  description?: string | null;
  appointmentTime?: string;
  activated?: boolean;
  faceReveal?: boolean;
  price?: number;
  priceType?: BeautyApplicationPriceType;
};

export type PutBeautyApplicationResponse = {
  success: boolean;
};

export type DeleteBeautyApplicationResponse = {
  success: boolean;
};

export const beautyApplicationAPI = {
  getAll: ({
    category,
    priceType,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size
  }: GetBeautyApplicationsRequest) =>
    fetcher<GetBeautyApplicationsResponse>(BASE_URL, {
      query: {
        ...(category && { category }),
        ...(priceType && { priceType }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size
      }
    }),
  getById: async (id: number) => {
    const response = await fetcher<GetBeautyApplicationByIdResponse>(
      `${BASE_URL}/${id}`
    );
    return response;
  },
  updateById: async ({
    beautyApplicationId,
    ...body
  }: PutBeautyApplicationRequest) => {
    const response = await fetcher<PutBeautyApplicationResponse>(
      `${BASE_URL}/${beautyApplicationId}`,
      {
        method: "PUT",
        body: JSON.stringify(body)
      }
    );
    return response;
  },
  delete: async (id: number) => {
    const response = await fetcher<DeleteBeautyApplicationResponse>(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE"
      }
    );
    return response;
  }
};
