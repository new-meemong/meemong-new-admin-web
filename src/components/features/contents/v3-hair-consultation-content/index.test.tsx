// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import summaryFixture from "@/apis/dashboards/__fixtures__/v3-hair-consultation-statistics-summary.json";
import V3HairConsultationContent from "./index";
import type {
  V3QuickStatistics,
  V3ConsultationAnswer,
  V3ConsultationDetail,
} from "@/models/v3HairConsultations";
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
  isPaid: true,
  payableAnswerCount: 3,
  paidAnswerCount: 3,
  paymentRate: 100,
  purchaseList: [
    {
      id: 789,
      paymentType: "MONG" as const,
      answerCount: 3,
      paymentAmountKRW: null,
      mongAmount: 30,
      answerIdList: [456, 455, 454],
    },
  ],
};
// 3개 구매·1개만 열람: 구매 수로 전체 열람을 추정하지 않아야 합니다.
const read = { answerCount: 3, readAnswerCount: 1, isAllRead: false };
let detail: V3ConsultationDetail;
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
let calls: { url: URL; init: RequestInit }[];
let answerHidden: boolean;
let answerQuickStatistics: V3QuickStatistics | null;
let answerDeepStatus: V3ConsultationAnswer["deepStatus"];
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
  answerQuickStatistics = null;
  answerDeepStatus = {
    isPaid: true,
    paymentTypeList: ["MONG"],
    isRead: true,
    firstReadAt: "2026-11-09T00:00:00Z",
    lastReadAt: "2026-11-09T01:00:00Z",
    review: null,
  };
  detail = {
    id: 123,
    userId: 9,
    consultationType: "DEEP",
    customerType: "CONSULTING",
    answerCount: 3,
    createdAt: "2026-11-09T00:00:00Z",
    updatedAt: "2026-11-09T00:00:00Z",
    withdrawnAt: null,
    user: {
      id: 9,
      displayName: "테스트 작성자",
      phone: "01000000000",
      deletedAt: "2026-11-08T00:00:00Z",
    },
    deepStatistics: { payment, read, rating },
    quickStatistics: null,
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
      if (parsed.pathname.endsWith("/summary")) return response(summaryFixture);
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
        deepStatus: answerDeepStatus,
        quickStatistics: answerQuickStatistics,
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
  it("applies validated dates only to summary and displays server cohort totals", async () => {
    expect(host.textContent).toContain("기간별 헤어컨설팅 통계");
    expect(host.textContent).toContain("총 답변 수");
    expect(host.textContent).toContain("8건");
    expect(host.textContent).toContain("10건");
    expect(host.textContent).toContain("등록 채팅방3개");
    expect(host.textContent).toContain("등록 채팅방5개");
    await change('input[aria-label="통계 시작일"]', "2026-01-01");
    await change('input[aria-label="통계 종료일"]', "2026-01-05");
    const previousCalls = calls.length;
    await click("기간 적용");
    const requests = calls.slice(previousCalls);
    expect(requests).toHaveLength(1);
    expect(requests[0].url.pathname).toBe(
      "/api/v1/un-auth/dashboards/v3-hair-consultation-statistics/summary",
    );
    expect(requests[0].url.searchParams.get("startDateKST")).toBe("2026-01-01");
    expect(requests[0].url.searchParams.get("endDateKST")).toBe("2026-01-05");
    for (const [start, end] of [
      ["2026-01-06", "2026-01-05"],
      ["2026-01-01", "2026-05-01"],
      ["2099-01-01", "2099-01-02"],
    ]) {
      await change('input[aria-label="통계 시작일"]', start);
      await change('input[aria-label="통계 종료일"]', end);
      const count = calls.length;
      await click("기간 적용");
      expect(calls).toHaveLength(count);
      expect(host.querySelector('[role="alert"]')).toBeTruthy();
    }
  });
  it("uses consultation totals independently of answer pages and shows refunded answer history", async () => {
    const history = {
      mongOrderId: 789,
      v3HairConsultationAnswerId: 456,
      designerUserId: 20,
      usedMongAmount: 5,
      refundAt: "2026-01-02T00:00:00Z",
      createdAt: "2026-01-01T00:00:00Z",
    };
    answerQuickStatistics = {
      totalUsedMongAmount: 5,
      refundedUsedMongAmount: 5,
      netUsedMongAmount: 0,
      historyList: [history],
    };
    detail = {
      ...detail,
      consultationType: "QUICK",
      deepStatistics: null,
      quickStatistics: {
        totalUsedMongAmount: 35,
        refundedUsedMongAmount: 5,
        netUsedMongAmount: 30,
        historyList: [
          history,
          { ...history, mongOrderId: 788, usedMongAmount: 30, refundAt: null },
        ],
      },
    };
    answerDeepStatus = null;
    await click("새로고침");
    expect(host.querySelector(".cursor-pointer.grid")!.textContent).toContain(
      "차감 35몽 · 환불 5몽 · 순사용 30몽",
    );
    await openConsultation(host);
    const operations = document.querySelector('[aria-label="상담 운영 정보"]')!;
    expect(operations.textContent).toContain(
      "차감 35몽 · 환불 5몽 · 순사용 30몽",
    );
    expect(
      document.querySelector('[aria-label="답변 목록"]')!.textContent,
    ).toContain("차감 5몽 · 환불 5몽 · 순사용 0몽");
    await vi.waitFor(async () => {
      await settle();
      expect(
        document.querySelector(
          '[aria-label="고객용 답변 카드 #456"] button[aria-label="추천 스타일 1 크게 보기"]',
        ),
      ).toBeTruthy();
    });
    await act(async () => {
      (
        document.querySelector(
          '[aria-label="고객용 답변 카드 #456"] button[aria-label="추천 스타일 1 크게 보기"]',
        ) as HTMLButtonElement
      ).click();
    });
    await settle();
    const answer = document.querySelector('[aria-label="선택한 답변"]')!;
    expect(answer.textContent).toContain("차감 5몽 · 환불 5몽 · 순사용 0몽");
    expect(answer.textContent).toContain("환불 완료");
    expect(answer.textContent).toContain("789");
    expect(answer.textContent).toContain("456");
    expect(operations.textContent).toContain("차감 35몽");
  });
  it("distinguishes empty QUICK history, missing statistics and DEEP", async () => {
    await openConsultation(host);
    expect(
      document.querySelector('[aria-label="간편상담 몽 소모"]'),
    ).toBeNull();
    await click("닫기");
    detail = {
      ...detail,
      consultationType: "QUICK",
      deepStatistics: null,
      quickStatistics: {
        totalUsedMongAmount: 0,
        refundedUsedMongAmount: 0,
        netUsedMongAmount: 0,
        historyList: [],
      },
    };
    answerDeepStatus = null;
    await click("새로고침");
    await openConsultation(host);
    expect(
      document.querySelector('[aria-label="상담 운영 정보"]')!.textContent,
    ).toContain("몽 소모 내역이 없습니다.");
    expect(
      document.querySelector('[aria-label="답변 목록"]')!.textContent,
    ).toContain("몽 통계 확인 불가");
    await click("닫기");
    detail = { ...detail, quickStatistics: null };
    await click("새로고침");
    expect(host.querySelector(".cursor-pointer.grid")!.textContent).toContain(
      "몽 통계 확인 불가",
    );
  });
  it("resets cursor on submitted filters and excludes list paging/type from period summary", async () => {
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
      .filter((call) => call.url.pathname.endsWith("/summary"))
      .at(-1)!;
    expect(stats.url.searchParams.get("consultationType")).toBe("DEEP");
    expect(stats.url.searchParams.has("__limit")).toBe(false);
  });
  it("shows server answer count, payment type and actual read status", async () => {
    const row = host.querySelector(".cursor-pointer.grid")!;
    expect(row.textContent).toContain("3개");
    expect(row.textContent).toContain("몽결제");
    expect(row.textContent).toContain("1/3 · 일부 열람");
    await openConsultation(host);
    const modal = document.body.querySelector(".fixed")!;
    expect(modal.textContent).toContain("답변 열람 1/3 · 일부 열람");
    expect(modal.textContent).toContain("몽결제 · 30몽");
    expect(modal.textContent).toContain("구매 #789 · 답변 3개 구매");
    // 답변 목록 현재 페이지(1건)가 아니라 상담 전체 답변 수를 표시합니다.
    expect(modal.textContent).toContain("받은 답변 3개");
    // 답변 메타데이터는 별도 요청이므로 고정 대기 시간 대신 표시 완료를 기다립니다.
    await vi.waitFor(async () => {
      await settle();
      expect(modal.textContent).toContain("결제(몽결제) · 열람");
    });
  });
  it("shows unpaid answers read via free access as read", async () => {
    // 미몽패스 무료 열람·환불 후 열람 이력: 결제 여부로 열람을 추정하지 않습니다.
    answerDeepStatus = {
      isPaid: false,
      paymentTypeList: [],
      isRead: true,
      firstReadAt: "2026-11-09T00:00:00Z",
      lastReadAt: "2026-11-09T00:00:00Z",
      review: null,
    };
    await openConsultation(host);
    expect(document.body.querySelector(".fixed")!.textContent).toContain(
      "미결제 · 열람",
    );
  });
  it("renders QUICK request fields using the original web reader", async () => {
    detail = {
      ...detail,
      consultationType: "QUICK",
      customerType: "PARTIAL_STYLE",
      answerCount: 7,
      deepStatistics: null,
      wantedTreatmentList: ["컷트"],
      aspirationDescription: "짧은 단발을 원해요",
    };
    answerDeepStatus = null;
    await click("새로고침");
    const row = host.querySelector(".cursor-pointer.grid")!;
    // QUICK의 심층 결제·열람 칸은 "-"이며 몽 통계는 별도로 표시합니다.
    expect(row.textContent).toContain("7개");
    expect(row.textContent).not.toMatch(/결제|열람/);
    await openConsultation(host);
    const answerHeader = Array.from(
      document.body.querySelectorAll("span"),
    ).find((span) => span.textContent === "답변 #456")!.parentElement!;
    expect(answerHeader.textContent).toBe("답변 #456공개");
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
