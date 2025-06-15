import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { PaginatedResponse } from "@/apis/types";
import { IDeclaration, IDeclarationForm } from "@/models/declaration";
import { declarationAPI, GetDeclarationsRequest } from "@/apis/declaration";

export const useGetDeclarationsQuery = (
  params: GetDeclarationsRequest,
  config?: UseQueryOptions<PaginatedResponse<IDeclaration>, Error>,
): UseQueryResult<PaginatedResponse<IDeclaration>, Error> =>
  useQuery<PaginatedResponse<IDeclaration>, Error>({
    queryKey: ["GET_DECLARATIONS"],
    queryFn: () => declarationAPI.getAll(params),
    ...config,
  });

export const useGetDeclarationDetailQuery = (
  declarationId: number,
  config?: UseQueryOptions<IDeclarationForm, Error>,
): UseQueryResult<IDeclarationForm, Error> =>
  useQuery<IDeclarationForm, Error>({
    queryKey: ["GET_DECLARATION_DETAIL", declarationId],
    queryFn: () => declarationAPI.getById({ declarationId }),
    enabled: Boolean(declarationId),
    ...config,
  });
