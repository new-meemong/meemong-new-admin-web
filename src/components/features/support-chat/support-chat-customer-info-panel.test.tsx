// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SupportChatCustomerInfoPanel from "./support-chat-customer-info-panel";
import SupportChatOutreachDialog from "./support-chat-outreach-dialog";
import { useDrawer } from "@/stores/drawer";
import type { SupportInboxRoom } from "./support-chat-model";
import type { IUserForm } from "@/models/users";

const mocks = vi.hoisted(() => ({
  detail: {} as { data?: unknown; refetch: ReturnType<typeof vi.fn> },
  ensureAdmin: vi.fn(),
  getAll: vi.fn(),
  commit: vi.fn(),
  set: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@/queries/users", () => ({
  useGetUserDetailQuery: () => mocks.detail,
}));
vi.mock("@/lib/firebase/support-chat", () => ({
  supportDb: {},
  ensureSupportAdminSession: mocks.ensureAdmin,
}));
vi.mock("@/apis/user", () => ({ userAPI: { getAll: mocks.getAll } }));
vi.mock("react-toastify", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));
vi.mock("firebase/firestore", () => ({
  collection: (...args: unknown[]) => ({ path: args.slice(1).join("/") }),
  doc: (...args: unknown[]) => ({
    id: args.length === 1 ? "new-message" : args.at(-1),
    path: args.slice(1).join("/"),
  }),
  getDoc: async () => ({ exists: () => false }),
  serverTimestamp: () => "server-time",
  writeBatch: () => ({ set: mocks.set, update: vi.fn(), commit: mocks.commit }),
}));
vi.mock("@/components/shared/right-drawer", () => ({
  default: function MockRightDrawer({
    headerActions,
    children,
  }: {
    headerActions: React.ReactNode;
    children: React.ReactNode;
  }) {
    const { isOpen } = useDrawer();
    return isOpen ? (
      <section aria-label="회원 상세창">
        {headerActions}
        {children}
      </section>
    ) : null;
  },
}));
vi.mock(
  "@/components/features/user/user-detail-form",
  () => ({ default: () => <div>회원 상세 폼</div> }),
);
vi.mock("@/components/shared/image-swiper", () => ({
  default: ({ images }: { images: { src: string }[] }) => (
    <div role="dialog" aria-label="이미지 확대">
      {images[0].src}
    </div>
  ),
}));
vi.mock("./support-chat-template-dialog", () => ({
  useSupportChatTemplates: () => [],
}));
vi.mock("./support-chat-assignee-picker", () => ({
  AssigneePicker: ({ onChange }: { onChange: (name: string) => void }) => (
    <button onClick={() => onChange("문새한슬")}>담당자 선택</button>
  ),
}));
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

const user = {
  id: 42,
  role: 2,
  displayName: "테스트 디자이너",
  phone: "01000000000",
  address: "서울 강남구",
  profilePictureURL: "https://images.test/configured.jpg",
  isWithdraw: false,
} as IUserForm;
const room = {
  roomId: "member_42",
  memberUserId: "42",
  kind: "member",
  profile: { displayName: user.displayName, role: "DESIGNER" },
} as SupportInboxRoom;
let container: HTMLDivElement;
let root: Root;
async function render(element: React.ReactNode) {
  await act(async () => root.render(element));
}
async function click(element: Element | null) {
  expect(element).not.toBeNull();
  await act(async () => (element as HTMLElement).click());
}
function button(text: string) {
  return (
    [...container.querySelectorAll("button")].find(
      (el) => el.textContent === text,
    ) ?? null
  );
}
beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mocks.detail = { data: user, refetch: vi.fn() };
  mocks.ensureAdmin.mockResolvedValue({ adminId: "1", adminName: "관리자" });
  mocks.commit.mockResolvedValue(undefined);
  useDrawer.setState({ isOpen: false });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe("운영팀 고객 프로필 연결", () => {
  it("API 프로필 이미지를 확대하고 회원 상세창에서 검색 없이 해당 회원 연락창을 연다", async () => {
    await render(
      <SupportChatCustomerInfoPanel
        room={room}
        className=""
        onBack={() => {}}
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      user.profilePictureURL,
    );
    await click(container.querySelector(".image-box"));
    expect(
      container.querySelector('[aria-label="이미지 확대"]')?.textContent,
    ).toBe(user.profilePictureURL);
    await click(
      container.querySelector('[aria-label="테스트 디자이너 회원 상세 보기"]'),
    );
    expect(
      container.querySelector('[aria-label="회원 상세창"]'),
    ).not.toBeNull();
    const contact = button("먼저 연락하기");
    expect(contact?.nextElementSibling?.textContent).toContain(
      "전체 채팅방 보기",
    );
    await click(contact);
    expect(
      container.querySelector(
        '[placeholder="닉네임, 회원번호, 연락처로 검색"]',
      ),
    ).toBeNull();
    expect(container.textContent).toContain("42 · 01000000000");
    expect(mocks.getAll).not.toHaveBeenCalled();
  });
  it("비회원에게 다른 회원 이미지나 상세창을 제공하지 않는다", async () => {
    await render(
      <SupportChatCustomerInfoPanel
        room={{
          ...room,
          kind: "guest",
          memberUserId: null,
          roomId: "guest_Test",
        }}
        className=""
        onBack={() => {}}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(button("비회원로그아웃 상태에서 문의했어요")?.disabled).toBe(true);
    expect(container.querySelector('[aria-label="회원 상세창"]')).toBeNull();
  });
  it("탈퇴 회원의 먼저 연락하기를 비활성화한다", async () => {
    mocks.detail.data = { ...user, isWithdraw: true, role: 4 };
    await render(
      <SupportChatCustomerInfoPanel
        room={room}
        className=""
        onBack={() => {}}
      />,
    );
    await click(
      container.querySelector('[aria-label="테스트 디자이너 회원 상세 보기"]'),
    );
    expect(button("먼저 연락하기")?.disabled).toBe(true);
  });
  it.each([1, 2] as const)(
    "역할 %s의 지정 회원에게 기존 batch 경로로 발송한다",
    async (role) => {
      const sent = vi.fn();
      await render(
        <SupportChatOutreachDialog
          open
          admin={{ adminId: "1", adminName: "관리자" }}
          recipient={{ ...user, role }}
          onOpenChange={() => {}}
          onSent={sent}
        />,
      );
      await click(button("담당자 선택"));
      const textarea = container.querySelector("textarea")!;
      await act(async () => {
        Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        )!.set!.call(textarea, "안녕하세요");
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await click(button("보내기"));
      expect(mocks.commit).toHaveBeenCalledOnce();
      expect(sent).toHaveBeenCalledWith("member_42");
      expect(mocks.set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ ownerUid: "42", memberUserId: "42" }),
      );
      expect(mocks.getAll).not.toHaveBeenCalled();
    },
  );
});
