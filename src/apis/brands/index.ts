import { IBrand, IBrandCreateRequest, IBrandUpdateRequest, IBrandJoinRequest, IBrandLeaveRequest } from "@/models/brand";
import { PaginatedResponse } from "@/apis/types";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/brands";

export type GetBrandsRequest = {
  page?: number;
  size?: number;
};

export type GetBrandsResponse = PaginatedResponse<IBrand>;

export type PostBrandRequest = IBrandCreateRequest;

export type PostBrandResponse = {
  data: IBrand;
};

export type PatchBrandRequest = {
  id: number;
} & IBrandUpdateRequest;

export type PatchBrandResponse = {
  data: IBrand;
};

export type DeleteBrandRequest = {
  id: number;
};

export type PostBrandJoinRequest = {
  id: number;
} & IBrandJoinRequest;

export type PostBrandJoinResponse = {
  data: {
    brandId: number;
  };
};

export type PostBrandLeaveRequest = {
  id: number;
} & IBrandLeaveRequest;

export type PostBrandLeaveResponse = {
  data: null;
};

export const brandAPI = {
  getAll: async ({ page, size }: GetBrandsRequest = {}) => {
    const response = await fetcher<GetBrandsResponse>(BASE_URL, {
      query: {
        ...(page !== undefined && { page }),
        ...(size !== undefined && { size }),
      },
    });

    return response;
  },

  create: async (request: PostBrandRequest) => {
    const response = await fetcher<PostBrandResponse>(BASE_URL, {
      method: "POST",
      json: request,
    });

    return response;
  },

  update: async (request: PatchBrandRequest) => {
    const { id, ...body } = request;
    const response = await fetcher<PatchBrandResponse>(`${BASE_URL}/${id}`, {
      method: "PATCH",
      json: body,
    });

    return response;
  },

  delete: async (request: DeleteBrandRequest) => {
    await fetcher<null>(`${BASE_URL}/${request.id}`, {
      method: "DELETE",
    });

    return null;
  },

  join: async (request: PostBrandJoinRequest) => {
    const { id, ...body } = request;
    const response = await fetcher<PostBrandJoinResponse>(
      `${BASE_URL}/${id}/join`,
      {
        method: "POST",
        json: body,
      }
    );

    return response;
  },

  leave: async (request: PostBrandLeaveRequest) => {
    const { id, ...body } = request;
    const response = await fetcher<PostBrandLeaveResponse>(
      `${BASE_URL}/${id}/leave`,
      {
        method: "POST",
        json: body,
      }
    );

    return response;
  },
};


