// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import ContentsPageContent from "./contents-page-content";

const context = vi.hoisted(() => ({ tabId: "0" }));
vi.mock("@/components/contexts/contents-context", () => ({
  useContentsContext: () => context,
}));
vi.mock("@/assets/icons/ic_search.svg", () => ({
  default: () => <span>검색</span>,
}));
vi.mock("@/assets/icons/ic_refresh.svg", () => ({
  default: () => <span>초기화</span>,
}));
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
vi.mock("@/components/features/contents/contents-table", () => ({
  default: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
    <button onClick={() => onPageChange(2)}>다음 페이지</button>
  ),
}));
vi.mock("@/components/shared/common-table", () => ({ default: () => null }));
vi.mock("@/components/shared/common-pagination", () => ({
  default: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
    <button onClick={() => onPageChange(2)}>다음 페이지</button>
  ),
}));
vi.mock(
  "@/components/features/contents/contents-detail-modal/shampoo-room-detail-modal",
  () => ({ default: () => null }),
);
vi.mock(
  "@/components/features/contents/contents-detail-modal/hair-consultation-detail-modal",
  () => ({ default: () => null }),
);
vi.mock("@/components/features/contents/v3-hair-consultation-content", () => ({
  default: () => null,
}));

it.each([
  ["0", "thunder-announcements"],
  ["1", "thunder-announcements"],
  ["2", "job-postings"],
  ["3", "resumes"],
  ["4", "beauty-applications"],
  ["5", "shampoo-rooms"],
  ["6", "hair-consultations"],
  ["7", "time-sale-menus"],
])(
  "탭 %s: userId 검색 선택·페이지 이동·검색 유형 전환·초기화를 API까지 전달한다",
  async (tabId, endpoint) => {
    context.tabId = tabId;
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
    document.cookie = "accessToken=test-admin";
    const requests: URL[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        expect(new Headers(init.headers).get("Authorization")).toBe(
          "test-admin",
        );
        requests.push(new URL(url));
        return new Response(
          JSON.stringify({
            content: [],
            dataList: [],
            totalCount: 30,
            dataCount: 10,
            __nextCursor: "next",
          }),
          { headers: { "content-type": "application/json" } },
        );
      }),
    );
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const settle = async () => {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    };
    const type = async (name: string, value: string) => {
      await act(async () => {
        const input = host.querySelector(
          `input[name="${name}"]`,
        ) as HTMLInputElement;
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    };
    const selectSearchType = async (value: string) => {
      await act(async () => {
        const select = host.querySelector(
          'select[aria-label="searchType"]',
        ) as HTMLSelectElement;
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    };
    const click = async (text: string) => {
      await act(async () => {
        const button = [...host.querySelectorAll("button")].find(
          (item) => item.textContent === text,
        );
        expect(button).toBeTruthy();
        button!.click();
      });
      await settle();
    };
    const last = () =>
      requests
        .filter((url) => url.pathname === `/api/v1/admins/${endpoint}`)
        .at(-1)!;
    try {
      await act(async () => {
        root.render(
          <QueryClientProvider client={client}>
            <ContentsPageContent />
          </QueryClientProvider>,
        );
      });
      await settle();
      expect(last().searchParams.has("userId")).toBe(false);
      expect(host.querySelector('input[name="userId"]')).toBeNull();
      await selectSearchType("USER_ID");
      await type("searchKeyword", "42");
      await click("검색");
      expect(last().searchParams.get("userId")).toBe("42");
      expect(last().searchParams.has("searchType")).toBe(false);
      expect(last().searchParams.has("searchKeyword")).toBe(false);
      await click("다음 페이지");
      expect(last().searchParams.get("userId")).toBe("42");
      const cursor = tabId === "5" || tabId === "6";
      expect(last().searchParams.get(cursor ? "__nextCursor" : "page")).toBe(
        cursor ? "next" : "2",
      );
      await type("searchKeyword", "43");
      await click("검색");
      expect(last().searchParams.get("userId")).toBe("43");
      expect(last().searchParams.get(cursor ? "__nextCursor" : "page")).toBe(
        cursor ? null : "1",
      );
      for (const invalid of ["0", "-1", "1.5", "abc", "9007199254740992"]) {
        await type("searchKeyword", invalid);
        const before = requests.length;
        await click("검색");
        expect(requests).toHaveLength(before);
      }
      if (tabId !== "5") {
        await selectSearchType(tabId === "7" ? "NICKNAME" : "NAME");
        await type("searchKeyword", "예약 %_\\ &안내");
        await click("검색");
        expect(last().searchParams.has("userId")).toBe(false);
        expect(last().searchParams.get("searchKeyword")).toBe(
          "예약 %_\\ &안내",
        );
        await selectSearchType("PHONE");
        await type("searchKeyword", "01012345678");
        await click("검색");
        expect(last().searchParams.get("searchType")).toBe("PHONE");
        expect(last().searchParams.has("userId")).toBe(false);
      }
      await click("초기화");
      expect(last().searchParams.has("userId")).toBe(false);
      expect(
        (
          host.querySelector('input[name="searchKeyword"]') as HTMLInputElement
        ).checkValidity(),
      ).toBe(true);
    } finally {
      await act(async () => root.unmount());
      client.clear();
      host.remove();
      document.cookie = "accessToken=; Max-Age=0";
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  },
);
