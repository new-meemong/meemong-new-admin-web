import { IUserBlock, IUserBlockStatus } from "@/models/blocks";

import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { PaginatedResponse } from "@/apis/types";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/blocks";

export type PostUserBlockRequest = {
  userId: number;
  reason: string;
  blockDays: number;
};

export type PostUserBlockResponse = {
  data: IUserBlock;
};

export type PostUserUnblockRequest = {
  userId: number;
};

export type PostUserUnblockResponse = {
  data: {
    id: number;
  };
};

export type GetUserBlockStatusRequest = {
  userId: number;
};

export type GetUserBlockStatusResponse = {
  data: IUserBlockStatus | null;
};

export type GetUserBlockHistoriesRequest = {
  userId: number;
  page?: number;
  size?: number;
};

export type GetUserBlockHistoriesResponse = PaginatedResponse<IUserBlock>;

export const blocksAPI = {
  create: (request: PostUserBlockRequest) =>
    fetcher<PostUserBlockResponse>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(request),
    }),
  unblock: (request: PostUserUnblockRequest) =>
    fetcher<PostUserUnblockResponse>(`${BASE_URL}/unblock`, {
      method: "POST",
      body: JSON.stringify(request),
    }),
  getStatus: (request: GetUserBlockStatusRequest) =>
    fetcher<GetUserBlockStatusResponse>(`${BASE_URL}/status`, {
      query: {
        userId: request.userId,
      },
    }),
  getHistories: ({
    userId,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetUserBlockHistoriesRequest) =>
    fetcher<GetUserBlockHistoriesResponse>(`${BASE_URL}/histories`, {
      query: {
        userId,
        page,
        size,
      },
    }),
};
