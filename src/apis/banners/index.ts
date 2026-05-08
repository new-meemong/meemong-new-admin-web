import { BannerType, BannerUserType } from "@/constants/banner";
import { IBanner, IBannerForm } from "@/models/banner";
import {
  PaginatedResponse,
  ServerPaginatedResponse,
  normalizePaginatedResponse
} from "@/apis/types";

import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/banners";

export type GetBannersRequest = {
  userType?: BannerUserType;
  bannerType?: BannerType;
  __cursorOrder?: string;
  page?: number;
  size?: number;
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
  endAt?: string;
};

export type PostBannerResponse = {
  data: IBanner;
};

export type PutBannerRequest = {
  id: number;
  userType?: string;
  bannerType?: string;
  displayType?: string;
  imageUrl?: string;
  redirectUrl?: string;
  endAt?: string | null;
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
  getAll: async ({
    userType,
    bannerType,
    __cursorOrder,
    page,
    size
  }: GetBannersRequest) => {
    const response = await fetcher<ServerPaginatedResponse<IBanner>>(BASE_URL, {
      query: {
        ...(userType && { userType }),
        ...(bannerType && { bannerType }),
        ...(__cursorOrder && { __cursorOrder }),
        ...(page !== undefined && { page }),
        ...(size !== undefined && { size })
      }
    });

    return normalizePaginatedResponse(response);
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
