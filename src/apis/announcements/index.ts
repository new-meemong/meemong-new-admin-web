import {
  AnnouncementPriceType,
  IAnnouncement,
  IAnnouncementForm
} from "@/models/announcements";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/announcements";

export type GetAnnouncementsRequest = {
  category?: string;
  priceType?: string;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetAnnouncementsResponse = PaginatedResponse<IAnnouncement>;

export type GetAnnouncementByUserIdResponse = {
  totalCount: number;
  content: IAnnouncementForm[];
};

export type PutAnnouncementRequest = {
  userId: number;
  category: string;
  description?: string;
  appointmentTime?: string;
  activated?: boolean;
  faceReveal?: boolean;
  price?: number;
  priceType?: AnnouncementPriceType;
};

export type PutAnnouncementResponse = {
  success: boolean;
};

export type PutAnnouncementByIdRequest = {
  announcementId: number;
  description?: string;
  appointmentTime?: string;
  activated?: boolean;
  faceReveal?: boolean;
  price?: number;
  priceType?: AnnouncementPriceType;
};

export type PutAnnouncementByIdResponse = {
  success: boolean;
};

export type DeleteAnnouncementResponse = {
  success: boolean;
};

export const announcementAPI = {
  getAll: ({
    category,
    priceType,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size
  }: GetAnnouncementsRequest) =>
    fetcher<GetAnnouncementsResponse>(BASE_URL, {
      query: {
        ...(category && { category }),
        ...(priceType && { priceType }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size
      }
    }),
  getAllByUserId: async (userId?: number) => {
    const response = await fetcher<GetAnnouncementByUserIdResponse>(
      `${BASE_URL}/user/${userId}`
    );
    return response;
  },
  update: async (request: PutAnnouncementRequest) => {
    const response = await fetcher<PutAnnouncementResponse>(BASE_URL, {
      method: "PUT",
      body: JSON.stringify(request)
    });
    return response;
  },
  updateById: async ({
    announcementId,
    ...body
  }: PutAnnouncementByIdRequest) => {
    // announcementId는 path variable로 사용되므로 body에서 제외 (이미 ...body로 제외됨)
    const response = await fetcher<PutAnnouncementByIdResponse>(
      `${BASE_URL}/${announcementId}`,
      {
        method: "PUT",
        body: JSON.stringify(body)
      }
    );
    return response;
  },
  delete: async (announcementId?: number) => {
    const response = await fetcher<DeleteAnnouncementResponse>(
      `${BASE_URL}/${announcementId}`,
      {
        method: "DELETE"
      }
    );
    return response;
  }
};
