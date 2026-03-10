import {
  IShampooRoom,
  IShampooRoomComment,
  IShampooRoomDetail,
  IShampooRoomImage,
  ShampooRoomCategory
} from "@/models/shampooRooms";

import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/shampoo-rooms";

export type GetShampooRoomsRequest = {
  __nextCursor?: string;
  __limit?: number;
  category?: ShampooRoomCategory;
  addresses?: string[];
};

export type GetShampooRoomsResponse = {
  dataCount: number;
  dataList: IShampooRoom[];
  __nextCursor: string;
};

export type GetShampooRoomByIdResponse = {
  data: IShampooRoomDetail;
};

export type GetShampooRoomCommentsRequest = {
  shampooRoomId: number;
};

export type GetShampooRoomCommentsResponse = {
  dataCount: number;
  dataList: IShampooRoomComment[];
};

export type PutShampooRoomRequest = {
  id: number;
  title?: string;
  category?: ShampooRoomCategory;
  content?: string;
  images?: IShampooRoomImage[];
};

export type PutShampooRoomResponse = {
  data: { id: number };
};

export type DeleteShampooRoomCommentRequest = {
  shampooRoomId: number;
  shampooRoomsCommentId: number;
};

export const shampooRoomAPI = {
  getAll: ({
    __nextCursor,
    __limit,
    category,
    addresses
  }: GetShampooRoomsRequest): Promise<GetShampooRoomsResponse> =>
    fetcher<GetShampooRoomsResponse>(BASE_URL, {
      query: {
        ...(__nextCursor && { __nextCursor }),
        ...(__limit && { __limit }),
        ...(category && { category }),
        ...(addresses &&
          addresses.length > 0 && { addresses: addresses.join(",") })
      }
    }),

  getById: async (id: number): Promise<IShampooRoomDetail> => {
    const response = await fetcher<GetShampooRoomByIdResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  getComments: ({
    shampooRoomId
  }: GetShampooRoomCommentsRequest): Promise<GetShampooRoomCommentsResponse> =>
    fetcher<GetShampooRoomCommentsResponse>(
      `${BASE_URL}/${shampooRoomId}/comments`
    ),

  update: async ({
    id,
    ...body
  }: PutShampooRoomRequest): Promise<PutShampooRoomResponse> =>
    fetcher<PutShampooRoomResponse>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  delete: async (id: number): Promise<void> =>
    fetcher<void>(`${BASE_URL}/${id}`, {
      method: "DELETE",
      body: JSON.stringify({})
    }),

  deleteComment: async ({
    shampooRoomId,
    shampooRoomsCommentId
  }: DeleteShampooRoomCommentRequest): Promise<void> =>
    fetcher<void>(
      `${BASE_URL}/${shampooRoomId}/comments/${shampooRoomsCommentId}`,
      {
        method: "DELETE"
      }
    )
};
