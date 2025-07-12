import { UserRoleType } from "@/models/users";
import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  IThunderAnnouncement,
  ThunderAnnouncementType,
} from "@/models/thunderAnnouncements";

const BASE_URL = "/api/v1/admins/thunder-announcements";

export type GetThunderAnnouncementsRequest = {
  role?: UserRoleType;
  type?: ThunderAnnouncementType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetThunderAnnouncementsResponse =
  PaginatedResponse<IThunderAnnouncement>;

export const thunderAnnouncementAPI = {
  getAll: ({
    role,
    type,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetThunderAnnouncementsRequest) =>
    fetcher<GetThunderAnnouncementsResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(type && { type }),
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
