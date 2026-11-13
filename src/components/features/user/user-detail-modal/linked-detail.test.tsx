// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import LinkedDetail from "./linked-detail";
import type { UserProfileDetailTarget } from "@/models/user-profile";

vi.mock("@/components/shared/dialog/context", () => ({
  useDialog: () => ({ confirm: vi.fn() }),
}));
vi.mock(
  "@/components/features/contents/contents-detail-modal/announcement-detail-form/announcement-detail-item",
  () => ({
    default: ({ announcement }: { announcement: { title: string } }) => (
      <p>{announcement.title}</p>
    ),
  }),
);
vi.mock(
  "@/components/features/contents/contents-detail-modal/time-sale-menu-detail-modal",
  () => ({
    default: ({ timeSaleMenu }: { timeSaleMenu: { name: string } }) => (
      <p>{timeSaleMenu.name}</p>
    ),
  }),
);
vi.mock("@/components/features/contents/v3-hair-consultation-preview", () => ({
  ConsultationAppPreview: () => <div>앱 상담 화면</div>,
}));
vi.mock(
  "@/components/features/contents/v3-hair-consultation-content/answers",
  () => ({ default: () => null, V3AnswerDetailPanel: () => null }),
);
let host: HTMLDivElement;
let root: Root;
let client: QueryClient;
let requests: URL[];
let status: number;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  requests = [];
  status = 200;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requests.push(new URL(url));
      return new Response(
        JSON.stringify(
          status === 200
            ? {
                data: {
                  id: 9,
                  title: "모델시술 상세 본문",
                  name: "리뷰특가 상세 본문",
                  consultationType: "QUICK",
                  answerCount: 0,
                  user: null,
                  imageList: [],
                  treatmentHistoryList: [],
                  roundList: [],
                },
              }
            : { message: status === 404 ? "대상이 없습니다" : "권한 없음" },
        ),
        { status, headers: { "content-type": "application/json" } },
      );
    }),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  client.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
async function render(kind: UserProfileDetailTarget["kind"]) {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <LinkedDetail
          target={{ kind, id: 9 }}
          onClose={vi.fn()}
          onRefresh={vi.fn()}
        />
      </QueryClientProvider>,
    ),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}
it.each([
  [
    "model-treatment",
    "/api/v1/admins/beauty-applications/9",
    "모델시술 상세 본문",
  ],
  ["time-sale", "/api/v1/admins/time-sale-menus/9", "리뷰특가 상세 본문"],
  ["consultation", "/api/v1/admins/v3-hair-consultations/9", "앱 상담 화면"],
] as const)(
  "%s를 올바른 관리자 상세 API에 연결한다",
  async (kind, path, text) => {
    await render(kind);
    expect(requests.map((request) => request.pathname)).toContain(path);
    expect(document.body.textContent).toContain(text);
  },
);
it.each(["model-treatment", "time-sale", "consultation"] as const)(
  "%s 조회 실패를 빈 상세로 숨기지 않고 재시도를 제공한다",
  async (kind) => {
    status = 404;
    await render(kind);
    expect(document.querySelector('[role="alert"]')).toBeTruthy();
    const retry = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "다시 시도",
    );
    expect(retry).toBeTruthy();
    status = 200;
    await act(async () => retry!.click());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(document.querySelector('[role="alert"]')).toBeNull();
  },
);
it.each(["model-treatment", "time-sale"] as const)(
  "%s 권한 오류를 표시한다",
  async (kind) => {
    status = 403;
    await render(kind);
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(
      "조회 권한이 없습니다",
    );
  },
);
