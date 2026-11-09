// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import V3HairConsultationContent from "./index";
import type { V3ConsultationDetail } from "@/models/v3HairConsultations";
// The existing shared select is tested by its library; retain its public change contract.
vi.mock("@/components/shared/select-box", () => ({
  default: ({
    name,
    value,
    options,
    onChange,
  }: {
    name: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (item: { key: string; value: string }) => void;
  }) => (
    <select
      aria-label={name}
      value={value}
      onChange={(e) => onChange({ key: name, value: e.target.value })}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock(
  "@/components/features/contents/v3-hair-consultation-preview/frame",
  () => ({
    default: ({ children, title }: { children: ReactNode; title: string }) => (
      <div aria-label={title}>{children}</div>
    ),
  }),
);
vi.mock(
  "@/components/features/contents/v3-hair-consultation-preview/source/assets/icons/meemong-star-fill.svg",
  () => ({ default: () => <svg /> }),
);
vi.mock(
  "@/components/features/contents/v3-hair-consultation-preview/source/assets/icons/meemong-chevron-right-stroke.svg",
  () => ({ default: () => <svg /> }),
);
async function openConsultation(host: HTMLElement) {
  const row = host.querySelector(".cursor-pointer.grid");
  expect(row).toBeTruthy();
  await act(async () => {
    (row as HTMLElement).click();
  });
  await settle();
}
const rating = {
  ratedAnswerCount: 0,
  averageRating: null,
  ratingCountList: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
};
const payment = {
  isPaid: false,
  payableAnswerCount: 0,
  paidAnswerCount: 0,
  paymentRate: null,
};
let detail: V3ConsultationDetail;
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
let calls: { url: URL; init: RequestInit }[];
let answerHidden: boolean;
const response = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
}
async function click(text: string, scope: ParentNode = document) {
  const button = Array.from(scope.querySelectorAll("button")).find(
    (button) => button.textContent?.trim() === text,
  );
  expect(button, `button ${text}`).toBeTruthy();
  await act(async () => {
    button!.click();
  });
  await settle();
}
async function change(selector: string, value: string) {
  const element = document.querySelector(selector) as HTMLInputElement;
  expect(element).toBeTruthy();
  const prototype =
    element.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : element.tagName === "SELECT"
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(
      element,
      value,
    );
    element.dispatchEvent(
      new Event(element.tagName === "SELECT" ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
}
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  calls = [];
  answerHidden = false;
  detail = {
    id: 123,
    userId: 9,
    consultationType: "DEEP",
    customerType: "CONSULTING",
    createdAt: "2026-11-09T00:00:00Z",
    updatedAt: "2026-11-09T00:00:00Z",
    withdrawnAt: null,
    user: {
      id: 9,
      displayName: "테스트 작성자",
      phone: "01000000000",
      deletedAt: "2026-11-08T00:00:00Z",
    },
    deepStatistics: { payment, rating },
    aspirationDescription: "원본 내용",
    additionalInquiry: null,
    treatmentHistoryDescription: null,
    extensionPiecesDescription: null,
    desiredDateDescription: null,
    isAllowedStyleVoting: false,
    desiredDateType: "ASAP",
    styleCertainty: null,
    treatmentCategory: null,
    wantedTreatmentList: [],
    additionalTreatmentList: [],
    unwantedTreatmentList: [],
    aspirationImageTypeList: [],
    hairConcernList: [],
    concernedAreaList: [],
    stylingMethodList: [],
    preferredRegionList: [],
    anyTreatment: false,
    noAdditionalTreatment: false,
    noUnwantedTreatment: false,
    hasExtensionPieces: null,
    sex: "여자",
    hairLength: null,
    hairTexture: "직모",
    hairThickness: null,
    skinBrightness: null,
    imageList: [],
    treatmentHistoryList: [],
    roundList: [],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const parsed = new URL(url);
      calls.push({ url: parsed, init });
      if (parsed.pathname.endsWith("statistics"))
        return response({
          data: {
            consultationCount: 2,
            paidConsultationCount: 0,
            paymentRate: 0,
            rating,
          },
        });
      const answer = {
        id: 456,
        v3HairConsultationId: 123,
        designerUserId: 20,
        title: "추천 스타일",
        answerType:
          detail.consultationType === "DEEP" ? "CONSULTING" : "PARTIAL",
        faceShape: "계란형",
        hairLengthList: ["단발"],
        priceType: "SINGLE",
        price: 50000,
        description: "답변 본문",
        hiddenAt: answerHidden ? "2026-11-09T00:00:00Z" : null,
        deepStatus: { isPaid: false, review: null },
        imageList: [
          {
            id: 1,
            imageUrl:
              "/v3-hair-preview/assets/consultation/results/face-oval.webp",
            source: "UPLOAD",
            displayOrder: 0,
          },
        ],
        reviewList: [
          {
            id: 1,
            rating: 3,
            content: "숨긴 리뷰 본문",
            hiddenAt: "2026-11-09T00:00:00Z",
            ratedAt: "2026-11-09T00:00:00Z",
          },
        ],
        designerUser: null,
      };
      if (/answers\/456$/.test(parsed.pathname)) {
        if (init.method === "DELETE") answerHidden = true;
        return response({ data: answer });
      }
      if (parsed.pathname.endsWith("answers"))
        return response({
          dataList: [answer],
          dataCount: 1,
          __nextCursor: parsed.searchParams.has("__nextCursor") ? null : "456",
        });
      if (/\/\d+$/.test(parsed.pathname)) {
        if (init.method === "PUT")
          detail = { ...detail, ...JSON.parse(String(init.body)) };
        if (init.method === "DELETE")
          detail = { ...detail, withdrawnAt: "2026-11-09T00:00:00Z" };
        return response({
          data: { ...detail, id: Number(parsed.pathname.split("/").pop()) },
        });
      }
      return response({
        dataList: [
          {
            ...detail,
            id: parsed.searchParams.has("__nextCursor") ? 122 : 123,
          },
        ],
        dataCount: 1,
        __nextCursor: parsed.searchParams.has("__nextCursor") ? null : "123",
      });
    }),
  );
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <V3HairConsultationContent />
      </QueryClientProvider>,
    );
  });
  await settle();
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("v3 content production UI and query wiring", () => {
  it("resets cursor on submitted filters and excludes list paging/type from deep statistics", async () => {
    expect(host.textContent).toContain("테스트 작성자 (탈퇴)");
    await act(async () => {
      (host.querySelector('[aria-label="다음 페이지"]') as HTMLElement).click();
    });
    await settle();
    expect(
      calls.some((call) => call.url.searchParams.get("__nextCursor") === "123"),
    ).toBe(true);
    await change('select[aria-label="searchType"]', "PHONE");
    await change('input[aria-label="검색어"]', "010-1234-5678");
    await change('select[aria-label="consultationType"]', "QUICK");
    await click("검색");
    const latestList = calls
      .filter((call) => call.url.pathname.endsWith("v3-hair-consultations"))
      .at(-1)!;
    expect(latestList.url.searchParams.get("__nextCursor")).toBeNull();
    expect(latestList.url.searchParams.get("searchKeyword")).toBe(
      "01012345678",
    );
    expect(latestList.url.searchParams.get("consultationType")).toBe("QUICK");
    const stats = calls
      .filter((call) => call.url.pathname.endsWith("statistics"))
      .at(-1)!;
    expect(stats.url.searchParams.get("consultationType")).toBe("DEEP");
    expect(stats.url.searchParams.has("__limit")).toBe(false);
  });
  it("renders QUICK request fields using the original web reader", async () => {
    detail = {
      ...detail,
      consultationType: "QUICK",
      customerType: "PARTIAL_STYLE",
      wantedTreatmentList: ["컷트"],
      aspirationDescription: "짧은 단발을 원해요",
    };
    await openConsultation(host);
    const preview = document.querySelector('[aria-label="상담 앱 미리보기"]')!;
    expect(preview.textContent).toContain("간편상담");
    expect(preview.textContent).toContain("컷트");
    expect(preview.textContent).toContain("짧은 단발을 원해요");
    expect(document.querySelector('[aria-label="콘텐츠 수정"]')).toBeTruthy();
    const thumbnail = document.querySelector(
      '[aria-label="고객용 답변 카드 #456"] button[aria-label="추천 스타일 1 크게 보기"]',
    ) as HTMLButtonElement;
    expect(thumbnail).toBeTruthy();
    await act(async () => thumbnail.click());
    await settle();
    expect(
      document.querySelector('[aria-label="답변 앱 미리보기 #456"]')
        ?.textContent,
    ).toContain("추천 스타일");
    expect(
      document.querySelector('dialog[aria-label="사진 전체화면"]'),
    ).toBeNull();
    expect(
      Array.from(host.querySelectorAll("button")).some(
        (button) => button.textContent === "보기",
      ),
    ).toBe(false);
  });
  it("saves only edited content and refetches detail and list after hiding", async () => {
    await openConsultation(host);
    await click("수정");
    await change('textarea[aria-label="추가 문의"]', "수정한 문의");
    await click("저장");
    const update = calls.find((call) => call.init.method === "PUT")!;
    expect(JSON.parse(String(update.init.body))).toEqual({
      additionalInquiry: "수정한 문의",
    });
    expect(document.body.textContent).toContain("저장했습니다.");
    const count = calls.length;
    await click("상담 숨김 처리");
    await click("숨김 처리");
    expect(
      calls
        .slice(count)
        .some(
          (call) =>
            call.url.pathname.endsWith("/123") && call.init.method === "DELETE",
        ),
    ).toBe(true);
    expect(
      calls
        .slice(count)
        .some(
          (call) => call.url.pathname.endsWith("/123") && !call.init.method,
        ),
    ).toBe(true);
    expect(
      calls
        .slice(count)
        .some(
          (call) =>
            call.url.pathname.endsWith("v3-hair-consultations") &&
            !call.init.method,
        ),
    ).toBe(true);
    expect(document.body.textContent).toContain("상담을 숨김 처리했습니다.");
  });
  it("loads hidden reviews, scopes answer deletion and resets answers when changing consultation", async () => {
    await openConsultation(host);
    await click("컨설팅 전체 보기", document.body.querySelector(".fixed")!);
    expect(document.body.textContent).toContain("숨긴 리뷰 본문");
    await click("답변 숨김 처리");
    await click("숨김 처리");
    expect(
      calls.some(
        (call) =>
          call.url.pathname.endsWith("/123/answers/456") &&
          call.init.method === "DELETE",
      ),
    ).toBe(true);
    expect(document.body.textContent).toContain("답변을 숨김 처리했습니다.");
    const modal = document.body.querySelector(".fixed")!;
    await act(async () => {
      (
        modal.querySelector('[aria-label="다음 페이지"]') as HTMLElement
      ).click();
    });
    await settle();
    expect(
      calls.some(
        (call) =>
          call.url.pathname.endsWith("/123/answers") &&
          call.url.searchParams.get("__nextCursor") === "456",
      ),
    ).toBe(true);
    await click("닫기");
    await act(async () => {
      (host.querySelector('[aria-label="다음 페이지"]') as HTMLElement).click();
    });
    await settle();
    await openConsultation(host);
    const answers = calls
      .filter((call) => call.url.pathname.endsWith("/122/answers"))
      .at(-1)!;
    expect(answers.url.searchParams.has("__nextCursor")).toBe(false);
  });
});
