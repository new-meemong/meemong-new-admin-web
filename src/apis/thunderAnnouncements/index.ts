import {
  IThunderAnnouncement,
  IThunderAnnouncementForm,
  ThunderAnnouncementAreaType,
  ThunderAnnouncementConditionType,
  ThunderAnnouncementPriceType,
  ThunderAnnouncementType,
  ThunderAnnouncementUpdatePremiumType
} from "@/models/thunderAnnouncements";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { UserRoleType } from "@/models/users";
import { fetcher } from "@/apis/core";

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
  thunderAnnouncementId: number;
  isApproved: boolean; // true: 승인(1), false: 보류(2)
};

export type PutThunderAnnouncementPremiumResponse = {
  isApproved: boolean;
};

export type PutThunderAnnouncementRequest = {
  thunderAnnouncementId: number;
  title?: string;
  name?: string;
  description?: string;
  area?: ThunderAnnouncementAreaType;
  price?: number;
  desiredTreatmentDateTime?: string; // ISO 8601 format
  selectedServices?: string[];
  priceType?: ThunderAnnouncementPriceType;
  conditionTypes?: ThunderAnnouncementConditionType[];
  isCommentEnabled?: boolean;
  isPremium?: ThunderAnnouncementUpdatePremiumType; // 0: 일반, 2: 프리미엄 보류
};

export type PutThunderAnnouncementResponse = {
  isSuccess: boolean;
};

export type DeleteThunderAnnouncementResponse = {
  isSuccess: boolean;
};

export const thunderAnnouncementAPI = {
  getAll: ({
    role,
    type,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size
  }: GetThunderAnnouncementsRequest) =>
    fetcher<GetThunderAnnouncementsResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(type && { type }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size
      }
    }),
  getById: async (thunderAnnouncementId?: number) => {
    const response = await fetcher<GetThunderAnnouncementByIdResponse>(
      `${BASE_URL}/${thunderAnnouncementId}`
    );
    return response.data;
  },
  updatePremium: async ({
    thunderAnnouncementId,
    isApproved
  }: PutThunderAnnouncementPremiumRequest) => {
    const response = await fetcher<PutThunderAnnouncementPremiumResponse>(
      `${BASE_URL}/${thunderAnnouncementId}/premium`,
      {
        method: "PUT",
        body: JSON.stringify({ isApproved })
      }
    );

    return response;
  },
  update: async ({
    thunderAnnouncementId,
    ...body
  }: PutThunderAnnouncementRequest) => {
    const response = await fetcher<PutThunderAnnouncementResponse>(
      `${BASE_URL}/${thunderAnnouncementId}`,
      {
        method: "PUT",
        body: JSON.stringify(body)
      }
    );

    return response;
  },
  delete: async (thunderAnnouncementId?: number) => {
    const response = await fetcher<DeleteThunderAnnouncementResponse>(
      `${BASE_URL}/${thunderAnnouncementId}`,
      {
        method: "DELETE"
      }
    );

    return response;
  }
};
