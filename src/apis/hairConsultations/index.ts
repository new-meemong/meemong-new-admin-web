import {
  IHairConsultationAnswer,
  IHairConsultationComment,
  IHairConsultationDetail,
  IHairConsultationListItem,
  HairConsultationOrderColumn,
  HairConsultationSearchType
} from "@/models/hairConsultations";

import { fetcher } from "@/apis/core";

const BASE_URL = "/api/v1/admins/hair-consultations";

export type GetHairConsultationsRequest = {
  __limit?: number;
  __nextCursor?: string;
  __orderColumn?: HairConsultationOrderColumn;
  __order?: "asc" | "desc";
  addresses?: string[];
  createdInsideDurationDays?: number;
  createdInsideDurationHours?: number;
  isRead?: boolean;
  isMine?: boolean;
  isMineComment?: boolean;
  isMineFavorite?: boolean;
  distance?: number;
  searchType?: HairConsultationSearchType;
  searchKeyword?: string;
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

type HairConsultationAnswerApiResponse = Omit<
  IHairConsultationAnswer,
  "bangsTypes" | "hairLengths" | "hairLayers" | "hairCurls" | "styleImages"
> & {
  bangsTypes: string[] | null;
  hairLengths: string[] | null;
  hairLayers: string[] | null;
  hairCurls: string[] | null;
  styleImages: string[] | null;
};

type GetHairConsultationAnswersApiResponse =
  CursorListResponse<HairConsultationAnswerApiResponse>;

type GetHairConsultationAnswerByIdApiResponse = {
  data: HairConsultationAnswerApiResponse;
};

const normalizeHairConsultationAnswer = (
  answer: HairConsultationAnswerApiResponse
): IHairConsultationAnswer => ({
  ...answer,
  bangsTypes: answer.bangsTypes ?? [],
  hairLengths: answer.hairLengths ?? [],
  hairLayers: answer.hairLayers ?? [],
  hairCurls: answer.hairCurls ?? [],
  styleImages: answer.styleImages ?? []
});

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
    createdInsideDurationDays,
    createdInsideDurationHours,
    isRead,
    isMine,
    isMineComment,
    isMineFavorite,
    distance,
    searchType,
    searchKeyword
  }: GetHairConsultationsRequest): Promise<GetHairConsultationsResponse> => {
    const trimmedSearchKeyword = searchKeyword?.trim();

    return fetcher<GetHairConsultationsResponse>(BASE_URL, {
      query: {
        __limit,
        ...(__nextCursor && { __nextCursor }),
        ...(__orderColumn && { __orderColumn }),
        ...(__order && { __order }),
        ...(addresses &&
          addresses.length > 0 && { addresses: addresses.join(",") }),
        ...(createdInsideDurationDays && { createdInsideDurationDays }),
        ...(createdInsideDurationHours && { createdInsideDurationHours }),
        ...(isRead && { isRead }),
        ...(isMine && { isMine }),
        ...(isMineComment && { isMineComment }),
        ...(isMineFavorite && { isMineFavorite }),
        ...(distance !== undefined && { distance }),
        ...(trimmedSearchKeyword &&
          searchType && { searchType, searchKeyword: trimmedSearchKeyword })
      }
    });
  },

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

  getAnswers: async ({
    hairConsultationId,
    __limit = 20
  }: GetHairConsultationAnswersRequest): Promise<GetHairConsultationAnswersResponse> => {
    const response = await fetcher<GetHairConsultationAnswersApiResponse>(
      `${BASE_URL}/${hairConsultationId}/answers`,
      {
        query: { __limit }
      }
    );

    return {
      ...response,
      dataList: response.dataList.map(normalizeHairConsultationAnswer)
    };
  },

  getAnswerById: async (
    hairConsultationId: number,
    answerId: number
  ): Promise<IHairConsultationAnswer> => {
    const response = await fetcher<GetHairConsultationAnswerByIdApiResponse>(
      `${BASE_URL}/${hairConsultationId}/answers/${answerId}`
    );
    return normalizeHairConsultationAnswer(response.data);
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
