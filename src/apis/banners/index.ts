import { BannerType, BannerUserType } from "@/constants/banner";
import { IBanner, IBannerForm } from "@/models/banner";

import { PaginatedResponse } from "@/apis/types";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/banners";

export type GetBannersRequest = {
  userType?: BannerUserType;
  bannerType?: BannerType;
  __cusorOrder?: string;
};
export type GetBannersResponse = PaginatedResponse<IBanner>;

export type GetBannerDetailResponse = {
  data: IBannerForm;
};

export type PostBannerRequest = {
  userType: string;
  bannerType: string;
  displayType?: string;
  imageUrl: string;
  redirectUrl: string;
  company?: string;
};

export type PostBannerResponse = {
  data: IBanner;
};

export type PutBannerRequest = {
  id: number;
  userType?: string;
  bannerType?: string;
  imageUrl?: string;
  redirectUrl?: string;
};

export type PutBannerResponse = {
  data: IBanner;
};

export type PostBannerImageUploadRequest = FormData;

export type PostBannerImageUploadResponse = {
  data: {
    imageFile: {
      fileuri: string;
      filepath: string | null;
    };
    imageThumbnailFile: {
      fileuri: string;
      filepath: string | null;
    };
  };
};

export const bannerAPI = {
  getAll: async ({ userType, bannerType, __cusorOrder }: GetBannersRequest) => {
    const response = await fetcher<{
      dataCount: number;
      dataList: IBanner[];
    }>(BASE_URL, {
      query: {
        ...(userType && { userType }),
        ...(bannerType && { bannerType }),
        ...(__cusorOrder && { __cusorOrder })
      }
    });

    // API 응답을 PaginatedResponse 형식으로 변환
    return {
      content: response.dataList || [],
      totalCount: response.dataCount || 0,
      page: 1,
      size: response.dataList?.length || 0
    } as GetBannersResponse;
  },
  getById: async (bannerId?: number) => {
    const response = await fetcher<GetBannerDetailResponse>(
      `${BASE_URL}/${bannerId}`
    );
    return response.data;
  },
  post: async (request: PostBannerRequest) => {
    const response = await fetcher<PostBannerResponse>(`${BASE_URL}`, {
      method: "POST",
      body: JSON.stringify(request)
    });

    return response;
  },
  update: async (request: PutBannerRequest) => {
    const { id, ...body } = request;
    const response = await fetcher<PutBannerResponse>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });

    return response;
  },
  uploadImage: async (request: PostBannerImageUploadRequest) => {
    const response = await fetcher<PostBannerImageUploadResponse>(
      `/api/v1/uploads/banners`,
      {
        method: "POST",
        body: request
      }
    );

    return response;
  }
};
