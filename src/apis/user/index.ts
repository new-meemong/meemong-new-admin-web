import { IUser, IUserBlockInfo, IUserForm, UserRoleType } from "@/models/users";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/users";

export type GetUsersRequest = {
  role?: UserRoleType; // 1 | 2 (1: model, 2: designer)
  blockType?: 1; // 1: 차단만 (API는 숫자 1만 받음)
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetUsersResponse = PaginatedResponse<IUser>;

export type GetUserDetailResponse = {
  data: IUserForm;
};

export type GetUserBlockListResponse = {
  isBlocked: boolean;
  blockList: IUserBlockInfo[];
};

export type UpdateUserBlockRequest = {
  userId: number;
  description?: string;
  isBlocked: boolean;
};

export type UpdateUserBlockResponse = {
  isBlocked: boolean;
};

export type UpdateUserDescriptionRequest = {
  userId: number;
  description: string;
};

export type UpdateUserDescriptionResponse = {
  description: string;
};

export type UpdateUserPayModelRequest = {
  userId: number;
  paymodel: boolean;
};

export type UpdateUserPayModelResponse = {
  paymodel: boolean;
};

export const userAPI = {
  getAll: ({
    role,
    blockType,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size
  }: GetUsersRequest) =>
    fetcher<GetUsersResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        // blockType은 숫자 1만 전송 (API 스펙에 따르면 1: 차단만)
        ...(blockType && { blockType: 1 }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size
      }
    }),
  getById: async (userId?: number) => {
    const response = await fetcher<GetUserDetailResponse>(
      `${BASE_URL}/${userId}`
    );
    return response.data;
  },
  getUserBlockList: async (userId?: number) => {
    const response = await fetcher<GetUserBlockListResponse>(
      `${BASE_URL}/${userId}/block-list`
    );
    return response;
  },
  create: (user: Omit<IUserForm, "id">) =>
    fetcher<IUser>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(user)
    }),
  updateBlock: async (request: UpdateUserBlockRequest) => {
    const response = await fetcher<UpdateUserBlockResponse>(
      `${BASE_URL}/${request.userId}/block`,
      {
        method: "PUT",
        body: JSON.stringify({
          isBlocked: request.isBlocked,
          description: request.description
        })
      }
    );

    return response;
  },
  updateDescription: async (request: UpdateUserDescriptionRequest) => {
    const response = await fetcher<UpdateUserDescriptionResponse>(
      `${BASE_URL}/${request.userId}/description`,
      {
        method: "PUT",
        body: JSON.stringify({
          description: request.description
        })
      }
    );

    return response;
  },
  updatePayModel: async (request: UpdateUserPayModelRequest) => {
    const response = await fetcher<UpdateUserPayModelResponse>(
      `${BASE_URL}/${request.userId}/paymodel`,
      {
        method: "PUT",
        body: JSON.stringify({
          paymodel: request.paymodel
        })
      }
    );

    return response;
  },
  delete: (id: number) =>
    fetcher<void>(`${BASE_URL}/${id}`, {
      method: "DELETE"
    })
};
