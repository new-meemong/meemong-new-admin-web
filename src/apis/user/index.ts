import {
  IUser,
  IUserBlockInfo,
  IUserForm,
  UserListRoleType,
  UserSearchType,
} from "@/models/users";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  PaginatedResponse,
  ServerPaginatedResponse,
  normalizePaginatedResponse,
} from "@/apis/types";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/users";

export type GetUsersRequest = {
  role?: UserListRoleType; // 1 | 2 (1: model, 2: designer)
  blockType?: 1 | 2; // 1: 차단, 2: 탈퇴 (차단이랑 같음)
  searchType?: UserSearchType;
  searchKeyword?: string;
  brandId?: number;
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

export type UpdateUserRequest = {
  userId: number;
  displayName?: string;
  designerInfo?: {
    description?: string | null;
    storeReservationNotice?: string | null;
  };
  modelInfo?: { paymodel?: boolean };
};

export type UpdateUserResponse = { data: null };

export const userAPI = {
  deletePhoto: (deleteUrl: string) =>
    fetcher<{ data: null }>(deleteUrl, { method: "DELETE" }),
  getAll: async ({
    role,
    blockType,
    searchKeyword,
    searchType,
    brandId,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetUsersRequest) => {
    const response = await fetcher<ServerPaginatedResponse<IUser>>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(blockType && { blockType }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        ...(brandId !== undefined && { brandId }),
        page,
        size,
      },
    });

    return normalizePaginatedResponse(response);
  },
  getById: async (userId?: number) => {
    const response = await fetcher<GetUserDetailResponse>(
      `${BASE_URL}/${userId}`,
    );
    return response.data;
  },
  getUserBlockList: async (userId?: number) => {
    const response = await fetcher<GetUserBlockListResponse>(
      `${BASE_URL}/${userId}/block-list`,
    );
    return response;
  },
  create: (user: Omit<IUserForm, "id">) =>
    fetcher<IUser>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(user),
    }),
  updateBlock: async (request: UpdateUserBlockRequest) => {
    const response = await fetcher<UpdateUserBlockResponse>(
      `${BASE_URL}/${request.userId}/block`,
      {
        method: "PUT",
        body: JSON.stringify({
          isBlocked: request.isBlocked,
          description: request.description,
        }),
      },
    );

    return response;
  },
  update: ({ userId, ...changes }: UpdateUserRequest) =>
    fetcher<UpdateUserResponse>(`${BASE_URL}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(changes),
    }),
  delete: (id: number) =>
    fetcher<void>(`${BASE_URL}/${id}`, {
      method: "DELETE",
    }),
};
