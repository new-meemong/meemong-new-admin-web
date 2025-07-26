import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IResume, ResumeRoleType } from "@/models/resumes";
import { IResumeForm } from "@/models/resumes";

const BASE_URL = "/api/v1/admins/resumes";

export type GetResumesRequest = {
  storeName?: string;
  role?: ResumeRoleType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetResumesResponse = PaginatedResponse<IResume>;

export type GetResumesByUserIdResponse = {
  totalCount: number;
  content: IResumeForm[];
};

export type DeleteResumeResponse = {
  success: boolean;
};

export const resumeAPI = {
  getAll: ({
    role,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetResumesRequest) =>
    fetcher<GetResumesResponse>(BASE_URL, {
      query: {
        ...(role && { role }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size,
      },
    }),
  getAllByUserId: async (userId?: number) => {
    const response = await fetcher<GetResumesByUserIdResponse>(
      `${BASE_URL}/user/${userId}`,
    );
    return response;
  },
  delete: async (resumeId?: number) => {
    const response = await fetcher<DeleteResumeResponse>(
      `${BASE_URL}/${resumeId}`,
      {
        method: "DELETE",
      },
    );
    return response;
  },
};
