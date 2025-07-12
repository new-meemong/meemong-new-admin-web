import { fetcher } from "@/apis/core";
import { PaginatedResponse } from "@/apis/types";
import { SearchType } from "@/models/common";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IJobPosting, JobPostingRoleType } from "@/models/jobPostings";

const BASE_URL = "/api/v1/admins/job-contacts";

export type GetJobPostingsRequest = {
  storeName?: string;
  role?: JobPostingRoleType;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetJobPostingsResponse = PaginatedResponse<IJobPosting>;

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
};
