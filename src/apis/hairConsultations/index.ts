import {
  IHairConsultationAnswer,
  IHairConsultationComment,
  IHairConsultationDetail,
  IHairConsultationListItem
} from "@/models/hairConsultations";

import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/hair-consultations";

export type GetHairConsultationsRequest = {
  __limit?: number;
  __nextCursor?: string;
  __orderColumn?:
    | "contentUpdatedAt"
    | "minPaymentPrice"
    | "maxPaymentPrice"
    | "popular"
    | "commentCountAndCreatedAt";
  __order?: "asc" | "desc";
  addresses?: string[];
  createdInsideDurationDays?: number;
};

export type CursorListResponse<T> = {
  dataList: T[];
  dataCount: number;
  __nextCursor: string | null;
};

export type GetHairConsultationsResponse =
  CursorListResponse<IHairConsultationListItem>;

export type GetHairConsultationByIdResponse = {
  data: IHairConsultationDetail;
};

export type GetHairConsultationCommentsRequest = {
  hairConsultationId: number;
  __limit?: number;
  __nextCursor?: string;
};

export type GetHairConsultationCommentsResponse =
  CursorListResponse<IHairConsultationComment>;

export type GetHairConsultationAnswersRequest = {
  hairConsultationId: number;
  __limit?: number;
};

export type GetHairConsultationAnswersResponse =
  CursorListResponse<IHairConsultationAnswer>;

export type GetHairConsultationAnswerByIdResponse = {
  data: IHairConsultationAnswer;
};

export type PutHairConsultationRequest = {
  hairConsultationId: number;
  title?: string;
  content?: string;
};

export const hairConsultationAPI = {
  getAll: ({
    __limit = 20,
    __nextCursor,
    __orderColumn,
    __order,
    addresses,
    createdInsideDurationDays
  }: GetHairConsultationsRequest): Promise<GetHairConsultationsResponse> =>
    fetcher<GetHairConsultationsResponse>(BASE_URL, {
      query: {
        __limit,
        ...(__nextCursor && { __nextCursor }),
        ...(__orderColumn && { __orderColumn }),
        ...(__order && { __order }),
        ...(addresses &&
          addresses.length > 0 && { addresses: addresses.join(",") }),
        ...(createdInsideDurationDays && { createdInsideDurationDays })
      }
    }),

  getById: async (
    hairConsultationId: number
  ): Promise<IHairConsultationDetail> => {
    const response = await fetcher<GetHairConsultationByIdResponse>(
      `${BASE_URL}/${hairConsultationId}`
    );
    return response.data;
  },

  getComments: ({
    hairConsultationId,
    __limit = 20,
    __nextCursor
  }: GetHairConsultationCommentsRequest): Promise<GetHairConsultationCommentsResponse> =>
    fetcher<GetHairConsultationCommentsResponse>(
      `${BASE_URL}/${hairConsultationId}/comments`,
      {
        query: {
          __limit,
          ...(__nextCursor && { __nextCursor })
        }
      }
    ),

  getAnswers: ({
    hairConsultationId,
    __limit = 20
  }: GetHairConsultationAnswersRequest): Promise<GetHairConsultationAnswersResponse> =>
    fetcher<GetHairConsultationAnswersResponse>(
      `${BASE_URL}/${hairConsultationId}/answers`,
      {
        query: { __limit }
      }
    ),

  getAnswerById: async (
    hairConsultationId: number,
    answerId: number
  ): Promise<IHairConsultationAnswer> => {
    const response = await fetcher<GetHairConsultationAnswerByIdResponse>(
      `${BASE_URL}/${hairConsultationId}/answers/${answerId}`
    );
    return response.data;
  },

  update: async ({
    hairConsultationId,
    ...body
  }: PutHairConsultationRequest): Promise<void> =>
    fetcher<void>(`${BASE_URL}/${hairConsultationId}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),

  delete: async (hairConsultationId: number): Promise<void> =>
    fetcher<void>(`${BASE_URL}/${hairConsultationId}`, {
      method: "DELETE"
    })
};
