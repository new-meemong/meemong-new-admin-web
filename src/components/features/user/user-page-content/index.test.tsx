// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import UserPageContent from "./index";

vi.mock("@/assets/icons/ic_search.svg", () => ({ default: () => null }));
vi.mock("@/assets/icons/ic_refresh.svg", () => ({ default: () => null }));
vi.mock("@/components/contexts/users-context", () => ({
  useUsersContext: () => ({ isPhotoMode: false, setIsPhotoMode: vi.fn() }),
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
vi.mock("@/components/features/user/user-table", () => ({
  default: ({
    currentPage,
    onPageChange,
  }: {
    currentPage: number;
    onPageChange: (page: number) => void;
  }) => (
    <button data-testid="page-three" onClick={() => onPageChange(3)}>
      페이지 {currentPage}
    </button>
  ),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("회원 예약안내 선택과 검색어 변경을 첫 페이지 요청에 반영한다", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  const requests: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requests.push(new URL(url));
      return new Response(
        JSON.stringify({ data: { content: [], totalCount: 30 } }),
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
  const select = async (name: string, value: string) => {
    await act(async () => {
      const element = host.querySelector(
        `select[aria-label="${name}"]`,
      ) as HTMLSelectElement;
      element.value = value;
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
  };
  const type = async (value: string) => {
    await act(async () => {
      const element = host.querySelector(
        'input[name="searchKeyword"]',
      ) as HTMLInputElement;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  try {
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <UserPageContent />
        </QueryClientProvider>,
      );
    });
    await select("role", "2");
    await select("blockType", "1");
    await type("예약");
    await act(async () => {
      (
        host.querySelector('[data-testid="page-three"]') as HTMLButtonElement
      ).click();
    });
    expect(requests.at(-1)!.searchParams.get("page")).toBe("3");
    expect(host.textContent).toContain("예약안내");
    await select("searchType", "STORE_RESERVATION_NOTICE");
    expect(Object.fromEntries(requests.at(-1)!.searchParams)).toMatchObject({
      searchType: "STORE_RESERVATION_NOTICE",
      searchKeyword: "예약",
      page: "1",
      role: "2",
      blockType: "1",
    });
    await act(async () => {
      (
        host.querySelector('[data-testid="page-three"]') as HTMLButtonElement
      ).click();
    });
    await type("예약 %_\\ &안내");
    expect(requests.at(-1)!.pathname).toBe("/api/v1/admins/users");
    expect(Object.fromEntries(requests.at(-1)!.searchParams)).toMatchObject({
      searchType: "STORE_RESERVATION_NOTICE",
      searchKeyword: "예약 %_\\ &안내",
      page: "1",
      role: "2",
      blockType: "1",
    });
    await type("");
    expect(requests.at(-1)!.searchParams.has("searchType")).toBe(false);
    expect(requests.at(-1)!.searchParams.has("searchKeyword")).toBe(false);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    client.clear();
  }
});
