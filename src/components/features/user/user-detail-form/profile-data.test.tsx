// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserDetailForm from "./index";
import type { IUserForm } from "@/models/users";
const mocks = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-toastify", () => ({ toast: mocks }));
vi.mock("@/components/features/user/user-block-info-list", () => ({
  default: () => null,
}));
vi.mock("@/components/features/user/user-mong-money-deposit-form", () => ({
  default: () => null,
}));
vi.mock("@/components/features/user/user-mong-money-history", () => ({
  default: () => null,
}));
vi.mock("@/components/shared/image-box", () => ({ default: () => null }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
async function setup(role = 4, status = 200) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ data: null }), {
        status,
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const refresh = vi.fn();
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const user = {
    id: 7,
    role,
    displayName: "닉네임",
    userPhotos: [],
    description: "옛 소개",
    address: "옛 주소",
    designerInfo:
      role % 2 === 0
        ? {
            description: "새 소개",
            address: "새 주소",
            storeReservationNotice: "기존 안내",
          }
        : null,
    modelInfo: role % 2 === 1 ? { paymodel: "Y" } : null,
  } as unknown as IUserForm;
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <UserDetailForm
          formData={user}
          onSubmit={(e) => e.preventDefault()}
          onRefresh={refresh}
        />
      </QueryClientProvider>,
    ),
  );
  return {
    host,
    refresh,
    fetchMock,
    async close() {
      await act(async () => root.unmount());
      host.remove();
      client.clear();
    },
  };
}
async function saveText(host: HTMLElement, name: string, value: string) {
  const input = host.querySelector(
    `textarea[name="${name}"]`,
  ) as HTMLTextAreaElement;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => input.parentElement!.querySelector("button")!.click());
}
it.each([2, 4])(
  "디자이너 역할 %s의 안내와 빈 소개를 통합 API로 개별 저장한다",
  async (role) => {
    const t = await setup(role);
    try {
      expect(t.host.textContent).toContain("새 주소");
      await saveText(t.host, "storeReservationNotice", "예약 전 문의해주세요");
      await saveText(t.host, "description", "");
      await saveText(t.host, "storeReservationNotice", "");
      expect(
        t.fetchMock.mock.calls.map((call) => {
          const [url, init] = call as unknown as [string, RequestInit];
          expect(new URL(url).pathname).toBe("/api/v1/admins/users/7");
          expect(init.method).toBe("PUT");
          return JSON.parse(init.body as string);
        }),
      ).toEqual([
        { designerInfo: { storeReservationNotice: "예약 전 문의해주세요" } },
        { designerInfo: { description: "" } },
        { designerInfo: { storeReservationNotice: "" } },
      ]);
      expect(t.refresh).toHaveBeenCalledTimes(3);
      expect(mocks.error).not.toHaveBeenCalled();
    } finally {
      await t.close();
    }
  },
);
it.each([1, 3])(
  "모델 역할 %s는 추천 끄기·켜기를 불린으로 보낸다",
  async (role) => {
    const t = await setup(role);
    try {
      expect(t.host.querySelector("textarea")).toBeNull();
      for (const next of [false, true]) {
        await act(async () =>
          (
            t.host.querySelector('[role="checkbox"]') as HTMLButtonElement
          ).click(),
        );
        const [, init] = t.fetchMock.mock.calls.at(-1)! as unknown as [
          string,
          RequestInit,
        ];
        expect(JSON.parse(init.body as string)).toEqual({
          modelInfo: { paymodel: next },
        });
      }
      expect(t.refresh).toHaveBeenCalledTimes(2);
    } finally {
      await t.close();
    }
  },
);
it.each([400, 403, 404])(
  "저장 실패(%s) 시 안내 초안을 보존한다",
  async (status) => {
    const t = await setup(2, status);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await saveText(t.host, "storeReservationNotice", "수정 중 안내");
      expect(
        (
          t.host.querySelector(
            '[name="storeReservationNotice"]',
          ) as HTMLTextAreaElement
        ).value,
      ).toBe("수정 중 안내");
      expect(t.refresh).not.toHaveBeenCalled();
      expect(mocks.error).toHaveBeenCalledOnce();
    } finally {
      log.mockRestore();
      await t.close();
    }
  },
);
