import { BlockType, IUser, IUserForm, UserRoleType } from "@/models/users";
import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";

const BASE_URL = "/api/v1/admins/users";

export type GetUsersRequest = {
  role?: UserRoleType;
  blockType?: BlockType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetUsersResponse = PaginatedResponse<IUser>;

export type GetUserDetailResponse = {
  data: IUserForm;
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
    size = DEFAULT_PAGINATION.size,
  }: GetUsersRequest) =>
    fetcher<GetUsersResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(blockType && { blockType }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size,
      },
    }),
  getById: async (userId?: number) => {
    const response = await fetcher<GetUserDetailResponse>(
      `${BASE_URL}/${userId}`,
    );
    return response.data;
  },
  create: (user: Omit<IUserForm, "id">) =>
    fetcher<IUser>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(user),
    }),

  updatePayModel: async (request: UpdateUserPayModelRequest) => {
    const response = await fetcher<UpdateUserPayModelResponse>(
      `${BASE_URL}/${request.userId}/paymodel`,
      {
        method: "PUT",
        body: JSON.stringify({
          paymodel: request.paymodel,
        }),
      },
    );

    return response;
  },

  delete: (id: number) =>
    fetcher<void>(`${BASE_URL}/${id}`, {
      method: "DELETE",
    }),
};
