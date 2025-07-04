import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  GetThunderAnnouncementsRequest,
  GetThunderAnnouncementsResponse,
  thunderAnnouncementAPI,
} from "@/apis/thunderAnnouncements";

export const useGetThunderAnnouncementsQuery = (
  params: GetThunderAnnouncementsRequest,
  config?: Omit<
    UseQueryOptions<GetThunderAnnouncementsResponse, Error>,
    "queryFn" | "queryKey"
  >,
): UseQueryResult<GetThunderAnnouncementsResponse, Error> =>
  useQuery({
    queryKey: ["GET_THUNDER_ANNOUNCEMENTS"],
    queryFn: () => thunderAnnouncementAPI.getAll(params),
    ...config,
  });
