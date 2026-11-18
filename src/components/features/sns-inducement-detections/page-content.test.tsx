// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Page from "./page-content";
import { DialogProvider } from "@/components/shared/dialog/context";
import type {
  DetectionResponse,
  DetectionRules,
} from "@/apis/snsInducementDetections";
vi.mock("@/components/features/contents/content-linked-detail", () => ({
  default: ({ target }: { target: { id: number; answerId?: number } }) => (
    <div>
      원본 {target.id} 답변 {target.answerId}
    </div>
  ),
}));
vi.mock("@/components/features/user/user-detail-modal", () => ({
  default: () => <div>회원 상세</div>,
}));
const rules: DetectionRules = {
  id: 1,
  fieldList: [
    "DesignerInfos.timeSaleNaverReservationNotice",
    "BeautyApplications.title",
  ],
  phraseList: ["인스타", "DM"],
  availableFieldList: [
    "BeautyApplications.title",
    "DesignerInfos.timeSaleNaverReservationNotice",
  ],
  categoryList: [
    {
      key: "sale",
      label: "리뷰특가",
      fieldList: ["DesignerInfos.timeSaleNaverReservationNotice"],
    },
    {
      key: "application",
      label: "모집공고",
      fieldList: ["BeautyApplications.title"],
    },
  ],
  scanLimit: 17,
  maxScanLimit: 20,
  updatedAt: null,
};
const cursor = { sourceIndex: 1, afterId: 9, configHash: "fixed" };
function response(
  nextCursor: DetectionResponse["nextCursor"] = null,
  found = false,
): DetectionResponse {
  return {
    dataList: found
      ? [
          {
            userId: 5,
            userDisplayName: "검토계정",
            userRole: 2,
            evidenceList: [
              {
                field: "DesignerInfos.timeSaleNaverReservationNotice",
                recordId: 1,
                tableName: "DesignerInfos",
                text: "인스타로 문의",
                matchedPhraseList: ["인스타"],
                detailApiPath: "/api/v1/admins/users/5",
              },
            ],
          },
        ]
      : [],
    dataCount: found ? 1 : 0,
    scannedRecordCount: 17,
    nextCursor,
    isPartial: nextCursor !== null,
    appliedRules: {
      fieldList: [...rules.fieldList].reverse(),
      phraseList: [...rules.phraseList].reverse(),
    },
  };
}
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
let calls: { path: string; body: Record<string, unknown>; method: string }[];
let preview: () => Promise<Response>;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  vi.spyOn(window, "confirm").mockReturnValue(true);
  calls = [];
  preview = async () => json(response());
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      const path = new URL(url).pathname;
      const body = init.body ? JSON.parse(String(init.body)) : {};
      calls.push({ path, body, method: init.method ?? "GET" });
      if (
        path.endsWith("/preview") &&
        Object.keys(body).some(
          (key) =>
            ![
              "fieldList",
              "phraseList",
              "scanLimit",
              "cursor",
              "__limit",
            ].includes(key),
        )
      ) {
        return json(
          {
            error: {
              code: "INVALID_SNS_DETECTION_REQUEST",
              message: "허용하지 않은 요청 필드가 있습니다.",
            },
          },
          400,
        );
      }
      return path.endsWith("/preview")
        ? preview()
        : json({ data: { ...rules, ...(init.method === "PUT" ? body : {}) } });
    }),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  client.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
async function mount() {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <DialogProvider>
          <Page />
        </DialogProvider>
      </QueryClientProvider>,
    ),
  );
  await settle();
}
async function click(text: string) {
  const button = [...document.querySelectorAll("button")].find(
    (item) => item.textContent === text,
  );
  expect(button, text).toBeTruthy();
  await act(async () => button!.click());
  await settle();
}
it("continues an empty page, pins server rules in order, merges candidates and classifies evidence", async () => {
  const queue = [
    response(cursor),
    response({ ...cursor, afterId: 20 }, true),
    response(null, true),
  ];
  preview = async () => json(queue.shift());
  await mount();
  await click("조사 시작");
  const requests = calls.filter((call) => call.path.endsWith("/preview"));
  expect(requests).toHaveLength(3);
  expect(requests[0].body).toEqual({
    fieldList: rules.fieldList,
    phraseList: rules.phraseList,
    scanLimit: 17,
    cursor: null,
  });
  expect(requests[1].body).toMatchObject({
    cursor,
    ...response().appliedRules,
  });
  expect(host.textContent).toContain("검사 51개");
  expect(host.textContent).toContain("검토 후보 1명");
  expect(host.textContent).toContain("근거 1건");
  expect(host.textContent).toContain("조사 완료");
  await click("근거 보기");
  expect(host.querySelector("aside")?.textContent).toContain(
    "리뷰특가 · 리뷰특가 공통 예약 안내",
  );
  await click("원본 상세 보기");
  expect(host.textContent).toContain("회원 상세");
});
it("refetches on opening settings and PUTs only the changed array", async () => {
  await mount();
  const before = calls.length;
  await click("조사 설정");
  expect(calls.length).toBeGreaterThan(before);
  const label = [...document.querySelectorAll("label")].find(
    (item) => item.textContent === "모집공고 제목",
  )!;
  await act(async () =>
    (label.querySelector("input") as HTMLInputElement).click(),
  );
  await click("공통 설정 저장");
  expect(calls.find((call) => call.method === "PUT")).toEqual({
    path: "/api/v1/admins/sns-inducement-detections/rules",
    method: "PUT",
    body: { fieldList: ["DesignerInfos.timeSaleNaverReservationNotice"] },
  });
});
it("pauses after an in-flight batch, resumes at its cursor, and retries failures without double counting", async () => {
  let resolve!: (value: Response) => void;
  preview = () =>
    new Promise((done) => {
      resolve = done;
    });
  await mount();
  await click("조사 시작");
  expect(
    [...host.querySelectorAll("button")].find(
      (button) => button.textContent === "새 조사 시작",
    )?.disabled,
  ).toBe(true);
  await click("일시정지");
  await act(async () => resolve(json(response(cursor, true))));
  await settle();
  expect(host.textContent).toContain("일시정지");
  expect(calls.filter((call) => call.path.endsWith("/preview"))).toHaveLength(
    1,
  );
  preview = async () => json({ error: { message: "일시 오류" } }, 503);
  await click("이어서 조사");
  expect(host.textContent).toContain("검사 17개");
  const failed = calls.at(-1)?.body;
  preview = async () => json(response(null, true));
  await click("같은 조건으로 재시도");
  expect(calls.at(-1)?.body).toEqual(failed);
  expect(host.textContent).toContain("검사 34개");
  expect(host.textContent).toContain("검토 후보 1명");
});
it("keeps partial evidence on continuation 400 and offers only a new investigation", async () => {
  let count = 0;
  preview = async () =>
    ++count === 1
      ? json(response(cursor, true))
      : json(
          {
            error: {
              code: "INVALID_SNS_DETECTION_REQUEST",
              message: "커서 설정이 일치하지 않습니다",
            },
          },
          400,
        );
  await mount();
  await click("조사 시작");
  expect(host.textContent).toContain("새 조사를 시작해주세요");
  expect(host.textContent).toContain("커서 설정이 일치하지 않습니다");
  expect(host.textContent).toContain("검토 후보 1명");
  expect(host.textContent).not.toContain("같은 조건으로 재시도");
});
it("ignores a pending response after the screen unmounts", async () => {
  let resolve!: (value: Response) => void;
  preview = () =>
    new Promise((done) => {
      resolve = done;
    });
  await mount();
  await click("조사 시작");
  await act(async () => root.render(<p>다른 화면</p>));
  await act(async () => resolve(json(response(cursor, true))));
  await settle();
  expect(calls.filter((call) => call.path.endsWith("/preview"))).toHaveLength(
    1,
  );
  expect(host.textContent).toBe("다른 화면");
});

it("applies temporary fields to a new scan without changing common settings", async () => {
  await mount();
  await click("이번 조사 조건 변경");
  const label = [...document.querySelectorAll("label")].find(
    (item) => item.textContent === "모집공고 제목",
  )!;
  await act(async () =>
    (label.querySelector("input") as HTMLInputElement).click(),
  );
  await click("이번 조사에 적용");
  await click("조사 시작");
  expect(calls.some((call) => call.method === "PUT")).toBe(false);
  expect(
    calls.find((call) => call.path.endsWith("/preview"))?.body.fieldList,
  ).toEqual(["DesignerInfos.timeSaleNaverReservationNotice"]);
});
it.each([400, 403])(
  "does not retry a rejected initial request (%s)",
  async (status) => {
    preview = async () => json({ error: { message: "조건 오류" } }, status);
    await mount();
    await click("조사 시작");
    expect(host.textContent).toContain(
      status === 400 ? "조사 조건을 확인해주세요" : "조회 권한이 없습니다",
    );
    expect(host.textContent).not.toContain("같은 조건으로 재시도");
  },
);

async function enterPhrases(value: string) {
  const textarea =
    document.querySelector<HTMLTextAreaElement>("#detection-phrases")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!.set!.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
it.each(["shared", "temporary"])(
  "filters blank keyword lines before counting and submitting (%s)",
  async (mode) => {
    await mount();
    await click(mode === "shared" ? "조사 설정" : "이번 조사 조건 변경");
    await enterPhrases("\n인스타로 문의\n  \n카톡으로 연락\n");
    expect(document.body.textContent).toContain("탐지 키워드 (2/100)");
    await click(mode === "shared" ? "공통 설정 저장" : "이번 조사에 적용");
    if (mode === "temporary") await click("조사 시작");
    const request = calls.find((call) =>
      mode === "shared"
        ? call.method === "PUT"
        : call.path.endsWith("/preview"),
    );
    expect(request?.body.phraseList).toEqual([
      "인스타로 문의",
      "카톡으로 연락",
    ]);
  },
);
it("still rejects all-blank and punctuation-only keyword input", async () => {
  await mount();
  await click("조사 설정");
  for (const value of ["\n   \n", "인스타\n!!!\n"]) {
    await enterPhrases(value);
    expect(
      [...document.querySelectorAll("button")].find(
        (button) => button.textContent === "공통 설정 저장",
      )?.disabled,
    ).toBe(true);
  }
  expect(calls.some((call) => call.method === "PUT")).toBe(false);
});
it("uses the shared confirmation dialog to keep or discard edits", async () => {
  await mount();
  await click("조사 설정");
  await enterPhrases("새 키워드");
  await click("취소");
  expect(document.body.textContent).toContain(
    "저장하지 않은 조건 변경을 버릴까요?",
  );
  await click("계속 편집");
  expect(
    document.querySelector<HTMLTextAreaElement>("#detection-phrases")?.value,
  ).toBe("새 키워드");
  await click("취소");
  await click("변경 버리기");
  expect(document.querySelector("#detection-phrases")).toBeNull();
  expect(window.confirm).not.toHaveBeenCalled();
});
it("does not clear results or send another request until restart is confirmed", async () => {
  preview = async () => json(response(null, true));
  await mount();
  await click("조사 시작");
  await click("새 조사 시작");
  await click("결과 유지");
  expect(host.textContent).toContain("검토 후보 1명");
  expect(calls.filter((call) => call.path.endsWith("/preview"))).toHaveLength(
    1,
  );
  await click("새 조사 시작");
  await click("새 조사");
  expect(calls.filter((call) => call.path.endsWith("/preview"))).toHaveLength(
    2,
  );
  expect(window.confirm).not.toHaveBeenCalled();
});
it("shows the server's nested validation message when settings cannot be saved", async () => {
  await mount();
  await click("조사 설정");
  await enterPhrases("새 키워드");
  vi.mocked(fetch).mockResolvedValueOnce(
    json(
      {
        error: {
          code: "INVALID_SNS_DETECTION_REQUEST",
          message: "키워드를 확인해주세요",
        },
      },
      400,
    ),
  );
  await click("공통 설정 저장");
  expect(document.body.textContent).toContain("키워드를 확인해주세요");
  expect(
    document.querySelector<HTMLTextAreaElement>("#detection-phrases")?.value,
  ).toBe("새 키워드");
});
