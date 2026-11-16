// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import BrandEditModal from "./index";
const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  close: vi.fn(),
  refetch: vi.fn(),
  ensure: vi.fn(async () => ({ adminId: "1", adminName: "관리자" })),
}));
vi.mock("@/queries/brands", () => ({
  usePatchBrandMutation: () => ({ isPending: false }),
  useDeleteBrandMutation: () => ({ isPending: false }),
}));
vi.mock("@/components/shared/dialog/context", () => ({
  useDialog: () => ({ confirm: vi.fn() }),
}));
vi.mock("@/components/features/brand/brand-designer-list", () => ({
  default: ({
    onSelectDesigner,
  }: {
    onSelectDesigner: (id: number) => void;
  }) => <button onClick={() => onSelectDesigner(42)}>디자이너 상세</button>,
}));
vi.mock("@/queries/users", () => ({
  useGetUserDetailQuery: () => ({
    data: { id: 42, displayName: "디자이너", role: 2, isWithdraw: false },
    refetch: mocks.refetch,
  }),
}));
vi.mock("@/components/features/user/user-app-preview", () => ({
  default: () => <div>앱 화면</div>,
}));
vi.mock("@/components/features/user/user-detail-form", () => ({
  default: ({ onRefresh }: { onRefresh: () => void }) => (
    <button onClick={onRefresh}>회원 저장</button>
  ),
}));
vi.mock("@/lib/firebase/support-chat", () => ({
  ensureSupportAdminSession: mocks.ensure,
}));
vi.mock(
  "@/components/features/support-chat/support-chat-outreach-dialog",
  () => ({
    default: ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => (
      <div role="dialog">
        <button onClick={() => onOpenChange(false)}>연락창 닫기</button>
      </div>
    ),
  }),
);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it("브랜드 초안을 보존하고 회원 상세와 연락창이 닫힌 뒤 포커스를 복귀한다", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const client = new QueryClient();
  const button = (label: string) =>
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent === label,
    )!;
  const click = async (label: string) => {
    await act(async () => {
      button(label).focus();
      button(label).click();
    });
  };
  try {
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <BrandEditModal
            brand={{
              id: 1,
              code: "test",
              name: "브랜드",
              isRecommended: false,
              createdAt: "2026-11-16",
            }}
            isOpen
            onClose={mocks.close}
            onSubmit={mocks.refresh}
          />
        </QueryClientProvider>,
      ),
    );
    await click("수정하기");
    const draft = document.querySelector(
      "#brand-edit-name",
    ) as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(draft, "수정 중인 이름");
      draft.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const trigger = button("디자이너 상세");
    await click("디자이너 상세");
    expect(
      document.querySelector('[aria-label="앱 프로필 미리보기"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[aria-hidden="true"]')?.contains(draft),
    ).toBe(true);
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(mocks.close).not.toHaveBeenCalled();
    expect(document.querySelector("#brand-edit-name")).toBe(draft);
    expect(draft.value).toBe("수정 중인 이름");
    expect(document.activeElement).toBe(trigger);
    await click("디자이너 상세");
    await click("먼저 연락하기");
    expect(button("연락창 닫기")).toBeDefined();
    expect(
      document.querySelector('[aria-hidden="true"]')?.contains(draft),
    ).toBe(true);
    await act(async () =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(mocks.close).not.toHaveBeenCalled();
    await click("연락창 닫기");
    expect(draft.closest('[aria-hidden="true"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(draft.value).toBe("수정 중인 이름");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
  }
  expect(document.body.style.overflow).toBe("");
});
