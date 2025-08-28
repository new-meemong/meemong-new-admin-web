import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IBanner, IBannerForm } from "@/models/banner";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/banners";

export type GetBannersRequest = {
  company?: string;
  page?: number;
  size?: number;
};
export type GetBannersResponse = PaginatedResponse<IBanner>;

export type GetBannerDetailResponse = {
  data: IBannerForm;
};

export type PutBannerRequest = {
  id: number;
  banner: Partial<IBannerForm>;
};

export type PutBannerResponse = {
  success: boolean;
};

export type PostBannerImageUploadRequest = FormData;

export type PostBannerImageUploadResponse = {
  data: {
    imageFile: {
      fileuri: string;
    };
  };
};

export const bannerAPI = {
  getAll: ({
    company,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetBannersRequest) =>
    fetcher<GetBannersResponse>(BASE_URL, {
      query: {
        ...(company && { company }),
        page,
        size,
      },
    }),
  getById: async (bannerId?: number) => {
    const response = await fetcher<GetBannerDetailResponse>(
      `${BASE_URL}/${bannerId}`,
    );
    return response.data;
  },
  update: async (request: PutBannerRequest) => {
    const response = await fetcher<PutBannerResponse>(
      `${BASE_URL}/${request.id}`,
      {
        method: "PUT",
        body: JSON.stringify(request.banner),
      },
    );

    return response;
  },
  uploadImage: async (request: PostBannerImageUploadRequest) => {
    const response = await fetcher<PostBannerImageUploadResponse>(
      `/api/v1/uploads/banners`,
      {
        method: "POST",
        body: request,
      },
    );

    return response;
  },
};
