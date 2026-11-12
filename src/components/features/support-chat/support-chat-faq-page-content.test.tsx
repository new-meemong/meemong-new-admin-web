// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SupportChatFaqPageContent from "./support-chat-faq-page-content";
const mocks = vi.hoisted(() => ({ save: vi.fn(), success: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: { success: mocks.success } }));
vi.mock("@/lib/firebase/support-chat", () => ({ supportDb: {}, ensureSupportAdminSession: async () => ({}) }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(), doc: vi.fn(), query: vi.fn(), where: vi.fn(), documentId: vi.fn(),
  serverTimestamp: () => "server-time", setDoc: mocks.save, deleteDoc: vi.fn(), writeBatch: vi.fn(),
  getDoc: async () => ({ data: () => ({ text: "" }) }),
  onSnapshot: (_: unknown, next: (snapshot: { docs: [] }) => void) => { next({ docs: [] }); return () => {}; },
}));
let container: HTMLDivElement; let root: Root;
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks(); mocks.save.mockResolvedValue(undefined);
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
async function saveGreeting() {
  await act(async () => root.render(<SupportChatFaqPageContent />));
  await act(async () => [...container.querySelectorAll("button")].find(el => el.textContent === "시작 인사말")!.click());
  const input = container.querySelector("textarea")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(input, "안녕하세요");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => [...container.querySelectorAll("button")].find(el => el.textContent === "저장")!.click());
}
it("시작 인사말 저장이 성공하면 저장되었습니다. 토스트를 띄운다", async () => {
  await saveGreeting();
  expect(mocks.save).toHaveBeenCalledOnce();
  expect(mocks.success).toHaveBeenCalledWith("저장되었습니다.");
});
it("저장 실패에는 성공 토스트를 띄우지 않고 재시도할 수 있다", async () => {
  mocks.save.mockRejectedValue(new Error("unavailable"));
  await saveGreeting();
  expect(mocks.success).not.toHaveBeenCalled();
  expect(container.textContent).toContain("저장 실패");
  expect([...container.querySelectorAll("button")].find(el => el.textContent === "저장")!.disabled).toBe(false);
});
