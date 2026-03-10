import {
  DeleteShampooRoomCommentRequest,
  GetShampooRoomCommentsRequest,
  GetShampooRoomCommentsResponse,
  GetShampooRoomsRequest,
  GetShampooRoomsResponse,
  PutShampooRoomRequest,
  PutShampooRoomResponse,
  shampooRoomAPI
} from "@/apis/shampooRooms";
import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery
} from "@tanstack/react-query";

import { IShampooRoomDetail } from "@/models/shampooRooms";

export const useGetShampooRoomsQuery = (
  params: GetShampooRoomsRequest,
  config?: Omit<
    UseQueryOptions<GetShampooRoomsResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<GetShampooRoomsResponse, Error> =>
  useQuery({
    queryKey: ["GET_SHAMPOO_ROOMS", params],
    queryFn: () => shampooRoomAPI.getAll(params),
    ...config
  });

export const useGetShampooRoomByIdQuery = (
  id: number,
  config?: Omit<
    UseQueryOptions<IShampooRoomDetail, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<IShampooRoomDetail, Error> =>
  useQuery({
    queryKey: ["GET_SHAMPOO_ROOM_BY_ID", id],
    queryFn: () => shampooRoomAPI.getById(id),
    enabled: Boolean(id),
    ...config
  });

export const useGetShampooRoomCommentsQuery = (
  params: GetShampooRoomCommentsRequest,
  config?: Omit<
    UseQueryOptions<GetShampooRoomCommentsResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<GetShampooRoomCommentsResponse, Error> =>
  useQuery({
    queryKey: ["GET_SHAMPOO_ROOM_COMMENTS", params],
    queryFn: () => shampooRoomAPI.getComments(params),
    enabled: Boolean(params.shampooRoomId),
    ...config
  });

export const usePutShampooRoomMutation = (
  config?: Omit<
    UseMutationOptions<PutShampooRoomResponse, Error, PutShampooRoomRequest>,
    "mutationFn"
  >
): UseMutationResult<PutShampooRoomResponse, Error, PutShampooRoomRequest> =>
  useMutation({
    mutationFn: (request: PutShampooRoomRequest) =>
      shampooRoomAPI.update(request),
    ...config
  });

export const useDeleteShampooRoomMutation = (
  config?: Omit<UseMutationOptions<void, Error, number>, "mutationFn">
): UseMutationResult<void, Error, number> =>
  useMutation({
    mutationFn: (id: number) => shampooRoomAPI.delete(id),
    ...config
  });

export const useDeleteShampooRoomCommentMutation = (
  config?: Omit<
    UseMutationOptions<void, Error, DeleteShampooRoomCommentRequest>,
    "mutationFn"
  >
): UseMutationResult<void, Error, DeleteShampooRoomCommentRequest> =>
  useMutation({
    mutationFn: (request: DeleteShampooRoomCommentRequest) =>
      shampooRoomAPI.deleteComment(request),
    ...config
  });
