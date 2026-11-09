import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  v3HairConsultationAPI as api,
  v3StatisticsFilters,
  type V3ConsultationFilters,
  type V3CursorParams,
} from "@/apis/v3HairConsultations";
import type { V3ConsultationEditable } from "@/models/v3HairConsultations";
const ROOT = ["v3-hair-consultations"] as const;
export const v3ConsultationKeys = {
  all: ROOT,
  list: (params: V3ConsultationFilters & V3CursorParams) => [
    ...ROOT,
    "list",
    params,
  ],
  detail: (id: number) => [...ROOT, "detail", id],
  answers: (id: number, params: V3CursorParams) => [
    ...ROOT,
    "answers",
    id,
    params,
  ],
  answer: (id: number, answerId: number) => [...ROOT, "answer", id, answerId],
  statistics: (filters: V3ConsultationFilters) => [
    ...ROOT,
    "statistics",
    v3StatisticsFilters(filters),
  ],
};
export const useV3Consultations = (
  params: V3ConsultationFilters & V3CursorParams,
) =>
  useQuery({
    queryKey: v3ConsultationKeys.list(params),
    queryFn: ({ signal }) => api.list(params, signal),
  });
export const useV3Consultation = (id: number) =>
  useQuery({
    queryKey: v3ConsultationKeys.detail(id),
    queryFn: ({ signal }) => api.detail(id, signal),
  });
export const useV3Answers = (id: number, params: V3CursorParams) =>
  useQuery({
    queryKey: v3ConsultationKeys.answers(id, params),
    queryFn: ({ signal }) => api.answers(id, params, signal),
  });
export const useV3Answer = (id: number, answerId: number) =>
  useQuery({
    queryKey: v3ConsultationKeys.answer(id, answerId),
    queryFn: ({ signal }) => api.answer(id, answerId, signal),
  });
export const useV3Statistics = (filters: V3ConsultationFilters) =>
  useQuery({
    queryKey: v3ConsultationKeys.statistics(filters),
    queryFn: ({ signal }) => api.statistics(filters, signal),
  });
export function useV3ConsultationActions(id: number) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ROOT });
  const update = useMutation({
    mutationFn: (body: Partial<V3ConsultationEditable>) => api.update(id, body),
    onSuccess: refresh,
  });
  const hide = useMutation({
    mutationFn: () => api.hide(id),
    onSuccess: refresh,
  });
  const hideAnswer = useMutation({
    mutationFn: (answerId: number) => api.hideAnswer(id, answerId),
    onSuccess: refresh,
  });
  return { update, hide, hideAnswer };
}
