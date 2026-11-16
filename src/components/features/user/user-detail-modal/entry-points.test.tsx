// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import DeclarationTable from "@/components/features/declaration/declaration-table";
import UserFilesTable from "@/components/features/user-files/user-files-table";
import MongMoneyDepositManagementPageContent from "@/components/features/mong-moneys/mong-money-deposit-management-page-content";

const mocks = vi.hoisted(() => ({ refresh: vi.fn(), refetch: vi.fn() }));
vi.mock("@/queries/users", () => ({
  useGetUserDetailQuery: (id: number) => ({
    data: { id, displayName: `회원 ${id}`, role: 1 },
    refetch: mocks.refetch,
  }),
}));
vi.mock("@/components/features/user/user-app-preview", () => ({
  default: ({ user }: { user: { id: number } }) => <div>앱 회원 {user.id}</div>,
}));
vi.mock("@/components/features/user/user-detail-form", () => ({
  default: ({ onRefresh }: { onRefresh: () => void }) => (
    <button onClick={onRefresh}>회원 저장</button>
  ),
}));
vi.mock("@/queries/userReports", () => ({
  usePatchUserReportStatusMutation: () => ({}),
}));
vi.mock("@/queries/chattingRoomReports", () => ({
  usePatchChattingRoomReportStatusMutation: () => ({}),
}));
vi.mock("@/queries/reportedUser", () => ({
  useReportedUser: () => ({ userId: 43, fallbackName: "피신고자" }),
}));
vi.mock("@/queries/userFiles", () => ({
  useDeleteUserFileMutation: () => ({}),
}));
vi.mock("@/components/features/declaration/declaration-detail-modal", () => ({
  default: () => null,
}));
vi.mock("@/queries/mongMoneys", () => ({
  useMongMoneyManualDepositsQuery: () => ({
    data: {
      dataList: [
        {
          id: 1,
          userId: 42,
          amount: 20,
          createdAt: "2026-11-16",
          title: "지급",
          mongMoneyItems: [],
        },
      ],
    },
    refetch: mocks.refresh,
  }),
}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.useRealTimers();
});
const pagination = {
  currentPage: 1,
  totalCount: 1,
  onPageChange: () => {},
  onSizeChange: () => {},
};
const report = {
  id: 1,
  reportedUserId: 43,
  reason: "기타",
  reasonOtherText: null,
  description: null,
  status: "미열람" as const,
  createdAt: "2026-11-16",
  updatedAt: "2026-11-16",
  userInfo: { userId: 42, displayName: "신고자", role: 1 as const },
  UserReportsImages: [],
};
const cases = [
  {
    name: "신고자",
    render: () => (
      <DeclarationTable
        {...pagination}
        data={[report]}
        reportType="MYPAGE"
        onRefresh={mocks.refresh}
      />
    ),
    label: "신고자",
    id: 42,
  },
  {
    name: "피신고자",
    render: () => (
      <DeclarationTable
        {...pagination}
        data={[report]}
        reportType="MYPAGE"
        onRefresh={mocks.refresh}
      />
    ),
    label: "피신고자",
    id: 43,
  },
  {
    name: "회원 파일",
    render: () => (
      <UserFilesTable
        {...pagination}
        onRefresh={mocks.refresh}
        data={[
          {
            id: 1,
            fileType: "profilePhoto",
            s3Path: "",
            createdAt: "2026-11-16",
            updatedAt: "2026-11-16",
            userInfo: { userId: 42, displayName: "회원", phone: "" },
          },
        ]}
      />
    ),
    label: null,
    id: 42,
  },
  {
    name: "몽머니 입금",
    render: () => <MongMoneyDepositManagementPageContent />,
    label: "42",
    id: 42,
  },
];
it.each(cases)(
  "$name에서 선택한 회원의 새 상세 모달과 저장 갱신을 연결한다",
  async ({ render, label, id }) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers();
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const button = (text: string) =>
      [...document.querySelectorAll("button")].find(
        (b) => b.textContent === text,
      )!;
    try {
      await act(async () => root.render(render()));
      await act(async () => {
        (label
          ? button(label)
          : host.querySelector<HTMLElement>('[role="button"]')!
        ).click();
      });
      const preview = document.querySelector(
        '[aria-label="앱 프로필 미리보기"]',
      )!;
      expect(preview.textContent).toBe(`앱 회원 ${id}`);
      expect(host.contains(preview)).toBe(false);
      expect(
        document.querySelector('[aria-label="회원 정보 수정"]'),
      ).not.toBeNull();
      await act(async () => button("회원 저장").click());
      expect(mocks.refresh).toHaveBeenCalledOnce();
      expect(mocks.refetch).toHaveBeenCalledOnce();
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(
        document.querySelector('[aria-label="앱 프로필 미리보기"]'),
      ).toBeNull();
    } finally {
      await act(async () => root.unmount());
      host.remove();
    }
    expect(document.body.style.overflow).toBe("");
  },
);
