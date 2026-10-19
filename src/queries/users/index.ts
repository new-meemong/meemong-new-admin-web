import { ApiError } from "@/apis/core";
import {
  GetUserBlockListResponse,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserBlockRequest,
  UpdateUserBlockResponse,
  UpdateUserDescriptionRequest,
  UpdateUserDescriptionResponse,
  UpdateUserDisplayNameRequest,
  UpdateUserDisplayNameResponse,
  UpdateUserPayModelRequest,
  UpdateUserPayModelResponse,
  userAPI,
} from "@/apis/user";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";

import { IUserForm } from "@/models/users";

export const useGetUsersQuery = (
  params: GetUsersRequest,
  config?: Omit<
    UseQueryOptions<GetUsersResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetUsersResponse, Error> =>
  useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => userAPI.getAll(params),
    ...config,
  });

export const useGetUserDetailQuery = (
  userId?: number,
  config?: Omit<UseQueryOptions<IUserForm, Error>, "queryFn" | "queryKey">,
): UseQueryResult<IUserForm, Error> =>
  useQuery<IUserForm, Error>({
    queryKey: ["GET_USER_DETAIL", userId],
    queryFn: () => userAPI.getById(userId),
    enabled: Boolean(userId),
    ...config,
  });

export const useGetUserBlockListQuery = (
  userId: number,
  config?: UseQueryOptions<GetUserBlockListResponse, Error>,
): UseQueryResult<GetUserBlockListResponse, Error> =>
  useQuery<GetUserBlockListResponse, Error>({
    queryKey: ["GET_USER_BLOCK_LIST", userId],
    queryFn: () => userAPI.getUserBlockList(userId),
    ...config,
  });

export const useUpdateUserBlockMutation = (
  config?: Omit<
    UseMutationOptions<UpdateUserBlockResponse, Error, UpdateUserBlockRequest>,
    "mutationFn"
  >,
): UseMutationResult<UpdateUserBlockResponse, Error, UpdateUserBlockRequest> =>
  useMutation({
    mutationFn: (request) => userAPI.updateBlock(request),
    ...config,
  });

export const useUpdateUserDescriptionMutation = (
  config?: Omit<
    UseMutationOptions<
      UpdateUserDescriptionResponse,
      Error,
      UpdateUserDescriptionRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  UpdateUserDescriptionResponse,
  Error,
  UpdateUserDescriptionRequest
> =>
  useMutation({
    mutationFn: (request) => userAPI.updateDescription(request),
    ...config,
  });

export const useUpdateUserPayModelMutation = (
  config?: Omit<
    UseMutationOptions<
      UpdateUserPayModelResponse,
      Error,
      UpdateUserPayModelRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  UpdateUserPayModelResponse,
  Error,
  UpdateUserPayModelRequest
> =>
  useMutation({
    mutationFn: (request) => userAPI.updatePayModel(request),
    ...config,
  });

export const useUpdateUserDisplayNameMutation = (
  config?: Omit<
    UseMutationOptions<
      UpdateUserDisplayNameResponse,
      Error,
      UpdateUserDisplayNameRequest
    >,
    "mutationFn"
  >,
): UseMutationResult<
  UpdateUserDisplayNameResponse,
  Error,
  UpdateUserDisplayNameRequest
> =>
  useMutation({
    mutationFn: (request) => userAPI.updateDisplayName(request),
    ...config,
  });

// 서버가 대표 사진 fallback과 캐시를 갱신하므로 삭제 결과를 로컬에서 추정하지 않는다.
export const deleteUserPhotoMutationOptions = (
  client: QueryClient,
  userId: number,
) => ({
  mutationFn: async (deleteUrl: string) => {
    let notFoundError: ApiError | undefined;
    try {
      await userAPI.deletePhoto(deleteUrl);
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 404 ||
        error.code !== "NOT_FOUND_ERROR"
      )
        throw error;
      notFoundError = error;
    }

    const refreshes = await Promise.allSettled([
      client
        .invalidateQueries({
          queryKey: ["GET_USER_DETAIL", userId],
          refetchType: "none",
        })
        .then(() =>
          client.fetchQuery({
            queryKey: ["GET_USER_DETAIL", userId],
            queryFn: () => userAPI.getById(userId),
            retry: false,
          }),
        ),
      ...["GET_USERS", "GET_USER_FILES", "GET_BEAUTY_APPLICATION_IMAGES"].map(
        (key) =>
          client.invalidateQueries({ queryKey: [key] }, { throwOnError: true }),
      ),
    ] as const);
    if (notFoundError) {
      const detail = refreshes[0];
      // 404만으로 삭제를 확정하지 않는다. 라우트 누락이나 재조회 실패도
      // 가능하므로 서버 목록에서 선택한 사진이 사라졌는지 확인해야 한다.
      if (
        detail.status !== "fulfilled" ||
        !Array.isArray(detail.value?.userPhotos) ||
        detail.value.userPhotos.some((photo) => photo.deleteUrl === deleteUrl)
      )
        throw notFoundError;
    }
    // DELETE 성공 또는 서버 목록에서 부재를 확인한 뒤의 목록 갱신 실패는 구분한다.
    return {
      alreadyDeleted: Boolean(notFoundError),
      refreshFailed: refreshes.some((result) => result.status === "rejected"),
    };
  },
});

export const useDeleteUserPhotoMutation = (userId: number) => {
  const client = useQueryClient();
  return useMutation(deleteUserPhotoMutationOptions(client, userId));
};
