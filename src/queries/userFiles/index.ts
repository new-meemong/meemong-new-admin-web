import {
  DeleteUserFileResponse,
  GetUserFilesRequest,
  GetUserFilesResponse,
  userFileAPI
} from "@/apis/userFiles";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import { IUserFile } from "@/models/userFiles";
import { normalizeParams } from "@/utils/query";

export const useGetUserFilesQuery = (
  params: GetUserFilesRequest,
  config?: Omit<
    UseQueryOptions<GetUserFilesResponse, Error>,
    "queryFn" | "queryKey"
  >
): UseQueryResult<GetUserFilesResponse, Error> =>
  useQuery({
    queryKey: ["GET_USER_FILES", normalizeParams(params)],
    queryFn: () => userFileAPI.getAll(params),
    ...config
  });

export const useGetUserFileDetailQuery = (
  userFileId?: number,
  config?: Omit<UseQueryOptions<IUserFile, Error>, "queryFn" | "queryKey">
): UseQueryResult<IUserFile, Error> =>
  useQuery({
    queryKey: ["GET_USER_FILE_DETAIL", userFileId],
    queryFn: () => userFileAPI.getById(userFileId),
    enabled: Boolean(userFileId),
    ...config
  });

export const useDeleteUserFileMutation = (
  config?: Omit<
    UseMutationOptions<DeleteUserFileResponse, Error, number>,
    "mutationFn"
  >
): UseMutationResult<DeleteUserFileResponse, Error, number> =>
  useMutation({
    mutationFn: (id) => userFileAPI.delete(id),
    ...config
  });
