import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IAnnouncement, IAnnouncementForm } from "@/models/announcements";

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
    size = DEFAULT_PAGINATION.size,
  }: GetAnnouncementsRequest) =>
    fetcher<GetAnnouncementsResponse>(BASE_URL, {
      query: {
        ...(category && { category }),
        ...(priceType && { priceType }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size,
      },
    }),
  getAllByUserId: async (userId?: number) => {
    const response = await fetcher<GetAnnouncementByUserIdResponse>(
      `${BASE_URL}/user/${userId}`,
    );
    return response;
  },
  delete: async (announcementId?: number) => {
    const response = await fetcher<DeleteAnnouncementResponse>(
      `${BASE_URL}/${announcementId}`,
      {
        method: "DELETE",
      },
    );
    return response;
  },
};
