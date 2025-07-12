import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IAnnouncement } from "@/models/announcements";

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
  /*  getById: async (thunderAnnouncementId?: number) => {
      const response = await fetcher<GetUserDetailResponse>(
        `${BASE_URL}/${userId}`,
      );
    }*/
};
