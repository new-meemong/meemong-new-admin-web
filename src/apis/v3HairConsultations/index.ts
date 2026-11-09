import { fetcher } from "@/apis/core";
import type {
  V3ConsultationType,
  V3Visibility,
  V3ConsultationListItem,
  V3ConsultationDetail,
  V3ConsultationEditable,
  V3ConsultationAnswer,
  V3ConsultationAnswerDetail,
  V3ConsultationStatistics,
} from "@/models/v3HairConsultations";

const BASE_URL = "/api/v1/admins/v3-hair-consultations";
export interface V3ConsultationFilters {
  searchType?: "PHONE" | "NAME";
  searchKeyword?: string;
  userId?: number;
  consultationType?: V3ConsultationType;
  visibility?: V3Visibility;
}
export interface V3CursorParams {
  __limit?: number;
  __nextCursor?: string;
}
export interface V3CursorResponse<T> {
  dataList: T[];
  dataCount: number;
  __nextCursor: string | null;
}
export const V3_EDIT_FIELDS = [
  { key: "aspirationDescription", label: "희망 스타일 설명", max: 200 },
  { key: "additionalInquiry", label: "추가 문의", max: 200 },
  { key: "treatmentHistoryDescription", label: "시술 이력 설명", max: 200 },
  { key: "extensionPiecesDescription", label: "붙임머리 피스 설명", max: 200 },
  { key: "desiredDateDescription", label: "희망 일정 설명", max: 30 },
] as const;

export function buildV3ConsultationUpdate(
  original: V3ConsultationEditable,
  draft: V3ConsultationEditable,
  type: V3ConsultationType,
): Partial<V3ConsultationEditable> {
  const body: Partial<V3ConsultationEditable> = {};
  for (const { key, label, max } of V3_EDIT_FIELDS) {
    const value = draft[key] === "" ? null : draft[key];
    if (value !== null && value.length > max)
      throw new Error(`${label}은 ${max}자 이하여야 합니다.`);
    if (value !== (original[key] ?? null)) body[key] = value;
  }
  if (draft.isAllowedStyleVoting !== original.isAllowedStyleVoting) {
    if (draft.isAllowedStyleVoting && type !== "DEEP")
      throw new Error("스타일 투표는 심층 상담에서만 허용됩니다.");
    body.isAllowedStyleVoting = draft.isAllowedStyleVoting;
  }
  return body;
}

export function v3StatisticsFilters(
  filters: V3ConsultationFilters,
): V3ConsultationFilters {
  return {
    searchType: filters.searchType,
    searchKeyword: filters.searchKeyword,
    userId: filters.userId,
    visibility: filters.visibility,
    consultationType: "DEEP",
  };
}
function filterQuery(filters: V3ConsultationFilters) {
  const keyword = filters.searchKeyword?.trim();
  return {
    ...(keyword && filters.searchType
      ? {
          searchType: filters.searchType,
          searchKeyword:
            filters.searchType === "PHONE"
              ? keyword.replaceAll("-", "")
              : keyword,
        }
      : {}),
    userId: filters.userId,
    consultationType: filters.consultationType,
    visibility: filters.visibility,
  };
}
export const v3HairConsultationAPI = {
  list: (
    params: V3ConsultationFilters & V3CursorParams,
    signal?: AbortSignal,
  ) =>
    fetcher<V3CursorResponse<V3ConsultationListItem>>(BASE_URL, {
      query: {
        ...filterQuery(params),
        __limit: params.__limit ?? 20,
        __nextCursor: params.__nextCursor,
      },
      signal,
    }),
  detail: async (id: number, signal?: AbortSignal) =>
    (
      await fetcher<{ data: V3ConsultationDetail }>(`${BASE_URL}/${id}`, {
        signal,
      })
    ).data,
  update: (id: number, body: Partial<V3ConsultationEditable>) => {
    const allowed = new Set<string>([
      ...V3_EDIT_FIELDS.map((f) => f.key),
      "isAllowedStyleVoting",
    ]);
    if (
      !Object.keys(body).length ||
      Object.keys(body).some((key) => !allowed.has(key))
    )
      throw new Error("수정할 필드를 확인해주세요.");
    return fetcher(`${BASE_URL}/${id}`, { method: "PUT", json: body });
  },
  hide: (id: number) => fetcher(`${BASE_URL}/${id}`, { method: "DELETE" }),
  answers: (id: number, params: V3CursorParams, signal?: AbortSignal) =>
    fetcher<V3CursorResponse<V3ConsultationAnswer>>(
      `${BASE_URL}/${id}/answers`,
      {
        query: {
          __limit: params.__limit ?? 20,
          __nextCursor: params.__nextCursor,
        },
        signal,
      },
    ),
  answer: async (id: number, answerId: number, signal?: AbortSignal) =>
    (
      await fetcher<{ data: V3ConsultationAnswerDetail }>(
        `${BASE_URL}/${id}/answers/${answerId}`,
        { signal },
      )
    ).data,
  hideAnswer: (id: number, answerId: number) =>
    fetcher(`${BASE_URL}/${id}/answers/${answerId}`, { method: "DELETE" }),
  statistics: async (filters: V3ConsultationFilters, signal?: AbortSignal) =>
    (
      await fetcher<{ data: V3ConsultationStatistics }>(
        "/api/v1/un-auth/dashboards/v3-hair-consultations/statistics",
        {
          query: filterQuery(v3StatisticsFilters(filters)),
          auth: false,
          signal,
        },
      )
    ).data,
};
