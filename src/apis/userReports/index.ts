import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  IUserReport,
  UserReportRoleFilter,
  UserReportStatus,
} from "@/models/userReports";
import { PaginatedResponse } from "@/apis/types";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/user-reports";

export type GetUserReportsRequest = {
  page?: number;
  size?: number;
  status?: UserReportStatus;
  reportedUserId?: number;
  userId?: number;
  userRoles?: UserReportRoleFilter[];
};

export type GetUserReportsResponse = PaginatedResponse<IUserReport>;

export type PatchUserReportStatusRequest = {
  id: number;
  status: UserReportStatus;
};

export type PatchUserReportStatusResponse = {
  success: boolean;
};

export const userReportsAPI = {
  getAll: ({
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    status,
    reportedUserId,
    userId,
    userRoles,
  }: GetUserReportsRequest): Promise<GetUserReportsResponse> =>
    fetcher<GetUserReportsResponse>(BASE_URL, {
      query: {
        page,
        size,
        ...(status && { status }),
        ...(reportedUserId && { reportedUserId }),
        ...(userId && { userId }),
        ...(userRoles && userRoles.length > 0 && { "userRoles[]": userRoles }),
      },
    }),
  getById: (id: number): Promise<IUserReport> =>
    fetcher<IUserReport>(`${BASE_URL}/${id}`),
  updateStatus: ({
    id,
    status,
  }: PatchUserReportStatusRequest): Promise<PatchUserReportStatusResponse> =>
    fetcher<PatchUserReportStatusResponse>(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
