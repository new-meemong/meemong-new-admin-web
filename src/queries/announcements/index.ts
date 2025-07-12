import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  announcementAPI,
  GetAnnouncementsRequest,
  GetAnnouncementsResponse,
} from "@/apis/announcements";

export const useGetAnnouncementsQuery = (
  params: GetAnnouncementsRequest,
  config?: Omit<
    UseQueryOptions<GetAnnouncementsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetAnnouncementsResponse, Error> =>
  useQuery({
    queryKey: ["GET_ANNOUNCEMENTS"],
    queryFn: () => announcementAPI.getAll(params),
    ...config,
  });
