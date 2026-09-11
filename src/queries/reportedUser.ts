import { useQuery } from "@tanstack/react-query";
import { getChattingRoomReportedUserId } from "@/apis/firestore/chattingRoomReportedUser";
import { IUserReport } from "@/models/userReports";
import { IChattingRoomReport } from "@/models/chattingRoomReports";
import { useGetUserDetailQuery } from "@/queries/users";

export function useReportedUser(
  report?: IUserReport | IChattingRoomReport,
  enabled = true,
) {
  const chattingRoomId =
    report && "chattingRoomId" in report ? report.chattingRoomId : undefined;
  const reporterUserId = report?.userInfo.userId;
  const participantQuery = useQuery({
    queryKey: [
      "GET_CHATTING_ROOM_REPORTED_USER",
      chattingRoomId,
      reporterUserId,
    ],
    queryFn: () =>
      getChattingRoomReportedUserId(chattingRoomId!, reporterUserId!),
    enabled: enabled && Boolean(chattingRoomId && reporterUserId),
  });
  const userId =
    report && "reportedUserId" in report
      ? report.reportedUserId
      : (participantQuery.data ?? undefined);
  const userQuery = useGetUserDetailQuery(userId, {
    enabled: enabled && Boolean(userId),
  });
  const fallbackName =
    report && "reportedUserInfo" in report
      ? report.reportedUserInfo?.displayName
      : undefined;

  return {
    userId,
    user: userQuery.data,
    fallbackName,
    isError: participantQuery.isError || userQuery.isError,
  };
}
