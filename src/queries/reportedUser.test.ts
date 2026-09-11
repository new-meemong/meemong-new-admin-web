import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import { useReportedUser } from "./reportedUser";
import { useGetUserDetailQuery } from "@/queries/users";
import { IChattingRoomReport } from "@/models/chattingRoomReports";
import { IUserReport } from "@/models/userReports";

vi.mock("@/apis/firestore/chattingRoomReportedUser", () => ({
  getChattingRoomReportedUserId: vi.fn(),
}));
vi.mock("@/queries/users", () => ({
  useGetUserDetailQuery: vi.fn(() => ({ data: undefined })),
}));
beforeEach(() => vi.clearAllMocks());

function render(
  report: IChattingRoomReport | IUserReport,
  enabled = true,
  counterpart?: number,
) {
  const client = new QueryClient();
  if (counterpart)
    client.setQueryData(
      ["GET_CHATTING_ROOM_REPORTED_USER", "room", 12],
      counterpart,
    );
  function Consumer() {
    const result = useReportedUser(report, enabled);
    return createElement("span", null, result.userId ?? "-");
  }
  return renderToStaticMarkup(
    createElement(QueryClientProvider, { client }, createElement(Consumer)),
  );
}

const chatReport = {
  chattingRoomId: "room",
  userInfo: { userId: 12 },
} as IChattingRoomReport;
it("connects resolved chat participants to the member detail query", () => {
  expect(render(chatReport, true, 57)).toContain("57");
  expect(useGetUserDetailQuery).toHaveBeenCalledWith(57, { enabled: true });
});
it("does not fetch an unknown counterpart", () => {
  expect(render(chatReport)).toContain("-");
  expect(useGetUserDetailQuery).toHaveBeenCalledWith(undefined, {
    enabled: false,
  });
});
it("preserves the mypage reported user and disables reads when closed", () => {
  const report = {
    reportedUserId: 90,
    userInfo: { userId: 12 },
  } as IUserReport;
  expect(render(report, false)).toContain("90");
  expect(useGetUserDetailQuery).toHaveBeenCalledWith(90, { enabled: false });
});
