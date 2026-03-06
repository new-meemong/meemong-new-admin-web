import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import {
  DeleteHairConsultationResponse,
  GetHairConsultationAnswersRequest,
  GetHairConsultationAnswersResponse,
  GetHairConsultationCommentsRequest,
  GetHairConsultationCommentsResponse,
  GetHairConsultationsRequest,
  GetHairConsultationsResponse,
  hairConsultationAPI,
  PutHairConsultationRequest,
  PutHairConsultationResponse
} from "@/apis/hairConsultations";
import {
  IHairConsultationAnswer,
  IHairConsultationDetail
} from "@/models/hairConsultations";

export const useGetHairConsultationsQuery = (
  params: GetHairConsultationsRequest,
  config?: Omit<
    UseQueryOptions<GetHairConsultationsResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<GetHairConsultationsResponse, Error> =>
  useQuery({
    queryKey: ["GET_HAIR_CONSULTATIONS", params],
    queryFn: () => hairConsultationAPI.getAll(params),
    ...config
  });

export const useGetHairConsultationByIdQuery = (
  hairConsultationId: number,
  config?: Omit<
    UseQueryOptions<IHairConsultationDetail, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<IHairConsultationDetail, Error> =>
  useQuery({
    queryKey: ["GET_HAIR_CONSULTATION_BY_ID", hairConsultationId],
    queryFn: () => hairConsultationAPI.getById(hairConsultationId),
    enabled: Boolean(hairConsultationId),
    ...config
  });

export const useGetHairConsultationCommentsQuery = (
  params: GetHairConsultationCommentsRequest,
  config?: Omit<
    UseQueryOptions<GetHairConsultationCommentsResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<GetHairConsultationCommentsResponse, Error> =>
  useQuery({
    queryKey: ["GET_HAIR_CONSULTATION_COMMENTS", params],
    queryFn: () => hairConsultationAPI.getComments(params),
    enabled: Boolean(params.hairConsultationId),
    ...config
  });

export const useGetHairConsultationAnswersQuery = (
  params: GetHairConsultationAnswersRequest,
  config?: Omit<
    UseQueryOptions<GetHairConsultationAnswersResponse, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<GetHairConsultationAnswersResponse, Error> =>
  useQuery({
    queryKey: ["GET_HAIR_CONSULTATION_ANSWERS", params],
    queryFn: () => hairConsultationAPI.getAnswers(params),
    enabled: Boolean(params.hairConsultationId),
    ...config
  });

export const useGetHairConsultationAnswerByIdQuery = (
  hairConsultationId: number,
  answerId: number,
  config?: Omit<
    UseQueryOptions<IHairConsultationAnswer, Error>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<IHairConsultationAnswer, Error> =>
  useQuery({
    queryKey: ["GET_HAIR_CONSULTATION_ANSWER_BY_ID", hairConsultationId, answerId],
    queryFn: () => hairConsultationAPI.getAnswerById(hairConsultationId, answerId),
    enabled: Boolean(hairConsultationId) && Boolean(answerId),
    ...config
  });

export const usePutHairConsultationMutation = (
  config?: Omit<
    UseMutationOptions<
      PutHairConsultationResponse,
      Error,
      PutHairConsultationRequest
    >,
    "mutationFn"
  >
): UseMutationResult<PutHairConsultationResponse, Error, PutHairConsultationRequest> =>
  useMutation({
    mutationFn: (request: PutHairConsultationRequest) =>
      hairConsultationAPI.update(request),
    ...config
  });

export const useDeleteHairConsultationMutation = (
  config?: Omit<
    UseMutationOptions<DeleteHairConsultationResponse, Error, number>,
    "mutationFn"
  >
): UseMutationResult<DeleteHairConsultationResponse, Error, number> =>
  useMutation({
    mutationFn: (hairConsultationId: number) =>
      hairConsultationAPI.delete(hairConsultationId),
    ...config
  });
