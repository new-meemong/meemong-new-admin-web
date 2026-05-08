import {
  ChattingRoomReportRoleFilter,
  ChattingRoomReportStatus,
  IChattingRoomReport,
} from "@/models/chattingRoomReports";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import {
  PaginatedResponse,
  ServerPaginatedResponse,
  normalizePaginatedResponse,
} from "@/apis/types";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/chatting-room-reports";

export type GetChattingRoomReportsRequest = {
  page?: number;
  size?: number;
  status?: ChattingRoomReportStatus;
  chattingRoomId?: string;
  userId?: number;
  userRoles?: ChattingRoomReportRoleFilter[];
};

export type GetChattingRoomReportsResponse =
  PaginatedResponse<IChattingRoomReport>;

export type PatchChattingRoomReportStatusRequest = {
  id: number;
  status: ChattingRoomReportStatus;
};

export type PatchChattingRoomReportStatusResponse = {
  success: boolean;
};

type GetChattingRoomReportByIdResponse =
  | IChattingRoomReport
  | { data: IChattingRoomReport };

export const chattingRoomReportsAPI = {
  getAll: async ({
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    status,
    chattingRoomId,
    userId,
    userRoles,
  }: GetChattingRoomReportsRequest): Promise<GetChattingRoomReportsResponse> => {
    const response = await fetcher<
      ServerPaginatedResponse<IChattingRoomReport>
    >(BASE_URL, {
      query: {
        page,
        size,
        ...(status && { status }),
        ...(chattingRoomId && { chattingRoomId }),
        ...(userId && { userId }),
        ...(userRoles && userRoles.length > 0 && { "userRoles[]": userRoles }),
      },
    });

    return normalizePaginatedResponse(response);
  },
  getById: async (id: number): Promise<IChattingRoomReport> => {
    const response = await fetcher<GetChattingRoomReportByIdResponse>(
      `${BASE_URL}/${id}`,
    );

    return "data" in response ? response.data : response;
  },
  updateStatus: ({
    id,
    status,
  }: PatchChattingRoomReportStatusRequest): Promise<PatchChattingRoomReportStatusResponse> =>
    fetcher<PatchChattingRoomReportStatusResponse>(`${BASE_URL}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
