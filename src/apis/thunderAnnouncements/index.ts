import { UserRoleType } from "@/models/users";
import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IThunderAnnouncement } from "@/models/thunderAnnouncements";

const BASE_URL = "/api/v1/admins/thunderAnnouncements";

export type GetThunderAnnouncementsRequest = {
  role?: UserRoleType;
  searchType?: SearchType;
  searchKeyword?: string;
  isPremium?: boolean;
  page?: number;
  size?: number;
};
export type GetThunderAnnouncementsResponse =
  PaginatedResponse<IThunderAnnouncement>;

export const thunderAnnouncementAPI = {
  getAll: ({
    role,
    searchKeyword,
    searchType,
    isPremium,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetThunderAnnouncementsRequest) =>
    fetcher<GetThunderAnnouncementsResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        ...(isPremium !== undefined && { isPremium: String(isPremium) }),
        page,
        size,
      },
    }),
};
