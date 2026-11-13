// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import UserDetailModal from "./index";

const state = vi.hoisted(() => ({ query: vi.fn(), refetch: vi.fn() }));
vi.mock("@/queries/users", () => ({
  useGetUserDetailQuery: (...args: unknown[]) => state.query(...args),
}));
vi.mock("@/components/features/user/user-app-preview", () => ({
  default: ({
    user,
    onOpenDetail,
  }: {
    user: { displayName: string };
    onOpenDetail: (target: { kind: "consultation"; id: number }) => void;
  }) => (
    <div>
      앱 화면 {user.displayName}
      <button onClick={() => onOpenDetail({ kind: "consultation", id: 90 })}>
        작성 글 상세
      </button>
    </div>
  ),
}));
vi.mock("./linked-detail", async () => {
  const { Modal } = await import("@/components/shared/modal");
  return {
    default: ({ onClose }: { onClose: () => void }) => (
      <Modal isOpen onClose={onClose}>
        <button onClick={onClose}>회원 상세로</button>
      </Modal>
    ),
  };
});
vi.mock("@/components/features/user/user-detail-form", () => ({
  default: ({ onRefresh }: { onRefresh: () => void }) => (
    <div>
      <input aria-label="수정 초안" defaultValue="작성 중" />
      <button onClick={onRefresh}>수정 저장</button>
    </div>
  ),
}));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("회원 상세 모달의 미리보기와 수정 폼을 연결하고 닫기와 갱신을 처리한다", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.query.mockReturnValue({
    data: { id: 7, role: 2, displayName: "디자이너", isWithdraw: false },
    refetch: state.refetch,
  });
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const onClose = vi.fn();
  const onRefresh = vi.fn();
  try {
    await act(async () =>
      root.render(
        <UserDetailModal
          isOpen
          userId={7}
          onClose={onClose}
          onRefresh={onRefresh}
        />,
      ),
    );
    expect(state.query).toHaveBeenCalledWith(7, { enabled: true });
    expect(
      document.querySelector('[aria-label="앱 프로필 미리보기"]')?.textContent,
    ).toContain("앱 화면 디자이너");
    expect(
      document.querySelector('[aria-label="회원 정보 수정"]')?.textContent,
    ).toContain("수정하기");
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent === "수정 저장",
    )!;
    await act(async () => button.click());
    expect(state.refetch).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    const draft = document.querySelector(
      'input[aria-label="수정 초안"]',
    ) as HTMLInputElement;
    draft.value = "아직 저장 안 함";
    const link = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent === "작성 글 상세",
    )!;
    await act(async () => link.click());
    expect(document.querySelector('div[aria-hidden="true"]')).toBeTruthy();
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('input[aria-label="수정 초안"]')).toBe(draft);
    expect(draft.value).toBe("아직 저장 안 함");
    expect(document.querySelector('div[aria-hidden="true"]')).toBeNull();
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe("hidden");
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
  expect(document.body.style.overflow).toBe("");
});
