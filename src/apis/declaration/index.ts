import { PaginatedResponse } from "@/apis/types";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import { IDeclaration, IDeclarationForm } from "@/models/declaration";
import { SearchType } from "@/models/common";
import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/declarations";

export type GetDeclarationsRequest = {
  status?: string;
  searchType?: SearchType;
  searchKeyword?: string;
  page?: number;
  size?: number;
};
export type GetDeclarationsResponse = PaginatedResponse<IDeclaration>;

export type PutDeclarationRequest = {
  id: number;
  declaration: Partial<IDeclarationForm>;
};

export type PutDeclarationResponse = {
  success: boolean;
};


export const declarationAPI = {
  getAll: ({
    status,
    searchType,
    searchKeyword,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
  }: GetDeclarationsRequest): Promise<GetDeclarationsResponse> =>
    fetcher<GetDeclarationsResponse>(BASE_URL, {
      query: {
        ...(status && { status }),
        ...(searchKeyword && searchType && { searchKeyword, searchType }),
        page,
        size,
      },
    }),
  getById: async ({
    declarationId,
  }: {
    declarationId: number;
  }): Promise<IDeclarationForm> => {
    const response = await fetcher<IDeclarationForm>(
      `${BASE_URL}/${declarationId}`,
    );

    return response;
  },
  update: async (request: PutDeclarationRequest) => {
    const response = await fetcher<PutDeclarationResponse>(
      `${BASE_URL}/${request.id}`,
      {
        method: "PUT",
        body: JSON.stringify(request.declaration),
      },
    );

    return response;
  },
};
