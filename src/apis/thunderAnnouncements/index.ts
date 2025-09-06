import { UserRoleType } from "@/models/users";
import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  IThunderAnnouncement,
  IThunderAnnouncementForm,
  ThunderAnnouncementType,
  ThunderAnnouncmentPremiumType,
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

export type GetThunderAnnouncementByIdRequest = {
  thunderAnnouncementId?: number;
};

export type GetThunderAnnouncementByIdResponse = {
  data: IThunderAnnouncementForm;
};

export type PutThunderAnnouncementPremiumRequest = {
  thunderAnnouncementId?: number;
  isPremium: ThunderAnnouncmentPremiumType;
};

export type PutThunderAnnouncementPremiumResponse = {
  isPremium: ThunderAnnouncmentPremiumType;
};

export type DeleteThunderAnnouncementResponse = {
  success: boolean;
};

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
  getById: async (thunderAnnouncementId?: number) => {
    const response = await fetcher<GetThunderAnnouncementByIdResponse>(
      `${BASE_URL}/${thunderAnnouncementId}`,
    );
    return response.data;
  },
  updatePremium: async ({
    thunderAnnouncementId,
    isPremium,
  }: PutThunderAnnouncementPremiumRequest) => {
    const response = await fetcher<PutThunderAnnouncementPremiumResponse>(
      `${BASE_URL}/${thunderAnnouncementId}/premium`,
      {
        method: "PUT",
        body: JSON.stringify({ isPremium }),
      },
    );

    return response;
  },
  delete: async (thunderAnnouncementId?: number) => {
    const response = await fetcher<DeleteThunderAnnouncementResponse>(
      `${BASE_URL}/${thunderAnnouncementId}`,
      {
        method: "DELETE",
      },
    );

    return response;
  },
};
