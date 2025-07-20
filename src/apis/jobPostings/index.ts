import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  IJobPosting,
  IJobPostingForm,
  JobPostingRoleType,
} from "@/models/jobPostings";

const BASE_URL = "/api/v1/admins/job-postings";

export type GetJobPostingsRequest = {
  storeName?: string;
  role?: JobPostingRoleType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetJobPostingsResponse = PaginatedResponse<IJobPosting>;

export type GetJobPostingByIdResponse = IJobPostingForm;

export type GetJobPostingsByUserIdResponse = {
  totalCount: number;
  content: IJobPostingForm[];
};

export type DeleteJobPostingResponse = {
  success: boolean;
};

export const jobPostingAPI = {
  getAll: ({
    storeName,
    role,
    searchKeyword,
    searchType,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetJobPostingsRequest) =>
    fetcher<GetJobPostingsResponse>(BASE_URL, {
      query: {
        ...(storeName && { storeName }),
        ...(role && { role }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size,
      },
    }),
  getById: async (jobPostingId?: number) => {
    const response = await fetcher<IJobPostingForm>(
      `${BASE_URL}/${jobPostingId}`,
    );

    return response;
  },
  getAllByUserId: async (userId?: number) => {
    const response = await fetcher<GetJobPostingsByUserIdResponse>(
      `${BASE_URL}/user/${userId}`,
    );
    return response;
  },
  delete: async (jobPostingId?: number) => {
    const response = await fetcher<DeleteJobPostingResponse>(
      `${BASE_URL}/${jobPostingId}`,
      {
        method: "DELETE",
      },
    );
    return response;
  },
};
