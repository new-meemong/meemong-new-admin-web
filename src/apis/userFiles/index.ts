import {
  IUserFile,
  UserFileOrderBy,
  UserFileSearchType,
  UserFileSort,
  UserFileType,
} from "@/models/userFiles";

import { PaginatedResponse } from "@/apis/types";
import { UserListRoleType } from "@/models/users";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/user-files";

export type GetUserFilesRequest = {
  userRole?: UserListRoleType;
  fileTypes?: UserFileType[];
  searchType?: UserFileSearchType;
  searchKeyword?: string;
  orderBy?: UserFileOrderBy;
  sort?: UserFileSort;
  page?: number;
  size?: number;
};

export type GetUserFilesResponse = PaginatedResponse<IUserFile>;

export type GetUserFileDetailResponse = {
  data: IUserFile;
};

export type DeleteUserFileResponse = {
  data: null;
};

export const userFileAPI = {
  getAll: ({
    userRole,
    fileTypes,
    searchType,
    searchKeyword,
    orderBy = "updatedAt",
    sort = "DESC",
    page = 1,
    size = 10,
  }: GetUserFilesRequest = {}) =>
    fetcher<GetUserFilesResponse>(BASE_URL, {
      query: {
        ...(userRole && { userRole }),
        ...(fileTypes && fileTypes.length > 0 && { fileTypes }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        orderBy,
        sort,
        page,
        size,
      },
    }),

  getById: async (id?: number) => {
    const response = await fetcher<GetUserFileDetailResponse>(
      `${BASE_URL}/${id}`,
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await fetcher<DeleteUserFileResponse>(
      `${BASE_URL}/${id}`,
      {
        method: "DELETE",
      },
    );
    return response;
  },
};
